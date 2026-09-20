(function (global) {
  const LS_COINS = 'arthurShopCoins';
  const LS_OWNED = 'arthurShopOwned';
  const LS_EQ = 'arthurShopEquipped';
  const EXCHANGE_RATE = 100;

  const GAME_BANK_META = {
    'parkour.html': {
      title: 'Learn to parkour',
      storageKey: 'obbyWallet',
      unit: 'coins',
      blurb: 'Coins you pick up in levels stay in your parkour wallet.',
    },
    'rage-car.html': {
      title: 'Rage Car',
      storageKey: 'rageCar_v1_coins',
      unit: 'coins',
      blurb: 'Run earnings bank here — also spent in the Rage Car shop.',
    },
    'gun-game.html': {
      title: 'Target Blaster',
      storageKey: 'tb_gun_v2_credits',
      unit: 'credits',
      blurb: 'Story and Masters runs bank credits here.',
    },
    'glitch-market.html': {
      title: 'Glitch Market',
      storageKey: 'glitchMarketVault',
      unit: 'credits',
      blurb: 'Deposit session profits from the terminal to vault them.',
    },
  };

  const GAME_META = {
    'parkour.html': { title: 'Learn to parkour', colors: ['#7ab8ff', '#3f74d9', '#1b285f'] },
    'gun-game.html': { title: 'Target Blaster', colors: ['#8ad0ff', '#3f92ff', '#183c86'] },
    'rage-car.html': { title: 'Rage Car', colors: ['#ffb070', '#ff5c2b', '#7d1e16'] },
    'snack-catch.html': { title: 'Snack Catch', colors: ['#ffd76c', '#ff9c34', '#7b4a17'] },
    'glitch-market.html': { title: 'Glitch Market', colors: ['#7df0a6', '#35bf70', '#14553d'] },
    'depth-strike.html': { title: 'Depth Strike', colors: ['#9ed4ff', '#4a78d8', '#1a2858'] },
    'minecraft.html': { title: 'Blockcraft', colors: ['#c8e878', '#5a9a3a', '#1e3a28'] },
    'island-royale.html': { title: 'Island Royale', colors: ['#9ed4ff', '#44aa88', '#1a2858'] },
    'soundboard-brawler.html': { title: 'Soundboard Brawler', colors: ['#ffd980', '#ff9d38', '#7e4513'] },
    'typo-spellcaster.html': { title: 'The Typo Spellcaster', colors: ['#ce9dff', '#9258ff', '#38166c'] },
    'bloons-td6.html': { title: 'Bloons TD 6', colors: ['#ffe878', '#ff6622', '#8a2818'] },
  };

  let overlayEl = null;
  let bankOverlayEl = null;
  let activeGame = null;
  let activeBankGame = null;
  let activeTab = 'skins';
  let stylesInjected = false;
  const coinListeners = [];
  const bankListeners = [];

  function tint(hex, amt) {
    const raw = (hex || '#808080').replace('#', '');
    const n = parseInt(raw.length === 3 ? raw.replace(/(.)/g, '$1$1') : raw, 16) || 0x808080;
    const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amt));
    const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
    const b = Math.max(0, Math.min(255, (n & 255) + amt));
    return '#' + [r, g, b].map(function (v) { return v.toString(16).padStart(2, '0'); }).join('');
  }

  function gameId() {
    return (global.location.pathname || '').split('/').pop() || 'index.html';
  }

  function loadJson(key, fallback) {
    try {
      const raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  function getCoins() {
    try {
      return parseInt(global.localStorage.getItem(LS_COINS) || '0', 10) || 0;
    } catch (e) {
      return 0;
    }
  }

  function setCoins(value) {
    try {
      global.localStorage.setItem(LS_COINS, String(Math.max(0, value | 0)));
    } catch (e) {}
    notifyCoins();
  }

  function notifyCoins() {
    let i;
    for (i = 0; i < coinListeners.length; i++) {
      try {
        coinListeners[i](getCoins());
      } catch (e) {}
    }
    if (overlayEl && !overlayEl.classList.contains('hidden')) {
      render();
    }
  }

  function onCoinsChange(fn) {
    if (typeof fn === 'function') coinListeners.push(fn);
  }

  function bankMeta(gid) {
    return GAME_BANK_META[gid] || null;
  }

  function getGameBank(gid) {
    const meta = bankMeta(gid);
    if (!meta) return 0;
    try {
      return parseInt(global.localStorage.getItem(meta.storageKey) || '0', 10) || 0;
    } catch (e) {
      return 0;
    }
  }

  function setGameBank(gid, value) {
    const meta = bankMeta(gid);
    if (!meta) return 0;
    const v = Math.max(0, value | 0);
    try {
      global.localStorage.setItem(meta.storageKey, String(v));
    } catch (e) {}
    notifyBank(gid);
    return v;
  }

  function notifyBank(gid) {
    let i;
    for (i = 0; i < bankListeners.length; i++) {
      try {
        bankListeners[i](gid, getGameBank(gid));
      } catch (e) {}
    }
    if (bankOverlayEl && !bankOverlayEl.classList.contains('hidden')) {
      renderBank();
    }
    if (overlayEl && !overlayEl.classList.contains('hidden')) {
      render();
    }
  }

  function onBankChange(fn) {
    if (typeof fn === 'function') bankListeners.push(fn);
  }

  function getExchangeRate() {
    return EXCHANGE_RATE;
  }

  function exchangeGameGold(gid, goldAmount) {
    const meta = bankMeta(gid);
    if (!meta) return { ok: false, reason: 'unsupported' };
    goldAmount = goldAmount | 0;
    const bank = getGameBank(gid);
    const spend = Math.min(bank, Math.floor(goldAmount / EXCHANGE_RATE) * EXCHANGE_RATE);
    if (spend < EXCHANGE_RATE) return { ok: false, reason: 'funds', bank: bank };
    const coins = spend / EXCHANGE_RATE;
    setGameBank(gid, bank - spend);
    setCoins(getCoins() + coins);
    return { ok: true, goldSpent: spend, coinsGained: coins, bankLeft: getGameBank(gid) };
  }

  function exchangeAllGameGold(gid) {
    const bank = getGameBank(gid);
    const spend = Math.floor(bank / EXCHANGE_RATE) * EXCHANGE_RATE;
    if (spend < EXCHANGE_RATE) return { ok: false, reason: 'funds', bank: bank };
    return exchangeGameGold(gid, spend);
  }

  function addGameBank(gid, amount) {
    amount = amount | 0;
    if (amount <= 0 || !bankMeta(gid)) return 0;
    const next = getGameBank(gid) + amount;
    setGameBank(gid, next);
    return amount;
  }

  function entryKey(gid, tab, id) {
    return gid + ':' + tab + ':' + id;
  }

  function equipKey(gid, tab) {
    return gid + ':' + tab;
  }

  function makeCatalogFor(gid) {
    const meta = GAME_META[gid];
    if (!meta) return { title: gid, categories: { skins: [], trails: [] } };
    const base = meta.colors;
    return {
      title: meta.title,
      categories: {
        skins: [
          { id: 'base', name: 'Default style', price: 0, colors: base, desc: 'The standard look for this game.' },
          { id: 'bright', name: 'Bright remix', price: 45, colors: [tint(base[0], 24), tint(base[1], 28), tint(base[2], 18)], desc: 'A brighter version of the home palette.' },
          { id: 'dark', name: 'Night build', price: 85, colors: [tint(base[0], -10), tint(base[1], -28), tint(base[2], -34)], desc: 'A darker variant with stronger contrast.' },
        ],
        trails: [
          { id: 'none', name: 'No trail', price: 0, colors: [base[0], base[1], base[2]], desc: 'Keep the HUD clean.' },
          { id: 'spark', name: 'Spark trail', price: 35, colors: [tint(base[0], 32), tint(base[1], 16), tint(base[2], 8)], desc: 'Soft accent flashes in the UI.' },
          { id: 'glow', name: 'Glow trail', price: 70, colors: [tint(base[0], 18), tint(base[1], 12), tint(base[2], 0)], desc: 'A stronger glow around buttons and stats.' },
        ],
      },
    };
  }

  function getCatalog() {
    const out = {};
    Object.keys(GAME_META).forEach(function (gid) {
      out[gid] = makeCatalogFor(gid);
    });
    return out;
  }

  const CATALOG = getCatalog();

  function ensureDefaults(gid) {
    const catalog = CATALOG[gid];
    if (!catalog) return;
    const owned = loadJson(LS_OWNED, {});
    const equipped = loadJson(LS_EQ, {});
    let dirty = false;
    Object.keys(catalog.categories).forEach(function (tab) {
      const first = catalog.categories[tab][0];
      if (!first) return;
      const ok = entryKey(gid, tab, first.id);
      const ek = equipKey(gid, tab);
      if (!owned[ok]) {
        owned[ok] = true;
        dirty = true;
      }
      if (!equipped[ek]) {
        equipped[ek] = first.id;
        dirty = true;
      }
    });
    if (dirty) {
      saveJson(LS_OWNED, owned);
      saveJson(LS_EQ, equipped);
    }
  }

  function isOwned(gid, tab, id) {
    ensureDefaults(gid);
    const owned = loadJson(LS_OWNED, {});
    return !!owned[entryKey(gid, tab, id)];
  }

  function equippedId(gid, tab) {
    ensureDefaults(gid);
    const equipped = loadJson(LS_EQ, {});
    return equipped[equipKey(gid, tab)] || null;
  }

  function itemFor(gid, tab, id) {
    const list = (CATALOG[gid] && CATALOG[gid].categories[tab]) || [];
    let i;
    for (i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function getPalette(gid) {
    gid = gid || gameId();
    ensureDefaults(gid);
    const skin = itemFor(gid, 'skins', equippedId(gid, 'skins'));
    const trail = itemFor(gid, 'trails', equippedId(gid, 'trails'));
    return {
      primary: (skin && skin.colors && skin.colors[0]) || '#7ab8ff',
      secondary: (skin && skin.colors && skin.colors[1]) || '#4768c6',
      accent: (trail && trail.colors && trail.colors[0]) || ((skin && skin.colors && skin.colors[2]) || '#d6e8ff'),
    };
  }

  function applyTheme(gid) {
    gid = gid || gameId();
    if (!GAME_META[gid]) return;
    const p = getPalette(gid);
    const root = global.document;
    if (!root || !root.body) return;
    root.documentElement.style.setProperty('--arthur-shop-primary', p.primary);
    root.documentElement.style.setProperty('--arthur-shop-secondary', p.secondary);
    root.documentElement.style.setProperty('--arthur-shop-accent', p.accent);

    const h1 = root.querySelector('h1');
    if (h1) h1.style.textShadow = '0 0 18px color-mix(in srgb, ' + p.primary + ' 40%, transparent)';
    root.querySelectorAll('.btn').forEach(function (btn) {
      btn.style.borderColor = p.secondary;
      btn.style.boxShadow = '0 0 0 1px color-mix(in srgb, ' + p.primary + ' 22%, transparent)';
    });
    root.querySelectorAll('.hud strong').forEach(function (el) {
      el.style.color = p.primary;
    });
    const hint = root.querySelector('.hint');
    if (hint) hint.style.color = tint(p.primary, -12);
  }

  function buy(gid, tab, id) {
    const item = itemFor(gid, tab, id);
    if (!item || isOwned(gid, tab, id)) return false;
    const coins = getCoins();
    if (coins < item.price) return false;
    const owned = loadJson(LS_OWNED, {});
    owned[entryKey(gid, tab, id)] = true;
    saveJson(LS_OWNED, owned);
    setCoins(coins - item.price);
    return true;
  }

  function addCoins(amount) {
    amount = amount | 0;
    if (amount <= 0) return 0;
    setCoins(getCoins() + amount);
    return amount;
  }

  function equip(gid, tab, id) {
    if (!isOwned(gid, tab, id)) return false;
    const equipped = loadJson(LS_EQ, {});
    equipped[equipKey(gid, tab)] = id;
    saveJson(LS_EQ, equipped);
    applyTheme(gid);
    return true;
  }

  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    const style = document.createElement('style');
    style.textContent =
      '#arthurShopOverlay{position:fixed;inset:0;z-index:99998;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(4,6,12,.88);backdrop-filter:blur(7px)}' +
      '#arthurShopOverlay.hidden{display:none!important}' +
      '#arthurShopOverlay .panel{width:min(760px,100%);max-height:88vh;display:flex;flex-direction:column;border-radius:16px;border:1px solid rgba(255,255,255,.12);background:linear-gradient(165deg,#182033,#0f1522);box-shadow:0 24px 64px rgba(0,0,0,.55);overflow:hidden;color:#e8ecf4;font:500 14px/1.45 system-ui,sans-serif}' +
      '#arthurShopOverlay .head{display:flex;gap:12px;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.08)}' +
      '#arthurShopOverlay .title{margin:0;font-size:1.05rem;font-weight:800;color:#9ed4ff}' +
      '#arthurShopOverlay .coins{font-weight:700;color:#ffd78a;font-variant-numeric:tabular-nums}' +
      '#arthurShopOverlay .close{padding:8px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:#243048;color:#fff;cursor:pointer}' +
      '#arthurShopOverlay .body{padding:14px 16px 18px;overflow:auto}' +
      '#arthurShopOverlay .game-tabs,#arthurShopOverlay .cat-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 12px}' +
      '#arthurShopOverlay .game-tabs button,#arthurShopOverlay .cat-tabs button{padding:7px 12px;border-radius:9px;border:1px solid rgba(255,255,255,.12);background:#141b2a;color:#dce6f6;font:inherit;font-weight:650;cursor:pointer}' +
      '#arthurShopOverlay .game-tabs button.on,#arthurShopOverlay .cat-tabs button.on{background:#243b62;border-color:rgba(120,180,255,.45)}' +
      '#arthurShopOverlay .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}' +
      '#arthurShopOverlay .item{padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.2)}' +
      '#arthurShopOverlay .item.eq{border-color:rgba(120,255,180,.42)}' +
      '#arthurShopOverlay .item h4{margin:0 0 4px;font-size:.88rem;color:#fff}' +
      '#arthurShopOverlay .item p{margin:0 0 9px;font-size:.74rem;color:#93a0b8;line-height:1.4}' +
      '#arthurShopOverlay .sw{display:flex;gap:4px;margin:0 0 9px}' +
      '#arthurShopOverlay .sw span{width:18px;height:18px;border-radius:5px;border:1px solid rgba(0,0,0,.3)}' +
      '#arthurShopOverlay .row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}' +
      '#arthurShopOverlay .price{font-size:.76rem;font-weight:700;color:#ffd78a}' +
      '#arthurShopOverlay .row button{padding:6px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.14);background:#243048;color:#fff;font:inherit;font-size:.74rem;font-weight:700;cursor:pointer}' +
      '#arthurShopOverlay .row button:disabled{opacity:.45;cursor:default}' +
      '#arthurShopOverlay .shop-tip{margin:0 0 12px;padding:9px 11px;border-radius:9px;background:rgba(0,0,0,.22);border:1px solid rgba(120,180,255,.18);color:#9ab0c8;font-size:.76rem;line-height:1.45}' +
      '.hub-shop-bar{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:12px;width:100%;max-width:960px;margin:-18px 0 24px;padding:12px 16px;border-radius:14px;border:1px solid rgba(255,215,130,.2);background:rgba(20,24,36,.65)}' +
      '.hub-shop-bar .coins{color:#ffd78a;font-weight:700;font-variant-numeric:tabular-nums}' +
      '.hub-shop-bar button,.btn.arthur-hub-shop,.btn.arthur-hub-bank{padding:9px 18px;border-radius:10px;border:2px solid rgba(255,215,130,.4);background:linear-gradient(165deg,#2a2418,#14100c);color:#fff4e0;font:inherit;font-weight:700;cursor:pointer}' +
      '#arthurBankOverlay{position:fixed;inset:0;z-index:99997;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(4,6,12,.88);backdrop-filter:blur(7px)}' +
      '#arthurBankOverlay.hidden{display:none!important}' +
      '#arthurBankOverlay .panel{width:min(560px,100%);max-height:88vh;display:flex;flex-direction:column;border-radius:16px;border:1px solid rgba(255,215,130,.22);background:linear-gradient(165deg,#221a14,#100c08);box-shadow:0 24px 64px rgba(0,0,0,.55);overflow:hidden;color:#f0e8dc;font:500 14px/1.45 system-ui,sans-serif}' +
      '#arthurBankOverlay .head{display:flex;gap:12px;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.08)}' +
      '#arthurBankOverlay .title{margin:0;font-size:1.05rem;font-weight:800;color:#ffb060}' +
      '#arthurBankOverlay .coins{font-weight:700;color:#ffd78a;font-variant-numeric:tabular-nums}' +
      '#arthurBankOverlay .close{padding:8px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:#3a2818;color:#fff;cursor:pointer}' +
      '#arthurBankOverlay .body{padding:14px 16px 18px;overflow:auto}' +
      '#arthurBankOverlay .rate{margin:0 0 14px;padding:10px 12px;border-radius:10px;background:rgba(0,0,0,.25);border:1px solid rgba(255,215,130,.16);color:#c8b8a8;font-size:.82rem}' +
      '#arthurBankOverlay .bank-card{padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.22);margin:0 0 10px}' +
      '#arthurBankOverlay .bank-card.focus{border-color:rgba(255,176,96,.45)}' +
      '#arthurBankOverlay .bank-card h4{margin:0 0 4px;font-size:.9rem;color:#fff}' +
      '#arthurBankOverlay .bank-card p{margin:0 0 10px;font-size:.76rem;color:#a89888;line-height:1.4}' +
      '#arthurBankOverlay .bank-bal{font-weight:700;color:#ffb060;font-variant-numeric:tabular-nums;margin:0 0 10px}' +
      '#arthurBankOverlay .row{display:flex;gap:8px;flex-wrap:wrap}' +
      '#arthurBankOverlay .row button{padding:7px 12px;border-radius:8px;border:1px solid rgba(255,215,130,.28);background:#3a2818;color:#fff4e0;font:inherit;font-size:.76rem;font-weight:700;cursor:pointer}' +
      '#arthurBankOverlay .row button:disabled{opacity:.45;cursor:default}' +
      '#arthurBankOverlay .msg{margin-top:10px;font-size:.8rem;color:#9ae8b0;min-height:1.2em}';
    document.head.appendChild(style);
  }

  function ensureOverlay() {
    injectStyles();
    if (overlayEl) return overlayEl;
    overlayEl = document.createElement('div');
    overlayEl.id = 'arthurShopOverlay';
    overlayEl.className = 'hidden';
    overlayEl.setAttribute('role', 'dialog');
    overlayEl.setAttribute('aria-modal', 'true');
    overlayEl.innerHTML =
      '<div class="panel">' +
      '<div class="head">' +
      '<p class="title">Arthur Shop</p>' +
      '<span class="coins" id="arthurShopCoinsEl">0 Arthur Coins</span>' +
      '<button type="button" class="close" id="arthurShopClose">Close</button>' +
      '</div>' +
      '<div class="body" id="arthurShopBody"></div>' +
      '</div>';
    document.body.appendChild(overlayEl);
    overlayEl.addEventListener('click', function (e) {
      if (e.target === overlayEl) close();
    });
    overlayEl.querySelector('#arthurShopClose').addEventListener('click', close);
    return overlayEl;
  }

  function render() {
    if (!overlayEl) return;
    const body = overlayEl.querySelector('#arthurShopBody');
    const coinsEl = overlayEl.querySelector('#arthurShopCoinsEl');
    if (!body || !coinsEl) return;

    const gids = Object.keys(GAME_META);
    if (!activeGame || !GAME_META[activeGame]) activeGame = gids[0];
    ensureDefaults(activeGame);

    coinsEl.textContent = String(getCoins()) + ' Arthur Coins';

    let html = '<div class="game-tabs">';
    gids.forEach(function (gid) {
      html += '<button type="button" data-game="' + gid + '"' + (gid === activeGame ? ' class="on"' : '') + '>' + GAME_META[gid].title + '</button>';
    });
    html += '</div>';

    const tabs = Object.keys(CATALOG[activeGame].categories);
    if (tabs.indexOf(activeTab) < 0) activeTab = tabs[0];
    html += '<div class="cat-tabs">';
    tabs.forEach(function (tab) {
      html += '<button type="button" data-tab="' + tab + '"' + (tab === activeTab ? ' class="on"' : '') + '>' + tab + '</button>';
    });
    html += '</div><div class="grid">';

    CATALOG[activeGame].categories[activeTab].forEach(function (item) {
      const owned = isOwned(activeGame, activeTab, item.id);
      const eq = equippedId(activeGame, activeTab) === item.id;
      html += '<div class="item' + (eq ? ' eq' : '') + '">';
      html += '<h4>' + item.name + '</h4>';
      html += '<div class="sw"><span style="background:' + item.colors[0] + '"></span><span style="background:' + item.colors[1] + '"></span><span style="background:' + item.colors[2] + '"></span></div>';
      html += '<p>' + item.desc + '</p><div class="row">';
      html += '<span class="price">' + (owned ? (eq ? 'Equipped' : 'Owned') : item.price + ' coins') + '</span>';
      if (!owned) {
        html += '<button type="button" data-buy="' + activeGame + '|' + activeTab + '|' + item.id + '"' + (getCoins() < item.price ? ' disabled' : '') + '>Buy</button>';
      } else if (!eq) {
        html += '<button type="button" data-equip="' + activeGame + '|' + activeTab + '|' + item.id + '">Equip</button>';
      }
      html += '</div></div>';
    });
    html += '</div>';
    body.innerHTML = html;

    body.querySelectorAll('[data-game]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeGame = btn.getAttribute('data-game');
        activeTab = 'skins';
        render();
      });
    });
    body.querySelectorAll('[data-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeTab = btn.getAttribute('data-tab');
        render();
      });
    });
    body.querySelectorAll('[data-buy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const parts = btn.getAttribute('data-buy').split('|');
        if (buy(parts[0], parts[1], parts[2])) render();
      });
    });
    body.querySelectorAll('[data-equip]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const parts = btn.getAttribute('data-equip').split('|');
        if (equip(parts[0], parts[1], parts[2])) render();
      });
    });
  }

  function open(gid) {
    ensureOverlay();
    activeGame = gid && GAME_META[gid] ? gid : activeGame || gameId();
    activeTab = 'skins';
    overlayEl.classList.remove('hidden');
    render();
  }

  function close() {
    if (overlayEl) overlayEl.classList.add('hidden');
  }

  function ensureBankOverlay() {
    injectStyles();
    if (bankOverlayEl) return bankOverlayEl;
    bankOverlayEl = document.createElement('div');
    bankOverlayEl.id = 'arthurBankOverlay';
    bankOverlayEl.className = 'hidden';
    bankOverlayEl.setAttribute('role', 'dialog');
    bankOverlayEl.setAttribute('aria-modal', 'true');
    bankOverlayEl.innerHTML =
      '<div class="panel">' +
      '<div class="head">' +
      '<p class="title">Arthur Vault</p>' +
      '<span class="coins" id="arthurBankCoinsEl">0 Arthur Coins</span>' +
      '<button type="button" class="close" id="arthurBankClose">Close</button>' +
      '</div>' +
      '<div class="body" id="arthurBankBody"></div>' +
      '</div>';
    document.body.appendChild(bankOverlayEl);
    bankOverlayEl.addEventListener('click', function (e) {
      if (e.target === bankOverlayEl) closeBank();
    });
    bankOverlayEl.querySelector('#arthurBankClose').addEventListener('click', closeBank);
    return bankOverlayEl;
  }

  function renderBank() {
    if (!bankOverlayEl) return;
    const body = bankOverlayEl.querySelector('#arthurBankBody');
    const coinsEl = bankOverlayEl.querySelector('#arthurBankCoinsEl');
    if (!body || !coinsEl) return;
    coinsEl.textContent = String(getCoins()) + ' Arthur Coins';

    let html =
      '<p class="rate"><strong>100 game currency = 1 Arthur Coin</strong> (every game below). Vault exchange is the only way to earn Arthur Coins for the home shop.</p>';

    const gids = Object.keys(GAME_BANK_META);
    let i;
    for (i = 0; i < gids.length; i++) {
      const gid = gids[i];
      const meta = GAME_BANK_META[gid];
      const bal = getGameBank(gid);
      const can = bal >= EXCHANGE_RATE;
      const allCoins = Math.floor(bal / EXCHANGE_RATE);
      const focus = gid === activeBankGame ? ' focus' : '';
      html +=
        '<div class="bank-card' +
        focus +
        '" data-gid="' +
        gid +
        '">' +
        '<h4>' +
        meta.title +
        '</h4>' +
        '<p>' +
        meta.blurb +
        '</p>' +
        '<p class="bank-bal">' +
        bal.toLocaleString() +
        ' ' +
        meta.unit +
        ' in vault</p>' +
        '<div class="row">' +
        '<button type="button" data-ex="' +
        gid +
        '|100"' +
        (can ? '' : ' disabled') +
        '>Exchange 100 → 1 coin</button>' +
        '<button type="button" data-exall="' +
        gid +
        '"' +
        (can ? '' : ' disabled') +
        '>Exchange all → ' +
        allCoins +
        ' coin' +
        (allCoins === 1 ? '' : 's') +
        '</button>' +
        '</div>' +
        '</div>';
    }

    html += '<p class="msg" id="arthurBankMsg"></p>';
    body.innerHTML = html;

    body.querySelectorAll('[data-ex]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const parts = btn.getAttribute('data-ex').split('|');
        const res = exchangeGameGold(parts[0], parseInt(parts[1], 10) || EXCHANGE_RATE);
        showBankMsg(res, parts[0]);
        renderBank();
      });
    });
    body.querySelectorAll('[data-exall]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const gid = btn.getAttribute('data-exall');
        const res = exchangeAllGameGold(gid);
        showBankMsg(res, gid);
        renderBank();
      });
    });
  }

  function showBankMsg(res, gid) {
    if (!bankOverlayEl) return;
    const msg = bankOverlayEl.querySelector('#arthurBankMsg');
    if (!msg) return;
    const meta = bankMeta(gid);
    const unit = meta ? meta.unit : 'currency';
    if (!res || !res.ok) {
      if (res && res.reason === 'funds') {
        msg.textContent = 'Need at least ' + EXCHANGE_RATE + ' ' + unit + ' in the vault to exchange.';
      } else {
        msg.textContent = 'Could not exchange.';
      }
      msg.style.color = '#ffb0a0';
      return;
    }
    msg.style.color = '#9ae8b0';
    msg.textContent =
      'Traded ' +
      res.goldSpent.toLocaleString() +
      ' ' +
      unit +
      ' for ' +
      res.coinsGained +
      ' Arthur Coin' +
      (res.coinsGained === 1 ? '' : 's') +
      '.';
  }

  function openBank(gid) {
    ensureBankOverlay();
    activeBankGame = gid && GAME_BANK_META[gid] ? gid : activeBankGame || Object.keys(GAME_BANK_META)[0];
    bankOverlayEl.classList.remove('hidden');
    renderBank();
  }

  function closeBank() {
    if (bankOverlayEl) bankOverlayEl.classList.add('hidden');
  }

  function injectHubButton(row, gid) {
    injectStyles();
    if (!row || row.querySelector('.arthur-hub-shop')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn arthur-hub-shop';
    btn.textContent = 'Shop';
    btn.addEventListener('click', function () {
      open(gid);
    });
    row.insertBefore(btn, row.firstChild);
  }

  function injectBankButton(row, gid) {
    injectStyles();
    if (!row || row.querySelector('.arthur-hub-bank')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn arthur-hub-bank';
    btn.textContent = 'Vault';
    btn.addEventListener('click', function () {
      openBank(gid);
    });
    row.appendChild(btn);
  }

  Object.keys(GAME_META).forEach(ensureDefaults);
  setTimeout(function () {
    applyTheme();
    notifyCoins();
  }, 0);

  global.ArthurShop = {
    CATALOG: CATALOG,
    EXCHANGE_RATE: EXCHANGE_RATE,
    GAME_BANK_META: GAME_BANK_META,
    getCoins: getCoins,
    getGameBank: getGameBank,
    setGameBank: setGameBank,
    getExchangeRate: getExchangeRate,
    exchangeGameGold: exchangeGameGold,
    exchangeAllGameGold: exchangeAllGameGold,
    addGameBank: addGameBank,
    isOwned: isOwned,
    getEquipped: equippedId,
    getPalette: getPalette,
    applyTheme: applyTheme,
    buy: buy,
    addCoins: addCoins,
    equip: equip,
    open: open,
    close: close,
    openBank: openBank,
    closeBank: closeBank,
    onCoinsChange: onCoinsChange,
    onBankChange: onBankChange,
    injectHubButton: injectHubButton,
    injectBankButton: injectBankButton,
  };
})(typeof window !== 'undefined' ? window : global);
