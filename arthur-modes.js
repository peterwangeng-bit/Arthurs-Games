/**
 * Arthur Games — shared Tutorial + Endless mode helpers.
 * Include before your game script. Launch: game.html?tutorial=1 or ?mode=endless
 */
(function (global) {
  const TUTORIALS = {
    'parkour.html': {
      title: 'Learn to parkour — Tutorial',
      bullets: [
        'Arrow keys or WASD to move; Space to jump; Shift to sprint on the ground.',
        'Campaign levels get harder — some ledges look solid but aren\'t.',
        'After a fall, press R or Space to retry the stage.',
        'Shop and skins are on the main menu; Create builds your own obby.',
      ],
      tip: 'Endless mode loops random campaign stages — chase a high clear count.',
    },
    'gun-game.html': {
      title: 'Target Blaster — Tutorial',
      bullets: [
        'WASD moves your ship; mouse aims; hold click to shoot.',
        'The arena wraps at the edges — use that to escape swarms.',
        'Equipment Room: buy and equip weapons. Shop: skins, trails, death FX.',
        'Every 10 waves the arena seals — one juggernaut, no escape until it falls.',
      ],
      tip: 'Endless mode keeps waves coming forever — see how high your level climbs.',
    },
    'rage-car.html': {
      title: 'Rage Car — Tutorial',
      bullets: [
        'Arrow keys (↑↓) or A/D change lanes; on touch, tap top or bottom of the road.',
        'Dodge debris; near-misses build rage (faster run, wilder spawns).',
        'Bank run coins in the shop; spend them on skins, trails, and road themes.',
      ],
      tip: 'Endless mode never ends — one run until you crash; beat your best score.',
    },
    'snack-catch.html': {
      title: 'Snack Catch — Tutorial',
      bullets: [
        'Move the basket with mouse or arrow keys.',
        'Catch snacks for points; avoid broccoli and bombs.',
        'Stars and combo chains multiply your score.',
      ],
      tip: 'Endless mode is survival — keep catching until you miss too much.',
    },
    'depth-strike.html': {
      title: 'Depth Strike — Tutorial',
      bullets: [
        'Spawn in the lobby — walk west through the door into the Weapon Shop.',
        'Stand at a gun display and press E to buy (Keys) or equip. You start with 30 Keys.',
        'Green pad = Arena, yellow = Endless. Earn more Keys from your score.',
        'Loadout: 1 Primary, 2 Secondary, 3 Melee, 4 Utility in fights.',
      ],
      tip: 'Default free loadout: Assault Rifle, Handgun, Fists, Grenade — like Rivals.',
    },
    'island-royale.html': {
      title: 'Island Royale — Tutorial',
      bullets: [
        'Click Deploy, then click the game to capture the mouse.',
        'WASD move, Space jump, LMB shoot. Pickaxe harvests trees for wood.',
        'Tab or scroll to swap weapons. E picks up loot chests (weapons, shield, medkit).',
        'B = build walls · C = wood/brick/metal · Z rotate · LMB place.',
        'Brown zone on the map = underground sewers — use gold manhole dots to enter. Loot and bots spawn down there too.',
        'Eliminate enemy squads and survive the shrinking storm for Victory Royale.',
      ],
      tip: '20+ Fortnite-style weapons: SCAR, Pump, Bolt Sniper, Rocket Launcher, Minigun, and more.',
    },
    'minecraft.html': {
      title: 'Blockcraft — Tutorial',
      bullets: [
        'Click Play, then click the canvas to lock the mouse.',
        'WASD move, Space jump, Shift sneak, hold Alt to sprint. Press F to toggle fly.',
        'Left-click breaks blocks; right-click places the selected hotbar block.',
        'Keys 1–9 or scroll wheel change your hotbar slot.',
        'Explore plains, forest, desert, and snow biomes — dig into caves under the hills.',
        'Hotbar has redstone: dust, block, torch, repeater, comparator, observer, pistons, lever. E toggles levers/buttons.',
      ],
      tip: 'Redstone runs at 20 TPS with delays, QC, and piston moving states. Chunks stream as you walk.',
    },
    'soundboard-brawler.html': {
      title: 'Soundboard Brawler — Tutorial',
      bullets: [
        'Click steps on the 16-step grid — kick, snare, hat, bass, synth.',
        'Each venue loads a starter beat — preview it, tweak it, then Present to judges.',
        'Three judges score 1–10 each — pass when your combined total hits the venue target.',
      ],
      tip: 'Endless mode: judges never stop — thresholds rise each venue.',
    },
    'typo-spellcaster.html': {
      title: 'The Typo Spellcaster — Tutorial',
      bullets: [
        'Type spell words and press Enter — FIRE, ICE, HEAL, and more unlock per floor.',
        'Green buffer = good prefix; typos like FIER backfire on you.',
        'Esc clears the word buffer; finish the full word before Enter.',
      ],
      tip: 'Endless mode rolls new random enemy generations — tougher each time you clear a run.',
    },
    'glitch-market.html': {
      title: 'Glitch Market — Tutorial',
      bullets: [
        'Click a ticker or press 1–5 to select Slime Gel, Dragon Scales, Crypto-Scrap, and more.',
        'Buy ×1 / ×10 (or B) and Sell ×1 / all (or V) — news headlines spike or crash prices instantly.',
        'Reinvest profits into trading mods: Inside Info shows 3 leaked headlines at the bottom of the terminal, HFT auto-trades your pick.',
        'Deposit profits banks net worth above $1,000 into the Vault — trade 100 vault credits for 1 Arthur Coin at home.',
      ],
      tip: 'No time limit — chase net worth, deposit to Vault, then exchange at home for Arthur Coins.',
    },
  };

  let stylesInjected = false;
  let endlessHudEl = null;
  let endlessStreak = 0;

  function setPlayChrome(active) {
    injectStyles();
    if (global.document && global.document.body) {
      global.document.body.classList.toggle('arthur-play-active', !!active);
    }
  }

  function wirePlayShellChrome() {
    if (!global.document) return;
    const shell = global.document.getElementById('playShell');
    if (!shell || shell.dataset.arthurChromeWired === '1') return;
    shell.dataset.arthurChromeWired = '1';
    const sync = function () {
      setPlayChrome(shell.classList.contains('open'));
    };
    sync();
    try {
      new global.MutationObserver(sync).observe(shell, {
        attributes: true,
        attributeFilter: ['class'],
      });
    } catch (e) {}
  }

  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    const s = document.createElement('style');
    s.textContent =
      '#arthurTutorialOverlay.arthur-overlay{position:fixed;inset:0;z-index:99990;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(6,8,14,.92);font-family:system-ui,\"Segoe UI\",sans-serif}' +
      '#arthurTutorialOverlay.arthur-overlay.hidden{display:none!important}' +
      '#arthurTutorialOverlay .arthur-inner{max-width:28rem;background:linear-gradient(165deg,#1e2638,#121820);border:2px solid rgba(122,184,255,.45);border-radius:14px;padding:22px 24px;color:#e8ecf4;line-height:1.55;text-align:left}' +
      '#arthurTutorialOverlay .arthur-big{margin:0 0 10px;font-size:1.2rem;font-weight:800;color:#8ed4ff}' +
      '#arthurTutorialOverlay ul{margin:0 0 12px;padding-left:1.2rem;color:#b0b8c8;font-size:.9rem}' +
      '#arthurTutorialOverlay li{margin-bottom:.45rem}' +
      '#arthurTutorialOverlay .arthur-tip{margin:0 0 14px;font-size:.82rem;color:#8a94a8}' +
      '#arthurTutorialOverlay .arthur-btn{padding:11px 22px;font-size:.9rem;font-weight:700;cursor:pointer;border-radius:10px;border:2px solid rgba(122,184,255,.5);background:linear-gradient(165deg,#1a2838,#0e1218);color:#e8f4ff;font-family:inherit}' +
      '#arthurTutorialOverlay .arthur-btn:hover{filter:brightness(1.12)}' +
      'button.btn.arthur-hub-tutorial,button.btn.arthur-hub-endless{border-color:rgba(200,168,255,.5)!important}' +
      'button.btn.arthur-hub-endless{border-color:rgba(255,160,100,.55)!important;color:#ffe8d8!important}' +
      '.arthur-endless-pill{display:inline-flex;align-items:center;flex:0 1 auto;margin:0;padding:2px 8px;border-radius:6px;font-size:.72rem;font-weight:700;background:rgba(255,140,80,.2);color:#ffb080;white-space:nowrap;max-width:100%}' +
      '#arthurHubExtras.arthur-hub-extras{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;align-items:center;width:100%;max-width:36rem;margin:0 auto 14px;position:relative;z-index:1}' +
      '#arthurHubExtras.arthur-hub-extras .btn{flex:0 1 auto;min-width:0;max-width:100%}' +
      '#hubPanel .btn-row,#hubMain.btn-row{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;align-items:center;width:100%;max-width:36rem;margin-left:auto;margin-right:auto}' +
      '#hubPanel .btn-row .btn,#hubMain.btn-row .btn,#hubPanel .btn-row button,#hubMain.btn-row button{flex:0 1 auto;min-width:0;max-width:100%}' +
      /* Prevent hub titles / controls colliding with fixed Arthur chrome */
      '#hubPanel h1,#hub h1,#hubMain h1,.menu-panel h1{position:relative;z-index:1;padding-inline:0.25rem}' +
      '#hubPanel .controls,#hub .controls,.menu-panel .controls,.sub{max-width:min(36rem,92vw);margin-left:auto;margin-right:auto;line-height:1.5;position:relative;z-index:1}' +
      '.hud{display:none;flex-wrap:wrap;gap:8px 14px;justify-content:center;align-items:center;align-content:center;max-width:min(980px,100%);margin-left:auto;margin-right:auto;row-gap:8px}' +
      '.hud.visible{display:flex}' +
      '.hud>span,.hud>#arthurEndlessHud,.hud>#arthurTwoPlayerHud{flex:0 1 auto;white-space:nowrap;max-width:100%}' +
      '#playShell .hint,.playShell .hint,body:has(#playShell.open)>p.hint{max-width:min(36rem,100%);margin-left:auto;margin-right:auto;line-height:1.45;padding-inline:8px}' +
      '.trade-bar,.diff-btns{display:flex;flex-wrap:wrap;gap:8px;align-items:center}' +
      '.top-bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:flex-end;padding-right:4.5rem}' +
      'body.arthur-play-active>h1,body.arthur-play-active>.top-bar{display:none!important}' +
      '@media (max-width:520px){.hud{font-size:.8rem;gap:6px 10px}.arthur-endless-pill{font-size:.68rem}.top-bar{padding-right:3.5rem}}';
    document.head.appendChild(s);
  }

  function ensureArthurHubExtras() {
    injectStyles();
    let extras = document.getElementById('arthurHubExtras');
    if (extras) return extras;
    const modeSlot = document.getElementById('hubModeBtns');
    extras = document.createElement('div');
    extras.id = 'arthurHubExtras';
    extras.className = 'arthur-hub-extras';
    extras.setAttribute('aria-label', 'More game options');
    if (modeSlot) {
      modeSlot.appendChild(extras);
      return extras;
    }
    const hub = document.getElementById('hubPanel') || document.getElementById('hub') || document.getElementById('playShell');
    if (!hub) return null;
    const anchor =
      document.getElementById('hubMain') ||
      hub.querySelector('#hubMain') ||
      hub.querySelector('.hub-btns') ||
      hub.querySelector('.btn-row');
    const trackGrid = document.getElementById('trackGrid');
    if (trackGrid && trackGrid.parentNode === hub) {
      hub.insertBefore(extras, trackGrid);
    } else if (anchor) {
      anchor.insertAdjacentElement('afterend', extras);
    } else {
      hub.insertBefore(extras, hub.firstChild);
    }
    return extras;
  }

  function gameId() {
    const path = (global.location.pathname || '').split('/').pop() || 'game.html';
    return path;
  }

  function parseQuery() {
    try {
      return new URLSearchParams(global.location.search || '');
    } catch (e) {
      return { get: function () { return null; } };
    }
  }

  function isEndless() {
    return parseQuery().get('mode') === 'endless' || !!global.__arthurEndless;
  }

  function isTutorialLaunch() {
    return parseQuery().get('tutorial') === '1' || parseQuery().get('tutorial') === 'true';
  }

  function isShopLaunch() {
    return parseQuery().get('shop') === '1' || parseQuery().get('shop') === 'true';
  }

  function isStartLaunch() {
    return parseQuery().get('start') === '1' || parseQuery().get('start') === 'true';
  }

  function openInGameShop(opts) {
    opts = opts || {};
    if (typeof opts.onShop === 'function') {
      opts.onShop();
      return true;
    }
    const btn = document.getElementById('btnShop') || document.getElementById('btnHubShop');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  }

  function isTwoPlayerLaunch() {
    const q = parseQuery().get('players');
    return q === '2' || q === 'two';
  }

  /** Games with working endless loops (hub + in-game Endless button). */
  const ENDLESS_GAMES = {
    'parkour.html': true,
    'gun-game.html': true,
    'rage-car.html': true,
    'snack-catch.html': true,
    'depth-strike.html': true,
    'soundboard-brawler.html': true,
    'typo-spellcaster.html': true,
  };

  const TWO_PLAYER_GAMES = {
    'gun-game.html': {
      title: 'Target Blaster — 2 players',
      p1: 'P1: arrow keys · mouse aim · hold click to shoot · pick loadout first',
      p2: 'P2: WASD move · Shift or / to shoot · own skin, trail, weapon & death FX',
    },
    'snack-catch.html': {
      title: 'Snack Catch — 2 players',
      p1: 'P1: ← → arrow keys (left basket)',
      p2: 'P2: A and D keys (right basket) · shared score & lives',
    },
    'rage-car.html': {
      title: 'Rage Car — 2 players',
      p1: 'P1: ↑ ↓ change lanes',
      p2: 'P2: W / S change lanes · first crash ends the run',
    },
  };

  function isTwoPlayer() {
    const q = parseQuery().get('players');
    return q === '2' || q === 'two' || !!global.__arthurTwoPlayer;
  }

  function playerCount() {
    return isTwoPlayer() ? 2 : 1;
  }

  function markTwoPlayerSession() {
    global.__arthurTwoPlayer = true;
  }

  function clearTwoPlayerSession() {
    global.__arthurTwoPlayer = false;
  }

  function supportsTwoPlayer(id) {
    return !!TWO_PLAYER_GAMES[id || gameId()];
  }

  function supportsEndless(id) {
    return !!ENDLESS_GAMES[id || gameId()];
  }

  function twoPlayerInfo(id) {
    return TWO_PLAYER_GAMES[id || gameId()] || null;
  }

  let twoPlayerHudEl = null;

  function ensureTwoPlayerHud(hudEl) {
    if (!hudEl || twoPlayerHudEl) return;
    twoPlayerHudEl = document.createElement('span');
    twoPlayerHudEl.className = 'arthur-endless-pill';
    twoPlayerHudEl.style.background = 'rgba(120, 200, 255, 0.22)';
    twoPlayerHudEl.style.color = '#9ed4ff';
    twoPlayerHudEl.textContent = tr('2 players');
    twoPlayerHudEl.id = 'arthurTwoPlayerHud';
    hudEl.insertBefore(twoPlayerHudEl, hudEl.firstChild);
  }

  function showTwoPlayerBanner(opts) {
    injectStyles();
    opts = opts || {};
    const info = twoPlayerInfo(opts.gameId);
    if (!info) return;
    let el = document.getElementById('arthurTwoPlayerBanner');
    if (!el) {
      el = document.createElement('div');
      el.id = 'arthurTwoPlayerBanner';
      el.setAttribute('role', 'note');
      el.style.cssText =
        'position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:99985;max-width:92%;padding:10px 16px;border-radius:10px;background:rgba(12,20,36,.92);border:2px solid rgba(120,200,255,.45);color:#d8ecff;font:600 12px/1.45 system-ui,sans-serif;text-align:center;pointer-events:none';
      document.body.appendChild(el);
    }
    el.innerHTML =
      '<strong style="color:#9ed4ff">2-player</strong> · ' +
      info.p1 +
      ' · ' +
      info.p2;
    el.style.display = 'block';
  }

  function markEndlessSession() {
    global.__arthurEndless = true;
  }

  function markTutorialSeen(id) {
    try {
      localStorage.setItem('arthurTutorialSeen:' + id, '1');
    } catch (e) {}
  }

  function tutorialSeen(id) {
    try {
      return localStorage.getItem('arthurTutorialSeen:' + id) === '1';
    } catch (e) {
      return false;
    }
  }

  function tr(s) {
    if (s == null) return s;
    if (global.ArthurI18n && typeof ArthurI18n.t === 'function') return ArthurI18n.t(s);
    return s;
  }

  function showTutorial(id, onGo) {
    injectStyles();
    const t = TUTORIALS[id] || TUTORIALS[gameId()];
    if (!t) {
      if (onGo) onGo();
      return;
    }
    let el = document.getElementById('arthurTutorialOverlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'arthurTutorialOverlay';
      el.className = 'arthur-overlay';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      document.body.appendChild(el);
    }
    let html = '<div class="arthur-inner"><p class="arthur-big">' + tr(t.title) + '</p><ul>';
    let i;
    for (i = 0; i < t.bullets.length; i++) {
      html += '<li>' + tr(t.bullets[i]) + '</li>';
    }
    html +=
      '</ul><p class="arthur-tip">' +
      tr(t.tip || '') +
      '</p><button type="button" class="arthur-btn" id="arthurTutorialGo">' +
      tr('Got it — play') +
      '</button></div>';
    el.innerHTML = html;
    el.classList.remove('hidden');
    const go = document.getElementById('arthurTutorialGo');
    function dismiss() {
      el.classList.add('hidden');
      markTutorialSeen(id || gameId());
      if (onGo) onGo();
    }
    if (go) go.addEventListener('click', dismiss);
    el.addEventListener('keydown', function (ev) {
      if (ev.code === 'Enter' || ev.code === 'Escape') {
        ev.preventDefault();
        dismiss();
      }
    });
  }

  function injectShopHubButton(opts) {
    opts = opts || {};
    if (opts.skipShop) return;
    if (document.getElementById('btnShop') || document.getElementById('btnHubShop')) return;
    if (typeof opts.onShop !== 'function') return;
    const extras = ensureArthurHubExtras();
    if (!extras || extras.querySelector('.arthur-hub-shop')) return;
    const shop = document.createElement('button');
    shop.type = 'button';
    shop.className = 'btn arthur-hub-shop';
    shop.textContent = tr('Shop');
    shop.addEventListener('click', function () {
      openInGameShop(opts);
    });
    extras.appendChild(shop);
  }

  function injectBankHubButton() {
    if (!global.ArthurShop || !global.ArthurShop.GAME_BANK_META) return;
    const gid = gameId();
    if (!global.ArthurShop.GAME_BANK_META[gid]) return;
    const extras = ensureArthurHubExtras();
    if (!extras) return;
    global.ArthurShop.injectBankButton(extras, gid);
  }

  function injectHubButtons(opts) {
    injectStyles();
    opts = opts || {};
    injectShopHubButton(opts);
    injectBankHubButton();
    const extras = ensureArthurHubExtras();
    if (!extras || extras.querySelector('.arthur-hub-tutorial')) return;
    if (opts.skipTutorial || document.getElementById('btnTutorial')) {
      /* Game already has its own Tutorial control */
    } else {
      const tut = document.createElement('button');
      tut.type = 'button';
      tut.className = 'btn arthur-hub-tutorial';
      tut.textContent = tr('Tutorial');
      tut.addEventListener('click', function () {
        showTutorial(gameId(), opts.onTutorial || opts.onPlay || null);
      });
      extras.appendChild(tut);
    }

    if (supportsEndless()) {
      const end = document.createElement('button');
      end.type = 'button';
      end.className = 'btn arthur-hub-endless';
      end.textContent = tr('Endless');
      end.addEventListener('click', function () {
        markEndlessSession();
        if (opts.onEndless) opts.onEndless();
        else if (opts.onPlay) opts.onPlay();
      });
      extras.appendChild(end);
    }
  }

  function ensureEndlessHud(hudEl) {
    if (!hudEl || endlessHudEl) return;
    endlessHudEl = document.createElement('span');
    endlessHudEl.className = 'arthur-endless-pill';
    endlessHudEl.textContent = tr('Endless');
    endlessHudEl.id = 'arthurEndlessHud';
    hudEl.insertBefore(endlessHudEl, hudEl.firstChild);
  }

  function updateEndlessHud(hudEl, extra) {
    if (!isEndless()) return;
    ensureEndlessHud(hudEl);
    if (endlessHudEl) {
      endlessHudEl.textContent =
        tr('Endless · ') + (extra || tr('lap ') + endlessStreak);
    }
  }

  /** Level-based games: call at start of levelComplete — returns true if handled. */
  function loopEndlessLevel(opts) {
    if (!isEndless()) return false;
    opts = opts || {};
    const count = opts.count || 1;
    const cur = opts.getIndex ? opts.getIndex() : 0;
    const next = opts.nextIndex != null ? opts.nextIndex : (cur + 1) % count;
    endlessStreak++;
    if (opts.setIndex) opts.setIndex(next);
    if (opts.load) opts.load(next);
    if (opts.resume) opts.resume();
    if (opts.hudEl) updateEndlessHud(opts.hudEl, opts.label ? opts.label + ' #' + endlessStreak : null);
    if (opts.onAdvance) opts.onAdvance(next, endlessStreak);
    return true;
  }

  /**
   * Endless with procedural waves (not cycling a level list).
   * opts.onGenerate(streak) should build/spawn the next random layout.
   */
  function advanceEndlessGeneration(opts) {
    if (!isEndless()) return false;
    opts = opts || {};
    endlessStreak++;
    if (opts.onGenerate) opts.onGenerate(endlessStreak);
    if (opts.resume) opts.resume();
    const label =
      opts.label != null
        ? opts.label + ' ' + endlessStreak
        : 'gen ' + endlessStreak;
    if (opts.hudEl) updateEndlessHud(opts.hudEl, label);
    if (opts.onAdvance) opts.onAdvance(endlessStreak);
    return true;
  }

  /** Survival games: call at start of gameOver — returns true to skip overlay and continue. */
  function endlessContinueRun(opts) {
    if (!isEndless()) return false;
    opts = opts || {};
    endlessStreak++;
    if (opts.hudEl) updateEndlessHud(opts.hudEl, 'run ' + endlessStreak);
    if (opts.restart) opts.restart();
    return true;
  }

  function awardRunCoins(amount) {
    if (!global.ArthurShop || typeof global.ArthurShop.addCoins !== 'function') return 0;
    return global.ArthurShop.addCoins(amount === undefined ? 12 : amount | 0);
  }

  function awardScoreCoins(score, per) {
    per = per || 250;
    const n = Math.max(1, Math.floor((score | 0) / per));
    return awardRunCoins(n);
  }

  function boot(opts) {
    opts = opts || {};
    injectStyles();
    wirePlayShellChrome();
    const id = opts.gameId || gameId();
    injectHubButtons({
      onTutorial: opts.onTutorial,
      onEndless: opts.onEndless,
      onPlay: opts.onPlay,
      onShop: opts.onShop,
      skipShop: opts.skipShop,
      skipTutorial: opts.skipTutorial,
    });
    if (opts.hudEl && isEndless()) ensureEndlessHud(opts.hudEl);
    if (isTutorialLaunch()) {
      showTutorial(id, opts.onTutorialStart || opts.onPlay || null);
    } else if (opts.showTutorialOnce && !tutorialSeen(id) && opts.onPlay) {
      showTutorial(id, opts.onPlay);
    } else if (isShopLaunch()) {
      openInGameShop(opts);
    } else if (isEndless() && supportsEndless(id) && opts.onEndless) {
      opts.onEndless();
    } else if (isTwoPlayerLaunch() && supportsTwoPlayer(id) && opts.onTwoPlayerStart) {
      opts.onTwoPlayerStart();
    } else if (
      isStartLaunch() &&
      !isTutorialLaunch() &&
      !isShopLaunch() &&
      !isEndless() &&
      typeof opts.onPlay === 'function'
    ) {
      global.setTimeout(function () {
        opts.onPlay();
      }, 60);
    }
    if (isEndless() && supportsEndless(id)) markEndlessSession();
    if (isTwoPlayer()) {
      markTwoPlayerSession();
      if (opts.hudEl) ensureTwoPlayerHud(opts.hudEl);
      if (supportsTwoPlayer(id)) {
        showTwoPlayerBanner({ gameId: id });
      } else {
        let note = document.getElementById('arthurSoloOnlyNote');
        if (!note) {
          note = document.createElement('div');
          note.id = 'arthurSoloOnlyNote';
          note.style.cssText =
            'position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:99985;padding:10px 16px;border-radius:10px;background:rgba(40,20,20,.92);border:2px solid rgba(255,120,100,.5);color:#ffd0c8;font:600 12px system-ui,sans-serif;text-align:center';
          document.body.appendChild(note);
        }
        note.textContent = tr('This game is 1-player only (hub 2-player setting ignored).');
        note.style.display = 'block';
        setTimeout(function () {
          if (note) note.style.display = 'none';
        }, 4500);
      }
    }
  }

  global.ArthurModes = {
    TUTORIALS: TUTORIALS,
    TWO_PLAYER_GAMES: TWO_PLAYER_GAMES,
    gameId: gameId,
    isEndless: isEndless,
    isTwoPlayer: isTwoPlayer,
    isTwoPlayerLaunch: isTwoPlayerLaunch,
    playerCount: playerCount,
    supportsTwoPlayer: supportsTwoPlayer,
    clearTwoPlayerSession: clearTwoPlayerSession,
    supportsEndless: supportsEndless,
    twoPlayerInfo: twoPlayerInfo,
    markTwoPlayerSession: markTwoPlayerSession,
    showTwoPlayerBanner: showTwoPlayerBanner,
    ensureTwoPlayerHud: ensureTwoPlayerHud,
    isTutorialLaunch: isTutorialLaunch,
    isShopLaunch: isShopLaunch,
    isStartLaunch: isStartLaunch,
    openInGameShop: openInGameShop,
    markEndlessSession: markEndlessSession,
    markTutorialSeen: markTutorialSeen,
    tutorialSeen: tutorialSeen,
    showTutorial: showTutorial,
    injectHubButtons: injectHubButtons,
    setPlayChrome: setPlayChrome,
    loopEndlessLevel: loopEndlessLevel,
    advanceEndlessGeneration: advanceEndlessGeneration,
    endlessContinueRun: endlessContinueRun,
    updateEndlessHud: updateEndlessHud,
    awardRunCoins: awardRunCoins,
    awardScoreCoins: awardScoreCoins,
    boot: boot,
  };
})(typeof window !== 'undefined' ? window : global);
