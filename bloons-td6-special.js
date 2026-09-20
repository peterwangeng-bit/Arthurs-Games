/**
 * Special monkeys support — RNG lottery pool for Bloons TD 6.
 * Loaded before bloons-td6-engine.js
 */
(function (global) {
  'use strict';

  var RARITY = {
    trash: { label: 'Trash', color: '#666', order: 0 },
    common: { label: 'Common', color: '#aaa', order: 1 },
    uncommon: { label: 'Uncommon', color: '#6c6', order: 2 },
    rare: { label: 'Rare', color: '#6cf', order: 3 },
    epic: { label: 'Epic', color: '#c6f', order: 4 },
    legendary: { label: 'Legendary', color: '#fc4', order: 5 },
    mythic: { label: 'Mythic', color: '#f8f', order: 6 },
  };

  var POOL = [
    { id: 'void', name: 'Void', rarity: 'trash', weight: 110, desc: 'Literally does nothing.',
      stats: { damageAdd: -1, rateAdd: 0.15 } },
    { id: 'nap', name: 'Nap Time', rarity: 'trash', weight: 95, desc: 'Too sleepy to fight.',
      stats: { damageAdd: -1, rateAdd: 0.35 } },
    { id: 'rust', name: 'Rusty', rarity: 'trash', weight: 90, desc: 'Weak and short range.',
      stats: { damageAdd: -1, radiusAdd: -30, rateAdd: 0.1 } },
    { id: 'banana', name: 'Banana Peel', rarity: 'common', weight: 75, desc: 'Slips on own peel.',
      stats: { damageAdd: -1, rateAdd: 0.05 } },
    { id: 'paper', name: 'Paper Dart', rarity: 'common', weight: 70, desc: 'Barely pokes.',
      stats: { pierceAdd: 1 } },
    { id: 'mystery_box', name: 'Empty Box', rarity: 'common', weight: 65, desc: 'Stats unchanged.',
      stats: {} },
    { id: 'curious', name: 'Curious', rarity: 'uncommon', weight: 48, desc: 'A little better.',
      stats: { damageAdd: 1, radiusAdd: 12, rateMul: 0.95 } },
    { id: 'stick', name: 'Pointy Stick', rarity: 'uncommon', weight: 44, desc: 'Pops harder.',
      stats: { damageAdd: 2, pierceAdd: 1 } },
    { id: 'spy', name: 'Spy Glass', rarity: 'uncommon', weight: 40, desc: 'Sees camo.',
      stats: { damageAdd: 1, radiusAdd: 15, flags: { canHitCamo: true } } },
    { id: 'popper', name: 'Lead Popper', rarity: 'uncommon', weight: 38, desc: 'Small explosions.',
      stats: { damageAdd: 2, splashRadiusAdd: 22, flags: { canPopLead: true, damageTypesAdd: ['Explosive'] } } },
    { id: 'swift', name: 'Swift', rarity: 'uncommon', weight: 42, desc: 'Faster weak shots.',
      stats: { damageAdd: 1, pierceAdd: 1, rateMul: 0.88 } },
    { id: 'veteran', name: 'Veteran', rarity: 'rare', weight: 18, desc: 'Solid all-rounder.',
      stats: { damageAdd: 4, pierceAdd: 2, rateMul: 0.9 } },
    { id: 'frost', name: 'Frost Touch', rarity: 'rare', weight: 16, desc: 'Freezes while popping.',
      stats: { damageAdd: 3, slowDurationAdd: 1.8, slowFactorAdd: -0.2 } },
    { id: 'bomber', name: 'Mini Bomber', rarity: 'rare', weight: 15, desc: 'Explosive splash.',
      stats: { damageAdd: 5, pierceAdd: 2, splashRadiusAdd: 40, flags: { canPopLead: true, damageTypesAdd: ['Explosive'] } } },
    { id: 'wizard', name: 'Wizard Whisp', rarity: 'rare', weight: 14, desc: 'Magic pierce.',
      stats: { damageAdd: 6, pierceAdd: 4, splashRadiusAdd: 32, flags: { damageTypesAdd: ['Energy'] } } },
    { id: 'sniper', name: 'Sniper Dream', rarity: 'rare', weight: 12, desc: 'Whole-map snipes.',
      stats: { damageAdd: 7, pierceAdd: 3, radiusAdd: 9000, rateAdd: 0.4 } },
    { id: 'plasma', name: 'Plasma Kid', rarity: 'epic', weight: 7, desc: 'Mini Super Monkey.',
      stats: { damageAdd: 8, pierceAdd: 4, rateMul: 0.94, flags: { canHitCamo: true } } },
    { id: 'tackstorm', name: 'Tack Storm', rarity: 'epic', weight: 6, desc: 'Eight-way tack burst.',
      stats: { damageAdd: 4, pierceAdd: 2, tackAdd: 8, rateAdd: 0.2 } },
    { id: 'dartlord', name: 'Dart Lord', rarity: 'epic', weight: 6, desc: 'Five-shot volley.',
      stats: { damageAdd: 5, pierceAdd: 2, volleyAdd: 4, rateMul: 0.85, flags: { canHitCamo: true } } },
    { id: 'moab', name: 'MOAB Hunter', rarity: 'epic', weight: 5, desc: 'Blimp shredder.',
      stats: { damageAdd: 10, pierceAdd: 5, moabBonusAdd: 14, rateMul: 0.92 } },
    { id: 'sungod', name: 'Sun God', rarity: 'legendary', weight: 2.2, desc: 'Plasma sun — Super tier.',
      stats: { damageAdd: 12, pierceAdd: 6, radiusAdd: 35, splashRadiusAdd: 48, rateMul: 0.95, flags: { canHitCamo: true, canPopLead: true, damageTypesAdd: ['Explosive', 'Energy'] } } },
    { id: 'infinite', name: 'Infinite Dart', rarity: 'legendary', weight: 2, desc: 'Machine-gun pierce.',
      stats: { damageAdd: 9, pierceAdd: 10, volleyAdd: 1, rateMul: 0.88, flags: { canHitCamo: true } } },
    { id: 'absolute', name: 'Absolute Zero', rarity: 'legendary', weight: 1.8, desc: 'Freezes everything nearby hard.',
      stats: { damageAdd: 8, pierceAdd: 3, radiusAdd: 40, slowDurationAdd: 3.5, slowFactorAdd: -0.35 } },
    { id: 'beyond', name: 'Beyond Super', rarity: 'mythic', weight: 0.55, desc: 'Better than a maxed Super Monkey.',
      stats: { damageAdd: 20, pierceAdd: 14, radiusAdd: 50, moabBonusAdd: 22, volleyAdd: 2, rateMul: 0.86, flags: { canHitCamo: true, canPopLead: true, damageTypesAdd: ['Energy', 'Explosive'] } } },
    { id: 'supreme', name: '??? Supreme', rarity: 'mythic', weight: 0.35, desc: 'Map-wide instant deletion.',
      stats: { damageAdd: 28, pierceAdd: 18, radiusAdd: 9000, moabBonusAdd: 30, rateMul: 0.84, flags: { canHitCamo: true, canPopLead: true, damageTypesAdd: ['Explosive', 'Energy'] } } },
    { id: 'glitch', name: 'Glitch', rarity: 'mythic', weight: 0.4, desc: 'Everything at once. Broken.',
      stats: { damageAdd: 16, pierceAdd: 8, tackAdd: 8, volleyAdd: 3, splashRadiusAdd: 55, rateMul: 0.9, flags: { canHitCamo: true, canPopLead: true, damageTypesAdd: ['Explosive'] } } },
  ];

  var BY_ID = {};
  var i;
  for (i = 0; i < POOL.length; i++) BY_ID[POOL[i].id] = POOL[i];

  function getRoll(id) {
    return id ? BY_ID[id] || null : null;
  }

  function rarityMeta(rarity) {
    return RARITY[rarity] || RARITY.common;
  }

  function rollWeight(roll, luck) {
    var lk = Math.max(0, luck || 0);
    var meta = rarityMeta(roll.rarity);
    var w = roll.weight;
    if (meta.order <= 1) w *= Math.max(0.25, 1 - lk * 0.055);
    else if (meta.order === 2) w *= Math.max(0.5, 1 - lk * 0.02);
    else if (meta.order >= 4) w *= 1 + lk * (meta.order >= 6 ? 0.22 : meta.order >= 5 ? 0.14 : 0.09);
    return Math.max(0.05, w);
  }

  function pickRoll(luck) {
    var total = 0;
    var weights = [];
    var j;
    for (j = 0; j < POOL.length; j++) {
      var w = rollWeight(POOL[j], luck);
      weights.push(w);
      total += w;
    }
    var r = Math.random() * total;
    for (j = 0; j < POOL.length; j++) {
      r -= weights[j];
      if (r <= 0) return POOL[j];
    }
    return POOL[POOL.length - 1];
  }

  function applyRollModifiers(stats, rollId) {
    var roll = getRoll(rollId);
    if (!roll || !roll.stats) return stats;
    var u = roll.stats;
    if (u.damageAdd) stats.damage += u.damageAdd;
    if (u.pierceAdd) stats.pierce += u.pierceAdd;
    if (u.radiusAdd) stats.radius += u.radiusAdd;
    if (u.rateMul) stats.rate *= u.rateMul;
    if (u.rateAdd) stats.rate += u.rateAdd;
    if (u.volleyAdd) stats.volley += u.volleyAdd;
    if (u.tackAdd) stats.tack += u.tackAdd;
    if (u.moabBonusAdd) stats.moabBonus += u.moabBonusAdd;
    if (u.splashRadiusAdd) stats.splashRadius += u.splashRadiusAdd;
    if (u.slowDurationAdd) stats.slowDuration += u.slowDurationAdd;
    if (u.slowFactorAdd) {
      stats.slowFactor = Math.max(0.05, Math.min(0.95, (stats.slowFactor != null ? stats.slowFactor : 0.5) + u.slowFactorAdd));
    }
    if (u.flags) {
      if (u.flags.canHitCamo) stats.canHitCamo = true;
      if (u.flags.canPopLead) stats.canPopLead = true;
      if (u.flags.damageTypesAdd) {
        u.flags.damageTypesAdd.forEach(function (dt) {
          if (stats.damageTypes.indexOf(dt) < 0) stats.damageTypes.push(dt);
        });
      }
    }
    stats.rate = Math.max(0.05, stats.rate);
    stats.damage = Math.max(0, stats.damage);
    stats.pierce = Math.max(1, Math.floor(stats.pierce));
    stats.rngRollId = rollId;
    stats.rngRollName = roll.name;
    stats.rngRarity = roll.rarity;
    return stats;
  }

  function rollCost(baseDiscount) {
    return Math.max(200, 650 - (baseDiscount | 0));
  }

  function luckCost(currentLuck) {
    return 400 + (currentLuck || 0) * 220;
  }

  global.BTD6_SPECIAL = {
    POOL: POOL,
    RARITY: RARITY,
    MAX_LUCK: 25,
    getRoll: getRoll,
    rarityMeta: rarityMeta,
    pickRoll: pickRoll,
    applyRollModifiers: applyRollModifiers,
    rollCost: rollCost,
    luckCost: luckCost,
  };
})(window);
