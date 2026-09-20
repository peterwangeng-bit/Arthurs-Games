/**
 * Bloons TD 6 Clone — game data pack (window.BTD6_DATA)
 * Loaded before bloons-td6-engine.js
 */
(function (global) {
  'use strict';

  var D = {
    SHARP: 'Sharp',
    EXPLOSIVE: 'Explosive',
    SHATTER: 'Shatter',
    ENERGY: 'Energy',
    FREEZE: 'Freeze',
    ACID: 'Acid',
    NORMAL: 'Normal',
  };

  function U(name, cost, modifiers) {
    return { name: name, cost: cost, modifiers: modifiers || {} };
  }

  function path5(a, b, c, d, e) {
    return [a, b, c, d, e];
  }

  function tower(opts) {
    var t = {
      kind: opts.kind,
      displayName: opts.name,
      category: opts.category,
      placement: opts.placement || 'land',
      footprint: opts.footprint != null ? opts.footprint : 18,
      color: opts.color || '#c88',
      baseCost: opts.cost,
      attack: {
        radius: opts.radius != null ? opts.radius : 120,
        rate: opts.rate != null ? opts.rate : 0.95,
        damage: opts.damage != null ? opts.damage : 1,
        damageTypes: opts.damageTypes || [D.SHARP],
        pierce: opts.pierce != null ? opts.pierce : 1,
        canHitCamo: !!opts.canHitCamo,
        canPopLead: !!opts.canPopLead,
        tack: opts.tack || 0,
        village: !!opts.village,
        spikes: !!opts.spikes,
        engineer: !!opts.engineer,
        sentryMax: opts.sentryMax || 0,
        sentryRange: opts.sentryRange || 80,
        frost: !!opts.frost,
        glue: !!opts.glue,
        potion: !!opts.potion,
        slowDuration: opts.slowDuration != null ? opts.slowDuration : 0,
        slowFactor: opts.slowFactor != null ? opts.slowFactor : 0.5,
      },
      projectile: {
        type: opts.proj || 'dart',
        speed: opts.projSpeed != null ? opts.projSpeed : 420,
        splashRadius: opts.splash || 0,
        lifetime: opts.life != null ? opts.life : 1.4,
      },
      upgrades: opts.upgrades,
    };
    if (opts.income) t.income = opts.income;
    return t;
  }

  var towers = {};

  towers.dart_monkey = tower({
    kind: 'dart_monkey', name: 'Dart Monkey', category: 'primary', cost: 200, color: '#c87840',
    radius: 130, rate: 0.95, damage: 1, pierce: 2, proj: 'dart',
    upgrades: {
      path0: path5(
        U('Sharp Shots', 140, { damageAdd: 1, pierceAdd: 1 }),
        U('Razor Sharp Shots', 220, { pierceAdd: 2 }),
        U('Spike-O-Pult', 500, { damageAdd: 2, pierceAdd: 5, radiusAdd: 10 }),
        U('Juggernaut', 1800, { damageAdd: 4, pierceAdd: 12, moabBonusAdd: 3 }),
        U('Ultra-Juggernaut', 15000, { damageAdd: 8, pierceAdd: 20, moabBonusAdd: 10 })
      ),
      path1: path5(
        U('Long Range Darts', 100, { radiusAdd: 25 }),
        U('Enhanced Eyesight', 190, { radiusAdd: 20, flags: { canHitCamo: true } }),
        U('Crossbow', 625, { damageAdd: 2, rateMul: 0.85 }),
        U('Sharp Shooter', 2000, { damageAdd: 2, rateMul: 0.7, moabBonusAdd: 2 }),
        U('Crossbow Master', 21500, { damageAdd: 5, rateMul: 0.45, flags: { canPopLead: true } })
      ),
      path2: path5(
        U('Quick Shots', 90, { rateMul: 0.85 }),
        U('Very Quick Shots', 190, { rateMul: 0.8 }),
        U('Triple Shot', 425, { volleyAdd: 2 }),
        U('Super Monkey Fan Club', 8000, { rateMul: 0.9, volleyAdd: 1 }),
        U('Plasma Monkey Fan Club', 15000, { rateMul: 0.75, damageAdd: 2 })
      ),
    },
  });

  towers.boomerang_monkey = tower({
    kind: 'boomerang_monkey', name: 'Boomerang Monkey', category: 'primary', cost: 325, color: '#d09040',
    radius: 140, rate: 1.1, damage: 1, pierce: 4, proj: 'boomerang', projSpeed: 280,
    upgrades: {
      path0: path5(
        U('Improved Rangs', 200, { pierceAdd: 2 }),
        U('Glaive Thrower', 280, { pierceAdd: 3, damageAdd: 1 }),
        U('Mozzarella', 1300, { damageAdd: 2, pierceAdd: 4 }),
        U('Glaive Lord', 3000, { damageAdd: 3, pierceAdd: 8, moabBonusAdd: 4 }),
        U('Perma Charge', 40000, { damageAdd: 6, pierceAdd: 15, rateMul: 0.6 })
      ),
      path1: path5(
        U('Long Range Rangs', 175, { radiusAdd: 30 }),
        U('Red Hot Rangs', 290, { damageAdd: 1, flags: { canPopLead: true, damageTypesAdd: [D.NORMAL] } }),
        U('Bionic Boomerang', 1450, { rateMul: 0.7, moabBonusAdd: 3 }),
        U('Turbo Charge', 4000, { rateMul: 0.55, moabBonusAdd: 5 }),
        U('Perma Charge', 35000, { rateMul: 0.4, damageAdd: 4 })
      ),
      path2: path5(
        U('Multi-Target', 100, { pierceAdd: 1 }),
        U('Glaives', 270, { pierceAdd: 2 }),
        U('MOAB Press', 1600, { moabBonusAdd: 8, damageAdd: 1 }),
        U('MOAB Domination', 4200, { moabBonusAdd: 15, damageAdd: 2 }),
        U('MOAB Domination+', 50000, { moabBonusAdd: 30, pierceAdd: 10 })
      ),
    },
  });

  towers.bomb_shooter = tower({
    kind: 'bomb_shooter', name: 'Bomb Shooter', category: 'primary', cost: 525, color: '#555',
    radius: 150, rate: 1.4, damage: 2, pierce: 1, damageTypes: [D.EXPLOSIVE],
    canPopLead: true, proj: 'bomb', splash: 45, projSpeed: 320,
    upgrades: {
      path0: path5(
        U('Bigger Bombs', 400, { splashRadiusAdd: 15, damageAdd: 1 }),
        U('Heavy Bombs', 650, { damageAdd: 2, pierceAdd: 2 }),
        U('Really Big Bombs', 1200, { splashRadiusAdd: 20, damageAdd: 3 }),
        U('Bloon Impact', 3200, { damageAdd: 5, moabBonusAdd: 4 }),
        U('Bloon Crush', 55000, { damageAdd: 12, moabBonusAdd: 15 })
      ),
      path1: path5(
        U('Faster Reload', 250, { rateMul: 0.8 }),
        U('Missile Launcher', 400, { rateMul: 0.85, moabBonusAdd: 3 }),
        U('MOAB Mauler', 900, { moabBonusAdd: 12, damageAdd: 2 }),
        U('MOAB Assassin', 3200, { moabBonusAdd: 25, damageAdd: 4 }),
        U('MOAB Eliminator', 55000, { moabBonusAdd: 60, damageAdd: 10 })
      ),
      path2: path5(
        U('Extra Range', 200, { radiusAdd: 30 }),
        U('Frag Bombs', 300, { pierceAdd: 4, damageAdd: 1 }),
        U('Cluster Bombs', 800, { splashRadiusAdd: 25, pierceAdd: 6 }),
        U('Recursive Cluster', 2800, { splashRadiusAdd: 20, damageAdd: 3 }),
        U('Bomb Blitz', 35000, { damageAdd: 8, splashRadiusAdd: 30 })
      ),
    },
  });

  towers.tack_shooter = tower({
    kind: 'tack_shooter', name: 'Tack Shooter', category: 'primary', cost: 280, color: '#f62',
    radius: 90, rate: 1.0, damage: 1, pierce: 1, tack: 8, proj: 'tack', projSpeed: 380,
    upgrades: {
      path0: path5(
        U('Faster Shooting', 150, { rateMul: 0.8 }),
        U('Even Faster Shooting', 300, { rateMul: 0.75 }),
        U('Tack Sprayer', 600, { tackAdd: 4 }),
        U('Overdrive', 3500, { rateMul: 0.5, damageAdd: 1 }),
        U('The Tack Zone', 20000, { tackAdd: 4, damageAdd: 2, radiusAdd: 40 })
      ),
      path1: path5(
        U('Long Range Tacks', 100, { radiusAdd: 20 }),
        U('Super Range Tacks', 225, { radiusAdd: 25 }),
        U('Blade Shooter', 550, { damageAdd: 1, pierceAdd: 1 }),
        U('Blade Maelstrom', 2700, { damageAdd: 2, pierceAdd: 2 }),
        U('Super Maelstrom', 15000, { damageAdd: 4, pierceAdd: 4, rateMul: 0.7 })
      ),
      path2: path5(
        U('More Tacks', 100, { tackAdd: 2 }),
        U('Even More Tacks', 200, { tackAdd: 2 }),
        U('Tack Sprayer+', 550, { tackAdd: 4, damageAdd: 1 }),
        U('Ring of Fire', 3200, { damageAdd: 3, splashRadiusAdd: 40 }),
        U('Inferno Ring', 45000, { damageAdd: 8, splashRadiusAdd: 60, flags: { canPopLead: true } })
      ),
    },
  });

  towers.ice_monkey = tower({
    kind: 'ice_monkey', name: 'Ice Monkey', category: 'primary', cost: 500, color: '#8cf',
    radius: 100, rate: 2.2, damage: 0, pierce: 20, damageTypes: [D.FREEZE, D.SHARP],
    frost: true, slowDuration: 1.4, slowFactor: 0,
    proj: 'none', projSpeed: 0, splash: 0,
    upgrades: {
      path0: path5(
        U('Permafrost', 150, { damageAdd: 1 }),
        U('Deep Freeze', 350, { radiusAdd: 20, pierceAdd: 10, slowDurationAdd: 0.4 }),
        U('Arctic Wind', 1500, { radiusAdd: 30, damageAdd: 2 }),
        U('Snowstorm', 3000, { damageAdd: 3, pierceAdd: 20 }),
        U('Absolute Zero', 26000, { damageAdd: 6, radiusAdd: 50 })
      ),
      path1: path5(
        U('Enhanced Freeze', 225, { rateMul: 0.85, slowDurationAdd: 0.3 }),
        U('Metal Freeze', 380, { flags: { canPopLead: true } }),
        U('Ice Shards', 1500, { damageAdd: 2, pierceAdd: 8 }),
        U('Embrittlement', 3000, { damageAdd: 3 }),
        U('Super Brittle', 30000, { damageAdd: 8, moabBonusAdd: 10 })
      ),
      path2: path5(
        U('Larger Radius', 150, { radiusAdd: 25 }),
        U('Re-Freeze', 200, { rateMul: 0.8 }),
        U('Cryo Cannon', 2000, { damageAdd: 2, radiusAdd: 20, flags: { cryoCannon: true } }),
        U('Icicles', 3500, { damageAdd: 3, pierceAdd: 10 }),
        U('Icicle Impale', 30000, { damageAdd: 10, moabBonusAdd: 20 })
      ),
    },
  });

  towers.glue_gunner = tower({
    kind: 'glue_gunner', name: 'Glue Gunner', category: 'primary', cost: 275, color: '#fa4',
    radius: 125, rate: 1.1, damage: 0, pierce: 1, damageTypes: [D.ACID, D.NORMAL],
    glue: true, slowDuration: 3.2, slowFactor: 0.4,
    proj: 'glue', projSpeed: 360, splash: 20,
    upgrades: {
      path0: path5(
        U('Glue Soak', 200, { pierceAdd: 2 }),
        U('Corrosive Glue', 300, { damageAdd: 1 }),
        U('Bloon Dissolver', 3200, { damageAdd: 3, pierceAdd: 3 }),
        U('Bloon Liquefier', 5000, { damageAdd: 5 }),
        U('The Bloon Solver', 22000, { damageAdd: 10, pierceAdd: 10 })
      ),
      path1: path5(
        U('Bigger Globs', 100, { splashRadiusAdd: 15 }),
        U('Glue Splatter', 1800, { splashRadiusAdd: 25, pierceAdd: 4 }),
        U('Glue Hose', 3250, { rateMul: 0.6, pierceAdd: 4 }),
        U('Glue Strike', 3500, { damageAdd: 2, slowDurationAdd: 1 }),
        U('Glue Storm', 15000, { damageAdd: 4, splashRadiusAdd: 40 })
      ),
      path2: path5(
        U('Stickier Glue', 220, { rateMul: 0.9, slowDurationAdd: 1.2, slowFactorAdd: -0.1 }),
        U('Stronger Glue', 400, { damageAdd: 1, slowFactorAdd: -0.05 }),
        U('MOAB Glue', 3200, { moabBonusAdd: 6, damageAdd: 1, flags: { glueMoab: true } }),
        U('Relentless Glue', 3000, { moabBonusAdd: 8, slowDurationAdd: 1.5 }),
        U('Super Glue', 28000, { moabBonusAdd: 20, damageAdd: 4, slowFactorAdd: -0.15 })
      ),
    },
  });

  towers.sniper_monkey = tower({
    kind: 'sniper_monkey', name: 'Sniper Monkey', category: 'military', cost: 350, color: '#3a5a38',
    radius: 9999, rate: 1.6, damage: 2, pierce: 1, proj: 'bullet', projSpeed: 1400,
    upgrades: {
      path0: path5(
        U('Full Metal Jacket', 350, { damageAdd: 2, flags: { canPopLead: true } }),
        U('Large Calibre', 1300, { damageAdd: 3 }),
        U('Deadly Precision', 3000, { damageAdd: 8 }),
        U('Maim MOAB', 5000, { moabBonusAdd: 20, damageAdd: 5 }),
        U('Cripple MOAB', 34000, { moabBonusAdd: 50, damageAdd: 15 })
      ),
      path1: path5(
        U('Night Vision Goggles', 200, { flags: { canHitCamo: true } }),
        U('Shrapnel Shot', 450, { pierceAdd: 3, damageAdd: 1 }),
        U('Bouncing Bullet', 2200, { pierceAdd: 5, damageAdd: 2 }),
        U('Supply Drop', 6500, { incomePerRoundAdd: 1000 }),
        U('Elite Defender', 14000, { rateMul: 0.4, damageAdd: 4 })
      ),
      path2: path5(
        U('Fast Firing', 450, { rateMul: 0.75 }),
        U('Even Faster Firing', 750, { rateMul: 0.75 }),
        U('Semi-Automatic', 2900, { rateMul: 0.55 }),
        U('Full Auto Rifle', 4500, { rateMul: 0.45, damageAdd: 1 }),
        U('Elite Sniper', 14000, { rateMul: 0.3, damageAdd: 3 })
      ),
    },
  });

  towers.monkey_sub = tower({
    kind: 'monkey_sub', name: 'Monkey Sub', category: 'military', cost: 325, color: '#246',
    placement: 'water', footprint: 20, radius: 160, rate: 0.9, damage: 1, pierce: 2,
    proj: 'torpedo', projSpeed: 380, splash: 10,
    upgrades: {
      path0: path5(
        U('Longer Range', 130, { radiusAdd: 30 }),
        U('Advanced Intel', 500, { flags: { canHitCamo: true }, radiusAdd: 40 }),
        U('Submerge and Support', 700, { damageAdd: 1 }),
        U('Bloontonium Reactor', 2500, { damageAdd: 2, pierceAdd: 3 }),
        U('Energizer', 25000, { damageAdd: 4, rateMul: 0.6 })
      ),
      path1: path5(
        U('Barbed Darts', 150, { pierceAdd: 2 }),
        U('Heat-tipped Darts', 500, { flags: { canPopLead: true }, damageAdd: 1 }),
        U('Ballistic Missile', 1400, { moabBonusAdd: 8, splashRadiusAdd: 30 }),
        U('First Strike', 10000, { moabBonusAdd: 30, damageAdd: 5 }),
        U('Pre-emptive Strike', 25000, { moabBonusAdd: 60, damageAdd: 10 })
      ),
      path2: path5(
        U('Twin Guns', 450, { volleyAdd: 1 }),
        U('Airburst Darts', 1000, { pierceAdd: 4, damageAdd: 1 }),
        U('Triple Guns', 1400, { volleyAdd: 1 }),
        U('Armor Piercing', 2500, { damageAdd: 3, moabBonusAdd: 4 }),
        U('Sub Commander', 20000, { damageAdd: 5, rateMul: 0.7 })
      ),
    },
  });

  towers.monkey_buccaneer = tower({
    kind: 'monkey_buccaneer', name: 'Monkey Buccaneer', category: 'military', cost: 500, color: '#864',
    placement: 'water', footprint: 22, radius: 170, rate: 1.0, damage: 1, pierce: 2,
    proj: 'cannonball', projSpeed: 340, splash: 20, canPopLead: true, damageTypes: [D.EXPLOSIVE, D.SHARP],
    upgrades: {
      path0: path5(
        U('Faster Shooting', 275, { rateMul: 0.8 }),
        U('Double Shot', 425, { volleyAdd: 1 }),
        U('Destroyer', 2300, { rateMul: 0.55, damageAdd: 1 }),
        U('Aircraft Carrier', 8000, { damageAdd: 3, volleyAdd: 1 }),
        U('Carrier Flagship', 25000, { damageAdd: 6, rateMul: 0.5 })
      ),
      path1: path5(
        U('Long Range', 200, { radiusAdd: 35 }),
        U('Crow\'s Nest', 350, { flags: { canHitCamo: true } }),
        U('Merchantman', 2200, { incomePerRoundAdd: 200 }),
        U('Favored Trades', 3900, { incomePerRoundAdd: 400 }),
        U('Trade Empire', 23000, { incomePerRoundAdd: 1000 })
      ),
      path2: path5(
        U('Grape Shot', 275, { pierceAdd: 4, damageAdd: 1 }),
        U('Hot Shot', 375, { flags: { canPopLead: true } }),
        U('Cannon Ship', 2200, { splashRadiusAdd: 25, moabBonusAdd: 5 }),
        U('Monkey Pirates', 5500, { moabBonusAdd: 15, damageAdd: 3 }),
        U('Pirate Lord', 23000, { moabBonusAdd: 40, damageAdd: 6 })
      ),
    },
  });

  towers.monkey_ace = tower({
    kind: 'monkey_ace', name: 'Monkey Ace', category: 'military', cost: 800, color: '#888',
    radius: 9999, rate: 1.2, damage: 1, pierce: 3, proj: 'dart', projSpeed: 500, footprint: 22,
    upgrades: {
      path0: path5(
        U('Rapid Fire', 650, { rateMul: 0.75 }),
        U('Lots More Darts', 650, { volleyAdd: 2 }),
        U('Fighter Plane', 1000, { damageAdd: 1, pierceAdd: 2 }),
        U('Operation: Dart Storm', 3000, { volleyAdd: 4, rateMul: 0.7 }),
        U('Sky Shredder', 40000, { damageAdd: 4, volleyAdd: 4 })
      ),
      path1: path5(
        U('Exploding Pineapple', 200, { splashRadiusAdd: 30, flags: { damageTypesAdd: [D.EXPLOSIVE] } }),
        U('Spy Plane', 350, { flags: { canHitCamo: true } }),
        U('Bomber Ace', 900, { damageAdd: 2, splashRadiusAdd: 40 }),
        U('Ground Zero', 14000, { damageAdd: 8, splashRadiusAdd: 80 }),
        U('Tsar Bomba', 85000, { damageAdd: 25, splashRadiusAdd: 120 })
      ),
      path2: path5(
        U('Sharper Darts', 400, { pierceAdd: 3 }),
        U('Centered Path', 550, { radiusAdd: 0 }),
        U('Neva-Miss Targeting', 2200, { damageAdd: 1, pierceAdd: 4 }),
        U('Spectre', 24000, { damageAdd: 3, pierceAdd: 8, moabBonusAdd: 5 }),
        U('Flying Fortress', 85000, { damageAdd: 8, pierceAdd: 15 })
      ),
    },
  });

  towers.heli_pilot = tower({
    kind: 'heli_pilot', name: 'Heli Pilot', category: 'military', cost: 1600, color: '#666',
    radius: 200, rate: 0.55, damage: 1, pierce: 2, proj: 'dart', projSpeed: 480, footprint: 22,
    upgrades: {
      path0: path5(
        U('Quad Darts', 800, { volleyAdd: 3 }),
        U('Pursuit', 500, { radiusAdd: 40 }),
        U('Razor Rotors', 1500, { damageAdd: 2, pierceAdd: 3 }),
        U('Apache Dartship', 20000, { damageAdd: 4, volleyAdd: 2, rateMul: 0.7 }),
        U('Apache Prime', 45000, { damageAdd: 8, rateMul: 0.5 })
      ),
      path1: path5(
        U('Bigger Jets', 300, { rateMul: 0.9 }),
        U('IFR', 600, { flags: { canHitCamo: true } }),
        U('Downdraft', 3500, { damageAdd: 1 }),
        U('Support Chinook', 12000, { incomePerRoundAdd: 500 }),
        U('Special Poperations', 30000, { incomePerRoundAdd: 1200 })
      ),
      path2: path5(
        U('Faster Firing', 250, { rateMul: 0.8 }),
        U('Twin Guns', 450, { volleyAdd: 1 }),
        U('Special Guns', 3500, { damageAdd: 2, pierceAdd: 2 }),
        U('Comanche Defense', 12000, { damageAdd: 3, moabBonusAdd: 6 }),
        U('Comanche Commander', 35000, { damageAdd: 6, moabBonusAdd: 15 })
      ),
    },
  });

  towers.mortar_monkey = tower({
    kind: 'mortar_monkey', name: 'Mortar Monkey', category: 'military', cost: 750, color: '#5a4020',
    radius: 9999, rate: 1.8, damage: 2, pierce: 10, damageTypes: [D.EXPLOSIVE],
    canPopLead: true, proj: 'shell', splash: 55, projSpeed: 200, footprint: 20,
    upgrades: {
      path0: path5(
        U('Bigger Blast', 500, { splashRadiusAdd: 20 }),
        U('Bloon Buster', 600, { damageAdd: 2 }),
        U('Shockwave', 900, { damageAdd: 2, splashRadiusAdd: 15 }),
        U('The Big One', 8000, { damageAdd: 6, splashRadiusAdd: 40 }),
        U('The Biggest One', 30000, { damageAdd: 15, splashRadiusAdd: 70 })
      ),
      path1: path5(
        U('Faster Reload', 300, { rateMul: 0.8 }),
        U('Rapid Reload', 500, { rateMul: 0.8 }),
        U('Heavy Shells', 900, { damageAdd: 2, moabBonusAdd: 4 }),
        U('Artillery Battery', 6000, { rateMul: 0.55, damageAdd: 2 }),
        U('Pop and Awe', 35000, { damageAdd: 8, rateMul: 0.45 })
      ),
      path2: path5(
        U('Increased Accuracy', 200, { radiusAdd: 0 }),
        U('Burny Stuff', 500, { damageAdd: 1 }),
        U('Signal Flare', 700, { flags: { canHitCamo: true } }),
        U('Shattering Shells', 11000, { damageAdd: 4, pierceAdd: 10 }),
        U('Blooncineration', 40000, { damageAdd: 10, flags: { canPopLead: true } })
      ),
    },
  });

  towers.dartling_gunner = tower({
    kind: 'dartling_gunner', name: 'Dartling Gunner', category: 'military', cost: 850, color: '#494',
    radius: 9999, rate: 0.2, damage: 1, pierce: 1, proj: 'dart', projSpeed: 600, footprint: 20,
    upgrades: {
      path0: path5(
        U('Focused Firing', 300, { damageAdd: 0 }),
        U('Laser Shock', 900, { damageAdd: 1, flags: { damageTypesAdd: [D.ENERGY] } }),
        U('Laser Cannon', 4000, { damageAdd: 2, pierceAdd: 3 }),
        U('Plasma Accelerator', 15000, { damageAdd: 4, rateMul: 0.7 }),
        U('Ray of Doom', 75000, { damageAdd: 15, pierceAdd: 20 })
      ),
      path1: path5(
        U('Advanced Targeting', 250, { flags: { canHitCamo: true } }),
        U('Faster Barrel Spin', 900, { rateMul: 0.7 }),
        U('Hydra Rocket Pods', 5000, { splashRadiusAdd: 30, damageAdd: 2, flags: { damageTypesAdd: [D.EXPLOSIVE] } }),
        U('Rocket Storm', 12000, { damageAdd: 3, splashRadiusAdd: 25 }),
        U('M.A.D', 60000, { moabBonusAdd: 40, damageAdd: 10 })
      ),
      path2: path5(
        U('Powerful Darts', 150, { pierceAdd: 1 }),
        U('Sharper Darts', 1200, { pierceAdd: 2, damageAdd: 1 }),
        U('Buckshot', 3500, { volleyAdd: 4, damageAdd: 1 }),
        U('Bloon Area Denial', 12000, { damageAdd: 3, pierceAdd: 4 }),
        U('Bloon Exclusion Zone', 60000, { damageAdd: 8, volleyAdd: 4 })
      ),
    },
  });

  towers.wizard_monkey = tower({
    kind: 'wizard_monkey', name: 'Wizard Monkey', category: 'magic', cost: 400, color: '#63c',
    radius: 140, rate: 1.0, damage: 1, pierce: 3, damageTypes: [D.ENERGY, D.SHARP],
    proj: 'orb', projSpeed: 360, splash: 15,
    upgrades: {
      path0: path5(
        U('Guided Magic', 150, { flags: { canHitCamo: true } }),
        U('Arcane Blast', 450, { damageAdd: 1 }),
        U('Arcane Mastery', 1300, { damageAdd: 2, radiusAdd: 25 }),
        U('Arcane Spike', 10000, { damageAdd: 6, pierceAdd: 5 }),
        U('Archmage', 32000, { damageAdd: 12, pierceAdd: 10 })
      ),
      path1: path5(
        U('Fireball', 300, { splashRadiusAdd: 25, damageAdd: 1, flags: { damageTypesAdd: [D.EXPLOSIVE] } }),
        U('Wall of Fire', 950, { damageAdd: 1 }),
        U('Dragon\'s Breath', 3000, { damageAdd: 3, splashRadiusAdd: 20 }),
        U('Summon Phoenix', 6000, { damageAdd: 5, moabBonusAdd: 8 }),
        U('Wizard Lord Phoenix', 50000, { damageAdd: 12, moabBonusAdd: 20 })
      ),
      path2: path5(
        U('Intense Magic', 300, { pierceAdd: 3 }),
        U('Lightning Bolt', 600, { damageAdd: 1, pierceAdd: 4 }),
        U('Shimmer', 1800, { flags: { canHitCamo: true }, radiusAdd: 20 }),
        U('Necromancer', 2800, { damageAdd: 2 }),
        U('Prince of Darkness', 24000, { damageAdd: 6, pierceAdd: 10 })
      ),
    },
  });

  towers.super_monkey = tower({
    kind: 'super_monkey', name: 'Super Monkey', category: 'magic', cost: 2500, color: '#c28',
    radius: 160, rate: 0.06, damage: 1, pierce: 1, proj: 'dart', projSpeed: 700, footprint: 20,
    upgrades: {
      path0: path5(
        U('Laser Vision', 2500, { pierceAdd: 2, flags: { damageTypesAdd: [D.ENERGY], canPopLead: true } }),
        U('Plasma Blasts', 4000, { damageAdd: 1, pierceAdd: 2 }),
        U('Sun Avatar', 20000, { damageAdd: 3, volleyAdd: 2 }),
        U('Sun Temple', 100000, { damageAdd: 10, radiusAdd: 80 }),
        U('True Sun God', 500000, { damageAdd: 30, radiusAdd: 120 })
      ),
      path1: path5(
        U('Super Range', 1000, { radiusAdd: 40 }),
        U('Epic Range', 1500, { radiusAdd: 50 }),
        U('Robo Monkey', 8000, { volleyAdd: 1, damageAdd: 1 }),
        U('Tech Terror', 25000, { damageAdd: 4, splashRadiusAdd: 50 }),
        U('The Anti-Bloon', 90000, { damageAdd: 15, splashRadiusAdd: 80 })
      ),
      path2: path5(
        U('Knockback', 3000, { damageAdd: 0 }),
        U('Ultravision', 2000, { flags: { canHitCamo: true }, radiusAdd: 30 }),
        U('Dark Knight', 5500, { damageAdd: 2, pierceAdd: 2 }),
        U('Dark Champion', 50000, { damageAdd: 5, pierceAdd: 5 }),
        U('Legend of the Night', 200000, { damageAdd: 20, pierceAdd: 15 })
      ),
    },
  });

  towers.ninja_monkey = tower({
    kind: 'ninja_monkey', name: 'Ninja Monkey', category: 'magic', cost: 500, color: '#1a2030',
    radius: 150, rate: 0.6, damage: 1, pierce: 2, canHitCamo: true, proj: 'shuriken', projSpeed: 480,
    upgrades: {
      path0: path5(
        U('Ninja Discipline', 300, { rateMul: 0.75, radiusAdd: 15 }),
        U('Sharp Shurikens', 350, { pierceAdd: 2 }),
        U('Double Shot', 850, { volleyAdd: 1 }),
        U('Bloonjitsu', 2750, { volleyAdd: 3 }),
        U('Grandmaster Ninja', 35000, { volleyAdd: 4, damageAdd: 2, rateMul: 0.6 })
      ),
      path1: path5(
        U('Distraction', 250, { damageAdd: 0 }),
        U('Counter-Espionage', 400, { flags: { canHitCamo: true } }),
        U('Shinobi Tactics', 900, { rateMul: 0.8 }),
        U('Bloon Sabotage', 3000, { damageAdd: 1 }),
        U('Grand Saboteur', 22000, { damageAdd: 3, moabBonusAdd: 10 })
      ),
      path2: path5(
        U('Seeking Shuriken', 300, { pierceAdd: 1 }),
        U('Caltrops', 450, { damageAdd: 1 }),
        U('Flash Bomb', 2200, { splashRadiusAdd: 40, damageAdd: 2 }),
        U('Sticky Bomb', 4500, { moabBonusAdd: 15, damageAdd: 3 }),
        U('Master Bomber', 35000, { moabBonusAdd: 40, damageAdd: 6 })
      ),
    },
  });

  towers.alchemist = tower({
    kind: 'alchemist', name: 'Alchemist', category: 'magic', cost: 550, color: '#6a8',
    radius: 130, rate: 1.5, damage: 1, pierce: 5, damageTypes: [D.ACID, D.NORMAL],
    proj: 'potion', projSpeed: 300, splash: 42,
    slowDuration: 2.8, slowFactor: 0.55,
    potion: true,
    upgrades: {
      path0: path5(
        U('Larger Potions', 250, { splashRadiusAdd: 18 }),
        U('Acidic Mixture Dip', 350, { damageAdd: 1, flags: { canPopLead: true } }),
        U('Berserker Brew', 2500, { damageAdd: 2, slowDurationAdd: 0.8 }),
        U('Stronger Stimulant', 4000, { damageAdd: 3, rateMul: 0.85, splashRadiusAdd: 12 }),
        U('Permanent Brew', 45000, { damageAdd: 6, splashRadiusAdd: 25 })
      ),
      path1: path5(
        U('Stronger Acid', 250, { damageAdd: 1 }),
        U('Perishing Potions', 475, { damageAdd: 1, moabBonusAdd: 2 }),
        U('Unstable Concoction', 3000, { splashRadiusAdd: 25, damageAdd: 3 }),
        U('Transforming Tonic', 4500, { damageAdd: 4 }),
        U('Total Transformation', 45000, { damageAdd: 10 })
      ),
      path2: path5(
        U('Faster Throwing', 250, { rateMul: 0.8 }),
        U('Acid Pool', 350, { splashRadiusAdd: 22, slowDurationAdd: 1.2 }),
        U('Lead to Gold', 1000, { flags: { canPopLead: true }, incomePerRoundAdd: 50 }),
        U('Rubber to Gold', 3000, { incomePerRoundAdd: 200 }),
        U('Bloon Master Alchemist', 40000, { damageAdd: 5, incomePerRoundAdd: 500 })
      ),
    },
  });

  towers.druid = tower({
    kind: 'druid', name: 'Druid', category: 'magic', cost: 400, color: '#3a8',
    radius: 130, rate: 1.0, damage: 1, pierce: 3, proj: 'thorn', projSpeed: 400,
    upgrades: {
      path0: path5(
        U('Hard Thorns', 250, { pierceAdd: 1, flags: { canPopLead: true } }),
        U('Heart of Thunder', 850, { damageAdd: 1, pierceAdd: 3 }),
        U('Druid of Storm', 2000, { damageAdd: 2 }),
        U('Ball Lightning', 4500, { damageAdd: 4, splashRadiusAdd: 30 }),
        U('Superstorm', 60000, { damageAdd: 12, pierceAdd: 15 })
      ),
      path1: path5(
        U('Thorn Swarm', 250, { volleyAdd: 2 }),
        U('Heart of Oak', 350, { pierceAdd: 2 }),
        U('Druid of Jungle', 950, { damageAdd: 1 }),
        U('Jungle\'s Bounty', 4500, { incomePerRoundAdd: 300 }),
        U('Spirit of the Forest', 35000, { incomePerRoundAdd: 800, damageAdd: 3 })
      ),
      path2: path5(
        U('Hard Thorns+', 100, { pierceAdd: 1 }),
        U('Heart of Vengeance', 300, { rateMul: 0.85 }),
        U('Druid of Wrath', 1200, { damageAdd: 2, rateMul: 0.85 }),
        U('Poplust', 3500, { damageAdd: 2, rateMul: 0.75 }),
        U('Avatar of Wrath', 45000, { damageAdd: 10, rateMul: 0.5 })
      ),
    },
  });

  towers.banana_farm = tower({
    kind: 'banana_farm', name: 'Banana Farm', category: 'support', cost: 1250, color: '#fc4',
    radius: 0, rate: 10, damage: 0, pierce: 1, proj: 'none', projSpeed: 0,
    income: { perSecond: 15 },
    upgrades: {
      path0: path5(
        U('Increased Production', 500, { incomePerSecondAdd: 8 }),
        U('Greater Production', 600, { incomePerSecondAdd: 10 }),
        U('Banana Plantation', 3000, { incomePerSecondAdd: 25 }),
        U('Banana Republic', 5000, { incomePerSecondAdd: 40 }),
        U('Banana Central', 25000, { incomePerSecondAdd: 100 })
      ),
      path1: path5(
        U('Long Life Bananas', 300, { incomePerSecondAdd: 5 }),
        U('Valuable Bananas', 800, { incomePerSecondAdd: 12 }),
        U('Monkey Bank', 3500, { incomePerSecondAdd: 20, incomePerRoundAdd: 200 }),
        U('IMF Loan', 7500, { incomePerRoundAdd: 1000 }),
        U('Monkey-Nomics', 50000, { incomePerRoundAdd: 5000 })
      ),
      path2: path5(
        U('EZ Collect', 250, { incomePerSecondAdd: 4 }),
        U('Banana Salvage', 200, { incomePerSecondAdd: 4 }),
        U('Marketplace', 2900, { incomePerSecondAdd: 18 }),
        U('Central Market', 15000, { incomePerSecondAdd: 35 }),
        U('Monkey Wall Street', 60000, { incomePerSecondAdd: 80, incomePerRoundAdd: 2000 })
      ),
    },
  });

  towers.spike_factory = tower({
    kind: 'spike_factory', name: 'Spike Factory', category: 'support', cost: 1000, color: '#888',
    radius: 140, rate: 1.4, damage: 1, pierce: 5, spikes: true, proj: 'spike', projSpeed: 320,
    upgrades: {
      path0: path5(
        U('Bigger Stacks', 600, { pierceAdd: 5 }),
        U('White Hot Spikes', 600, { flags: { canPopLead: true } }),
        U('Spiked Balls', 2300, { damageAdd: 2, pierceAdd: 5 }),
        U('Spiked Mines', 7000, { damageAdd: 4, splashRadiusAdd: 30 }),
        U('Super Mines', 30000, { damageAdd: 12, pierceAdd: 20 })
      ),
      path1: path5(
        U('Faster Production', 600, { rateMul: 0.75 }),
        U('Even Faster Production', 800, { rateMul: 0.75 }),
        U('MOAB-SHREDR Spikes', 2500, { moabBonusAdd: 8, damageAdd: 1 }),
        U('Spike Storm', 6000, { rateMul: 0.5, pierceAdd: 10 }),
        U('Carpet of Spikes', 30000, { rateMul: 0.35, pierceAdd: 20 })
      ),
      path2: path5(
        U('Long Reach', 150, { radiusAdd: 30 }),
        U('Smart Spikes', 400, { flags: { canHitCamo: true } }),
        U('Long Life Spikes', 1400, { pierceAdd: 8 }),
        U('Deadly Spikes', 3000, { damageAdd: 2, pierceAdd: 10 }),
        U('Perma-Spike', 25000, { pierceAdd: 40, damageAdd: 3 })
      ),
    },
  });

  towers.monkey_village = tower({
    kind: 'monkey_village', name: 'Monkey Village', category: 'support', cost: 1200, color: '#e84',
    radius: 160, rate: 10, damage: 0, pierce: 1, village: true, proj: 'none', projSpeed: 0, footprint: 22,
    upgrades: {
      path0: path5(
        U('Jungle Drums', 400, { auraRateMul: 0.85 }),
        U('Primary Training', 1500, { auraDamageAdd: 1 }),
        U('Primary Mentoring', 2000, { auraRadiusAdd: 20 }),
        U('Primary Expertise', 10000, { auraDamageAdd: 2, auraRateMul: 0.9 }),
        U('Monkey Town', 25000, { incomePerRoundAdd: 500 })
      ),
      path1: path5(
        U('Grow Blocker', 250, { flags: { auraRegrowBlock: true } }),
        U('Radar Scanner', 2000, { flags: { auraCamo: true } }),
        U('Monkey Intelligence Bureau', 7500, { auraDamageAdd: 1 }),
        U('Call to Arms', 20000, { auraRateMul: 0.8 }),
        U('Homeland Defense', 25000, { auraRateMul: 0.7, auraDamageAdd: 2 })
      ),
      path2: path5(
        U('Monkey Business', 500, { incomePerRoundAdd: 50 }),
        U('Monkey Commerce', 500, { incomePerRoundAdd: 75 }),
        U('Monkey Town', 10000, { incomePerRoundAdd: 300 }),
        U('Monkey City', 5000, { incomePerRoundAdd: 500 }),
        U('Monkeyopolis', 20000, { incomePerRoundAdd: 2000 })
      ),
    },
  });

  towers.engineer_monkey = tower({
    kind: 'engineer_monkey', name: 'Engineer Monkey', category: 'support', cost: 400, color: '#c87830',
    radius: 130, rate: 1.6, damage: 1, pierce: 1, engineer: true, sentryMax: 1, sentryRange: 85,
    proj: 'nail', projSpeed: 380,
    upgrades: {
      path0: path5(
        U('Sentry Gun', 500, { sentryMaxAdd: 1, rateMul: 0.9 }),
        U('Faster Engineering', 400, { sentryMaxAdd: 1, rateMul: 0.85 }),
        U('Sprockets', 550, { sentryMaxAdd: 1, damageAdd: 1, pierceAdd: 1 }),
        U('Sentry Expert', 2500, { damageAdd: 2, pierceAdd: 2, sentryRangeAdd: 25 }),
        U('Sentry Champion', 32000, { damageAdd: 5, pierceAdd: 5, sentryMaxAdd: 2 })
      ),
      path1: path5(
        U('Larger Service Area', 250, { radiusAdd: 30, sentryRangeAdd: 20 }),
        U('Deconstruction', 350, { damageAdd: 1, moabBonusAdd: 2 }),
        U('Cleansing Foam', 850, { damageAdd: 1 }),
        U('Overclock', 3500, { rateMul: 0.6 }),
        U('Ultraboost', 40000, { rateMul: 0.4, damageAdd: 3 })
      ),
      path2: path5(
        U('Double Gun', 450, { volleyAdd: 1 }),
        U('Better Engineering', 250, { pierceAdd: 1 }),
        U('Bloon Trap', 500, { damageAdd: 2 }),
        U('XXXL Trap', 3000, { damageAdd: 5, pierceAdd: 10 }),
        U('XXXL Trap+', 35000, { damageAdd: 12, pierceAdd: 30 })
      ),
    },
  });

  /* ─── Special monkeys (Arthur Games exclusives) ─── */
  towers.minecraft_monkey = tower({
    kind: 'minecraft_monkey', name: 'Minecraft Monkey', category: 'special', cost: 4500, color: '#6a4',
    radius: 120, rate: 0.55, damage: 2, pierce: 2, canPopLead: false,
    proj: 'arrow', projSpeed: 460,
    upgrades: {
      path0: path5(
        U('Iron Sword', 180, { damageAdd: 2, pierceAdd: 1, mcWeapon: 'sword' }),
        U('Bow & Arrows', 320, { damageAdd: 1, radiusAdd: 22, rateMul: 0.9, mcWeapon: 'bow' }),
        U('Diamond Axe', 680, { damageAdd: 3, splashRadiusAdd: 28, mcWeapon: 'axe' }),
        U('Netherite Blade', 2200, { damageAdd: 4, pierceAdd: 2, moabBonusAdd: 4, mcWeapon: 'netherite' }),
        U('Mace Slam', 18000, { damageAdd: 8, splashRadiusAdd: 40, moabBonusAdd: 10, mcWeapon: 'mace' })
      ),
      path1: path5(
        U('TNT Stack', 240, { damageAdd: 2, splashRadiusAdd: 32, flags: { canPopLead: true, damageTypesAdd: [D.EXPLOSIVE] }, mcWeapon: 'tnt' }),
        U('TNT Minecart', 380, { damageAdd: 2, rateMul: 0.92, mcWeapon: 'minecart' }),
        U('End Crystal', 1200, { damageAdd: 3, splashRadiusAdd: 44, moabBonusAdd: 6, mcWeapon: 'endcrystal' }),
        U('Bedrock Bomb', 3500, { damageAdd: 5, splashRadiusAdd: 55, pierceAdd: 3, mcWeapon: 'bedrock' }),
        U('Wither Storm', 42000, { damageAdd: 12, splashRadiusAdd: 80, moabBonusAdd: 20, mcWeapon: 'wither' })
      ),
      path2: path5(
        U('Trident', 200, { damageAdd: 2, pierceAdd: 3, mcWeapon: 'trident' }),
        U('Mace & Potions', 420, { damageAdd: 2, splashRadiusAdd: 20, mcWeapon: 'potion' }),
        U('Netherite Spear', 900, { damageAdd: 3, pierceAdd: 4, mcWeapon: 'spear' }),
        U('Spawn Egg', 2500, { damageAdd: 2, radiusAdd: 20, mcWeapon: 'spawnegg', flags: { mcSpawnEgg: true } }),
        U('Ender Dragon', 45000, { damageAdd: 10, pierceAdd: 8, radiusAdd: 40, moabBonusAdd: 15, mcWeapon: 'dragon', flags: { canHitCamo: true, canPopLead: true } })
      ),
    },
  });
  towers.minecraft_monkey.attack.minecraft = true;

  towers.roblox_monkey = tower({
    kind: 'roblox_monkey', name: 'Roblox Monkey', category: 'special', cost: 4000, color: '#e11',
    radius: 112, rate: 0.62, damage: 2, pierce: 1,
    proj: 'laser', projSpeed: 520,
    upgrades: {
      path0: path5(
        U('Classic Sword', 140, { damageAdd: 2, pierceAdd: 1, rbxGear: 'sword' }),
        U('Laser Gun', 280, { damageAdd: 1, radiusAdd: 18, rateMul: 0.92, rbxGear: 'laser' }),
        U('Dominus', 550, { damageAdd: 2, moabBonusAdd: 3, rbxGear: 'dominus', flags: { rbxAura: true } }),
        U('Admin Laser', 2400, { damageAdd: 4, pierceAdd: 3, radiusAdd: 25, rbxGear: 'adminlaser' }),
        U('Ban Hammer', 28000, { damageAdd: 10, splashRadiusAdd: 36, moabBonusAdd: 12, rbxGear: 'banhammer' })
      ),
      path1: path5(
        U('Obby Block', 160, { damageAdd: 1, slowDurationAdd: 0.6, rbxGear: 'obby' }),
        U('Step Stack', 300, { damageAdd: 1, rateMul: 0.9, slowDurationAdd: 0.2, rbxGear: 'steps' }),
        U('Kill Brick', 520, { damageAdd: 2, pierceAdd: 1, rbxGear: 'killbrick' }),
        U('Speed Coil Track', 2100, { damageAdd: 3, rateMul: 0.85, rbxGear: 'coil' }),
        U('Void Obby', 32000, { damageAdd: 8, pierceAdd: 4, splashRadiusAdd: 30, rbxGear: 'voidobby' })
      ),
      path2: path5(
        U('Jetpack', 150, { volleyAdd: 1, rateMul: 0.94, rbxGear: 'jetpack' }),
        U('Blox Fruit', 340, { damageAdd: 2, splashRadiusAdd: 24, rbxGear: 'fruit' }),
        U('Gear Stack', 700, { damageAdd: 2, pierceAdd: 2, volleyAdd: 1, rbxGear: 'gear' }),
        U('Forcefield', 2800, { damageAdd: 3, radiusAdd: 30, flags: { canHitCamo: true }, rbxGear: 'forcefield' }),
        U('Admin Commands', 36000, { damageAdd: 6, pierceAdd: 5, slowDurationAdd: 2.5, slowFactorAdd: -0.4, rbxGear: 'admin', flags: { canPopLead: true, rbxAdmin: true } })
      ),
    },
  });
  towers.roblox_monkey.attack.roblox = true;

  towers.rng_monkey = tower({
    kind: 'rng_monkey', name: 'RNG Monkey', category: 'special', cost: 2600, color: '#a6f',
    radius: 110, rate: 0.85, damage: 1, pierce: 1,
    proj: 'orb', projSpeed: 400,
    upgrades: {
      path0: path5(
        U('Lucky Charm', 200, { luckAdd: 2, radiusAdd: 8 }),
        U('Fortune Cookie', 350, { luckAdd: 3, damageAdd: 1 }),
        U('Loaded Dice', 700, { luckAdd: 4, pierceAdd: 1 }),
        U('Four-Leaf Clover', 2200, { luckAdd: 5, rateMul: 0.9 }),
        U('Mythic Luck', 18000, { luckAdd: 8, damageAdd: 3, pierceAdd: 2 })
      ),
      path1: path5(
        U('Coupon Book', 180, { rollDiscountAdd: 80 }),
        U('Reroll Ticket', 320, { rollDiscountAdd: 100, luckAdd: 1 }),
        U('Jackpot Sense', 650, { rollDiscountAdd: 120, damageAdd: 1 }),
        U('Double Down', 2400, { rollDiscountAdd: 150, luckAdd: 3 }),
        U('Casino King', 22000, { rollDiscountAdd: 250, luckAdd: 5, volleyAdd: 1 })
      ),
      path2: path5(
        U('Sharp Fate', 160, { damageAdd: 1, pierceAdd: 1 }),
        U('Camo Fate', 300, { flags: { canHitCamo: true }, radiusAdd: 12 }),
        U('Lead Fate', 550, { flags: { canPopLead: true }, damageAdd: 1 }),
        U('MOAB Fate', 2800, { moabBonusAdd: 6, damageAdd: 2 }),
        U('Absolute Fate', 30000, { damageAdd: 6, pierceAdd: 4, moabBonusAdd: 10, rateMul: 0.85 })
      ),
    },
  });
  towers.rng_monkey.attack.rngMonkey = true;

  /* ─── Bloon types ─── */
  function B(id, opts) {
    return Object.assign({ id: id, color: '#e44', immune: [], tags: [], children: [], camo: false }, opts);
  }

  var bloonTypes = {
    red: B('red', { rbe: 1, speed: 55, layerHp: 1, color: '#FF0033', children: [] }),
    blue: B('blue', { rbe: 2, speed: 70, layerHp: 1, color: '#0066FF', children: [{ type: 'red', count: 1 }] }),
    green: B('green', { rbe: 3, speed: 85, layerHp: 1, color: '#00CC00', children: [{ type: 'blue', count: 1 }] }),
    yellow: B('yellow', { rbe: 4, speed: 120, layerHp: 1, color: '#FFCC00', children: [{ type: 'green', count: 1 }] }),
    pink: B('pink', { rbe: 5, speed: 140, layerHp: 1, color: '#FF66CC', children: [{ type: 'yellow', count: 1 }] }),
    black: B('black', { rbe: 11, speed: 80, layerHp: 1, color: '#222', immune: [D.EXPLOSIVE], children: [{ type: 'pink', count: 2 }] }),
    white: B('white', { rbe: 11, speed: 85, layerHp: 1, color: '#eee', immune: [D.FREEZE], children: [{ type: 'pink', count: 2 }] }),
    purple: B('purple', { rbe: 11, speed: 115, layerHp: 1, color: '#a3f', immune: [D.ENERGY], children: [{ type: 'pink', count: 2 }] }),
    zebra: B('zebra', { rbe: 23, speed: 80, layerHp: 1, color: '#ccc', immune: [D.EXPLOSIVE, D.FREEZE], children: [{ type: 'black', count: 1 }, { type: 'white', count: 1 }] }),
    lead: B('lead', { rbe: 23, speed: 45, layerHp: 1, color: '#888', immune: [D.SHARP], tags: ['lead'], lead: true, children: [{ type: 'black', count: 2 }] }),
    rainbow: B('rainbow', { rbe: 47, speed: 90, layerHp: 1, color: '#f84', children: [{ type: 'zebra', count: 2 }] }),
    ceramic: B('ceramic', { rbe: 104, speed: 95, layerHp: 10, color: '#c89060', tags: ['ceramic'], children: [{ type: 'rainbow', count: 2 }] }),
    fortified_ceramic: B('fortified_ceramic', { rbe: 114, speed: 90, layerHp: 20, color: '#a87848', tags: ['ceramic', 'fortified'], fortified: true, children: [{ type: 'rainbow', count: 2 }] }),
    moab: B('moab', { rbe: 616, speed: 40, hullHp: 200, r: 22, color: '#2a78c8', blimp: true, tags: ['moab', 'blimp'], children: [{ type: 'ceramic', count: 4 }] }),
    bfb: B('bfb', { rbe: 3164, speed: 28, hullHp: 700, r: 28, color: '#c83838', blimp: true, tags: ['moab', 'blimp'], children: [{ type: 'moab', count: 4 }] }),
    zomg: B('zomg', { rbe: 16656, speed: 18, hullHp: 4000, r: 34, color: '#228838', blimp: true, tags: ['moab', 'blimp'], children: [{ type: 'bfb', count: 4 }] }),
    ddt: B('ddt', { rbe: 816, speed: 110, hullHp: 400, r: 16, color: '#1a1a1a', blimp: true, camo: true, lead: true, immune: [D.SHARP], tags: ['moab', 'blimp', 'camo', 'lead'], children: [{ type: 'ceramic', count: 4 }] }),
    bad: B('bad', { rbe: 55760, speed: 16, hullHp: 20000, r: 40, color: '#4a2060', blimp: true, tags: ['moab', 'blimp', 'bad'], children: [{ type: 'zomg', count: 2 }, { type: 'ddt', count: 3 }] }),
  };

  /* ─── Rounds 1–40 ─── */
  function G(type, count, gap, extra) {
    return Object.assign({ bloonType: type, count: count, spawnDelaySec: 0, intraGapSec: gap != null ? gap : 0.35 }, extra || {});
  }

  var rounds = {};
  rounds[1] = { roundNumber: 1, groups: [G('red', 20, 0.55)], cashBonusOnClear: 100 };
  rounds[2] = { roundNumber: 2, groups: [G('red', 35, 0.4)], cashBonusOnClear: 102 };
  rounds[3] = { roundNumber: 3, groups: [G('blue', 18, 0.45)], cashBonusOnClear: 104 };
  rounds[4] = { roundNumber: 4, groups: [G('blue', 22, 0.4), G('red', 10, 0.35, { spawnDelaySec: 0.5 })], cashBonusOnClear: 106 };
  rounds[5] = { roundNumber: 5, groups: [G('green', 14, 0.4)], cashBonusOnClear: 108 };
  rounds[6] = { roundNumber: 6, groups: [G('green', 12, 0.4, { regrow: true }), G('blue', 10, 0.35)], cashBonusOnClear: 110 };
  rounds[7] = { roundNumber: 7, groups: [G('yellow', 12, 0.35)], cashBonusOnClear: 112 };
  rounds[8] = { roundNumber: 8, groups: [G('yellow', 16, 0.3), G('green', 8, 0.35)], cashBonusOnClear: 114 };
  rounds[9] = { roundNumber: 9, groups: [G('pink', 10, 0.3)], cashBonusOnClear: 116 };
  rounds[10] = { roundNumber: 10, groups: [G('blue', 15, 0.35), G('green', 6, 0.4, { spawnDelaySec: 0.8 })], cashBonusOnClear: 118 };
  rounds[11] = { roundNumber: 11, groups: [G('black', 4, 0.5), G('pink', 12, 0.3)], cashBonusOnClear: 120 };
  rounds[12] = { roundNumber: 12, groups: [G('white', 4, 0.5), G('yellow', 20, 0.28)], cashBonusOnClear: 122 };
  rounds[13] = { roundNumber: 13, groups: [G('lead', 6, 0.55), G('red', 20, 0.25)], cashBonusOnClear: 124 };
  rounds[14] = { roundNumber: 14, groups: [G('zebra', 2, 0.6), G('pink', 20, 0.28)], cashBonusOnClear: 126 };
  rounds[15] = { roundNumber: 15, groups: [G('rainbow', 4, 0.5), G('pink', 16, 0.28)], cashBonusOnClear: 128 };
  rounds[16] = { roundNumber: 16, groups: [G('green', 30, 0.22), G('pink', 15, 0.25)], cashBonusOnClear: 130 };
  rounds[17] = { roundNumber: 17, groups: [G('black', 8, 0.4)], cashBonusOnClear: 132 };
  rounds[18] = { roundNumber: 18, groups: [G('white', 8, 0.4), G('lead', 6, 0.5)], cashBonusOnClear: 134 };
  rounds[19] = { roundNumber: 19, groups: [G('purple', 12, 0.35), G('yellow', 16, 0.28)], cashBonusOnClear: 136 };
  rounds[20] = { roundNumber: 20, groups: [G('ceramic', 6, 0.55)], cashBonusOnClear: 140 };
  rounds[21] = { roundNumber: 21, groups: [G('moab', 1, 1.2, { staggerBehindTrack: true })], cashBonusOnClear: 150 };
  rounds[22] = { roundNumber: 22, groups: [G('pink', 40, 0.18, { camo: true })], cashBonusOnClear: 145 };
  rounds[23] = { roundNumber: 23, groups: [G('pink', 40, 0.2), G('lead', 12, 0.4)], cashBonusOnClear: 148 };
  rounds[24] = { roundNumber: 24, groups: [G('zebra', 4, 0.45), G('lead', 12, 0.4)], cashBonusOnClear: 150 };
  rounds[25] = { roundNumber: 25, groups: [G('pink', 18, 0.2, { camo: true }), G('green', 12, 0.25, { camo: true })], cashBonusOnClear: 152 };
  rounds[26] = { roundNumber: 26, groups: [G('ceramic', 12, 0.4)], cashBonusOnClear: 155 };
  rounds[27] = { roundNumber: 27, groups: [G('lead', 8, 0.4, { camo: true }), G('rainbow', 3, 0.5)], cashBonusOnClear: 158 };
  rounds[28] = { roundNumber: 28, groups: [G('moab', 1, 1.2, { staggerBehindTrack: true }), G('ceramic', 8, 0.4)], cashBonusOnClear: 165 };
  rounds[29] = { roundNumber: 29, groups: [G('pink', 16, 0.2, { camo: true, regrow: true }), G('green', 14, 0.22, { camo: true, regrow: true })], cashBonusOnClear: 160 };
  rounds[30] = { roundNumber: 30, groups: [G('fortified_ceramic', 8, 0.4), G('ceramic', 10, 0.35)], cashBonusOnClear: 170 };
  rounds[31] = { roundNumber: 31, groups: [G('moab', 1, 1.4, { fortified: true, staggerBehindTrack: true })], cashBonusOnClear: 180 };
  rounds[32] = { roundNumber: 32, groups: [G('ddt', 3, 0.8, { staggerBehindTrack: true }), G('rainbow', 6, 0.35)], cashBonusOnClear: 185 };
  rounds[33] = { roundNumber: 33, groups: [G('zebra', 12, 0.3), G('ceramic', 10, 0.35)], cashBonusOnClear: 175 };
  rounds[34] = { roundNumber: 34, groups: [G('pink', 40, 0.15, { camo: true }), G('lead', 15, 0.35)], cashBonusOnClear: 180 };
  rounds[35] = { roundNumber: 35, groups: [G('ceramic', 24, 0.28)], cashBonusOnClear: 190 };
  rounds[36] = { roundNumber: 36, groups: [G('moab', 2, 1.0, { staggerBehindTrack: true }), G('fortified_ceramic', 10, 0.35)], cashBonusOnClear: 200 };
  rounds[37] = { roundNumber: 37, groups: [G('bfb', 1, 1.6, { fortified: true, staggerBehindTrack: true }), G('ceramic', 20, 0.3)], cashBonusOnClear: 220 };
  rounds[38] = { roundNumber: 38, groups: [G('ceramic', 40, 0.22), G('pink', 30, 0.15, { camo: true })], cashBonusOnClear: 210 };
  rounds[39] = { roundNumber: 39, groups: [G('bfb', 1, 1.4, { staggerBehindTrack: true }), G('ddt', 4, 0.7, { staggerBehindTrack: true }), G('moab', 1, 1.0, { staggerBehindTrack: true })], cashBonusOnClear: 240 };
  rounds[40] = {
    roundNumber: 40, cashBonusOnClear: 500,
    groups: [
      G('fortified_ceramic', 25, 0.28),
      G('rainbow', 12, 0.25, { spawnDelaySec: 1.0 }),
      G('moab', 1, 0, { spawnDelaySec: 2.5, staggerBehindTrack: true }),
      G('zomg', 1, 0, { spawnDelaySec: 4.0, staggerBehindTrack: true }),
      G('bad', 1, 0, { spawnDelaySec: 6.0, staggerBehindTrack: true }),
    ],
  };

  /* ─── Maps ─── */
  function N(x, y) { return { x: x, y: y }; }
  function P(id, nodes) { return { pathId: id || 'main', nodes: nodes }; }
  function Obs(x, y, w, h) { return { x: x, y: y, w: w, h: h, tags: ['blocks_placement'] }; }
  function makeMap(opts) {
    return {
      mapId: opts.id,
      displayName: opts.name,
      difficulty: opts.diff || 'beginner',
      width: 960,
      height: 640,
      startCash: opts.cash != null ? opts.cash : 650,
      startLives: opts.lives != null ? opts.lives : 150,
      theme: opts.theme || null,
      water: opts.water || null,
      waters: opts.waters || null,
      obstacles: opts.obstacles || [],
      paths: opts.paths,
      desc: opts.desc || '',
    };
  }

  var maps = {};

  /* Beginner */
  maps.monkey_meadow = makeMap({
    id: 'monkey_meadow', name: 'Monkey Meadow', diff: 'beginner', theme: 'grass',
    desc: 'Classic winding path with a pond.',
    water: { x: 720, y: 420, rx: 90, ry: 55 },
    obstacles: [Obs(480, 120, 70, 50), Obs(220, 480, 50, 50)],
    paths: [P('main', [N(-20, 320), N(140, 320), N(140, 140), N(340, 140), N(340, 420), N(560, 420), N(560, 200), N(780, 200), N(780, 480), N(980, 480)])],
  });
  maps.tree_stump = makeMap({
    id: 'tree_stump', name: 'Tree Stump', diff: 'beginner', theme: 'forest',
    desc: 'Bloons spiral around a giant stump.',
    obstacles: [Obs(480, 320, 120, 120)],
    paths: [P('main', [N(-20, 160), N(200, 160), N(200, 480), N(760, 480), N(760, 160), N(400, 160), N(400, 360), N(600, 360), N(600, 240), N(980, 240)])],
  });
  maps.town_center = makeMap({
    id: 'town_center', name: 'Town Center', diff: 'beginner', theme: 'town',
    desc: 'Plaza streets with fountain water.',
    water: { x: 480, y: 320, rx: 55, ry: 55 },
    obstacles: [Obs(200, 200, 60, 60), Obs(760, 200, 60, 60), Obs(200, 440, 60, 60), Obs(760, 440, 60, 60)],
    paths: [P('main', [N(-20, 100), N(480, 100), N(480, 540), N(980, 540)])],
  });
  maps.scrapyard = makeMap({
    id: 'scrapyard', name: 'Scrapyard', diff: 'beginner', theme: 'scrap',
    desc: 'Junk piles force tight placement.',
    obstacles: [Obs(300, 200, 80, 50), Obs(500, 400, 90, 55), Obs(700, 180, 70, 70)],
    paths: [P('main', [N(-20, 480), N(180, 480), N(180, 120), N(420, 120), N(420, 500), N(680, 500), N(680, 200), N(980, 200)])],
  });
  maps.the_cabin = makeMap({
    id: 'the_cabin', name: 'The Cabin', diff: 'beginner', theme: 'forest',
    desc: 'Cozy woods with a lakeside cabin.',
    water: { x: 780, y: 480, rx: 100, ry: 60 },
    obstacles: [Obs(480, 280, 100, 70)],
    paths: [P('main', [N(-20, 200), N(280, 200), N(280, 420), N(560, 420), N(560, 120), N(820, 120), N(820, 320), N(980, 320)])],
  });
  maps.resort = makeMap({
    id: 'resort', name: 'Resort', diff: 'beginner', theme: 'beach',
    desc: 'Beach resort with a big swimming pool.',
    water: { x: 480, y: 300, rx: 140, ry: 80 },
    paths: [P('main', [N(-20, 520), N(200, 520), N(200, 80), N(760, 80), N(760, 520), N(980, 520)])],
  });
  maps.lotus_island = makeMap({
    id: 'lotus_island', name: 'Lotus Island', diff: 'beginner', theme: 'lotus',
    desc: 'Island ring with lotus ponds.',
    waters: [{ x: 240, y: 200, rx: 50, ry: 40 }, { x: 720, y: 440, rx: 55, ry: 42 }],
    water: { x: 480, y: 320, rx: 70, ry: 50 },
    paths: [P('main', [N(-20, 320), N(160, 320), N(160, 100), N(800, 100), N(800, 540), N(160, 540), N(160, 400), N(640, 400), N(640, 220), N(980, 220)])],
  });
  maps.candy_falls = makeMap({
    id: 'candy_falls', name: 'Candy Falls', diff: 'beginner', theme: 'candy',
    desc: 'Sweet zig-zag down the falls.',
    water: { x: 700, y: 180, rx: 80, ry: 50 },
    paths: [P('main', [N(200, -20), N(200, 160), N(480, 160), N(480, 320), N(200, 320), N(200, 480), N(700, 480), N(700, 320), N(980, 320)])],
  });
  maps.winter_park = makeMap({
    id: 'winter_park', name: 'Winter Park', diff: 'beginner', theme: 'snow',
    desc: 'Icy lanes through a snow park.',
    water: { x: 480, y: 480, rx: 90, ry: 40 },
    obstacles: [Obs(320, 240, 50, 50), Obs(640, 240, 50, 50)],
    paths: [P('main', [N(-20, 120), N(320, 120), N(320, 400), N(640, 400), N(640, 120), N(980, 120)])],
  });
  maps.carved = makeMap({
    id: 'carved', name: 'Carved', diff: 'beginner', theme: 'pumpkin',
    desc: 'Halloween pumpkin patch path.',
    obstacles: [Obs(480, 320, 90, 90)],
    paths: [P('main', [N(-20, 480), N(240, 480), N(240, 160), N(720, 160), N(720, 480), N(980, 480)])],
  });
  maps.park_path = makeMap({
    id: 'park_path', name: 'Park Path', diff: 'beginner', theme: 'grass',
    desc: 'Gentle park loops.',
    obstacles: [Obs(480, 200, 60, 40), Obs(480, 440, 60, 40)],
    paths: [P('main', [N(-20, 320), N(200, 320), N(200, 120), N(480, 120), N(480, 520), N(760, 520), N(760, 200), N(980, 200)])],
  });
  maps.alpine_run = makeMap({
    id: 'alpine_run', name: 'Alpine Run', diff: 'beginner', theme: 'snow',
    desc: 'Mountain switchbacks.',
    paths: [P('main', [N(100, -20), N(100, 200), N(400, 200), N(400, 400), N(700, 400), N(700, 120), N(980, 120)])],
  });
  maps.frozen_over = makeMap({
    id: 'frozen_over', name: 'Frozen Over', diff: 'beginner', theme: 'ice',
    desc: 'Frozen lake with a thin track.',
    water: { x: 480, y: 320, rx: 160, ry: 100 },
    paths: [P('main', [N(-20, 100), N(860, 100), N(860, 540), N(100, 540), N(100, 220), N(700, 220), N(700, 400), N(980, 400)])],
  });
  maps.in_the_loop = makeMap({
    id: 'in_the_loop', name: 'In the Loop', diff: 'beginner', theme: 'grass',
    desc: 'Two entrances merge into one exit.',
    water: { x: 480, y: 320, rx: 60, ry: 45 },
    paths: [
      P('north', [N(-20, 120), N(400, 120), N(400, 320), N(700, 320), N(700, 480), N(980, 480)]),
      P('south', [N(-20, 520), N(400, 520), N(400, 320), N(700, 320), N(700, 480), N(980, 480)]),
    ],
  });
  maps.logs = makeMap({
    id: 'logs', name: 'Logs', diff: 'beginner', theme: 'forest',
    desc: 'Log piles block the middle.',
    obstacles: [Obs(360, 280, 100, 40), Obs(560, 360, 100, 40)],
    paths: [P('main', [N(-20, 160), N(280, 160), N(280, 480), N(680, 480), N(680, 160), N(980, 160)])],
  });
  maps.cubism = makeMap({
    id: 'cubism', name: 'Cubism', diff: 'beginner', theme: 'abstract',
    desc: 'Blocky right-angle art path.',
    paths: [P('main', [N(-20, 80), N(200, 80), N(200, 280), N(480, 280), N(480, 80), N(760, 80), N(760, 480), N(200, 480), N(200, 560), N(980, 560)])],
  });
  maps.balance = makeMap({
    id: 'balance', name: 'Balance', diff: 'beginner', theme: 'zen',
    desc: 'Symmetric yin-yang lanes.',
    water: { x: 480, y: 320, rx: 80, ry: 80 },
    paths: [
      P('left', [N(-20, 200), N(300, 200), N(300, 480), N(480, 480), N(480, 200), N(980, 200)]),
      P('right', [N(-20, 440), N(300, 440), N(300, 160), N(480, 160), N(480, 440), N(980, 440)]),
    ],
  });
  maps.quiet_street = makeMap({
    id: 'quiet_street', name: 'Quiet Street', diff: 'beginner', theme: 'town',
    desc: 'Suburban S-curve.',
    obstacles: [Obs(240, 240, 50, 80), Obs(720, 400, 50, 80)],
    paths: [P('main', [N(-20, 320), N(180, 320), N(180, 140), N(480, 140), N(480, 500), N(780, 500), N(780, 280), N(980, 280)])],
  });
  maps.hedge = makeMap({
    id: 'hedge', name: 'Hedge', diff: 'beginner', theme: 'garden',
    desc: 'Garden hedges form a maze.',
    obstacles: [Obs(300, 200, 40, 160), Obs(500, 280, 40, 160), Obs(700, 200, 40, 160)],
    paths: [P('main', [N(-20, 100), N(400, 100), N(400, 540), N(600, 540), N(600, 100), N(980, 100)])],
  });
  maps.end_of_the_road = makeMap({
    id: 'end_of_the_road', name: 'End of the Road', diff: 'beginner', theme: 'desert',
    desc: 'Long desert highway with a rest-stop pond.',
    water: { x: 480, y: 200, rx: 70, ry: 45 },
    paths: [P('main', [N(-20, 480), N(960, 480), N(960, 160), N(200, 160), N(200, 360), N(700, 360), N(700, 240), N(980, 240)])],
  });
  maps.snake_river = makeMap({
    id: 'snake_river', name: 'Snake River', diff: 'beginner', theme: 'river',
    desc: 'Long serpentine bends.',
    water: { x: 480, y: 300, rx: 50, ry: 120 },
    paths: [P('main', [N(-20, 320), N(100, 320), N(100, 80), N(300, 80), N(300, 540), N(500, 540), N(500, 140), N(700, 140), N(700, 460), N(880, 460), N(880, 240), N(980, 240)])],
  });
  maps.tower_arena = makeMap({
    id: 'tower_arena', name: 'Tower Arena', diff: 'beginner', theme: 'arena', cash: 700,
    desc: 'Wide open arena — room for every monkey.',
    water: { x: 540, y: 300, rx: 72, ry: 48 },
    paths: [P('main', [N(-20, 420), N(180, 420), N(180, 140), N(420, 140), N(420, 480), N(680, 480), N(680, 100), N(900, 100), N(900, 320), N(980, 320)])],
  });

  /* Intermediate */
  maps.cascade_falls = makeMap({
    id: 'cascade_falls', name: 'Cascade Falls', diff: 'intermediate', theme: 'falls',
    desc: 'Stair-step drops with a central pond.',
    water: { x: 560, y: 220, rx: 110, ry: 70 },
    paths: [P('main', [N(-20, 500), N(160, 500), N(160, 280), N(360, 280), N(360, 100), N(560, 100), N(560, 360), N(760, 360), N(760, 540), N(980, 540)])],
  });
  maps.middle_of_the_road = makeMap({
    id: 'middle_of_the_road', name: 'Middle of the Road', diff: 'intermediate', theme: 'town',
    desc: 'Crossroads — coverage is everything.',
    obstacles: [Obs(480, 320, 80, 80)],
    paths: [
      P('h', [N(-20, 320), N(980, 320)]),
      P('v', [N(480, -20), N(480, 660)]),
    ],
  });
  maps.one_two_tree = makeMap({
    id: 'one_two_tree', name: 'One Two Tree', diff: 'intermediate', theme: 'forest',
    desc: 'Three tree islands split the track.',
    obstacles: [Obs(240, 320, 70, 70), Obs(480, 200, 70, 70), Obs(720, 400, 70, 70)],
    paths: [P('main', [N(-20, 100), N(360, 100), N(360, 500), N(600, 500), N(600, 100), N(980, 100)])],
  });
  maps.crater = makeMap({
    id: 'crater', name: 'Crater', diff: 'intermediate', theme: 'lava',
    desc: 'Volcanic crater rim path.',
    water: { x: 480, y: 320, rx: 100, ry: 100 },
    paths: [P('main', [N(-20, 80), N(800, 80), N(800, 560), N(160, 560), N(160, 200), N(640, 200), N(640, 440), N(980, 440)])],
  });
  maps.streambed = makeMap({
    id: 'streambed', name: 'Streambed', diff: 'intermediate', theme: 'river',
    desc: 'Winding creek with water placement.',
    water: { x: 400, y: 320, rx: 40, ry: 180 },
    paths: [P('main', [N(100, -20), N(100, 560), N(300, 560), N(300, 80), N(560, 80), N(560, 560), N(800, 560), N(800, 200), N(980, 200)])],
  });
  maps.chutes = makeMap({
    id: 'chutes', name: 'Chutes', diff: 'intermediate', theme: 'industrial',
    desc: 'Fast chute drops — short track time.',
    cash: 700,
    paths: [P('main', [N(200, -20), N(200, 200), N(480, 200), N(480, 400), N(760, 400), N(760, 200), N(980, 200)])],
  });
  maps.spillway = makeMap({
    id: 'spillway', name: 'Spillway', diff: 'intermediate', theme: 'industrial',
    desc: 'Dam spillway with wide water.',
    water: { x: 480, y: 400, rx: 200, ry: 70 },
    paths: [P('main', [N(-20, 120), N(300, 120), N(300, 300), N(700, 300), N(700, 120), N(980, 120)])],
  });
  maps.pats_pond = makeMap({
    id: 'pats_pond', name: 'Pat\'s Pond', diff: 'intermediate', theme: 'pond',
    desc: 'Big pond — water towers shine.',
    water: { x: 480, y: 320, rx: 180, ry: 140 },
    paths: [P('main', [N(-20, 80), N(200, 80), N(200, 560), N(760, 560), N(760, 80), N(980, 80)])],
  });
  maps.peninsula = makeMap({
    id: 'peninsula', name: 'Peninsula', diff: 'intermediate', theme: 'beach',
    desc: 'Coastal peninsula with ocean water.',
    water: { x: 700, y: 400, rx: 180, ry: 140 },
    paths: [P('main', [N(-20, 200), N(400, 200), N(400, 480), N(200, 480), N(200, 100), N(600, 100), N(600, 300), N(980, 300)])],
  });
  maps.high_finance = makeMap({
    id: 'high_finance', name: 'High Finance', diff: 'intermediate', theme: 'city',
    desc: 'Skyscraper rooftops and ledges.',
    obstacles: [Obs(240, 200, 80, 120), Obs(480, 360, 80, 120), Obs(720, 200, 80, 120)],
    paths: [P('main', [N(-20, 500), N(360, 500), N(360, 140), N(600, 140), N(600, 500), N(980, 500)])],
  });
  maps.another_brick = makeMap({
    id: 'another_brick', name: 'Another Brick', diff: 'intermediate', theme: 'brick',
    desc: 'Brick walls force lane choices.',
    obstacles: [Obs(320, 160, 40, 200), Obs(520, 280, 40, 200), Obs(720, 160, 40, 200)],
    paths: [P('main', [N(-20, 80), N(420, 80), N(420, 560), N(620, 560), N(620, 80), N(980, 80)])],
  });
  maps.off_the_coast = makeMap({
    id: 'off_the_coast', name: 'Off the Coast', diff: 'intermediate', theme: 'ocean',
    desc: 'Island hopping over open water.',
    water: { x: 480, y: 320, rx: 280, ry: 180 },
    paths: [P('main', [N(-20, 320), N(160, 320), N(160, 140), N(400, 140), N(400, 500), N(640, 500), N(640, 140), N(880, 140), N(880, 400), N(980, 400)])],
  });
  maps.cornfield = makeMap({
    id: 'cornfield', name: 'Cornfield', diff: 'intermediate', theme: 'farm',
    desc: 'Corn obstacles hide sightlines.',
    obstacles: [Obs(280, 240, 50, 90), Obs(400, 360, 50, 90), Obs(560, 240, 50, 90), Obs(680, 360, 50, 90)],
    paths: [P('main', [N(-20, 480), N(200, 480), N(200, 120), N(760, 120), N(760, 480), N(980, 480)])],
  });
  maps.underground = makeMap({
    id: 'underground', name: 'Underground', diff: 'intermediate', theme: 'cave',
    desc: 'Cave tunnels with tight corners.',
    obstacles: [Obs(480, 320, 140, 60)],
    paths: [P('main', [N(-20, 100), N(240, 100), N(240, 500), N(480, 500), N(480, 100), N(720, 100), N(720, 500), N(980, 500)])],
  });
  maps.bamboo_loop = makeMap({
    id: 'bamboo_loop', name: 'Bamboo Loop', diff: 'intermediate', theme: 'bamboo',
    desc: 'Bloons loop the grove before escaping.',
    obstacles: [Obs(300, 320, 60, 60)],
    paths: [P('main', [N(-20, 320), N(100, 320), N(100, 100), N(420, 100), N(420, 520), N(100, 520), N(100, 320), N(240, 320), N(240, 200), N(320, 200), N(320, 420), N(240, 420), N(240, 320), N(640, 320), N(980, 320)])],
  });
  maps.firing_range = makeMap({
    id: 'firing_range', name: 'Firing Range', diff: 'intermediate', theme: 'military',
    desc: 'Military range — long sightlines.',
    obstacles: [Obs(480, 200, 100, 40), Obs(480, 440, 100, 40)],
    paths: [P('main', [N(-20, 160), N(700, 160), N(700, 480), N(200, 480), N(200, 300), N(980, 300)])],
  });
  maps.encrypted = makeMap({
    id: 'encrypted', name: 'Encrypted', diff: 'intermediate', theme: 'cyber',
    desc: 'Digital grid with dual data lanes.',
    paths: [
      P('a', [N(-20, 160), N(480, 160), N(480, 480), N(980, 480)]),
      P('b', [N(-20, 480), N(480, 480), N(480, 160), N(980, 160)]),
    ],
  });

  /* Advanced */
  maps.moab_alley = makeMap({
    id: 'moab_alley', name: 'MOAB Alley', diff: 'advanced', theme: 'city', cash: 750,
    desc: 'Short, fast route — MOABs leak quick.',
    paths: [P('main', [N(-20, 320), N(220, 320), N(220, 140), N(480, 140), N(480, 480), N(720, 480), N(720, 320), N(980, 320)])],
  });
  maps.mesa = makeMap({
    id: 'mesa', name: 'Mesa', diff: 'advanced', theme: 'desert',
    desc: 'Desert mesa with sparse water.',
    water: { x: 200, y: 480, rx: 70, ry: 40 },
    obstacles: [Obs(480, 280, 120, 50)],
    paths: [P('main', [N(-20, 100), N(600, 100), N(600, 500), N(300, 500), N(300, 250), N(800, 250), N(800, 500), N(980, 500)])],
  });
  maps.x_factor = makeMap({
    id: 'x_factor', name: 'X Factor', diff: 'advanced', theme: 'abstract',
    desc: 'X-crossing dual paths.',
    paths: [
      P('nw_se', [N(-20, 80), N(980, 560)]),
      P('sw_ne', [N(-20, 560), N(980, 80)]),
    ],
  });
  maps.geared = makeMap({
    id: 'geared', name: 'Geared', diff: 'advanced', theme: 'industrial',
    desc: 'Gear-shaped spiral.',
    obstacles: [Obs(480, 320, 80, 80)],
    paths: [P('main', [N(-20, 320), N(200, 320), N(200, 120), N(760, 120), N(760, 520), N(200, 520), N(200, 400), N(600, 400), N(600, 240), N(360, 240), N(360, 400), N(980, 400)])],
  });
  maps.sanctuary = makeMap({
    id: 'sanctuary', name: 'Sanctuary', diff: 'advanced', theme: 'temple',
    desc: 'Temple grounds with sacred pools.',
    waters: [{ x: 240, y: 200, rx: 55, ry: 40 }, { x: 720, y: 440, rx: 55, ry: 40 }],
    water: { x: 480, y: 320, rx: 50, ry: 50 },
    paths: [P('main', [N(-20, 80), N(480, 80), N(480, 560), N(200, 560), N(200, 200), N(760, 200), N(760, 560), N(980, 560)])],
  });
  maps.flooded_valley = makeMap({
    id: 'flooded_valley', name: 'Flooded Valley', diff: 'advanced', theme: 'flood',
    desc: 'Most of the map is water.',
    water: { x: 480, y: 340, rx: 320, ry: 200 },
    paths: [P('main', [N(-20, 80), N(200, 80), N(200, 200), N(760, 200), N(760, 80), N(900, 80), N(900, 560), N(100, 560), N(100, 400), N(980, 400)])],
  });
  maps.bloody_puddles = makeMap({
    id: 'bloody_puddles', name: 'Bloody Puddles', diff: 'advanced', theme: 'swamp', cash: 800,
    desc: 'Swamp puddles and a brutal track.',
    waters: [{ x: 280, y: 200, rx: 60, ry: 40 }, { x: 680, y: 440, rx: 70, ry: 45 }],
    water: { x: 480, y: 320, rx: 50, ry: 35 },
    paths: [P('main', [N(-20, 500), N(160, 500), N(160, 100), N(400, 100), N(400, 500), N(640, 500), N(640, 100), N(880, 100), N(880, 500), N(980, 500)])],
  });
  maps.workshop = makeMap({
    id: 'workshop', name: 'Workshop', diff: 'advanced', theme: 'industrial',
    desc: 'Conveyor-belt style factory floor.',
    obstacles: [Obs(360, 240, 60, 160), Obs(600, 240, 60, 160)],
    paths: [P('main', [N(-20, 160), N(280, 160), N(280, 480), N(480, 480), N(480, 160), N(680, 160), N(680, 480), N(980, 480)])],
  });
  maps.quad = makeMap({
    id: 'quad', name: 'Quad', diff: 'advanced', theme: 'arena', cash: 800,
    desc: 'Four entrances — defend every side.',
    water: { x: 480, y: 320, rx: 55, ry: 55 },
    paths: [
      P('w', [N(-20, 320), N(480, 320), N(480, 80), N(980, 80)]),
      P('e', [N(980, 320), N(480, 320), N(480, 560), N(-20, 560)]),
      P('n', [N(480, -20), N(480, 320), N(800, 320), N(800, 660)]),
      P('s', [N(480, 660), N(480, 320), N(160, 320), N(160, -20)]),
    ],
  });
  maps.dark_dungeons = makeMap({
    id: 'dark_dungeons', name: 'Dark Dungeons', diff: 'advanced', theme: 'dungeon',
    desc: 'Torch-lit dungeon corridors.',
    obstacles: [Obs(300, 200, 50, 100), Obs(500, 360, 50, 100), Obs(700, 200, 50, 100)],
    paths: [P('main', [N(-20, 80), N(200, 80), N(200, 560), N(400, 560), N(400, 80), N(600, 80), N(600, 560), N(800, 560), N(800, 80), N(980, 80)])],
  });

  /* Expert */
  maps.dark_castle = makeMap({
    id: 'dark_castle', name: 'Dark Castle', diff: 'expert', theme: 'castle', cash: 850, lives: 100,
    desc: 'Moat and battlements — expert only.',
    water: { x: 480, y: 480, rx: 220, ry: 60 },
    obstacles: [Obs(480, 200, 140, 80)],
    paths: [P('main', [N(-20, 120), N(200, 120), N(200, 400), N(400, 400), N(400, 120), N(760, 120), N(760, 400), N(560, 400), N(560, 280), N(980, 280)])],
  });
  maps.ouch = makeMap({
    id: 'ouch', name: '#Ouch', diff: 'expert', theme: 'lava', cash: 900, lives: 100,
    desc: 'Brutal multi-lane expert track.',
    water: { x: 480, y: 320, rx: 40, ry: 40 },
    paths: [
      P('a', [N(-20, 100), N(300, 100), N(300, 540), N(660, 540), N(660, 100), N(980, 100)]),
      P('b', [N(-20, 540), N(300, 540), N(300, 100), N(660, 100), N(660, 540), N(980, 540)]),
    ],
  });
  maps.muddy_puddles = makeMap({
    id: 'muddy_puddles', name: 'Muddy Puddles', diff: 'expert', theme: 'mud', cash: 900, lives: 100,
    desc: 'Four muddy lanes — nightmare coverage.',
    waters: [{ x: 240, y: 200, rx: 45, ry: 35 }, { x: 720, y: 200, rx: 45, ry: 35 }, { x: 240, y: 440, rx: 45, ry: 35 }, { x: 720, y: 440, rx: 45, ry: 35 }],
    paths: [
      P('1', [N(-20, 120), N(980, 120)]),
      P('2', [N(-20, 260), N(980, 260)]),
      P('3', [N(-20, 400), N(980, 400)]),
      P('4', [N(-20, 540), N(980, 540)]),
    ],
  });
  maps.ravine = makeMap({
    id: 'ravine', name: 'Ravine', diff: 'expert', theme: 'canyon', cash: 850, lives: 100,
    desc: 'Deep canyon with dual cliff paths.',
    water: { x: 480, y: 320, rx: 60, ry: 200 },
    paths: [
      P('north', [N(-20, 100), N(400, 100), N(400, 280), N(600, 280), N(600, 100), N(980, 100)]),
      P('south', [N(-20, 540), N(400, 540), N(400, 360), N(600, 360), N(600, 540), N(980, 540)]),
    ],
  });
  maps.infernal = makeMap({
    id: 'infernal', name: 'Infernal', diff: 'expert', theme: 'lava', cash: 900, lives: 100,
    desc: 'Lava rings — place carefully.',
    water: { x: 480, y: 320, rx: 90, ry: 90 },
    obstacles: [Obs(200, 200, 50, 50), Obs(760, 200, 50, 50), Obs(200, 440, 50, 50), Obs(760, 440, 50, 50)],
    paths: [P('main', [N(-20, 80), N(880, 80), N(880, 560), N(80, 560), N(80, 160), N(780, 160), N(780, 480), N(180, 480), N(180, 280), N(980, 280)])],
  });
  maps.quarry = makeMap({
    id: 'quarry', name: 'Quarry', diff: 'expert', theme: 'stone', cash: 850, lives: 100,
    desc: 'Stone quarry with deep pits.',
    obstacles: [Obs(360, 280, 100, 80), Obs(600, 360, 100, 80)],
    water: { x: 480, y: 500, rx: 80, ry: 40 },
    paths: [P('main', [N(-20, 200), N(240, 200), N(240, 100), N(720, 100), N(720, 500), N(240, 500), N(240, 360), N(520, 360), N(520, 200), N(980, 200)])],
  });
  maps.covered_garden = makeMap({
    id: 'covered_garden', name: 'Covered Garden', diff: 'expert', theme: 'garden', cash: 850, lives: 100,
    desc: 'Greenhouse maze — expert hedges.',
    obstacles: [Obs(280, 200, 40, 240), Obs(440, 200, 40, 240), Obs(600, 200, 40, 240), Obs(760, 200, 40, 240)],
    water: { x: 480, y: 500, rx: 100, ry: 40 },
    paths: [P('main', [N(-20, 80), N(360, 80), N(360, 560), N(520, 560), N(520, 80), N(680, 80), N(680, 560), N(840, 560), N(840, 200), N(980, 200)])],
  });
  maps.bloontonium_lab = makeMap({
    id: 'bloontonium_lab', name: 'Bloontonium Lab', diff: 'expert', theme: 'lab', cash: 900, lives: 100,
    desc: 'Hazardous lab with dual coolant pipes.',
    water: { x: 480, y: 320, rx: 70, ry: 70 },
    obstacles: [Obs(300, 180, 60, 60), Obs(660, 460, 60, 60)],
    paths: [
      P('cool', [N(-20, 140), N(360, 140), N(360, 500), N(700, 500), N(700, 140), N(980, 140)]),
      P('hot', [N(-20, 500), N(360, 500), N(360, 140), N(700, 140), N(700, 500), N(980, 500)]),
    ],
  });

  var buyBar = {
    categories: [
      {
        id: 'primary', label: 'Primary', tabHotkey: '1',
        slots: [
          { kind: 'dart_monkey', hotkey: 'Q', cost: 200 },
          { kind: 'boomerang_monkey', hotkey: 'W', cost: 325 },
          { kind: 'bomb_shooter', hotkey: 'E', cost: 525 },
          { kind: 'tack_shooter', hotkey: 'R', cost: 280 },
          { kind: 'ice_monkey', hotkey: 'T', cost: 500 },
          { kind: 'glue_gunner', hotkey: 'Y', cost: 275 },
        ],
      },
      {
        id: 'military', label: 'Military', tabHotkey: '2',
        slots: [
          { kind: 'sniper_monkey', hotkey: 'Q', cost: 350 },
          { kind: 'monkey_sub', hotkey: 'W', cost: 325 },
          { kind: 'monkey_buccaneer', hotkey: 'E', cost: 500 },
          { kind: 'monkey_ace', hotkey: 'R', cost: 800 },
          { kind: 'heli_pilot', hotkey: 'T', cost: 1600 },
          { kind: 'mortar_monkey', hotkey: 'Y', cost: 750 },
          { kind: 'dartling_gunner', hotkey: 'U', cost: 850 },
        ],
      },
      {
        id: 'magic', label: 'Magic', tabHotkey: '3',
        slots: [
          { kind: 'wizard_monkey', hotkey: 'Q', cost: 400 },
          { kind: 'super_monkey', hotkey: 'W', cost: 2500 },
          { kind: 'ninja_monkey', hotkey: 'E', cost: 500 },
          { kind: 'alchemist', hotkey: 'R', cost: 550 },
          { kind: 'druid', hotkey: 'T', cost: 400 },
        ],
      },
      {
        id: 'support', label: 'Support', tabHotkey: '4',
        slots: [
          { kind: 'banana_farm', hotkey: 'Q', cost: 1250 },
          { kind: 'spike_factory', hotkey: 'W', cost: 1000 },
          { kind: 'monkey_village', hotkey: 'E', cost: 1200 },
          { kind: 'engineer_monkey', hotkey: 'R', cost: 400 },
        ],
      },
      {
        id: 'special', label: 'Special', tabHotkey: '5',
        slots: [
          { kind: 'minecraft_monkey', hotkey: 'Q', cost: 4500 },
          { kind: 'roblox_monkey', hotkey: 'W', cost: 4000 },
          { kind: 'rng_monkey', hotkey: 'E', cost: 2600 },
        ],
      },
    ],
  };

  var knowledgeNodes = [
    /* —— Starter / Global —— */
    { id: 'more_cash', name: 'More Cash', branch: 'Global', desc: '+100 starting cash on every game.', cost: 1, effect: { startCashAdd: 100 } },
    { id: 'tough_lives', name: 'Tough Lives', branch: 'Global', desc: '+25 starting lives.', cost: 1, effect: { startLivesAdd: 25 } },
    { id: 'big_pockets', name: 'Big Pockets', branch: 'Global', desc: '+200 starting cash.', cost: 2, requires: ['more_cash'], effect: { startCashAdd: 200 } },
    { id: 'iron_will', name: 'Iron Will', branch: 'Global', desc: '+50 starting lives.', cost: 2, requires: ['tough_lives'], effect: { startLivesAdd: 50 } },
    { id: 'veteran_ops', name: 'Veteran Ops', branch: 'Global', desc: '+1 damage on all towers.', cost: 3, effect: { damageAdd: 1 } },
    { id: 'eagle_eye', name: 'Eagle Eye', branch: 'Global', desc: '+15 range on all towers.', cost: 2, effect: { radiusAdd: 15 } },
    { id: 'quick_hands', name: 'Quick Hands', branch: 'Global', desc: 'All towers attack 10% faster.', cost: 3, effect: { rateMul: 0.9 } },
    { id: 'sharper_shots', name: 'Sharper Shots', branch: 'Global', desc: '+1 pierce on all towers.', cost: 2, effect: { pierceAdd: 1 } },
    { id: 'camo_radar', name: 'Camo Radar', branch: 'Global', desc: 'All towers can detect camo.', cost: 4, requires: ['eagle_eye'], effect: { camoAll: true } },
    { id: 'heat_tips', name: 'Heat Tips', branch: 'Global', desc: 'All towers can pop Lead.', cost: 4, requires: ['veteran_ops'], effect: { leadAll: true } },
    { id: 'bargain_bin', name: 'Bargain Bin', branch: 'Global', desc: 'All tower purchases cost $20 less.', cost: 2, effect: { allTowerDiscount: 20 } },
    { id: 'smart_shopper', name: 'Smart Shopper', branch: 'Global', desc: 'Upgrades cost 10% less.', cost: 3, requires: ['bargain_bin'], effect: { upgradeDiscountMul: 0.9 } },
    { id: 'recycle', name: 'Recycle', branch: 'Global', desc: 'Sell refunds 80% instead of 70%.', cost: 2, effect: { sellRate: 0.8 } },
    { id: 'round_bonus', name: 'End-of-Round Bonus', branch: 'Global', desc: '+50 cash every round cleared.', cost: 2, effect: { roundCashAdd: 50 } },
    { id: 'knowledge_hustle', name: 'Skill Hustle', branch: 'Global', desc: '+1 bonus SP every 5 rounds (stacks with base).', cost: 3, effect: { kpEvery5Add: 1 } },

    /* —— Primary —— */
    { id: 'cheap_darts', name: 'Cheap Darts', branch: 'Primary', desc: 'Dart Monkey costs $25 less.', cost: 1, effect: { towerDiscount: { dart_monkey: 25 } } },
    { id: 'dart_training', name: 'Dart Training', branch: 'Primary', desc: 'Dart Monkeys gain +1 pierce.', cost: 1, requires: ['cheap_darts'], effect: { kindPierceAdd: { dart_monkey: 1 } } },
    { id: 'boomerang_budget', name: 'Boomerang Budget', branch: 'Primary', desc: 'Boomerang Monkey costs $40 less.', cost: 1, effect: { towerDiscount: { boomerang_monkey: 40 } } },
    { id: 'tack_swarm', name: 'Tack Swarm', branch: 'Primary', desc: 'Tack Shooter attacks 15% faster.', cost: 2, effect: { kindRateMul: { tack_shooter: 0.85 } } },
    { id: 'bomb_blast', name: 'Bigger Blasts', branch: 'Primary', desc: 'Bomb Shooter splash +15.', cost: 2, effect: { kindSplashAdd: { bomb_shooter: 15 } } },
    { id: 'ice_age', name: 'Ice Age', branch: 'Primary', desc: 'Ice Monkey freeze lasts +0.6s.', cost: 2, effect: { iceSlowAdd: 0.6 } },
    { id: 'sticky_situation', name: 'Sticky Situation', branch: 'Primary', desc: 'Glue Gunner slows harder (factor −0.1).', cost: 2, effect: { glueSlowFactorAdd: -0.1 } },
    { id: 'primary_pro', name: 'Primary Pro', branch: 'Primary', desc: 'All Primary towers cost $35 less.', cost: 3, requires: ['cheap_darts'], effect: { categoryDiscount: { primary: 35 } } },

    /* —— Military —— */
    { id: 'military_intel', name: 'Military Intel', branch: 'Military', desc: 'All Military towers detect camo.', cost: 2, effect: { militaryCamo: true } },
    { id: 'sniper_scope', name: 'Sniper Scope', branch: 'Military', desc: 'Sniper deals +2 damage.', cost: 2, effect: { kindDamageAdd: { sniper_monkey: 2 } } },
    { id: 'submerged', name: 'Submerged', branch: 'Military', desc: 'Monkey Sub costs $50 less.', cost: 1, effect: { towerDiscount: { monkey_sub: 50 } } },
    { id: 'air_support', name: 'Air Support', branch: 'Military', desc: 'Monkey Ace & Heli gain +1 pierce.', cost: 2, effect: { kindPierceAdd: { monkey_ace: 1, heli_pilot: 1 } } },
    { id: 'mortar_marksman', name: 'Mortar Marksman', branch: 'Military', desc: 'Mortar splash +20.', cost: 2, effect: { kindSplashAdd: { mortar_monkey: 20 } } },
    { id: 'military_discount', name: 'Military Discount', branch: 'Military', desc: 'All Military towers cost $40 less.', cost: 3, requires: ['military_intel'], effect: { categoryDiscount: { military: 40 } } },

    /* —— Magic —— */
    { id: 'mana_shield', name: 'Mana Shield', branch: 'Magic', desc: 'Wizard Monkey costs $40 less.', cost: 1, effect: { towerDiscount: { wizard_monkey: 40 } } },
    { id: 'ninja_discipline', name: 'Ninja Discipline', branch: 'Magic', desc: 'Ninja attacks 12% faster.', cost: 2, effect: { kindRateMul: { ninja_monkey: 0.88 } } },
    { id: 'super_saver', name: 'Super Saver', branch: 'Magic', desc: 'Super Monkey costs $200 less.', cost: 3, effect: { towerDiscount: { super_monkey: 200 } } },
    { id: 'alchemy_101', name: 'Alchemy 101', branch: 'Magic', desc: 'Alchemist splash +12.', cost: 2, effect: { kindSplashAdd: { alchemist: 12 } } },
    { id: 'druid_grove', name: 'Druid Grove', branch: 'Magic', desc: 'Druid gains +1 damage.', cost: 2, effect: { kindDamageAdd: { druid: 1 } } },
    { id: 'magic_mastery', name: 'Magic Mastery', branch: 'Magic', desc: 'All Magic towers cost $45 less.', cost: 3, requires: ['mana_shield'], effect: { categoryDiscount: { magic: 45 } } },

    /* —— Support —— */
    { id: 'farm_boost', name: 'Fertilizer', branch: 'Support', desc: 'Banana Farms earn +5$/sec.', cost: 2, effect: { farmIncomeAdd: 5 } },
    { id: 'farm_empire', name: 'Farm Empire', branch: 'Support', desc: 'Banana Farms earn +10$/sec more.', cost: 3, requires: ['farm_boost'], effect: { farmIncomeAdd: 10 } },
    { id: 'cheap_farms', name: 'Cheap Farms', branch: 'Support', desc: 'Banana Farm costs $150 less.', cost: 2, effect: { towerDiscount: { banana_farm: 150 } } },
    { id: 'spike_stock', name: 'Spike Stock', branch: 'Support', desc: 'Spike Factory piles +3 pierce.', cost: 2, effect: { spikePierceAdd: 3 } },
    { id: 'village_vibes', name: 'Village Vibes', branch: 'Support', desc: 'Monkey Village aura range +20.', cost: 2, effect: { villageRadiusAdd: 20 } },
    { id: 'engineer_kit', name: 'Engineer Kit', branch: 'Support', desc: 'Engineer can place +1 sentry.', cost: 2, effect: { sentryMaxAdd: 1 } },
    { id: 'support_sale', name: 'Support Sale', branch: 'Support', desc: 'All Support towers cost $50 less.', cost: 3, requires: ['farm_boost'], effect: { categoryDiscount: { support: 50 } } },
  ];

  var trophyStore = [
    { id: 'cash_boost', name: 'Starter Pack', desc: '+150 starting cash permanently.', cost: 10, effect: { startCashAdd: 150 } },
    { id: 'gold_frame', name: 'Gold Frame', desc: 'Profile frame — equip it on your Arthur Profile badge.', cost: 100, effect: {} },
    { id: 'speed_pin', name: 'Speed Pin', desc: 'Profile pin — equip it on your Arthur Profile badge.', cost: 60, effect: {} },
  ];

  /* ─── 2-Player: bloon send catalog (eco cost → send bloons) ─── */
  var pvpBloonShop = [
    { id: 'red1', type: 'red', count: 1, cost: 1, label: 'Red', gap: 0.4 },
    { id: 'red10', type: 'red', count: 10, cost: 8, label: '10 Reds', gap: 0.28 },
    { id: 'blue5', type: 'blue', count: 5, cost: 12, label: '5 Blues', gap: 0.32 },
    { id: 'green5', type: 'green', count: 5, cost: 18, label: '5 Greens', gap: 0.3 },
    { id: 'yellow5', type: 'yellow', count: 5, cost: 28, label: '5 Yellows', gap: 0.28 },
    { id: 'pink5', type: 'pink', count: 5, cost: 40, label: '5 Pinks', gap: 0.25 },
    { id: 'black2', type: 'black', count: 2, cost: 45, label: '2 Blacks', gap: 0.4 },
    { id: 'white2', type: 'white', count: 2, cost: 45, label: '2 Whites', gap: 0.4 },
    { id: 'lead3', type: 'lead', count: 3, cost: 70, label: '3 Leads', gap: 0.45, unlockTurn: 2 },
    { id: 'zebra2', type: 'zebra', count: 2, cost: 80, label: '2 Zebras', gap: 0.4, unlockTurn: 2 },
    { id: 'rainbow2', type: 'rainbow', count: 2, cost: 120, label: '2 Rainbows', gap: 0.45, unlockTurn: 3 },
    { id: 'camo_pink', type: 'pink', count: 8, cost: 90, label: '8 Camo Pink', gap: 0.22, camo: true, unlockTurn: 3 },
    { id: 'ceramic2', type: 'ceramic', count: 2, cost: 200, label: '2 Ceramics', gap: 0.5, unlockTurn: 4 },
    { id: 'moab', type: 'moab', count: 1, cost: 500, label: 'MOAB', gap: 1.2, unlockTurn: 6, blimp: true },
    { id: 'bfb', type: 'bfb', count: 1, cost: 1400, label: 'BFB', gap: 1.4, unlockTurn: 10, blimp: true },
    { id: 'ddt', type: 'ddt', count: 1, cost: 900, label: 'DDT', gap: 0.9, unlockTurn: 8, blimp: true },
    { id: 'zomg', type: 'zomg', count: 1, cost: 4000, label: 'ZOMG', gap: 1.6, unlockTurn: 14, blimp: true },
  ];

  global.BTD6_DATA = {
    DAMAGE: D,
    towers: towers,
    bloonTypes: bloonTypes,
    rounds: rounds,
    maps: maps,
    buyBar: buyBar,
    knowledgeNodes: knowledgeNodes,
    trophyStore: trophyStore,
    pvpBloonShop: pvpBloonShop,
  };
})(window);
