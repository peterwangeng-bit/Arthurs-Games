/**
 * BTD6 Procedural Mesh Builders
 *
 * Chunky low-poly monkeys, shiny layered bloons, stylized trees —
 * no external images or placeholder GLTF. All geometry is procedural.
 *
 * Requires: three.js, btd6-toon-material.js (window.BTD6Toon)
 * Exposes:  window.BTD6Meshes
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      typeof THREE !== 'undefined' ? THREE : require('three'),
      typeof globalThis !== 'undefined' ? globalThis : root
    );
  } else {
    root.BTD6Meshes = factory(root.THREE, root);
  }
})(typeof self !== 'undefined' ? self : this, function (THREE, global) {
  'use strict';

  if (!THREE) {
    throw new Error('btd6-meshes.js requires THREE (three.js)');
  }

  /* Exact BTD6 layer hexes */
  var BLOON_COLORS = {
    red: 0xff0033,
    blue: 0x0066ff,
    green: 0x00cc00,
    yellow: 0xffcc00,
    pink: 0xff66cc,
    black: 0x1a1a1a,
    white: 0xf4f4f4,
    purple: 0x9933ff,
    lead: 0x6a7080,
    zebra: 0x222222,
    rainbow: 0xff4488,
    ceramic: 0xc89060,
  };

  var MONKEY_FUR = 0xc87840;
  var MONKEY_SKIN = 0xe8a060;

  function toonApi() {
    return global && global.BTD6Toon ? global.BTD6Toon : null;
  }

  function paint(mesh, color, opts) {
    opts = opts || {};
    var api = toonApi();
    if (api && api.styleMesh) {
      api.styleMesh(mesh, {
        color: color,
        emissiveVibrancy: opts.vibrancy != null ? opts.vibrancy : 1.45,
        bloon: !!opts.bloon,
        glossStrength: opts.glossStrength,
        glossPower: opts.glossPower,
        outlineThickness: opts.outline != null ? opts.outline : 0.038,
      });
      return mesh;
    }
    mesh.material = new THREE.MeshLambertMaterial({ color: color });
    return mesh;
  }

  function capsule(rTop, rBot, h, seg) {
    return new THREE.CylinderGeometry(rTop, rBot, h, seg != null ? seg : 6);
  }

  /* ═══════════════════════════════════════════════════════════
   * 2) CHUNKY MONKEY MESHES
   * ═══════════════════════════════════════════════════════════ */

  /**
   * Build a BTD6-style chunky monkey from low-poly primitives.
   *
   * @param {object} [opts]
   * @param {number|string} [opts.color]   Fur / shirt color
   * @param {string} [opts.kind]           Tower kind (dart_monkey, ninja_monkey, …)
   * @param {number[]} [opts.paths]        [top, mid, bot] upgrade tiers
   * @returns {THREE.Group}
   */
  function createMonkeyMesh(opts) {
    opts = opts || {};
    var paths = opts.paths || [0, 0, 0];
    var kind = opts.kind || 'dart_monkey';
    var fur = opts.color != null ? opts.color : MONKEY_FUR;
    var g = new THREE.Group();
    g.name = kind;
    g.userData.btd6Monkey = true;
    g.userData.kind = kind;
    g.userData.paths = paths.slice();

    /* Wooden pad keeps feet clear of the ground (no clipping) */
    var pad = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.52, 0.14, 10));
    paint(pad, 0xd4a574, { vibrancy: 1.35, outline: 0.03 });
    pad.position.y = 0.07;
    pad.name = 'pad';
    g.add(pad);
    var padTop = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 10));
    paint(padTop, 0xe8c090, { vibrancy: 1.4, outline: 0.02 });
    padTop.position.y = 0.15;
    g.add(padTop);

    /* Body rides on the pad */
    var body = new THREE.Group();
    body.name = 'bodyRoot';
    body.position.y = 0.18;
    g.add(body);

    /* —— Torso (extra-chunky for kids look) —— */
    var torso = new THREE.Mesh(capsule(0.3, 0.34, 0.52, 7));
    paint(torso, fur, { vibrancy: 1.55 });
    torso.position.y = 0.58;
    torso.name = 'torso';
    body.add(torso);

    /* —— Head: big friendly flattened sphere —— */
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 8, 6));
    head.scale.set(1.08, 0.9, 1.05);
    paint(head, MONKEY_SKIN, { vibrancy: 1.5 });
    head.position.y = 1.12;
    head.name = 'head';
    body.add(head);

    /* —— Ears —— */
    var earGeo = new THREE.SphereGeometry(0.15, 6, 4, 0, Math.PI);
    var earL = new THREE.Mesh(earGeo);
    earL.scale.set(1.15, 1.05, 0.55);
    paint(earL, MONKEY_SKIN, { vibrancy: 1.5 });
    earL.position.set(-0.36, 1.14, 0);
    earL.rotation.y = Math.PI / 2;
    earL.name = 'earL';
    var earR = earL.clone();
    earR.position.x = 0.36;
    earR.rotation.y = -Math.PI / 2;
    earR.name = 'earR';
    body.add(earL);
    body.add(earR);

    /* —— Oversized cartoon eyes —— */
    var eyeGroup = new THREE.Group();
    eyeGroup.name = 'eyes';
    eyeGroup.position.set(0, 1.14, 0.3);
    [
      { x: -0.11, name: 'eyeL' },
      { x: 0.11, name: 'eyeR' },
    ].forEach(function (e) {
      var white = new THREE.Mesh(new THREE.CircleGeometry(0.11, 12));
      white.material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      white.position.set(e.x, 0, 0.01);
      white.name = e.name;
      var pupil = new THREE.Mesh(new THREE.CircleGeometry(0.045, 10));
      pupil.material = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide });
      pupil.position.set(e.x, -0.015, 0.02);
      pupil.name = e.name + 'Pupil';
      var spark = new THREE.Mesh(new THREE.CircleGeometry(0.015, 6));
      spark.material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      spark.position.set(e.x - 0.02, 0.02, 0.03);
      eyeGroup.add(white);
      eyeGroup.add(pupil);
      eyeGroup.add(spark);
    });
    body.add(eyeGroup);

    /* —— Thick limbs —— */
    var armL = new THREE.Mesh(capsule(0.1, 0.11, 0.4, 6));
    paint(armL, fur, { vibrancy: 1.55 });
    armL.position.set(-0.4, 0.65, 0.05);
    armL.rotation.z = 0.4;
    armL.name = 'armL';
    var armR = armL.clone();
    armR.position.x = 0.4;
    armR.rotation.z = -0.4;
    armR.name = 'armR';
    body.add(armL);
    body.add(armR);

    var handL = new THREE.Object3D();
    handL.name = 'handL';
    handL.position.set(-0.54, 0.46, 0.12);
    var handR = new THREE.Object3D();
    handR.name = 'handR';
    handR.position.set(0.54, 0.46, 0.12);
    body.add(handL);
    body.add(handR);
    g.userData.handR = handR;
    g.userData.handL = handL;

    /* Legs sit fully on the pad — bottoms stay above y=0 */
    var legL = new THREE.Mesh(capsule(0.11, 0.13, 0.34, 6));
    paint(legL, fur, { vibrancy: 1.55 });
    legL.position.set(-0.14, 0.28, 0);
    legL.name = 'legL';
    var legR = legL.clone();
    legR.position.x = 0.14;
    legR.name = 'legR';
    body.add(legL);
    body.add(legR);

    applyKindKit(body, kind, fur);
    /* Accessories attach to outer group so cape clears the pad */
    applyUpgradeAccessories(g, kind, paths);
    /* Re-parent cape/kit that searched by name on g */
    return g;
  }

  function applyKindKit(monkey, kind, fur) {
    var handR = monkey.getObjectByName('handR');
    if (!handR) return;

    if (kind === 'dart_monkey' || kind === 'dart') {
      var dart = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.28, 5));
      paint(dart, 0xe8d080);
      dart.rotation.x = Math.PI / 2;
      dart.position.set(0.08, 0, 0.1);
      dart.name = 'kit_dart';
      handR.add(dart);
    } else if (kind === 'boomerang_monkey') {
      var boom = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 4, 10, Math.PI * 1.2));
      paint(boom, 0x8a5020);
      boom.rotation.y = Math.PI / 2;
      boom.name = 'kit_boomerang';
      handR.add(boom);
    } else if (kind === 'ninja_monkey') {
      var mask = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.08));
      paint(mask, 0x111111);
      mask.position.set(0, 1.08, 0.26);
      mask.name = 'kit_mask';
      monkey.add(mask);
    } else if (kind === 'sniper_monkey') {
      var rifle = new THREE.Mesh(capsule(0.04, 0.05, 0.55, 5));
      paint(rifle, 0x2a3a28);
      rifle.rotation.z = Math.PI / 2;
      rifle.position.set(0.2, 0, 0.15);
      rifle.name = 'kit_rifle';
      handR.add(rifle);
    } else if (kind === 'bomb_shooter') {
      var cannon = new THREE.Mesh(capsule(0.1, 0.14, 0.35, 6));
      paint(cannon, 0x444444);
      cannon.rotation.z = Math.PI / 2;
      cannon.position.set(0.18, 0, 0.12);
      cannon.name = 'kit_cannon';
      handR.add(cannon);
    } else if (kind === 'wizard_monkey') {
      var hat = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.4, 6));
      paint(hat, 0x6633cc);
      hat.position.set(0, 1.35, 0);
      hat.name = 'kit_hat';
      monkey.add(hat);
    } else if (kind === 'super_monkey') {
      paint(monkey.getObjectByName('torso'), 0x7744cc);
    }
  }

  /**
   * Structural material / mesh swap at Tier 3+.
   * Appends bright red cape or low-poly crossbow to the hand node.
   */
  function applyUpgradeAccessories(monkey, kind, paths) {
    clearAccessories(monkey);
    var maxTier = Math.max(paths[0] || 0, paths[1] || 0, paths[2] || 0);
    if (maxTier < 3) return;

    var handR = monkey.getObjectByName('handR');
    var acc = new THREE.Group();
    acc.name = 'tier3Accessories';

    /* Path0 T3+ on dart → Spike-O-Pult / crossbow-like launcher */
    if ((kind === 'dart_monkey' || kind === 'dart') && (paths[0] || 0) >= 3) {
      var crossbow = buildCrossbowMesh();
      crossbow.position.set(0.05, 0, 0.05);
      acc.add(crossbow);
      if (handR) handR.add(acc);
      else monkey.add(acc);
    } else if ((paths[1] || 0) >= 3 || (paths[2] || 0) >= 3 || maxTier >= 3) {
      /* Generic T3 flair: bright red cape */
      var cape = buildCapeMesh();
      cape.position.set(0, 0.95, -0.28);
      cape.name = 'cape';
      monkey.add(cape);
      monkey.add(acc);
    }

    /* T5 super glow ring */
    if (maxTier >= 5) {
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.04, 4, 16),
        new THREE.MeshBasicMaterial({ color: 0xffe070 })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.05;
      ring.name = 't5Ring';
      monkey.add(ring);
    }
  }

  function clearAccessories(monkey) {
    var remove = [];
    monkey.traverse(function (c) {
      if (
        c.name === 'tier3Accessories' ||
        c.name === 'cape' ||
        c.name === 't5Ring' ||
        (c.parent && c.parent.name === 'handR' && c.name && c.name.indexOf('acc_') === 0)
      ) {
        remove.push(c);
      }
    });
    remove.forEach(function (c) {
      if (c.parent) c.parent.remove(c);
    });
  }

  function buildCapeMesh() {
    var cape = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.7, 0.06),
      null
    );
    paint(cape, 0xff0033, { vibrancy: 1.55 });
    cape.scale.set(1, 1, 0.5);
    /* Slight flare at bottom via second panel */
    var flap = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.25, 0.05));
    paint(flap, 0xff2244, { vibrancy: 1.5 });
    flap.position.set(0, -0.4, -0.02);
    flap.rotation.x = 0.25;
    cape.add(flap);
    return cape;
  }

  function buildCrossbowMesh() {
    var g = new THREE.Group();
    g.name = 'acc_crossbow';
    var stock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.45));
    paint(stock, 0x6a4420);
    var limbs = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.08));
    paint(limbs, 0x8a6030);
    limbs.position.set(0, 0.02, 0.18);
    var bolt = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.32, 4));
    paint(bolt, 0xc8a050);
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(0, 0.05, 0.28);
    g.add(stock);
    g.add(limbs);
    g.add(bolt);
    return g;
  }

  /**
   * Call after buying an upgrade to swap Tier-3+ accessories.
   */
  function applyMonkeyUpgradeVisuals(monkeyGroup, paths) {
    if (!monkeyGroup || !monkeyGroup.userData) return monkeyGroup;
    var kind = monkeyGroup.userData.kind || 'dart_monkey';
    monkeyGroup.userData.paths = (paths || [0, 0, 0]).slice();
    applyUpgradeAccessories(monkeyGroup, kind, monkeyGroup.userData.paths);
    return monkeyGroup;
  }

  /* ═══════════════════════════════════════════════════════════
   * 4) SHINY BLOONS
   * ═══════════════════════════════════════════════════════════ */

  /**
   * Reflective rubber bloon sphere with exact layer hex + heavy gloss.
   *
   * @param {string|object} typeOrOpts  'red'|'blue'|… or { type, camo, fortified, r }
   */
  function createBloonMesh(typeOrOpts) {
    var opts = typeof typeOrOpts === 'string' ? { type: typeOrOpts } : (typeOrOpts || {});
    var type = (opts.type || 'red').toLowerCase();
    var hex = BLOON_COLORS[type] != null ? BLOON_COLORS[type] : BLOON_COLORS.red;
    var r = opts.r != null ? opts.r : (opts.blimp ? 0.9 : 0.7);

    var g = new THREE.Group();
    g.name = 'Bloon_' + type;
    g.userData.btd6Bloon = true;
    g.userData.bloonType = type;

    /* Big rubber ball — no string (strings looked like hair at board scale) */
    var floatY = r + 0.15;
    var body = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14));
    paint(body, hex, {
      bloon: true,
      vibrancy: 1.7,
      glossStrength: 0.9,
      glossPower: 48,
      outline: 0.022,
    });
    body.position.y = floatY;
    body.name = 'bloonBody';
    g.add(body);

    var shine = new THREE.Mesh(
      new THREE.SphereGeometry(r * 0.42, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.4)
    );
    shine.material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
    });
    shine.position.set(-r * 0.28, floatY + r * 0.3, r * 0.5);
    shine.scale.set(1, 0.65, 0.45);
    shine.name = 'bloonShine';
    g.add(shine);

    if (opts.camo) {
      var camo = new THREE.Mesh(
        new THREE.SphereGeometry(r * 1.04, 12, 8),
        new THREE.MeshBasicMaterial({
          color: 0x88ff88,
          transparent: true,
          opacity: 0.2,
          wireframe: true,
        })
      );
      camo.position.y = floatY;
      camo.name = 'camoShell';
      g.add(camo);
    }

    if (opts.fortified || type === 'ceramic' || type.indexOf('fortified') >= 0) {
      var band = new THREE.Mesh(new THREE.TorusGeometry(r * 0.85, r * 0.1, 4, 14));
      paint(band, 0x888888, { vibrancy: 1.2, outline: 0.015 });
      band.rotation.x = Math.PI / 2;
      band.position.y = floatY;
      band.name = 'fortBand';
      g.add(band);
    }

    if (opts.blimp || type === 'moab' || type === 'bfb' || type === 'zomg' || type === 'ddt' || type === 'bad') {
      body.scale.set(1.7, 0.9, 1.15);
      body.position.y = r * 0.9 + 0.25;
      g.userData.blimpLabel = opts.label || type.toUpperCase();
    }

    return g;
  }

  /* ═══════════════════════════════════════════════════════════
   * MAP PROPS — stacked cone trees
   * ═══════════════════════════════════════════════════════════ */

  function createStylizedTree(scale) {
    scale = scale != null ? scale : 1;
    var g = new THREE.Group();
    g.name = 'BTD6Tree';

    /* Little dirt mound so trunk never clips into grass */
    var mound = new THREE.Mesh(new THREE.SphereGeometry(0.28 * scale, 6, 4));
    mound.scale.set(1.2, 0.35, 1.2);
    paint(mound, 0x8a6030, { vibrancy: 1.25, outline: 0.02 });
    mound.position.y = 0.08 * scale;
    g.add(mound);

    var trunk = new THREE.Mesh(capsule(0.08 * scale, 0.12 * scale, 0.55 * scale, 5));
    paint(trunk, 0x8a5520, { vibrancy: 1.3 });
    trunk.position.y = 0.4 * scale;
    g.add(trunk);

    /* Stacked overlapping green cones — brighter kid palette */
    var cones = [
      { y: 0.9, r: 0.58, h: 0.78, c: 0x3cb848 },
      { y: 1.32, r: 0.44, h: 0.62, c: 0x4cd058 },
      { y: 1.68, r: 0.3, h: 0.5, c: 0x5ce068 },
    ];
    cones.forEach(function (c, i) {
      var cone = new THREE.Mesh(new THREE.ConeGeometry(c.r * scale, c.h * scale, 6));
      paint(cone, c.c, { vibrancy: 1.5 });
      cone.position.y = c.y * scale;
      cone.name = 'foliage' + i;
      g.add(cone);
    });

    return g;
  }

  return {
    BLOON_COLORS: BLOON_COLORS,
    createMonkeyMesh: createMonkeyMesh,
    applyMonkeyUpgradeVisuals: applyMonkeyUpgradeVisuals,
    createBloonMesh: createBloonMesh,
    createStylizedTree: createStylizedTree,
    buildCapeMesh: buildCapeMesh,
    buildCrossbowMesh: buildCrossbowMesh,
  };
});
