/**
 * MonkeyAnimationController
 *
 * Tracks the tower's active target bloon, smoothly yaws the monkey mesh
 * toward it (atan2 + lerp), and on attack cooldown expiry plays a
 * squash-and-stretch throw pose then spawns a projectile at the hand.
 *
 * Requires: three.js
 *
 * Usage:
 *   const anim = new BTD6Anim.MonkeyAnimationController(monkeyMesh, {
 *     handLocal: new THREE.Vector3(0.25, 0.45, 0.35),
 *     turnSpeed: 10,
 *     onSpawnProjectile: (origin, dir, target) => { ... },
 *   });
 *
 *   // each frame:
 *   anim.setTarget(bloonObject3D);          // or null
 *   anim.setCooldown(tower.cooldown);      // seconds remaining
 *   anim.update(dt);
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      typeof THREE !== 'undefined' ? THREE : require('three'),
      typeof globalThis !== 'undefined' ? globalThis : root
    );
  } else {
    root.BTD6Anim = factory(root.THREE, root);
  }
})(typeof self !== 'undefined' ? self : this, function (THREE, global) {
  'use strict';

  if (!THREE) {
    throw new Error('MonkeyAnimationController requires THREE (three.js)');
  }

  var TWO_PI = Math.PI * 2;
  var DEFAULT_HAND = new THREE.Vector3(0.28, 0.48, 0.32);
  var SQUASH_Y = 0.9;       /* −10% on Y */
  var STRETCH_Z = 1.18;     /* extend forward on Z */
  var THROW_DURATION = 0.14;
  var RECOVER_DURATION = 0.18;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function clamp01(t) {
    return t < 0 ? 0 : t > 1 ? 1 : t;
  }

  /** Shortest-path lerp for angles in radians. */
  function lerpAngle(from, to, t) {
    var diff = ((to - from + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI;
    return from + diff * t;
  }

  /**
   * @param {THREE.Object3D} monkeyMesh  Root mesh/group to rotate & squash
   * @param {object} [opts]
   * @param {THREE.Vector3} [opts.handLocal]     Local-space hand / muzzle offset
   * @param {number} [opts.turnSpeed=10]         Lerp sharpness (higher = snappier)
   * @param {number} [opts.squashY=0.9]
   * @param {number} [opts.stretchZ=1.18]
   * @param {number} [opts.throwDuration=0.14]
   * @param {number} [opts.recoverDuration=0.18]
   * @param {THREE.Object3D} [opts.scaleTarget]  Child to squash (default: monkeyMesh)
   * @param {function} [opts.onSpawnProjectile]  (origin, direction, target, controller) => void
   * @param {function} [opts.getTargetPosition]  Optional override: (target) => THREE.Vector3
   */
  function MonkeyAnimationController(monkeyMesh, opts) {
    if (!monkeyMesh || !monkeyMesh.isObject3D) {
      throw new Error('MonkeyAnimationController requires a THREE.Object3D monkey mesh');
    }
    opts = opts || {};

    this.mesh = monkeyMesh;
    this.scaleTarget = opts.scaleTarget && opts.scaleTarget.isObject3D
      ? opts.scaleTarget
      : monkeyMesh;

    this.handLocal = (opts.handLocal && opts.handLocal.isVector3)
      ? opts.handLocal.clone()
      : DEFAULT_HAND.clone();

    this.turnSpeed = opts.turnSpeed != null ? opts.turnSpeed : 10;
    this.squashY = opts.squashY != null ? opts.squashY : SQUASH_Y;
    this.stretchZ = opts.stretchZ != null ? opts.stretchZ : STRETCH_Z;
    this.throwDuration = opts.throwDuration != null ? opts.throwDuration : THROW_DURATION;
    this.recoverDuration = opts.recoverDuration != null ? opts.recoverDuration : RECOVER_DURATION;

    this.onSpawnProjectile = typeof opts.onSpawnProjectile === 'function'
      ? opts.onSpawnProjectile
      : null;
    this.getTargetPosition = typeof opts.getTargetPosition === 'function'
      ? opts.getTargetPosition
      : null;

    /** @type {THREE.Object3D|null} */
    this.target = null;
    /** Last known world position of the target bloon */
    this.targetPosition = new THREE.Vector3();
    this.hasTarget = false;

    /** Attack cooldown remaining (seconds). Fire when crossing / hitting 0. */
    this.cooldown = 0;
    this._prevCooldown = 0;

    /** Rest scale captured once so we can return after squash-stretch */
    this._restScale = this.scaleTarget.scale.clone();
    this._throwT = 0;
    this._throwPhase = 'idle'; /* idle | throw | recover */
    this._projectileSpawned = false;

    this._tmpMonkey = new THREE.Vector3();
    this._tmpTarget = new THREE.Vector3();
    this._tmpHand = new THREE.Vector3();
    this._tmpDir = new THREE.Vector3();
    this._tmpMatrix = new THREE.Matrix4();
    this._tmpQuat = new THREE.Quaternion();

    monkeyMesh.userData.monkeyAnim = this;
  }

  MonkeyAnimationController.prototype.setTarget = function (bloonObject3D) {
    this.target = bloonObject3D || null;
    if (!this.target) {
      this.hasTarget = false;
      return;
    }
    this._sampleTargetPosition();
  };

  /**
   * Directly set the world-space bloon position (when you don't have an Object3D).
   * @param {number|THREE.Vector3} x
   * @param {number} [y]
   * @param {number} [z]
   */
  MonkeyAnimationController.prototype.setTargetPosition = function (x, y, z) {
    if (x && x.isVector3) {
      this.targetPosition.copy(x);
      this.hasTarget = true;
      this.target = null;
      return;
    }
    if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
      this.targetPosition.set(x, y, z);
      this.hasTarget = true;
      this.target = null;
    }
  };

  MonkeyAnimationController.prototype.clearTarget = function () {
    this.target = null;
    this.hasTarget = false;
  };

  /**
   * Sync with tower combat cooldown (seconds until next shot).
   * When this value hits zero (or drops to ≤0 from a positive value),
   * the throw squash-stretch + projectile spawn is triggered.
   */
  MonkeyAnimationController.prototype.setCooldown = function (seconds) {
    this.cooldown = seconds > 0 ? seconds : 0;
  };

  MonkeyAnimationController.prototype.getHandWorldPosition = function (out) {
    out = out || new THREE.Vector3();
    this.mesh.updateMatrixWorld(true);
    out.copy(this.handLocal);
    this.mesh.localToWorld(out);
    return out;
  };

  MonkeyAnimationController.prototype._sampleTargetPosition = function () {
    if (!this.target) return;
    if (this.getTargetPosition) {
      var p = this.getTargetPosition(this.target);
      if (p && p.isVector3) {
        this.targetPosition.copy(p);
        this.hasTarget = true;
        return;
      }
    }
    this.target.getWorldPosition(this.targetPosition);
    this.hasTarget = true;
  };

  /**
   * Horizontal look angle (Y rotation) from monkey → target via atan2.
   * Three.js Y-rotation: 0 faces +Z; atan2(dx, dz) matches that convention.
   */
  MonkeyAnimationController.prototype._computeYawToTarget = function () {
    this.mesh.getWorldPosition(this._tmpMonkey);
    var dx = this.targetPosition.x - this._tmpMonkey.x;
    var dz = this.targetPosition.z - this._tmpMonkey.z;
    return Math.atan2(dx, dz);
  };

  MonkeyAnimationController.prototype._beginThrow = function () {
    this._throwPhase = 'throw';
    this._throwT = 0;
    this._projectileSpawned = false;
  };

  /**
   * Apply squash-and-stretch as a local scale matrix:
   *   Y *= 0.9  (squash)
   *   Z *= 1.18 (stretch forward — throwing axis)
   * Ease out back to rest during recover.
   */
  MonkeyAnimationController.prototype._updateThrowPose = function (dt) {
    var st = this.scaleTarget;
    var rest = this._restScale;

    if (this._throwPhase === 'idle') {
      st.scale.copy(rest);
      return;
    }

    this._throwT += dt;

    if (this._throwPhase === 'throw') {
      var u = clamp01(this._throwT / this.throwDuration);
      /* Ease-out quad for a snappy punch */
      var e = 1 - (1 - u) * (1 - u);
      var sy = lerp(1, this.squashY, e);
      var sz = lerp(1, this.stretchZ, e);
      st.scale.set(rest.x, rest.y * sy, rest.z * sz);

      /* Spawn projectile at peak of the throw (mid-squash) */
      if (!this._projectileSpawned && u >= 0.45) {
        this._spawnProjectile();
        this._projectileSpawned = true;
      }

      if (u >= 1) {
        this._throwPhase = 'recover';
        this._throwT = 0;
        if (!this._projectileSpawned) {
          this._spawnProjectile();
          this._projectileSpawned = true;
        }
      }
      return;
    }

    if (this._throwPhase === 'recover') {
      var r = clamp01(this._throwT / this.recoverDuration);
      var er = r * r * (3 - 2 * r); /* smoothstep */
      var syR = lerp(this.squashY, 1, er);
      var szR = lerp(this.stretchZ, 1, er);
      st.scale.set(rest.x, rest.y * syR, rest.z * szR);
      if (r >= 1) {
        st.scale.copy(rest);
        this._throwPhase = 'idle';
        this._throwT = 0;
      }
    }
  };

  MonkeyAnimationController.prototype._spawnProjectile = function () {
    this.getHandWorldPosition(this._tmpHand);

    this.mesh.getWorldPosition(this._tmpMonkey);
    if (this.hasTarget) {
      this._tmpDir.copy(this.targetPosition).sub(this._tmpHand);
    } else {
      /* Face-forward fallback from mesh orientation */
      this._tmpDir.set(0, 0, 1).applyQuaternion(this.mesh.getWorldQuaternion(this._tmpQuat));
    }
    if (this._tmpDir.lengthSq() < 1e-8) {
      this._tmpDir.set(0, 0, 1);
    } else {
      this._tmpDir.normalize();
    }

    if (this.onSpawnProjectile) {
      this.onSpawnProjectile(
        this._tmpHand.clone(),
        this._tmpDir.clone(),
        this.target,
        this
      );
    }

    /* Notify mesh listeners / gameplay */
    if (this.mesh.userData && typeof this.mesh.userData.onThrow === 'function') {
      this.mesh.userData.onThrow(this._tmpHand.clone(), this._tmpDir.clone(), this.target);
    }
  };

  /**
   * @param {number} dt  Delta time in seconds
   */
  MonkeyAnimationController.prototype.update = function (dt) {
    if (dt == null || dt < 0) dt = 0;
    /* Cap to avoid huge leaps after tab-switch */
    if (dt > 0.1) dt = 0.1;

    if (this.target) {
      this._sampleTargetPosition();
    }

    /* —— Yaw toward bloon (horizontal only) —— */
    if (this.hasTarget) {
      var desiredYaw = this._computeYawToTarget();
      var t = 1 - Math.exp(-this.turnSpeed * dt);
      this.mesh.rotation.y = lerpAngle(this.mesh.rotation.y, desiredYaw, t);
    }

    /* —— Cooldown edge: fire throw when cooldown hits zero —— */
    var cd = this.cooldown;
    var fired = this._prevCooldown > 1e-6 && cd <= 1e-6;
    this._prevCooldown = cd;

    if (fired && this._throwPhase === 'idle') {
      this._beginThrow();
    }

    this._updateThrowPose(dt);
  };

  /**
   * Force an attack animation + projectile (e.g. sandbox / debug).
   */
  MonkeyAnimationController.prototype.triggerAttack = function () {
    if (this._throwPhase === 'idle') {
      this._beginThrow();
    }
  };

  /**
   * Recapture rest scale after external scale changes.
   */
  MonkeyAnimationController.prototype.captureRestScale = function () {
    if (this._throwPhase === 'idle') {
      this._restScale.copy(this.scaleTarget.scale);
    }
  };

  MonkeyAnimationController.prototype.dispose = function () {
    if (this.mesh && this.mesh.userData && this.mesh.userData.monkeyAnim === this) {
      delete this.mesh.userData.monkeyAnim;
    }
    this.target = null;
    this.onSpawnProjectile = null;
  };

  /* ── Factory helpers ── */

  /**
   * Attach a controller to a monkey and optionally wire a simple projectile pool callback.
   */
  function attachMonkeyAnimation(monkeyMesh, opts) {
    return new MonkeyAnimationController(monkeyMesh, opts);
  }

  return {
    MonkeyAnimationController: MonkeyAnimationController,
    attachMonkeyAnimation: attachMonkeyAnimation,
    lerpAngle: lerpAngle,
  };
});
