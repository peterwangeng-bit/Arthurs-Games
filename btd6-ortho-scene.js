/**
 * BTD6 Orthographic Scene Rig
 *
 * Locked Orthographic Camera ➔ looks down at a fixed ~60° angle
 *   ├── Background Layer: Flat 2D ground plane (Grass / Mud texture)
 *   ├── Midground Layer: Decorative 3D props (Trees, Rocks, Track Borders)
 *   └── Active Layer: Dynamic meshes (Monkeys on land, Submarines in water)
 *
 * Requires: three.js
 * Optional:  btd6-toon-material.js (window.BTD6Toon) for cel-shaded units
 * Optional:  btd6-map-init.js (window.BTD6MapInit) for terrain / track / tree LOS
 *
 * Usage:
 *   const rig = BTD6Ortho.createRig({ width: 48, depth: 32, lookDownDeg: 60 });
 *   rig.initializeMap(BTD6_DATA.maps.monkey_meadow);  // if map-init loaded
 *   const monkey = rig.addMonkey({ color: 0xc87840 }, -4, 2);
 *   // monkey.userData.losBlockedByTree === true if a tree blocks track LOS
 *   function loop() { rig.render(); requestAnimationFrame(loop); }
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(typeof THREE !== 'undefined' ? THREE : require('three'), typeof globalThis !== 'undefined' ? globalThis : root);
  } else {
    root.BTD6Ortho = factory(root.THREE, root);
  }
})(typeof self !== 'undefined' ? self : this, function (THREE, global) {
  'use strict';

  if (!THREE) {
    throw new Error('btd6-ortho-scene.js requires THREE (three.js) to be loaded first');
  }

  var DEG2RAD = Math.PI / 180;
  var DEFAULT_LOOK_DOWN = 60; /* degrees from horizontal toward the ground */

  function toonApi() {
    return global && global.BTD6Toon ? global.BTD6Toon : null;
  }

  function meshesApi() {
    return global && global.BTD6Meshes ? global.BTD6Meshes : null;
  }

  /**
   * @param {object} [opts]
   * @param {number} [opts.width=48]           Playfield width (world X)
   * @param {number} [opts.depth=32]           Playfield depth (world Z)
   * @param {number} [opts.lookDownDeg=60]     Locked pitch (look-down angle)
   * @param {number} [opts.yawDeg=0]           Locked yaw (orbit around Y)
   * @param {number} [opts.cameraDistance]     Distance from look-at (auto if omitted)
   * @param {number} [opts.orthoPadding=1.15]  Frustum padding vs playfield
   * @param {HTMLCanvasElement} [opts.canvas]
   * @param {number} [opts.clearColor=0x87b8e8]
   * @param {string} [opts.ground='grass']     'grass' | 'mud' | custom hex
   */
  function createRig(opts) {
    opts = opts || {};
    var mapW = opts.width != null ? opts.width : 48;
    var mapD = opts.depth != null ? opts.depth : 32;
    var lookDownDeg = opts.lookDownDeg != null ? opts.lookDownDeg : DEFAULT_LOOK_DOWN;
    var yawDeg = opts.yawDeg != null ? opts.yawDeg : 0;
    var padding = opts.orthoPadding != null ? opts.orthoPadding : 1.15;

    var scene = new THREE.Scene();
    scene.name = 'btd6OrthoScene';
    if (opts.clearColor != null) {
      scene.background = new THREE.Color(opts.clearColor);
    } else {
      scene.background = new THREE.Color(0xa8d8ff);
    }

    /* ── Layer roots (render order: bg → mid → active) ── */
    var background = new THREE.Group();
    background.name = 'BackgroundLayer';
    background.renderOrder = 0;

    var midground = new THREE.Group();
    midground.name = 'MidgroundLayer';
    midground.renderOrder = 1;

    var active = new THREE.Group();
    active.name = 'ActiveLayer';
    active.renderOrder = 2;

    scene.add(background);
    scene.add(midground);
    scene.add(active);

    /* ── Locked orthographic camera @ ~60° look-down ── */
    var aspect = 1;
    var frustum = computeOrthoFrustum(mapW, mapD, lookDownDeg, yawDeg, padding, aspect);
    var camera = new THREE.OrthographicCamera(
      frustum.left, frustum.right, frustum.top, frustum.bottom, 0.1, 500
    );
    camera.name = 'LockedOrthoCamera';
    camera.userData.locked = true;
    camera.userData.lookDownDeg = lookDownDeg;
    camera.userData.yawDeg = yawDeg;

    var lookAt = new THREE.Vector3(0, 0, 0);
    var camDist = opts.cameraDistance != null
      ? opts.cameraDistance
      : Math.max(mapW, mapD) * 1.4;
    placeLockedCamera(camera, lookAt, lookDownDeg, yawDeg, camDist);
    refreshLockPose(camera, lookAt, lookDownDeg, yawDeg, camDist);

    /* ── Lights (simple; toon shader uses its own lightDirection) ── */
    var hemi = new THREE.HemisphereLight(0xfff8e8, 0x5a9a48, 0.75);
    scene.add(hemi);
    var sun = new THREE.DirectionalLight(0xfff5e0, 1.05);
    sun.position.set(12, 28, 8);
    sun.castShadow = false;
    scene.add(sun);

    /* ── Renderer ── */
    var renderer = new THREE.WebGLRenderer({
      canvas: opts.canvas || undefined,
      antialias: true,
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace || renderer.outputColorSpace;
    if (!opts.canvas) {
      renderer.setSize(960, 640);
    }

    /* ── Background: flat ground plane ── */
    var groundState = {
      kind: opts.ground || 'grass',
      mesh: null,
      mapW: mapW,
      mapD: mapD,
    };
    groundState.mesh = buildGroundPlane(mapW, mapD, groundState.kind, null);
    background.add(groundState.mesh);

    /* Water regions (for sub placement checks) — ellipses in XZ */
    var waterRegions = [];

    var rig = {
      scene: scene,
      camera: camera,
      renderer: renderer,
      layers: {
        background: background,
        midground: midground,
        active: active,
      },
      sun: sun,
      lookAt: lookAt,
      mapSize: { width: mapW, depth: mapD },

      /* —— Camera (locked) —— */
      isCameraLocked: function () {
        return !!camera.userData.locked;
      },
      /** Re-assert locked pose (call if something nudged the camera). */
      enforceCameraLock: function () {
        var pose = camera.userData.lockPose;
        if (!pose) return;
        camera.position.copy(pose.position);
        camera.quaternion.copy(pose.quaternion);
        camera.lookAt(pose.lookAt);
      },
      setLookDownAngle: function (deg) {
        lookDownDeg = deg;
        camera.userData.lookDownDeg = deg;
        camDist = camera.userData.lockPose.distance;
        placeLockedCamera(camera, lookAt, lookDownDeg, yawDeg, camDist);
        refreshLockPose(camera, lookAt, lookDownDeg, yawDeg, camDist);
        this.resize(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
      },

      /* —— Background —— */
      setGround: function (kindOrColor, texture) {
        if (groundState.mesh) {
          background.remove(groundState.mesh);
          disposeObject(groundState.mesh);
        }
        groundState.kind = kindOrColor || 'grass';
        groundState.mesh = buildGroundPlane(mapW, mapD, groundState.kind, texture || null);
        background.add(groundState.mesh);
        return groundState.mesh;
      },
      setGroundTexture: function (texture, kind) {
        return this.setGround(kind || groundState.kind || 'grass', texture);
      },
      getGround: function () {
        return groundState.mesh;
      },

      /* —— Midground props —— */
      addProp: function (object3d) {
        if (!object3d) return null;
        object3d.userData.btd6Layer = 'midground';
        midground.add(object3d);
        return object3d;
      },
      addTree: function (x, z, scale) {
        return this.addProp(makeTreeProp(x, z, scale != null ? scale : 1));
      },
      addRock: function (x, z, scale) {
        return this.addProp(makeRockProp(x, z, scale != null ? scale : 1));
      },
      addTrackBorder: function (points, opts2) {
        return this.addProp(makeTrackBorder(points, opts2 || {}));
      },

      /* —— Active units —— */
      /**
       * @param {THREE.Object3D} object3d
       * @param {object} [unitOpts]
       * @param {'land'|'water'|'any'} [unitOpts.placement='land']
       * @param {number} [unitOpts.y]  Override height
       */
      addUnit: function (object3d, unitOpts) {
        unitOpts = unitOpts || {};
        var placement = unitOpts.placement || 'land';
        object3d.userData.btd6Layer = 'active';
        object3d.userData.placement = placement;

        var y = unitOpts.y;
        if (y == null) {
          y = placement === 'water' ? 0.05 : 0.02;
        }
        object3d.position.y = y;

        if (placement === 'water' && !this.isOverWater(object3d.position.x, object3d.position.z)) {
          console.warn('[BTD6Ortho] water unit placed outside water regions', object3d.name);
        }
        if (placement === 'land' && this.isOverWater(object3d.position.x, object3d.position.z)) {
          console.warn('[BTD6Ortho] land unit placed over water', object3d.name);
        }

        active.add(object3d);
        return object3d;
      },
      addMonkey: function (meshOrOpts, x, z) {
        var mesh = meshOrOpts;
        if (!meshOrOpts || !meshOrOpts.isObject3D) {
          mesh = makeChunkyMonkey(meshOrOpts || {});
        }
        mesh.position.x = x != null ? x : 0;
        mesh.position.z = z != null ? z : 0;
        return this.addUnit(mesh, { placement: 'land' });
      },
      addBloon: function (meshOrOpts, x, z, y) {
        var mesh = meshOrOpts;
        if (!meshOrOpts || !meshOrOpts.isObject3D) {
          mesh = makeShinyBloon(meshOrOpts || {});
        }
        mesh.position.x = x != null ? x : 0;
        mesh.position.z = z != null ? z : 0;
        mesh.position.y = y != null ? y : 0.02;
        mesh.userData.btd6Layer = 'active';
        active.add(mesh);
        return mesh;
      },
      addSubmarine: function (meshOrOpts, x, z) {
        var mesh = meshOrOpts;
        if (!meshOrOpts || !meshOrOpts.isObject3D) {
          mesh = makePlaceholderSub(meshOrOpts || {});
        }
        mesh.position.x = x != null ? x : 0;
        mesh.position.z = z != null ? z : 0;
        return this.addUnit(mesh, { placement: 'water' });
      },
      upgradeMonkeyVisuals: function (monkeyGroup, paths) {
        var m = meshesApi();
        if (m && typeof m.applyMonkeyUpgradeVisuals === 'function') {
          return m.applyMonkeyUpgradeVisuals(monkeyGroup, paths);
        }
        return monkeyGroup;
      },

      /* —— Water regions (ellipse in XZ) —— */
      setWaterRegions: function (regions) {
        waterRegions = (regions || []).map(function (r) {
          return {
            x: r.x, z: r.z != null ? r.z : r.y,
            rx: r.rx != null ? r.rx : r.w / 2,
            rz: r.rz != null ? r.rz : (r.ry != null ? r.ry : r.h / 2),
          };
        });
        return waterRegions;
      },
      isOverWater: function (x, z) {
        var i, r, nx, nz;
        for (i = 0; i < waterRegions.length; i++) {
          r = waterRegions[i];
          nx = (x - r.x) / (r.rx || 1);
          nz = (z - r.z) / (r.rz || 1);
          if (nx * nx + nz * nz <= 1) return true;
        }
        return false;
      },
      /**
       * Paint a simple water disc into the midground (visual only).
       */
      addWaterDisc: function (x, z, rx, rz) {
        var geo = new THREE.CircleGeometry(1, 48);
        var mat = styleMaterial({
          color: 0x3a88b8,
          emissiveVibrancy: 1.15,
          flat: true,
        });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(x, 0.02, z);
        mesh.scale.set(rx, rz != null ? rz : rx, 1);
        mesh.name = 'waterDisc';
        midground.add(mesh);
        waterRegions.push({ x: x, z: z, rx: rx, rz: rz != null ? rz : rx });
        return mesh;
      },

      /* —— Frame —— */
      resize: function (w, h) {
        if (!w || !h) {
          w = renderer.domElement.clientWidth || 960;
          h = renderer.domElement.clientHeight || 640;
        }
        aspect = w / h;
        frustum = computeOrthoFrustum(mapW, mapD, lookDownDeg, yawDeg, padding, aspect);
        camera.left = frustum.left;
        camera.right = frustum.right;
        camera.top = frustum.top;
        camera.bottom = frustum.bottom;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        this.enforceCameraLock();
      },
      render: function () {
        this.enforceCameraLock();
        if (toonApi() && typeof toonApi().syncBTD6Light === 'function') {
          toonApi().syncBTD6Light(scene, sun);
        }
        renderer.render(scene, camera);
      },
      dispose: function () {
        disposeObject(scene);
        renderer.dispose();
      },
    };

    rig.resize(
      (opts.canvas && opts.canvas.clientWidth) || 960,
      (opts.canvas && opts.canvas.clientHeight) || 640
    );

    /* Auto-install map init pipeline if btd6-map-init.js is loaded */
    if (global.BTD6MapInit && typeof global.BTD6MapInit.installOnRig === 'function') {
      global.BTD6MapInit.installOnRig(rig);
    }

    return rig;
  }

  /* ═══════════════════════════════════════════════════════════
   * Camera helpers
   * ═══════════════════════════════════════════════════════════ */

  function placeLockedCamera(camera, target, lookDownDeg, yawDeg, distance) {
    /* Pitch: lookDownDeg from horizontal toward -Y (ground). */
    var pitch = -lookDownDeg * DEG2RAD;
    var yaw = yawDeg * DEG2RAD;
    var cp = Math.cos(pitch);
    var sp = Math.sin(pitch);
    var cy = Math.cos(yaw);
    var sy = Math.sin(yaw);

    /* Spherical offset: yaw around Y, then pitch down */
    var offset = new THREE.Vector3(
      distance * cp * sy,
      distance * -sp,          /* positive height when lookDownDeg > 0 */
      distance * cp * cy
    );
    camera.position.copy(target).add(offset);
    camera.up.set(0, 1, 0);
    camera.lookAt(target);
    camera.updateMatrixWorld(true);
  }

  function refreshLockPose(camera, lookAt, lookDownDeg, yawDeg, distance) {
    camera.userData.lockPose = {
      position: camera.position.clone(),
      quaternion: camera.quaternion.clone(),
      lookAt: lookAt.clone(),
      lookDownDeg: lookDownDeg,
      yawDeg: yawDeg,
      distance: distance,
    };
  }

  /**
   * Size the ortho frustum so the playfield fits under the locked tilt.
   */
  function computeOrthoFrustum(mapW, mapD, lookDownDeg, yawDeg, padding, aspect) {
    var pitch = lookDownDeg * DEG2RAD;
    /* Foreshortening of depth when viewed at pitch */
    var foreshorten = Math.max(0.35, Math.sin(pitch));
    var halfW = (mapW * 0.5) * padding;
    var halfD = (mapD * 0.5) * padding / foreshorten;
    var halfH = Math.max(halfW / aspect, halfD);
    var halfWorldW = halfH * aspect;
    return {
      left: -halfWorldW,
      right: halfWorldW,
      top: halfH,
      bottom: -halfH,
    };
  }

  /* ═══════════════════════════════════════════════════════════
   * Background ground
   * ═══════════════════════════════════════════════════════════ */

  var GROUND_PRESETS = {
    grass: { color: 0x4ec050, repeat: 8 },
    mud: { color: 0x8a6030, repeat: 6 },
  };

  function buildGroundPlane(mapW, mapD, kind, texture) {
    var geo = new THREE.PlaneGeometry(mapW, mapD, 1, 1);
    var preset = GROUND_PRESETS[kind] || null;
    var color = preset ? preset.color : (typeof kind === 'number' ? kind : 0x3a8a38);

    var mat;
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(
        (preset && preset.repeat) || 8,
        (preset && preset.repeat) || 8
      );
      mat = styleMaterial({ map: texture, color: 0xffffff, emissiveVibrancy: 1.1, flat: true });
    } else {
      mat = styleMaterial({ color: color, emissiveVibrancy: 1.05, flat: true });
    }

    var mesh = new THREE.Mesh(geo, mat);
    mesh.name = 'GroundPlane_' + (preset ? kind : 'custom');
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0;
    mesh.receiveShadow = true;
    mesh.userData.btd6Layer = 'background';
    mesh.userData.groundKind = kind;
    return mesh;
  }

  /* ═══════════════════════════════════════════════════════════
   * Midground prop factories
   * ═══════════════════════════════════════════════════════════ */

  function makeTreeProp(x, z, scale) {
    scale = scale != null ? scale : 1;
    var meshes = meshesApi();
    if (meshes && typeof meshes.createStylizedTree === 'function') {
      var tree = meshes.createStylizedTree(scale);
      tree.position.set(x, 0, z);
      return tree;
    }
    /* Fallback: stacked overlapping green cones */
    var g = new THREE.Group();
    g.name = 'Tree';
    var trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 0.55 * scale, 5),
      styleMaterial({ color: 0x6a4420, emissiveVibrancy: 1.2 })
    );
    trunk.position.y = 0.28 * scale;
    g.add(trunk);
    [
      { y: 0.75, r: 0.55, h: 0.75, c: 0x2a8a34 },
      { y: 1.15, r: 0.42, h: 0.6, c: 0x34a040 },
      { y: 1.48, r: 0.28, h: 0.48, c: 0x3cb848 },
    ].forEach(function (f) {
      var cone = new THREE.Mesh(
        new THREE.ConeGeometry(f.r * scale, f.h * scale, 6),
        styleMaterial({ color: f.c, emissiveVibrancy: 1.4 })
      );
      cone.position.y = f.y * scale;
      tryAttachOutline(cone);
      g.add(cone);
    });
    tryAttachOutline(trunk);
    g.position.set(x, 0, z);
    return g;
  }

  function makeRockProp(x, z, scale) {
    var mesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.4 * scale, 0),
      styleMaterial({ color: 0x7a7a72, emissiveVibrancy: 1.05 })
    );
    mesh.name = 'Rock';
    mesh.position.set(x, 0.2 * scale, z);
    mesh.rotation.y = (x * 12.3 + z) % (Math.PI * 2);
    tryAttachOutline(mesh);
    return mesh;
  }

  /**
   * @param {Array<{x:number,z:number}>} points  Centerline of the track
   * @param {object} [opts]
   */
  function makeTrackBorder(points, opts) {
    opts = opts || {};
    var width = opts.width != null ? opts.width : 1.8;
    var color = opts.color != null ? opts.color : 0xc4a574;
    var group = new THREE.Group();
    group.name = 'TrackBorder';
    if (!points || points.length < 2) return group;

    var i, a, b, mid, dx, dz, len, ang;
    var edgeMat = styleMaterial({ color: color, emissiveVibrancy: 1.1, flat: true });
    for (i = 0; i < points.length - 1; i++) {
      a = points[i];
      b = points[i + 1];
      dx = b.x - a.x;
      dz = b.z - a.z;
      len = Math.sqrt(dx * dx + dz * dz) || 0.001;
      ang = Math.atan2(dx, dz);
      mid = { x: (a.x + b.x) * 0.5, z: (a.z + b.z) * 0.5 };
      var seg = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.06, len + 0.05),
        edgeMat
      );
      seg.position.set(mid.x, 0.03, mid.z);
      seg.rotation.y = ang;
      group.add(seg);
    }
    return group;
  }

  /* ═══════════════════════════════════════════════════════════
   * Active units — chunky monkeys + shiny bloons
   * ═══════════════════════════════════════════════════════════ */

  function makeChunkyMonkey(opts) {
    opts = opts || {};
    var meshes = meshesApi();
    if (meshes && typeof meshes.createMonkeyMesh === 'function') {
      return meshes.createMonkeyMesh(opts);
    }
    /* Minimal fallback if meshes module missing */
    var color = opts.color != null ? opts.color : 0xc87840;
    var g = new THREE.Group();
    g.name = opts.name || 'Monkey';
    g.userData.btd6Monkey = true;
    var body = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 8, 6),
      styleMaterial({ color: color, emissiveVibrancy: 1.45 })
    );
    body.scale.set(1.05, 0.88, 1);
    body.position.y = 0.55;
    g.add(body);
    tryAttachOutline(body);
    return g;
  }

  function makeShinyBloon(opts) {
    opts = opts || {};
    var meshes = meshesApi();
    if (meshes && typeof meshes.createBloonMesh === 'function') {
      return meshes.createBloonMesh(opts);
    }
    var type = (opts.type || 'red').toLowerCase();
    var hexMap = {
      red: 0xff0033, blue: 0x0066ff, green: 0x00cc00,
      yellow: 0xffcc00, pink: 0xff66cc,
    };
    var hex = opts.color != null ? opts.color : (hexMap[type] || 0xff0033);
    var g = new THREE.Group();
    g.name = 'Bloon_' + type;
    var body = new THREE.Mesh(new THREE.SphereGeometry(opts.r || 0.28, 16, 12));
    var toon = toonApi();
    if (toon && toon.styleMesh) {
      toon.styleMesh(body, {
        color: hex, bloon: true, vibrancy: 1.55,
        glossStrength: 0.9, glossPower: 72, outlineThickness: 0.02,
      });
    } else {
      body.material = new THREE.MeshStandardMaterial({
        color: hex, roughness: 0.15, metalness: 0.55,
      });
    }
    g.add(body);
    return g;
  }

  function makePlaceholderMonkey(opts) {
    return makeChunkyMonkey(opts);
  }

  function makePlaceholderSub(opts) {
    opts = opts || {};
    var color = opts.color != null ? opts.color : 0x2468a8;
    var g = new THREE.Group();
    g.name = opts.name || 'Submarine';
    var hull = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 12, 8),
      styleMaterial({ color: color, emissiveVibrancy: opts.emissiveVibrancy || 1.35 })
    );
    hull.scale.set(1.6, 0.55, 0.7);
    hull.position.y = 0.12;
    var sail = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.28, 0.25),
      styleMaterial({ color: 0x8cf0ff, emissiveVibrancy: 1.3 })
    );
    sail.position.set(0, 0.32, 0);
    g.add(hull);
    g.add(sail);
    tryAttachOutline(hull);
    return g;
  }

  /* ═══════════════════════════════════════════════════════════
   * Materials / dispose
   * ═══════════════════════════════════════════════════════════ */

  function styleMaterial(opts) {
    opts = opts || {};
    var toon = toonApi();
    if (toon && typeof toon.createBTD6ToonMaterial === 'function' && !opts.flat) {
      return toon.createBTD6ToonMaterial({
        map: opts.map || null,
        color: opts.color,
        emissiveVibrancy: opts.emissiveVibrancy != null ? opts.emissiveVibrancy : 1.45,
      });
    }
    /* Flat ground / fallback without toon module */
    if (opts.map) {
      return new THREE.MeshBasicMaterial({ map: opts.map, color: opts.color != null ? opts.color : 0xffffff });
    }
    var c = new THREE.Color(opts.color != null ? opts.color : 0xffffff);
    if (opts.emissiveVibrancy && opts.emissiveVibrancy !== 1) {
      c.multiplyScalar(Math.min(opts.emissiveVibrancy, 1.5));
    }
    return new THREE.MeshLambertMaterial({ color: c });
  }

  function tryAttachOutline(mesh) {
    var toon = toonApi();
    if (toon && typeof toon.attachBTD6Outline === 'function' && mesh && mesh.isMesh) {
      toon.attachBTD6Outline(mesh, { thickness: 0.038 });
    }
  }

  function disposeObject(obj) {
    if (!obj) return;
    obj.traverse(function (child) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        var mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(function (m) {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      }
    });
  }

  return {
    createRig: createRig,
    DEFAULT_LOOK_DOWN: DEFAULT_LOOK_DOWN,
    placeLockedCamera: placeLockedCamera,
    makeTreeProp: makeTreeProp,
    makeRockProp: makeRockProp,
    makeTrackBorder: makeTrackBorder,
    makeChunkyMonkey: makeChunkyMonkey,
    makeShinyBloon: makeShinyBloon,
    makePlaceholderMonkey: makePlaceholderMonkey,
    makePlaceholderSub: makePlaceholderSub,
  };
});
