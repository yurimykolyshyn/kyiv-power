// the battle survives a trip to the disco tab and back
const SEA_SAVE = { st: null };
FIGS.push({
  id: 'sea', name: 'Морський бій · міст',
  hint: 'Розстав свій флот (R — повернути), потім клік по ворожій клітинці або ←↑→↓ + пробіл',
  aria: 'Ізометричний морський бій проти компʼютера. У ворожому флоті замість найбільшого корабля — Кримський міст; влучання в нього вмикає дискотеку.',
  css: `
    [data-fig="sea"] { --water:#16436F; --water-edge:#3B7FC4; --water-hi:#6FA8E0; --danger:#E5484D; }
    [data-fig="sea"] .water { fill: var(--water); }
    [data-fig="sea"] .grid { stroke: var(--water-edge); stroke-width: .6; vector-effect: non-scaling-stroke; opacity: .55; }
    [data-fig="sea"] .coord { fill: var(--ink); font-family: var(--mono); }
    [data-fig="sea"] .title { fill: var(--ink-hi); font-family: var(--mono); font-size: 9px; letter-spacing: 2.5px; text-anchor: middle; }
    [data-fig="sea"] .title.turn { fill: var(--accent); }
    [data-fig="sea"] .miss { fill: none; stroke: var(--water-hi); stroke-width: 1; vector-effect: non-scaling-stroke; }
    [data-fig="sea"] .missdot { fill: var(--water-hi); }
    [data-fig="sea"] .new { animation: sea-ring .6s ease-out; transform-box: fill-box; transform-origin: center; }
    @keyframes sea-ring { from { transform: scale(.2); opacity: 0; } 40% { opacity: 1; } }
    [data-fig="sea"] .flame { fill: var(--accent); stroke: var(--accent-hi); stroke-width: .8; vector-effect: non-scaling-stroke; animation: sea-flick .32s steps(2) infinite; }
    [data-fig="sea"] .flame2 { fill: var(--danger); animation: sea-flick .26s steps(2) infinite reverse; }
    @keyframes sea-flick { 50% { opacity: .55; } }
    [data-fig="sea"] .smoke { fill: none; stroke: var(--detail); stroke-width: 1.2; stroke-linecap: round; vector-effect: non-scaling-stroke; }
    [data-fig="sea"] .wreck .face { fill: var(--recess); stroke: var(--detail); }
    [data-fig="sea"] .cellhit { fill: transparent; cursor: crosshair; }
    [data-fig="sea"] .cellme { fill: transparent; cursor: pointer; }
    [data-fig="sea"].battle .cellme, [data-fig="sea"]:not(.battle) .cellhit { pointer-events: none; }
    [data-fig="sea"] .ghost .face { fill: var(--accent-dim); stroke: var(--accent); }
    [data-fig="sea"] .ghost.bad .face { fill: rgba(229,72,77,.15); stroke: var(--danger); }
    [data-fig="sea"] .ghost .wire { stroke: var(--accent); }
    [data-fig="sea"] .cursor { fill: var(--accent-dim); stroke: var(--accent); stroke-width: 1.2; vector-effect: non-scaling-stroke; pointer-events: none; }
    [data-fig="sea"] .deck { stroke: var(--ink-hi); }
    [data-fig="sea"] .arch { fill: none; stroke: var(--ink-hi); stroke-width: 1.2; vector-effect: non-scaling-stroke; }
    [data-fig="sea"] .boom { fill: var(--accent-hi); }
    [data-fig="sea"] .msg { fill: var(--accent-hi); font-family: var(--mono); font-size: 13px; letter-spacing: 3px; text-anchor: middle;
      paint-order: stroke; stroke: var(--panel); stroke-width: 5px; stroke-linejoin: round; pointer-events: none; }
  `,
  mount(stage, api) {
    const N = 10, C = 10, COLS = 'АБВГДЕЖЗИК';
    const MOB = window.matchMedia('(max-width: 700px)').matches;
    // two boards: side by side on wide screens, stacked on phones (the enemy's waters first)
    const ORG = MOB ? { me: [130, 130], foe: [0, 0] } : { me: [0, 0], foe: [150, -150] };
    const pts = [];
    for (const [ox, oy] of Object.values(ORG)) pts.push([ox - 10, oy - 10, -6], [ox + 106, oy - 10, -6], [ox - 10, oy + 106, -6], [ox + 106, oy + 106, -6], [ox, oy, 30]);
    const K = api.iso.frame(pts, 0.05, MOB ? 0.9 : 16 / 9);
    const { P, TOP, FRONT, SIDE, box, path } = K;
    const f2 = n => n.toFixed(2);
    const vb = K.viewBox.split(' ').map(Number);

    // ---------- fleets ----------
    const SIZES = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
    function placeFleet(withBridge) {
      for (let attempt = 0; attempt < 500; attempt++) {
        const occ = Array.from({ length: N }, () => Array(N).fill(-1)), ships = [];
        let ok = true;
        for (let i = 0; i < SIZES.length && ok; i++) {
          const n = SIZES[i]; let placed = false;
          for (let tries = 0; tries < 200 && !placed; tries++) {
            const hor = Math.random() < 0.5, c = Math.floor(Math.random() * (hor ? N - n + 1 : N)), r = Math.floor(Math.random() * (hor ? N : N - n + 1));
            const cells = Array.from({ length: n }, (_, k) => hor ? [c + k, r] : [c, r + k]);
            const free = cells.every(([x, y]) => { for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { const a = x + dx, b = y + dy; if (a >= 0 && a < N && b >= 0 && b < N && occ[b][a] >= 0) return false; } return true; });
            if (!free) continue;
            cells.forEach(([x, y]) => occ[y][x] = i);
            ships.push({ cells, hor, kind: withBridge && i === 0 ? 'bridge' : 'ship', hits: 0, sunk: false });
            placed = true;
          }
          ok = placed;
        }
        if (ok) return { ships, occ, shots: Array.from({ length: N }, () => Array(N).fill(0)) };   // shots: 0 unknown, 1 miss, 2 hit
      }
    }
    const grid = v => Array.from({ length: N }, () => Array(N).fill(v));
    const emptyFleet = () => ({ ships: [], occ: grid(-1), shots: grid(0) });
    const fresh = () => ({ me: emptyFleet(), foe: placeFleet(true), phase: 'place', queue: SIZES.slice(), hor: true, curMe: [0, 0],
                           turn: 'me', started: false, over: '', cur: [4, 4], bridgeHit: false, last: null });
    let st = SEA_SAVE.st && !SEA_SAVE.st.over ? SEA_SAVE.st : fresh();
    if (!st.phase) Object.assign(st, { phase: 'battle', queue: [], hor: true, curMe: [0, 0] });
    SEA_SAVE.st = st;

    // ---------- static plates ----------
    let svg = '';
    const plate = (ox, oy, title, id) => {
      let s = box(ox - 8, oy - 8, -6, N * C + 16, N * C + 16, 6, 5);
      s += `<g transform="${TOP(ox, oy, 0.1)}"><rect class="water" width="${N * C}" height="${N * C}"/>
        ${Array.from({ length: N + 1 }, (_, i) => `<line class="grid" x1="${i * C}" y1="0" x2="${i * C}" y2="${N * C}"/><line class="grid" x1="0" y1="${i * C}" x2="${N * C}" y2="${i * C}"/>`).join('')}</g>`;
      s += `<g transform="${TOP(ox, oy - 7, 0.2)}">${[...COLS].map((ch, i) => `<text class="coord" x="${i * C + 5}" y="5" font-size="4" text-anchor="middle">${ch}</text>`).join('')}</g>`;
      s += `<g transform="${TOP(ox - 7, oy, 0.2)}">${Array.from({ length: N }, (_, i) => `<text class="coord" x="3.5" y="${i * C + 6.5}" font-size="4" text-anchor="middle">${i + 1}</text>`).join('')}</g>`;
      const [tx, ty] = P(ox + 50, oy - 14, 0);
      s += `<text id="${id}" class="title" x="${f2(tx + 34)}" y="${f2(ty - 18)}">${title}</text>`;
      return s;
    };
    svg += plate(...ORG.me, 'ВАШ ФЛОТ', 'sea-t-me') + plate(...ORG.foe, 'ВОРОЖІ ВОДИ', 'sea-t-foe');
    // layers: player board pieces, enemy board pieces, click targets + cursor, fx, banner (order depends on layout depth)
    const layerMe = '<g id="sea-me"></g>', layerFoe = '<g id="sea-foe"></g>';
    svg += MOB ? layerFoe + layerMe : layerMe + layerFoe;
    svg += `<g id="sea-mehits">${Array.from({ length: N * N }, (_, k) => { const c = k % N, r = Math.floor(k / N);
      return `<g transform="${TOP(ORG.me[0] + c * C, ORG.me[1] + r * C, 0.3)}"><rect class="cellme" data-c="${c}" data-r="${r}" width="${C}" height="${C}"/></g>`; }).join('')}</g>`;
    svg += `<g id="sea-hits">${Array.from({ length: N * N }, (_, k) => { const c = k % N, r = Math.floor(k / N);
      return `<g transform="${TOP(ORG.foe[0] + c * C, ORG.foe[1] + r * C, 0.3)}"><rect class="cellhit" data-c="${c}" data-r="${r}" width="${C}" height="${C}"/></g>`; }).join('')}
      <g id="sea-cur"><rect class="cursor" x=".8" y=".8" width="${C - 1.6}" height="${C - 1.6}" rx="1"/></g></g>`;
    svg += `<g id="sea-fx"></g><text id="sea-msg" class="msg" x="${f2(vb[2] / 2)}" y="${f2(vb[3] - 14)}"></text>`;
    stage.setAttribute('viewBox', K.viewBox); stage.innerHTML = svg;
    const $ = id => stage.querySelector('#' + id);
    const L = { me: $('sea-me'), foe: $('sea-foe') }, curEl = $('sea-cur'), fx = $('sea-fx'), msgEl = $('sea-msg');
    const titles = { me: $('sea-t-me'), foe: $('sea-t-foe') };

    // ---------- drawing one board (rebuilt after every shot; back to front by diagonal) ----------
    const flame = (x, y, z) => { const [sx, sy] = P(x, y, z); return `<g transform="translate(${f2(sx)} ${f2(sy)})"><path class="flame2" d="M-2.6 0 Q-3 -5 0 -9 Q3 -5 2.6 0 Z"/><path class="flame" d="M-1.8 0 Q-2 -4 0 -7 Q2 -4 1.8 0 Z"/>
      <path class="smoke" d="M0 -9 Q-3 -13 1 -16 Q4 -19 1 -23"/></g>`; };
    const splash = (x, y, isNew) => `<g transform="${TOP(x, y, 0.4)}"><g class="${isNew ? 'new' : ''}"><circle class="miss" cx="5" cy="5" r="3"/><circle class="missdot" cx="5" cy="5" r=".9"/></g></g>`;
    function shipSVG(ox, oy, sh, wreck, cls = '') {
      const [c0, r0] = sh.cells[0], n = sh.cells.length, x = ox + c0 * C, y = oy + r0 * C;
      const w = sh.hor ? n * C : C, d = sh.hor ? C : n * C;
      let s = box(x + 1.6, y + 1.6, 0.3, w - 3.2, d - 3.2, 3.2, 1.6);
      if (n > 1) { const L2 = n * C * 0.36; s += sh.hor ? box(x + (w - L2) / 2, y + 3.2, 3.5, L2, C - 6.4, 3.2, 1) : box(x + 3.2, y + (d - L2) / 2, 3.5, C - 6.4, L2, 3.2, 1); }
      else s += box(x + 3.6, y + 3.6, 3.5, C - 7.2, C - 7.2, 2.4, 1);
      const [mx, my] = sh.hor ? [x + w / 2, y + C / 2] : [x + C / 2, y + d / 2];
      s += `<path class="wire" d="${path([[mx, my, 6.7], [mx, my, 12]])}"/>`;
      return `<g class="${wreck ? 'wreck' : cls}">${s}</g>`;
    }
    // the bridge: pylons, a deck per span (missing where hit) and the arch over the fairway
    function bridgeSVG(ox, oy, sh, shots) {
      let s = '';
      const n = sh.cells.length;
      sh.cells.forEach(([c, r], k) => {
        const x = ox + c * C, y = oy + r * C, hit = shots[r][c] === 2;
        s += box(x + C / 2 - 1.2, y + C / 2 - 1.2, 0.3, 2.4, 2.4, 9);
        if (!hit) s += sh.hor ? box(x, y + 2.6, 9, C, C - 5.2, 1.8) : box(x + 2.6, y, 9, C - 5.2, C, 1.8);
        else s += box(x + 2, y + 3, 0.3, 5, 4, 1.4, 1);                                   // a span lying in the water
      });
      const [c0, r0] = sh.cells[0], mid = Math.floor(n / 2) - 1, ax = ox + c0 * C, ay = oy + r0 * C;
      const archHit = sh.cells.slice(mid, mid + 2).some(([c, r]) => shots[r][c] === 2);
      if (!archHit) s += sh.hor ? `<g transform="${FRONT(ax + mid * C + 5, ay + C - 2.6, 10.8)}"><path class="arch" d="M0 0 Q10 -14 20 0"/></g>`
                                : `<g transform="${SIDE(ax + C - 2.6, ay + (mid + 2) * C - 5, 10.8)}"><path class="arch" d="M0 0 Q10 -14 20 0"/></g>`;
      return s;
    }
    function drawBoard(side) {
      const B = st[side], [ox, oy] = ORG[side], showAll = side === 'me';
      const items = [];
      B.ships.forEach(sh => {
        const visible = showAll || sh.sunk || (sh.kind === 'bridge' && sh.hits > 0);
        if (!visible) return;
        const [c, r] = sh.cells[0];
        items.push({ k: c + r - 0.5, s: sh.kind === 'bridge' ? bridgeSVG(ox, oy, sh, B.shots) : shipSVG(ox, oy, sh, sh.sunk) });
      });
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        const v = B.shots[r][c], isNew = st.last && st.last.side === side && st.last.c === c && st.last.r === r;
        if (v === 1) items.push({ k: c + r, s: splash(ox + c * C, oy + r * C, isNew) });
        if (v === 2) items.push({ k: c + r + 0.2, s: flame(ox + c * C + 5, oy + r * C + 5, B.occ[r][c] === 0 && side === 'foe' ? 11 : 4) });
      }
      if (side === 'me' && st.phase === 'place' && st.queue.length) {          // the ship you are about to place
        const g = ghostCells(), ok = canPlace(B, g);
        items.push({ k: g[0][0] + g[0][1] - 0.4, s: shipSVG(ox, oy, { cells: g, hor: st.hor }, false, 'ghost' + (ok ? '' : ' bad')) });
      }
      items.sort((a, b) => a.k - b.k);
      L[side].innerHTML = items.map(i => i.s).join('');
    }
    function drawCursor() {
      const [c, r] = st.cur;
      curEl.setAttribute('transform', TOP(ORG.foe[0] + c * C, ORG.foe[1] + r * C, 0.35));
      curEl.style.display = st.phase === 'battle' && st.turn === 'me' && !st.over ? '' : 'none';
      stage.classList.toggle('battle', st.phase === 'battle');
    }
    const left = side => st[side].ships.filter(s => !s.sunk).length;
    function status() {
      const placing = st.phase === 'place';
      titles.me.classList.toggle('turn', placing || (st.turn === 'cpu' && !st.over));
      titles.foe.classList.toggle('turn', !placing && st.turn === 'me' && !st.over);
      bar.classList.toggle('placing', placing);
      bar.querySelector('[data-b=start]').disabled = st.queue.length > 0;
      bar.querySelector('[data-b=fire]').textContent = placing ? 'Поставити' : 'Вогонь';
      if (placing) {
        const n = st.queue[0];
        api.readout(n ? `розстав флот: ${n}-палубний, ${st.hor ? 'горизонтально' : 'вертикально'} · R — повернути · лишилось ${st.queue.length}`
                      : 'флот розставлено · «До бою!» або пробіл');
        return;
      }
      const ro = st.over === 'win' ? 'перемога! · пробіл — нова гра' : st.over === 'lose' ? 'ворог переміг · пробіл — нова гра'
        : `${st.turn === 'me' ? 'ваш постріл' : 'стріляє ворог…'} · ваш флот ${left('me')}/10 · ворожий ${left('foe')}/10${st.bridgeHit ? ' · міст уражено' : ''}`;
      api.readout(ro);
    }
    function say(s, ms = 1800) { msgEl.textContent = s; if (ms) api.after(ms, () => { if (msgEl.textContent === s) msgEl.textContent = ''; }); }
    function boom(side, c, r, big) {
      const [ox, oy] = ORG[side], [sx, sy] = P(ox + c * C + 5, oy + r * C + 5, 4);
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.innerHTML = `<circle class="boom" cx="${f2(sx)}" cy="${f2(sy)}" r="${big ? 10 : 6}" filter="url(#bloom)"/><circle class="boom" cx="${f2(sx)}" cy="${f2(sy)}" r="${big ? 5 : 3}" filter="url(#glow)"/>`;
      fx.appendChild(g); g.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0 }], { duration: big ? 900 : 500, easing: 'ease-out' }).onfinish = () => g.remove();
    }

    // ---------- sound ----------
    let NOISE = null;
    function sfx(kind) {
      try {
        const { ctx, out } = api.audio(), t = ctx.currentTime;
        if (!NOISE) { NOISE = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const ch = NOISE.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
        const env = (n, at, pk, d) => { const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(pk, at + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, at + d); n.connect(g); g.connect(out); };
        const noise = (at, type, f, pk, d) => { const n = ctx.createBufferSource(); n.buffer = NOISE; const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; n.connect(b); env(b, at, pk, d); n.start(at, Math.random() * 0.4); n.stop(at + d + 0.02); };
        const tone = (at, type, f0, f1, pk, d) => { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, at); o.frequency.exponentialRampToValueAtTime(f1, at + d); env(o, at, pk, d); o.start(at); o.stop(at + d + 0.02); };
        if (kind === 'place') tone(t, 'sine', 300, 160, 0.18, 0.12);
        if (kind === 'pick') tone(t, 'sine', 220, 360, 0.12, 0.1);
        if (kind === 'bad') tone(t, 'square', 140, 110, 0.06, 0.12);
        if (kind === 'shot') tone(t, 'sine', 140, 50, 0.3, 0.15);
        if (kind === 'miss') noise(t + 0.25, 'lowpass', 1300, 0.25, 0.5);
        if (kind === 'hit') { noise(t + 0.2, 'lowpass', 800, 0.5, 0.5); tone(t + 0.2, 'sine', 90, 35, 0.4, 0.4); }
        if (kind === 'sunk') { noise(t + 0.2, 'lowpass', 500, 0.6, 0.9); tone(t + 0.2, 'sine', 70, 25, 0.5, 0.8); }
        if (kind === 'bridge') { noise(t + 0.2, 'lowpass', 600, 0.7, 1.1); tone(t + 0.2, 'sine', 80, 22, 0.55, 1); [523, 659, 784, 1047, 1319].forEach((f, i) => tone(t + 0.9 + i * 0.11, 'triangle', f, f, 0.09, 0.25)); }
        if (kind === 'win') [523, 659, 784, 1047].forEach((f, i) => tone(t + i * 0.12, 'triangle', f, f, 0.1, 0.3));
        if (kind === 'lose') tone(t, 'sawtooth', 330, 90, 0.1, 0.9);
      } catch (e) {}
    }

    // ---------- rules ----------
    function fire(side, c, r) {                      // returns 'miss' | 'hit' | 'sunk' | null (already shot)
      const B = st[side];
      if (B.shots[r][c]) return null;
      st.started = true; st.last = { side, c, r };
      const i = B.occ[r][c];
      if (i < 0) { B.shots[r][c] = 1; return 'miss'; }
      B.shots[r][c] = 2; const sh = B.ships[i]; sh.hits++;
      if (sh.hits === sh.cells.length) {
        sh.sunk = true;
        sh.cells.forEach(([x, y]) => { for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { const a = x + dx, b = y + dy; if (a >= 0 && a < N && b >= 0 && b < N && !B.shots[b][a]) B.shots[b][a] = 1; } });
        return 'sunk';
      }
      return 'hit';
    }
    function playerShot(c, r) {
      if (st.phase !== 'battle' || st.turn !== 'me' || st.over || busy) return;
      st.cur = [c, r];
      const res = fire('foe', c, r);
      if (!res) return;
      sfx('shot'); sfx(res === 'miss' ? 'miss' : res === 'sunk' ? 'sunk' : 'hit');
      const isBridge = st.foe.occ[r][c] === 0;
      if (res !== 'miss') boom('foe', c, r, res === 'sunk' || isBridge);
      drawBoard('foe'); drawCursor();
      if (isBridge && !st.bridgeHit) {               // the bridge is hit: celebrate, then off to the disco
        st.bridgeHit = true; sfx('bridge'); say('КРИМСЬКИЙ МІСТ УРАЖЕНО!', 0);
        const disco = FIGS.some(f => f.id === 'disco');
        busy = true;
        api.after(2300, () => {
          busy = false; say(disco ? '' : 'КРИМСЬКИЙ МІСТ УРАЖЕНО!');
          if (disco) { window.__discoAutoplay = true; location.hash = '#disco'; }
        });
      } else if (res === 'sunk') say(st.foe.ships[st.foe.occ[r][c]].kind === 'bridge' ? 'МІСТ ЗРУЙНОВАНО' : 'ПОТОПЛЕНО');
      if (left('foe') === 0) { st.over = 'win'; sfx('win'); say('ПЕРЕМОГА!', 0); }
      else if (res === 'miss') { st.turn = 'cpu'; api.after(750, cpuTurn); }
      status();
    }
    // computer: finish wounded ships along their line, otherwise hunt on a checkerboard
    function cpuPick() {
      const B = st.me, open = (c, r) => c >= 0 && c < N && r >= 0 && r < N && !B.shots[r][c];
      const wounded = [];
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (B.shots[r][c] === 2 && !B.ships[B.occ[r][c]].sunk) wounded.push([c, r]);
      if (wounded.length) {
        let cand = [];
        if (wounded.length > 1) {
          const hor = wounded[0][1] === wounded[1][1], line = wounded.map(p => hor ? p[0] : p[1]), lo = Math.min(...line) - 1, hi = Math.max(...line) + 1;
          cand = hor ? [[lo, wounded[0][1]], [hi, wounded[0][1]]] : [[wounded[0][0], lo], [wounded[0][0], hi]];
        } else { const [c, r] = wounded[0]; cand = [[c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]]; }
        cand = cand.filter(([c, r]) => open(c, r));
        if (cand.length) return cand[Math.floor(Math.random() * cand.length)];
      }
      const bigLeft = B.ships.some(s => !s.sunk && s.cells.length > 1);
      let pool = [];
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (open(c, r) && (!bigLeft || (c + r) % 2 === 0)) pool.push([c, r]);
      if (!pool.length) for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (open(c, r)) pool.push([c, r]);
      return pool[Math.floor(Math.random() * pool.length)];
    }
    function cpuTurn() {
      if (st.over || st.turn !== 'cpu' || !stage.isConnected) return;
      const [c, r] = cpuPick(), res = fire('me', c, r);
      sfx('shot'); sfx(res === 'miss' ? 'miss' : res === 'sunk' ? 'sunk' : 'hit');
      if (res !== 'miss') boom('me', c, r, res === 'sunk');
      drawBoard('me');
      if (left('me') === 0) { st.over = 'lose'; sfx('lose'); say('ФЛОТ ВТРАЧЕНО', 0); }
      else if (res === 'miss') { st.turn = 'me'; drawCursor(); }
      else api.after(650, cpuTurn);
      status();
    }
    // ---------- placement ----------
    const ghostCells = () => { const n = st.queue[0], [c, r] = st.curMe;
      const c0 = st.hor ? Math.min(c, N - n) : c, r0 = st.hor ? r : Math.min(r, N - n);
      return Array.from({ length: n }, (_, k) => st.hor ? [c0 + k, r0] : [c0, r0 + k]); };
    function canPlace(B, cells) {
      return cells.every(([x, y]) => { if (x < 0 || x >= N || y < 0 || y >= N) return false;
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { const a = x + dx, b = y + dy; if (a >= 0 && a < N && b >= 0 && b < N && B.occ[b][a] >= 0) return false; } return true; });
    }
    function reindex(B) { B.occ = grid(-1); B.ships.forEach((sh, i) => sh.cells.forEach(([x, y]) => B.occ[y][x] = i)); }
    function placeOrPick(c, r) {
      if (st.phase !== 'place') return;
      st.curMe = [c, r];
      const B = st.me, i = B.occ[r][c];
      if (i >= 0) {                                   // pick a placed ship back up: it becomes the next one to place
        const sh = B.ships.splice(i, 1)[0]; reindex(B);
        st.queue.unshift(sh.cells.length);
        st.hor = sh.hor; st.curMe = sh.cells[0]; sfx('pick');
      } else if (st.queue.length) {
        const cells = ghostCells();
        if (!canPlace(B, cells)) { sfx('bad'); return; }
        B.ships.push({ cells, hor: st.hor, kind: 'ship', hits: 0, sunk: false }); reindex(B);
        st.queue.shift(); sfx('place');
      } else return startBattle();
      drawBoard('me'); status();
    }
    function rotate() { if (st.phase !== 'place') return; st.hor = !st.hor; drawBoard('me'); status(); }
    function autoPlace() {                             // fill whatever is left at random (start over if it gets stuck)
      if (st.phase !== 'place' || !st.queue.length) return;
      for (let attempt = 0; attempt < 200; attempt++) {
        const B = { ships: st.me.ships.map(s => ({ ...s })), occ: null, shots: st.me.shots }; reindex(B);
        let ok = true;
        for (const n of st.queue) {
          let placed = false;
          for (let t = 0; t < 300 && !placed; t++) {
            const hor = Math.random() < 0.5, c = Math.floor(Math.random() * N), r = Math.floor(Math.random() * N);
            const cells = Array.from({ length: n }, (_, k) => hor ? [c + k, r] : [c, r + k]);
            if (canPlace(B, cells)) { B.ships.push({ cells, hor, kind: 'ship', hits: 0, sunk: false }); reindex(B); placed = true; }
          }
          if (!placed) { ok = false; break; }
        }
        if (ok) { st.me = B; st.queue = []; sfx('place'); drawBoard('me'); status(); return; }
      }
      st.me = placeFleet(false); st.queue = []; drawBoard('me'); status();
    }
    function clearFleet() { if (st.phase !== 'place') return; st.me = emptyFleet(); st.queue = SIZES.slice(); st.hor = true; drawBoard('me'); status(); }
    function startBattle() {
      if (st.phase !== 'place' || st.queue.length) return;
      st.phase = 'battle'; say('ДО БОЮ!'); sfx('place'); drawBoard('me'); drawCursor(); status();
    }
    function newGame() { st = fresh(); SEA_SAVE.st = st; msgEl.textContent = ''; drawBoard('me'); drawBoard('foe'); drawCursor(); status(); }

    let busy = false;

    // ---------- input ----------
    stage.addEventListener('click', e => { const t = e.target.closest('.cellhit'); if (t) playerShot(+t.dataset.c, +t.dataset.r); });
    stage.addEventListener('click', e => { const t = e.target.closest('.cellme'); if (t) placeOrPick(+t.dataset.c, +t.dataset.r); });
    stage.addEventListener('contextmenu', e => { if (st.phase === 'place') { e.preventDefault(); rotate(); } });
    stage.addEventListener('pointermove', e => { const t = e.target.closest('.cellme'); if (t && st.phase === 'place') { const q = [+t.dataset.c, +t.dataset.r]; if (q[0] !== st.curMe[0] || q[1] !== st.curMe[1]) { st.curMe = q; drawBoard('me'); } } });
    stage.addEventListener('pointermove', e => { const t = e.target.closest('.cellhit'); if (t && st.turn === 'me') { st.cur = [+t.dataset.c, +t.dataset.r]; drawCursor(); } });
    const ui = document.createElement('style');
    ui.textContent = `
      .sea-pad { display:flex; flex-wrap:wrap; gap:8px; margin:6px 0 2px; user-select:none; -webkit-user-select:none; }
      .sea-pad button { font:inherit; font-size:12px; letter-spacing:.08em; color:var(--ink); background:var(--bg); border:1px solid var(--edge); border-radius:12px; padding:10px 14px; min-height:44px; cursor:pointer; touch-action:manipulation; }
      .sea-pad button:hover:not(:disabled) { color:var(--ink-hi); border-color:var(--line); }
      .sea-pad button:disabled { opacity:.4; cursor:default; }
      .sea-pad .mob { display:none; }
      .sea-pad .pl { display:none; } .sea-pad.placing .pl { display:inline-block; } .sea-pad.placing .bt { display:none; }
      .sea-pad .go:not(:disabled) { color:var(--accent-hi); border-color:var(--accent); box-shadow:0 0 14px var(--accent-dim); }
      #stageHolder { height:clamp(220px, calc(100dvh - 290px - var(--navh, 0px)), 62vw) !important; }
      @media (max-width: 700px) {
        .sea-pad .mob { display:inline-block; } .sea-pad button { flex:1 1 18%; padding:10px 4px; }
        .sea-keys { display:none; }
        #stageHolder { height:clamp(300px, calc(100dvh - 360px - var(--navh, 0px)), 150vw) !important; }
        figure { padding:14px 12px; }
      }`;
    document.head.append(ui);
    const hintEl = document.getElementById('hint');
    if (hintEl) hintEl.innerHTML = '<span class="sea-keys">Розстановка: клік по своєму полю ставить або піднімає корабель, R / права кнопка — повернути · у бою: клік по ворожій клітинці або ←↑→↓ + пробіл</span>';
    const bar = document.createElement('div');
    bar.className = 'sea-pad';
    bar.innerHTML = `<button tabindex="-1" class="mob" data-b="up">▲</button><button tabindex="-1" class="mob" data-b="down">▼</button><button tabindex="-1" class="mob" data-b="left">◀</button><button tabindex="-1" class="mob" data-b="right">▶</button>
      <button tabindex="-1" class="mob" data-b="fire">Вогонь</button>
      <button tabindex="-1" class="pl" data-b="rotate">⟲ Повернути (R)</button><button tabindex="-1" class="pl" data-b="auto">Розставити решту</button>
      <button tabindex="-1" class="pl" data-b="clear">Очистити</button><button tabindex="-1" class="pl go" data-b="start">До бою!</button>
      <button tabindex="-1" class="bt" data-b="new">Нова гра</button>`;
    stage.parentElement.after(bar);
    bar.addEventListener('mousedown', e => e.preventDefault());
    const clamp = v => Math.max(0, Math.min(N - 1, v));
    const move = (dc, dr) => {
      if (st.phase === 'place') { st.curMe = [clamp(st.curMe[0] + dc), clamp(st.curMe[1] + dr)]; drawBoard('me'); return; }
      st.cur = [clamp(st.cur[0] + dc), clamp(st.cur[1] + dr)]; drawCursor();
    };
    const act = () => st.phase === 'place' ? (st.queue.length ? placeOrPick(...st.curMe) : startBattle()) : st.over ? newGame() : playerShot(...st.cur);
    bar.addEventListener('click', e => {
      const b = e.target.closest('button[data-b]'); if (!b) return;
      ({ up: () => move(0, -1), down: () => move(0, 1), left: () => move(-1, 0), right: () => move(1, 0), fire: act, rotate, auto: autoPlace, clear: clearFleet, start: startBattle, new: newGame })[b.dataset.b]();
    });
    const KEYS = new Set([' ', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'r', 'R', 'к', 'К']);
    const onKey = e => {
      if (e.metaKey || e.ctrlKey || e.altKey || !KEYS.has(e.key) || !stage.isConnected) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (e.type !== 'keydown') return;
      if (e.key === 'ArrowUp') move(0, -1); else if (e.key === 'ArrowDown') move(0, 1);
      else if (e.key === 'ArrowLeft') move(-1, 0); else if (e.key === 'ArrowRight') move(1, 0);
      else if (/^[rRкК]$/.test(e.key)) rotate();
      else if (!e.repeat) act();
    };
    window.addEventListener('keydown', onKey, true); window.addEventListener('keyup', onKey, true);

    drawBoard('me'); drawBoard('foe'); drawCursor(); status();
    if (st.turn === 'cpu' && !st.over) api.after(700, cpuTurn);   // resumed mid-volley
    return {
      key() { return false; },
      unmount() { window.removeEventListener('keydown', onKey, true); window.removeEventListener('keyup', onKey, true); bar.remove(); ui.remove(); },
      demo() {},
    };
  },
});
