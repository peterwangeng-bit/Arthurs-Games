/**
 * Bloons TD 6 Clone — playable engine (vanilla JS)
 * Requires window.BTD6_DATA from bloons-td6-data.js
 */
(function (global) {
  'use strict';

  var DATA = null;
  var PROFILE_KEY = 'btd6Profile';
  var KNOWLEDGE_BACKUP_KEY = 'btd6SkillTreeBackup';
  var SELL_RATE = 0.7;
  var PATH_WIDTH = 36;
  var CHILD_SPACING = 20;
  var BLIMP_SPACING = 52;

  var profile = null;
  var ui = null;
  var battle = null;
  var raf = 0;
  var lastTs = 0;
  var screenId = 'home';

  /* ─── Utils ─── */
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function dist2(ax, ay, bx, by) {
    var dx = ax - bx, dy = ay - by;
    return dx * dx + dy * dy;
  }
  function dist(ax, ay, bx, by) { return Math.sqrt(dist2(ax, ay, bx, by)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function $(id) { return document.getElementById(id); }
  function toast(msg) {
    if (!ui || !ui.toast) return;
    ui.toast.textContent = msg;
    ui.toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { ui.toast.classList.remove('show'); }, 1800);
  }

  /* ─── Chinese / English language mode ─── */
  var LANG = {
    en: {
      'chip.mm': 'MM', 'chip.trophies': 'Trophies', 'chip.knowledge': 'Skills',
      'home.title': 'BLOONS TD',
      'home.tagline': 'Pop bloons through 40 rounds. Place monkeys, crosspath upgrades, earn trophies & skill points.',
      'home.play': 'Play', 'home.pvp': '2 Player', 'home.maps': 'Maps',
      'home.knowledge': 'Skill Tree', 'home.store': 'Trophy Store',
      'home.profile': 'Profile',
      'home.hint': 'Hotkeys in battle: 1–5 category tabs · QWER buy slots · Space start round · P pause · Esc cancel',
      'store.tagline': 'Win games to earn trophies. Cosmetics equip on your shared Arthur Profile (also from other games).',
      'back': '← Back',
      'pvp.title': '2 Player — Monkeys vs Bloons',
      'pvp.tagline': 'Hot-seat turns: Monkey builds, Bloon spends eco to send a wave, then fight. Leaking lives pays the Bloon player extra cash.',
      'pvp.map': 'Map', 'pvp.p1role': 'Player 1 plays as',
      'pvp.role.monkey': 'Monkeys (defend)', 'pvp.role.bloon': 'Bloons (attack)',
      'pvp.p2bloon': 'Player 2 is Bloons.', 'pvp.p2monkey': 'Player 2 is Monkeys.',
      'pvp.lives': 'Starting lives', 'pvp.monkeyCash': 'Monkey starting cash',
      'pvp.bloonCash': 'Bloon starting eco', 'pvp.maxTurns': 'Turns to survive (Monkey win)',
      'pvp.start': 'Start 2 Player',
      'maps.title': 'Select Map', 'maps.play': 'Play →', 'maps.cleared': '★ Cleared',
      'knowledge.title': 'Skill Tree', 'knowledge.kp': 'SP',
      'knowledge.tagline': 'Earn +1 SP every 5 rounds (more with Skill Hustle), or +3 on a full win. Starting SP: 2. Every skill upgrades 3 times — each rank makes it stronger. Max every skill to unlock Rebirth (permanent 2× pierce, stacks).',
      'knowledge.buy': 'Buy', 'knowledge.upgrade': 'Upgrade', 'knowledge.maxed': 'Maxed',
      'knowledge.owned': 'Owned', 'knowledge.locked': 'Locked', 'knowledge.needs': 'Needs:',
      'knowledge.level': 'Level {n}/3',
      'knowledge.rank': 'Rank {n}',
      'knowledge.rebirth': 'Rebirth',
      'knowledge.rebirthHint': 'All skills maxed! Rebirth resets the tree and permanently doubles pierce for all troops (stacks each rebirth).',
      'knowledge.rebirthActive': 'Rebirths: {n} · Troop pierce ×{mul}',
      'knowledge.rebirthLocked': 'Max every skill to unlock Rebirth.',
      'store.title': 'Trophy Store',
      'hud.lives': 'Lives', 'hud.cash': 'Cash', 'hud.monkeyCash': 'Monkey $',
      'hud.bloonEco': 'Bloon Eco', 'hud.phase': 'Phase', 'hud.round': 'Round', 'hud.wave': 'Wave',
      'hud.start': 'Start Round', 'hud.next': 'Next Round', 'hud.rounding': 'Round…',
      'hud.ready': 'Ready', 'hud.readyBloon': 'Ready — Bloon turn', 'hud.sendWave': 'Send Wave',
      'hud.auto': 'Auto', 'hud.autoOn': 'Auto ON', 'hud.pause': 'Pause', 'hud.paused': 'Paused',
      'hud.menu': 'Menu', 'hud.build': 'BUILD', 'hud.send': 'SEND', 'hud.fight': 'FIGHT',
      'tab.primary': '1 Prim', 'tab.military': '2 Mil', 'tab.magic': '3 Mag', 'tab.support': '4 Sup',
      'tab.special': '5 Spec',
      'inspect.tower': 'Tower', 'inspect.empty': 'Select a tower or place one from the buy bar.',
      'inspect.monkeyTurn': 'Monkey player — place & upgrade towers, then press Ready.',
      'inspect.bloonTurn': 'Bloon player — spend eco to queue packs, then press Send Wave. Leaking lives pays eco.',
      'inspect.queued': 'Queued:',
      'inspect.stats': 'DMG {d} · Pierce {p} · Rate {r}s · R {rad}',
      'inspect.target': 'Target',
      'inspect.path.top': 'Top', 'inspect.path.mid': 'Middle', 'inspect.path.bot': 'Bottom',
      'inspect.sell': 'Sell (${n})',
      'inspect.lockedCross': 'Locked (crosspath)',
      'target.first': 'First', 'target.last': 'Last', 'target.close': 'Close', 'target.strong': 'Strong',
      'overlay.home': 'Back to Home',
      'win.mono': 'Monkeys win!', 'win.monoMsg': 'Survived {n} waves. Defenders hold the line!',
      'win.solo': 'Victory!', 'win.soloMsg': 'Round 40 cleared. +trophies & skill points.',
      'lose.bloon': 'Bloons win!', 'lose.bloonMsg': 'Lives depleted on wave {n}. Attackers break through!',
      'lose.solo': 'Defeat', 'lose.soloMsg': 'Lives depleted on round {n}.',
      'confirm.leave': 'Leave battle and return to home?',
      'confirm.rebirth': 'Rebirth? Your skill tree resets, but all troops permanently gain 2× pierce (stacks with past rebirths).',
      'toast.notEnoughCash': 'Not enough cash',
      'toast.cannotPlace': 'Cannot place here',
      'toast.monkeyBuildOnly': 'Only Monkey player can build on their turn',
      'toast.sellBuildOnly': 'Sell only on Monkey build turn',
      'toast.upgradeBuildOnly': 'Upgrades only on Monkey build turn',
      'toast.invalidCrosspath': 'Invalid crosspath',
      'toast.useReady': 'Use Ready — this is 2-player turn mode',
      'toast.unlockTurn': 'Unlocks on turn {n}',
      'toast.needEco': 'Need more bloon eco',
      'toast.queued': 'Queued {name} (−${cost})',
      'toast.emptyWave': 'Empty wave — bloons earn eco only',
      'toast.waveFight': 'Wave {n} — Fight!',
      'toast.waveEmpty': 'Wave {n} — nothing sent',
      'toast.waveClear': '+${m} monkeys · +${b} bloon eco',
      'toast.endRound': '+${n} end of round',
      'toast.kp': '+{n} SP',
      'toast.autoOn': 'Auto ON — rounds start themselves',
      'toast.autoOff': 'Auto OFF',
      'toast.leakEco': '-{n} lives! Bloons earn +${c} eco',
      'toast.leakExit': '-{n} lives! Bloon reached the EXIT',
      'toast.needKp': 'Need more skill points',
      'toast.needTrophies': 'Need more trophies',
      'toast.needReq': 'Unlock the required skill first',
      'toast.unlocked': 'Unlocked {name}',
      'toast.upgraded': 'Upgraded {name} to rank {n}',
      'toast.purchased': 'Purchased {name}',
      'toast.buildOnly': 'Monkey build turn only',
      'toast.roundMissing': 'Round {n} data missing',
      'toast.rebirthNeed': 'Max every skill before rebirth',
      'toast.reborn': 'Rebirth {n}! All troops now have ×{mul} pierce',
      'toast.saveFail': 'Could not save skill tree — storage may be blocked',
      'toast.rngNeedCash': 'Need more cash to roll',
      'toast.rngRolled': 'Rolled {name} ({rarity})!',
      'inspect.rngRoll': 'Roll RNG (${n})',
      'inspect.rngLuck': 'Luck {n}',
      'inspect.rngCurrent': 'Current: {name}',
      'inspect.rngNone': 'No roll yet — try your luck!',
      'pvp.turn.p1monkey': 'Player 1 — Monkeys: BUILD',
      'pvp.turn.p2monkey': 'Player 2 — Monkeys: BUILD',
      'pvp.turn.p1bloon': 'Player 1 — Bloons: SEND',
      'pvp.turn.p2bloon': 'Player 2 — Bloons: SEND',
      'diff.beginner': 'beginner', 'diff.intermediate': 'intermediate',
      'diff.advanced': 'advanced', 'diff.expert': 'expert',
      'lang.btn': '中文',
    },
    zh: {
      'chip.mm': '猴币', 'chip.trophies': '奖杯', 'chip.knowledge': '技能',
      'home.title': '气球塔防',
      'home.tagline': '坚持 40 回合打爆气球。放置猴子、交叉升级，赚取奖杯和技能点。',
      'home.play': '开始游戏', 'home.pvp': '双人模式', 'home.maps': '地图',
      'home.knowledge': '技能树', 'home.store': '奖杯商店',
      'home.profile': '个人资料',
      'home.hint': '战斗快捷键：1–5 切换类别 · QWER 购买 · 空格开始回合 · P 暂停 · Esc 取消',
      'store.tagline': '赢下游戏赚取奖杯。外观装在共享的亚瑟个人资料上（其他游戏也能获得）。',
      'back': '← 返回',
      'pvp.title': '双人模式 — 猴子 vs 气球',
      'pvp.tagline': '轮流操作：猴子建造，气球花生态金派出波次，然后战斗。漏掉生命会给气球方额外金钱。',
      'pvp.map': '地图', 'pvp.p1role': '玩家1 扮演',
      'pvp.role.monkey': '猴子（防守）', 'pvp.role.bloon': '气球（进攻）',
      'pvp.p2bloon': '玩家2 是气球方。', 'pvp.p2monkey': '玩家2 是猴子方。',
      'pvp.lives': '起始生命', 'pvp.monkeyCash': '猴子起始金钱',
      'pvp.bloonCash': '气球起始生态金', 'pvp.maxTurns': '坚持回合数（猴子获胜）',
      'pvp.start': '开始双人游戏',
      'maps.title': '选择地图', 'maps.play': '开始 →', 'maps.cleared': '★ 已通关',
      'knowledge.title': '技能树', 'knowledge.kp': '技能点',
      'knowledge.tagline': '每存活 5 回合 +1 技能点（技能拼搏可更多），通关 +3。初始 2 点。每项技能可升级 3 次，每次都更强。全部满级可转生（永久 2 倍穿透，可叠加）。',
      'knowledge.buy': '购买', 'knowledge.upgrade': '升级', 'knowledge.maxed': '已满级',
      'knowledge.owned': '已拥有', 'knowledge.locked': '未解锁', 'knowledge.needs': '需要：',
      'knowledge.level': '等级 {n}/3',
      'knowledge.rank': '第 {n} 级',
      'knowledge.rebirth': '转生',
      'knowledge.rebirthHint': '全部技能已满级！转生会重置技能树，并永久让所有部队穿透翻倍（每次转生叠加）。',
      'knowledge.rebirthActive': '转生次数：{n} · 部队穿透 ×{mul}',
      'knowledge.rebirthLocked': '将全部技能升满后解锁转生。',
      'store.title': '奖杯商店',
      'hud.lives': '生命', 'hud.cash': '金钱', 'hud.monkeyCash': '猴子金钱',
      'hud.bloonEco': '气球生态', 'hud.phase': '阶段', 'hud.round': '回合', 'hud.wave': '波次',
      'hud.start': '开始回合', 'hud.next': '下一回合', 'hud.rounding': '回合中…',
      'hud.ready': '准备', 'hud.readyBloon': '准备 — 气球回合', 'hud.sendWave': '派出波次',
      'hud.auto': '自动', 'hud.autoOn': '自动开', 'hud.pause': '暂停', 'hud.paused': '已暂停',
      'hud.menu': '菜单', 'hud.build': '建造', 'hud.send': '派兵', 'hud.fight': '战斗',
      'tab.primary': '1 初级', 'tab.military': '2 军事', 'tab.magic': '3 魔法', 'tab.support': '4 支援',
      'tab.special': '5 特殊',
      'inspect.tower': '塔', 'inspect.empty': '选择一座塔，或从购买栏放置。',
      'inspect.monkeyTurn': '猴子玩家 — 放置并升级塔，然后点「准备」。',
      'inspect.bloonTurn': '气球玩家 — 花生态金排队气球，然后点「派出波次」。漏生命可赚生态金。',
      'inspect.queued': '已排队：',
      'inspect.stats': '伤害 {d} · 穿透 {p} · 间隔 {r}秒 · 射程 {rad}',
      'inspect.target': '目标',
      'inspect.path.top': '上路', 'inspect.path.mid': '中路', 'inspect.path.bot': '下路',
      'inspect.sell': '出售（${n}）',
      'inspect.lockedCross': '锁定（交叉路径）',
      'target.first': '最先', 'target.last': '最后', 'target.close': '最近', 'target.strong': '最强',
      'overlay.home': '返回主页',
      'win.mono': '猴子获胜！', 'win.monoMsg': '撑过了 {n} 波。防守成功！',
      'win.solo': '胜利！', 'win.soloMsg': '第 40 回合通关。获得奖杯与技能点。',
      'lose.bloon': '气球获胜！', 'lose.bloonMsg': '第 {n} 波生命耗尽。进攻方突破！',
      'lose.solo': '失败', 'lose.soloMsg': '第 {n} 回合生命耗尽。',
      'confirm.leave': '离开战斗并返回主页？',
      'confirm.rebirth': '确认转生？技能树会重置，但所有部队永久获得 2 倍穿透（与以往转生叠加）。',
      'toast.notEnoughCash': '金钱不足',
      'toast.cannotPlace': '不能放在这里',
      'toast.monkeyBuildOnly': '只有猴子玩家可在自己的回合建造',
      'toast.sellBuildOnly': '只能在猴子建造回合出售',
      'toast.upgradeBuildOnly': '只能在猴子建造回合升级',
      'toast.invalidCrosspath': '无效交叉路径',
      'toast.useReady': '请用「准备」— 这是双人回合模式',
      'toast.unlockTurn': '第 {n} 波解锁',
      'toast.needEco': '气球生态金不足',
      'toast.queued': '已排队 {name}（−${cost}）',
      'toast.emptyWave': '空波 — 气球方只赚生态金',
      'toast.waveFight': '第 {n} 波 — 开战！',
      'toast.waveEmpty': '第 {n} 波 — 未派出',
      'toast.waveClear': '猴子 +${m} · 气球生态 +${b}',
      'toast.endRound': '回合结束 +${n}',
      'toast.kp': '+{n} 技能点',
      'toast.autoOn': '自动开启 — 回合会自动开始',
      'toast.autoOff': '自动关闭',
      'toast.leakEco': '−{n} 生命！气球方获得 +${c} 生态金',
      'toast.leakExit': '−{n} 生命！气球到达出口',
      'toast.needKp': '技能点不足',
      'toast.needTrophies': '奖杯不足',
      'toast.needReq': '请先解锁所需技能',
      'toast.unlocked': '已解锁 {name}',
      'toast.upgraded': '已将 {name} 升到第 {n} 级',
      'toast.purchased': '已购买 {name}',
      'toast.buildOnly': '仅猴子建造回合',
      'toast.roundMissing': '缺少第 {n} 回合数据',
      'toast.rebirthNeed': '请先将全部技能升满再转生',
      'toast.reborn': '第 {n} 次转生！所有部队穿透 ×{mul}',
      'toast.saveFail': '无法保存技能树 — 浏览器可能禁止了本地存储',
      'toast.rngNeedCash': '金钱不足，无法抽奖',
      'toast.rngRolled': '抽到 {name}（{rarity}）！',
      'inspect.rngRoll': '抽奖（${n}）',
      'inspect.rngLuck': '幸运 {n}',
      'inspect.rngCurrent': '当前：{name}',
      'inspect.rngNone': '还没抽过 — 试试运气！',
      'pvp.turn.p1monkey': '玩家1 — 猴子：建造',
      'pvp.turn.p2monkey': '玩家2 — 猴子：建造',
      'pvp.turn.p1bloon': '玩家1 — 气球：派兵',
      'pvp.turn.p2bloon': '玩家2 — 气球：派兵',
      'diff.beginner': '初级', 'diff.intermediate': '中级',
      'diff.advanced': '高级', 'diff.expert': '专家',
      'lang.btn': 'EN',
    },
  };

  function lang() {
    try {
      var shared = localStorage.getItem('arthurGamesLang');
      if (shared === 'zh' || shared === 'en') return shared;
    } catch (e) { /* ignore */ }
    return (profile && profile.lang === 'zh') ? 'zh' : 'en';
  }

  function tr(key, vars) {
    var pack = LANG[lang()] || LANG.en;
    var s = pack[key] != null ? pack[key] : (LANG.en[key] != null ? LANG.en[key] : key);
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.split('{' + k + '}').join(String(vars[k]));
      });
    }
    return s;
  }

  function zhData() {
    return global.BTD6_ZH || null;
  }

  function towerName(kindOrDef) {
    var kind = typeof kindOrDef === 'string' ? kindOrDef : (kindOrDef && kindOrDef.kind);
    var def = typeof kindOrDef === 'string'
      ? (DATA && DATA.towers[kindOrDef])
      : kindOrDef;
    var fallback = (def && def.displayName) || kind || '';
    if (lang() !== 'zh') return fallback;
    var z = zhData();
    if (z && z.towers && kind && z.towers[kind]) return z.towers[kind];
    return fallback;
  }

  function mapName(map) {
    if (!map) return '';
    if (lang() !== 'zh') return map.displayName || '';
    var z = zhData();
    var id = map.mapId || map.id;
    if (z && z.maps && id && z.maps[id] && z.maps[id].name) return z.maps[id].name;
    return map.displayName || '';
  }

  function mapDesc(map) {
    if (!map) return '';
    if (lang() !== 'zh') return map.desc || '';
    var z = zhData();
    var id = map.mapId || map.id;
    if (z && z.maps && id && z.maps[id] && z.maps[id].desc) return z.maps[id].desc;
    return map.desc || '';
  }

  function knowledgeName(node) {
    if (!node) return '';
    if (lang() !== 'zh') return node.name || '';
    var z = zhData();
    if (z && z.knowledge && node.id && z.knowledge[node.id]) return z.knowledge[node.id].name;
    return node.name || '';
  }

  function knowledgeDesc(node) {
    if (!node) return '';
    if (lang() !== 'zh') return node.desc || '';
    var z = zhData();
    if (z && z.knowledge && node.id && z.knowledge[node.id]) return z.knowledge[node.id].desc;
    return node.desc || '';
  }

  function branchName(branch) {
    if (lang() !== 'zh') return branch || '';
    var z = zhData();
    if (z && z.branches && z.branches[branch]) return z.branches[branch];
    return branch || '';
  }

  function storeName(sku) {
    if (!sku) return '';
    if (lang() !== 'zh') return sku.name || '';
    var z = zhData();
    if (z && z.store && sku.id && z.store[sku.id]) return z.store[sku.id].name;
    return sku.name || '';
  }

  function storeDesc(sku) {
    if (!sku) return '';
    if (lang() !== 'zh') return sku.desc || '';
    var z = zhData();
    if (z && z.store && sku.id && z.store[sku.id]) return z.store[sku.id].desc;
    return sku.desc || '';
  }

  function upgradeName(u) {
    if (!u) return '';
    if (lang() !== 'zh') return u.name || '';
    var z = zhData();
    if (z && z.upgrades && u.name && z.upgrades[u.name]) return z.upgrades[u.name];
    return u.name || '';
  }

  function bloonShopLabel(item) {
    if (!item) return '';
    if (lang() !== 'zh') return item.label || '';
    var z = zhData();
    if (z && z.bloonShop && item.id && z.bloonShop[item.id]) return z.bloonShop[item.id];
    return item.label || '';
  }

  function applyI18n() {
    document.documentElement.lang = lang() === 'zh' ? 'zh-CN' : 'en';
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (el) {
      var key = el.getAttribute('data-i18n');
      if (!key) return;
      /* Only rewrite leaves so nested <strong>/inputs stay intact */
      if (el.children.length > 0 && el.tagName !== 'OPTION') return;
      el.textContent = tr(key);
    });
    var btn = $('btnLang');
    if (btn) btn.textContent = tr('lang.btn');
    updatePvpRoleNote();
    if (battle) {
      refreshHud();
      refreshBuyBar();
      refreshInspect();
    }
    if (screenId === 'mapselect') renderMapCards();
    if (screenId === 'knowledge') renderKnowledge();
    if (screenId === 'store') renderStore();
    if (screenId === 'pvpsetup') populatePvpSetup();
  }

  function toggleLang() {
    if (!profile) return;
    var next = lang() === 'zh' ? 'en' : 'zh';
    profile.lang = next;
    try { localStorage.setItem('arthurGamesLang', next); } catch (e) { /* ignore */ }
    saveProfile();
    applyI18n();
    toast(lang() === 'zh' ? '已切换到中文模式' : 'Switched to English');
  }

  /* ─── Profile ─── */
  function defaultProfile() {
    return {
      monkeyMoney: 0,
      trophies: 0,
      knowledgePoints: 2,
      unlockedKnowledge: [],
      knowledgeLevels: {},
      skillRebirths: 0,
      ownedStore: [],
      medals: {},
      lang: 'en',
    };
  }

  function countKnowledgeLevels(levels) {
    if (!levels || typeof levels !== 'object') return 0;
    var n = 0;
    Object.keys(levels).forEach(function (id) {
      if ((levels[id] | 0) >= 1) n++;
    });
    return n;
  }

  function readSkillTreeBackup() {
    try {
      var raw = localStorage.getItem(KNOWLEDGE_BACKUP_KEY);
      if (!raw) {
        try {
          raw = sessionStorage.getItem(KNOWLEDGE_BACKUP_KEY);
        } catch (e2) { /* ignore */ }
      }
      if (!raw) return null;
      var b = JSON.parse(raw);
      if (!b || typeof b !== 'object') return null;
      return b;
    } catch (e) {
      return null;
    }
  }

  function writeSkillTreeBackup(p) {
    var payload = JSON.stringify({
      knowledgeLevels: (p && p.knowledgeLevels) || {},
      unlockedKnowledge: (p && p.unlockedKnowledge) || [],
      knowledgePoints: (p && p.knowledgePoints) | 0,
      skillRebirths: (p && p.skillRebirths) | 0,
      savedAt: Date.now(),
    });
    try { localStorage.setItem(KNOWLEDGE_BACKUP_KEY, payload); } catch (e) { /* ignore */ }
    try { sessionStorage.setItem(KNOWLEDGE_BACKUP_KEY, payload); } catch (e2) { /* ignore */ }
  }

  function mergeSkillTreeFromBackup(p) {
    var bak = readSkillTreeBackup();
    if (!bak) return p;
    var curRe = p.skillRebirths | 0;
    var bakRe = bak.skillRebirths | 0;
    var curCount = countKnowledgeLevels(p.knowledgeLevels);
    var bakCount = countKnowledgeLevels(bak.knowledgeLevels);

    /* Prefer higher rebirth count (and its tree snapshot). */
    if (bakRe > curRe) {
      p.skillRebirths = bakRe;
      p.knowledgeLevels = bak.knowledgeLevels || {};
      if (Array.isArray(bak.unlockedKnowledge)) p.unlockedKnowledge = bak.unlockedKnowledge.slice();
      if (bak.knowledgePoints != null) p.knowledgePoints = bak.knowledgePoints | 0;
      return p;
    }
    /* Same rebirth gen: restore richer skill tree if main was wiped. */
    if (bakRe === curRe && bakCount > curCount) {
      p.knowledgeLevels = bak.knowledgeLevels || {};
      if (Array.isArray(bak.unlockedKnowledge)) p.unlockedKnowledge = bak.unlockedKnowledge.slice();
    }
    return p;
  }

  function loadProfile() {
    try {
      var raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) {
        try { raw = sessionStorage.getItem(PROFILE_KEY); } catch (e0) { /* ignore */ }
      }
      if (!raw) {
        var empty = defaultProfile();
        mergeSkillTreeFromBackup(empty);
        migrateKnowledgeLevels(empty);
        return empty;
      }
      var p = JSON.parse(raw);
      var d = defaultProfile();
      Object.keys(d).forEach(function (k) {
        if (p[k] === undefined) p[k] = d[k];
      });
      if (!p.knowledgeLevels || typeof p.knowledgeLevels !== 'object') p.knowledgeLevels = {};
      p.skillRebirths = Math.max(0, p.skillRebirths | 0);
      mergeSkillTreeFromBackup(p);
      migrateKnowledgeLevels(p);
      return p;
    } catch (e) {
      var fallback = defaultProfile();
      mergeSkillTreeFromBackup(fallback);
      migrateKnowledgeLevels(fallback);
      return fallback;
    }
  }

  /** unlockedKnowledge[] → knowledgeLevels{id:1..3}; keep list in sync for old code paths. */
  function migrateKnowledgeLevels(p) {
    if (!p.knowledgeLevels || typeof p.knowledgeLevels !== 'object') p.knowledgeLevels = {};
    var list = p.unlockedKnowledge || [];
    var i, id, lvl;
    for (i = 0; i < list.length; i++) {
      id = list[i];
      if (!id) continue;
      lvl = p.knowledgeLevels[id] | 0;
      if (lvl < 1) p.knowledgeLevels[id] = 1;
      if ((p.knowledgeLevels[id] | 0) > 3) p.knowledgeLevels[id] = 3;
    }
    syncUnlockedKnowledgeList(p);
  }

  function syncUnlockedKnowledgeList(p) {
    var levels = p.knowledgeLevels || {};
    var out = [];
    Object.keys(levels).forEach(function (id) {
      if ((levels[id] | 0) >= 1) out.push(id);
    });
    p.unlockedKnowledge = out;
  }

  function knowledgeLevel(id) {
    if (!id || !profile || !profile.knowledgeLevels) return 0;
    var n = profile.knowledgeLevels[id] | 0;
    if (n < 0) n = 0;
    if (n > 3) n = 3;
    return n;
  }

  function knowledgeHas(id) {
    return knowledgeLevel(id) >= 1;
  }

  /** KP cost to buy next rank (1→2→3). */
  function knowledgeRankCost(node, nextLevel) {
    var base = (node && node.cost) || 1;
    if (nextLevel <= 1) return base;
    if (nextLevel === 2) return Math.max(1, Math.ceil(base * 1.5));
    return Math.max(2, Math.ceil(base * 2.25));
  }

  function skillRebirthPierceMul() {
    return Math.pow(2, Math.max(0, (profile && profile.skillRebirths) | 0));
  }

  function allSkillsMaxed() {
    if (!DATA || !DATA.knowledgeNodes || !DATA.knowledgeNodes.length) return false;
    var i, node;
    for (i = 0; i < DATA.knowledgeNodes.length; i++) {
      node = DATA.knowledgeNodes[i];
      if (knowledgeLevel(node.id) < 3) return false;
    }
    return true;
  }

  function doSkillRebirth() {
    if (!allSkillsMaxed()) {
      toast(tr('toast.rebirthNeed'));
      return;
    }
    if (!confirm(tr('confirm.rebirth'))) return;
    profile.skillRebirths = (profile.skillRebirths | 0) + 1;
    profile.knowledgeLevels = {};
    profile.unlockedKnowledge = [];
    if (!saveProfile()) {
      toast(tr('toast.saveFail'));
      return;
    }
    renderKnowledge();
    toast(tr('toast.reborn', { n: profile.skillRebirths, mul: skillRebirthPierceMul() }));
  }

  function saveProfile() {
    var ok = false;
    try {
      migrateKnowledgeLevels(profile);
      var raw = JSON.stringify(profile);
      localStorage.setItem(PROFILE_KEY, raw);
      try { sessionStorage.setItem(PROFILE_KEY, raw); } catch (eS) { /* ignore */ }
      writeSkillTreeBackup(profile);
      var verify = localStorage.getItem(PROFILE_KEY);
      if (verify) {
        var parsed = JSON.parse(verify);
        var savedLevels = (parsed && parsed.knowledgeLevels) || {};
        var liveLevels = profile.knowledgeLevels || {};
        var ids = Object.keys(liveLevels);
        ok = ids.every(function (id) {
          return (savedLevels[id] | 0) === (liveLevels[id] | 0);
        }) && ((parsed.skillRebirths | 0) === (profile.skillRebirths | 0));
      }
    } catch (e) {
      ok = false;
      try {
        writeSkillTreeBackup(profile);
        ok = !!readSkillTreeBackup();
      } catch (e2) { /* ignore */ }
    }
    refreshHomeCurrencies();
    return ok;
  }

  function reloadProfileSkills() {
    var fresh = loadProfile();
    if (!profile) {
      profile = fresh;
      return;
    }
    profile.knowledgeLevels = fresh.knowledgeLevels || {};
    profile.unlockedKnowledge = fresh.unlockedKnowledge || [];
    profile.knowledgePoints = fresh.knowledgePoints | 0;
    profile.skillRebirths = fresh.skillRebirths | 0;
    profile.monkeyMoney = fresh.monkeyMoney | 0;
    profile.trophies = fresh.trophies | 0;
    profile.ownedStore = fresh.ownedStore || [];
    profile.medals = fresh.medals || {};
    migrateKnowledgeLevels(profile);
  }

  function knowledgeEffect() {
    var out = {
      startCashAdd: 0,
      startLivesAdd: 0,
      towerDiscount: {},
      categoryDiscount: {},
      allTowerDiscount: 0,
      farmIncomeAdd: 0,
      militaryCamo: false,
      camoAll: false,
      leadAll: false,
      damageAdd: 0,
      pierceAdd: 0,
      pierceMul: skillRebirthPierceMul(),
      radiusAdd: 0,
      rateMul: 1,
      upgradeDiscountMul: 1,
      sellRate: SELL_RATE,
      roundCashAdd: 0,
      kpEvery5Add: 0,
      iceSlowAdd: 0,
      glueSlowFactorAdd: 0,
      spikePierceAdd: 0,
      villageRadiusAdd: 0,
      sentryMaxAdd: 0,
      kindDamageAdd: {},
      kindPierceAdd: {},
      kindSplashAdd: {},
      kindRateMul: {},
    };
    function addKeyed(dst, src, mul) {
      if (!src) return;
      mul = mul == null ? 1 : mul;
      Object.keys(src).forEach(function (k) {
        dst[k] = (dst[k] || 0) + src[k] * mul;
      });
    }
    function mulKeyed(dst, src, times) {
      if (!src) return;
      var t, k;
      for (t = 0; t < times; t++) {
        Object.keys(src).forEach(function (key) {
          dst[key] = (dst[key] != null ? dst[key] : 1) * src[key];
        });
      }
    }
    var levels = profile.knowledgeLevels || {};
    Object.keys(levels).forEach(function (id) {
      var lvl = levels[id] | 0;
      if (lvl < 1) return;
      if (lvl > 3) lvl = 3;
      var node = DATA.knowledgeNodes.find(function (n) { return n.id === id; });
      if (!node || !node.effect) return;
      var e = node.effect;
      var i;
      if (e.startCashAdd) out.startCashAdd += e.startCashAdd * lvl;
      if (e.startLivesAdd) out.startLivesAdd += e.startLivesAdd * lvl;
      if (e.farmIncomeAdd) out.farmIncomeAdd += e.farmIncomeAdd * lvl;
      if (e.damageAdd) out.damageAdd += e.damageAdd * lvl;
      if (e.pierceAdd) out.pierceAdd += e.pierceAdd * lvl;
      if (e.radiusAdd) out.radiusAdd += e.radiusAdd * lvl;
      if (e.allTowerDiscount) out.allTowerDiscount += e.allTowerDiscount * lvl;
      if (e.roundCashAdd) out.roundCashAdd += e.roundCashAdd * lvl;
      if (e.kpEvery5Add) out.kpEvery5Add += e.kpEvery5Add * lvl;
      if (e.iceSlowAdd) out.iceSlowAdd += e.iceSlowAdd * lvl;
      if (e.glueSlowFactorAdd) out.glueSlowFactorAdd += e.glueSlowFactorAdd * lvl;
      if (e.spikePierceAdd) out.spikePierceAdd += e.spikePierceAdd * lvl;
      if (e.villageRadiusAdd) out.villageRadiusAdd += e.villageRadiusAdd * lvl;
      if (e.sentryMaxAdd) out.sentryMaxAdd += e.sentryMaxAdd * lvl;
      if (e.rateMul) {
        for (i = 0; i < lvl; i++) out.rateMul *= e.rateMul;
      }
      if (e.upgradeDiscountMul) {
        for (i = 0; i < lvl; i++) out.upgradeDiscountMul *= e.upgradeDiscountMul;
      }
      if (e.sellRate != null) {
        out.sellRate = Math.max(out.sellRate, Math.min(0.95, e.sellRate + 0.05 * (lvl - 1)));
      }
      if (e.camoAll) {
        out.camoAll = true;
        if (lvl > 1) out.radiusAdd += 8 * (lvl - 1);
      }
      if (e.leadAll) {
        out.leadAll = true;
        if (lvl > 1) out.damageAdd += lvl - 1;
      }
      if (e.militaryCamo) {
        out.militaryCamo = true;
        if (lvl > 1) out.radiusAdd += 5 * (lvl - 1);
      }
      addKeyed(out.towerDiscount, e.towerDiscount, lvl);
      addKeyed(out.categoryDiscount, e.categoryDiscount, lvl);
      addKeyed(out.kindDamageAdd, e.kindDamageAdd, lvl);
      addKeyed(out.kindPierceAdd, e.kindPierceAdd, lvl);
      addKeyed(out.kindSplashAdd, e.kindSplashAdd, lvl);
      mulKeyed(out.kindRateMul, e.kindRateMul, lvl);
    });
    (profile.ownedStore || []).forEach(function (id) {
      var sku = DATA.trophyStore.find(function (s) { return s.id === id; });
      if (sku && sku.effect && sku.effect.startCashAdd) out.startCashAdd += sku.effect.startCashAdd;
    });
    return out;
  }

  /* ─── Path system ─── */
  function clampPathNodes(nodes, w, h) {
    var margin = 28;
    var out = [];
    var i, n, x, y;
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      x = n.x;
      y = n.y;
      /* Keep entrances slightly off-canvas; pin exits ON canvas so leaks are visible */
      if (i === nodes.length - 1) {
        x = clamp(x, margin, w - margin);
        y = clamp(y, margin, h - margin);
      } else if (i === 0) {
        x = clamp(x, -40, w + 40);
        y = clamp(y, -40, h + 40);
      }
      out.push({ x: x, y: y, z: n.z || 0 });
    }
    return out;
  }

  function buildPath(nodes) {
    var segs = [];
    var total = 0;
    var i;
    for (i = 0; i < nodes.length - 1; i++) {
      var a = nodes[i], b = nodes[i + 1];
      var len = dist(a.x, a.y, b.x, b.y);
      segs.push(len);
      total += len;
    }
    return { nodes: nodes, segmentLength: segs, totalLength: total };
  }

  function PositionAt(path, s) {
    var nodes = path.nodes;
    if (s <= 0) {
      var a0 = nodes[0], a1 = nodes[1];
      var dx = a1.x - a0.x, dy = a1.y - a0.y;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      var t = s / len;
      return { x: a0.x + dx * t, y: a0.y + dy * t, z: 0 };
    }
    if (s >= path.totalLength) {
      var last = nodes[nodes.length - 1];
      return { x: last.x, y: last.y, z: last.z || 0 };
    }
    var rem = s;
    var i;
    for (i = 0; i < path.segmentLength.length; i++) {
      var seg = path.segmentLength[i];
      if (rem <= seg) {
        var u = rem / seg;
        var n0 = nodes[i], n1 = nodes[i + 1];
        return { x: lerp(n0.x, n1.x, u), y: lerp(n0.y, n1.y, u), z: 0 };
      }
      rem -= seg;
    }
    var end = nodes[nodes.length - 1];
    return { x: end.x, y: end.y, z: 0 };
  }

  function TangentAt(path, s) {
    var nodes = path.nodes;
    var ss = clamp(s, 0.001, path.totalLength - 0.001);
    var rem = ss;
    var i;
    for (i = 0; i < path.segmentLength.length; i++) {
      if (rem <= path.segmentLength[i]) {
        var n0 = nodes[i], n1 = nodes[i + 1];
        var dx = n1.x - n0.x, dy = n1.y - n0.y;
        var len = Math.sqrt(dx * dx + dy * dy) || 1;
        return { x: dx / len, y: dy / len, z: 0 };
      }
      rem -= path.segmentLength[i];
    }
    return { x: 1, y: 0, z: 0 };
  }

  function distToPath(path, x, y) {
    var best = Infinity;
    var i;
    for (i = 0; i < path.nodes.length - 1; i++) {
      var a = path.nodes[i], b = path.nodes[i + 1];
      var dx = b.x - a.x, dy = b.y - a.y;
      var len2 = dx * dx + dy * dy || 1;
      var t = clamp(((x - a.x) * dx + (y - a.y) * dy) / len2, 0, 1);
      var px = a.x + dx * t, py = a.y + dy * t;
      var d = dist(x, y, px, py);
      if (d < best) best = d;
    }
    return best;
  }

  function nearestPathDist(paths, x, y) {
    var best = Infinity, i;
    for (i = 0; i < paths.length; i++) {
      var d = distToPath(paths[i], x, y);
      if (d < best) best = d;
    }
    return best;
  }

  function nearestPathS(path, x, y) {
    var best = Infinity, bestS = 0, acc = 0, i;
    for (i = 0; i < path.nodes.length - 1; i++) {
      var a = path.nodes[i], b = path.nodes[i + 1];
      var dx = b.x - a.x, dy = b.y - a.y;
      var len2 = dx * dx + dy * dy || 1;
      var len = Math.sqrt(len2);
      var t = clamp(((x - a.x) * dx + (y - a.y) * dy) / len2, 0, 1);
      var px = a.x + dx * t, py = a.y + dy * t;
      var d = dist(x, y, px, py);
      if (d < best) {
        best = d;
        bestS = acc + t * len;
      }
      acc += len;
    }
    return bestS;
  }

  /* ─── Crosspath (BTD6: ≤2 paths, ≤7 tiers, only one path ≥T3, crosspath ≤T2) ─── */
  function canBuyUpgrade(paths, pathIndex, nextTier) {
    var p = [paths[0], paths[1], paths[2]];
    if (pathIndex < 0 || pathIndex > 2) return false;
    if (nextTier < 1 || nextTier > 5) return false;
    /* Must buy tiers in order on this path */
    if (p[pathIndex] !== nextTier - 1) return false;

    /* Simulate the purchase */
    var next = [p[0], p[1], p[2]];
    next[pathIndex] = nextTier;

    var used = 0;
    var i;
    var highest = 0;
    var second = 0;
    for (i = 0; i < 3; i++) {
      if (next[i] > 0) used++;
      if (next[i] > highest) {
        second = highest;
        highest = next[i];
      } else if (next[i] > second) {
        second = next[i];
      }
    }
    /* At most two paths may have any upgrades */
    if (used > 2) return false;
    /* Cap total purchased tiers (5-2-0 = 7) */
    if (next[0] + next[1] + next[2] > 7) return false;
    /* Only one path may be T3+; the crosspath max is T2 */
    if (highest >= 3 && second > 2) return false;
    /* Only one Tier 5 */
    var t5 = 0;
    for (i = 0; i < 3; i++) if (next[i] === 5) t5++;
    if (t5 > 1) return false;

    return true;
  }

  /* ─── Stat resolution ─── */
  function resolveTowerStats(kind, paths, auras) {
    var def = DATA.towers[kind];
    var atk = def.attack;
    var proj = def.projectile;
    var stats = {
      radius: atk.radius,
      rate: atk.rate,
      damage: atk.damage,
      pierce: atk.pierce,
      damageTypes: (atk.damageTypes || []).slice(),
      splashRadius: proj.splashRadius || 0,
      projSpeed: proj.speed != null ? proj.speed : 400,
      projType: proj.type || 'dart',
      volley: 1,
      tack: atk.tack || 0,
      moabBonus: 0,
      canHitCamo: !!atk.canHitCamo,
      canPopLead: !!atk.canPopLead,
      incomePerSecond: (def.income && def.income.perSecond) || 0,
      incomePerRound: 0,
      village: !!atk.village,
      spikes: !!atk.spikes,
      engineer: !!atk.engineer,
      sentryMax: atk.sentryMax || 0,
      sentryRange: atk.sentryRange || 80,
      frost: !!atk.frost,
      glue: !!atk.glue,
      potion: !!atk.potion || proj.type === 'potion',
      slowDuration: atk.slowDuration || 0,
      slowFactor: atk.slowFactor != null ? atk.slowFactor : 0.5,
      cryoCannon: false,
      glueMoab: false,
      auraRateMul: 1,
      auraCamo: false,
      auraRegrowBlock: false,
      auraRadiusAdd: 0,
      auraDamageAdd: 0,
      minecraft: !!atk.minecraft,
      roblox: !!atk.roblox,
      rngMonkey: !!atk.rngMonkey,
      mcWeapons: [],
      rbxGear: [],
      rbxAura: false,
      rbxAdmin: false,
      mcSpawnEgg: false,
      luck: 0,
      rollDiscount: 0,
    };
    var pathKeys = ['path0', 'path1', 'path2'];
    var pi, ti;
    for (pi = 0; pi < 3; pi++) {
      var arr = def.upgrades[pathKeys[pi]] || [];
      for (ti = 0; ti < paths[pi]; ti++) {
        var mod = arr[ti] && arr[ti].modifiers;
        if (!mod) continue;
        if (mod.damageAdd) stats.damage += mod.damageAdd;
        if (mod.pierceAdd) stats.pierce += mod.pierceAdd;
        if (mod.radiusAdd) stats.radius += mod.radiusAdd;
        if (mod.rateMul) stats.rate *= mod.rateMul;
        if (mod.volleyAdd) stats.volley += mod.volleyAdd;
        if (mod.tackAdd) stats.tack += mod.tackAdd;
        if (mod.moabBonusAdd) stats.moabBonus += mod.moabBonusAdd;
        if (mod.splashRadiusAdd) stats.splashRadius += mod.splashRadiusAdd;
        if (mod.incomePerSecondAdd) stats.incomePerSecond += mod.incomePerSecondAdd;
        if (mod.incomePerRoundAdd) stats.incomePerRound += mod.incomePerRoundAdd;
        if (mod.sentryMaxAdd) stats.sentryMax += mod.sentryMaxAdd;
        if (mod.sentryRangeAdd) stats.sentryRange += mod.sentryRangeAdd;
        if (mod.slowDurationAdd) stats.slowDuration += mod.slowDurationAdd;
        if (mod.slowFactorAdd) {
          stats.slowFactor = Math.max(0, Math.min(0.95, stats.slowFactor + mod.slowFactorAdd));
        }
        if (mod.luckAdd) stats.luck += mod.luckAdd;
        if (mod.rollDiscountAdd) stats.rollDiscount += mod.rollDiscountAdd;
        if (mod.mcWeapon && stats.mcWeapons.indexOf(mod.mcWeapon) < 0) stats.mcWeapons.push(mod.mcWeapon);
        if (mod.rbxGear && stats.rbxGear.indexOf(mod.rbxGear) < 0) stats.rbxGear.push(mod.rbxGear);
        if (mod.auraRateMul) stats.auraRateMul *= mod.auraRateMul;
        if (mod.auraRadiusAdd) stats.auraRadiusAdd += mod.auraRadiusAdd;
        if (mod.auraDamageAdd) stats.auraDamageAdd += mod.auraDamageAdd;
        if (mod.flags) {
          if (mod.flags.canHitCamo) stats.canHitCamo = true;
          if (mod.flags.canPopLead) stats.canPopLead = true;
          if (mod.flags.auraCamo) stats.auraCamo = true;
          if (mod.flags.auraRegrowBlock) stats.auraRegrowBlock = true;
          if (mod.flags.rbxAura) stats.rbxAura = true;
          if (mod.flags.rbxAdmin) stats.rbxAdmin = true;
          if (mod.flags.mcSpawnEgg) stats.mcSpawnEgg = true;
          if (mod.flags.cryoCannon) {
            stats.cryoCannon = true;
            stats.projType = 'orb';
            stats.projSpeed = stats.projSpeed > 0 ? stats.projSpeed : 500;
            if (stats.splashRadius <= 0) stats.splashRadius = 70;
          }
          if (mod.flags.glueMoab) stats.glueMoab = true;
          if (mod.flags.damageTypesAdd) {
            mod.flags.damageTypesAdd.forEach(function (dt) {
              if (stats.damageTypes.indexOf(dt) < 0) stats.damageTypes.push(dt);
            });
          }
        }
      }
    }
    if (auras) {
      if (auras.camo) stats.canHitCamo = true;
      if (auras.rateMul) stats.rate *= auras.rateMul;
      if (auras.damageAdd) stats.damage += auras.damageAdd;
      if (auras.radiusAdd) stats.radius += auras.radiusAdd;
    }
    stats.rate = Math.max(0.05, stats.rate);
    stats.radius = Math.max(0, stats.radius);
    stats.pierce = Math.max(1, Math.floor(stats.pierce));
    return stats;
  }

  function towerCost(kind) {
    var def = DATA.towers[kind];
    var ke = knowledgeEffect();
    var disc = (ke.towerDiscount && ke.towerDiscount[kind]) || 0;
    disc += ke.allTowerDiscount || 0;
    if (ke.categoryDiscount && def.category && ke.categoryDiscount[def.category]) {
      disc += ke.categoryDiscount[def.category];
    }
    return Math.max(0, def.baseCost - disc);
  }

  function upgradeCost(kind, pathIndex, tier) {
    var def = DATA.towers[kind];
    var arr = def.upgrades['path' + pathIndex];
    if (!arr || !arr[tier - 1]) return 0;
    var ke = knowledgeEffect();
    var cost = arr[tier - 1].cost;
    if (ke.upgradeDiscountMul && ke.upgradeDiscountMul !== 1) {
      cost = Math.floor(cost * ke.upgradeDiscountMul);
    }
    return Math.max(0, cost);
  }

  function sellRefund(tower) {
    var ke = battle && battle.ke ? battle.ke : knowledgeEffect();
    var rate = ke.sellRate != null ? ke.sellRate : SELL_RATE;
    return Math.floor(tower.invested * rate);
  }

  /* ─── Battle state ─── */
  function createBattle(mapId, opts) {
    opts = opts || {};
    var map = DATA.maps[mapId];
    if (!map) throw new Error('Unknown map: ' + mapId);
    var ke = opts.pvp ? {
      startCashAdd: 0, startLivesAdd: 0, towerDiscount: {}, categoryDiscount: {},
      allTowerDiscount: 0, farmIncomeAdd: 0, militaryCamo: false, camoAll: false, leadAll: false,
      damageAdd: 0, pierceAdd: 0, pierceMul: skillRebirthPierceMul(), radiusAdd: 0, rateMul: 1, upgradeDiscountMul: 1,
      sellRate: SELL_RATE, roundCashAdd: 0, kpEvery5Add: 0, iceSlowAdd: 0, glueSlowFactorAdd: 0,
      spikePierceAdd: 0, villageRadiusAdd: 0, sentryMaxAdd: 0,
      kindDamageAdd: {}, kindPierceAdd: {}, kindSplashAdd: {}, kindRateMul: {},
    } : knowledgeEffect();
    var paths = map.paths.map(function (p) {
      return buildPath(clampPathNodes(p.nodes, map.width, map.height));
    });
    var monkeyCash = opts.monkeyCash != null ? opts.monkeyCash : (map.startCash + ke.startCashAdd);
    var lives = opts.lives != null ? opts.lives : (map.startLives + ke.startLivesAdd);
    var maxRound = opts.pvp ? (opts.maxTurns || 20) : 40;
    return {
      mapId: mapId,
      map: map,
      paths: paths,
      cash: monkeyCash,
      lives: lives,
      round: 0,
      maxRound: maxRound,
      gameSpeed: 1,
      paused: false,
      roundActive: false,
      won: false,
      lost: false,
      towers: [],
      bloons: [],
      projectiles: [],
      spikes: [],
      acidPools: [],
      mcMinecarts: [],
      rbxObby: [],
      particles: [],
      nextId: 1,
      selectedTowerId: null,
      placingKind: null,
      ghostOk: false,
      ghostX: 0,
      ghostY: 0,
      buyCategory: 'primary',
      targetingDefault: 'first',
      autoStart: false,
      autoStartTimer: 0,
      spawner: null,
      incomeAcc: 0,
      roundsSurvived: 0,
      spent: 0,
      ke: ke,
      /* 2-player */
      pvp: !!opts.pvp,
      pvpPhase: opts.pvp ? 'build' : null,
      p1Role: opts.p1Role || 'monkey',
      bloonCash: opts.bloonCash != null ? opts.bloonCash : 200,
      bloonQueue: [],
      pvpQueuedCount: 0,
      leakCashPerLife: 8,
    };
  }

  function uid() {
    return battle.nextId++;
  }

  /* ─── Bloons ─── */
  function isBlimpType(typeId) {
    var t = DATA.bloonTypes[typeId];
    return !!(t && t.blimp);
  }

  function spawnBloon(opts) {
    var typeId = opts.type;
    if (opts.fortified && typeId === 'ceramic') typeId = 'fortified_ceramic';
    var def = DATA.bloonTypes[typeId];
    if (!def) return null;
    var pathIdx = opts.entrance != null ? opts.entrance : 0;
    if (!battle.paths[pathIdx]) pathIdx = 0;
    var path = battle.paths[pathIdx];
    var startDist = opts.distance != null ? opts.distance : (opts.pretrack ? -80 : 0);
    /* Never spawn already past the exit (child pops near the end) */
    if (path && startDist >= path.totalLength - 4) {
      startDist = Math.max(0, path.totalLength - 12);
    }
    var layerHp = def.layerHp || 1;
    var hullHp = def.hullHp || 0;
    if (opts.fortified && hullHp > 0) hullHp = Math.floor(hullHp * 2);
    var b = {
      id: uid(),
      type: typeId,
      def: def,
      pathIndex: pathIdx,
      distance: startDist,
      speedMul: opts.speedMul || 1,
      camo: !!(opts.camo || def.camo),
      regrow: !!opts.regrow,
      fortified: !!(opts.fortified || def.fortified),
      layerHp: layerHp,
      maxLayerHp: layerHp,
      hullHp: hullHp,
      maxHullHp: hullHp,
      alive: true,
      regrowTimer: 0,
      rbe: def.rbe || 1,
      slowT: 0,
      slowFactor: 1,
      glued: false,
      frozen: false,
      poisonT: 0,
      poisonDps: 0,
      bubbled: false,
      bubbleT: 0,
    };
    battle.bloons.push(b);
    return b;
  }

  function popBloon(b, cashMul) {
    if (!b.alive) return;
    b.alive = false;
    var cash = Math.max(1, Math.floor((b.def.rbe || 1) * 0.15 * (cashMul || 1)));
    if (b.def.blimp) cash = Math.floor((b.def.rbe || 100) * 0.02);
    battle.cash += cash;
    var path = battle.paths[b.pathIndex];
    var children = b.def.children || [];
    var spawned = [];
    children.forEach(function (ch) {
      var c;
      for (c = 0; c < ch.count; c++) spawned.push(ch.type);
    });
    var i;
    for (i = 0; i < spawned.length; i++) {
      var spacing = isBlimpType(spawned[i]) ? BLIMP_SPACING : CHILD_SPACING;
      var childType = spawned[i];
      var childFort = !!b.fortified;
      if (childFort && childType === 'ceramic') childType = 'fortified_ceramic';
      spawnBloon({
        type: childType,
        entrance: b.pathIndex,
        distance: b.distance - (14 + i * spacing),
        speedMul: b.speedMul,
        camo: b.camo && DATA.bloonTypes[childType] && DATA.bloonTypes[childType].camo ? true : false,
        regrow: b.regrow,
        fortified: childFort && childType !== 'fortified_ceramic',
      });
    }
    battle.particles.push({ x: PositionAt(path, b.distance).x, y: PositionAt(path, b.distance).y, life: 0.25, color: b.def.color });
  }

  function damageBloon(b, amount, damageTypes, canPopLead, moabBonus) {
    if (!b.alive) return 0;
    var types = damageTypes || [];
    var immune = b.def.immune || [];
    var isLead = !!(b.def.lead || (b.def.tags && b.def.tags.indexOf('lead') >= 0));
    var blocked = false;
    if (immune.length && types.length) {
      var effective = types.slice();
      /* canPopLead bypasses Sharp immunity on lead/DDT */
      if (canPopLead && isLead) {
        effective = effective.filter(function (dt) { return dt !== DATA.DAMAGE.SHARP; });
        if (effective.length === 0) effective = [DATA.DAMAGE.NORMAL];
      }
      var allImmune = effective.every(function (dt) { return immune.indexOf(dt) >= 0; });
      if (allImmune) blocked = true;
    }
    if (isLead && !canPopLead) {
      var hasNonSharp = types.some(function (dt) {
        return dt !== DATA.DAMAGE.SHARP;
      });
      if (!hasNonSharp) blocked = true;
    }
    if (blocked) return 0;

    var dmg = amount;
    if (b.def.blimp && moabBonus) dmg += moabBonus;
    var dealt = 0;

    if (b.hullHp > 0) {
      var h = Math.min(b.hullHp, dmg);
      b.hullHp -= h;
      dealt += h;
      dmg -= h;
      if (b.hullHp <= 0) {
        popBloon(b, 1);
        return dealt;
      }
      return dealt;
    }

    while (dmg > 0 && b.alive) {
      var take = Math.min(b.layerHp, dmg);
      b.layerHp -= take;
      dealt += take;
      dmg -= take;
      if (b.layerHp <= 0) {
        if (b.regrow && b.maxLayerHp > 1) {
          /* ceramic-style: pop to children */
        }
        popBloon(b, 1);
        break;
      }
    }
    return dealt;
  }

  function canTowerHitBloon(stats, b) {
    if (!b.alive) return false;
    if (b.camo && !stats.canHitCamo) return false;
    return true;
  }

  /** Apply glue / freeze slow. White/zebra immune to freeze; MOABs need glueMoab. */
  function applySlowStatus(b, duration, factor, opts) {
    if (!b || !b.alive || duration <= 0) return false;
    opts = opts || {};
    var immune = b.def.immune || [];
    if (opts.freeze) {
      if (immune.indexOf(DATA.DAMAGE.FREEZE) >= 0) return false;
      if (b.type === 'white' || b.type === 'zebra') return false;
    }
    if (opts.glue && b.def.blimp && !opts.glueMoab) return false;
    b.slowT = Math.max(b.slowT || 0, duration);
    var f = opts.freeze ? 0 : (factor != null ? factor : 0.5);
    if (b.slowFactor == null || b.slowFactor > f) b.slowFactor = f;
    if (opts.glue) b.glued = true;
    if (opts.freeze) b.frozen = true;
    return true;
  }

  function icePulse(tower, stats) {
    var hits = 0;
    var i, b, path, pos;
    for (i = 0; i < battle.bloons.length; i++) {
      b = battle.bloons[i];
      if (!canTowerHitBloon(stats, b)) continue;
      path = battle.paths[b.pathIndex];
      pos = PositionAt(path, Math.max(0, b.distance));
      if (dist(tower.x, tower.y, pos.x, pos.y) > stats.radius + (b.def.r || 10)) continue;
      if (applySlowStatus(b, stats.slowDuration || 1.4, 0, { freeze: true })) {
        hits++;
        if (stats.damage > 0) {
          damageBloon(b, stats.damage, stats.damageTypes, stats.canPopLead, stats.moabBonus);
        }
      }
    }
    /* Frost burst visual */
    battle.particles.push({
      x: tower.x,
      y: tower.y,
      life: 0.35,
      color: 'rgba(160,220,255,0.55)',
      r: stats.radius,
    });
    return hits;
  }

  function applyGlueHit(b, p) {
    applySlowStatus(b, p.slowDuration || 3, p.slowFactor != null ? p.slowFactor : 0.4, {
      glue: true,
      glueMoab: !!p.glueMoab,
    });
    if (p.damage > 0) {
      damageBloon(b, p.damage, p.damageTypes, p.canPopLead, p.moabBonus);
    }
  }

  /** Apply acid poison DoT + slow; chance to trap in a bubble. */
  function applyPotionEffects(b, opts) {
    if (!b || !b.alive) return;
    opts = opts || {};
    var slowDur = opts.slowDuration != null ? opts.slowDuration : 2.8;
    var slowFac = opts.slowFactor != null ? opts.slowFactor : 0.55;
    applySlowStatus(b, slowDur, slowFac, {});
    b.poisonT = Math.max(b.poisonT || 0, opts.poisonDuration != null ? opts.poisonDuration : 3.5);
    b.poisonDps = Math.max(b.poisonDps || 0, opts.poisonDps != null ? opts.poisonDps : 1.15);
    if (opts.damage > 0) {
      damageBloon(b, opts.damage, opts.damageTypes, opts.canPopLead, opts.moabBonus);
    }
    /* Occasional bubble trap — stronger potions bubble more often */
    var bubbleChance = opts.bubbleChance != null ? opts.bubbleChance : 0.18;
    if (!b.def.blimp && Math.random() < bubbleChance) {
      b.bubbled = true;
      b.bubbleT = Math.max(b.bubbleT || 0, opts.bubbleDuration != null ? opts.bubbleDuration : 1.6);
      b.slowT = Math.max(b.slowT || 0, b.bubbleT);
      b.slowFactor = Math.min(b.slowFactor != null ? b.slowFactor : 1, 0.08);
    }
  }

  function spawnAcidPool(x, y, opts) {
    if (!battle.acidPools) battle.acidPools = [];
    opts = opts || {};
    var r = Math.max(28, opts.radius || 42);
    battle.acidPools.push({
      id: uid(),
      x: x,
      y: y,
      r: r,
      life: opts.life != null ? opts.life : 3.2,
      maxLife: opts.life != null ? opts.life : 3.2,
      damage: opts.damage || 1,
      poisonDps: opts.poisonDps != null ? opts.poisonDps : 1.15,
      poisonDuration: opts.poisonDuration != null ? opts.poisonDuration : 3.2,
      slowDuration: opts.slowDuration != null ? opts.slowDuration : 2.8,
      slowFactor: opts.slowFactor != null ? opts.slowFactor : 0.55,
      bubbleChance: opts.bubbleChance != null ? opts.bubbleChance : 0.12,
      damageTypes: (opts.damageTypes || [DATA.DAMAGE.ACID, DATA.DAMAGE.NORMAL]).slice(),
      canPopLead: !!opts.canPopLead,
      moabBonus: opts.moabBonus || 0,
      tickAcc: 0,
    });
    /* Burst ring so the green circle is obvious on impact */
    battle.particles.push({
      x: x,
      y: y,
      life: 0.45,
      color: 'rgba(80,220,60,0.75)',
      r: r,
      kind: 'acidBurst',
    });
  }

  function applyPotionSplash(x, y, radius, p) {
    var j, b, path, pos;
    for (j = 0; j < battle.bloons.length; j++) {
      b = battle.bloons[j];
      if (!b.alive) continue;
      path = battle.paths[b.pathIndex];
      pos = PositionAt(path, Math.max(0, b.distance));
      if (dist(x, y, pos.x, pos.y) <= radius + (b.def.r || 10)) {
        if (p.hit) p.hit[b.id] = true;
        applyPotionEffects(b, {
          damage: p.damage,
          damageTypes: p.damageTypes,
          canPopLead: p.canPopLead,
          moabBonus: p.moabBonus,
          slowDuration: p.slowDuration,
          slowFactor: p.slowFactor,
          poisonDps: p.poisonDps,
          poisonDuration: p.poisonDuration,
          bubbleChance: p.bubbleChance != null ? p.bubbleChance : 0.22,
        });
      }
    }
    spawnAcidPool(x, y, {
      radius: radius,
      damage: Math.max(1, Math.floor((p.damage || 1) * 0.5)),
      poisonDps: p.poisonDps,
      poisonDuration: p.poisonDuration,
      slowDuration: p.slowDuration,
      slowFactor: p.slowFactor,
      bubbleChance: p.bubbleChance != null ? p.bubbleChance * 0.55 : 0.1,
      damageTypes: p.damageTypes,
      canPopLead: p.canPopLead,
      moabBonus: p.moabBonus,
      life: 3.4 + Math.min(2, (radius || 40) / 40),
    });
  }

  function tickAcidPools(dt) {
    if (!battle.acidPools || !battle.acidPools.length) return;
    var i, pool, j, b, path, pos;
    for (i = battle.acidPools.length - 1; i >= 0; i--) {
      pool = battle.acidPools[i];
      pool.life -= dt;
      if (pool.life <= 0) {
        battle.acidPools.splice(i, 1);
        continue;
      }
      pool.tickAcc = (pool.tickAcc || 0) + dt;
      if (pool.tickAcc < 0.28) continue;
      pool.tickAcc = 0;
      for (j = 0; j < battle.bloons.length; j++) {
        b = battle.bloons[j];
        if (!b.alive) continue;
        path = battle.paths[b.pathIndex];
        pos = PositionAt(path, Math.max(0, b.distance));
        if (dist(pool.x, pool.y, pos.x, pos.y) > pool.r + (b.def.r || 10)) continue;
        applyPotionEffects(b, {
          damage: pool.damage,
          damageTypes: pool.damageTypes,
          canPopLead: pool.canPopLead,
          moabBonus: pool.moabBonus,
          slowDuration: pool.slowDuration,
          slowFactor: pool.slowFactor,
          poisonDps: pool.poisonDps,
          poisonDuration: pool.poisonDuration,
          bubbleChance: pool.bubbleChance,
        });
      }
    }
  }

  /* ─── Targeting ─── */
  function pickTarget(tower, stats, mode) {
    var path = null;
    var best = null;
    var bestScore = null;
    var i, b, d, pos;
    for (i = 0; i < battle.bloons.length; i++) {
      b = battle.bloons[i];
      if (!b.alive) continue;
      if (b.distance < -5 && !b.def.blimp) continue;
      if (!canTowerHitBloon(stats, b)) continue;
      path = battle.paths[b.pathIndex];
      pos = PositionAt(path, Math.max(0, b.distance));
      d = dist(tower.x, tower.y, pos.x, pos.y);
      if (d > stats.radius) continue;
      var score;
      if (mode === 'last') score = -b.distance;
      else if (mode === 'close') score = -d;
      else if (mode === 'strong') score = (b.def.rbe || 1) * 1000 + b.distance;
      else score = b.distance; /* first */
      if (bestScore === null || score > bestScore) {
        bestScore = score;
        best = b;
      }
    }
    return best;
  }

  /* ─── Combat ─── */
  var SPIKE_MIN_DROP_DIST = 36;

  function pickSpikeDrop(tower, stats) {
    var path = battle.paths[0];
    if (!path) return null;
    var bestS = null;
    var bestScore = -Infinity;
    var step = 10;
    var s, pos, d, score;
    for (s = 0; s <= path.totalLength; s += step) {
      pos = PositionAt(path, s);
      d = dist(tower.x, tower.y, pos.x, pos.y);
      if (d > stats.radius || d < SPIKE_MIN_DROP_DIST) continue;
      /* Prefer further along the track (bloons hit piles sooner) */
      score = s + d * 0.15;
      if (score > bestScore) {
        bestScore = score;
        bestS = s;
      }
    }
    if (bestS == null) {
      /* Fallback: nearest on-path point, then nudge away from the factory */
      bestS = nearestPathS(path, tower.x, tower.y);
      pos = PositionAt(path, bestS);
      d = dist(tower.x, tower.y, pos.x, pos.y);
      if (d < SPIKE_MIN_DROP_DIST) {
        bestS = Math.min(path.totalLength, bestS + SPIKE_MIN_DROP_DIST);
      }
    }
    pos = PositionAt(path, bestS);
    return { s: bestS, x: pos.x, y: pos.y, pathIndex: 0 };
  }

  function findSentrySpot(eng, stats) {
    var best = null;
    var bestPath = Infinity;
    var a, d, ang, x, y, pd, blocked, i, t;
    for (a = 0; a < 24; a++) {
      for (d = 48; d <= stats.radius; d += 12) {
        ang = (a / 24) * Math.PI * 2;
        x = eng.x + Math.cos(ang) * d;
        y = eng.y + Math.sin(ang) * d;
        if (x < 20 || y < 20 || x > battle.map.width - 20 || y > battle.map.height - 20) continue;
        if (nearestPathDist(battle.paths, x, y) < PATH_WIDTH / 2 + 6) continue;
        if (inWater(x, y)) continue;
        blocked = false;
        for (i = 0; i < battle.towers.length; i++) {
          t = battle.towers[i];
          if (dist(x, y, t.x, t.y) < 28) { blocked = true; break; }
        }
        if (!blocked && eng.sentries) {
          for (i = 0; i < eng.sentries.length; i++) {
            if (dist(x, y, eng.sentries[i].x, eng.sentries[i].y) < 26) {
              blocked = true;
              break;
            }
          }
        }
        if (blocked) continue;
        pd = nearestPathDist(battle.paths, x, y);
        if (pd < bestPath) {
          bestPath = pd;
          best = { x: x, y: y };
        }
      }
    }
    return best;
  }

  function pickTargetFromPoint(x, y, radius, stats, mode) {
    var best = null;
    var bestScore = null;
    var i, b, d, pos, path, score;
    for (i = 0; i < battle.bloons.length; i++) {
      b = battle.bloons[i];
      if (!b.alive) continue;
      if (b.distance < -5 && !b.def.blimp) continue;
      if (!canTowerHitBloon(stats, b)) continue;
      path = battle.paths[b.pathIndex];
      pos = PositionAt(path, Math.max(0, b.distance));
      d = dist(x, y, pos.x, pos.y);
      if (d > radius) continue;
      if (mode === 'last') score = -b.distance;
      else if (mode === 'close') score = -d;
      else if (mode === 'strong') score = (b.def.rbe || 1) * 1000 + b.distance;
      else score = b.distance;
      if (bestScore === null || score > bestScore) {
        bestScore = score;
        best = b;
      }
    }
    return best;
  }

  function fireSentry(sentry, parent, stats, dt) {
    sentry.cooldown -= dt;
    if (sentry.cooldown > 0) return;
    var range = stats.sentryRange || 85;
    var target = pickTargetFromPoint(
      sentry.x, sentry.y, range, stats,
      parent.targeting || battle.targetingDefault
    );
    if (!target) return;
    sentry.cooldown = Math.max(0.25, stats.rate * 0.55);
    var tPath = battle.paths[target.pathIndex];
    var tPos = PositionAt(tPath, Math.max(0, target.distance));
    sentry.aimX = tPos.x;
    sentry.aimY = tPos.y;
    triggerAttackAnim(sentry, 'sentry');
    var dx = tPos.x - sentry.x, dy = tPos.y - sentry.y;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var volley = stats.volley || 1;
    var v;
    for (v = 0; v < volley; v++) {
      var spread = volley > 1 ? (v - (volley - 1) / 2) * 0.1 : 0;
      var c = Math.cos(spread), s2 = Math.sin(spread);
      var ux = dx / len, uy = dy / len;
      battle.projectiles.push({
        id: uid(),
        x: sentry.x + ux * 10,
        y: sentry.y + uy * 10,
        vx: (ux * c - uy * s2) * stats.projSpeed,
        vy: (ux * s2 + uy * c) * stats.projSpeed,
        pierce: stats.pierce,
        damage: stats.damage,
        damageTypes: stats.damageTypes.slice(),
        canPopLead: stats.canPopLead,
        moabBonus: stats.moabBonus,
        splash: stats.splashRadius,
        type: stats.projType || 'nail',
        life: 2.2,
        hit: {},
        targetId: target.id,
        homing: false,
      });
    }
  }

  function engineerTick(tower, stats, dt) {
    if (!tower.sentries) tower.sentries = [];
    var i;
    for (i = 0; i < tower.sentries.length; i++) {
      fireSentry(tower.sentries[i], tower, stats, dt);
    }
    if (tower.sentries.length >= Math.max(1, stats.sentryMax)) return;
    tower.cooldown -= dt;
    if (tower.cooldown > 0) return;
    var spot = findSentrySpot(tower, stats);
    if (!spot) {
      tower.cooldown = 0.4;
      return;
    }
    tower.sentries.push({
      id: uid(),
      x: spot.x,
      y: spot.y,
      cooldown: 0.2,
      aimX: spot.x + 20,
      aimY: spot.y,
      animT: 0,
      animDur: 0,
    });
    tower.cooldown = stats.rate;
    tower.aimX = spot.x;
    tower.aimY = spot.y;
    triggerAttackAnim(tower, 'place');
  }

  /** Dominant upgrade path for cosmetics / attack feel (highest tier wins). */
  function dominantUpgrade(paths) {
    paths = paths || [0, 0, 0];
    var best = 0;
    var pi = 0;
    var i;
    for (i = 0; i < 3; i++) {
      if ((paths[i] || 0) > best) {
        best = paths[i] || 0;
        pi = i;
      }
    }
    return { path: pi, tier: best };
  }

  /** Kick off a short attack pose (throw / recoil / pulse / spin). */
  function triggerAttackAnim(unit, style) {
    if (!unit) return;
    unit.animStyle = style || attackStyleForTower(unit);
    unit.animDur = unit.animStyle === 'pulse' ? 0.42
      : unit.animStyle === 'spin' ? 0.34
      : unit.animStyle === 'lob' ? 0.44
      : unit.animStyle === 'laser' ? 0.18
      : unit.animStyle === 'crossbow' ? 0.3
      : unit.animStyle === 'pult' ? 0.4
      : 0.26;
    unit.animT = unit.animDur;
  }

  function attackStyleForKind(kind) {
    if (kind === 'tack_shooter') return 'spin';
    if (kind === 'ice_monkey') return 'pulse';
    if (kind === 'spike_factory') return 'lob';
    if (kind === 'bomb_shooter' || kind === 'mortar_monkey') return 'kick';
    if (kind === 'sniper_monkey' || kind === 'dartling_gunner') return 'kick';
    if (kind === 'engineer_monkey') return 'place';
    if (kind === 'glue_gunner') return 'squeeze';
    if (kind === 'wizard_monkey' || kind === 'alchemist' || kind === 'druid') return 'cast';
    if (kind === 'super_monkey') return 'flurry';
    if (kind === 'ninja_monkey') return 'flurry';
    if (kind === 'boomerang_monkey') return 'spin';
    return 'throw';
  }

  /** Attack pose style from tower kind + dominant upgrade path. */
  function attackStyleForTower(tower) {
    if (!tower) return 'throw';
    var kind = tower.kind;
    var d = dominantUpgrade(tower.paths);
    var path = d.path;
    var tier = d.tier;

    if (kind === 'dart_monkey') {
      if (path === 0 && tier >= 3) return 'pult';
      if (path === 1 && tier >= 3) return 'crossbow';
      if (path === 2 && tier >= 3) return 'flurry';
      return 'throw';
    }
    if (kind === 'boomerang_monkey') {
      if (path === 1 && tier >= 3) return 'flurry';
      if (path === 2 && tier >= 3) return 'kick';
      return 'spin';
    }
    if (kind === 'ninja_monkey') {
      if (path === 2 && tier >= 3) return 'cast';
      return 'flurry';
    }
    if (kind === 'wizard_monkey') {
      if (path === 0 && tier >= 3) return 'cast';
      if (path === 1 && tier >= 3) return 'pulse';
      return 'cast';
    }
    if (kind === 'super_monkey') {
      if (path === 0 && tier >= 3) return 'laser';
      if (path === 2 && tier >= 3) return 'kick';
      return 'flurry';
    }
    if (kind === 'sniper_monkey') {
      if (path === 1 && tier >= 3) return 'laser';
      return 'crossbow';
    }
    if (kind === 'glue_gunner') {
      if (tier >= 3) return 'squeeze';
      return 'squeeze';
    }
    if (kind === 'bomb_shooter' || kind === 'mortar_monkey') {
      if (tier >= 4) return 'kick';
      return 'lob';
    }
    if (kind === 'ice_monkey') {
      if (tier >= 3 && path === 0) return 'kick';
      return 'pulse';
    }
    if (kind === 'tack_shooter') {
      if (tier >= 4) return 'spin';
      return 'spin';
    }
    if (kind === 'druid') {
      if (path === 0) return 'cast';
      if (path === 2 && tier >= 3) return 'pulse';
      return 'throw';
    }
    if (kind === 'alchemist') return 'cast';
    if (kind === 'dartling_gunner') return tier >= 3 ? 'laser' : 'kick';
    if (kind === 'monkey_ace' || kind === 'heli_pilot') return 'flurry';
    if (kind === 'monkey_sub' || kind === 'monkey_buccaneer') return tier >= 3 ? 'kick' : 'throw';
    return attackStyleForKind(kind);
  }

  function tickAttackAnims(dt) {
    if (!battle) return;
    var i, t, s;
    for (i = 0; i < battle.towers.length; i++) {
      t = battle.towers[i];
      if (t.animT > 0) t.animT = Math.max(0, t.animT - dt);
      if (t.sentries) {
        for (s = 0; s < t.sentries.length; s++) {
          if (t.sentries[s].animT > 0) {
            t.sentries[s].animT = Math.max(0, t.sentries[s].animT - dt);
          }
        }
      }
    }
  }

  /** 0..1 progress through current attack (1 = windup start, 0 = idle). */
  function attackAnimProgress(unit) {
    if (!unit || !unit.animT || !unit.animDur) return 0;
    return unit.animT / unit.animDur;
  }

  /**
   * Squash / stretch / recoil pose from attack progress.
   * p: 1 → 0 as the anim plays out.
   */
  function applyAttackPose(ctx, unit, facing) {
    var p = attackAnimProgress(unit);
    if (p <= 0) return { flash: 0, style: null };
    var style = unit.animStyle || 'throw';
    var u = 1 - p; /* 0 at start → 1 at end */
    var sx = 1, sy = 1, ox = 0, oy = 0, spin = 0, flash = 0;

    if (style === 'throw' || style === 'squeeze' || style === 'cast' || style === 'flurry' || style === 'sentry') {
      /* Wind-up lean back, then lunge forward + squash */
      if (u < 0.28) {
        var w = u / 0.28;
        sx = 1 - 0.12 * w;
        sy = 1 + 0.14 * w;
        ox = -Math.cos(facing) * 3 * w;
        oy = -Math.sin(facing) * 3 * w;
      } else if (u < 0.55) {
        var s = (u - 0.28) / 0.27;
        sx = 0.88 + 0.28 * s;
        sy = 1.14 - 0.32 * s;
        ox = Math.cos(facing) * (5 + 4 * s);
        oy = Math.sin(facing) * (5 + 4 * s);
        flash = 1 - s;
      } else {
        var e = (u - 0.55) / 0.45;
        var ease = 1 - (1 - e) * (1 - e);
        sx = 1.16 - 0.16 * ease;
        sy = 0.82 + 0.18 * ease;
        ox = Math.cos(facing) * 9 * (1 - ease);
        oy = Math.sin(facing) * 9 * (1 - ease);
        flash = Math.max(0, 0.45 - ease);
      }
      if (style === 'squeeze') {
        sx *= 0.92 + 0.08 * Math.sin(u * Math.PI);
        sy *= 1.08 - 0.08 * Math.sin(u * Math.PI);
      }
      if (style === 'flurry') spin = Math.sin(u * Math.PI * 4) * 0.25;
    } else if (style === 'kick') {
      var k = u < 0.35 ? u / 0.35 : 1 - (u - 0.35) / 0.65;
      ox = -Math.cos(facing) * 7 * k;
      oy = -Math.sin(facing) * 7 * k;
      sx = 1 + 0.1 * k;
      sy = 1 - 0.08 * k;
      flash = u < 0.4 ? 1 - u / 0.4 : 0;
    } else if (style === 'spin') {
      spin = u * Math.PI * 2;
      sx = 1 + 0.15 * Math.sin(u * Math.PI);
      sy = 1 - 0.1 * Math.sin(u * Math.PI);
      flash = Math.sin(u * Math.PI);
    } else if (style === 'pulse') {
      var pulse = Math.sin(u * Math.PI);
      sx = 1 + 0.35 * pulse;
      sy = 1 + 0.35 * pulse;
      flash = pulse;
    } else if (style === 'lob') {
      if (u < 0.45) {
        var up = u / 0.45;
        oy = -10 * Math.sin(up * Math.PI);
        sy = 1 + 0.2 * up;
        sx = 1 - 0.12 * up;
      } else {
        var down = (u - 0.45) / 0.55;
        oy = -4 * (1 - down);
        sx = 1 + 0.15 * Math.sin(down * Math.PI);
        sy = 1 - 0.12 * Math.sin(down * Math.PI);
        flash = down < 0.3 ? 1 : 0;
      }
    } else if (style === 'place') {
      var pl = Math.sin(u * Math.PI);
      oy = -6 * pl;
      sx = 1 - 0.1 * pl;
      sy = 1 + 0.15 * pl;
    } else if (style === 'crossbow') {
      /* Hard kick-back then settle */
      if (u < 0.2) {
        var cw = u / 0.2;
        ox = -Math.cos(facing) * 8 * cw;
        oy = -Math.sin(facing) * 8 * cw;
        sx = 1 - 0.08 * cw;
        sy = 1 + 0.1 * cw;
      } else if (u < 0.5) {
        var cs = (u - 0.2) / 0.3;
        ox = Math.cos(facing) * (2 + 6 * cs);
        oy = Math.sin(facing) * (2 + 6 * cs);
        flash = 1 - cs * 0.4;
        sx = 1.12 - 0.05 * cs;
        sy = 0.9 + 0.05 * cs;
      } else {
        var ce = (u - 0.5) / 0.5;
        ox = Math.cos(facing) * 8 * (1 - ce);
        oy = Math.sin(facing) * 8 * (1 - ce);
        flash = Math.max(0, 0.35 - ce);
      }
    } else if (style === 'pult') {
      /* Rear wind-up, big throw arc */
      if (u < 0.4) {
        var pw = u / 0.4;
        ox = -Math.cos(facing) * 6 * pw;
        oy = -Math.sin(facing) * 6 * pw - 4 * pw;
        sy = 1 + 0.22 * pw;
        sx = 1 - 0.14 * pw;
        spin = -0.35 * pw;
      } else {
        var ps = (u - 0.4) / 0.6;
        var pe = Math.sin(ps * Math.PI);
        ox = Math.cos(facing) * 10 * pe;
        oy = Math.sin(facing) * 10 * pe;
        spin = 0.5 * (1 - ps);
        flash = ps < 0.45 ? 1 - ps / 0.45 : 0;
        sx = 1 + 0.15 * pe;
        sy = 1 - 0.12 * pe;
      }
    } else if (style === 'laser') {
      var lz = Math.sin(u * Math.PI);
      sx = 1 + 0.08 * lz;
      sy = 1 - 0.06 * lz;
      ox = Math.cos(facing) * 3 * lz;
      oy = Math.sin(facing) * 3 * lz;
      flash = 0.5 + 0.5 * lz;
    }

    ctx.translate(ox, oy);
    ctx.rotate(spin);
    ctx.scale(sx, sy);
    return { flash: flash, style: style, facing: facing };
  }

  function drawMuzzleFlash(ctx, facing, intensity, style) {
    if (intensity <= 0.05) return;
    ctx.save();
    ctx.rotate(facing);
    ctx.globalAlpha = Math.min(1, intensity);
    var col = style === 'cast' ? '#c8a0ff'
      : style === 'squeeze' ? '#ffb040'
      : style === 'pulse' ? '#a0e8ff'
      : style === 'laser' ? '#ff40ff'
      : style === 'crossbow' ? '#ffe080'
      : style === 'pult' ? '#c8a060'
      : style === 'flurry' ? '#a0f0ff'
      : '#fff0a0';
    ctx.fillStyle = col;
    if (style === 'laser') {
      ctx.fillRect(10, -2, 28 + 10 * intensity, 4);
      ctx.beginPath();
      ctx.arc(12, 0, 5 + 2 * intensity, 0, Math.PI * 2);
      ctx.fill();
    } else if (style === 'pult') {
      ctx.beginPath();
      ctx.arc(12, -4, 6 + 2 * intensity, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8a6030';
      ctx.fillRect(4, -2, 10, 4);
    } else if (style === 'crossbow') {
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(28, -3);
      ctx.lineTo(28, 3);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(12, 0, 3 + 2 * intensity, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(22, -6);
      ctx.lineTo(18, 0);
      ctx.lineTo(22, 6);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(14, 0, 4 + 3 * intensity, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  /* ─── Special monkeys (Minecraft / Roblox / RNG) ─── */
  var MC_MOBS = ['zombie', 'skeleton', 'creeper', 'spider', 'enderman', 'blaze', 'golem', 'witch', 'piglin'];

  function nearestPathPoint(x, y) {
    var best = null;
    var bestD = 1e15;
    var pi, s, path, pos, d, step;
    for (pi = 0; pi < battle.paths.length; pi++) {
      path = battle.paths[pi];
      if (!path || !path.totalLength) continue;
      step = Math.max(12, path.totalLength / 40);
      for (s = 0; s <= path.totalLength; s += step) {
        pos = PositionAt(path, s);
        d = dist2(x, y, pos.x, pos.y);
        if (d < bestD) {
          bestD = d;
          best = { x: pos.x, y: pos.y, pathIndex: pi, distance: s };
        }
      }
    }
    return best;
  }

  function specialMeleeHit(tower, stats, tx, ty, splash, dmgMul) {
    var dmg = Math.max(1, Math.ceil(stats.damage * (dmgMul || 1)));
    applySplash(tx, ty, splash || 20, dmg, stats.damageTypes, stats.canPopLead, stats.moabBonus, null);
    battle.particles.push({ x: tx, y: ty, life: 0.25, color: '#fda', kind: 'hit' });
  }

  function fireMcWeapon(tower, stats, weapon, target, tPos) {
    var ux = tPos.x - tower.x, uy = tPos.y - tower.y;
    var len = Math.sqrt(ux * ux + uy * uy) || 1;
    ux /= len; uy /= len;
    if (weapon === 'sword' || weapon === 'axe' || weapon === 'netherite' || weapon === 'mace' || weapon === 'spear') {
      specialMeleeHit(tower, stats, tPos.x, tPos.y,
        weapon === 'axe' || weapon === 'mace' ? 30 : 18,
        weapon === 'mace' ? 1.6 : weapon === 'netherite' ? 1.35 : 1);
      return;
    }
    if (weapon === 'bow' || weapon === 'trident' || weapon === 'dragon') {
      var st = Object.assign({}, stats, {
        projType: weapon === 'trident' ? 'spike' : (weapon === 'dragon' ? 'orb' : 'dart'),
        projSpeed: weapon === 'dragon' ? 280 : 520,
        splashRadius: weapon === 'dragon' ? Math.max(40, stats.splashRadius) : stats.splashRadius,
      });
      spawnProjectile(tower, st, ux, uy, target.id);
      return;
    }
    if (weapon === 'tnt' || weapon === 'endcrystal' || weapon === 'bedrock' || weapon === 'wither' || weapon === 'potion') {
      var st2 = Object.assign({}, stats, {
        projType: weapon === 'potion' ? 'glue' : 'bomb',
        projSpeed: 340,
        splashRadius: Math.max(28, stats.splashRadius || 32),
        canPopLead: true,
      });
      if (weapon === 'potion') {
        spawnGlueProjectile(tower, Object.assign({}, st2, {
          slowDuration: 2.2,
          slowFactor: 0.45 + Math.random() * 0.25,
        }), ux, uy, target.id);
      } else {
        spawnProjectile(tower, st2, ux, uy, target.id);
      }
      return;
    }
    if (weapon === 'minecart') {
      var drop = nearestPathPoint(tower.x, tower.y);
      if (!drop) return;
      battle.mcMinecarts.push({
        pathIndex: drop.pathIndex,
        distance: Math.max(0, drop.distance - 20),
        speed: 90 + stats.damage * 8,
        damage: Math.max(2, stats.damage + 1),
        pierce: Math.max(4, stats.pierce + 2),
        pops: 0,
        maxPops: Math.max(6, stats.pierce + 4),
        splash: stats.splashRadius > 0 ? stats.splashRadius : 0,
        canPopLead: stats.canPopLead,
        moabBonus: stats.moabBonus,
        damageTypes: stats.damageTypes.slice(),
        life: 8,
      });
      return;
    }
    if (weapon === 'spawnegg') {
      /* handled on timer */
      return;
    }
    spawnProjectile(tower, stats, ux, uy, target.id);
  }

  function tickMcSpawnEgg(tower, stats, dt) {
    if (!stats.mcSpawnEgg) return;
    tower.mcMobTimer = (tower.mcMobTimer || 0) - dt;
    if (tower.mcMobTimer > 0) return;
    tower.mcMobTimer = 8;
    var mob = MC_MOBS[Math.floor(Math.random() * MC_MOBS.length)];
    tower.mcMob = { kind: mob, ang: Math.random() * Math.PI * 2 };
    battle.particles.push({ x: tower.x, y: tower.y - 18, life: 0.5, color: '#6a4', kind: 'spawn' });
  }

  function tickMcMob(tower, stats, dt) {
    if (!tower.mcMob) return;
    tower.mcMob.ang += dt * 1.6;
    var mx = tower.x + Math.cos(tower.mcMob.ang) * 36;
    var my = tower.y + Math.sin(tower.mcMob.ang) * 36;
    var target = pickTarget({ x: mx, y: my, kind: tower.kind }, Object.assign({}, stats, { radius: stats.radius * 0.85 }), tower.targeting || 'first');
    if (!target) return;
    var path = battle.paths[target.pathIndex];
    var pos = PositionAt(path, Math.max(0, target.distance));
    if (dist(mx, my, pos.x, pos.y) > 42) return;
    var dmg = Math.max(1, Math.ceil(stats.damage * 0.75));
    if (tower.mcMob.kind === 'creeper' || tower.mcMob.kind === 'blaze') {
      applySplash(pos.x, pos.y, 28, dmg + 1, stats.damageTypes, true, stats.moabBonus, null);
    } else     if (tower.mcMob.kind === 'skeleton') {
      var dx = pos.x - mx, dy = pos.y - my;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      spawnProjectile(Object.assign({}, tower, { x: mx, y: my }), stats, dx / len, dy / len, target.id);
    } else {
      damageBloon(target, dmg, stats.damageTypes, stats.canPopLead, stats.moabBonus);
    }
  }

  function fireMinecraftTower(tower, stats, dt) {
    tickMcSpawnEgg(tower, stats, dt);
    tickMcMob(tower, stats, dt);
    tower.cooldown -= dt;
    if (tower.cooldown > 0) return;
    var target = pickTarget(tower, stats, tower.targeting || battle.targetingDefault);
    if (!target) return;
    tower.cooldown = stats.rate;
    var tPath = battle.paths[target.pathIndex];
    var tPos = PositionAt(tPath, Math.max(0, target.distance));
    tower.aimX = tPos.x;
    tower.aimY = tPos.y;
    triggerAttackAnim(tower, 'kick');
    var weapons = (stats.mcWeapons && stats.mcWeapons.length) ? stats.mcWeapons.slice() : ['fist'];
    var wi;
    for (wi = 0; wi < weapons.length; wi++) {
      fireMcWeapon(tower, stats, weapons[wi], target, tPos);
    }
  }

  function fireRobloxTower(tower, stats, dt) {
    if (stats.rbxAura || stats.rbxAdmin) {
      tower.rbxAuraTimer = (tower.rbxAuraTimer || 0) - dt;
      if (tower.rbxAuraTimer <= 0) {
        tower.rbxAuraTimer = stats.rbxAdmin ? 0.35 : 0.55;
        var j, b, path, pos;
        for (j = 0; j < battle.bloons.length; j++) {
          b = battle.bloons[j];
          if (!b.alive) continue;
          path = battle.paths[b.pathIndex];
          pos = PositionAt(path, Math.max(0, b.distance));
          if (dist(tower.x, tower.y, pos.x, pos.y) > stats.radius) continue;
          damageBloon(b, Math.max(1, Math.ceil(stats.damage * 0.35)), stats.damageTypes, stats.canPopLead, stats.moabBonus);
          if (stats.rbxAdmin) applySlowStatus(b, 0.8, 0.35, { freeze: false });
        }
      }
    }
    tower.cooldown -= dt;
    if (tower.cooldown > 0) return;
    var target = pickTarget(tower, stats, tower.targeting || battle.targetingDefault);
    if (!target) return;
    tower.cooldown = stats.rate;
    var tPath = battle.paths[target.pathIndex];
    var tPos = PositionAt(tPath, Math.max(0, target.distance));
    tower.aimX = tPos.x;
    tower.aimY = tPos.y;
    triggerAttackAnim(tower, 'kick');
    var gear = stats.rbxGear || [];
    var hasObby = gear.indexOf('obby') >= 0 || gear.indexOf('steps') >= 0 || gear.indexOf('killbrick') >= 0 || gear.indexOf('coil') >= 0 || gear.indexOf('voidobby') >= 0;
    if (hasObby) {
      var drop = nearestPathPoint(tower.x, tower.y);
      if (drop) {
        battle.rbxObby.push({
          x: drop.x,
          y: drop.y,
          pathIndex: drop.pathIndex,
          distance: drop.distance,
          damage: Math.max(1, stats.damage),
          pierce: gear.indexOf('voidobby') >= 0 ? 12 : (gear.indexOf('killbrick') >= 0 ? 6 : 3),
          pops: 0,
          slowT: 0.5 + (stats.slowDuration || 0) * 0.25,
          slowFactor: 0.55,
          kill: gear.indexOf('killbrick') >= 0 || gear.indexOf('voidobby') >= 0,
          life: 10,
          color: gear.indexOf('voidobby') >= 0 ? '#402060' : (gear.indexOf('killbrick') >= 0 ? '#c22' : '#4a8'),
        });
      }
    }
    var ux = tPos.x - tower.x, uy = tPos.y - tower.y;
    var len = Math.sqrt(ux * ux + uy * uy) || 1;
    ux /= len; uy /= len;
    if (gear.indexOf('banhammer') >= 0 || gear.indexOf('sword') >= 0) {
      specialMeleeHit(tower, stats, tPos.x, tPos.y, gear.indexOf('banhammer') >= 0 ? 34 : 18, gear.indexOf('banhammer') >= 0 ? 1.5 : 1);
    }
    var volley = stats.volley || 1;
    var v;
    for (v = 0; v < volley; v++) {
      var spread = volley > 1 ? (v - (volley - 1) / 2) * 0.1 : 0;
      var c2 = Math.cos(spread), s2 = Math.sin(spread);
      var stLaser = Object.assign({}, stats, {
        projType: gear.indexOf('laser') >= 0 || gear.indexOf('adminlaser') >= 0 ? 'laser' : 'dart',
        projSpeed: 560,
      });
      spawnProjectile(tower, stLaser, ux * c2 - uy * s2, ux * s2 + uy * c2, target.id);
    }
  }

  function tickMcMinecarts(dt) {
    if (!battle.mcMinecarts) return;
    var i, mc, path, pos, j, b, bpos;
    for (i = battle.mcMinecarts.length - 1; i >= 0; i--) {
      mc = battle.mcMinecarts[i];
      mc.life -= dt;
      path = battle.paths[mc.pathIndex];
      if (!path || mc.life <= 0 || mc.pops >= mc.maxPops) {
        battle.mcMinecarts.splice(i, 1);
        continue;
      }
      mc.distance += mc.speed * dt;
      if (mc.distance >= path.totalLength) {
        battle.mcMinecarts.splice(i, 1);
        continue;
      }
      pos = PositionAt(path, mc.distance);
      for (j = battle.bloons.length - 1; j >= 0; j--) {
        b = battle.bloons[j];
        if (!b.alive) continue;
        bpos = PositionAt(battle.paths[b.pathIndex], Math.max(0, b.distance));
        if (dist(pos.x, pos.y, bpos.x, bpos.y) > 18) continue;
        if (mc.splash > 0) {
          applySplash(pos.x, pos.y, mc.splash, mc.damage, mc.damageTypes, mc.canPopLead, mc.moabBonus, null);
          mc.pops += 3;
          battle.particles.push({ x: pos.x, y: pos.y, life: 0.35, color: '#f64', kind: 'boom' });
          break;
        }
        if (damageBloon(b, mc.damage, mc.damageTypes, mc.canPopLead, mc.moabBonus) > 0) {
          mc.pops++;
          if (mc.pops >= mc.maxPops) break;
        }
      }
    }
  }

  function tickRbxObby(dt) {
    if (!battle.rbxObby) return;
    var i, o, j, b, path, pos;
    for (i = battle.rbxObby.length - 1; i >= 0; i--) {
      o = battle.rbxObby[i];
      o.life -= dt;
      if (o.life <= 0 || o.pops >= o.pierce) {
        battle.rbxObby.splice(i, 1);
        continue;
      }
      for (j = 0; j < battle.bloons.length; j++) {
        b = battle.bloons[j];
        if (!b.alive) continue;
        path = battle.paths[b.pathIndex];
        pos = PositionAt(path, Math.max(0, b.distance));
        if (dist(o.x, o.y, pos.x, pos.y) > 16) continue;
        damageBloon(b, o.damage + (o.kill ? 1 : 0), [DATA.DAMAGE.SHARP], o.kill, 0);
        applySlowStatus(b, o.slowT, o.slowFactor, {});
        o.pops++;
        if (o.pops >= o.pierce) break;
      }
    }
  }

  function rollRngMonkey(tower) {
    if (!tower || tower.kind !== 'rng_monkey' || !global.BTD6_SPECIAL) return;
    var st = statsForTower(tower);
    var cost = global.BTD6_SPECIAL.rollCost(st.rollDiscount || 0);
    if (battle.cash < cost) {
      toast(tr('toast.rngNeedCash'));
      return;
    }
    battle.cash -= cost;
    tower.invested += cost;
    var luck = (tower.rngLuck || 0) + (st.luck || 0);
    var roll = global.BTD6_SPECIAL.pickRoll(luck);
    tower.rngRollId = roll.id;
    var meta = global.BTD6_SPECIAL.rarityMeta(roll.rarity);
    toast(tr('toast.rngRolled', { name: roll.name, rarity: meta.label }));
    refreshInspect();
    refreshHud();
  }

  function fireTower(tower, stats, dt) {
    if (stats.village || (stats.incomePerSecond > 0 && !stats.spikes && stats.damage <= 0 && stats.projType === 'none')) {
      return;
    }

    /* Engineer builds & relies on sentries — never fires from its own body */
    if (stats.engineer || tower.kind === 'engineer_monkey') {
      engineerTick(tower, stats, dt);
      return;
    }

    if (stats.minecraft || tower.kind === 'minecraft_monkey') {
      fireMinecraftTower(tower, stats, dt);
      return;
    }
    if (stats.roblox || tower.kind === 'roblox_monkey') {
      fireRobloxTower(tower, stats, dt);
      return;
    }

    if (stats.spikes) {
      tower.cooldown -= dt;
      if (tower.cooldown > 0) return;
      var drop = pickSpikeDrop(tower, stats);
      if (!drop) return;
      tower.cooldown = stats.rate;
      tower.aimX = drop.x;
      tower.aimY = drop.y;
      triggerAttackAnim(tower, 'lob');
      /* Lob a spike projectile from the factory onto the track (not onto itself) */
      var dx = drop.x - tower.x, dy = drop.y - tower.y;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      var spd = stats.projSpeed > 0 ? stats.projSpeed : 320;
      battle.projectiles.push({
        id: uid(),
        x: tower.x,
        y: tower.y - 8,
        vx: (dx / len) * spd,
        vy: (dy / len) * spd,
        pierce: 0,
        damage: 0,
        damageTypes: [],
        canPopLead: false,
        moabBonus: 0,
        splash: 0,
        type: 'spike',
        life: Math.max(0.35, len / spd + 0.05),
        hit: {},
        targetId: null,
        homing: false,
        spikePlace: true,
        spikeDrop: {
          x: drop.x,
          y: drop.y,
          pathIndex: drop.pathIndex,
          distance: drop.s,
          pierce: stats.pierce,
          damage: stats.damage,
          damageTypes: stats.damageTypes.slice(),
          canPopLead: stats.canPopLead,
          moabBonus: stats.moabBonus,
        },
      });
      return;
    }

    /* Ice Monkey: freeze pulse around itself — does not shoot (unless Cryo Cannon) */
    if ((stats.frost || tower.kind === 'ice_monkey') && !stats.cryoCannon) {
      tower.cooldown -= dt;
      if (tower.cooldown > 0) return;
      tower.cooldown = stats.rate;
      triggerAttackAnim(tower, 'pulse');
      icePulse(tower, stats);
      return;
    }

    /* Glue Gunner: shoots glue globs that slow — never treated as a normal dart attacker */
    if (stats.glue || tower.kind === 'glue_gunner') {
      tower.cooldown -= dt;
      if (tower.cooldown > 0) return;
      var glueTarget = pickTarget(tower, stats, tower.targeting || battle.targetingDefault);
      if (!glueTarget) return;
      tower.cooldown = stats.rate;
      var gPath = battle.paths[glueTarget.pathIndex];
      var gPos = PositionAt(gPath, Math.max(0, glueTarget.distance));
      tower.aimX = gPos.x;
      tower.aimY = gPos.y;
      triggerAttackAnim(tower, 'squeeze');
      var gdx = gPos.x - tower.x, gdy = gPos.y - tower.y;
      var glen = Math.sqrt(gdx * gdx + gdy * gdy) || 1;
      spawnGlueProjectile(tower, stats, gdx / glen, gdy / glen, glueTarget.id);
      return;
    }

    /* Alchemist: throws potions that splash into a green poison/slow pool */
    if (stats.potion || tower.kind === 'alchemist' || stats.projType === 'potion') {
      tower.cooldown -= dt;
      if (tower.cooldown > 0) return;
      var potTarget = pickTarget(tower, stats, tower.targeting || battle.targetingDefault);
      if (!potTarget) return;
      tower.cooldown = stats.rate;
      var pPath = battle.paths[potTarget.pathIndex];
      var pPos = PositionAt(pPath, Math.max(0, potTarget.distance));
      tower.aimX = pPos.x;
      tower.aimY = pPos.y;
      triggerAttackAnim(tower, 'cast');
      var pdx = pPos.x - tower.x, pdy = pPos.y - tower.y;
      var plen = Math.sqrt(pdx * pdx + pdy * pdy) || 1;
      spawnPotionProjectile(tower, stats, pdx / plen, pdy / plen, potTarget.id);
      return;
    }

    tower.cooldown -= dt;
    if (tower.cooldown > 0) return;
    var target = pickTarget(tower, stats, tower.targeting || battle.targetingDefault);
    if (!target) return;
    tower.cooldown = stats.rate;
    var tPath = battle.paths[target.pathIndex];
    var tPos = PositionAt(tPath, Math.max(0, target.distance));
    tower.aimX = tPos.x;
    tower.aimY = tPos.y;
    triggerAttackAnim(tower, attackStyleForTower(tower));

    if (stats.tack > 0) {
      var n = stats.tack;
      var a;
      for (a = 0; a < n; a++) {
        var ang = (Math.PI * 2 * a) / n;
        spawnProjectile(tower, stats, Math.cos(ang), Math.sin(ang), null);
      }
      return;
    }

    var volley = stats.volley || 1;
    var v;
    for (v = 0; v < volley; v++) {
      var dx2 = tPos.x - tower.x, dy2 = tPos.y - tower.y;
      var len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
      var spread = volley > 1 ? (v - (volley - 1) / 2) * 0.08 : 0;
      var c2 = Math.cos(spread), s2 = Math.sin(spread);
      var ux = dx2 / len2, uy = dy2 / len2;
      spawnProjectile(tower, stats, ux * c2 - uy * s2, ux * s2 + uy * c2, target.id);
    }
  }

  function spawnGlueProjectile(tower, stats, ux, uy, targetId) {
    var muzzle = 14;
    battle.projectiles.push({
      id: uid(),
      x: tower.x + ux * muzzle,
      y: tower.y + uy * muzzle,
      vx: ux * (stats.projSpeed || 360),
      vy: uy * (stats.projSpeed || 360),
      pierce: Math.max(1, stats.pierce),
      damage: stats.damage,
      damageTypes: stats.damageTypes.slice(),
      canPopLead: stats.canPopLead,
      moabBonus: stats.moabBonus,
      splash: stats.splashRadius,
      type: 'glue',
      life: 2.5,
      hit: {},
      targetId: targetId,
      homing: true,
      glue: true,
      slowDuration: stats.slowDuration || 3.2,
      slowFactor: stats.slowFactor != null ? stats.slowFactor : 0.4,
      glueMoab: !!stats.glueMoab,
    });
  }

  function spawnPotionProjectile(tower, stats, ux, uy, targetId) {
    var muzzle = 16;
    var splash = Math.max(36, stats.splashRadius || 42);
    battle.projectiles.push({
      id: uid(),
      x: tower.x + ux * muzzle,
      y: tower.y + uy * muzzle - 4,
      vx: ux * (stats.projSpeed || 300),
      vy: uy * (stats.projSpeed || 300),
      pierce: 1,
      damage: Math.max(1, stats.damage),
      damageTypes: stats.damageTypes.slice(),
      canPopLead: stats.canPopLead,
      moabBonus: stats.moabBonus,
      splash: splash,
      type: 'potion',
      life: 2.8,
      hit: {},
      targetId: targetId,
      homing: true,
      potion: true,
      slowDuration: stats.slowDuration > 0 ? stats.slowDuration : 2.8,
      slowFactor: stats.slowFactor != null ? stats.slowFactor : 0.55,
      poisonDps: 1.0 + stats.damage * 0.35,
      poisonDuration: 3.5,
      bubbleChance: 0.2 + Math.min(0.25, (stats.splashRadius || 0) / 200),
    });
  }

  function spawnProjectile(tower, stats, ux, uy, targetId) {
    /* Spawn ahead of the monkey so shots don't appear inside the sprite */
    var muzzle = 14;
    battle.projectiles.push({
      id: uid(),
      x: tower.x + ux * muzzle,
      y: tower.y + uy * muzzle,
      vx: ux * stats.projSpeed,
      vy: uy * stats.projSpeed,
      pierce: stats.pierce,
      damage: stats.damage,
      damageTypes: stats.damageTypes.slice(),
      canPopLead: stats.canPopLead,
      moabBonus: stats.moabBonus,
      splash: stats.splashRadius,
      type: stats.projType,
      life: 2.5,
      hit: {},
      targetId: targetId,
      homing: stats.projType === 'orb' || stats.projType === 'shuriken',
      frost: !!stats.frost || !!stats.cryoCannon,
      slowDuration: stats.slowDuration || 0,
    });
  }

  function tickProjectiles(dt) {
    var i, p, j, b, path, pos, hitR, drop;
    for (i = battle.projectiles.length - 1; i >= 0; i--) {
      p = battle.projectiles[i];
      p.life -= dt;

      /* Spike factory lob → place pile on the track, never on the factory */
      if (p.spikePlace && p.spikeDrop) {
        drop = p.spikeDrop;
        var ddx = drop.x - p.x, ddy = drop.y - p.y;
        var dlen = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dlen < 12 || p.life <= 0) {
          if (battle.roundActive) {
            battle.spikes.push({
              id: uid(),
              x: drop.x + (Math.random() - 0.5) * 8,
              y: drop.y + (Math.random() - 0.5) * 8,
              pathIndex: drop.pathIndex,
              distance: drop.distance,
              pierce: drop.pierce,
              damage: drop.damage,
              damageTypes: drop.damageTypes,
              canPopLead: drop.canPopLead,
              moabBonus: drop.moabBonus,
              life: 25,
            });
          }
          battle.projectiles.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        continue;
      }

      if (p.life <= 0 || p.pierce <= 0) {
        if ((p.potion || p.type === 'potion') && p.life <= 0 && p.pierce > 0) {
          /* Potion hits the track even if it missed a bloon — leave a green pool */
          applyPotionSplash(p.x, p.y, p.splash || 40, p);
        }
        battle.projectiles.splice(i, 1);
        continue;
      }
      if (p.homing && p.targetId) {
        var tgt = null;
        for (j = 0; j < battle.bloons.length; j++) {
          if (battle.bloons[j].id === p.targetId && battle.bloons[j].alive) { tgt = battle.bloons[j]; break; }
        }
        if (tgt) {
          path = battle.paths[tgt.pathIndex];
          pos = PositionAt(path, Math.max(0, tgt.distance));
          var dx = pos.x - p.x, dy = pos.y - p.y;
          var len = Math.sqrt(dx * dx + dy * dy) || 1;
          var spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          p.vx = (dx / len) * spd;
          p.vy = (dy / len) * spd;
        }
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      for (j = 0; j < battle.bloons.length; j++) {
        b = battle.bloons[j];
        if (!b.alive || p.hit[b.id]) continue;
        path = battle.paths[b.pathIndex];
        pos = PositionAt(path, Math.max(0, b.distance));
        hitR = (b.def.r || 10) + 6;
        if (dist2(p.x, p.y, pos.x, pos.y) > hitR * hitR) continue;
        p.hit[b.id] = true;
        if (p.potion || p.type === 'potion') {
          if (p.splash > 0) {
            applyPotionSplash(pos.x, pos.y, p.splash, p);
          } else {
            applyPotionEffects(b, {
              damage: p.damage,
              damageTypes: p.damageTypes,
              canPopLead: p.canPopLead,
              moabBonus: p.moabBonus,
              slowDuration: p.slowDuration,
              slowFactor: p.slowFactor,
              poisonDps: p.poisonDps,
              poisonDuration: p.poisonDuration,
              bubbleChance: p.bubbleChance,
            });
            spawnAcidPool(pos.x, pos.y, {
              radius: 36,
              damage: p.damage,
              poisonDps: p.poisonDps,
              poisonDuration: p.poisonDuration,
              slowDuration: p.slowDuration,
              slowFactor: p.slowFactor,
              bubbleChance: (p.bubbleChance || 0.2) * 0.5,
              damageTypes: p.damageTypes,
              canPopLead: p.canPopLead,
              moabBonus: p.moabBonus,
            });
          }
          p.pierce = 0;
        } else if (p.glue || p.type === 'glue') {
          if (p.splash > 0) {
            applyGlueSplash(pos.x, pos.y, p.splash, p);
          } else {
            applyGlueHit(b, p);
          }
        } else if (p.frost || (p.damageTypes && p.damageTypes.indexOf(DATA.DAMAGE.FREEZE) >= 0 && p.type === 'orb')) {
          if (p.splash > 0) {
            applyFrostSplash(pos.x, pos.y, p.splash, p);
          } else {
            applySlowStatus(b, p.slowDuration || 1.4, 0, { freeze: true });
            if (p.damage > 0) damageBloon(b, p.damage, p.damageTypes, p.canPopLead, p.moabBonus);
          }
        } else if (p.splash > 0) {
          applySplash(pos.x, pos.y, p.splash, p.damage, p.damageTypes, p.canPopLead, p.moabBonus, p.hit);
        } else {
          damageBloon(b, p.damage, p.damageTypes, p.canPopLead, p.moabBonus);
        }
        p.pierce--;
        if (p.pierce <= 0) break;
      }
      if (p.pierce <= 0) battle.projectiles.splice(i, 1);
    }
  }

  function applyGlueSplash(x, y, radius, p) {
    var j, b, path, pos;
    for (j = 0; j < battle.bloons.length; j++) {
      b = battle.bloons[j];
      if (!b.alive) continue;
      path = battle.paths[b.pathIndex];
      pos = PositionAt(path, Math.max(0, b.distance));
      if (dist(x, y, pos.x, pos.y) <= radius + (b.def.r || 10)) {
        if (p.hit) p.hit[b.id] = true;
        applyGlueHit(b, p);
      }
    }
  }

  function applyFrostSplash(x, y, radius, p) {
    var j, b, path, pos;
    for (j = 0; j < battle.bloons.length; j++) {
      b = battle.bloons[j];
      if (!b.alive) continue;
      path = battle.paths[b.pathIndex];
      pos = PositionAt(path, Math.max(0, b.distance));
      if (dist(x, y, pos.x, pos.y) <= radius + (b.def.r || 10)) {
        if (p.hit) p.hit[b.id] = true;
        applySlowStatus(b, p.slowDuration || 1.4, 0, { freeze: true });
        if (p.damage > 0) damageBloon(b, p.damage, p.damageTypes, p.canPopLead, p.moabBonus);
      }
    }
  }

  function applySplash(x, y, radius, damage, types, canPopLead, moabBonus, already) {
    var j, b, path, pos;
    for (j = 0; j < battle.bloons.length; j++) {
      b = battle.bloons[j];
      if (!b.alive) continue;
      path = battle.paths[b.pathIndex];
      pos = PositionAt(path, Math.max(0, b.distance));
      if (dist(x, y, pos.x, pos.y) <= radius + (b.def.r || 10)) {
        if (already) already[b.id] = true;
        damageBloon(b, damage, types, canPopLead, moabBonus);
      }
    }
  }

  function tickSpikes(dt) {
    var i, s, j, b;
    for (i = battle.spikes.length - 1; i >= 0; i--) {
      s = battle.spikes[i];
      s.life -= dt;
      if (s.life <= 0 || s.pierce <= 0) {
        battle.spikes.splice(i, 1);
        continue;
      }
      for (j = 0; j < battle.bloons.length; j++) {
        b = battle.bloons[j];
        if (!b.alive) continue;
        if (Math.abs(b.distance - s.distance) > 18) continue;
        if (b.pathIndex !== s.pathIndex) continue;
        damageBloon(b, s.damage, s.damageTypes, s.canPopLead, s.moabBonus);
        s.pierce--;
        if (s.pierce <= 0) break;
      }
      if (s.pierce <= 0) battle.spikes.splice(i, 1);
    }
  }

  /* ─── Village auras ─── */
  function getAuraAt(x, y) {
    var aura = { camo: false, rateMul: 1, damageAdd: 0, radiusAdd: 0, regrowBlock: false };
    var i, t, st;
    for (i = 0; i < battle.towers.length; i++) {
      t = battle.towers[i];
      if (t.kind !== 'monkey_village') continue;
      st = resolveTowerStats(t.kind, t.paths, null);
      var r = st.radius + st.auraRadiusAdd;
      if (dist(x, y, t.x, t.y) > r) continue;
      if (st.auraCamo) aura.camo = true;
      if (st.auraRegrowBlock) aura.regrowBlock = true;
      aura.rateMul *= st.auraRateMul;
      aura.damageAdd += st.auraDamageAdd;
      aura.radiusAdd += st.auraRadiusAdd * 0.25;
    }
    return aura;
  }

  function statsForTower(t) {
    var aura = getAuraAt(t.x, t.y);
    var st = resolveTowerStats(t.kind, t.paths, aura);
    var def = DATA.towers[t.kind];
    var ke = battle.ke || knowledgeEffect();
    if ((ke.militaryCamo && def.category === 'military') || ke.camoAll) st.canHitCamo = true;
    if (ke.leadAll) st.canPopLead = true;
    if (ke.damageAdd) st.damage += ke.damageAdd;
    if (ke.pierceAdd) st.pierce += ke.pierceAdd;
    if (ke.radiusAdd) st.radius += ke.radiusAdd;
    if (ke.rateMul && ke.rateMul !== 1) st.rate *= ke.rateMul;
    if (ke.kindDamageAdd && ke.kindDamageAdd[t.kind]) st.damage += ke.kindDamageAdd[t.kind];
    if (ke.kindPierceAdd && ke.kindPierceAdd[t.kind]) st.pierce += ke.kindPierceAdd[t.kind];
    if (ke.kindSplashAdd && ke.kindSplashAdd[t.kind]) st.splashRadius += ke.kindSplashAdd[t.kind];
    if (ke.kindRateMul && ke.kindRateMul[t.kind]) st.rate *= ke.kindRateMul[t.kind];
    if (t.kind === 'ice_monkey' && ke.iceSlowAdd) st.slowDuration += ke.iceSlowAdd;
    if (t.kind === 'glue_gunner' && ke.glueSlowFactorAdd) {
      st.slowFactor = Math.max(0.05, Math.min(0.95, (st.slowFactor != null ? st.slowFactor : 0.4) + ke.glueSlowFactorAdd));
    }
    if (t.kind === 'spike_factory' && ke.spikePierceAdd) st.pierce += ke.spikePierceAdd;
    if (t.kind === 'monkey_village' && ke.villageRadiusAdd) st.radius += ke.villageRadiusAdd;
    if (t.kind === 'engineer_monkey' && ke.sentryMaxAdd) st.sentryMax += ke.sentryMaxAdd;
    if (def.kind === 'banana_farm' || t.kind === 'banana_farm') {
      st.incomePerSecond += ke.farmIncomeAdd || 0;
    }
    if (st.rngMonkey && t.rngRollId && global.BTD6_SPECIAL) {
      global.BTD6_SPECIAL.applyRollModifiers(st, t.rngRollId);
    }
    if (ke.pierceMul && ke.pierceMul !== 1) st.pierce *= ke.pierceMul;
    st.rate = Math.max(0.05, st.rate);
    st.pierce = Math.max(1, Math.floor(st.pierce));
    return st;
  }

  /* ─── Placement ─── */
  function inWater(x, y) {
    function hit(w) {
      if (!w) return false;
      var nx = (x - w.x) / w.rx, ny = (y - w.y) / w.ry;
      return nx * nx + ny * ny <= 1;
    }
    if (hit(battle.map.water)) return true;
    var list = battle.map.waters || [];
    var i;
    for (i = 0; i < list.length; i++) {
      if (hit(list[i])) return true;
    }
    return false;
  }

  function inObstacle(x, y, footprint) {
    var obs = battle.map.obstacles || [];
    var i, o;
    for (i = 0; i < obs.length; i++) {
      o = obs[i];
      if (!o.tags || o.tags.indexOf('blocks_placement') < 0) continue;
      if (Math.abs(x - o.x) < o.w / 2 + footprint && Math.abs(y - o.y) < o.h / 2 + footprint) return true;
    }
    return false;
  }

  function canPlace(kind, x, y) {
    var def = DATA.towers[kind];
    if (!def) return false;
    var fp = def.footprint || 18;
    if (x < fp || y < fp || x > battle.map.width - fp || y > battle.map.height - fp) return false;
    if (nearestPathDist(battle.paths, x, y) < PATH_WIDTH / 2 + 8) return false;
    if (inObstacle(x, y, fp)) return false;
    var water = inWater(x, y);
    if (def.placement === 'water' && !water) return false;
    if (def.placement === 'land' && water) return false;
    var i, t;
    for (i = 0; i < battle.towers.length; i++) {
      t = battle.towers[i];
      var ofp = (DATA.towers[t.kind].footprint || 18);
      if (dist(x, y, t.x, t.y) < fp + ofp) return false;
    }
    return true;
  }

  function placeTower(kind, x, y) {
    if (battle.pvp && battle.pvpPhase !== 'build') {
      toast(tr('toast.monkeyBuildOnly'));
      return false;
    }
    var cost = towerCost(kind);
    if (battle.cash < cost) { toast(tr('toast.notEnoughCash')); return false; }
    if (!canPlace(kind, x, y)) { toast(tr('toast.cannotPlace')); return false; }
    battle.cash -= cost;
    battle.spent += cost;
    var def = DATA.towers[kind];
    var t = {
      id: uid(),
      kind: kind,
      x: x,
      y: y,
      paths: [0, 0, 0],
      targeting: battle.targetingDefault,
      cooldown: 0.15,
      invested: cost,
      aimX: x + 40,
      aimY: y,
      animT: 0,
      animDur: 0,
      animStyle: 'throw',
      sentries: def && def.attack && def.attack.engineer ? [] : null,
      rngRollId: null,
      rngLuck: 0,
      mcMob: null,
      mcMobTimer: 0,
      rbxAuraTimer: 0,
    };
    battle.towers.push(t);
    battle.placingKind = null;
    battle.selectedTowerId = t.id;
    refreshBuyBar();
    refreshInspect();
    return true;
  }

  function sellSelected() {
    if (battle.pvp && battle.pvpPhase !== 'build') {
      toast(tr('toast.sellBuildOnly'));
      return;
    }
    var t = getSelectedTower();
    if (!t) return;
    var refund = sellRefund(t);
    battle.cash += refund;
    battle.towers = battle.towers.filter(function (x) { return x.id !== t.id; });
    battle.selectedTowerId = null;
    refreshInspect();
    refreshHud();
  }

  function getSelectedTower() {
    if (!battle || battle.selectedTowerId == null) return null;
    var i;
    for (i = 0; i < battle.towers.length; i++) {
      if (battle.towers[i].id === battle.selectedTowerId) return battle.towers[i];
    }
    return null;
  }

  function buyUpgrade(pathIndex) {
    if (battle.pvp && battle.pvpPhase !== 'build') {
      toast(tr('toast.upgradeBuildOnly'));
      return;
    }
    var twr = getSelectedTower();
    if (!twr) return;
    var next = twr.paths[pathIndex] + 1;
    if (!canBuyUpgrade(twr.paths, pathIndex, next)) { toast(tr('toast.invalidCrosspath')); return; }
    var cost = upgradeCost(twr.kind, pathIndex, next);
    if (battle.cash < cost) { toast(tr('toast.notEnoughCash')); return; }
    battle.cash -= cost;
    twr.invested += cost;
    twr.paths[pathIndex] = next;
    refreshInspect();
    refreshHud();
  }

  /* ─── Round spawner ─── */
  function startRound() {
    if (!battle || battle.roundActive || battle.won || battle.lost) return;
    if (battle.pvp) {
      toast(tr('toast.useReady'));
      return;
    }
    if (battle.round >= battle.maxRound) return;
    battle.round++;
    var def = DATA.rounds[battle.round];
    if (!def) {
      toast(tr('toast.roundMissing', { n: battle.round }));
      battle.round--;
      return;
    }
    var queue = [];
    var t = 0;
    def.groups.forEach(function (group) {
      t += group.spawnDelaySec || 0;
      var i;
      var pathCount = battle.paths.length || 1;
      for (i = 0; i < group.count; i++) {
        var typeId = group.bloonType;
        if (group.fortified && typeId === 'ceramic') typeId = 'fortified_ceramic';
        var entrance = group.entranceIndex;
        if (entrance == null) {
          entrance = pathCount > 1 ? (i % pathCount) : 0;
        }
        queue.push({
          time: t,
          type: typeId,
          speedMul: (def.globalSpeedMultiplier || 1) * (group.speedMultiplier || 1),
          regrow: !!group.regrow,
          camo: !!group.camo,
          fortified: !!group.fortified,
          entrance: entrance,
          pretrack: !!(group.staggerBehindTrack && isBlimpType(typeId)),
        });
        t += group.intraGapSec || 0.35;
      }
    });
    queue.sort(function (a, b) { return a.time - b.time; });
    battle.spawner = { elapsed: 0, queue: queue, cashBonus: def.cashBonusOnClear || 0 };
    battle.roundActive = true;
    refreshHud();
  }

  /* ─── 2-Player turns ─── */
  function pvpActiveRole() {
    if (!battle || !battle.pvp) return null;
    if (battle.pvpPhase === 'build') return 'monkey';
    if (battle.pvpPhase === 'send') return 'bloon';
    return 'fight';
  }

  function pvpWhoseTurnLabel() {
    var role = pvpActiveRole();
    if (role === 'monkey') {
      return battle.p1Role === 'monkey' ? tr('pvp.turn.p1monkey') : tr('pvp.turn.p2monkey');
    }
    if (role === 'bloon') {
      return battle.p1Role === 'bloon' ? tr('pvp.turn.p1bloon') : tr('pvp.turn.p2bloon');
    }
    return tr('hud.fight');
  }

  function pvpBloonEcoIncome(turn) {
    return 40 + turn * 12;
  }

  function queuePvpBloon(shopId) {
    if (!battle || !battle.pvp || battle.pvpPhase !== 'send' || battle.won || battle.lost) return;
    var item = (DATA.pvpBloonShop || []).find(function (s) { return s.id === shopId; });
    if (!item) return;
    var unlock = item.unlockTurn || 1;
    if (battle.round + 1 < unlock) {
      toast(tr('toast.unlockTurn', { n: unlock }));
      return;
    }
    if (battle.bloonCash < item.cost) {
      toast(tr('toast.needEco'));
      return;
    }
    battle.bloonCash -= item.cost;
    var i;
    var pathCount = battle.paths.length || 1;
    for (i = 0; i < item.count; i++) {
      battle.bloonQueue.push({
        type: item.type,
        camo: !!item.camo,
        regrow: !!item.regrow,
        fortified: !!item.fortified,
        entrance: pathCount > 1 ? ((battle.pvpQueuedCount + i) % pathCount) : 0,
        pretrack: !!item.blimp,
        gap: item.gap || 0.35,
      });
    }
    battle.pvpQueuedCount += item.count;
    toast(tr('toast.queued', { name: bloonShopLabel(item), cost: item.cost }));
    refreshHud();
    refreshBuyBar();
    refreshInspect();
  }

  function pvpReady() {
    if (!battle || !battle.pvp || battle.won || battle.lost || battle.roundActive) return;
    if (battle.pvpPhase === 'build') {
      battle.placingKind = null;
      battle.pvpPhase = 'send';
      battle.bloonQueue = [];
      battle.pvpQueuedCount = 0;
      toast(pvpWhoseTurnLabel());
      refreshBuyBar();
      refreshInspect();
      refreshHud();
      return;
    }
    if (battle.pvpPhase === 'send') {
      if (!battle.bloonQueue.length) {
        toast(tr('toast.emptyWave'));
      }
      startPvpWave();
    }
  }

  function startPvpWave() {
    if (!battle || !battle.pvp) return;
    battle.round++;
    var queue = [];
    var t = 0.15;
    battle.bloonQueue.forEach(function (item) {
      queue.push({
        time: t,
        type: item.type,
        speedMul: 1,
        regrow: !!item.regrow,
        camo: !!item.camo,
        fortified: !!item.fortified,
        entrance: item.entrance || 0,
        pretrack: !!item.pretrack,
      });
      t += item.gap || 0.35;
    });
    battle.bloonQueue = [];
    battle.pvpQueuedCount = 0;
    /* Empty wave still needs a spawner so clear logic can fire */
    if (!queue.length) {
      battle.spawner = { elapsed: 0, queue: [], cashBonus: 40 + battle.round * 5 };
      battle.roundActive = true;
      battle.pvpPhase = 'fight';
      battle.placingKind = null;
      toast(tr('toast.waveEmpty', { n: battle.round }));
      refreshBuyBar();
      refreshHud();
      /* clear on next tick */
      return;
    }
    battle.spawner = { elapsed: 0, queue: queue, cashBonus: 80 + battle.round * 8 };
    battle.roundActive = true;
    battle.pvpPhase = 'fight';
    battle.placingKind = null;
    toast(tr('toast.waveFight', { n: battle.round }));
    refreshBuyBar();
    refreshInspect();
    refreshHud();
  }

  function onPvpWaveCleared() {
    var bonus = endOfRoundCash(battle.round);
    if (battle.spawner && battle.spawner.cashBonus) {
      bonus = Math.max(bonus, battle.spawner.cashBonus);
    }
    battle.cash += bonus;
    /* Bloon eco income for next send */
    var eco = pvpBloonEcoIncome(battle.round);
    battle.bloonCash += eco;
    battle.spikes = [];
    battle.mcMinecarts = [];
    battle.rbxObby = [];
    battle.roundsSurvived = battle.round;
    battle.spawner = null;
    toast(tr('toast.waveClear', { m: bonus, b: eco }));
    if (battle.round >= battle.maxRound) {
      onWin();
      return;
    }
    battle.pvpPhase = 'build';
    refreshBuyBar();
    refreshInspect();
    refreshHud();
    setTimeout(function () {
      if (battle && battle.pvp && !battle.won && !battle.lost) toast(pvpWhoseTurnLabel());
    }, 600);
  }

  function tickSpawner(dt) {
    var sp = battle.spawner;
    if (!sp) return;
    sp.elapsed += dt;
    while (sp.queue.length && sp.queue[0].time <= sp.elapsed) {
      var item = sp.queue.shift();
      spawnBloon(item);
    }
  }

  function endOfRoundCash(roundNum) {
    /* Classic Arthur / BTD end bonus — always pay a clear lump sum */
    var bonus = 100 + roundNum * 10;
    var def = DATA.rounds[roundNum];
    if (def && def.cashBonusOnClear != null && def.cashBonusOnClear > bonus) {
      bonus = def.cashBonusOnClear;
    }
    var ke = (battle && battle.ke) || knowledgeEffect();
    if (ke.roundCashAdd) bonus += ke.roundCashAdd;
    if (battle && battle.towers) {
      battle.towers.forEach(function (t) {
        var st = statsForTower(t);
        if (st.incomePerRound) bonus += st.incomePerRound;
      });
    }
    return Math.max(0, Math.floor(bonus));
  }

  function checkRoundClear() {
    if (!battle.roundActive) return;
    var sp = battle.spawner;
    var anyAlive = battle.bloons.some(function (b) { return b.alive; });
    if (sp && sp.queue.length === 0 && !anyAlive) {
      battle.roundActive = false;
      if (battle.pvp) {
        onPvpWaveCleared();
        return;
      }
      var bonus = endOfRoundCash(battle.round);
      /* Prefer live formula; sp.cashBonus is a hint from spawn time */
      if (!bonus && sp.cashBonus) bonus = Math.floor(sp.cashBonus);
      battle.cash += bonus;
      battle.spikes = [];
      battle.mcMinecarts = [];
      battle.rbxObby = [];
      battle.roundsSurvived = battle.round;
      var msg = bonus > 0 ? tr('toast.endRound', { n: bonus }) : '';
      if (battle.round % 5 === 0) {
        var ke = battle.ke || knowledgeEffect();
        var kpGain = 1 + (ke.kpEvery5Add || 0);
        profile.knowledgePoints += kpGain;
        saveProfile();
        msg = (msg ? msg + ' · ' : '') + tr('toast.kp', { n: kpGain });
      }
      if (msg) toast(msg);
      battle.spawner = null;
      if (battle.round >= battle.maxRound) {
        onWin();
      } else if (battle.autoStart && !battle.won && !battle.lost) {
        /* Short beat so cash/UI update, then auto next round */
        battle.autoStartTimer = 0.45;
      }
      refreshHud();
    }
  }

  function tickAutoStart(dt) {
    if (!battle || battle.pvp || !battle.autoStart || battle.won || battle.lost || battle.paused) return;
    if (battle.roundActive) return;
    if (battle.autoStartTimer > 0) {
      battle.autoStartTimer -= dt;
      if (battle.autoStartTimer <= 0) {
        battle.autoStartTimer = 0;
        startRound();
      }
    }
  }

  function toggleAutoStart() {
    if (!battle || battle.won || battle.lost) return;
    battle.autoStart = !battle.autoStart;
    battle.autoStartTimer = 0;
    if (battle.autoStart && !battle.roundActive && battle.round < battle.maxRound) {
      /* If idle between rounds, kick off immediately */
      startRound();
    }
    refreshHud();
    toast(battle.autoStart ? tr('toast.autoOn') : tr('toast.autoOff'));
  }

  function onWin() {
    battle.won = true;
    battle.paused = true;
    if (battle.pvp) {
      showOverlay('victory', tr('win.mono'), tr('win.monoMsg', { n: battle.round }));
      return;
    }
    profile.trophies += 15 + Math.floor(battle.round / 2);
    profile.monkeyMoney += 50 + battle.round * 2;
    profile.knowledgePoints += 3;
    if (!profile.medals[battle.mapId]) profile.medals[battle.mapId] = {};
    profile.medals[battle.mapId].standard = true;
    saveProfile();
    if (global.ArthurProfile) {
      ArthurProfile.note('bloons_wins');
      ArthurProfile.tryGrantAt('bloon_popper', 'bloons_wins', 5);
      ArthurProfile.tryGrantAt('title_popper', 'bloons_wins', 5, {
        silent: true,
        autoEquip: true,
      });
    }
    showOverlay('victory', tr('win.solo'), tr('win.soloMsg'));
  }

  function onLose() {
    battle.lost = true;
    battle.paused = true;
    if (battle.pvp) {
      showOverlay('defeat', tr('lose.bloon'), tr('lose.bloonMsg', { n: battle.round }));
      return;
    }
    var kp = Math.floor(battle.roundsSurvived / 5);
    if (kp > 0) {
      profile.knowledgePoints += kp;
      saveProfile();
    }
    showOverlay('defeat', tr('lose.solo'), tr('lose.soloMsg', { n: battle.round }));
  }

  function showOverlay(kind, title, msg) {
    if (!ui.overlay) return;
    ui.overlay.classList.remove('hidden');
    ui.overlayTitle.textContent = title;
    ui.overlayMsg.textContent = msg;
    ui.overlay.dataset.kind = kind;
  }

  function hideOverlay() {
    if (ui.overlay) ui.overlay.classList.add('hidden');
  }

  /* ─── Simulation tick ─── */
  function tick(dt) {
    if (!battle || battle.paused || battle.won || battle.lost) return;
    var step = dt * battle.gameSpeed;
    tickSpawner(step);

    /* farms — only earn while a round is running (not between rounds) */
    battle.incomeAcc = 0;
    var i, t, st;
    for (i = 0; i < battle.towers.length; i++) {
      t = battle.towers[i];
      st = statsForTower(t);
      if (battle.roundActive && st.incomePerSecond > 0) {
        battle.cash += st.incomePerSecond * step;
      }
      /* Towers (incl. Spike Factory) only attack / stock during an active round */
      if (battle.roundActive && !st.village && (st.damage > 0 || st.spikes || st.tack > 0 || st.engineer || st.glue || st.frost || st.potion || st.minecraft || st.roblox || st.rngMonkey || t.kind === 'alchemist')) {
        fireTower(t, st, step);
      }
    }

    tickProjectiles(step);
    tickSpikes(step);
    tickAcidPools(step);
    tickMcMinecarts(step);
    tickRbxObby(step);
    tickAttackAnims(step);
    tickAutoStart(step);

    /* bloons move */
    var leakedLives = 0;
    var leakPos = null;
    for (i = battle.bloons.length - 1; i >= 0; i--) {
      var b = battle.bloons[i];
      if (!b.alive) {
        battle.bloons.splice(i, 1);
        continue;
      }
      var path = battle.paths[b.pathIndex] || battle.paths[0];
      if (!path || !path.totalLength) continue;
      var spd = (b.def.speed || 50) * b.speedMul;
      if (b.bubbleT > 0) {
        b.bubbleT -= step;
        b.bubbled = true;
        spd *= 0.05;
        if (b.bubbleT <= 0) {
          b.bubbleT = 0;
          b.bubbled = false;
        }
      }
      if (b.poisonT > 0) {
        b.poisonT -= step;
        var pdps = b.poisonDps || 1;
        damageBloon(b, pdps * step, [DATA.DAMAGE.ACID, DATA.DAMAGE.NORMAL], false, 0);
        if (b.poisonT <= 0) {
          b.poisonT = 0;
          b.poisonDps = 0;
        }
        if (!b.alive) {
          battle.bloons.splice(i, 1);
          continue;
        }
      }
      if (b.slowT > 0) {
        b.slowT -= step;
        spd *= b.slowFactor != null ? b.slowFactor : 0.5;
        if (b.slowT <= 0) {
          b.slowT = 0;
          b.slowFactor = 1;
          b.glued = false;
          b.frozen = false;
        }
      }
      b.distance += spd * step;
      if (b.regrow && b.layerHp < b.maxLayerHp && b.maxLayerHp > 1 && !b.def.blimp) {
        var blocked = false;
        /* village regrow block near any village with flag — simplified: global if any */
        battle.towers.forEach(function (vt) {
          if (vt.kind !== 'monkey_village') return;
          var vs = resolveTowerStats(vt.kind, vt.paths, null);
          if (vs.auraRegrowBlock) {
            var pos = PositionAt(path, Math.max(0, b.distance));
            if (dist(vt.x, vt.y, pos.x, pos.y) <= vs.radius) blocked = true;
          }
        });
        if (!blocked) {
          b.regrowTimer += step;
          if (b.regrowTimer > 1.2) {
            b.regrowTimer = 0;
            b.layerHp = Math.min(b.maxLayerHp, b.layerHp + 1);
          }
        }
      }
      if (b.distance >= path.totalLength) {
        var loss = Math.max(1, b.rbe || 1);
        leakedLives += loss;
        battle.lives -= loss;
        leakPos = PositionAt(path, path.totalLength);
        battle.particles.push({
          x: leakPos.x, y: leakPos.y, life: 0.55, color: '#ff3030', kind: 'leak',
        });
        b.alive = false;
        battle.bloons.splice(i, 1);
      }
    }
    if (leakedLives > 0) {
      if (battle.pvp) {
        var earned = leakedLives * (battle.leakCashPerLife || 8);
        battle.bloonCash += earned;
        toast(tr('toast.leakEco', { n: leakedLives, c: earned }));
      } else {
        toast(tr('toast.leakExit', { n: leakedLives }));
      }
      if (battle.lives <= 0) {
        battle.lives = 0;
        onLose();
        return;
      }
    }

    for (i = battle.particles.length - 1; i >= 0; i--) {
      battle.particles[i].life -= step;
      if (battle.particles[i].life <= 0) battle.particles.splice(i, 1);
    }

    checkRoundClear();
    refreshHud();
  }

  var THEME_PALETTES = {
    grass: { top: '#5cbc68', bot: '#3ea050', path: '#D08040', pathEdge: '#B0B0B0' },
    forest: { top: '#48a858', bot: '#2e8040', path: '#D08040', pathEdge: '#B0B0B0' },
    town: { top: '#68b870', bot: '#489858', path: '#D08040', pathEdge: '#B0B0B0' },
    scrap: { top: '#5a5a48', bot: '#3a3a30', path: '#B5651D', pathEdge: '#8A8A82' },
    beach: { top: '#c8b878', bot: '#a89858', path: '#C4783A', pathEdge: '#9A9A9A' },
    lotus: { top: '#3a6a58', bot: '#2a4a40', path: '#B5651D', pathEdge: '#9A9A9A' },
    candy: { top: '#e898c0', bot: '#c86898', path: '#FF66CC', pathEdge: '#9A9A9A' },
    snow: { top: '#d0e0f0', bot: '#a0b8d0', path: '#B5651D', pathEdge: '#9A9A9A' },
    ice: { top: '#b8d8e8', bot: '#88b0c8', path: '#B5651D', pathEdge: '#9A9A9A' },
    pumpkin: { top: '#4a3828', bot: '#2a1e14', path: '#B5651D', pathEdge: '#9A9A9A' },
    desert: { top: '#c8a868', bot: '#a88848', path: '#C4783A', pathEdge: '#9A9A9A' },
    river: { top: '#3a6a40', bot: '#2a4a30', path: '#B5651D', pathEdge: '#9A9A9A' },
    arena: { top: '#4a6840', bot: '#345030', path: '#B5651D', pathEdge: '#9A9A9A' },
    falls: { top: '#3a6a50', bot: '#284838', path: '#B5651D', pathEdge: '#9A9A9A' },
    lava: { top: '#4a2820', bot: '#2a1410', path: '#8A5030', pathEdge: '#6A6A68' },
    industrial: { top: '#4a4a50', bot: '#303038', path: '#B5651D', pathEdge: '#9A9A9A' },
    pond: { top: '#3a6840', bot: '#2a4830', path: '#B5651D', pathEdge: '#9A9A9A' },
    city: { top: '#3a4858', bot: '#283040', path: '#B5651D', pathEdge: '#9A9A9A' },
    brick: { top: '#6a4038', bot: '#4a2820', path: '#B5651D', pathEdge: '#9A9A9A' },
    ocean: { top: '#2a5870', bot: '#1a3848', path: '#C4783A', pathEdge: '#9A9A9A' },
    farm: { top: '#6a8a38', bot: '#4a6828', path: '#B5651D', pathEdge: '#9A9A9A' },
    cave: { top: '#3a3838', bot: '#222020', path: '#B5651D', pathEdge: '#9A9A9A' },
    bamboo: { top: '#3a6840', bot: '#284830', path: '#B5651D', pathEdge: '#9A9A9A' },
    military: { top: '#4a5438', bot: '#343c28', path: '#B5651D', pathEdge: '#9A9A9A' },
    cyber: { top: '#1a2a3a', bot: '#0a1520', path: '#40c8e0', pathEdge: '#9A9A9A' },
    temple: { top: '#5a4a30', bot: '#3a2e1c', path: '#B5651D', pathEdge: '#9A9A9A' },
    flood: { top: '#2a5848', bot: '#1a3830', path: '#B5651D', pathEdge: '#9A9A9A' },
    swamp: { top: '#3a4828', bot: '#283018', path: '#8A7048', pathEdge: '#9A9A9A' },
    dungeon: { top: '#2a2830', bot: '#16141c', path: '#B5651D', pathEdge: '#9A9A9A' },
    castle: { top: '#3a3848', bot: '#222030', path: '#B5651D', pathEdge: '#9A9A9A' },
    mud: { top: '#5a4830', bot: '#3a3018', path: '#B5651D', pathEdge: '#9A9A9A' },
    canyon: { top: '#a87848', bot: '#785028', path: '#C4783A', pathEdge: '#9A9A9A' },
    stone: { top: '#686860', bot: '#484840', path: '#B5651D', pathEdge: '#9A9A9A' },
    garden: { top: '#3a6848', bot: '#284830', path: '#B5651D', pathEdge: '#9A9A9A' },
    lab: { top: '#2a3a48', bot: '#1a2830', path: '#B5651D', pathEdge: '#9A9A9A' },
    zen: { top: '#4a6858', bot: '#344838', path: '#B5651D', pathEdge: '#9A9A9A' },
    abstract: { top: '#3a4a6a', bot: '#283048', path: '#B5651D', pathEdge: '#9A9A9A' },
  };

  function themePalette(map) {
    return THEME_PALETTES[map.theme] || THEME_PALETTES.grass;
  }

  function drawWaters(ctx, map, sx, sy) {
    sx = sx == null ? 1 : sx;
    sy = sy == null ? 1 : sy;
    function drawOne(ww) {
      if (!ww) return;
      ctx.beginPath();
      ctx.ellipse(ww.x * sx, ww.y * sy, ww.rx * sx, ww.ry * sy, 0, 0, Math.PI * 2);
      var wg = ctx.createRadialGradient(ww.x * sx - 20, ww.y * sy - 20, 10, ww.x * sx, ww.y * sy, ww.rx * sx);
      wg.addColorStop(0, '#5ab0d8');
      wg.addColorStop(1, '#2a6898');
      ctx.fillStyle = wg;
      ctx.fill();
      ctx.strokeStyle = 'rgba(200,240,255,0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    drawOne(map.water);
    (map.waters || []).forEach(drawOne);
  }

  /* ─── Draw ─── */
  function draw() {
    if (!battle || !ui.canvas) return;
    var ctx = ui.ctx;
    var map = battle.map;
    var w = map.width, h = map.height;
    var webglOn = global.BTD6WebGL && global.BTD6WebGL.isActive();

    if (webglOn) {
      global.BTD6WebGL.sync(battle);
      global.BTD6WebGL.render();
      ctx.clearRect(0, 0, w, h);
      drawBattleOverlays(ctx, true);
      return;
    }

    var pal = themePalette(map);
    ctx.clearRect(0, 0, w, h);

    /* ground — saturated BTD6 grass */
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, pal.top);
    g.addColorStop(1, pal.bot);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    var tx, ty;
    for (ty = 0; ty < h; ty += 28) {
      for (tx = (ty / 28) % 2 === 0 ? 0 : 14; tx < w; tx += 28) {
        ctx.fillRect(tx, ty, 14, 14);
      }
    }

    drawWaters(ctx, map);

    /* path — dirt brown flanked by grey stone borders */
    battle.paths.forEach(function (path) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = pal.pathEdge;
      ctx.lineWidth = PATH_WIDTH + 14;
      ctx.beginPath();
      path.nodes.forEach(function (n, i) {
        if (i === 0) ctx.moveTo(n.x, n.y); else ctx.lineTo(n.x, n.y);
      });
      ctx.stroke();
      ctx.strokeStyle = pal.path;
      ctx.lineWidth = PATH_WIDTH;
      ctx.beginPath();
      path.nodes.forEach(function (n, i) {
        if (i === 0) ctx.moveTo(n.x, n.y); else ctx.lineTo(n.x, n.y);
      });
      ctx.stroke();
      ctx.strokeStyle = '#9A7040';
      ctx.lineWidth = Math.max(8, PATH_WIDTH - 12);
      ctx.beginPath();
      path.nodes.forEach(function (n, i) {
        if (i === 0) ctx.moveTo(n.x, n.y); else ctx.lineTo(n.x, n.y);
      });
      ctx.stroke();
    });

    /* Entrance (green) + EXIT (red) markers — leaks happen at EXIT */
    battle.paths.forEach(function (path) {
      var start = path.nodes[0];
      var end = path.nodes[path.nodes.length - 1];
      ctx.fillStyle = 'rgba(60,200,80,0.85)';
      ctx.beginPath();
      ctx.arc(start.x, start.y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'rgba(220,40,40,0.9)';
      ctx.beginPath();
      ctx.arc(end.x, end.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('EXIT', end.x, end.y);
    });

    /* obstacles — stacked cone trees (BTD6 stylized) */
    (map.obstacles || []).forEach(function (o) {
      if (o.obstacleId === 'barn') {
        ctx.fillStyle = '#8a5030';
        ctx.fillRect(o.x - o.w / 2, o.y - o.h / 2, o.w, o.h);
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.strokeRect(o.x - o.w / 2, o.y - o.h / 2, o.w, o.h);
      } else {
        drawConeTree2d(ctx, o.x, o.y, Math.min(o.w, o.h) * 0.45);
      }
    });

    /* spikes on track */
    battle.spikes.forEach(function (s) {
      ctx.fillStyle = '#555';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#aaa';
      ctx.beginPath();
      ctx.moveTo(s.x, s.y - 6);
      ctx.lineTo(s.x + 3, s.y);
      ctx.lineTo(s.x, s.y + 6);
      ctx.lineTo(s.x - 3, s.y);
      ctx.closePath();
      ctx.fill();
    });

    /* Minecraft minecarts */
    (battle.mcMinecarts || []).forEach(function (mc) {
      var path = battle.paths[mc.pathIndex];
      if (!path) return;
      var pos = PositionAt(path, mc.distance);
      ctx.fillStyle = '#555';
      ctx.fillRect(pos.x - 8, pos.y - 6, 16, 10);
      ctx.fillStyle = '#888';
      ctx.fillRect(pos.x - 6, pos.y - 10, 12, 5);
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(pos.x - 5, pos.y + 5, 3, 0, Math.PI * 2);
      ctx.arc(pos.x + 5, pos.y + 5, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    /* Roblox obby blocks */
    (battle.rbxObby || []).forEach(function (o) {
      ctx.fillStyle = o.color || '#4a8';
      ctx.fillRect(o.x - 8, o.y - 8, 16, 16);
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.strokeRect(o.x - 8, o.y - 8, 16, 16);
      if (o.kill) {
        ctx.fillStyle = '#fda';
        ctx.fillRect(o.x - 3, o.y - 3, 6, 6);
      }
    });

    /* towers + engineer sentries */
    battle.towers.forEach(function (t) {
      drawTower(ctx, t);
      if (t.sentries && t.sentries.length) {
        t.sentries.forEach(function (s) {
          drawSentry(ctx, s);
        });
      }
      if (t.mcMob) {
        var mx = t.x + Math.cos(t.mcMob.ang || 0) * 36;
        var my = t.y + Math.sin(t.mcMob.ang || 0) * 36;
        ctx.fillStyle = t.mcMob.kind === 'creeper' ? '#3a8a3a' : (t.mcMob.kind === 'blaze' ? '#f80' : '#6a6');
        ctx.fillRect(mx - 6, my - 8, 12, 14);
        ctx.fillStyle = '#222';
        ctx.fillRect(mx - 3, my - 5, 2, 2);
        ctx.fillRect(mx + 1, my - 5, 2, 2);
      }
      if (t.id === battle.selectedTowerId) {
        var st = statsForTower(t);
        ctx.beginPath();
        ctx.arc(t.x, t.y, st.radius || 20, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,220,100,0.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    /* bloons */
    battle.bloons.forEach(function (b) {
      if (!b.alive) return;
      if (b.distance < -120) return;
      var path = battle.paths[b.pathIndex];
      var pos = PositionAt(path, b.distance);
      drawBloon(ctx, b, pos);
    });

    drawBattleOverlays(ctx, false);
  }

  function drawConeTree2d(ctx, x, y, scale) {
    scale = scale || 18;
    ctx.fillStyle = '#6a4420';
    ctx.fillRect(x - 3, y - 2, 6, scale * 0.55);
    [[0.15, 0.55, '#2a8a34'], [0.4, 0.42, '#34a040'], [0.62, 0.28, '#3cb848']].forEach(function (c) {
      ctx.fillStyle = c[2];
      ctx.beginPath();
      ctx.moveTo(x, y - scale * c[0] - scale * c[1]);
      ctx.lineTo(x + scale * c[1], y - scale * c[0] + scale * c[1] * 0.55);
      ctx.lineTo(x - scale * c[1], y - scale * c[0] + scale * c[1] * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  /** Projectiles / particles / ghost — also used when WebGL draws the board. */
  function drawBattleOverlays(ctx, webglMode) {
    if (webglMode) {
      battle.spikes.forEach(function (s) {
        ctx.fillStyle = '#aaa';
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - 6);
        ctx.lineTo(s.x + 3, s.y);
        ctx.lineTo(s.x, s.y + 6);
        ctx.lineTo(s.x - 3, s.y);
        ctx.closePath();
        ctx.fill();
      });
      battle.towers.forEach(function (t) {
        if (t.sentries && t.sentries.length) {
          t.sentries.forEach(function (s) { drawSentry(ctx, s); });
        }
        if (t.id === battle.selectedTowerId) {
          var st = statsForTower(t);
          ctx.beginPath();
          ctx.arc(t.x, t.y, st.radius || 20, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,220,100,0.45)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });
    }

    /* Green acid pools from Alchemist potions */
    if (battle.acidPools && battle.acidPools.length) {
      battle.acidPools.forEach(function (pool) {
        var fade = clamp(pool.life / (pool.maxLife || 3.2), 0.25, 1);
        var pulse = 1 + Math.sin(performance.now() / 180) * 0.04;
        ctx.save();
        ctx.globalAlpha = 0.35 * fade;
        ctx.fillStyle = '#3ec84a';
        ctx.beginPath();
        ctx.arc(pool.x, pool.y, pool.r * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.85 * fade;
        ctx.strokeStyle = '#7dff6a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pool.x, pool.y, pool.r * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.45 * fade;
        ctx.strokeStyle = 'rgba(180,255,120,0.9)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pool.x, pool.y, pool.r * 0.72 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
    }

    battle.projectiles.forEach(function (p) {
      var ang = Math.atan2(p.vy, p.vx);
      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.type === 'boomerang' || p.type === 'glaive') {
        ctx.rotate(ang + (performance.now() / 40) % (Math.PI * 2));
        ctx.strokeStyle = '#d09040';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 7, -0.9, 0.9);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 7, Math.PI - 0.9, Math.PI + 0.9);
        ctx.stroke();
      } else if (p.type === 'bomb' || p.type === 'cannonball') {
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f64';
        ctx.beginPath();
        ctx.arc(-2, -2, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'orb') {
        ctx.fillStyle = '#c8f';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(200,160,255,0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'shuriken') {
        ctx.rotate(ang + (performance.now() / 30) % (Math.PI * 2));
        ctx.fillStyle = '#ccd';
        ctx.beginPath();
        ctx.moveTo(0, -6); ctx.lineTo(2, -1); ctx.lineTo(6, 0); ctx.lineTo(2, 1);
        ctx.lineTo(0, 6); ctx.lineTo(-2, 1); ctx.lineTo(-6, 0); ctx.lineTo(-2, -1);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'torpedo') {
        ctx.rotate(ang);
        ctx.fillStyle = '#4af';
        ctx.fillRect(-6, -3, 14, 6);
        ctx.beginPath();
        ctx.moveTo(8, 0); ctx.lineTo(14, -4); ctx.lineTo(14, 4);
        ctx.fill();
      } else if (p.type === 'spike' || p.spikePlace) {
        ctx.fillStyle = '#aaa';
        ctx.beginPath();
        ctx.moveTo(0, -5); ctx.lineTo(3, 0); ctx.lineTo(0, 5); ctx.lineTo(-3, 0);
        ctx.fill();
      } else if (p.type === 'glue') {
        ctx.fillStyle = '#fa4';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,200,80,0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (p.type === 'potion') {
        /* Flying green potion flask */
        ctx.rotate(ang + Math.PI / 2);
        ctx.fillStyle = '#2a8a38';
        ctx.fillRect(-4, -2, 8, 11);
        ctx.fillStyle = '#6dff6a';
        ctx.globalAlpha = 0.85;
        ctx.fillRect(-3, 0, 6, 7);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#c8a060';
        ctx.fillRect(-3, -5, 6, 4);
        ctx.strokeStyle = 'rgba(180,255,140,0.9)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 4, 7, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'nail' || p.type === 'tack') {
        ctx.rotate(ang);
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-4, 0); ctx.lineTo(6, 0);
        ctx.stroke();
      } else if (p.type === 'laser' || p.type === 'plasma') {
        ctx.rotate(ang);
        ctx.strokeStyle = p.type === 'plasma' ? '#f4f' : '#f0f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-8, 0); ctx.lineTo(10, 0);
        ctx.stroke();
      } else {
        /* dart / bolt default */
        ctx.rotate(ang);
        ctx.fillStyle = '#eee';
        ctx.beginPath();
        ctx.moveTo(8, 0); ctx.lineTo(-4, -2.5); ctx.lineTo(-2, 0); ctx.lineTo(-4, 2.5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#c44';
        ctx.beginPath();
        ctx.moveTo(-2, 0); ctx.lineTo(-6, -3); ctx.lineTo(-4, 0); ctx.lineTo(-6, 3);
        ctx.fill();
      }
      ctx.restore();
    });

    battle.particles.forEach(function (p) {
      ctx.globalAlpha = clamp(p.life * 4, 0, 1);
      if (p.kind === 'leak') {
        ctx.strokeStyle = '#ff2020';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 18 + (0.55 - p.life) * 40, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,40,40,0.35)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.r) {
        ctx.strokeStyle = p.color || 'rgba(160,220,255,0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1.05 - Math.min(0.9, p.life)), 0, Math.PI * 2);
        ctx.stroke();
        if (p.kind === 'acidBurst') {
          ctx.fillStyle = 'rgba(60,200,70,0.28)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * (0.55 + (0.45 - Math.min(0.45, p.life))), 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = p.color || '#fff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    });

    if (battle.placingKind) {
      var def = DATA.towers[battle.placingKind];
      var ok = battle.ghostOk;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(battle.ghostX, battle.ghostY, def.footprint || 18, 0, Math.PI * 2);
      ctx.fillStyle = ok ? 'rgba(80,200,80,0.5)' : 'rgba(200,60,60,0.5)';
      ctx.fill();
      var st2 = resolveTowerStats(battle.placingKind, [0, 0, 0], null);
      if (st2.radius > 0) {
        ctx.beginPath();
        ctx.arc(battle.ghostX, battle.ghostY, st2.radius, 0, Math.PI * 2);
        ctx.strokeStyle = ok ? 'rgba(255,255,255,0.35)' : 'rgba(255,100,100,0.35)';
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      drawMonkeySprite(ctx, battle.ghostX, battle.ghostY, def, 0);
    }
  }

  function drawMonkeySprite(ctx, x, y, def, rot) {
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    var paths = def._paths || [0, 0, 0];
    var dom = dominantUpgrade(paths);
    var path = dom.path;
    var tier = dom.tier;
    var kind = def.kind;

    if (kind === 'monkey_buccaneer') {
      drawBuccaneerSprite(ctx, def, path, tier);
    } else if (kind === 'monkey_sub') {
      drawSubSprite(ctx, def, path, tier);
    } else if (kind === 'banana_farm') {
      ctx.fillStyle = tier >= 3 ? '#3a6a18' : '#5a8a28';
      ctx.fillRect(-14 - tier, -10 - (tier > 2 ? 2 : 0), 28 + tier * 2, 20 + (tier > 2 ? 4 : 0));
      ctx.fillStyle = tier >= 4 ? '#ffd040' : '#fc4';
      ctx.beginPath();
      ctx.arc(-4, 0, 5 + (tier > 2 ? 1 : 0), 0, Math.PI * 2);
      ctx.arc(5, 2, 5, 0, Math.PI * 2);
      if (tier >= 3) ctx.arc(0, -6, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'spike_factory') {
      ctx.fillStyle = tier >= 4 ? '#333' : '#666';
      ctx.fillRect(-12 - tier, -12, 24 + tier * 2, 24);
      ctx.fillStyle = tier >= 3 ? '#fda' : '#aaa';
      ctx.beginPath();
      ctx.moveTo(0, -10 - tier); ctx.lineTo(4 + tier, 0); ctx.lineTo(0, 10 + tier); ctx.lineTo(-4 - tier, 0);
      ctx.fill();
      if (tier >= 3) {
        ctx.strokeStyle = '#fda';
        ctx.lineWidth = 2;
        ctx.strokeRect(-10, -10, 20, 20);
      }
    } else if (kind === 'monkey_village') {
      ctx.fillStyle = def.color || '#e84';
      ctx.beginPath();
      ctx.arc(0, 2, 14 + (tier > 2 ? 2 : 0), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = path === 2 && tier >= 3 ? '#48c' : '#c44';
      ctx.beginPath();
      ctx.moveTo(-16, 0); ctx.lineTo(0, -16 - tier); ctx.lineTo(16, 0);
      ctx.fill();
      if (tier >= 3) {
        ctx.fillStyle = '#ffe080';
        ctx.fillRect(-3, -4, 6, 10);
      }
    } else if (kind === 'tack_shooter') {
      drawTackSprite(ctx, def, path, tier);
    } else if (kind === 'bomb_shooter') {
      drawBombSprite(ctx, def, path, tier);
    } else if (kind === 'mortar_monkey') {
      drawMortarSprite(ctx, def, path, tier);
    } else if (kind === 'minecraft_monkey') {
      drawMinecraftSprite(ctx, def, path, tier, paths);
    } else if (kind === 'roblox_monkey') {
      drawRobloxSprite(ctx, def, path, tier, paths);
    } else if (kind === 'rng_monkey') {
      drawRngSprite(ctx, def, path, tier);
    } else {
      drawMonkeyBody(ctx, def, path, tier);
      drawMonkeyUpgradeGear(ctx, kind, path, tier, paths);
    }
    ctx.restore();
  }

  function drawMinecraftSprite(ctx, def, path, tier, paths) {
    /* Steve-ish blocky monkey */
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 12, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a6a28';
    ctx.fillRect(-10, -2, 20, 14);
    ctx.fillStyle = '#c8a070';
    ctx.fillRect(-9, -14, 18, 14);
    ctx.fillStyle = '#3a2818';
    ctx.fillRect(-9, -16, 18, 4);
    ctx.fillStyle = '#222';
    ctx.fillRect(-5, -10, 3, 3);
    ctx.fillRect(2, -10, 3, 3);
    var weapons = [];
    var pi, ti, arr, mod;
    for (pi = 0; pi < 3; pi++) {
      arr = (DATA.towers.minecraft_monkey.upgrades['path' + pi] || []);
      for (ti = 0; ti < (paths[pi] || 0); ti++) {
        mod = arr[ti] && arr[ti].modifiers;
        if (mod && mod.mcWeapon) weapons.push(mod.mcWeapon);
      }
    }
    weapons.forEach(function (w, idx) {
      var ang = -0.6 + idx * 0.55;
      ctx.save();
      ctx.rotate(ang);
      ctx.translate(14, 0);
      if (w === 'bow') {
        ctx.strokeStyle = '#642';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 7, -1, 1);
        ctx.stroke();
      } else if (w === 'tnt' || w === 'bedrock') {
        ctx.fillStyle = w === 'tnt' ? '#c44' : '#333';
        ctx.fillRect(-4, -4, 8, 8);
      } else if (w === 'endcrystal') {
        ctx.fillStyle = '#f8f';
        ctx.beginPath();
        ctx.moveTo(0, -6); ctx.lineTo(5, 0); ctx.lineTo(0, 6); ctx.lineTo(-5, 0);
        ctx.fill();
      } else {
        ctx.fillStyle = w === 'netherite' ? '#2a2030' : '#888';
        ctx.fillRect(-1, -10, 3, 14);
        ctx.fillStyle = '#642';
        ctx.fillRect(-2, 2, 5, 3);
      }
      ctx.restore();
    });
  }

  function drawRobloxSprite(ctx, def, path, tier, paths) {
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 12, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e11';
    ctx.fillRect(-11, -4, 22, 16);
    ctx.fillStyle = '#f5c6a0';
    ctx.fillRect(-10, -16, 20, 14);
    ctx.fillStyle = '#222';
    ctx.fillRect(-6, -10, 4, 4);
    ctx.fillRect(2, -10, 4, 4);
    ctx.fillStyle = '#c44';
    ctx.fillRect(-4, -2, 8, 3);
    var hasDominus = (paths[0] || 0) >= 3;
    if (hasDominus) {
      ctx.strokeStyle = 'rgba(160,80,255,0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#6030a0';
      ctx.beginPath();
      ctx.moveTo(-12, -14); ctx.lineTo(0, -22); ctx.lineTo(12, -14);
      ctx.fill();
    }
  }

  function drawRngSprite(ctx, def, path, tier) {
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 12, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    var g = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
    g.addColorStop(0, '#f8f');
    g.addColorStop(0.5, '#a6f');
    g.addColorStop(1, '#406');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe070';
    ctx.font = 'bold 14px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', 0, 1);
  }

  function drawMonkeyBody(ctx, def, path, tier) {
    var kind = def.kind;
    var fur = def.color || '#c87840';
    if (kind === 'ninja_monkey') fur = tier >= 3 ? '#0a1020' : '#1a2030';
    if (kind === 'super_monkey') {
      fur = path === 2 && tier >= 3 ? '#4a2060' : path === 1 && tier >= 3 ? '#e8e8f0' : '#c28';
    }
    if (kind === 'wizard_monkey') fur = path === 0 && tier >= 3 ? '#8440a0' : '#63c';
    if (kind === 'ice_monkey') fur = '#a0d8f0';
    if (kind === 'glue_gunner') fur = '#c09040';
    if (kind === 'alchemist') fur = '#6a8a40';
    if (kind === 'druid') fur = '#5a8840';
    if (kind === 'sniper_monkey') fur = '#3a5a38';
    if (kind === 'engineer_monkey') fur = '#c87830';
    if (kind === 'dartling_gunner') fur = '#606878';

    var scale = 1 + Math.min(0.18, tier * 0.03);
    ctx.scale(scale, scale);

    /* Soft ground shadow */
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 12, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    /* Outline */
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    /* Fur body */
    ctx.fillStyle = fur;
    ctx.beginPath();
    ctx.ellipse(0, 1, 13, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    /* Ears */
    ctx.beginPath();
    ctx.arc(-11, -8, 6.5, 0, Math.PI * 2);
    ctx.arc(11, -8, 6.5, 0, Math.PI * 2);
    ctx.fill();

    /* Face plate (lighter) for most monkeys */
    if (kind !== 'ninja_monkey') {
      ctx.fillStyle = 'rgba(255,220,180,0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 2, 8, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    /* Eyes */
    if (kind === 'ninja_monkey') {
      ctx.fillStyle = '#111';
      ctx.fillRect(-12, -5, 24, 7);
      ctx.fillStyle = tier >= 4 ? '#f44' : '#fff';
      ctx.beginPath();
      ctx.arc(-4, -1.5, 2.2, 0, Math.PI * 2);
      ctx.arc(4, -1.5, 2.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'super_monkey' && path === 0 && tier >= 3) {
      /* Laser eyes */
      ctx.fillStyle = '#ff40ff';
      ctx.beginPath();
      ctx.arc(-4, -1, 3.5, 0, Math.PI * 2);
      ctx.arc(4, -1, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-4, -1, 1.5, 0, Math.PI * 2);
      ctx.arc(4, -1, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-4, -1, 4, 0, Math.PI * 2);
      ctx.arc(4, -1, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(-4, -0.5, 1.7, 0, Math.PI * 2);
      ctx.arc(4, -0.5, 1.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-5, -1.5, 0.7, 0, Math.PI * 2);
      ctx.arc(3, -1.5, 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    /* T5 aura ring */
    if (tier >= 5) {
      ctx.strokeStyle = kind === 'super_monkey' ? 'rgba(255,80,220,0.7)'
        : kind === 'wizard_monkey' ? 'rgba(180,100,255,0.7)'
        : 'rgba(255,220,80,0.65)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 17, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawMonkeyUpgradeGear(ctx, kind, path, tier, paths) {
    if (kind === 'dart_monkey') drawDartGear(ctx, path, tier, paths);
    else if (kind === 'boomerang_monkey') drawBoomerangGear(ctx, path, tier);
    else if (kind === 'sniper_monkey') drawSniperGear(ctx, path, tier);
    else if (kind === 'ninja_monkey') drawNinjaGear(ctx, path, tier);
    else if (kind === 'wizard_monkey') drawWizardGear(ctx, path, tier);
    else if (kind === 'super_monkey') drawSuperGear(ctx, path, tier);
    else if (kind === 'ice_monkey') drawIceGear(ctx, path, tier);
    else if (kind === 'glue_gunner') drawGlueGear(ctx, path, tier);
    else if (kind === 'alchemist') drawAlchGear(ctx, path, tier);
    else if (kind === 'druid') drawDruidGear(ctx, path, tier);
    else if (kind === 'engineer_monkey') drawEngineerGear(ctx, path, tier);
    else if (kind === 'dartling_gunner') drawDartlingGear(ctx, path, tier);
    else if (kind === 'monkey_ace') drawAceGear(ctx, path, tier);
    else if (tier >= 2) {
      /* Generic path badge for remaining towers */
      ctx.fillStyle = path === 0 ? '#f64' : path === 1 ? '#4af' : '#4f6';
      ctx.beginPath();
      ctx.arc(10, 10, 3 + Math.min(2, tier * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawDartGear(ctx, path, tier, paths) {
    if (path === 0 && tier >= 3) {
      /* Spike-O-Pult / Juggernaut catapult */
      ctx.fillStyle = '#6a4420';
      ctx.fillRect(-4, -4, 8, 14);
      ctx.fillStyle = '#8a6030';
      ctx.beginPath();
      ctx.moveTo(-2, -4); ctx.lineTo(16, -14 - tier); ctx.lineTo(4, -2);
      ctx.fill();
      ctx.fillStyle = '#c8a060';
      ctx.beginPath();
      ctx.arc(14, -12 - tier, 5 + (tier > 3 ? 2 : 0), 0, Math.PI * 2);
      ctx.fill();
      if (tier >= 4) {
        ctx.strokeStyle = '#fda';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(14, -12 - tier, 7, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (path === 1 && tier >= 3) {
      /* Crossbow */
      ctx.fillStyle = '#5a3820';
      ctx.fillRect(4, -2, 18 + tier, 5);
      ctx.strokeStyle = '#8a6030';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(8, -8); ctx.quadraticCurveTo(22, 0, 8, 8);
      ctx.stroke();
      ctx.fillStyle = '#ddd';
      ctx.fillRect(20, -1, 8, 2);
      if (tier >= 5) {
        ctx.fillStyle = '#4af';
        ctx.fillRect(4, -4, 6, 8);
      }
    } else if (path === 2 && tier >= 3) {
      /* Triple / Fan Club — three darts + cape */
      ctx.fillStyle = tier >= 5 ? '#c44fff' : '#e06040';
      ctx.beginPath();
      ctx.moveTo(-10, 4); ctx.lineTo(-16, 16); ctx.lineTo(0, 12); ctx.lineTo(16, 16); ctx.lineTo(10, 4);
      ctx.fill();
      var i;
      for (i = -1; i <= 1; i++) {
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(6, i * 4); ctx.lineTo(16, i * 4);
        ctx.stroke();
      }
    } else if (tier >= 1) {
      /* Basic dart pouch */
      ctx.fillStyle = '#8a5030';
      ctx.fillRect(8, 4, 6, 8);
    }
    /* Crosspath hint dots */
    if ((paths[0] || 0) && path !== 0) {
      ctx.fillStyle = '#c87840';
      ctx.fillRect(-14, 8, 4, 4);
    }
  }

  function drawBoomerangGear(ctx, path, tier) {
    ctx.strokeStyle = path === 1 && tier >= 3 ? '#8af' : '#d09040';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(10, 0, 8 + tier, -0.8, 0.8);
    ctx.stroke();
    if (path === 0 && tier >= 3) {
      /* Glaives — second blade */
      ctx.beginPath();
      ctx.arc(10, 0, 5 + tier, 1.2, 2.8);
      ctx.stroke();
    }
    if (path === 1 && tier >= 3) {
      /* Bionic arm */
      ctx.fillStyle = '#8899aa';
      ctx.fillRect(4, -3, 14, 6);
      ctx.fillStyle = '#4af';
      ctx.fillRect(14, -2, 4, 4);
    }
    if (path === 2 && tier >= 3) {
      /* Heavy press gloves */
      ctx.fillStyle = '#543';
      ctx.fillRect(-16, 4, 10, 8);
      ctx.fillRect(6, 4, 10, 8);
    }
  }

  function drawSniperGear(ctx, path, tier) {
    ctx.fillStyle = path === 2 && tier >= 3 ? '#2a4a28' : '#2a3a28';
    ctx.fillRect(4, -2, 18 + tier * 2, 5);
    ctx.fillStyle = '#1a2a18';
    ctx.fillRect(14, -5, 4, 4);
    if (path === 0 && tier >= 3) {
      ctx.fillStyle = '#8a8';
      ctx.beginPath();
      ctx.arc(20, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    if (path === 1 && tier >= 3) {
      /* Night vision glow */
      ctx.fillStyle = '#4f4';
      ctx.beginPath();
      ctx.arc(-4, -1, 3, 0, Math.PI * 2);
      ctx.arc(4, -1, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    if (path === 2 && tier >= 3) {
      ctx.fillStyle = '#c44';
      ctx.fillRect(-8, 8, 16, 6);
    }
  }

  function drawNinjaGear(ctx, path, tier) {
    ctx.fillStyle = '#111';
    ctx.fillRect(-12, -5, 24, 6);
    if (path === 0 && tier >= 3) {
      /* Flash bombs — pouches */
      ctx.fillStyle = '#444';
      ctx.beginPath();
      ctx.arc(-10, 8, 4, 0, Math.PI * 2);
      ctx.arc(10, 8, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    if (path === 1 && tier >= 3) {
      /* Sharp shuriken emblem */
      ctx.fillStyle = '#ccc';
      ctx.beginPath();
      ctx.moveTo(0, -18); ctx.lineTo(3, -12); ctx.lineTo(0, -8); ctx.lineTo(-3, -12);
      ctx.fill();
    }
    if (path === 2 && tier >= 3) {
      /* Saboteur scarf */
      ctx.fillStyle = '#c22';
      ctx.beginPath();
      ctx.moveTo(-8, 6); ctx.lineTo(-14, 18); ctx.lineTo(-2, 10);
      ctx.fill();
    }
  }

  function drawWizardGear(ctx, path, tier) {
    ctx.fillStyle = path === 0 && tier >= 3 ? '#f64' : '#63c';
    ctx.beginPath();
    ctx.moveTo(0, -22 - (tier > 2 ? 2 : 0)); ctx.lineTo(10, -5); ctx.lineTo(-10, -5);
    ctx.fill();
    ctx.fillStyle = '#fc4';
    ctx.beginPath();
    ctx.arc(0, -22, 3, 0, Math.PI * 2);
    ctx.fill();
    if (path === 0 && tier >= 3) {
      /* Fire staff */
      ctx.fillStyle = '#6a4020';
      ctx.fillRect(8, -2, 3, 16);
      ctx.fillStyle = '#f64';
      ctx.beginPath();
      ctx.arc(9.5, -4, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (path === 1 && tier >= 3) {
      /* Necromancer skull */
      ctx.fillStyle = '#eee';
      ctx.beginPath();
      ctx.arc(0, -14, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(-2, -14, 1.2, 0, Math.PI * 2);
      ctx.arc(2, -14, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (path === 2 && tier >= 3) {
      /* Arcane spikes */
      ctx.fillStyle = '#a0f';
      ctx.beginPath();
      ctx.moveTo(-12, 0); ctx.lineTo(-18, -8); ctx.lineTo(-8, -2);
      ctx.moveTo(12, 0); ctx.lineTo(18, -8); ctx.lineTo(8, -2);
      ctx.fill();
    }
  }

  function drawSuperGear(ctx, path, tier) {
    if (path === 0 && tier >= 3) {
      ctx.strokeStyle = 'rgba(255,80,255,0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(8, -2); ctx.lineTo(22, -2);
      ctx.moveTo(8, 2); ctx.lineTo(22, 2);
      ctx.stroke();
    }
    if (path === 1 && tier >= 3) {
      /* Robo / tech plates */
      ctx.fillStyle = '#ccd';
      ctx.fillRect(-14, -6, 6, 14);
      ctx.fillRect(8, -6, 6, 14);
      ctx.fillStyle = '#4af';
      ctx.fillRect(-12, -2, 2, 6);
      ctx.fillRect(10, -2, 2, 6);
    }
    if (path === 2 && tier >= 3) {
      /* Dark knight cape */
      ctx.fillStyle = '#2a1040';
      ctx.beginPath();
      ctx.moveTo(-10, 2); ctx.lineTo(-18, 18); ctx.lineTo(0, 12); ctx.lineTo(18, 18); ctx.lineTo(10, 2);
      ctx.fill();
      ctx.fillStyle = '#c4f';
      ctx.beginPath();
      ctx.moveTo(0, -18); ctx.lineTo(8, -8); ctx.lineTo(-8, -8);
      ctx.fill();
    }
  }

  function drawIceGear(ctx, path, tier) {
    ctx.fillStyle = 'rgba(180,230,255,0.7)';
    ctx.beginPath();
    ctx.moveTo(0, -16); ctx.lineTo(6, -8); ctx.lineTo(-6, -8);
    ctx.fill();
    if (tier >= 3) {
      ctx.strokeStyle = '#8cf';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 15 + tier, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (path === 0 && tier >= 3) {
      ctx.fillStyle = '#6af';
      ctx.fillRect(6, -3, 14, 6);
    }
  }

  function drawGlueGear(ctx, path, tier) {
    ctx.fillStyle = '#fa4';
    ctx.fillRect(6, -3, 14 + tier, 7);
    ctx.beginPath();
    ctx.arc(8, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    if (tier >= 3) {
      ctx.fillStyle = path === 2 ? '#f44' : '#fc6';
      ctx.beginPath();
      ctx.arc(18, -6, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawAlchGear(ctx, path, tier) {
    /* Potion flask on the alchemist */
    ctx.fillStyle = '#c8a060';
    ctx.fillRect(-3, -12, 6, 4);
    ctx.fillStyle = '#2a7a30';
    ctx.beginPath();
    ctx.moveTo(-7, -8); ctx.lineTo(7, -8); ctx.lineTo(5, 9); ctx.lineTo(-5, 9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = path === 1 ? '#6dff6a' : path === 0 ? '#9f6' : '#a4f';
    ctx.beginPath();
    ctx.moveTo(-5, -2); ctx.lineTo(5, -2); ctx.lineTo(4, 7); ctx.lineTo(-4, 7);
    ctx.closePath();
    ctx.fill();
    if (tier >= 3) {
      ctx.strokeStyle = '#fc4';
      ctx.lineWidth = 2;
      ctx.strokeRect(-9, -13, 18, 24);
    }
  }

  function drawDruidGear(ctx, path, tier) {
    ctx.fillStyle = '#3a6a20';
    ctx.beginPath();
    ctx.arc(-8, -10, 5, 0, Math.PI * 2);
    ctx.arc(8, -10, 5, 0, Math.PI * 2);
    ctx.arc(0, -14, 5, 0, Math.PI * 2);
    ctx.fill();
    if (path === 0 && tier >= 3) {
      ctx.strokeStyle = '#8cf';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, 4); ctx.lineTo(0, -6); ctx.lineTo(10, 4);
      ctx.stroke();
    }
    if (path === 2 && tier >= 3) {
      ctx.strokeStyle = 'rgba(200,60,40,0.75)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawEngineerGear(ctx, path, tier) {
    ctx.fillStyle = '#888';
    ctx.fillRect(6, -4, 12, 8);
    ctx.fillStyle = '#c87830';
    ctx.fillRect(14, -2, 8, 4);
    if (tier >= 3) {
      ctx.fillStyle = '#4af';
      ctx.fillRect(-6, 8, 12, 6);
      ctx.fillStyle = '#fda';
      ctx.beginPath();
      ctx.arc(0, 10, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawDartlingGear(ctx, path, tier) {
    ctx.fillStyle = '#555';
    ctx.fillRect(4, -4, 20 + tier * 2, 8);
    ctx.fillStyle = path === 0 && tier >= 3 ? '#f64' : '#888';
    ctx.fillRect(20, -2, 10, 4);
    if (path === 2 && tier >= 3) {
      ctx.fillStyle = '#4af';
      ctx.beginPath();
      ctx.arc(8, -8, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawAceGear(ctx, path, tier) {
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.moveTo(-16, 0); ctx.lineTo(16, -4); ctx.lineTo(16, 4);
    ctx.fill();
    ctx.fillStyle = '#c44';
    ctx.fillRect(-4, -8, 8, 6);
    if (tier >= 3) {
      ctx.fillStyle = '#fc4';
      ctx.fillRect(10, -2, 8, 4);
    }
  }

  function drawTackSprite(ctx, def, path, tier) {
    var n = path === 0 && tier >= 3 ? 12 : 8;
    ctx.fillStyle = path === 2 && tier >= 3 ? '#f20' : (def.color || '#f62');
    ctx.beginPath();
    ctx.arc(0, 0, 12 + (tier > 2 ? 2 : 0), 0, Math.PI * 2);
    ctx.fill();
    var k;
    for (k = 0; k < n; k++) {
      var ang = (Math.PI * 2 * k) / n;
      ctx.strokeStyle = tier >= 4 ? '#ffe080' : '#fda';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * 8, Math.sin(ang) * 8);
      ctx.lineTo(Math.cos(ang) * (16 + tier), Math.sin(ang) * (16 + tier));
      ctx.stroke();
    }
  }

  function drawBombSprite(ctx, def, path, tier) {
    ctx.fillStyle = tier >= 4 ? '#333' : '#555';
    ctx.beginPath();
    ctx.arc(0, 0, 12 + (tier > 2 ? 2 : 0), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = path === 1 && tier >= 3 ? '#864' : '#222';
    ctx.fillRect(6, -4, 12 + tier, 8);
    if (path === 0 && tier >= 3) {
      ctx.fillStyle = '#f64';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    if (path === 2 && tier >= 3) {
      ctx.strokeStyle = '#4af';
      ctx.lineWidth = 2;
      ctx.strokeRect(-10, -10, 20, 20);
    }
  }

  function drawMortarSprite(ctx, def, path, tier) {
    ctx.fillStyle = '#5a4020';
    ctx.fillRect(-10, -6, 20, 14);
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(0, -8 - tier, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#888';
    ctx.fillRect(-4, -18 - tier, 8, 12);
    if (tier >= 3) {
      ctx.fillStyle = '#f64';
      ctx.beginPath();
      ctx.arc(0, -18 - tier, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawBuccaneerSprite(ctx, def, path, tier) {
    ctx.fillStyle = '#6a4420';
    ctx.fillRect(-14 - tier, -8, 28 + tier * 2, 16);
    ctx.fillStyle = '#c8a060';
    ctx.fillRect(-2, -22 - (tier > 2 ? 4 : 0), 4, 18 + (tier > 2 ? 4 : 0));
    ctx.fillStyle = path === 0 && tier >= 3 ? '#c44' : '#e8e0d0';
    ctx.beginPath();
    ctx.moveTo(2, -20); ctx.lineTo(14 + tier, -12); ctx.lineTo(2, -8);
    ctx.fill();
    if (path === 1 && tier >= 3) {
      ctx.fillStyle = '#4af';
      ctx.fillRect(10, -2, 12, 5);
    }
    if (path === 2 && tier >= 3) {
      ctx.fillStyle = '#333';
      ctx.fillRect(-16, 4, 8, 6);
      ctx.fillRect(8, 4, 8, 6);
    }
  }

  function drawSubSprite(ctx, def, path, tier) {
    ctx.fillStyle = def.color || '#246';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16 + tier, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = path === 0 && tier >= 3 ? '#4af' : '#8cf';
    ctx.fillRect(-4, -14, 8, 8);
    if (tier >= 3) {
      ctx.fillStyle = '#1a3a5a';
      ctx.fillRect(8, -2, 12, 4);
    }
  }

  function drawSentry(ctx, s) {
    ctx.save();
    ctx.translate(s.x, s.y);
    var ang = Math.atan2(s.aimY - s.y, s.aimX - s.x);
    var pose = applyAttackPose(ctx, s, ang);
    ctx.rotate(ang);
    ctx.fillStyle = '#4a6a88';
    ctx.fillRect(-7, -6, 14, 12);
    ctx.fillStyle = '#c87830';
    ctx.fillRect(4, -2, 12, 4);
    ctx.fillStyle = '#2a3a48';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    if (pose.flash > 0.05) {
      ctx.fillStyle = 'rgba(255,240,160,' + Math.min(1, pose.flash) + ')';
      ctx.beginPath();
      ctx.arc(14, 0, 4 + 2 * pose.flash, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawTower(ctx, t) {
    var def = DATA.towers[t.kind];
    if (!def) return;
    var ang = Math.atan2((t.aimY != null ? t.aimY : t.y) - t.y, (t.aimX != null ? t.aimX : t.x + 1) - t.x);
    var view = Object.assign({}, def, { _paths: t.paths || [0, 0, 0] });
    var facesTarget = shouldFaceTarget(def.kind);

    ctx.save();
    ctx.translate(t.x, t.y);
    var pose = applyAttackPose(ctx, t, ang);
    /* Face the target for combat monkeys; non-facing kinds still get squash anim */
    if (facesTarget) {
      drawMonkeySprite(ctx, 0, 0, view, ang);
    } else {
      drawMonkeySprite(ctx, 0, 0, view, 0);
    }
    if (pose.flash > 0.05 && facesTarget) {
      drawMuzzleFlash(ctx, ang, pose.flash, pose.style);
    } else if (pose.flash > 0.05 && pose.style === 'pulse') {
      ctx.strokeStyle = 'rgba(160,220,255,' + (0.35 + 0.45 * pose.flash) + ')';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 18 + 22 * pose.flash, 0, Math.PI * 2);
      ctx.stroke();
    } else if (pose.flash > 0.05 && pose.style === 'spin') {
      var k;
      for (k = 0; k < 8; k++) {
        var a = (Math.PI * 2 * k) / 8;
        ctx.strokeStyle = 'rgba(255,200,80,' + (0.4 * pose.flash) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 10, Math.sin(a) * 10);
        ctx.lineTo(Math.cos(a) * (16 + 8 * pose.flash), Math.sin(a) * (16 + 8 * pose.flash));
        ctx.stroke();
      }
    } else if (pose.flash > 0.05 && pose.style === 'laser') {
      ctx.strokeStyle = 'rgba(255,80,255,' + (0.5 * pose.flash) + ')';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(ang) * 28, Math.sin(ang) * 28);
      ctx.stroke();
    } else if (pose.flash > 0.05 && (pose.style === 'cast' || pose.style === 'pult')) {
      ctx.fillStyle = pose.style === 'cast'
        ? 'rgba(180,120,255,' + (0.35 * pose.flash) + ')'
        : 'rgba(200,160,80,' + (0.35 * pose.flash) + ')';
      ctx.beginPath();
      ctx.arc(Math.cos(ang) * 12, Math.sin(ang) * 12, 6 + 4 * pose.flash, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function shouldFaceTarget(kind) {
    if (!kind) return true;
    if (kind === 'banana_farm' || kind === 'monkey_village' || kind === 'spike_factory') return false;
    if (kind === 'tack_shooter' || kind === 'ice_monkey') return false;
    return true;
  }

  function drawBloon(ctx, b, pos) {
    var r = Math.max(12, (b.def.r || 10) * 1.15);
    ctx.save();
    ctx.translate(pos.x, pos.y);
    if (b.def.blimp) {
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.ellipse(0, 1, r * 1.15, r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = b.def.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.1, r * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (b.def.label) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.def.label, 0, 3);
      }
      if (b.maxHullHp > 0) {
        var pct = b.hullHp / b.maxHullHp;
        ctx.fillStyle = '#222';
        ctx.fillRect(-r, -r - 8, r * 2, 4);
        ctx.fillStyle = '#4c4';
        ctx.fillRect(-r, -r - 8, r * 2 * pct, 4);
      }
    } else {
      /* Tiny knot under the ball (not a long string — that looked like hair) */
      ctx.fillStyle = b.def.color;
      ctx.beginPath();
      ctx.moveTo(-3, r * 0.75);
      ctx.lineTo(3, r * 0.75);
      ctx.lineTo(0, r + 4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(0, 0, r + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = b.def.color;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      if (b.camo) {
        ctx.strokeStyle = 'rgba(180,255,180,0.7)';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (b.regrow) {
        ctx.strokeStyle = '#2f8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, r + 2, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (b.def.zebra) {
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-r * 0.5, -r * 0.3); ctx.lineTo(r * 0.5, r * 0.3);
        ctx.moveTo(-r * 0.5, r * 0.3); ctx.lineTo(r * 0.5, -r * 0.3);
        ctx.stroke();
      }
      if ((b.def.ceramic || (b.def.tags && b.def.tags.indexOf('ceramic') >= 0)) && b.maxLayerHp > 1) {
        var lp = b.layerHp / b.maxLayerHp;
        ctx.fillStyle = '#222';
        ctx.fillRect(-r, -r - 6, r * 2, 3);
        ctx.fillStyle = '#da8';
        ctx.fillRect(-r, -r - 6, r * 2 * lp, 3);
      }
      var gloss = ctx.createRadialGradient(-r * 0.35, -r * 0.4, 0, -r * 0.2, -r * 0.25, r * 0.9);
      gloss.addColorStop(0, 'rgba(255,255,255,0.9)');
      gloss.addColorStop(0.35, 'rgba(255,255,255,0.35)');
      gloss.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gloss;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      if (b.glued && b.slowT > 0) {
        ctx.strokeStyle = 'rgba(255,170,40,0.9)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, r + 2, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (b.poisonT > 0) {
        ctx.strokeStyle = 'rgba(80,220,70,0.95)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, r + 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(60,200,50,0.22)';
        ctx.beginPath();
        ctx.arc(0, 0, r + 1, 0, Math.PI * 2);
        ctx.fill();
      }
      if (b.bubbled && b.bubbleT > 0) {
        ctx.strokeStyle = 'rgba(160,230,255,0.95)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, r + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(180,240,255,0.28)';
        ctx.beginPath();
        ctx.arc(0, 0, r + 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.beginPath();
        ctx.arc(-r * 0.35, -r * 0.4, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      if (b.frozen && b.slowT > 0) {
        ctx.strokeStyle = 'rgba(160,220,255,0.95)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, r + 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(180,230,255,0.35)';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /* ─── UI refresh ─── */
  function refreshHud() {
    if (!battle || !ui) return;
    if (ui.lives) ui.lives.textContent = String(Math.max(0, Math.floor(battle.lives)));
    if (ui.cash) ui.cash.textContent = '$' + Math.floor(battle.cash);
    if (ui.cashLabel) ui.cashLabel.textContent = battle.pvp ? tr('hud.monkeyCash') : tr('hud.cash');
    if (ui.roundLabel) ui.roundLabel.textContent = battle.pvp ? tr('hud.wave') : tr('hud.round');
    if (ui.round) ui.round.textContent = battle.round + ' / ' + battle.maxRound;
    if (ui.bloonEcoWrap) ui.bloonEcoWrap.classList.toggle('hidden', !battle.pvp);
    if (ui.bloonEco) ui.bloonEco.textContent = '$' + Math.floor(battle.bloonCash || 0);
    if (ui.phaseWrap) ui.phaseWrap.classList.toggle('hidden', !battle.pvp);
    if (ui.phase) {
      var ph = battle.pvpPhase || '';
      ui.phase.textContent = ph === 'build' ? tr('hud.build') : (ph === 'send' ? tr('hud.send') : (ph === 'fight' ? tr('hud.fight') : '—'));
    }
    document.body.classList.toggle('pvp-build-phase', !!(battle.pvp && battle.pvpPhase === 'build'));
    document.body.classList.toggle('pvp-send-phase', !!(battle.pvp && battle.pvpPhase === 'send'));
    if (ui.btnStart) {
      ui.btnStart.classList.toggle('hidden', !!battle.pvp);
      ui.btnStart.disabled = battle.roundActive || battle.won || battle.lost || battle.round >= battle.maxRound;
      ui.btnStart.textContent = battle.round === 0 ? tr('hud.start') : (battle.roundActive ? tr('hud.rounding') : tr('hud.next'));
    }
    if (ui.btnAuto) {
      ui.btnAuto.classList.toggle('hidden', !!battle.pvp);
      ui.btnAuto.classList.toggle('auto-on', !!battle.autoStart);
      ui.btnAuto.textContent = battle.autoStart ? tr('hud.autoOn') : tr('hud.auto');
      ui.btnAuto.setAttribute('aria-pressed', battle.autoStart ? 'true' : 'false');
    }
    if (ui.btnPvpReady) {
      ui.btnPvpReady.classList.toggle('hidden', !battle.pvp || battle.roundActive || battle.won || battle.lost);
      if (battle.pvpPhase === 'build') ui.btnPvpReady.textContent = tr('hud.readyBloon');
      else if (battle.pvpPhase === 'send') ui.btnPvpReady.textContent = tr('hud.sendWave') + ' (' + (battle.bloonQueue ? battle.bloonQueue.length : 0) + ')';
      else ui.btnPvpReady.textContent = tr('hud.ready');
    }
    if (ui.speedLabel) ui.speedLabel.textContent = battle.paused ? tr('hud.paused') : (battle.gameSpeed + 'x');
    refreshBuyBarAfford();
  }

  function refreshHomeCurrencies() {
    if (!ui) return;
    if (ui.mm) ui.mm.textContent = String(profile.monkeyMoney | 0);
    if (ui.tr) ui.tr.textContent = String(profile.trophies | 0);
    if (ui.kp) ui.kp.textContent = String(profile.knowledgePoints | 0);
    if (ui.kp2) ui.kp2.textContent = String(profile.knowledgePoints | 0);
  }

  function refreshBuyBar() {
    if (!ui || !ui.buySlots) return;
    ui.buySlots.innerHTML = '';

    /* Bloon send shop during PvP send phase */
    if (battle && battle.pvp && battle.pvpPhase === 'send') {
      if (ui.buyTabs) ui.buyTabs.style.display = 'none';
      (DATA.pvpBloonShop || []).forEach(function (item) {
        var unlock = item.unlockTurn || 1;
        var locked = (battle.round + 1) < unlock;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tower-slot tower-card bloon-send-slot';
        btn.dataset.shopId = item.id;
        btn.dataset.cost = String(item.cost);
        btn.innerHTML = '<span class="slot-name">' + bloonShopLabel(item) + '</span>' +
          '<span class="slot-cost">$' + item.cost + '</span>' +
          (locked ? '<span class="slot-key">T' + unlock + '</span>' : '<span class="slot-key">eco</span>');
        if (locked) btn.classList.add('unaffordable');
        btn.addEventListener('click', function () { queuePvpBloon(item.id); });
        ui.buySlots.appendChild(btn);
      });
      refreshBuyBarAfford();
      return;
    }

    if (ui.buyTabs) ui.buyTabs.style.display = '';
    var catId = (battle && battle.buyCategory) || 'primary';
    var cat = DATA.buyBar.categories.find(function (c) { return c.id === catId; });
    if (!cat) cat = DATA.buyBar.categories[0];
    cat.slots.forEach(function (slot) {
      var def = DATA.towers[slot.kind];
      if (!def) return;
      var cost = towerCost(slot.kind);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tower-slot tower-card';
      btn.dataset.kind = slot.kind;
      btn.dataset.cost = String(cost);
      btn.dataset.locked = '0';
      btn.dataset.hotkey = slot.hotkey;
      btn.innerHTML = '<span class="slot-name">' + towerName(def) + '</span>' +
        '<span class="slot-cost">$' + cost + '</span>' +
        '<span class="slot-key">' + slot.hotkey + '</span>';
      btn.addEventListener('click', function () {
        selectBuyKind(slot.kind);
      });
      ui.buySlots.appendChild(btn);
    });
    /* tabs active */
    if (ui.buyTabs) {
      Array.prototype.forEach.call(ui.buyTabs.querySelectorAll('[data-cat]'), function (el) {
        el.classList.toggle('active', el.dataset.cat === (battle ? battle.buyCategory : 'primary'));
      });
    }
    refreshBuyBarAfford();
  }

  function refreshBuyBarAfford() {
    if (!ui || !ui.buySlots || !battle) return;
    Array.prototype.forEach.call(ui.buySlots.querySelectorAll('.tower-slot'), function (btn) {
      var cost = +btn.dataset.cost;
      if (btn.classList.contains('bloon-send-slot')) {
        var unlockTurn = 1;
        var shop = (DATA.pvpBloonShop || []).find(function (s) { return s.id === btn.dataset.shopId; });
        if (shop) unlockTurn = shop.unlockTurn || 1;
        var locked = (battle.round + 1) < unlockTurn;
        btn.classList.toggle('unaffordable', locked || battle.bloonCash < cost);
      } else {
        var canBuild = !battle.pvp || battle.pvpPhase === 'build';
        btn.classList.toggle('unaffordable', !canBuild || battle.cash < cost);
        btn.classList.toggle('selected', battle.placingKind === btn.dataset.kind);
      }
    });
  }

  function selectBuyKind(kind) {
    if (!battle || battle.won || battle.lost) return;
    if (battle.pvp && battle.pvpPhase !== 'build') {
      toast(tr('toast.buildOnly'));
      return;
    }
    if (battle.placingKind === kind) {
      battle.placingKind = null;
    } else {
      battle.placingKind = kind;
      battle.selectedTowerId = null;
      refreshInspect();
    }
    refreshBuyBarAfford();
  }

  function refreshInspect() {
    if (!ui || !ui.inspect) return;
    if (battle && battle.pvp && battle.pvpPhase === 'send') {
      ui.inspect.classList.remove('empty');
      ui.inspectBody.innerHTML =
        '<p class="muted">' + tr('inspect.bloonTurn') + '</p>' +
        '<p class="muted">' + tr('inspect.queued') + ' ' + (battle.bloonQueue ? battle.bloonQueue.length : 0) + '</p>';
      return;
    }
    if (battle && battle.pvp && battle.pvpPhase === 'build') {
      var t0 = getSelectedTower();
      if (!t0) {
        ui.inspect.classList.add('empty');
        ui.inspectBody.innerHTML = '<p class="muted">' + tr('inspect.monkeyTurn') + '</p>';
        return;
      }
    }
    var tSel = getSelectedTower();
    if (!tSel) {
      ui.inspect.classList.add('empty');
      ui.inspectBody.innerHTML = '<p class="muted">' + tr('inspect.empty') + '</p>';
      return;
    }
    ui.inspect.classList.remove('empty');
    var def = DATA.towers[tSel.kind];
    var st = statsForTower(tSel);
    var html = '<div class="insp-head"><strong>' + towerName(def) + '</strong>' +
      '<span class="path-note">' + tSel.paths[0] + '-' + tSel.paths[1] + '-' + tSel.paths[2] + '</span></div>';
    html += '<div class="insp-stats">' + tr('inspect.stats', {
      d: st.damage,
      p: st.pierce,
      r: st.rate.toFixed(2),
      rad: Math.round(st.radius),
    }) + '</div>';
    html += '<div class="target-row"><label>' + tr('inspect.target') + '</label><select id="btd6TargetMode">';
    ['first', 'last', 'close', 'strong'].forEach(function (m) {
      html += '<option value="' + m + '"' + (tSel.targeting === m ? ' selected' : '') + '>' +
        tr('target.' + m) + '</option>';
    });
    html += '</select></div>';
    html += '<div class="upgrade-paths">';
    var pathNames = [tr('inspect.path.top'), tr('inspect.path.mid'), tr('inspect.path.bot')];
    var pi;
    for (pi = 0; pi < 3; pi++) {
      var next = tSel.paths[pi] + 1;
      var arr = def.upgrades['path' + pi];
      html += '<div class="up-path"><div class="up-label">' + pathNames[pi] + ' (T' + tSel.paths[pi] + ')</div>';
      var ti;
      for (ti = 1; ti <= 5; ti++) {
        var u = arr[ti - 1];
        var owned = tSel.paths[pi] >= ti;
        var can = canBuyUpgrade(tSel.paths, pi, ti) && ti === next;
        var cls = owned ? 'owned' : (can ? 'available' : 'locked');
        html += '<button type="button" class="up-tier ' + cls + '" data-path="' + pi + '" data-tier="' + ti + '"' +
          (owned || !can ? ' disabled' : '') + ' title="' + (u ? upgradeName(u) + ' ($' + u.cost + ')' : '') + '">' +
          (owned ? '✓' : (u ? '$' + u.cost : '')) + '</button>';
      }
      if (next <= 5 && arr[next - 1]) {
        var uc = arr[next - 1];
        var ok = canBuyUpgrade(tSel.paths, pi, next);
        if (ok) {
          html += '<button type="button" class="btn-up" data-path="' + pi + '">' +
            upgradeName(uc) + ' — $' + uc.cost + '</button>';
        } else {
          html += '<div class="btn-up locked-note" title="' + tr('inspect.lockedCross') + '">' +
            tr('inspect.lockedCross') + '</div>';
        }
      }
      html += '</div>';
    }
    html += '</div>';
    if (tSel.kind === 'rng_monkey' && global.BTD6_SPECIAL) {
      var rollSt = st;
      var rollPrice = global.BTD6_SPECIAL.rollCost(rollSt.rollDiscount || 0);
      var luckShow = (tSel.rngLuck || 0) + (rollSt.luck || 0);
      var curRoll = tSel.rngRollId ? global.BTD6_SPECIAL.getRoll(tSel.rngRollId) : null;
      html += '<div class="rng-panel">';
      html += '<p class="muted">' + tr('inspect.rngLuck', { n: luckShow }) + '</p>';
      if (curRoll) {
        var meta = global.BTD6_SPECIAL.rarityMeta(curRoll.rarity);
        html += '<p><strong style="color:' + meta.color + '">' + tr('inspect.rngCurrent', { name: curRoll.name }) + '</strong></p>';
        html += '<p class="muted">' + curRoll.desc + '</p>';
      } else {
        html += '<p class="muted">' + tr('inspect.rngNone') + '</p>';
      }
      html += '<button type="button" class="btn" id="btd6RngRoll">' + tr('inspect.rngRoll', { n: rollPrice }) + '</button>';
      html += '</div>';
    }
    html += '<button type="button" class="btn-sell" id="btd6Sell">' +
      tr('inspect.sell', { n: sellRefund(tSel) }) + '</button>';
    ui.inspectBody.innerHTML = html;
    var sel = $('btd6TargetMode');
    if (sel) sel.addEventListener('change', function () { tSel.targeting = sel.value; });
    Array.prototype.forEach.call(ui.inspectBody.querySelectorAll('.btn-up'), function (btn) {
      btn.addEventListener('click', function () { buyUpgrade(+btn.dataset.path); });
    });
    Array.prototype.forEach.call(ui.inspectBody.querySelectorAll('.up-tier.available'), function (btn) {
      btn.addEventListener('click', function () { buyUpgrade(+btn.dataset.path); });
    });
    var sellBtn = $('btd6Sell');
    if (sellBtn) sellBtn.addEventListener('click', sellSelected);
    var rngBtn = $('btd6RngRoll');
    if (rngBtn) rngBtn.addEventListener('click', function () { rollRngMonkey(tSel); });
  }

  function renderMapCards() {
    if (!ui.mapGrid) return;
    ui.mapGrid.innerHTML = '';
    var order = { beginner: 0, intermediate: 1, advanced: 2, expert: 3 };
    Object.keys(DATA.maps).sort(function (a, b) {
      var ma = DATA.maps[a], mb = DATA.maps[b];
      var da = order[ma.difficulty] != null ? order[ma.difficulty] : 9;
      var db = order[mb.difficulty] != null ? order[mb.difficulty] : 9;
      if (da !== db) return da - db;
      return mapName(ma).localeCompare(mapName(mb), lang() === 'zh' ? 'zh' : 'en');
    }).forEach(function (id) {
      var m = DATA.maps[id];
      var medal = profile.medals[id] && profile.medals[id].standard;
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'map-card';
      card.innerHTML = '<div class="map-thumb" data-map="' + id + '"></div>' +
        '<div class="map-info"><h3>' + mapName(m) + '</h3>' +
        '<span class="diff ' + m.difficulty + '">' + tr('diff.' + m.difficulty) + '</span>' +
        (medal ? '<span class="medal">' + tr('maps.cleared') + '</span>' : '') +
        (mapDesc(m) ? '<p class="map-desc">' + mapDesc(m) + '</p>' : '') +
        '<span class="play">' + tr('maps.play') + '</span></div>';
      card.addEventListener('click', function () { startBattle(id); });
      ui.mapGrid.appendChild(card);
      drawMapThumb(card.querySelector('.map-thumb'), m);
    });
  }

  function drawMapThumb(el, map) {
    var c = document.createElement('canvas');
    c.width = 240; c.height = 140;
    el.appendChild(c);
    var ctx = c.getContext('2d');
    var sx = c.width / map.width, sy = c.height / map.height;
    var pal = themePalette(map);
    ctx.fillStyle = pal.top;
    ctx.fillRect(0, 0, c.width, c.height);
    function thumbWater(ww) {
      if (!ww) return;
      ctx.fillStyle = '#3a88b8';
      ctx.beginPath();
      ctx.ellipse(ww.x * sx, ww.y * sy, ww.rx * sx, ww.ry * sy, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    thumbWater(map.water);
    (map.waters || []).forEach(thumbWater);
    ctx.strokeStyle = pal.path;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    map.paths.forEach(function (p) {
      ctx.beginPath();
      p.nodes.forEach(function (n, i) {
        if (i === 0) ctx.moveTo(n.x * sx, n.y * sy); else ctx.lineTo(n.x * sx, n.y * sy);
      });
      ctx.stroke();
    });
  }

  function renderKnowledge() {
    if (!ui.knowledgeList) return;
    reloadProfileSkills();
    migrateKnowledgeLevels(profile);
    refreshHomeCurrencies();
    ui.knowledgeList.innerHTML = '';

    var rebirthWrap = document.createElement('div');
    rebirthWrap.className = 'skill-rebirth' + (allSkillsMaxed() ? ' ready' : '');
    var rebirths = (profile.skillRebirths | 0);
    var pierceMul = skillRebirthPierceMul();
    var rebirthStatus = rebirths > 0
      ? '<p class="rebirth-active">' + tr('knowledge.rebirthActive', { n: rebirths, mul: pierceMul }) + '</p>'
      : '';
    if (allSkillsMaxed()) {
      rebirthWrap.innerHTML =
        rebirthStatus +
        '<p class="rebirth-hint">' + tr('knowledge.rebirthHint') + '</p>' +
        '<button type="button" class="btn rebirth-btn" id="btnSkillRebirth">' + tr('knowledge.rebirth') + '</button>';
    } else {
      rebirthWrap.innerHTML =
        rebirthStatus +
        '<p class="rebirth-hint muted">' + tr('knowledge.rebirthLocked') + '</p>';
    }
    ui.knowledgeList.appendChild(rebirthWrap);
    var rebirthBtn = rebirthWrap.querySelector('#btnSkillRebirth');
    if (rebirthBtn) rebirthBtn.addEventListener('click', doSkillRebirth);

    var branches = [];
    DATA.knowledgeNodes.forEach(function (node) {
      var b = node.branch || 'Other';
      if (branches.indexOf(b) < 0) branches.push(b);
    });
    branches.forEach(function (branch) {
      var head = document.createElement('h3');
      head.className = 'knowledge-branch';
      head.textContent = branchName(branch);
      ui.knowledgeList.appendChild(head);
      DATA.knowledgeNodes.filter(function (n) { return (n.branch || 'Other') === branch; }).forEach(function (node) {
        var lvl = knowledgeLevel(node.id);
        var reqs = node.requires || [];
        var missing = reqs.filter(function (id) { return !knowledgeHas(id); });
        var locked = missing.length > 0 && lvl < 1;
        var maxed = lvl >= 3;
        var nextLvl = lvl + 1;
        var cost = knowledgeRankCost(node, Math.max(1, nextLvl));
        var card = document.createElement('div');
        card.className = 'shop-card' + (lvl > 0 ? ' owned' : '') + (locked ? ' locked' : '');
        var reqNames = missing.map(function (id) {
          var n = DATA.knowledgeNodes.find(function (x) { return x.id === id; });
          return n ? knowledgeName(n) : id;
        });
        var extra = locked
          ? '<p class="req-note">' + tr('knowledge.needs') + ' ' + reqNames.join(', ') + '</p>'
          : '';
        var levelLabel = lvl > 0
          ? '<div class="level-tag">' + tr('knowledge.level', { n: lvl }) + '</div>'
          : '';
        var bars = '<div class="knowledge-bars" aria-hidden="true">';
        var bi;
        for (bi = 1; bi <= 3; bi++) {
          bars += '<span class="kbar' + (bi <= lvl ? ' on' : '') + '"></span>';
        }
        bars += '</div>';
        var action;
        if (locked) {
          action = '<span class="owned-tag">' + tr('knowledge.locked') + '</span>';
        } else if (maxed) {
          action = '<span class="owned-tag">' + tr('knowledge.maxed') + '</span>';
        } else {
          var label = lvl < 1 ? tr('knowledge.buy') : tr('knowledge.upgrade');
          action = '<button type="button" class="btn" data-kid="' + node.id + '">' + label + '</button>';
        }
        card.innerHTML =
          levelLabel +
          '<h3>' + knowledgeName(node) + '</h3>' +
          '<p>' + knowledgeDesc(node) + (lvl > 0 ? ' ×' + lvl : '') + '</p>' +
          extra +
          '<div class="shop-row"><span>' + (maxed ? '—' : cost + ' ' + tr('knowledge.kp')) + '</span>' + action + '</div>' +
          bars;
        ui.knowledgeList.appendChild(card);
        var btn = card.querySelector('button[data-kid]');
        if (btn) {
          btn.addEventListener('click', function () {
            var cur = knowledgeLevel(node.id);
            if (cur >= 3) return;
            if (cur < 1 && (node.requires || []).some(function (id) { return !knowledgeHas(id); })) {
              toast(tr('toast.needReq'));
              return;
            }
            var want = cur + 1;
            var price = knowledgeRankCost(node, want);
            if (profile.knowledgePoints < price) { toast(tr('toast.needKp')); return; }
            profile.knowledgePoints -= price;
            if (!profile.knowledgeLevels) profile.knowledgeLevels = {};
            profile.knowledgeLevels[node.id] = want;
            syncUnlockedKnowledgeList(profile);
            if (!saveProfile()) {
              reloadProfileSkills();
              renderKnowledge();
              toast(tr('toast.saveFail'));
              return;
            }
            renderKnowledge();
            if (want === 1) toast(tr('toast.unlocked', { name: knowledgeName(node) }));
            else toast(tr('toast.upgraded', { name: knowledgeName(node), n: want }));
          });
        }
      });
    });
  }

  function renderStore() {
    if (!ui.storeList) return;
    refreshHomeCurrencies();
    ui.storeList.innerHTML = '';
    DATA.trophyStore.forEach(function (sku) {
      var owned = profile.ownedStore.indexOf(sku.id) >= 0;
      var card = document.createElement('div');
      card.className = 'shop-card' + (owned ? ' owned' : '');
      card.innerHTML = '<h3>' + storeName(sku) + '</h3><p>' + storeDesc(sku) + '</p>' +
        '<div class="shop-row"><span>' + sku.cost + ' ' + tr('chip.trophies') + '</span>' +
        (owned ? '<span class="owned-tag">' + tr('knowledge.owned') + '</span>' :
          '<button type="button" class="btn" data-sid="' + sku.id + '">' + tr('knowledge.buy') + '</button>') + '</div>';
      ui.storeList.appendChild(card);
      var btn = card.querySelector('button[data-sid]');
      if (btn) {
        btn.addEventListener('click', function () {
          if (profile.trophies < sku.cost) { toast(tr('toast.needTrophies')); return; }
          profile.trophies -= sku.cost;
          profile.ownedStore.push(sku.id);
          saveProfile();
          if (global.ArthurProfile && (sku.id === 'gold_frame' || sku.id === 'speed_pin')) {
            ArthurProfile.grant(sku.id);
          }
          renderStore();
          toast(tr('toast.purchased', { name: storeName(sku) }));
        });
      }
    });
  }

  /* ─── Screens ─── */
  function showScreen(id) {
    screenId = id;
    ['home', 'mapselect', 'knowledge', 'store', 'pvpsetup', 'battle'].forEach(function (s) {
      var el = $('screen-' + s);
      if (el) el.classList.toggle('hidden', s !== id);
    });
    if (id === 'home') refreshHomeCurrencies();
    if (id === 'mapselect') renderMapCards();
    if (id === 'knowledge') {
      reloadProfileSkills();
      renderKnowledge();
    }
    if (id === 'store') renderStore();
    if (id === 'pvpsetup') populatePvpSetup();
    if (id !== 'battle') {
      document.body.classList.remove('pvp-build-phase', 'pvp-send-phase');
    }
  }

  function populatePvpSetup() {
    var sel = $('pvpMap');
    if (!sel) return;
    sel.innerHTML = '';
    Object.keys(DATA.maps).sort(function (a, b) {
      var da = DATA.maps[a].difficulty || '';
      var db = DATA.maps[b].difficulty || '';
      if (da !== db) return da.localeCompare(db);
      return mapName(DATA.maps[a]).localeCompare(mapName(DATA.maps[b]), lang() === 'zh' ? 'zh' : 'en');
    }).forEach(function (id) {
      var m = DATA.maps[id];
      var opt = document.createElement('option');
      opt.value = id;
      opt.textContent = mapName(m) + ' (' + tr('diff.' + m.difficulty) + ')';
      if (id === 'monkey_meadow') opt.selected = true;
      sel.appendChild(opt);
    });
    updatePvpRoleNote();
  }

  function updatePvpRoleNote() {
    var role = $('pvpP1Role');
    var note = $('pvpRoleNote');
    if (!role || !note) return;
    note.textContent = role.value === 'monkey' ? tr('pvp.p2bloon') : tr('pvp.p2monkey');
    note.setAttribute('data-i18n', role.value === 'monkey' ? 'pvp.p2bloon' : 'pvp.p2monkey');
  }

  function startPvpFromForm(e) {
    if (e) e.preventDefault();
    var mapId = ($('pvpMap') && $('pvpMap').value) || 'monkey_meadow';
    var p1Role = ($('pvpP1Role') && $('pvpP1Role').value) || 'monkey';
    var lives = parseInt(($('pvpLives') && $('pvpLives').value) || '150', 10);
    var monkeyCash = parseInt(($('pvpMonkeyCash') && $('pvpMonkeyCash').value) || '650', 10);
    var bloonCash = parseInt(($('pvpBloonCash') && $('pvpBloonCash').value) || '200', 10);
    var maxTurns = parseInt(($('pvpMaxTurns') && $('pvpMaxTurns').value) || '20', 10);
    startBattle(mapId, {
      pvp: true,
      p1Role: p1Role,
      lives: Math.max(20, lives || 150),
      monkeyCash: Math.max(200, monkeyCash || 650),
      bloonCash: Math.max(50, bloonCash || 200),
      maxTurns: Math.max(5, Math.min(40, maxTurns || 20)),
    });
    toast(pvpWhoseTurnLabel());
  }

  function startBattle(mapId, opts) {
    hideOverlay();
    battle = createBattle(mapId, opts || {});
    var canvas = ui.canvas;
    canvas.width = battle.map.width;
    canvas.height = battle.map.height;
    showScreen('battle');
    refreshBuyBar();
    refreshInspect();
    refreshHud();
    lastTs = 0;
    if (global.BTD6WebGL && typeof global.BTD6WebGL.start === 'function') {
      try {
        global.BTD6WebGL.start(battle, canvas);
      } catch (err) {
        console.warn('[BTD6] WebGL style pipeline failed; using 2D fallback', err);
        if (global.BTD6WebGL.stop) global.BTD6WebGL.stop();
      }
    }
    if (!raf) loop(0);
  }

  function endBattleToMenu() {
    if (global.BTD6WebGL && global.BTD6WebGL.stop) global.BTD6WebGL.stop();
    battle = null;
    hideOverlay();
    showScreen('home');
    refreshHomeCurrencies();
  }

  function loop(ts) {
    raf = requestAnimationFrame(loop);
    if (!lastTs) lastTs = ts;
    var dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    if (battle && screenId === 'battle') {
      tick(dt);
      draw();
    }
  }

  /* ─── Input ─── */
  function bindInput() {
    var canvas = ui.canvas;
    canvas.addEventListener('mousemove', function (e) {
      if (!battle) return;
      var rect = canvas.getBoundingClientRect();
      var x = (e.clientX - rect.left) * (canvas.width / rect.width);
      var y = (e.clientY - rect.top) * (canvas.height / rect.height);
      battle.ghostX = x;
      battle.ghostY = y;
      if (battle.placingKind) battle.ghostOk = canPlace(battle.placingKind, x, y);
    });
    canvas.addEventListener('click', function (e) {
      if (!battle || battle.won || battle.lost) return;
      var rect = canvas.getBoundingClientRect();
      var x = (e.clientX - rect.left) * (canvas.width / rect.width);
      var y = (e.clientY - rect.top) * (canvas.height / rect.height);
      if (battle.placingKind) {
        placeTower(battle.placingKind, x, y);
        return;
      }
      /* select tower */
      var best = null, bestD = 28 * 28, i, t;
      for (i = 0; i < battle.towers.length; i++) {
        t = battle.towers[i];
        var d = dist2(x, y, t.x, t.y);
        if (d < bestD) { bestD = d; best = t; }
      }
      battle.selectedTowerId = best ? best.id : null;
      refreshInspect();
    });
    canvas.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      if (battle) { battle.placingKind = null; refreshBuyBarAfford(); }
    });

    document.addEventListener('keydown', function (e) {
      if (screenId === 'home' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        showScreen('mapselect');
        return;
      }
      if (screenId !== 'battle' || !battle) return;
      if (e.key === 'Escape') {
        battle.placingKind = null;
        battle.selectedTowerId = null;
        refreshInspect();
        refreshBuyBarAfford();
        return;
      }
      if (e.key === ' ') {
        e.preventDefault();
        if (battle.pvp) {
          if (!battle.roundActive) pvpReady();
        } else if (!battle.roundActive) {
          startRound();
        }
        return;
      }
      if (e.key === 'a' || e.key === 'A') {
        if (battle.pvp) return;
        e.preventDefault();
        toggleAutoStart();
        return;
      }
      if (e.key === 'p' || e.key === 'P') {
        battle.paused = !battle.paused;
        refreshHud();
        return;
      }
      if (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4' || e.key === '5') {
        if (battle.pvp && battle.pvpPhase === 'send') return;
        var cats = ['primary', 'military', 'magic', 'support', 'special'];
        battle.buyCategory = cats[+e.key - 1];
        refreshBuyBar();
        return;
      }
      var key = e.key.toUpperCase();
      if ('QWERTYU'.indexOf(key) >= 0 && battle) {
        if (battle.pvp && battle.pvpPhase !== 'build') return;
        var cat = DATA.buyBar.categories.find(function (c) { return c.id === battle.buyCategory; });
        if (!cat) return;
        var slot = cat.slots.find(function (s) { return s.hotkey === key; });
        if (slot) selectBuyKind(slot.kind);
      }
    });
  }

  function wireDom() {
    ui = {
      canvas: $('btd6Canvas'),
      ctx: null,
      lives: $('hudLives'),
      cash: $('hudCash'),
      cashLabel: $('hudCashLabel'),
      bloonEco: $('hudBloonEco'),
      bloonEcoWrap: $('hudBloonEcoWrap'),
      phase: $('hudPhase'),
      phaseWrap: $('hudPhaseWrap'),
      round: $('hudRound'),
      roundLabel: $('hudRoundLabel'),
      btnStart: $('btnStartRound'),
      btnAuto: $('btnAuto'),
      btnPvpReady: $('btnPvpReady'),
      speedLabel: $('hudSpeed'),
      buySlots: $('buySlots'),
      buyTabs: $('buyTabs'),
      inspect: $('inspectPanel'),
      inspectBody: $('inspectBody'),
      toast: $('btd6Toast'),
      overlay: $('btd6Overlay'),
      overlayTitle: $('overlayTitle'),
      overlayMsg: $('overlayMsg'),
      mapGrid: $('mapGrid'),
      knowledgeList: $('knowledgeList'),
      storeList: $('storeList'),
      mm: $('profileMM'),
      tr: $('profileTR'),
      kp: $('profileKP'),
      kp2: $('knowledgeKP'),
    };
    if (ui.canvas) ui.ctx = ui.canvas.getContext('2d');

    var play = $('home.btn.play') || $('btnPlay');
    var pvpBtn = $('home.btn.pvp') || $('btnPvp');
    var mapSel = $('home.btn.map_select') || $('btnMapSelect');
    var know = $('home.btn.knowledge') || $('btnKnowledge');
    var store = $('home.btn.trophy_store') || $('btnStore');
    if (play) play.addEventListener('click', function () { showScreen('mapselect'); });
    if (pvpBtn) pvpBtn.addEventListener('click', function () { showScreen('pvpsetup'); });
    if (mapSel) mapSel.addEventListener('click', function () { showScreen('mapselect'); });
    if (know) know.addEventListener('click', function () { showScreen('knowledge'); });
    if (store) store.addEventListener('click', function () { showScreen('store'); });
    var langBtn = $('btnLang');
    if (langBtn) langBtn.addEventListener('click', toggleLang);

    var pvpForm = $('pvpSetupForm');
    if (pvpForm) pvpForm.addEventListener('submit', startPvpFromForm);
    var p1Role = $('pvpP1Role');
    if (p1Role) p1Role.addEventListener('change', updatePvpRoleNote);

    Array.prototype.forEach.call(document.querySelectorAll('[data-back]'), function (btn) {
      btn.addEventListener('click', function () { showScreen(btn.dataset.back); });
    });

    if (ui.btnStart) ui.btnStart.addEventListener('click', startRound);
    if (ui.btnPvpReady) ui.btnPvpReady.addEventListener('click', pvpReady);
    if (ui.btnAuto) ui.btnAuto.addEventListener('click', toggleAutoStart);
    var btnPause = $('btnPause');
    if (btnPause) btnPause.addEventListener('click', function () {
      if (!battle) return;
      battle.paused = !battle.paused;
      refreshHud();
    });
    var btn1 = $('btnSpeed1'), btn2 = $('btnSpeed2');
    if (btn1) btn1.addEventListener('click', function () { if (battle) { battle.gameSpeed = 1; battle.paused = false; refreshHud(); } });
    if (btn2) btn2.addEventListener('click', function () { if (battle) { battle.gameSpeed = 2; battle.paused = false; refreshHud(); } });
    var btnMenu = $('btnBattleMenu');
    if (btnMenu) btnMenu.addEventListener('click', function () {
      if (confirm(tr('confirm.leave'))) endBattleToMenu();
    });
    var btnOverlayHome = $('btnOverlayHome');
    if (btnOverlayHome) btnOverlayHome.addEventListener('click', endBattleToMenu);

    if (ui.buyTabs) {
      Array.prototype.forEach.call(ui.buyTabs.querySelectorAll('[data-cat]'), function (tab) {
        tab.addEventListener('click', function () {
          if (!battle) return;
          if (battle.pvp && battle.pvpPhase === 'send') return;
          battle.buyCategory = tab.dataset.cat;
          refreshBuyBar();
        });
      });
    }

    bindInput();
  }

  function init(opts) {
    DATA = global.BTD6_DATA;
    if (!DATA) {
      console.error('BTD6_DATA missing — load bloons-td6-data.js first');
      return;
    }
    profile = loadProfile();
    try {
      var shared = localStorage.getItem('arthurGamesLang');
      if (shared === 'zh' || shared === 'en') profile.lang = shared;
    } catch (e) { /* ignore */ }
    if (global.ArthurProfile) {
      ArthurProfile.syncFromBloonsStore(profile.ownedStore || []);
    }
    wireDom();
    applyI18n();
    showScreen((opts && opts.screen) || 'home');
    refreshHomeCurrencies();
    try {
      global.addEventListener('beforeunload', function () {
        if (profile) saveProfile();
      });
      global.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden' && profile) saveProfile();
      });
    } catch (e2) { /* ignore */ }
  }

  global.BTD6 = {
    init: init,
    showScreen: showScreen,
    startBattle: startBattle,
    saveProfile: saveProfile,
    loadProfile: function () { profile = loadProfile(); return profile; },
    getProfile: function () { return profile; },
    canBuyUpgrade: canBuyUpgrade,
    buyUpgrade: buyUpgrade,
    sellSelected: sellSelected,
    startRound: startRound,
    pvpReady: pvpReady,
    toggleAutoStart: toggleAutoStart,
    tick: tick,
    PositionAt: PositionAt,
    getBattle: function () { return battle; },
  };
})(window);
