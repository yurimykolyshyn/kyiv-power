FIGS.push({
  id: 'bus', name: 'До зупинки · ранок під тривогою',
  hint: '←→ іти · пробіл / ↑ — стрибок · біля автобуса тисни пробіл, щоб втиснутись',
  aria: 'Ізометричний платформер: людина виходить з дому і йде вулицею до автобусної зупинки, перестрибує блоки й люки, збирає каштани і тікає від тіней шахедів, що падають. На зупинці треба втиснутись у переповнений автобус.',
  css: `
    [data-fig="bus"] { --danger: #E5484D; --danger-hi: #FF9A9C; }
    [data-fig="bus"] .person { fill: none; stroke: var(--ink-hi); stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
    [data-fig="bus"] .head { fill: var(--body); stroke: var(--ink-hi); stroke-width: 1.3; vector-effect: non-scaling-stroke; }
    [data-fig="bus"] .jacket { fill: var(--accent); stroke: var(--accent-hi); stroke-width: 1; vector-effect: non-scaling-stroke; }
    [data-fig="bus"] .pack { fill: var(--deck); stroke: var(--ink-hi); stroke-width: 1; vector-effect: non-scaling-stroke; }
    [data-fig="bus"] .road { fill: var(--recess); }
    [data-fig="bus"] .walk { fill: var(--deck); }
    [data-fig="bus"] .dash { fill: var(--detail); }
    [data-fig="bus"] .win { fill: var(--glass); stroke: var(--detail); stroke-width: .6; vector-effect: non-scaling-stroke; }
    [data-fig="bus"] .win.lit { fill: var(--accent); stroke: var(--accent-hi); opacity: .75; }
    [data-fig="bus"].dark .win.lit { fill: var(--glass); stroke: var(--detail); opacity: 1; }
    [data-fig="bus"] .lamp { fill: var(--accent-hi); }
    [data-fig="bus"].dark .lamp { fill: var(--detail); filter: none; }
    [data-fig="bus"] .hole { fill: #050403; stroke: var(--line); stroke-width: .8; vector-effect: non-scaling-stroke; }
    [data-fig="bus"] .nut { fill: #8A4B22; stroke: var(--accent-hi); stroke-width: .9; vector-effect: non-scaling-stroke; }
    [data-fig="bus"] .shadow { fill: var(--danger); }
    [data-fig="bus"] .ring { fill: none; stroke: var(--danger); stroke-width: 1.2; vector-effect: non-scaling-stroke; }
    [data-fig="bus"] .drone { fill: var(--body); stroke: var(--ink-hi); stroke-width: 1; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
    [data-fig="bus"] .boom { fill: var(--accent-hi); }
    [data-fig="bus"] .boom2 { fill: var(--danger); }
    [data-fig="bus"] .busbody { fill: var(--body); }
    [data-fig="bus"] .sign { fill: var(--accent); font-family: var(--mono); font-weight: 500; }
    [data-fig="bus"] .hud { fill: var(--ink-hi); font-family: var(--mono); font-size: 11px; letter-spacing: 2px; text-anchor: middle;
      paint-order: stroke; stroke: var(--panel); stroke-width: 4px; stroke-linejoin: round; pointer-events: none; }
    [data-fig="bus"] .hud.alert { fill: var(--danger-hi); animation: bus-blink .7s steps(2) infinite; }
    [data-fig="bus"] .bar0 { fill: var(--recess); stroke: var(--line); stroke-width: .8; vector-effect: non-scaling-stroke; }
    [data-fig="bus"] .bar1 { fill: var(--accent); }
    [data-fig="bus"] .bar2 { fill: var(--danger); }
    @keyframes bus-blink { 50% { opacity: .45; } }
  `,
  mount(stage, api) {
    const LANE = 15, STOP = 1300, END = 1420, BH = 46;        // walking lane y, stop position, end of street
    // phones get a closer, squarer camera (decided once per mount)
    const MOB = window.matchMedia('(max-width: 700px)').matches, R = MOB ? 120 : 210;
    const K = api.iso.frame([[-R,-160,0],[R,-160,0],[-R,48,0],[R,48,0],[-R,-160,110],[R,-160,110],[0,0,170]], 0.02, MOB ? 0.95 : 16 / 9);
    const { P, D, TOP, FRONT, SIDE, box, rect, path } = K;
    const f2 = n => n.toFixed(2);
    const NS = 'http://www.w3.org/2000/svg';
    const vb = K.viewBox.split(' ').map(Number);
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

    // ---------- static street (built per level) ----------
    function streetSVG() {
      let s = '';
      // back row of apartment blocks
      for (let x = -280; x < END + 320;) {
        const w = 56 + Math.floor(rnd() * 40), h = 58 + Math.floor(rnd() * 60);
        s += box(x, -150, 0, w, 52, h);
        let wins = `<g transform="${FRONT(x, -98, h)}">`;
        for (let v = 7; v < h - 8; v += 10) for (let u = 5; u < w - 6; u += 9)
          wins += `<rect class="win${rnd() < 0.55 ? ' lit' : ''}" x="${u}" y="${v}" width="4.6" height="5.2"/>`;
        s += wins + '</g>';
        x += w + 6 + Math.floor(rnd() * 14);
      }
      s += box(-280, -98, -2, END + 600, 36, 2);                                   // back pavement
      s += `<g transform="${TOP(-280, -62, 0)}"><rect class="road" width="${END + 600}" height="50"/>
        ${Array.from({ length: Math.ceil((END + 600) / 40) }, (_, i) => `<rect class="dash" x="${i * 40}" y="24" width="20" height="1.6"/>`).join('')}</g>`;
      return s;
    }
    function frontSVG() {
      let s = box(-280, -12, 0, END + 600, 2, 1.5);                                // kerb
      s += `<g transform="${TOP(-280, -10, 0)}"><rect class="walk" width="${END + 600}" height="56"/>${api.iso.slits(0, END + 600, 24, 0, 56)}</g>`;
      return s;
    }
    // the home block at the start: the door faces the street
    const homeSVG = () => box(-150, -10, 0, 96, 56, 112) + `<g transform="${SIDE(-54, 46, 112)}">
        ${Array.from({ length: 9 }, (_, r) => Array.from({ length: 5 }, (_, c) => `<rect class="win${(r * 5 + c) % 3 ? ' lit' : ''}" x="${6 + c * 10}" y="${8 + r * 10}" width="5" height="5.6"/>`).join('')).join('')}
        <rect class="face recess" x="${56 - 30}" y="96" width="12" height="16"/><text class="sign" x="${56 - 24}" y="93" font-size="5" text-anchor="middle">ДІМ</text></g>`;
    // bus stop: shelter behind the lane, a pole with the stop sign
    const stopSVG = () => box(STOP + 26, -9, 0, 64, 2, 32) + box(STOP + 24, -11, 32, 68, 16, 2.5)
      + box(STOP + 26, -3, 0, 2, 2, 32) + box(STOP + 88, -3, 0, 2, 2, 32) + box(STOP + 36, -7, 7, 44, 5, 2)
      + `<g transform="${FRONT(STOP + 26, -7, 30)}"><text class="sign" x="32" y="9" font-size="5.2" text-anchor="middle">ЗУПИНКА · А</text></g>`
      + `<path class="wire" d="${path([[STOP - 8, -6, 0], [STOP - 8, -6, 44]])}"/>`
      + `<g transform="${FRONT(STOP - 14, -6, 50)}"><circle class="face" cx="6" cy="6" r="6"/><text class="sign" x="6" y="8.4" font-size="7" text-anchor="middle">А</text></g>`;
    const lampsSVG = () => { let s = ''; for (let x = 40; x < END + 200; x += 150) s += `<path class="wire" d="${path([[x, 44, 0], [x, 44, 56], [x - 10, 44, 60]])}"/><circle class="lamp" filter="url(#glow)" cx="${f2(P(x - 10, 44, 58)[0])}" cy="${f2(P(x - 10, 44, 58)[1])}" r="2.2"/>`; return s; };

    // bus: built at x = 0 and slid along x; door on its street side around u = 30..44
    const BUSL = 128, DOOR = 30;
    const busSVG = () => {
      let s = box(0, -54, 3, BUSL, 34, BH, 4);
      s += `<g transform="${FRONT(0, -20, BH + 3)}">
        <rect class="face" x="0" y="0" width="${BUSL}" height="${BH}" style="fill:var(--body)"/>
        ${Array.from({ length: 7 }, (_, i) => i === 1 ? '' : `<rect class="win lit" x="${4 + i * 17.4}" y="6" width="14" height="15" rx="1.5"/>`).join('')}
        <rect class="face recess" id="bus-door" x="${DOOR}" y="6" width="14" height="${BH - 8}"/>
        <rect class="detail" x="0" y="26" width="${BUSL}" height="1.2"/>
        <text class="sign" x="${BUSL - 14}" y="35" font-size="7" text-anchor="middle">А</text></g>`;
      // packed passengers in the windows
      for (let i = 0; i < 6; i++) for (let k = 0; k < 3; k++) {
        const u = (i < 1 ? 4 : 4 + (i + 1) * 17.4) + 2 + k * 4.4;
        s += `<g transform="${FRONT(0, -20, BH + 3)}"><circle class="head" cx="${f2(u + 1.4)}" cy="${f2(15 + (k % 2) * 1.5)}" r="2.3"/></g>`;
      }
      for (const ww of [18, 104]) s += `<g transform="${FRONT(ww - 9, -19.9, 6)}"><circle class="face recess" cx="9" cy="2" r="7"/></g>`;
      return s;
    };

    let svg = `<g id="bus-world"><g id="bus-street"></g><g id="bus-busl"><g id="bus-bus">${busSVG()}</g></g><g id="bus-front"></g><g id="bus-decals"></g>
      <g id="bus-objs"></g><g id="bus-crowd"></g><g id="bus-actor"></g><g id="bus-lamps"></g><g id="bus-sky"></g></g>
      <text id="bus-hud" class="hud" x="${f2(vb[2] / 2)}" y="26"></text>
      <g id="bus-meter" style="display:none"><text class="hud" x="${f2(vb[2] / 2)}" y="${f2(vb[3] - 46)}">ВТИСКАЄМОСЬ</text>
        <rect class="bar0" x="${f2(vb[2] / 2 - 90)}" y="${f2(vb[3] - 38)}" width="180" height="8" rx="2"/><rect id="bus-prog" class="bar1" x="${f2(vb[2] / 2 - 89)}" y="${f2(vb[3] - 37)}" width="0" height="6" rx="1.5" filter="url(#soft)"/>
        <rect class="bar0" x="${f2(vb[2] / 2 - 90)}" y="${f2(vb[3] - 26)}" width="180" height="4" rx="1"/><rect id="bus-time" class="bar2" x="${f2(vb[2] / 2 - 89)}" y="${f2(vb[3] - 25.4)}" width="0" height="2.8" rx="1"/></g>`;
    stage.setAttribute('viewBox', K.viewBox); stage.innerHTML = svg;
    const $ = id => stage.querySelector('#' + id);
    const world = $('bus-world'), L = { street: $('bus-street'), front: $('bus-front'), decals: $('bus-decals'), objs: $('bus-objs'),
      crowd: $('bus-crowd'), actor: $('bus-actor'), lamps: $('bus-lamps'), sky: $('bus-sky') };
    const busEl = $('bus-bus'), hud = $('bus-hud'), meter = $('bus-meter'), prog = $('bus-prog'), timeBar = $('bus-time');
    const mk = (parent, html) => { const g = document.createElementNS(NS, 'g'); g.innerHTML = html; parent.appendChild(g); return g; };
    const at = (g, x, y, z, extra = '') => { const [sx, sy] = P(x, y, z); g.setAttribute('transform', `translate(${f2(sx)} ${f2(sy)})${extra}`); };

    // player (billboard): jacket, backpack, legs and arms drawn per frame
    const hero = mk(L.actor, `<g transform="scale(1.35)"><path class="pack" d="M-5.5 -26 L-2 -26 L-2 -16 L-5.5 -16 Z"/><path class="person" id="bus-legs" d=""/>
      <path class="jacket" d="M-3 -27 L3 -27 L3.4 -14 L-3.4 -14 Z"/><path class="person" id="bus-arms" d=""/><circle class="head" cx="0" cy="-32.5" r="4.2"/>
      <path class="person" d="M-4.2 -33.5 Q0 -39 4.2 -33.5"/></g>`);
    const legs = hero.querySelector('#bus-legs'), arms = hero.querySelector('#bus-arms');

    // ---------- sound ----------
    let NOISE = null;
    const AU = () => { try { return api.audio(); } catch (e) { return null; } };
    function sfx(kind) {
      const A = AU(); if (!A) return;
      try {
        const { ctx, out } = A, t = ctx.currentTime;
        if (!NOISE) { NOISE = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const c = NOISE.getChannelData(0); for (let i = 0; i < c.length; i++) c[i] = Math.random() * 2 - 1; }
        const env = (n, at, pk, d, a = 0.005) => { const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(pk, at + a); g.gain.exponentialRampToValueAtTime(0.0001, at + d); n.connect(g); g.connect(out); return g; };
        const noise = (at, type, f, pk, d) => { const n = ctx.createBufferSource(); n.buffer = NOISE; const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; n.connect(b); env(b, at, pk, d); n.start(at, Math.random() * 0.5); n.stop(at + d + 0.02); };
        const tone = (at, type, f0, f1, pk, d, a) => { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, at); o.frequency.exponentialRampToValueAtTime(f1, at + d); env(o, at, pk, d, a); o.start(at); o.stop(at + d + 0.02); return o; };
        if (kind === 'jump') tone(t, 'square', 520, 800, 0.05, 0.1);
        if (kind === 'nut') { tone(t, 'square', 988, 988, 0.05, 0.06); tone(t + 0.06, 'square', 1480, 1480, 0.05, 0.12); }
        if (kind === 'boom') { noise(t, 'lowpass', 700, 0.55, 0.7); tone(t, 'sine', 90, 28, 0.5, 0.6); }
        if (kind === 'hurt') tone(t, 'sawtooth', 300, 120, 0.08, 0.3);
        if (kind === 'fall') tone(t, 'triangle', 600, 90, 0.1, 0.5);
        if (kind === 'siren') { for (let k = 0; k < 3; k++) { const o = tone(t + k * 1.1, 'sine', 520, 880, 0.045, 1.05, 0.2); } }
        if (kind === 'clear') { tone(t, 'sine', 660, 660, 0.04, 0.25); tone(t + 0.25, 'sine', 880, 880, 0.04, 0.35); }
        if (kind === 'drone') {   // the moped-like buzz, swelling as it dives
          const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 118;
          const lfo = ctx.createOscillator(); lfo.frequency.value = 9; const lg = ctx.createGain(); lg.gain.value = 6; lfo.connect(lg); lg.connect(o.frequency);
          const b = ctx.createBiquadFilter(); b.type = 'lowpass'; b.frequency.value = 900; o.connect(b);
          const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.03, t + 1.6); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.1);
          b.connect(g); g.connect(out); o.start(t); lfo.start(t); o.stop(t + 2.2); lfo.stop(t + 2.2);
        }
        if (kind === 'horn') { tone(t, 'square', 330, 330, 0.06, 0.35); tone(t, 'square', 415, 415, 0.05, 0.35); }
        if (kind === 'door') noise(t, 'highpass', 3000, 0.12, 0.4);
        if (kind === 'push') noise(t, 'lowpass', 400, 0.18, 0.08);
        if (kind === 'win') [523, 659, 784, 1047].forEach((f, i) => tone(t + i * 0.1, 'triangle', f, f, 0.08, 0.2));
      } catch (e) {}
    }

    // ---------- level ----------
    const st = { mode: 'ready', level: 1, hearts: 3, nuts: 0, score: 0, x: -40, z: 0, vz: 0, ground: true, face: 1, inv: 0, left: false, right: false,
                 cam: 0, t: 0, last: 0, alert: 0, calm: 6, spawnT: 0, drones: [], fx: [], holes: [], blocks: [], nutsL: [], busX: -400, busState: 'none',
                 board: 0, boardT: 0, boardTry: 0, shake: 0, phase: 'walk', best: 0, alertsDone: 0 };
    try { st.best = +localStorage.getItem('bus-best') || 0; } catch (e) {}

    function buildLevel() {
      seed = 7 + st.level * 31;
      L.street.innerHTML = streetSVG() + homeSVG();
      L.front.innerHTML = frontSVG() + stopSVG();
      L.lamps.innerHTML = lampsSVG();
      L.decals.innerHTML = ''; L.objs.innerHTML = ''; L.sky.innerHTML = ''; L.crowd.innerHTML = '';
      st.holes = []; st.blocks = []; st.nutsL = []; st.drones = []; st.fx = [];
      // obstacles: concrete blocks to jump over, open manholes to jump across, chestnuts to collect
      for (let x = 120; x < STOP - 120;) {
        const kind = rnd() < 0.5 ? 'block' : 'hole';
        if (kind === 'block') { const b = { x, w: 16 }; st.blocks.push(b); mk(L.objs, box(x, LANE - 9, 0, 16, 18, 12, 1.5) + `<g transform="${FRONT(x, LANE + 9, 12)}">${api.iso.slits(4, 12, 4, 2, 10)}</g>`); }
        else { addHole(x, 22, 'люк'); }
        const n = 1 + Math.floor(rnd() * 3);
        for (let i = 0; i < n; i++) addNut(x - 40 + i * 14, kind === 'block' && i === n - 1 ? 22 : 8);
        x += 110 + Math.floor(rnd() * 90) - Math.min(40, st.level * 6);
      }
      Object.assign(st, { x: -40, z: 0, vz: 0, ground: true, inv: 0, phase: 'walk', busState: 'none', busX: -400, board: 0, alert: 0, calm: 5, alertsDone: 0 });
      busEl.parentNode.style.display = 'none';
      meter.style.display = 'none';
    }
    function addHole(x, w, kind) {
      const h = { x, w, kind }; st.holes.push(h);
      const pts = kind === 'люк' ? `<ellipse class="hole" cx="${w / 2}" cy="9" rx="${w / 2}" ry="8"/>`
        : `<path class="hole" d="M0 9 L3 3 L8 1 L13 3 L${w - 6} 0 L${w} 7 L${w - 2} 14 L${w / 2 + 3} 17 L5 16 Z"/>`;
      mk(L.decals, `<g transform="${TOP(x, LANE - 9, 0.2)}">${pts}</g>`);
      return h;
    }
    function addNut(x, z) { const g = mk(L.objs, '<circle class="nut" r="2.6" cy="-2.6"/><path class="person" style="stroke-width:.8" d="M0 -5.2 L0.8 -6.8"/>'); at(g, x, LANE, z); st.nutsL.push({ x, z, g }); }

    function newGame() { Object.assign(st, { mode: 'play', level: 1, hearts: 3, nuts: 0, score: 0 }); buildLevel(); say(''); }
    function say(s) { hud.textContent = s; hud.classList.toggle('alert', s.startsWith('ПОВІТРЯНА')); }
    function hurt(why, knock = 0) {
      if (st.inv > 0 || st.mode !== 'play') return;
      st.hearts--; st.inv = 1.6; sfx('hurt');
      if (knock) { st.x = Math.max(-40, st.x + knock); st.vz = 120; st.ground = false; }
      if (st.hearts <= 0) {
        st.mode = 'over'; say('ДЕНЬ НЕ ВДАВСЯ · пробіл — спочатку');
        const total = st.score + st.nuts * 10;
        if (total > st.best) { st.best = total; try { localStorage.setItem('bus-best', total); } catch (e) {} }
      } else { say(why); api.after(1400, () => { if (hud.textContent === why) say(st.alert > 0 ? 'ПОВІТРЯНА ТРИВОГА' : ''); }); }
    }

    // ---------- input ----------
    function jump() {
      if (st.mode !== 'play') { newGame(); return; }
      if (st.phase === 'board') { push(); return; }
      if (st.phase !== 'walk') return;
      if (st.ground) { st.vz = 175; st.ground = false; sfx('jump'); }
    }
    function push() { st.board = Math.min(1, st.board + 0.075); sfx('push'); }

    // ---------- loop ----------
    const solidAt = x => st.blocks.find(b => x > b.x - 3 && x < b.x + b.w + 3);
    const holeAt = x => st.holes.find(h => x > h.x + 3 && x < h.x + h.w - 3);
    api.loop(ts => {
      const dt = st.last ? Math.min(0.05, (ts - st.last) / 1000) : 0; st.last = ts; st.t += dt;
      const play = st.mode === 'play';
      if (st.inv > 0) st.inv -= dt;

      if (play && st.phase === 'walk') {
        // run & jump with simple platform physics
        const vx = (st.right ? 1 : 0) - (st.left ? 1 : 0);
        if (vx) st.face = vx;
        let nx = st.x + vx * 92 * dt;
        const b = solidAt(nx);
        if (b && st.z < 12) nx = vx > 0 ? b.x - 3 : b.x + b.w + 3;
        st.x = Math.max(-46, Math.min(STOP + 4, nx));
        st.vz -= 520 * dt; st.z += st.vz * dt;
        const floor = solidAt(st.x) ? 12 : 0;
        if (st.z <= floor) {
          if (!floor && holeAt(st.x)) {          // fell into a manhole or crater
            if (st.z < -10) { sfx('fall'); const h = holeAt(st.x); st.x = h.x - 12; st.z = 0; st.vz = 0; st.ground = true; st.inv = 0; hurt(h.kind === 'люк' ? 'ВІДКРИТИЙ ЛЮК!' : 'ВИРВА!'); }
            else st.ground = false;
          } else { st.z = floor; st.vz = 0; st.ground = true; }
        } else st.ground = false;
        // chestnuts
        st.nutsL = st.nutsL.filter(n => { if (Math.abs(n.x - st.x) < 7 && Math.abs(n.z - st.z - 6) < 12) { n.g.remove(); st.nuts++; sfx('nut'); return false; } return true; });
        // reaching the stop
        if (st.x >= STOP - 14 && st.ground) { st.phase = 'wait'; st.x = STOP; st.waitT = 1.4; st.right = st.left = false; say('ЧЕКАЄМО АВТОБУС'); }
      }

      // air-raid alerts: a calm spell, then a wave of drones aimed around the walker
      if (play && st.phase !== 'board' && st.phase !== 'done') {
        if (st.alert > 0) {
          st.alert -= dt; st.spawnT -= dt;
          if (st.spawnT <= 0) {
            st.spawnT = Math.max(0.45, 1.05 - st.level * 0.1) * (0.7 + Math.random() * 0.6);
            const lead = (st.right ? 70 : st.left ? -50 : 0) + (Math.random() * 120 - 40);
            const onLane = Math.random() < 0.75;
            const tx = Math.max(-20, Math.min(STOP - 30, st.x + lead)), ty = onLane ? LANE : -36 - Math.random() * 20;
            const g = mk(L.sky, `<g><path class="drone" d="M7 0 L-6 -7 L-3.5 0 L-6 7 Z"/><path class="drone" d="M-4.5 0 L-8.5 -2.6 L-8.5 2.6 Z"/><circle class="boom" r=".9" cx="-7.5" cy="0" filter="url(#glow)"/></g>`);
            const sh = mk(L.decals, `<g transform="${TOP(tx, ty, 0.3)}"><circle class="shadow" r="20" opacity=".1"/><circle class="ring" r="20"/></g>`);
            st.drones.push({ tx, ty, t: 0, T: 2.1, from: [tx - 150, ty - 130, 175], g, sh, sc: sh.firstChild.firstChild });
            sfx('drone');
          }
          if (st.alert <= 0) { st.calm = Math.max(4, 9 - st.level) + Math.random() * 3; say('ВІДБІЙ ТРИВОГИ'); sfx('clear'); api.after(1500, () => { if (hud.textContent === 'ВІДБІЙ ТРИВОГИ') say(''); }); }
        } else {
          st.calm -= dt;
          if (st.calm <= 0 && st.phase === 'walk') { st.alert = 5 + st.level * 1.2; st.spawnT = 0.8; st.alertsDone++; say('ПОВІТРЯНА ТРИВОГА'); sfx('siren'); }
        }
      }
      // drones dive toward their marked spot; the red circle tightens as they come
      st.drones = st.drones.filter(d => {
        d.t += dt; const p = Math.min(1, d.t / d.T);
        const pos = [d.from[0] + (d.tx - d.from[0]) * p, d.from[1] + (d.ty - d.from[1]) * p, d.from[2] * (1 - p)];
        const nxt = P(d.tx, d.ty, 0), cur = P(...pos), ang = Math.atan2(nxt[1] - cur[1], nxt[0] - cur[0]) * 180 / Math.PI;
        at(d.g, ...pos, ` rotate(${f2(ang)}) scale(2.2)`);
        d.sc.setAttribute('opacity', f2(0.08 + 0.3 * p)); d.sc.setAttribute('r', f2(26 - 8 * p));
        if (p >= 1) {
          d.g.remove(); d.sh.remove(); sfx('boom'); st.shake = 0.35;
          const f = { t: 0, g: mk(L.sky, '<circle class="boom2" r="10" opacity=".6" filter="url(#bloom)"/><circle class="boom" r="6" filter="url(#glow)"/>') }; at(f.g, d.tx, d.ty, 6); st.fx.push(f);
          if (d.ty === LANE) {
            if (play && st.phase === 'walk' && Math.abs(st.x - d.tx) < 26) hurt('ВИБУХ ПОРУЧ!', st.x < d.tx ? -36 : 36);
            if (!solidAt(d.tx) && !holeAt(d.tx) && Math.abs(st.x - d.tx) > 16) addHole(d.tx - 12, 24, 'вирва');
          }
          return false;
        }
        return true;
      });
      st.fx = st.fx.filter(f => { f.t += dt; const k = f.t / 0.5; f.g.setAttribute('opacity', f2(Math.max(0, 1 - k))); f.g.firstChild.setAttribute('r', f2(10 + 30 * k)); if (k >= 1) { f.g.remove(); return false; } return true; });

      // the bus: arrives, opens the door, you squeeze in against the crowd before the doors shut
      if (play && st.phase === 'wait') {
        st.waitT -= dt;
        if (st.busState === 'none' && st.waitT <= 0) { st.busState = 'in'; st.busX = st.x - 320; busEl.parentNode.style.display = ''; sfx('horn'); }
      }
      if (st.busState === 'in') {
        const target = STOP - DOOR - 7;
        st.busX += Math.max(30, (target - st.busX) * 3.2) * dt;
        if (st.busX >= target - 0.5) {
          st.busX = target; st.busState = 'open'; sfx('door'); st.phase = 'board'; st.board = 0; st.boardTry++;
          st.boardT = Math.max(4.5, 7 - st.level * 0.5); st.boardMax = st.boardT; meter.style.display = '';
          L.crowd.innerHTML = ''; for (let i = 0; i < 4; i++) { const g = mk(L.crowd, `<g transform="scale(1.3)"><path class="person" d="M-3 0 L0 -14 L3 0 M0 -14 L0 -27 M-6 -18 L0 -25 L6 -18"/><circle class="head" cx="0" cy="-32" r="4"/></g>`); g.dataset.k = i; }
        }
      }
      if (st.phase === 'board' && play) {
        st.boardT -= dt;
        st.board = Math.max(0, st.board - dt * (0.16 + st.level * 0.03) / Math.max(1, st.boardTry * 0.8));   // the crowd pushes back
        if (st.board >= 0.97) {
          st.phase = 'done'; meter.style.display = 'none'; L.crowd.innerHTML = ''; sfx('door'); sfx('win');
          const bonus = 500 + Math.round(st.boardT * 60) + st.hearts * 100;
          st.score += bonus; say(`ВЛІЗ! +${bonus} · пробіл — наступний ранок`);
          st.busState = 'out'; st.boardTry = 0;
        } else if (st.boardT <= 0) {
          st.phase = 'wait'; meter.style.display = 'none'; L.crowd.innerHTML = ''; sfx('door');
          say('НЕ ВЛІЗ · чекаємо наступний'); st.busState = 'out'; st.waitT = 3.2;
          api.after(2200, () => { if (hud.textContent.startsWith('НЕ ВЛІЗ')) say(''); });
        }
      }
      if (st.busState === 'out') {
        st.busX += 140 * dt;
        if (st.busX > st.x + 420) { st.busState = 'none'; busEl.parentNode.style.display = 'none'; if (st.phase === 'done') st.mode = 'won'; }
      }

      // ---------- draw ----------
      const target = Math.max(60, Math.min(STOP - 40, st.x + 50));
      st.cam += (target - st.cam) * Math.min(1, dt * 3);
      st.shake = Math.max(0, st.shake - dt);
      const [cx, cy] = D(st.cam, 0, 0), sh = st.shake > 0 ? (Math.random() - 0.5) * 6 * st.shake : 0;
      world.setAttribute('transform', `translate(${f2(-cx + sh)} ${f2(-cy + sh)})`);
      const [bxs, bys] = D(st.busX, 0, 0); busEl.setAttribute('transform', `translate(${f2(bxs)} ${f2(bys)})`);
      stage.classList.toggle('dark', st.alert > 0);

      // the walker (or squeezing into the bus)
      let hx = st.x, hy = LANE, hz = st.z;
      const running = play && st.phase === 'walk' && (st.left || st.right) && st.ground, k = Math.sin(st.t * 16) * 4;
      if (st.phase === 'board' || st.phase === 'done') { hx = STOP; hy = LANE - (st.phase === 'done' ? 40 : 28 * st.board); }
      hero.style.display = st.phase === 'done' && st.busState !== 'open' ? 'none' : '';
      legs.setAttribute('d', !st.ground && st.phase === 'walk' ? 'M-4 -3 L0 -14 L3 -4 L5 -1' : running ? `M${-k} 0 L0 -14 L${k} 0` : 'M-3 0 L0 -14 L3 0');
      arms.setAttribute('d', st.phase === 'board' ? 'M0 -25 L-6 -30 L-9 -34 M0 -25 L6 -30 L9 -34' : !st.ground ? 'M0 -25 L-7 -32 M0 -25 L7 -32' : running ? `M0 -25 L${-k} -18 M0 -25 L${k} -18` : 'M0 -25 L-5 -17 M0 -25 L5 -17');
      at(hero, hx, hy, hz, st.face < 0 ? ' scale(-1 1)' : '');
      hero.setAttribute('opacity', st.inv > 0 && Math.floor(st.t * 12) % 2 ? '0.35' : '1');
      // the crowd in the doorway leans out as you push in
      [...L.crowd.children].forEach((g, i) => at(g, STOP - 5 + i * 5 - st.board * 6, -16 + (i % 2) * 3 + st.board * -4, 0));
      if (st.phase === 'board') {
        prog.setAttribute('width', f2(178 * st.board));
        timeBar.setAttribute('width', f2(178 * Math.max(0, st.boardT / st.boardMax)));
      }

      const togo = Math.max(0, Math.round((STOP - st.x) / 2));
      const ro = st.mode === 'ready' ? `пробіл або «Стрибок» — вийти з дому${st.best ? ' · рекорд ' + st.best : ''}`
        : st.mode === 'over' ? `рахунок ${st.score + st.nuts * 10} · рекорд ${st.best}`
        : st.mode === 'won' ? `ранок ${st.level} пройдено · рахунок ${st.score + st.nuts * 10} · пробіл — далі`
        : st.phase === 'board' ? `тисни пробіл швидше! · ${Math.ceil(st.boardT)} с до закриття дверей`
        : `${'♥'.repeat(st.hearts)}${'·'.repeat(3 - st.hearts)} · каштани ${st.nuts} · ${togo} м до зупинки · ранок ${st.level}`;
      if (ro !== st.ro) { api.readout(ro); st.ro = ro; }
      api.power(st.alert > 0);
    });

    // ---------- controls: keyboard (captured first) + touch pad ----------
    const ui = document.createElement('style');
    ui.textContent = `
      .bus-pad { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)) minmax(0,2fr); gap:8px; margin:6px 0 2px; user-select:none; -webkit-user-select:none; }
      .bus-pad button { font:inherit; font-size:12px; letter-spacing:.08em; color:var(--ink); background:var(--bg); border:1px solid var(--edge); border-radius:12px; padding:10px 6px; min-height:46px; cursor:pointer; touch-action:none; }
      .bus-pad button.down { color:var(--ink-hi); border-color:var(--line); }
      .bus-pad button.jump { color:var(--accent-hi); border-color:var(--accent); }
      .bus-pad button.jump.down { background:var(--accent-dim); }
      #stageHolder { height:clamp(220px, calc(100dvh - 290px - var(--navh, 0px)), 62vw) !important; }
      .bus-touch { display:none; }
      @media (max-width: 700px) {
        .bus-keys { display:none; } .bus-touch { display:inline; }
        #stageHolder { height:clamp(260px, calc(100dvh - 330px - var(--navh, 0px)), 125vw) !important; }
        figure { padding:14px 12px; }
      }`;
    document.head.append(ui);
    const hintEl = document.getElementById('hint');
    if (hintEl) hintEl.innerHTML = '<span class="bus-keys">←→ іти · пробіл / ↑ — стрибок · біля автобуса тисни пробіл, щоб втиснутись</span><span class="bus-touch">Тримай ◀ ▶, «Стрибок» — стрибати й втискатися</span>';
    const pad = document.createElement('div');
    pad.className = 'bus-pad';
    pad.innerHTML = '<button tabindex="-1" data-b="left">◀ назад</button><button tabindex="-1" data-b="right">▶ вперед</button><button tabindex="-1" data-b="jump" class="jump">Стрибок</button>';
    stage.parentElement.after(pad);
    pad.addEventListener('mousedown', e => e.preventDefault());
    pad.addEventListener('pointerdown', e => {
      const b = e.target.closest('button[data-b]'); if (!b) return; e.preventDefault(); b.classList.add('down');
      const k = b.dataset.b; if (k === 'left') st.left = true; else if (k === 'right') st.right = true; else jump();
    });
    const release = () => { pad.querySelectorAll('.down').forEach(b => b.classList.remove('down')); st.left = st.right = false; };
    window.addEventListener('pointerup', release); window.addEventListener('pointercancel', release);

    const GAME_KEYS = new Set([' ', 'Enter', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 'd', 'D', 'ц', 'Ц', 'ф', 'Ф', 'в', 'В']);
    const isL = k => ['ArrowLeft', 'a', 'A', 'ф', 'Ф'].includes(k), isR = k => ['ArrowRight', 'd', 'D', 'в', 'В'].includes(k);
    const onKey = e => {
      if (e.metaKey || e.ctrlKey || e.altKey || !GAME_KEYS.has(e.key) || !stage.isConnected) return;
      e.preventDefault(); e.stopImmediatePropagation();
      const down = e.type === 'keydown';
      if (isL(e.key)) st.left = down; else if (isR(e.key)) st.right = down;
      else if (down && !e.repeat) {
        if (st.mode === 'won') { st.level++; st.mode = 'play'; buildLevel(); say(''); }
        else jump();
      }
    };
    window.addEventListener('keydown', onKey, true); window.addEventListener('keyup', onKey, true);
    // the pad's jump button also advances after a won morning
    pad.addEventListener('pointerdown', e => { const b = e.target.closest('button[data-b=jump]'); if (b && st.mode === 'won') { st.level++; st.mode = 'play'; buildLevel(); say(''); } }, true);

    buildLevel(); say('РАНОК. ПОРА НА РОБОТУ');
    return {
      key() { return false; },
      blur() { st.left = st.right = false; },
      unmount() { window.removeEventListener('keydown', onKey, true); window.removeEventListener('keyup', onKey, true); window.removeEventListener('pointerup', release); window.removeEventListener('pointercancel', release); pad.remove(); ui.remove(); },
      demo() {},
    };
  },
});
