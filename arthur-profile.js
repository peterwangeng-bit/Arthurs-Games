/**
 * Shared Arthur Games profile + cosmetics.
 * Earn frames/pins/titles across games; equip them here; badge shows on every page that loads this script.
 */
(function (global) {
  var LS = 'arthurProfileV1';

  var CATALOG = [
    {
      id: 'gold_frame',
      slot: 'frame',
      name: 'Gold Frame',
      nameZh: '金框',
      desc: 'Shiny victory frame for your profile badge.',
      descZh: '个人资料徽章的闪亮胜利金框。',
      source: 'Bloons TD Trophy Store',
      sourceZh: '气球塔防奖杯商店',
      emoji: '🟨',
      accent: '#e8b820',
    },
    {
      id: 'parkour_frame',
      slot: 'frame',
      name: 'Skyline Frame',
      nameZh: '天际线框',
      desc: 'Finish the Learn to Parkour campaign 3 times.',
      descZh: '通关「学跑酷」战役 3 次。',
      source: 'Learn to parkour',
      sourceZh: '学跑酷',
      emoji: '🏙️',
      accent: '#7ab8ff',
    },
    {
      id: 'speed_pin',
      slot: 'pin',
      name: 'Speed Pin',
      nameZh: '速度徽章',
      desc: 'A sleek pin for your profile.',
      descZh: '别在资料上的速度徽章。',
      source: 'Bloons TD Trophy Store',
      sourceZh: '气球塔防奖杯商店',
      emoji: '⚡',
      accent: '#48c8ff',
    },
    {
      id: 'bloon_popper',
      slot: 'pin',
      name: 'Bloon Popper',
      nameZh: '气球爆破手',
      desc: 'Win Bloons TD maps 5 times (40 rounds each).',
      descZh: '通关气球塔防地图 5 次（每次 40 回合）。',
      source: 'Bloons TD',
      sourceZh: '气球塔防',
      emoji: '🎈',
      accent: '#ff6622',
    },
    {
      id: 'snack_catcher',
      slot: 'pin',
      name: 'Snack Catcher',
      nameZh: '零食捕手',
      desc: 'Score 250+ in Snack Catch.',
      descZh: '零食接接乐得分 250+。',
      source: 'Snack Catch',
      sourceZh: '零食接接乐',
      emoji: '🍪',
      accent: '#ff9c34',
    },
    {
      id: 'road_rager',
      slot: 'pin',
      name: 'Road Rager',
      nameZh: '路怒徽章',
      desc: 'Score 1500+ in Rage Car.',
      descZh: '怒火飙车得分 1500+。',
      source: 'Rage Car',
      sourceZh: '怒火飙车',
      emoji: '🏎️',
      accent: '#ff5c2b',
    },
    {
      id: 'sharpshooter',
      slot: 'pin',
      name: 'Sharpshooter',
      nameZh: '神射手',
      desc: 'Reach wave 20 in Target Blaster.',
      descZh: '靶场爆破到达第 20 波。',
      source: 'Target Blaster',
      sourceZh: '靶场爆破',
      emoji: '🎯',
      accent: '#3f92ff',
    },
    {
      id: 'depth_veteran',
      slot: 'pin',
      name: 'Depth Veteran',
      nameZh: '深空老兵',
      desc: 'Score 1500+ in Depth Strike.',
      descZh: '深空打击得分 1500+。',
      source: 'Depth Strike',
      sourceZh: '深空打击',
      emoji: '🔫',
      accent: '#4a78d8',
    },
    {
      id: 'royale_crown',
      slot: 'pin',
      name: 'Royale Crown',
      nameZh: '大逃杀王冠',
      desc: 'Win Island Royale 5 times.',
      descZh: '赢得海岛大逃杀 5 次。',
      source: 'Island Royale',
      sourceZh: '海岛大逃杀',
      emoji: '👑',
      accent: '#ffe066',
    },
    {
      id: 'parkour_grad',
      slot: 'pin',
      name: 'Parkour Grad',
      nameZh: '跑酷毕业生',
      desc: 'Clear parkour campaign acts 3 times.',
      descZh: '通过跑酷战役幕次共 3 次。',
      source: 'Learn to parkour',
      sourceZh: '学跑酷',
      emoji: '🤸',
      accent: '#7ab8ff',
    },
    {
      id: 'title_popper',
      slot: 'title',
      name: 'Popper',
      nameZh: '爆破者',
      desc: 'Title from winning Bloons TD 5 times.',
      descZh: '通关气球塔防 5 次获得的称号。',
      source: 'Bloons TD',
      sourceZh: '气球塔防',
      emoji: '🏆',
      accent: '#ff8c28',
    },
    {
      id: 'title_survivor',
      slot: 'title',
      name: 'Survivor',
      nameZh: '幸存者',
      desc: 'Title from winning Island Royale 5 times.',
      descZh: '赢得海岛大逃杀 5 次获得的称号。',
      source: 'Island Royale',
      sourceZh: '海岛大逃杀',
      emoji: '🏝️',
      accent: '#ffe066',
    },
  ];

  var BY_ID = {};
  CATALOG.forEach(function (c) {
    BY_ID[c.id] = c;
  });

  var overlayEl = null;
  var badgeEl = null;
  var stylesInjected = false;
  var listeners = [];
  var homeChrome = false;

  function isHubHome() {
    try {
      var path = (global.location.pathname || '').split('/').pop() || '';
      return path === '' || path === 'index.html' || path === 'index.htm';
    } catch (e) {
      return false;
    }
  }

  function zh() {
    try {
      return localStorage.getItem('arthurGamesLang') === 'zh';
    } catch (e) {
      return false;
    }
  }

  function itemName(item) {
    return zh() && item.nameZh ? item.nameZh : item.name;
  }

  function itemDesc(item) {
    return zh() && item.descZh ? item.descZh : item.desc;
  }

  function itemSource(item) {
    return zh() && item.sourceZh ? item.sourceZh : item.source;
  }

  function defaultState() {
    return {
      displayName: 'Arthur',
      owned: [],
      equipped: { frame: null, pin: null, title: null },
      progress: {},
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(LS);
      if (!raw) return defaultState();
      var p = JSON.parse(raw);
      var d = defaultState();
      if (!p || typeof p !== 'object') return d;
      if (!Array.isArray(p.owned)) p.owned = [];
      if (!p.equipped || typeof p.equipped !== 'object') p.equipped = d.equipped;
      ['frame', 'pin', 'title'].forEach(function (slot) {
        if (p.equipped[slot] === undefined) p.equipped[slot] = null;
      });
      if (!p.progress || typeof p.progress !== 'object') p.progress = {};
      if (typeof p.displayName !== 'string' || !p.displayName.trim()) p.displayName = d.displayName;
      return p;
    } catch (e) {
      return defaultState();
    }
  }

  function save(state) {
    try {
      localStorage.setItem(LS, JSON.stringify(state));
    } catch (e) {}
    notify();
    if (homeChrome) refreshBadge();
    if (overlayEl && !overlayEl.classList.contains('hidden')) render();
  }

  function notify() {
    var state = load();
    listeners.forEach(function (fn) {
      try {
        fn(state);
      } catch (e) {}
    });
  }

  function has(id) {
    return load().owned.indexOf(id) >= 0;
  }

  function grant(id, opts) {
    opts = opts || {};
    if (!BY_ID[id]) return false;
    var state = load();
    if (state.owned.indexOf(id) >= 0) return false;
    state.owned.push(id);
    var item = BY_ID[id];
    if (opts.autoEquip !== false && !state.equipped[item.slot]) {
      state.equipped[item.slot] = id;
    }
    save(state);
    if (opts.silent !== true) toastUnlock(item);
    return true;
  }

  /** Bump a named progress counter (for multi-win badges). Returns new total. */
  function note(key, amount) {
    var state = load();
    if (!state.progress) state.progress = {};
    var add = amount == null ? 1 : amount | 0;
    if (add < 1) add = 1;
    state.progress[key] = (state.progress[key] | 0) + add;
    save(state);
    return state.progress[key] | 0;
  }

  function progress(key) {
    var state = load();
    return ((state.progress && state.progress[key]) | 0);
  }

  /** Grant when progress[key] has reached need (does not bump). */
  function tryGrantAt(id, key, need, opts) {
    if (has(id)) return false;
    if (progress(key) < (need | 0)) return false;
    return grant(id, opts);
  }

  function grantMany(ids, opts) {
    var any = false;
    (ids || []).forEach(function (id) {
      if (grant(id, Object.assign({}, opts, { silent: true }))) any = true;
    });
    if (any && !(opts && opts.silent)) {
      toast(zh() ? '新外观已解锁！打开个人资料查看。' : 'New cosmetics unlocked! Open Profile to equip.');
    }
    return any;
  }

  /** Sync Bloons trophy-store cosmetics into the shared profile. */
  function syncFromBloonsStore(ownedStore) {
    var map = { gold_frame: 'gold_frame', speed_pin: 'speed_pin' };
    var newly = [];
    (ownedStore || []).forEach(function (sid) {
      var pid = map[sid];
      if (pid && grant(pid, { silent: true, autoEquip: true })) newly.push(pid);
    });
    if (newly.length) {
      toast(zh() ? '奖杯商店外观已同步到个人资料。' : 'Trophy Store flair synced to your Profile.');
    }
  }

  function equip(id) {
    var item = BY_ID[id];
    if (!item || !has(id)) return false;
    var state = load();
    state.equipped[item.slot] = id;
    save(state);
    return true;
  }

  function unequip(slot) {
    var state = load();
    if (!state.equipped[slot]) return false;
    state.equipped[slot] = null;
    save(state);
    return true;
  }

  function setDisplayName(name) {
    var state = load();
    state.displayName = String(name || 'Arthur').trim().slice(0, 18) || 'Arthur';
    save(state);
  }

  function getEquipped() {
    var state = load();
    return {
      frame: state.equipped.frame ? BY_ID[state.equipped.frame] || null : null,
      pin: state.equipped.pin ? BY_ID[state.equipped.pin] || null : null,
      title: state.equipped.title ? BY_ID[state.equipped.title] || null : null,
      displayName: state.displayName,
      ownedCount: state.owned.length,
    };
  }

  function toast(msg) {
    injectStyles();
    var el = document.createElement('div');
    el.className = 'arthurProfileToast';
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(function () {
      el.classList.add('on');
    });
    setTimeout(function () {
      el.classList.remove('on');
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 280);
    }, 2800);
  }

  function toastUnlock(item) {
    toast(
      (zh() ? '解锁：' : 'Unlocked: ') +
        item.emoji +
        ' ' +
        itemName(item) +
        (zh() ? ' — 打开个人资料装备' : ' — open Profile to equip')
    );
  }

  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    var css = document.createElement('style');
    css.id = 'arthurProfileStyles';
    css.textContent =
      '#arthurProfileOverlay{position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(12,16,28,.55);backdrop-filter:blur(6px)}' +
      '#arthurProfileOverlay.hidden{display:none!important}' +
      '#arthurProfileOverlay .panel{width:min(560px,100%);max-height:min(86vh,720px);overflow:auto;border-radius:18px;background:linear-gradient(165deg,#1a2238,#12182a);color:#e8eef8;border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 60px rgba(0,0,0,.45);font-family:Segoe UI,system-ui,sans-serif}' +
      '#arthurProfileOverlay .head{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08)}' +
      '#arthurProfileOverlay .title{margin:0;font-size:1.05rem;font-weight:700;letter-spacing:.04em}' +
      '#arthurProfileOverlay .close{margin-left:auto;border:0;border-radius:10px;padding:8px 12px;background:rgba(255,255,255,.08);color:#e8eef8;cursor:pointer;font-weight:600}' +
      '#arthurProfileOverlay .close:hover{background:rgba(255,255,255,.14)}' +
      '#arthurProfileOverlay .body{padding:14px 16px 18px}' +
      '#arthurProfileOverlay .preview{display:flex;align-items:center;gap:14px;padding:14px;border-radius:14px;background:rgba(255,255,255,.05);margin-bottom:14px}' +
      '#arthurProfileOverlay .badge-preview{width:72px;height:72px;border-radius:18px;display:grid;place-items:center;font-size:1.6rem;background:linear-gradient(145deg,#2a3555,#1a2238);border:3px solid rgba(255,255,255,.15);position:relative;flex-shrink:0}' +
      '#arthurProfileOverlay .badge-preview .pin{position:absolute;right:-6px;top:-6px;font-size:1.1rem;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))}' +
      '#arthurProfileOverlay .who{font-size:1.15rem;font-weight:700}' +
      '#arthurProfileOverlay .who-title{font-size:.85rem;color:#9eb0d0;margin-top:2px}' +
      '#arthurProfileOverlay .name-row{display:flex;gap:8px;margin:10px 0 16px}' +
      '#arthurProfileOverlay .name-row input{flex:1;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.25);color:#e8eef8;padding:8px 10px;font:inherit}' +
      '#arthurProfileOverlay .name-row button{border:0;border-radius:10px;padding:8px 12px;background:#3d6fd9;color:#fff;font-weight:700;cursor:pointer}' +
      '#arthurProfileOverlay .sec{font-size:.72rem;text-transform:uppercase;letter-spacing:.12em;color:#8a9bb8;margin:14px 0 8px;font-weight:700}' +
      '#arthurProfileOverlay .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}' +
      '#arthurProfileOverlay .item{border-radius:12px;padding:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}' +
      '#arthurProfileOverlay .item.owned{border-color:rgba(120,180,255,.35)}' +
      '#arthurProfileOverlay .item.eq{border-color:#e8b820;box-shadow:0 0 0 1px rgba(232,184,32,.35)}' +
      '#arthurProfileOverlay .item.locked{opacity:.55}' +
      '#arthurProfileOverlay .item h4{margin:0 0 4px;font-size:.92rem}' +
      '#arthurProfileOverlay .item p{margin:0 0 8px;font-size:.75rem;color:#9eb0d0;line-height:1.35;min-height:2.4em}' +
      '#arthurProfileOverlay .item .meta{font-size:.68rem;color:#7a8aa8;margin-bottom:8px}' +
      '#arthurProfileOverlay .item button{width:100%;border:0;border-radius:8px;padding:7px 8px;font-weight:700;cursor:pointer;background:rgba(255,255,255,.1);color:#e8eef8}' +
      '#arthurProfileOverlay .item button:disabled{opacity:.5;cursor:default}' +
      '#arthurProfileOverlay .item.eq button{background:#e8b820;color:#1a1408}' +
      '#arthurProfileBadge{position:fixed;left:12px;bottom:12px;right:auto;z-index:10015;display:flex;align-items:center;gap:8px;padding:6px 10px 6px 6px;border-radius:999px;background:rgba(18,24,40,.82);color:#e8eef8;border:1px solid rgba(255,255,255,.14);cursor:pointer;font-family:Segoe UI,system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.35);backdrop-filter:blur(8px);max-width:min(200px,46vw)}' +
      '#arthurProfileBadge:hover{background:rgba(28,36,58,.92)}' +
      '#arthurProfileBadge .av{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;font-size:1.05rem;background:linear-gradient(145deg,#2a3555,#1a2238);border:2px solid rgba(255,255,255,.18);position:relative;flex-shrink:0}' +
      '#arthurProfileBadge .av .pin{position:absolute;right:-5px;top:-5px;font-size:.85rem}' +
      '#arthurProfileBadge .txt{min-width:0}' +
      '#arthurProfileBadge .nm{font-size:.78rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '#arthurProfileBadge .tl{font-size:.65rem;color:#9eb0d0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '#arthurProfileBadge.hidden-badge{display:none!important}' +
      '.arthurProfileToast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,12px);z-index:10060;padding:10px 16px;border-radius:12px;background:rgba(18,24,40,.94);color:#e8eef8;border:1px solid rgba(255,220,120,.35);font:600 .88rem Segoe UI,system-ui,sans-serif;opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;max-width:min(420px,90vw);text-align:center;box-shadow:0 12px 32px rgba(0,0,0,.4)}' +
      '.arthurProfileToast.on{opacity:1;transform:translate(-50%,0)}' +
      'body.btd6-gold-frame .top-chip,body.btd6-gold-frame #screen-home .home-stage{box-shadow:0 0 0 3px #e8b820,0 8px 0 rgba(180,120,20,.35)!important}' +
      '@media(max-width:520px){#arthurProfileBadge{left:8px;bottom:8px;max-width:42vw}}';
    document.head.appendChild(css);
  }

  function ensureOverlay() {
    injectStyles();
    if (overlayEl) return overlayEl;
    overlayEl = document.createElement('div');
    overlayEl.id = 'arthurProfileOverlay';
    overlayEl.className = 'hidden';
    overlayEl.setAttribute('role', 'dialog');
    overlayEl.setAttribute('aria-modal', 'true');
    overlayEl.innerHTML =
      '<div class="panel">' +
      '<div class="head">' +
      '<p class="title" id="arthurProfileTitle">Profile</p>' +
      '<button type="button" class="close" id="arthurProfileClose">Close</button>' +
      '</div>' +
      '<div class="body" id="arthurProfileBody"></div>' +
      '</div>';
    document.body.appendChild(overlayEl);
    overlayEl.addEventListener('click', function (e) {
      if (e.target === overlayEl) close();
    });
    overlayEl.querySelector('#arthurProfileClose').addEventListener('click', close);
    return overlayEl;
  }

  function render() {
    if (!overlayEl) return;
    var body = overlayEl.querySelector('#arthurProfileBody');
    var titleEl = overlayEl.querySelector('#arthurProfileTitle');
    if (!body) return;
    var state = load();
    var eq = getEquipped();
    if (titleEl) titleEl.textContent = zh() ? '个人资料 / 外观' : 'Profile / Cosmetics';
    var closeBtn = overlayEl.querySelector('#arthurProfileClose');
    if (closeBtn) closeBtn.textContent = zh() ? '关闭' : 'Close';

    var frameAccent = eq.frame ? eq.frame.accent : 'rgba(255,255,255,.18)';
    var pinEmoji = eq.pin ? eq.pin.emoji : '';
    var titleLabel = eq.title ? itemName(eq.title) : zh() ? '无称号' : 'No title';

    var html =
      '<div class="preview">' +
      '<div class="badge-preview" style="border-color:' +
      frameAccent +
      '">' +
      (eq.frame ? eq.frame.emoji : '🎮') +
      (pinEmoji ? '<span class="pin">' + pinEmoji + '</span>' : '') +
      '</div>' +
      '<div><div class="who">' +
      escapeHtml(state.displayName) +
      '</div><div class="who-title">' +
      escapeHtml(titleLabel) +
      '</div><div class="who-title" style="margin-top:6px">' +
      state.owned.length +
      '/' +
      CATALOG.length +
      (zh() ? ' 已收集' : ' collected') +
      '</div></div></div>';

    html +=
      '<div class="name-row"><input id="arthurProfileName" maxlength="18" value="' +
      escapeAttr(state.displayName) +
      '" /><button type="button" id="arthurProfileSaveName">' +
      (zh() ? '保存名字' : 'Save name') +
      '</button></div>';

    ['frame', 'pin', 'title'].forEach(function (slot) {
      var label =
        slot === 'frame'
          ? zh()
            ? '边框'
            : 'Frames'
          : slot === 'pin'
            ? zh()
              ? '徽章'
              : 'Pins'
            : zh()
              ? '称号'
              : 'Titles';
      html += '<div class="sec">' + label + '</div><div class="grid">';
      CATALOG.filter(function (c) {
        return c.slot === slot;
      }).forEach(function (item) {
        var owned = state.owned.indexOf(item.id) >= 0;
        var isEq = state.equipped[slot] === item.id;
        html +=
          '<div class="item' +
          (owned ? ' owned' : ' locked') +
          (isEq ? ' eq' : '') +
          '"><h4>' +
          item.emoji +
          ' ' +
          escapeHtml(itemName(item)) +
          '</h4><p>' +
          escapeHtml(itemDesc(item)) +
          '</p><div class="meta">' +
          escapeHtml(itemSource(item)) +
          '</div>';
        if (!owned) {
          html +=
            '<button type="button" disabled>' + (zh() ? '未解锁' : 'Locked') + '</button>';
        } else if (isEq) {
          html +=
            '<button type="button" data-unequip="' +
            slot +
            '">' +
            (zh() ? '已装备 · 卸下' : 'Equipped · Remove') +
            '</button>';
        } else {
          html +=
            '<button type="button" data-equip="' +
            item.id +
            '">' +
            (zh() ? '装备' : 'Equip') +
            '</button>';
        }
        html += '</div>';
      });
      html += '</div>';
    });

    body.innerHTML = html;

    var saveName = body.querySelector('#arthurProfileSaveName');
    var nameInput = body.querySelector('#arthurProfileName');
    if (saveName && nameInput) {
      saveName.addEventListener('click', function () {
        setDisplayName(nameInput.value);
        render();
      });
    }
    body.querySelectorAll('[data-equip]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        equip(btn.getAttribute('data-equip'));
      });
    });
    body.querySelectorAll('[data-unequip]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        unequip(btn.getAttribute('data-unequip'));
      });
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, '&#39;');
  }

  function open() {
    ensureOverlay();
    overlayEl.classList.remove('hidden');
    render();
  }

  function close() {
    if (overlayEl) overlayEl.classList.add('hidden');
  }

  function refreshBadge() {
    if (!homeChrome) {
      if (badgeEl && badgeEl.parentNode) {
        badgeEl.parentNode.removeChild(badgeEl);
        badgeEl = null;
      }
      return;
    }
    injectStyles();
    if (!document.body) return;
    if (!badgeEl) {
      badgeEl = document.createElement('button');
      badgeEl.type = 'button';
      badgeEl.id = 'arthurProfileBadge';
      badgeEl.title = 'Profile';
      badgeEl.addEventListener('click', function () {
        open();
      });
      document.body.appendChild(badgeEl);
    }
    badgeEl.classList.remove('hidden-badge');
    var eq = getEquipped();
    var frameAccent = eq.frame ? eq.frame.accent : 'rgba(255,255,255,.18)';
    badgeEl.innerHTML =
      '<span class="av" style="border-color:' +
      frameAccent +
      '">' +
      (eq.frame ? eq.frame.emoji : '🎮') +
      (eq.pin ? '<span class="pin">' + eq.pin.emoji + '</span>' : '') +
      '</span><span class="txt"><span class="nm">' +
      escapeHtml(eq.displayName) +
      '</span><span class="tl">' +
      escapeHtml(eq.title ? itemName(eq.title) : zh() ? '个人资料' : 'Profile') +
      '</span></span>';
  }

  function enableHomeChrome() {
    homeChrome = true;
    injectStyles();
    refreshBadge();
  }

  function onChange(fn) {
    if (typeof fn === 'function') listeners.push(fn);
  }

  function boot() {
    /* No floating badge in games or hub — hub uses the Profile button only. */
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  global.ArthurProfile = {
    catalog: CATALOG,
    load: load,
    has: has,
    grant: grant,
    grantMany: grantMany,
    note: note,
    progress: progress,
    tryGrantAt: tryGrantAt,
    syncFromBloonsStore: syncFromBloonsStore,
    equip: equip,
    unequip: unequip,
    setDisplayName: setDisplayName,
    getEquipped: getEquipped,
    open: open,
    close: close,
    toast: toast,
    onChange: onChange,
    refreshBadge: refreshBadge,
    enableHomeChrome: enableHomeChrome,
  };
})(window);
