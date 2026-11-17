FIGS.push({
  id: 'bar', name: 'Бармен · чотири стійки',
  hint: '↑↓ стійка · ←→ бігти вздовж стійки · тримай пробіл — наливай, відпусти — кидай кухоль',
  aria: 'Ізометрична аркадна гра про бармена: чотири барні стійки, відвідувачі йдуть від дверей до кранів. Наливай кухлі й пускай їх по стійці, лови порожні, збирай чайові.',
  css: `
    [data-fig="bar"] .person { fill: none; stroke: var(--ink-hi); stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
    [data-fig="bar"] .head { fill: var(--body); stroke: var(--ink-hi); stroke-width: 1.3; vector-effect: non-scaling-stroke; }
    [data-fig="bar"] .hat { fill: var(--body); stroke: var(--ink-hi); stroke-width: 1.1; vector-effect: non-scaling-stroke; }
    [data-fig="bar"] .beard { fill: #C4622D; stroke: #EE9A62; stroke-width: 1; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
    [data-fig="bar"] .apron { fill: var(--deck); stroke: var(--ink-hi); stroke-width: 1; vector-effect: non-scaling-stroke; }
    [data-fig="bar"] .mug { fill: var(--glass); stroke: var(--ink-hi); stroke-width: 1; vector-effect: non-scaling-stroke; }
    [data-fig="bar"] .beer { fill: var(--accent); }
    [data-fig="bar"] .foam { fill: var(--accent-hi); }
    [data-fig="bar"] .full { filter: url(#soft); }
    [data-fig="bar"] .coin { fill: var(--accent-hi); stroke: var(--accent); stroke-width: 1; vector-effect: non-scaling-stroke; animation: bar-blink .5s steps(2) infinite; }
    [data-fig="bar"] .shard { fill: none; stroke: var(--ink-hi); stroke-width: 1; vector-effect: non-scaling-stroke; }
    [data-fig="bar"] .neon { fill: var(--accent); font-family: var(--mono); font-weight: 500; letter-spacing: 4px; }
    [data-fig="bar"] .tapg { cursor: pointer; }
    [data-fig="bar"] .lens { fill: var(--detail); transition: fill .1s; }
    [data-fig="bar"] .lens.hot { fill: var(--accent); }
    [data-fig="bar"] .bottle { fill: var(--glass); stroke: var(--line); stroke-width: .8; vector-effect: non-scaling-stroke; }
    [data-fig="bar"] .msg { fill: var(--ink-hi); font-family: var(--mono); font-size: 13px; letter-spacing: 3px; text-anchor: middle;
      paint-order: stroke; stroke: var(--panel); stroke-width: 5px; stroke-linejoin: round; pointer-events: none; }
    @keyframes bar-blink { 50% { opacity: .35; } }
  `,
  mount(stage, api) {
    const ROWS = [44, 96, 148, 200];          // y of each counter (front edge at y + 12)
    const X0 = 30, X1 = 258, TAPX = 252, H = 22;
    const K = api.iso.frame([[0,0,-8],[300,0,-8],[0,250,-8],[300,250,-8],[0,0,92],[300,0,92],[0,250,92],[300,250,40]], 0.04, 4 / 3);
    const { P, TOP, FRONT, SIDE, box, path } = K;
    const f2 = n => n.toFixed(2);
    const NS = 'http://www.w3.org/2000/svg';

    // room: plate, back wall with shelves and a neon sign, left wall with a saloon door per counter
    let svg = box(0,0,-8, 300,250,8, 10) + box(0,0,0, 300,6,92) + box(0,0,0, 6,250,92);
    svg += `<g transform="${FRONT(6,6,92)}">
      <text class="neon" x="150" y="22" font-size="15" text-anchor="middle" filter="url(#glow)">ПАБ ТРАЛЛЕБУС</text>
      ${[40, 62].map(v => `<rect class="detail" x="40" y="${v}" width="220" height="1.4"/>`).join('')}
      ${Array.from({ length: 22 }, (_, i) => { const u = 46 + i * 10 + (i % 3), hh = 9 + (i * 7) % 6, v = (i % 2 ? 62 : 40) - hh;
        return `<rect class="bottle" x="${u}" y="${v}" width="4.2" height="${hh}" rx="1.2"/>`; }).join('')}
    </g>`;
    ROWS.forEach(Y => {
      svg += `<g transform="${SIDE(6, Y + 4, 44)}"><rect class="face recess" x="0" y="0" width="20" height="44" rx="1"/>
        <path class="detail" d="M10 14 L10 36 M1 14 L19 14 M1 36 L19 36"/></g>`;
    });

    // one layer per counter, back to front: customers → counter → things on it → bartender aisle
    ROWS.forEach((Y, r) => {
      svg += `<g id="bar-cust${r}"></g>`;
      svg += box(X0, Y, 0, X1 - X0, 12, H, 2);
      svg += `<g transform="${FRONT(X0, Y + 12, H)}">${api.iso.slits(12, X1 - X0 - 12, 18, 5, H - 3)}</g>`;
      svg += `<g class="tapg" data-row="${r}">${box(TAPX - 3, Y + 3, H, 6, 6, 16, 2)}${box(TAPX - 1, Y + 7, H + 11, 2, 6, 2)}
        <g transform="${FRONT(TAPX - 3, Y + 9, H + 16)}"><rect class="lens" id="bar-lens${r}" x="1.5" y="2.5" width="3" height="3" rx="1.5"/></g></g>`;
      svg += `<g id="bar-items${r}"></g><g id="bar-aisle${r}"></g>`;
    });
    const [mx, my] = P(150, 125, 60);
    svg += `<text id="bar-msg" class="msg" x="${f2(mx)}" y="${f2(my)}"></text>`;
    stage.setAttribute('viewBox', K.viewBox); stage.innerHTML = svg;
    const $ = id => stage.querySelector('#' + id);
    const layer = ROWS.map((_, r) => ({ cust: $('bar-cust' + r), items: $('bar-items' + r), aisle: $('bar-aisle' + r), lens: $('bar-lens' + r) }));
    const msgEl = $('bar-msg');

    // ---------- sprites (billboards in screen space) ----------
    const mk = (parent, html) => { const g = document.createElementNS(NS, 'g'); g.innerHTML = html; parent.appendChild(g); return g; };
    const place = (g, x, y, z, extra = '') => { const [sx, sy] = P(x, y, z); g.setAttribute('transform', `translate(${f2(sx)} ${f2(sy)})${extra}`); };
    const HATS = ['', '<path class="hat" d="M-6 -36 L6 -36 L4 -38.5 L3 -42 L-3 -42 L-4 -38.5 Z"/>', '<path class="hat" d="M-4.5 -36.5 A4.5 4 0 0 1 4.5 -36.5 L7 -36.5 L7 -35.4 L-4.5 -35.4 Z"/>'];
    const custHTML = k => `<g transform="scale(1.35)"><path class="person" d=""/><circle class="head" cx="0" cy="-33" r="4.2"/>${HATS[k % 3]}</g>`;
    const MUG = full => `<g class="${full ? 'full' : ''}"><rect class="mug" x="-3.2" y="-8.5" width="6.4" height="8.5" rx="1"/>
      <path class="mug" style="fill:none" d="M3.2 -6.8 Q6.4 -6.8 6.4 -4.3 Q6.4 -1.8 3.2 -1.8"/>
      ${full ? '<rect class="beer" x="-2.4" y="-6.8" width="4.8" height="6.2"/><rect class="foam" x="-3.6" y="-9.6" width="7.2" height="2.8" rx="1.4"/>' : ''}</g>`;
    const bart = mk(layer[0].aisle, `<g transform="scale(1.4)"><path class="apron" d="M-3.6 -24 L3.6 -24 L4.6 -10 L-4.6 -10 Z"/>
      <path class="person" id="bar-bp" d=""/><circle class="head" cx="0" cy="-33" r="4.2"/>
      <path class="beard" d="M-4.1 -34 Q-4.5 -29.3 -2.3 -27.2 Q0 -25 2.3 -27.2 Q4.5 -29.3 4.1 -34 Q2.6 -31.4 0 -31.6 Q-2.6 -31.4 -4.1 -34 Z"/>
      <path class="person" d="M-2.6 -32.4 Q0 -33.5 2.6 -32.4 M-1 -28.6 L-0.6 -27.4 M1 -28.8 L0.7 -27.6"/>
      <path class="person" d="M-2 -25.4 L2 -24 M-2 -24 L2 -25.4"/></g>`);
    const bartPath = bart.querySelector('#bar-bp');
    const pourMug = mk(layer[0].items, `<g><rect class="mug" x="-3.2" y="-8.5" width="6.4" height="8.5" rx="1"/><rect id="bar-pl" class="beer" x="-2.4" y="-0.6" width="4.8" height="0"/></g>`);
    const pourLvl = pourMug.querySelector('#bar-pl');

    // ---------- sound effects (synthesised) ----------
    let NOISE = null;
    function sfx(kind) {
      try {
        const { ctx, out } = api.audio(), t = ctx.currentTime;
        if (!NOISE) { NOISE = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const c = NOISE.getChannelData(0); for (let i = 0; i < c.length; i++) c[i] = Math.random() * 2 - 1; }
        const env = (n, at, pk, d) => { const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(pk, at + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, at + d); n.connect(g); g.connect(out); };
        const noise = (at, type, f, pk, d, f2v) => { const n = ctx.createBufferSource(); n.buffer = NOISE; const b = ctx.createBiquadFilter(); b.type = type; b.frequency.setValueAtTime(f, at);
          if (f2v) b.frequency.exponentialRampToValueAtTime(f2v, at + d); n.connect(b); env(b, at, pk, d); n.start(at, Math.random() * 0.4); n.stop(at + d + 0.02); };
        const tone = (at, type, f0, f1, pk, d) => { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, at); o.frequency.exponentialRampToValueAtTime(f1, at + d); env(o, at, pk, d); o.start(at); o.stop(at + d + 0.02); };
        if (kind === 'pour') noise(t, 'lowpass', 900, 0.18, 0.45, 2400);
        if (kind === 'slide') noise(t, 'bandpass', 2600, 0.22, 0.32, 700);
        if (kind === 'catch') { tone(t, 'sine', 2093, 2093, 0.16, 0.14); tone(t + 0.04, 'sine', 2637, 2637, 0.12, 0.16); }
        if (kind === 'serve') { tone(t, 'triangle', 523, 523, 0.14, 0.09); tone(t + 0.08, 'triangle', 784, 784, 0.14, 0.12); }
        if (kind === 'coin') { tone(t, 'square', 988, 988, 0.08, 0.07); tone(t + 0.07, 'square', 1319, 1319, 0.08, 0.16); }
        if (kind === 'crash') { noise(t, 'highpass', 2500, 0.5, 0.35); tone(t, 'sine', 180, 60, 0.4, 0.25); }
        if (kind === 'lose') { tone(t, 'sawtooth', 440, 110, 0.12, 0.7); }
      } catch (e) {}
    }

    // ---------- game state ----------
    const st = { mode: 'ready', score: 0, lives: 3, level: 1, served: 0, goal: 12, row: 3, bx: X1 + 4, pour: 0, pouring: false,
                 left: false, right: false, spawnT: 1.2, pause: 0, t: 0, last: 0, cust: [], mugs: [], tips: [], fx: [], best: 0 };
    try { st.best = +localStorage.getItem('bar-best') || 0; } catch (e) {}
    const speed = () => 1 + (st.level - 1) * 0.13;

    function clearAll() {
      [...st.cust, ...st.mugs, ...st.tips, ...st.fx].forEach(o => o.g.remove());
      st.cust = []; st.mugs = []; st.tips = []; st.fx = []; st.pour = 0; st.pouring = false;
    }
    function newGame() { clearAll(); Object.assign(st, { mode: 'play', score: 0, lives: 3, level: 1, served: 0, goal: 12, row: 3, bx: X1 + 4, spawnT: 1.0, pause: 0 }); say(''); }
    function say(s, dur = 0) { msgEl.textContent = s; if (dur) api.after(dur, () => { if (msgEl.textContent === s) msgEl.textContent = ''; }); }
    function lose(why) {
      if (st.mode !== 'play' || st.pause > 0) return;
      sfx('lose'); st.lives--; st.pause = 1.6; say(why);
      if (st.lives <= 0) {
        st.mode = 'over';
        if (st.score > st.best) { st.best = st.score; try { localStorage.setItem('bar-best', st.best); } catch (e) {} }
        say('ЗАКРИТО · пробіл — знову');
      } else api.after(1500, () => { clearAll(); say(''); });
    }
    function spawn() {
      const r = Math.floor(Math.random() * 4);
      if (st.cust.filter(c => c.r === r).length >= 3) return;
      const c = { r, x: X0 - 6, state: 'walk', ph: 0, k: Math.floor(Math.random() * 3), push: 0, drink: 0, g: mk(layer[r].cust, custHTML(Math.floor(Math.random() * 3))) };
      c.p = c.g.querySelector('.person'); c.wait = 0.3 + Math.random() * 0.5;
      st.cust.push(c);
    }
    function sendMug(full, r, x) { const m = { full, r, x, g: mk(layer[r].items, MUG(full)) }; st.mugs.push(m); if (full) sfx('slide'); return m; }
    function shards(r, x, z) {
      const g = mk(layer[r].items, '<path class="shard" d="M-4 -2 L-1 -5 M1 -6 L4 -3 M-2 0 L2 -1 M0 -9 L1 -12"/>');
      const f = { g, t: 0.6 }; place(g, x, ROWS[r] + 6, z); st.fx.push(f); sfx('crash');
    }

    // ---------- controls ----------
    function moveRow(d) { if (st.mode !== 'play') return; st.row = (st.row + d + 4) % 4; st.bx = X1 + 4; st.pour = 0; st.pouring = false; st.autoSend = false; }
    function pourDown() {
      if (st.mode !== 'play') { if (st.mode !== 'play') newGame(); return; }
      if (st.bx < X1 && st.pause <= 0) return;   // only at the tap
      if (st.pouring) return;
      st.pouring = true; st.autoSend = false; st.pour = 0; sfx('pour');
    }
    function pourUp() {
      if (!st.pouring) return;
      if (st.pour >= 1) { st.pouring = false; st.pour = 0; if (st.pause <= 0) sendMug(true, st.row, TAPX - 8); }
      else st.autoSend = true;
    }
    stage.addEventListener('click', e => { const g = e.target.closest('[data-row]'); if (g && st.mode === 'play') { st.row = +g.dataset.row; st.bx = X1 + 4; } });

    // touch / mouse pad under the plate
    const ui = document.createElement('style');
    ui.textContent = `
      .bar-pad { display:grid; grid-template-columns:repeat(4, minmax(0,1fr)) minmax(0,2fr); gap:8px; margin:6px 0 2px; user-select:none; -webkit-user-select:none; }
      .bar-pad button { font:inherit; font-size:12px; letter-spacing:.08em; color:var(--ink); background:var(--bg); border:1px solid var(--edge); border-radius:12px;
        padding:10px 6px; min-height:46px; cursor:pointer; touch-action:none; }
      .bar-pad button:active, .bar-pad button.down { color:var(--ink-hi); border-color:var(--line); }
      .bar-pad button.pour { color:var(--accent-hi); border-color:var(--accent); }
      .bar-pad button.pour.down { background:var(--accent-dim); box-shadow:0 0 14px var(--accent-dim); }
      #stageHolder { height:clamp(220px, calc(100dvh - 290px - var(--navh, 0px)), 62vw) !important; }
      .bar-touch { display:none; }
      @media (max-width: 700px) {
        .bar-keys { display:none; } .bar-touch { display:inline; }
        .bar-pad { grid-template-columns:repeat(4, minmax(0,1fr)); } .bar-pad button.pour { grid-column:1 / -1; min-height:52px; }
        #stageHolder { height:clamp(240px, calc(100dvh - 380px - var(--navh, 0px)), calc(100vw - 20px)) !important; }
        figure { padding:14px 12px; }
      }`;
    document.head.append(ui);
    const hintEl = document.getElementById('hint');
    if (hintEl) hintEl.innerHTML = '<span class="bar-keys">↑↓ стійка · ←→ бігти · тримай пробіл — наливай, відпусти — кидай</span><span class="bar-touch">Тримай «Наливай», відпусти — кухоль поїде</span>';
    const bar = document.createElement('div');
    bar.className = 'bar-pad';
    bar.innerHTML = `<button tabindex="-1" data-b="up">▲ вище</button><button tabindex="-1" data-b="down">▼ нижче</button><button tabindex="-1" data-b="left">◀ бігти</button><button tabindex="-1" data-b="right">▶ до крана</button><button tabindex="-1" data-b="pour" class="pour">Наливай</button>`;
    bar.addEventListener('mousedown', e => e.preventDefault());   // keep keyboard focus on the stage
    stage.parentElement.after(bar);
    bar.addEventListener('pointerdown', e => {
      const b = e.target.closest('button[data-b]'); if (!b) return; e.preventDefault(); b.classList.add('down');
      if (document.activeElement && document.activeElement.closest && document.activeElement.closest('button')) document.activeElement.blur();
      stage.focus({ preventScroll: true });
      const k = b.dataset.b;
      if (k === 'up') moveRow(-1); else if (k === 'down') moveRow(1); else if (k === 'left') st.left = true; else if (k === 'right') st.right = true; else pourDown();
    });
    const release = () => { bar.querySelectorAll('button.down').forEach(b => b.classList.remove('down')); st.left = st.right = false; pourUp(); };
    window.addEventListener('pointerup', release); window.addEventListener('pointercancel', release);

    // ---------- main loop ----------
    api.loop(ts => {
      const dt = st.last ? Math.min(0.05, (ts - st.last) / 1000) : 0; st.last = ts; st.t += dt;
      const playing = st.mode === 'play' && st.pause <= 0, sp = speed();
      if (st.pause > 0) st.pause -= dt;

      if (playing) {
        // bartender runs along the aisle; pouring only works standing at the tap
        if (st.left) { st.bx = Math.max(X0 + 10, st.bx - 120 * dt); st.pouring = false; st.autoSend = false; st.pour = 0; }
        if (st.right) st.bx = Math.min(X1 + 4, st.bx + 120 * dt);
        if (st.pouring) {
          st.pour = Math.min(1, st.pour + dt / 0.5);
          if (st.autoSend && st.pour >= 1) { st.pouring = false; st.autoSend = false; st.pour = 0; sendMug(true, st.row, TAPX - 8); }
        }
        // customers: shuffle forward in steps, get pushed back by a beer, drink, throw the empty
        st.spawnT -= dt;
        if (st.spawnT <= 0) { spawn(); st.spawnT = Math.max(0.9, 2.8 / sp - Math.random() * 0.6); }
        for (const c of st.cust) {
          if (c.state === 'walk') {
            c.wait -= dt;
            if (c.wait <= 0) { c.x += 34 * sp * dt; c.ph += dt * 10; if (c.wait < -0.45) c.wait = 0.5 + Math.random() * 0.6; }
            if (c.x >= TAPX - 10) { lose('ВІДВІДУВАЧ ДІЙШОВ ДО КРАНА'); break; }
          } else if (c.state === 'slide') {
            c.x -= 95 * dt; c.push -= 95 * dt;
            if (c.x < X0 - 4) { c.gone = true; st.score += 50; st.served++; sfx('serve'); }
            else if (c.push <= 0) { c.state = 'drink'; c.drink = 1.1 + Math.random() * 0.6; }
          } else if (c.state === 'drink') {
            c.drink -= dt;
            if (c.drink <= 0) { sendMug(false, c.r, c.x + 6); c.state = 'walk'; c.wait = 0.6; }
          }
        }
        for (const m of st.mugs) {
          if (m.full) {
            m.x -= 115 * dt;
            const c = st.cust.filter(c => c.r === m.r && c.state === 'walk' && !c.gone && c.x <= m.x + 2).sort((a, b) => b.x - a.x)[0];
            if (c && m.x - c.x < 7) {
              m.gone = true; c.state = 'slide'; c.push = 52; sfx('catch');
              if (Math.random() < 0.15) { const tip = { r: m.r, x: c.x + 12, life: 7, g: mk(layer[m.r].items, '<ellipse class="coin" rx="3.4" ry="2" cx="0" cy="-1"/>') }; place(tip.g, tip.x, ROWS[m.r] + 6, H); st.tips.push(tip); }
            } else if (m.x < X0 + 2) { m.gone = true; shards(m.r, X0 + 2, H); lose('КУХОЛЬ ЗЛЕТІВ ЗІ СТІЙКИ'); }
          } else {
            m.x += 70 * sp * dt;
            if (m.r === st.row && m.x >= st.bx - 6 && m.x > st.bx - 14) { m.gone = true; st.score += 100; sfx('catch'); }
            else if (m.x > X1 + 2) { m.gone = true; shards(m.r, X1 + 2, H); lose('ПОРОЖНІЙ КУХОЛЬ РОЗБИВСЯ'); }
          }
        }
        for (const t of st.tips) {
          t.life -= dt;
          if (st.row === t.r && Math.abs(st.bx - t.x) < 8) { t.gone = true; st.score += 250; sfx('coin'); }
          else if (t.life <= 0) t.gone = true;
        }
        if (st.served >= st.goal) {
          st.level++; st.served = 0; st.goal = 12 + (st.level - 1) * 4; st.pause = 1.4;
          say(`РІВЕНЬ ${st.level}`, 1400); api.after(1300, clearAll);
        }
      }
      for (const f of st.fx) { f.t -= dt; f.g.setAttribute('opacity', Math.max(0, f.t / 0.6).toFixed(2)); if (f.t <= 0) f.gone = true; }
      for (const list of ['cust', 'mugs', 'tips', 'fx']) st[list] = st[list].filter(o => { if (o.gone) o.g.remove(); return !o.gone; });

      // ---------- draw ----------
      st.cust.forEach(c => {
        const step = c.state === 'walk' && c.wait <= 0 ? Math.sin(c.ph) * 3 : 0;
        let d = `M${-3 - step} 0 L0 -14 L${3 + step} 0 M0 -14 L0 -28 `;
        if (c.state === 'slide') d += 'M-8 -37 L0 -26 L8 -37';
        else if (c.state === 'drink') d += 'M-6 -20 L0 -26 L5 -31 L3 -35';
        else d += 'M-5 -15 L0 -26 L6 -20 L9 -24';          // reaching for a drink
        c.p.setAttribute('d', d);
        if (c.state === 'drink' && !c.mugEl) { c.mugEl = mk(c.g.firstChild, '<g transform="translate(4 -36) scale(.8)">' + MUG(true) + '</g>'); }
        if (c.state !== 'drink' && c.mugEl) { c.mugEl.remove(); c.mugEl = null; }
        place(c.g, c.x, ROWS[c.r] - 4, 0);
      });
      st.mugs.forEach(m => place(m.g, m.x, ROWS[m.r] + 6, H));
      // bartender + the mug under the tap
      if (bart.parentNode !== layer[st.row].aisle) layer[st.row].aisle.appendChild(bart);
      if (pourMug.parentNode !== layer[st.row].items) layer[st.row].items.appendChild(pourMug);
      const atTap = st.bx >= X1, run = !atTap && (st.left || st.right), leg = run ? Math.sin(st.t * 18) * 4 : 0;
      bartPath.setAttribute('d', `M${-3 - leg} 0 L0 -12 L${3 + leg} 0 M0 -12 L0 -28 ` + (st.pouring ? 'M0 -26 L-6 -32 L-8 -36 M0 -26 L-5 -22' : run ? `M0 -26 L${-6 + leg} -20 M0 -26 L${6 - leg} -21` : 'M0 -26 L-6 -20 M0 -26 L6 -20'));
      place(bart, st.bx, ROWS[st.row] + 22, 0);
      pourMug.style.display = atTap && st.mode === 'play' ? '' : 'none';
      place(pourMug, TAPX, ROWS[st.row] + 10, H);
      pourLvl.setAttribute('y', f2(-0.6 - 6.4 * st.pour)); pourLvl.setAttribute('height', f2(6.4 * st.pour));
      layer.forEach((l, r) => l.lens.classList.toggle('hot', st.pouring && r === st.row));
      api.power(st.pouring);

      const lives = '♥'.repeat(Math.max(0, st.lives)) + '·'.repeat(Math.max(0, 3 - st.lives));
      const ro = st.mode === 'ready' ? `пробіл або «Наливай» — відкрити паб «Траллебус»${st.best ? ' · рекорд ' + st.best : ''}`
               : st.mode === 'over' ? `рахунок ${st.score} · рекорд ${st.best} · пробіл — знову`
               : `рахунок ${st.score} · ${lives} · рівень ${st.level} · обслужено ${st.served}/${st.goal}`;
      if (ro !== st.ro) { api.readout(ro); st.ro = ro; }
    });
    say('ВІДКРИВАЄМО ПАБ');

    // game keys are caught first (capture) so a focused button can never swallow space / Enter / arrows
    const GAME_KEYS = new Set([' ', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 's', 'S', 'a', 'A', 'd', 'D']);
    const onKey = e => {
      if (e.metaKey || e.ctrlKey || e.altKey || !GAME_KEYS.has(e.key) || stage.dataset.fig !== 'bar' || !stage.isConnected) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (e.type === 'keydown') handle.key(e); else handle.keyup(e);
    };
    window.addEventListener('keydown', onKey, true); window.addEventListener('keyup', onKey, true);
    const handle = {
      key(e) {
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { if (!e.repeat) moveRow(-1); return true; }
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { if (!e.repeat) moveRow(1); return true; }
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { st.left = true; return true; }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { st.right = true; return true; }
        if (e.key === ' ' || e.key === 'Enter') { if (!e.repeat) pourDown(); return true; }
        return false;
      },
      keyup(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') st.left = false;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') st.right = false;
        if (e.key === ' ' || e.key === 'Enter') pourUp();
      },
      blur() { st.left = st.right = false; pourUp(); },
      unmount() { window.removeEventListener('keydown', onKey, true); window.removeEventListener('keyup', onKey, true); bar.remove(); ui.remove(); window.removeEventListener('pointerup', release); window.removeEventListener('pointercancel', release); },
      demo() {},
    };
    return handle;
  },
});
