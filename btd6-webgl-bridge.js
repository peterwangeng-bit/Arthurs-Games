/**
 * BTD6 WebGL Bridge — syncs 2D battle state into the Ortho + Toon pipeline.
 *
 * Layers a Three.js canvas under the 2D HUD canvas and drives:
 *   - Locked 60° orthographic board camera
 *   - Cel-shaded terrain / dirt track / stone borders / cone trees
 *   - Chunky monkey meshes + T3 accessories
 *   - Shiny bloon spheres with exact layer hex colors
 *
 * Requires (load order):
 *   three.js → btd6-toon-material.js → btd6-meshes.js →
 *   btd6-ortho-scene.js → btd6-map-init.js → this file → bloons-td6-engine.js
 *
 * Exposes: window.BTD6WebGL
 */
(function (root) {
  'use strict';

  var state = {
    active: false,
    rig: null,
    glCanvas: null,
    mapW: 48,
    mapD: 32,
    canvasW: 960,
    canvasH: 640,
    monkeyMeshes: Object.create(null),
    bloonMeshes: Object.create(null),
    animControllers: Object.create(null),
  };

  function ready() {
    return !!(root.THREE && root.BTD6Ortho && root.BTD6Toon && root.BTD6Meshes);
  }

  function ensureGlCanvas(hudCanvas) {
    if (state.glCanvas && state.glCanvas.parentNode) return state.glCanvas;
    var area = hudCanvas.parentNode;
    if (!area) return null;
    var c = document.createElement('canvas');
    c.id = 'btd6WebGLCanvas';
    c.width = hudCanvas.width;
    c.height = hudCanvas.height;
    c.setAttribute('aria-hidden', 'true');
    area.insertBefore(c, hudCanvas);
    state.glCanvas = c;
    return c;
  }

  function canvasToWorld(x, y) {
    return {
      x: (x / state.canvasW - 0.5) * state.mapW,
      z: (y / state.canvasH - 0.5) * state.mapD,
    };
  }

  function parseColor(c) {
    if (typeof c === 'number') return c;
    if (!c) return 0xc87840;
    if (c.charAt(0) === '#') {
      var h = c.slice(1);
      if (h.length === 3) {
        h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      }
      return parseInt(h, 16);
    }
    return 0xc87840;
  }

  /**
   * Start / rebuild the 3D board for a battle.
   * @param {object} battle  From BTD6.getBattle()
   * @param {HTMLCanvasElement} hudCanvas
   */
  function start(battle, hudCanvas) {
    stop();
    /* Live battle uses crisp 2D monkeys & bloons.
       The 3D overlay scaled units too small (invisible monkeys)
       and bloon strings/outlines read as “hair.” */
    if (hudCanvas) hudCanvas.classList.remove('btd6-hud-overlay');
    state.active = false;
    return false;
  }

  function stop() {
    if (state.rig) {
      try { state.rig.dispose(); } catch (e) { /* ignore */ }
      state.rig = null;
    }
    state.monkeyMeshes = Object.create(null);
    state.bloonMeshes = Object.create(null);
    state.animControllers = Object.create(null);
    state.active = false;
    if (state.glCanvas && state.glCanvas.parentNode) {
      state.glCanvas.parentNode.removeChild(state.glCanvas);
      state.glCanvas = null;
    }
  }

  function syncMonkeys(battle) {
    var rig = state.rig;
    var live = Object.create(null);
    var i, t, mesh, w, paths, def, color;
    var DATA = root.BTD6_DATA;

    for (i = 0; i < battle.towers.length; i++) {
      t = battle.towers[i];
      live[t.id] = true;
      mesh = state.monkeyMeshes[t.id];
      w = canvasToWorld(t.x, t.y);
      paths = t.paths || [0, 0, 0];
      def = DATA && DATA.towers ? DATA.towers[t.kind] : null;
      color = parseColor(def && def.color);

      if (!mesh) {
        if (t.kind === 'monkey_sub') {
          mesh = rig.addSubmarine({ color: color }, w.x, w.z);
        } else {
          mesh = rig.addMonkey({
            kind: t.kind,
            color: color,
            paths: paths,
          }, w.x, w.z);
        }
        state.monkeyMeshes[t.id] = mesh;
      } else {
        mesh.position.x = w.x;
        mesh.position.z = w.z;
        if (
          mesh.userData &&
          (!mesh.userData.paths ||
            mesh.userData.paths[0] !== paths[0] ||
            mesh.userData.paths[1] !== paths[1] ||
            mesh.userData.paths[2] !== paths[2])
        ) {
          if (typeof rig.upgradeMonkeyVisuals === 'function') {
            rig.upgradeMonkeyVisuals(mesh, paths);
          } else if (root.BTD6Meshes) {
            root.BTD6Meshes.applyMonkeyUpgradeVisuals(mesh, paths);
          }
        }
      }

      if (t.aimX != null && t.aimY != null) {
        var aim = canvasToWorld(t.aimX, t.aimY);
        mesh.rotation.y = Math.atan2(aim.x - mesh.position.x, aim.z - mesh.position.z);
      }
    }

    Object.keys(state.monkeyMeshes).forEach(function (id) {
      if (!live[id]) {
        var m = state.monkeyMeshes[id];
        if (m && m.parent) m.parent.remove(m);
        delete state.monkeyMeshes[id];
      }
    });
  }

  function syncBloons(battle) {
    var rig = state.rig;
    var live = Object.create(null);
    var i, b, mesh, w, pos, type;

    for (i = 0; i < battle.bloons.length; i++) {
      b = battle.bloons[i];
      if (!b.alive) continue;
      live[b.id] = true;
      pos = root.BTD6 && root.BTD6.PositionAt
        ? root.BTD6.PositionAt(
            battle.paths[b.pathIndex] || battle.paths[0],
            b.distance
          )
        : null;
      if (!pos) continue;
      w = canvasToWorld(pos.x, pos.y);
      type = (b.type || (b.def && b.def.id) || 'red').toLowerCase();
      mesh = state.bloonMeshes[b.id];

      if (!mesh) {
        mesh = rig.addBloon({
          type: type,
          camo: !!b.camo,
          fortified: !!b.fortified || !!(b.def && b.def.fortified),
          blimp: !!(b.def && b.def.blimp),
          r: b.def && b.def.blimp ? 0.5 : 0.32,
          label: b.def && b.def.label,
        }, w.x, w.z, 0.02);
        state.bloonMeshes[b.id] = mesh;
      } else {
        mesh.position.x = w.x;
        mesh.position.z = w.z;
      }
    }

    Object.keys(state.bloonMeshes).forEach(function (id) {
      if (!live[id]) {
        var m = state.bloonMeshes[id];
        if (m && m.parent) m.parent.remove(m);
        delete state.bloonMeshes[id];
      }
    });
  }

  function sync(battle) {
    if (!state.active || !state.rig || !battle) return;
    /* Map décor only — monkeys & bloons stay crisp 2D on the HUD canvas.
       Tiny 3D unit meshes were invisible / “hair-like” at board scale. */
  }

  /**
   * Optional: place oversized 3D preview units (not used in live battle).
   * Scale ~3.5 so a monkey matches path width on a 48-unit board.
   */
  var UNIT_SCALE = 3.5;

  function syncMonkeys(battle) {
    var rig = state.rig;
    var live = Object.create(null);
    var i, t, mesh, w, paths, def, color;
    var DATA = root.BTD6_DATA;

    for (i = 0; i < battle.towers.length; i++) {
      t = battle.towers[i];
      live[t.id] = true;
      mesh = state.monkeyMeshes[t.id];
      w = canvasToWorld(t.x, t.y);
      paths = t.paths || [0, 0, 0];
      def = DATA && DATA.towers ? DATA.towers[t.kind] : null;
      color = parseColor(def && def.color);

      if (!mesh) {
        if (t.kind === 'monkey_sub') {
          mesh = rig.addSubmarine({ color: color }, w.x, w.z);
        } else {
          mesh = rig.addMonkey({
            kind: t.kind,
            color: color,
            paths: paths,
          }, w.x, w.z);
        }
        mesh.scale.setScalar(UNIT_SCALE);
        state.monkeyMeshes[t.id] = mesh;
      } else {
        mesh.position.x = w.x;
        mesh.position.z = w.z;
        if (
          mesh.userData &&
          (!mesh.userData.paths ||
            mesh.userData.paths[0] !== paths[0] ||
            mesh.userData.paths[1] !== paths[1] ||
            mesh.userData.paths[2] !== paths[2])
        ) {
          if (typeof rig.upgradeMonkeyVisuals === 'function') {
            rig.upgradeMonkeyVisuals(mesh, paths);
          } else if (root.BTD6Meshes) {
            root.BTD6Meshes.applyMonkeyUpgradeVisuals(mesh, paths);
          }
        }
      }

      if (t.aimX != null && t.aimY != null) {
        var aim = canvasToWorld(t.aimX, t.aimY);
        mesh.rotation.y = Math.atan2(aim.x - mesh.position.x, aim.z - mesh.position.z);
      }
    }

    Object.keys(state.monkeyMeshes).forEach(function (id) {
      if (!live[id]) {
        var m = state.monkeyMeshes[id];
        if (m && m.parent) m.parent.remove(m);
        delete state.monkeyMeshes[id];
      }
    });
  }

  function syncBloons(battle) {
    var rig = state.rig;
    var live = Object.create(null);
    var i, b, mesh, w, pos, type;

    for (i = 0; i < battle.bloons.length; i++) {
      b = battle.bloons[i];
      if (!b.alive) continue;
      live[b.id] = true;
      pos = root.BTD6 && root.BTD6.PositionAt
        ? root.BTD6.PositionAt(
            battle.paths[b.pathIndex] || battle.paths[0],
            b.distance
          )
        : null;
      if (!pos) continue;
      w = canvasToWorld(pos.x, pos.y);
      type = (b.type || (b.def && b.def.id) || 'red').toLowerCase();
      mesh = state.bloonMeshes[b.id];

      if (!mesh) {
        mesh = rig.addBloon({
          type: type,
          camo: !!b.camo,
          fortified: !!b.fortified || !!(b.def && b.def.fortified),
          blimp: !!(b.def && b.def.blimp),
          r: b.def && b.def.blimp ? 0.85 : 0.55,
          label: b.def && b.def.label,
        }, w.x, w.z, 0.02);
        mesh.scale.setScalar(UNIT_SCALE * 0.85);
        state.bloonMeshes[b.id] = mesh;
      } else {
        mesh.position.x = w.x;
        mesh.position.z = w.z;
      }
    }

    Object.keys(state.bloonMeshes).forEach(function (id) {
      if (!live[id]) {
        var m = state.bloonMeshes[id];
        if (m && m.parent) m.parent.remove(m);
        delete state.bloonMeshes[id];
      }
    });
  }

  function render() {
    if (!state.active || !state.rig) return;
    state.rig.render();
  }

  function isActive() {
    return !!state.active;
  }

  function resizeToHud(hudCanvas) {
    if (!state.rig || !state.glCanvas || !hudCanvas) return;
    state.glCanvas.width = hudCanvas.width;
    state.glCanvas.height = hudCanvas.height;
    var rect = hudCanvas.getBoundingClientRect();
    if (rect.width && rect.height) {
      state.glCanvas.style.width = rect.width + 'px';
      state.glCanvas.style.height = rect.height + 'px';
    }
    state.rig.resize(hudCanvas.width, hudCanvas.height);
  }

  root.BTD6WebGL = {
    ready: ready,
    start: start,
    stop: stop,
    sync: sync,
    render: render,
    isActive: isActive,
    resizeToHud: resizeToHud,
    getRig: function () { return state.rig; },
  };
})(typeof self !== 'undefined' ? self : this);
