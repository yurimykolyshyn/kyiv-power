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
    [data-fig="sea"] .hitcell { fill: rgba(229,72,77,.32); stroke: var(--danger); stroke-width: 1.1; vector-effect: non-scaling-stroke; }
    [data-fig="sea"] .hitx { fill: none; stroke: var(--accent-hi); stroke-width: 1.4; stroke-linecap: round; vector-effect: non-scaling-stroke; }
    [data-fig="sea"] .fish { fill: var(--accent); stroke: var(--accent-hi); stroke-width: .8; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
    [data-fig="sea"] .fish.alt { fill: var(--water-hi); stroke: var(--ink-hi); }
    [data-fig="sea"] .eye { fill: var(--panel); }
    [data-fig="sea"] .ripple { fill: none; stroke: var(--water-hi); stroke-width: 1; vector-effect: non-scaling-stroke; }
    [data-fig="sea"] .spark { fill: var(--accent-hi); }
    [data-fig="sea"] .bub { fill: rgba(111,168,224,.12); stroke: var(--water-hi); stroke-width: 1; vector-effect: non-scaling-stroke; }
    [data-fig="sea"] .bubhi { fill: var(--ink-hi); opacity: .8; }
    [data-fig="sea"] .drown { fill: var(--water); opacity: 0; transition: opacity 1.4s; pointer-events: none; }
    [data-fig="sea"] .drown.on { opacity: .42; }
    [data-fig="sea"] .banner { font-family: var(--mono); font-weight: 500; text-anchor: middle; letter-spacing: 6px; pointer-events: none;
      paint-order: stroke; stroke: var(--panel); stroke-width: 6px; stroke-linejoin: round; }
    [data-fig="sea"] .banner.win { fill: var(--accent); }
    [data-fig="sea"] .banner.lose { fill: var(--water-hi); }
    [data-fig="sea"] .banner.sub { font-size: 6.5px; letter-spacing: 2px; stroke-width: 4px; fill: var(--ink-hi); }
    [data-fig="sea"] .pop { animation: sea-pop .7s cubic-bezier(.2,1.4,.4,1) both; transform-box: fill-box; transform-origin: center; }
    @keyframes sea-pop { from { transform: scale(.3); opacity: 0; } }
    [data-fig="sea"] .tk { fill: var(--accent-dim); stroke: var(--ink-hi); stroke-width: .8; vector-effect: non-scaling-stroke; }
    [data-fig="sea"] .tk-br { fill: none; stroke: var(--ink-hi); stroke-width: 1; vector-effect: non-scaling-stroke; }
    [data-fig="sea"] .tgone { opacity: .3; }
    [data-fig="sea"] .tcross { stroke: var(--danger); stroke-width: 1.2; vector-effect: non-scaling-stroke; }
    [data-fig="sea"] .msg { fill: var(--accent-hi); font-family: var(--mono); font-size: 13px; letter-spacing: 3px; text-anchor: middle;
      paint-order: stroke; stroke: var(--panel); stroke-width: 5px; stroke-linejoin: round; pointer-events: none; }
  `,
  mount(stage, api) {
    const N = 10, C = 10, COLS = 'АБВГДЕЖЗИК';
    const MOB = window.matchMedia('(max-width: 700px)').matches;
    // two boards: side by side on wide screens, stacked on phones (the enemy's waters first)
    const ORG = MOB ? { me: [150, 150], foe: [0, 0] } : { me: [0, 0], foe: [124, -124] };
    const pts = [];
    for (const [ox, oy] of Object.values(ORG)) pts.push([ox - 10, oy - 10, -6], [ox + 106, oy - 10, -6], [ox - 10, oy + 106, -6], [ox + 106, oy + 106, -6], [ox - 8, oy - 8, 46]);
    const K = api.iso.frame(pts, 0.015, MOB ? 0.72 : 2.3);   // frame shaped like the two boards, so they fill the plate
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
    const ENDN = { fish: [], bubbles: [], ripples: [], sparks: [] };
    SEA_SAVE.st = st;

    // ---------- static plates ----------
    let svg = '';
    const plate = (ox, oy, title, id) => {
      let s = box(ox - 8, oy - 8, -6, N * C + 16, N * C + 16, 6, 5);
      s += `<g transform="${TOP(ox, oy, 0.1)}"><rect class="water" width="${N * C}" height="${N * C}"/>
        ${Array.from({ length: N + 1 }, (_, i) => `<line class="grid" x1="${i * C}" y1="0" x2="${i * C}" y2="${N * C}"/><line class="grid" x1="0" y1="${i * C}" x2="${N * C}" y2="${i * C}"/>`).join('')}</g>`;
      s += `<g transform="${TOP(ox, oy - 7, 0.2)}">${[...COLS].map((ch, i) => `<text class="coord" x="${i * C + 5}" y="5" font-size="4" text-anchor="middle">${ch}</text>`).join('')}</g>`;
      s += `<g transform="${TOP(ox - 7, oy, 0.2)}">${Array.from({ length: N }, (_, i) => `<text class="coord" x="3.5" y="${i * C + 6.5}" font-size="4" text-anchor="middle">${i + 1}</text>`).join('')}</g>`;
      const [tx, ty] = P(ox - 8, oy - 8, 0);   // centred over the back corner of the plate, inside the frame
      s += `<text id="${id}" class="title" x="${f2(tx)}" y="${f2(ty - 24)}">${title}</text><g id="${id}-tally" data-x="${f2(tx)}" data-y="${f2(ty - 17)}"></g>`;
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
    svg += `<rect id="sea-drown" class="drown" x="0" y="0" width="${vb[2]}" height="${vb[3]}"/><g id="sea-end"></g><g id="sea-banner"></g>`;
    stage.setAttribute('viewBox', K.viewBox); stage.innerHTML = svg;
    const $ = id => stage.querySelector('#' + id);
    const L = { me: $('sea-me'), foe: $('sea-foe') }, curEl = $('sea-cur'), fx = $('sea-fx'), msgEl = $('sea-msg');
    const titles = { me: $('sea-t-me'), foe: $('sea-t-foe') };

    // ---------- drawing one board (rebuilt after every shot; back to front by diagonal) ----------
    const flame = (x, y, z) => { const [sx, sy] = P(x, y, z); return `<g transform="translate(${f2(sx)} ${f2(sy)}) scale(.7)"><path class="flame2" d="M-2.6 0 Q-3 -5 0 -9 Q3 -5 2.6 0 Z"/><path class="flame" d="M-1.8 0 Q-2 -4 0 -7 Q2 -4 1.8 0 Z"/>
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
    function drawTally(side) {
      const g = $(`sea-t-${side}-tally`); if (!g) return;
      const ships = side === 'foe' ? st.foe.ships : (st.phase === 'place' ? [...st.me.ships, ...st.queue.map(n => ({ cells: Array(n), sunk: false, kind: 'ship', ghost: true }))] : st.me.ships);
      const order = ships.slice().sort((a, b) => (b.kind === 'bridge') - (a.kind === 'bridge') || b.cells.length - a.cells.length);
      const U = 4.2, GAP = 3.2, widthOf = sh => sh.kind === 'bridge' ? 4 * U + 2 : sh.cells.length * U;
      const total = order.reduce((w, sh) => w + widthOf(sh), 0) + GAP * (order.length - 1);
      let x = +g.dataset.x - total / 2; const y = +g.dataset.y;
      let out = '';
      for (const sh of order) {
        const w = widthOf(sh), cls = sh.sunk ? 'tgone' : sh.ghost ? 'tgone' : '';
        let icon = '';
        if (sh.kind === 'bridge') icon = `<path class="tk-br" d="M${f2(x)} ${f2(y)} L${f2(x + w)} ${f2(y)} M${f2(x + 2)} ${f2(y)} L${f2(x + 2)} ${f2(y + 3.5)} M${f2(x + w - 2)} ${f2(y)} L${f2(x + w - 2)} ${f2(y + 3.5)} M${f2(x + 4)} ${f2(y)} Q${f2(x + w / 2)} ${f2(y - 4.5)} ${f2(x + w - 4)} ${f2(y)}"/>`;
        else for (let k = 0; k < sh.cells.length; k++) icon += `<rect class="tk" x="${f2(x + k * U)}" y="${f2(y - 1.6)}" width="${f2(U - 0.9)}" height="3.2" rx=".6"/>`;
        if (sh.sunk) icon += `<path class="tcross" d="M${f2(x - 0.6)} ${f2(y + 2.6)} L${f2(x + w + 0.6)} ${f2(y - 2.6)}"/>`;
        out += `<g class="${cls}">${icon}</g>`;
        x += w + GAP;
      }
      g.innerHTML = out;
    }
    function drawBoard(side) {
      drawTally(side);
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
        if (v === 2) {
          const sh = B.ships[B.occ[r][c]], seen = side === 'me' || sh.sunk || sh.kind === 'bridge';
          const z = seen && sh.kind !== 'bridge' ? 3.6 : 0.4;          // a hit bridge span lies in the water
          items.push({ k: c + r + 0.1, s: `<g transform="${TOP(ox + c * C, oy + r * C, z)}"><rect class="hitcell" x="1" y="1" width="${C - 2}" height="${C - 2}" rx="1"/><path class="hitx" d="M3 3 L7 7 M7 3 L3 7"/></g>` });
          items.push({ k: c + r + 0.2, s: flame(ox + c * C + 5, oy + r * C + 5, z) });
        }
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
    function afloat(side) {
      const alive = st[side].ships.filter(s => !s.sunk), parts = [];
      if (alive.some(s => s.kind === 'bridge')) parts.push('міст');
      for (const n of [4, 3, 2, 1]) { const k = alive.filter(s => s.kind !== 'bridge' && s.cells.length === n).length; if (k) parts.push(`${n}-пал ×${k}`); }
      return parts.join(', ');
    }
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
      const ro0 = st.over === 'win' ? 'перемога! · пробіл — нова гра' : st.over === 'lose' ? 'ворог переміг · пробіл — нова гра'
        : `${st.turn === 'me' ? 'ваш постріл' : 'стріляє ворог…'} · знищити ще ${left('foe')}: ${afloat('foe')} · ваш флот ${left('me')}/10${st.bridgeDown ? ' · міст зруйновано' : st.bridgeHit ? ' · міст уражено' : ''}`;
      const ro = ro0;
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
      const bridgeDown = isBridge && res === 'sunk';
      if (isBridge && !bridgeDown) {                 // a span is hit: the bridge shows itself, but it is still standing
        if (!st.bridgeHit) sfx('bridge');
        st.bridgeHit = true;
        say(`КРИМСЬКИЙ МІСТ УРАЖЕНО · ${st.foe.ships[0].hits} з ${st.foe.ships[0].cells.length}`, 2200);
      } else if (bridgeDown) {                       // the last span falls: celebrate, then off to the disco
        st.bridgeHit = true; st.bridgeDown = true; sfx('bridge');
        const disco = FIGS.some(f => f.id === 'disco'), last = left('foe') === 0;
        say(last ? '' : `КРИМСЬКИЙ МІСТ ЗРУЙНОВАНО! · ЛИШИЛОСЬ ${left('foe')}`, 0);
        if (disco) {
          busy = true;
          api.after(last ? 3800 : 2400, () => { busy = false; msgEl.textContent = ''; window.__discoAutoplay = true; location.hash = '#disco'; });
        }
      } else if (res === 'sunk' && left('foe') > 0) {
        const what = st.foe.ships[st.foe.occ[r][c]].kind === 'bridge' ? 'МІСТ ЗРУЙНОВАНО' : `${st.foe.ships[st.foe.occ[r][c]].cells.length}-ПАЛУБНИЙ ПОТОПЛЕНО`;
        say(`${what} · ЛИШИЛОСЬ ${left('foe')}`, 2600);
      }
      if (left('foe') === 0) { st.over = 'win'; sfx('win'); msgEl.textContent = ''; ending('win'); }
      else if (res === 'miss') { st.turn = 'cpu'; api.after(750, cpuTurn); }
      status();
    }
    // computer: for every open cell, count how many placements of the ships still afloat could cover it.
    // With a wounded ship it only counts placements through the wounded cells; it fires at the most likely cell.
    function cpuPick() {
      const B = st.me, sizes = B.ships.filter(sh => !sh.sunk).map(sh => sh.cells.length);
      const at = (c, r) => (c >= 0 && c < N && r >= 0 && r < N) ? B.shots[r][c] : 1;   // off-board counts as a miss
      let wounded = [];
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (B.shots[r][c] === 2 && !B.ships[B.occ[r][c]].sunk) wounded.push([c, r]);
      if (wounded.length) {                          // keep only the wounded ship touching the first wounded cell
        const seen = new Set([wounded[0].join()]), q = [wounded[0]];
        while (q.length) { const [c, r] = q.pop(); for (const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1]]) { const k = [c + dc, r + dr]; if (wounded.some(w => w.join() === k.join()) && !seen.has(k.join())) { seen.add(k.join()); q.push(k); } } }
        wounded = wounded.filter(w => seen.has(w.join()));
      }
      const score = Array.from({ length: N }, () => Array(N).fill(0));
      for (const n of sizes) for (const hor of [true, false]) for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        const cells = Array.from({ length: n }, (_, k) => hor ? [c + k, r] : [c, r + k]);
        if (cells.some(([x, y]) => at(x, y) === 1)) continue;                              // misses and the board edge block it
        if (wounded.length) {
          if (!wounded.every(w => cells.some(p => p[0] === w[0] && p[1] === w[1]))) continue;
        } else if (cells.some(([x, y]) => at(x, y) === 2)) continue;
        for (const [x, y] of cells) if (at(x, y) === 0) score[y][x] += 1;
      }
      let best = -1, pick = [];
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        if (B.shots[r][c]) continue;
        const v = score[r][c] + Math.random() * 0.5;                                       // break ties a little randomly
        if (v > best) { best = v; pick = [c, r]; }
      }
      if (best <= 0.5) { const open = []; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!B.shots[r][c]) open.push([c, r]); return open[Math.floor(Math.random() * open.length)]; }
      return pick;
    }
    function cpuTurn() {
      if (st.over || st.turn !== 'cpu' || !stage.isConnected) return;
      const [c, r] = cpuPick(), res = fire('me', c, r);
      sfx('shot'); sfx(res === 'miss' ? 'miss' : res === 'sunk' ? 'sunk' : 'hit');
      if (res !== 'miss') boom('me', c, r, res === 'sunk');
      if (res === 'sunk' && left('me') > 0) say(`ВОРОГ ПОТОПИВ ${st.me.ships[st.me.occ[r][c]].cells.length}-ПАЛУБНИЙ · У ВАС ${left('me')}`, 2600);
      drawBoard('me');
      if (left('me') === 0) { st.over = 'lose'; sfx('lose'); msgEl.textContent = ''; ending('lose'); }
      else if (res === 'miss') { st.turn = 'me'; drawCursor(); }
      else api.after(650, cpuTurn);
      status();
    }
    // ---------- endings ----------
    const NSs = 'http://www.w3.org/2000/svg', endL = () => $('sea-end');
    const el = (html) => { const g = document.createElementNS(NSs, 'g'); g.innerHTML = html; endL().appendChild(g); return g; };
    const waterPoint = side => { const [ox, oy] = ORG[side]; return P(ox + 4 + Math.random() * 92, oy + 4 + Math.random() * 92, 0); };
    let endKind = '', endT = 0, spawnT = 0;
    function ending(kind) {
      endKind = kind; endT = 0; spawnT = 0;
      for (const k in ENDN) ENDN[k].length = 0;
      endL().innerHTML = ''; $('sea-banner').innerHTML = '';
      $('sea-drown').classList.toggle('on', kind === 'lose');
      if (!kind) return;
      const cx = vb[2] / 2, cy = vb[3] * (MOB ? 0.47 : 0.5);
      $('sea-banner').innerHTML = `<text class="banner ${kind} pop" x="${f2(cx)}" y="${f2(cy)}" font-size="${MOB ? 26 : 34}" filter="url(#glow)">${kind === 'win' ? 'ПЕРЕМОГА!' : 'ФЛОТ НА ДНІ'}</text>
        <text class="banner sub" x="${f2(cx)}" y="${f2(cy + 14)}">${kind === 'win' ? 'ворожий флот і міст — на дні' : 'ворог переміг'} · пробіл — нова гра</text>`;
    }
    function spawnFish() {
      const [x0, y0] = waterPoint('foe'), dir = Math.random() < 0.5 ? -1 : 1, dist = 28 + Math.random() * 30;
      const f = { x0, y0, x1: x0 + dir * dist, y1: y0 + (Math.random() - 0.5) * 10, h: 34 + Math.random() * 36, t: 0, T: 1 + Math.random() * 0.5,
        g: el(`<g><path class="fish${Math.random() < 0.35 ? ' alt' : ''}" d="M6 0 C3 -3.6 -3 -3.6 -5 0 C-3 3.6 3 3.6 6 0 Z M-5 0 L-9.5 -3.4 L-8.2 0 L-9.5 3.4 Z"/><circle class="eye" cx="3.2" cy="-.9" r=".75"/></g>`) };
      ENDN.fish.push(f); ripple(x0, y0);
    }
    function ripple(x, y) { const g = el(`<ellipse class="ripple" cx="${f2(x)}" cy="${f2(y)}" rx="2" ry="1.1"/>`); ENDN.ripples.push({ g, t: 0 }); }
    function spawnBubble(fromBoard) {
      const [x, y] = fromBoard ? waterPoint('me') : [Math.random() * vb[2], vb[3] + 6], r = 1.6 + Math.random() * (fromBoard ? 3 : 6);
      const b = { x, y, r, ph: Math.random() * 6, v: 26 + Math.random() * 40 + r * 3,
        g: el(`<g><circle class="bub" r="${f2(r)}"/><circle class="bubhi" r="${f2(r * 0.28)}" cx="${f2(-r * 0.35)}" cy="${f2(-r * 0.35)}"/></g>`) };
      ENDN.bubbles.push(b);
    }
    api.loop(() => {
      if (!endKind) return;
      const dt = 1 / 60; endT += dt; spawnT -= dt;
      if (spawnT <= 0) {
        if (endKind === 'win') { spawnFish(); if (endT < 5) spawnFish(); spawnT = endT < 5 ? 0.18 : 0.7; }
        else { spawnBubble(false); spawnBubble(Math.random() < 0.5); spawnT = endT < 4 ? 0.06 : 0.16; }
      }
      ENDN.fish = ENDN.fish.filter(f => {
        f.t += dt / f.T; const t = Math.min(1, f.t);
        const x = f.x0 + (f.x1 - f.x0) * t, y = f.y0 + (f.y1 - f.y0) * t - 4 * f.h * t * (1 - t);
        const dx = (f.x1 - f.x0), dy = (f.y1 - f.y0) - 4 * f.h * (1 - 2 * t), ang = Math.atan2(dy, dx) * 180 / Math.PI;
        f.g.setAttribute('transform', `translate(${f2(x)} ${f2(y)}) rotate(${f2(ang)}) scale(1.3)`);
        if (t >= 1) { ripple(x, y); f.g.remove(); return false; }
        if (Math.random() < 0.08) { const s = el(`<circle class="spark" cx="${f2(x)}" cy="${f2(y)}" r=".9"/>`); ENDN.sparks.push({ g: s, t: 0 }); }
        return true;
      });
      ENDN.ripples = ENDN.ripples.filter(r => { r.t += dt / 0.7; const e = r.g.firstChild; e.setAttribute('rx', f2(2 + r.t * 9)); e.setAttribute('ry', f2(1.1 + r.t * 5)); r.g.setAttribute('opacity', f2(1 - r.t)); if (r.t >= 1) { r.g.remove(); return false; } return true; });
      ENDN.sparks = ENDN.sparks.filter(p => { p.t += dt / 0.6; p.g.setAttribute('opacity', f2(1 - p.t)); if (p.t >= 1) { p.g.remove(); return false; } return true; });
      ENDN.bubbles = ENDN.bubbles.filter(b => {
        b.y -= b.v * dt; b.ph += dt * 3; const x = b.x + Math.sin(b.ph) * (2 + b.r * 0.5);
        b.g.setAttribute('transform', `translate(${f2(x)} ${f2(b.y)})`);
        if (b.y < 24) b.g.setAttribute('opacity', f2(Math.max(0, (b.y + 10) / 34)));
        if (b.y < -14) { b.g.remove(); return false; }
        return true;
      });
    });

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
    function newGame() { ending(''); st = fresh(); SEA_SAVE.st = st; msgEl.textContent = ''; drawBoard('me'); drawBoard('foe'); drawCursor(); status(); }

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
