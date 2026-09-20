/**
 * Arthur Games — procedural background music (Web Audio, no audio files).
 * Include in any game page; music starts on first click/key after load.
 */
(function (global) {
  'use strict';

  function midiToHz(m) {
    return 440 * Math.pow(2, (m - 69) / 12);
  }

  /** Per-game themes: bpm, root MIDI, scale degrees, bass/lead step patterns, timbre. */
  const THEMES = {
    hub: {
      bpm: 92, root: 57, scale: [0, 3, 5, 7, 10],
      bass: [0, -1, 0, 3, 5, 3, 0, -1],
      lead: [7, 10, 12, 10, 7, 5, 3, 5],
      wave: 'triangle', bassWave: 'sine', vol: 0.055, kick: false, hihat: 0.012,
    },
    parkour: {
      bpm: 152, root: 62, scale: [0, 2, 4, 7, 9, 12],
      bass: [0, 0, 7, 7, 5, 5, 7, 0],
      lead: [9, 7, 4, 7, 9, 12, 9, 7],
      wave: 'square', bassWave: 'triangle', vol: 0.065, kick: true, hihat: 0.018,
    },
    'gun-game': {
      bpm: 128, root: 50, scale: [0, 3, 5, 7, 10],
      bass: [0, 0, 0, 7, 0, 0, 5, 7],
      lead: [10, 7, 5, 7, 10, 12, 10, 7],
      wave: 'sawtooth', bassWave: 'square', vol: 0.06, kick: true, hihat: 0.02,
    },
    'rage-car': {
      bpm: 168, root: 48, scale: [0, 2, 3, 5, 7, 10],
      bass: [0, 0, 3, 3, 5, 5, 7, 7],
      lead: [7, 5, 3, 5, 7, 10, 7, 5],
      wave: 'square', bassWave: 'sawtooth', vol: 0.07, kick: true, hihat: 0.022,
    },
    'snack-catch': {
      bpm: 138, root: 64, scale: [0, 2, 4, 7, 9],
      bass: [0, 4, 7, 4, 0, 4, 7, 9],
      lead: [9, 7, 4, 7, 9, 12, 9, 7],
      wave: 'triangle', bassWave: 'triangle', vol: 0.065, kick: true, hihat: 0.018,
    },
    'glitch-market': {
      bpm: 108, root: 58, scale: [0, 2, 4, 6, 7, 11],
      bass: [0, 4, 6, 4, 7, 6, 4, 0],
      lead: [11, 7, 6, 7, 11, 14, 11, 7],
      wave: 'triangle', bassWave: 'triangle', vol: 0.06, kick: false, hihat: 0.016,
    },
    'depth-strike': {
      bpm: 124, root: 47, scale: [0, 3, 5, 7, 10],
      bass: [0, 0, 7, 0, 5, 0, 7, 10],
      lead: [10, 7, 5, 7, 10, 12, 10, 7],
      wave: 'sawtooth', bassWave: 'square', vol: 0.058, kick: true, hihat: 0.02,
    },
    'soundboard-brawler': {
      bpm: 96, root: 56, scale: [0, 2, 4, 7, 9],
      bass: [0, 4, 0, 4, 7, 4, 0, 4],
      lead: [7, 9, 7, 4, 7, 9, 12, 9],
      wave: 'triangle', bassWave: 'sine', vol: 0.028, kick: false, hihat: 0.006,
    },
    'typo-spellcaster': {
      bpm: 100, root: 59, scale: [0, 3, 5, 8, 10],
      bass: [0, 5, 3, 5, 0, 5, 8, 5],
      lead: [10, 8, 5, 8, 10, 13, 10, 8],
      wave: 'sine', bassWave: 'triangle', vol: 0.055, kick: false, hihat: 0.012,
    },
    'island-royale': {
      bpm: 132, root: 51, scale: [0, 2, 3, 5, 7, 10],
      bass: [0, 0, 5, 5, 7, 7, 0, 5],
      lead: [10, 7, 5, 7, 10, 12, 10, 7],
      wave: 'square', bassWave: 'sawtooth', vol: 0.062, kick: true, hihat: 0.022,
    },
    'minecraft': {
      bpm: 88, root: 50, scale: [0, 2, 4, 5, 7, 9],
      bass: [0, 0, 4, 5, 0, 2, 4, 7],
      lead: [7, 9, 7, 4, 5, 7, 9, 7],
      wave: 'triangle', bassWave: 'sine', vol: 0.05, kick: false, hihat: 0.008,
    },
  };

  let ctx = null;
  let master = null;
  let theme = null;
  let step = 0;
  let nextBeat = 0;
  let timer = null;
  let armed = false;
  let muted = false;
  let volume = 1;
  let themeId = null;
  const LS_MUSIC = 'arthurMusicOn';
  let muteBtn = null;

  function isMusicOn() {
    try {
      const saved = global.localStorage.getItem(LS_MUSIC);
      if (saved === null) return true;
      return saved === '1';
    } catch (e) {
      return true;
    }
  }

  function saveMusicOn(on) {
    try {
      global.localStorage.setItem(LS_MUSIC, on ? '1' : '0');
    } catch (e2) {}
  }

  function updateMuteButton() {
    if (!muteBtn) return;
    const on = isMusicOn();
    muteBtn.textContent = '';
    muteBtn.classList.toggle('arthur-music-off', !on);
    muteBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    muteBtn.setAttribute('aria-label', on ? 'Music on — click to mute' : 'Music off — click to unmute');
    muteBtn.title = on ? 'Music on (M)' : 'Music off (M)';
  }

  function setMusicOn(on) {
    saveMusicOn(!!on);
    muted = !on;
    if (on) {
      armed = true;
      if (!theme) start(themeId || pageTheme());
      else if (master && ctx) fadeMaster(volume, 0.2);
    } else {
      stop(true);
    }
    updateMuteButton();
    return on;
  }

  function toggleMusic() {
    return setMusicOn(!isMusicOn());
  }

  function ensureCtx() {
    if (ctx) return ctx;
    const AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 4200;
    filter.Q.value = 0.7;
    master.connect(filter);
    filter.connect(ctx.destination);
    return ctx;
  }

  function scaleNote(root, scale, degree) {
    const oct = Math.floor(degree / scale.length);
    const idx = ((degree % scale.length) + scale.length) % scale.length;
    return root + scale[idx] + oct * 12;
  }

  function playKick(t) {
    if (!ctx || !theme || !theme.kick) return;
    const len = Math.floor(ctx.sampleRate * 0.12);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let i;
    for (i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(160, t);
    f.frequency.exponentialRampToValueAtTime(40, t + 0.1);
    g.gain.setValueAtTime(0.22 * volume, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    src.connect(f);
    f.connect(g);
    g.connect(master);
    src.start(t);
    src.stop(t + 0.13);
  }

  function playHat(t, loud) {
    if (!ctx || !theme) return;
    const vol = (theme.hihat || 0.015) * (loud ? 1.4 : 1) * volume;
    if (vol <= 0) return;
    const len = Math.floor(ctx.sampleRate * 0.04);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let i;
    for (i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 7000;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
    src.connect(f);
    f.connect(g);
    g.connect(master);
    src.start(t);
    src.stop(t + 0.04);
  }

  function playTone(freq, t, dur, vol, wave) {
    if (!ctx || !theme || vol <= 0) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = wave || 'triangle';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol * volume), t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function tick() {
    if (!ctx || !theme) return;
    const t = ctx.currentTime;
    while (nextBeat < t + 0.12) {
      const beatDur = 60 / theme.bpm / 2;
      const s = step % 16;
      const bassDeg = theme.bass[s % theme.bass.length];
      const leadDeg = theme.lead[s % theme.lead.length];
      const bassMidi = scaleNote(theme.root, theme.scale, bassDeg);
      const leadMidi = scaleNote(theme.root, theme.scale, leadDeg + 14);

      if (s % 2 === 0) playKick(nextBeat);
      playHat(nextBeat, s % 4 === 2);

      playTone(
        midiToHz(bassMidi),
        nextBeat,
        beatDur * 0.92,
        theme.vol * 1.35,
        theme.bassWave
      );
      if (s % 2 === 1) {
        playTone(
          midiToHz(leadMidi),
          nextBeat,
          beatDur * 0.75,
          theme.vol * 0.85,
          theme.wave
        );
      }

      step++;
      nextBeat += beatDur;
    }
    timer = global.setTimeout(tick, 50);
  }

  function fadeMaster(to, dur) {
    if (!ctx || !master) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(to, ctx.currentTime + dur);
  }

  function pageTheme() {
    const file = (global.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!file || file === 'index.html') return 'hub';
    return file.replace(/\.html$/i, '');
  }

  function start(id) {
    const key = id || pageTheme();
    if (!THEMES[key]) return false;
    themeId = key;
    if (!isMusicOn()) {
      muted = true;
      updateMuteButton();
      return false;
    }
    stop(false);
    if (!ensureCtx()) return false;
    theme = THEMES[key];
    step = 0;
    muted = false;
    if (ctx.state === 'suspended') ctx.resume();
    nextBeat = ctx.currentTime + 0.05;
    fadeMaster(volume, 0.4);
    tick();
    updateMuteButton();
    return true;
  }

  function stop(fade) {
    if (timer) {
      global.clearTimeout(timer);
      timer = null;
    }
    if (fade !== false && master && ctx) fadeMaster(0, 0.25);
    else if (master) master.gain.value = 0;
    theme = null;
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
  }

  function toggleMute() {
    return toggleMusic();
  }

  function isMuted() {
    return !isMusicOn();
  }

  function auto(id) {
    const key = id || pageTheme();
    themeId = key;
    if (!THEMES[key]) return;
    injectMuteButton();
    muted = !isMusicOn();
    function arm() {
      if (armed) return;
      armed = true;
      if (isMusicOn()) start(key);
    }
    global.document.addEventListener('pointerdown', arm, { passive: true });
    global.document.addEventListener('keydown', arm);
  }

  function injectMuteButton() {
    if (typeof document === 'undefined') return;
    if (muteBtn) return;
    if (!document.getElementById('arthurMusicStyles')) {
      const style = document.createElement('style');
      style.id = 'arthurMusicStyles';
      style.textContent =
        /* Compact top-right chrome under the language toggle — clears bottom hotbars / Inventory */
        '#arthurMusicMute{position:fixed;top:56px;right:12px;left:auto;z-index:10020;' +
        'display:inline-flex;align-items:center;justify-content:center;' +
        'width:42px;height:42px;padding:0;border-radius:12px;' +
        'border:1px solid rgba(140,170,255,0.35);background:rgba(10,12,18,0.88);' +
        'color:#dce8ff;font:600 0.78rem/1 system-ui,Segoe UI,sans-serif;' +
        'cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.4);pointer-events:auto;' +
        'transition:background 0.15s,border-color 0.15s,transform 0.1s}' +
        '#arthurMusicMute:hover{background:rgba(22,28,42,0.95);border-color:rgba(160,190,255,0.55);transform:translateY(-1px)}' +
        '#arthurMusicMute:active{transform:translateY(0)}' +
        '#arthurMusicMute.arthur-music-off{color:#8899aa;border-color:rgba(120,130,150,0.3);background:rgba(8,10,14,0.9);opacity:0.85}' +
        '#arthurMusicMute::before{content:"\\266A";font-size:1.15rem;line-height:1}' +
        'body.shell-game-open #arthurMusicMute{display:none!important}' +
        /* Push common top-right hints below the chrome stack so text does not overlap */
        'body:has(#arthurMusicMute) #hint,body:has(#arthurLangBtn) #hint,' +
        'body:has(#arthurMusicMute) .top-hint,body:has(#arthurLangBtn) .hint-tr{' +
        'top:104px!important}' +
        '@media(max-width:520px){#arthurMusicMute{top:52px;right:8px;width:40px;height:40px}}';
      document.head.appendChild(style);
    }
    muteBtn = document.createElement('button');
    muteBtn.id = 'arthurMusicMute';
    muteBtn.type = 'button';
    muteBtn.setAttribute('aria-label', 'Toggle background music');
    muteBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      toggleMusic();
    });
    muteBtn.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
    });
    document.body.appendChild(muteBtn);
    updateMuteButton();
    document.addEventListener('keydown', function (e) {
      if (e.code === 'KeyM' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target && e.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        e.preventDefault();
        toggleMusic();
      }
    });
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      injectMuteButton();
      auto();
    });
    document.addEventListener('visibilitychange', function () {
      if (!ctx) return;
      if (document.hidden) {
        if (ctx.state === 'running') ctx.suspend();
      } else if (theme && isMusicOn()) {
        ctx.resume();
      }
    });
  }

  global.ArthurMusic = {
    start: start,
    stop: stop,
    auto: auto,
    setVolume: setVolume,
    toggleMute: toggleMute,
    toggleMusic: toggleMusic,
    setMusicOn: setMusicOn,
    isMusicOn: isMusicOn,
    isMuted: isMuted,
    pageTheme: pageTheme,
    themes: Object.keys(THEMES),
    injectButton: injectMuteButton,
  };
})(typeof window !== 'undefined' ? window : global);
