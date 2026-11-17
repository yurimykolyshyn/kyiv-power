FIGS.push({
  id: 'kyiv', name: 'Київ · енергосистема',
  hint: 'Мета: тримай навантаження нижче генерації · рубильники 1–0 або клік · ←→ вибір, пробіл перемикає',
  aria: 'Ізометрична карта Києва з десятьма районами, у кожному свій житловий будинок. Праворуч трансформатор з десятьма рубильниками: вимкнений рубильник знеструмлює свій район.',
  css: `
    [data-fig="kyiv"] { --water:#16436F; --water-edge:#3B7FC4; --water-hi:#6FA8E0; --alarm:#E5484D; --alarm-hi:#FF9A9C; }
    [data-fig="kyiv"].alarm .blade { fill: var(--alarm); stroke: var(--alarm-hi); }
    [data-fig="kyiv"].alarm .bladeg { filter: url(#glow); animation: kyiv-blink .6s steps(2) infinite; }
    [data-fig="kyiv"].alarm .sw .led, [data-fig="kyiv"].alarm #kyiv-warn { fill: var(--alarm); }
    [data-fig="kyiv"].alarm .sw > rect.recess { stroke: var(--alarm); }
    [data-fig="kyiv"] .dist { fill: var(--deck); stroke: var(--line); stroke-width: 1; vector-effect: non-scaling-stroke; stroke-linejoin: round; cursor: pointer; }
    [data-fig="kyiv"] .tint { fill: var(--accent); opacity: 0; pointer-events: none; transition: opacity .35s; }
    [data-fig="kyiv"] .tint.on { opacity: .07; }
    [data-fig="kyiv"] .river { fill: var(--water); stroke: var(--water-edge); stroke-width: 1; vector-effect: non-scaling-stroke; }
    [data-fig="kyiv"] .wave { fill: none; stroke: var(--water-hi); opacity: .7; stroke-width: 1; vector-effect: non-scaling-stroke; stroke-dasharray: 3 4; }
    [data-fig="kyiv"] .win { fill: var(--glass); stroke: var(--detail); stroke-width: .6; vector-effect: non-scaling-stroke; transition: fill .25s; }
    [data-fig="kyiv"] .bld { cursor: pointer; }
    [data-fig="kyiv"] .bld.on .win:not(.nl) { fill: var(--accent); stroke: var(--accent-hi); }
    [data-fig="kyiv"] .bld.on .wins { filter: url(#soft); }
    [data-fig="kyiv"] .dname { fill: var(--ink); font-family: var(--mono); font-size: 6.5px; text-anchor: middle; pointer-events: none; transition: fill .3s;
      paint-order: stroke; stroke: var(--panel); stroke-width: 2.6px; stroke-linejoin: round; }
    [data-fig="kyiv"] .dname.on { fill: var(--ink-hi); }
    @media (max-width: 700px) { [data-fig="kyiv"] .dname { font-size: 10px; stroke-width: 3.4px; } }
    [data-fig="kyiv"] .sw { cursor: pointer; }
    [data-fig="kyiv"] .blade { fill: var(--detail); stroke: var(--line); stroke-width: .8; vector-effect: non-scaling-stroke; }
    [data-fig="kyiv"] .sw.on .blade { fill: var(--accent); stroke: var(--accent-hi); }
    [data-fig="kyiv"] .sw.on .bladeg { filter: url(#soft); }
    [data-fig="kyiv"] .selm { fill: none; stroke: var(--ink-hi); stroke-width: 1; vector-effect: non-scaling-stroke; opacity: 0; }
    [data-fig="kyiv"] .selm.hot { opacity: 1; }
    [data-fig="kyiv"] .lbl { fill: var(--ink); font-family: var(--mono); }
    [data-fig="kyiv"] .over { animation: kyiv-blink .4s steps(2) infinite; }
    @keyframes kyiv-blink { 50% { opacity: .2; } }
  `,
  mount(stage, api) {
    // map coordinates (u = east, v = south) laid straight onto the iso floor: north points up-right
    const Z = 4;
    const M = (u, v) => [u, v];

    // load is split by population (тис. осіб, 1 Jan 2016, the last full per-district table); total demand stays 1170 MW
    const D = [
      { n: 'Оболонський',    s: 'ОБОЛОНЬ',   mw: 128, pop: 315.5, a: [100,26], p: [[55,8],[142,0],[134.5,45],[100,50],[70,55],[55,40]] },
      { n: 'Святошинський',  s: 'СВЯТОШИН',  mw: 138, pop: 340.7, a: [36,92],  p: [[8,45],[55,40],[70,55],[72,95],[60,130],[10,135],[5,90]] },
      { n: 'Подільський',    s: 'ПОДІЛ',     mw: 80, pop: 198.1,  a: [110,72], p: [[70,55],[100,50],[134.5,45],[132,60],[139,95],[110,95],[72,95]] },
      { n: 'Шевченківський', s: 'ШЕВЧЕНКО',  mw: 93, pop: 230.2, a: [92,113], p: [[72,95],[118,95],[118,130],[90,135],[60,130]] },
      { n: 'Печерський',     s: 'ПЕЧЕРСЬК',  mw: 62, pop: 152.0,  a: [134,124],p: [[118,95],[139,95],[142,110],[152,150],[120,150],[118,130]] },
      { n: 'Солом’янський',  s: 'СОЛОМ’ЯН',  mw: 148, pop: 364.8, a: [62,155], p: [[10,135],[60,130],[90,135],[118,130],[120,150],[95,160],[80,180],[30,175]] },
      { n: 'Голосіївський',  s: 'ГОЛОСІЇВ',  mw: 103, pop: 253.1, a: [112,200],p: [[30,175],[80,180],[95,160],[120,150],[152,150],[142,200],[156,240],[90,238],[45,215]] },
      { n: 'Деснянський',    s: 'ДЕСНЯН',    mw: 146, pop: 358.3, a: [196,40], p: [[160,0],[225,10],[235,70],[195,82],[153,75],[150,60]] },
      { n: 'Дніпровський',   s: 'ДНІПРОВ',   mw: 144, pop: 354.7, a: [202,110],p: [[153,75],[195,82],[235,70],[232,140],[190,138],[167.5,140],[160,110]] },
      { n: 'Дарницький',     s: 'ДАРНИЦЯ',   mw: 128, pop: 314.7, a: [202,186],p: [[167.5,140],[190,138],[232,140],[228,225],[174,240],[160,200],[170,150]] },
    ];
    const RW = [[142,0],[132,60],[142,110],[152,150],[142,200],[156,240]];
    const RE = [[160,0],[150,60],[160,110],[170,150],[160,200],[174,240]];
    const SLAB = [[-6,-10],[246,-10],[246,246],[-6,246]];
    const anchors = D.map(d => M(...d.a));

    // the scene is drawn for one of two layouts: wide (yard to the right) or phone portrait (yard below the map)
    const mq = window.matchMedia('(max-width: 700px)');
    let R, loadEl, capEl, warn, feed, feedp, hv;
    function draw(mobile) {
    const SH = mobile ? [-30, 300] : [0, 0];
    const sh = ([x, y, z]) => [x + SH[0], y + SH[1], z];
    const K = api.iso.frame([
      ...SLAB.map(([u, v]) => [...M(u, v), -8]), ...SLAB.map(([u, v]) => [...M(u, v), 0]),
      ...[[292,16,-8],[378,16,-8],[292,90,-8],[378,90,-8],[300,60,100],[360,60,100]].map(sh),
      [...anchors[4], 128], [...anchors[0], 96],
    ], 0.03, mobile ? 1.05 : 16 / 9);   // frame shape follows the layout so the plate is filled
    const { P, TOP, FRONT, SIDE, rect, box, path } = K;
    const [shx, shy] = K.D(SH[0], SH[1], 0), shT = `translate(${shx} ${shy})`;
    const FEED = mobile ? [[285,360,0.4],[262,300,0.4],[222,246,0.4]] : [[300,80,0.4],[272,96,0.4],[246,112,0.4]];

    // polygon helpers in map coords
    const poly = (pts, z, cls, extra = '') => `<path class="${cls}" ${extra} d="${'M' + pts.map(([u, v]) => P(...M(u, v), z).map(n => n.toFixed(2)).join(' ')).join('L')}Z"/>`;
    function extrude(pts, z0, z1) {
      const xy = pts.map(([u, v]) => M(u, v));
      let A = 0; xy.forEach((a, i) => { const b = xy[(i + 1) % xy.length]; A += a[0] * b[1] - b[0] * a[1]; });
      let s = '';
      xy.forEach((a, i) => {
        const b = xy[(i + 1) % xy.length], ex = b[0] - a[0], ey = b[1] - a[1];
        const n = A > 0 ? [ey, -ex] : [-ey, ex];
        if (n[0] + n[1] <= 0) return;
        const q = [P(a[0], a[1], z0), P(b[0], b[1], z0), P(b[0], b[1], z1), P(a[0], a[1], z1)];
        s += `<path class="face" d="M${q.map(p => p.map(v => v.toFixed(2)).join(' ')).join('L')}Z"/>`;
      });
      return s;
    }

    // deterministic "someone is not home" pattern
    let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const wins = (T, u0, v0, cols, rows, du, dv, cw, ch) => {
      let s = `<g transform="${T}">`;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
        s += `<rect class="win${rnd() < 0.18 ? ' nl' : ''}" x="${(u0 + c * du).toFixed(2)}" y="${(v0 + r * dv).toFixed(2)}" width="${cw}" height="${ch}"/>`;
      return s + '</g>';
    };
    const both = (x, y, w, d, h, opts) => {   // same window rhythm on the front and side faces
      const [u0, v0, cf, cs, rows, du, dv, cw, ch] = opts;
      return wins(FRONT(x, y + d, Z + h), u0, v0, cf, rows, du, dv, cw, ch) + wins(SIDE(x + w, y + d, Z + h), u0, v0, cs, rows, du, dv, cw, ch);
    };
    const tri = pts => `<path class="face" d="${path(pts)}Z"/>`;

    // ten different residential buildings; (x, y) is the back corner of the footprint
    const BUILD = [
      (x, y) => box(x,y,Z, 18,18,84) + `<g class="wins">${both(x,y,18,18,84, [2.2,3, 4,4, 15, 3.6,5, 2.4,3])}</g>`
              + rect(FRONT(x+6,y+18,Z+6), 6,6,0,'face recess') + box(x+5,y+5,Z+84, 8,8,5),
      (x, y) => box(x,y,Z, 46,16,22) + `<g class="wins">${wins(FRONT(x,y+16,Z+22), 2.2,1.8, 10,5, 4.4,4.2, 2.6,2.6)}${wins(SIDE(x+46,y+16,Z+22), 2,1.8, 3,5, 4.6,4.2, 2.6,2.6)}</g>`
              + `<g transform="${TOP(x,y,Z+22)}"><rect class="detail" x="1.5" y="1.5" width="43" height="13"/></g>`,
      (x, y) => box(x+6,y+4,Z+18, 3,3,12) + box(x,y,Z, 30,20,20)
              + `<g class="wins">${wins(FRONT(x,y+20,Z+20), 2,2.4, 6,4, 4.8,4.8, 2.8,3.4)}${wins(SIDE(x+30,y+20,Z+20), 2.2,2.4, 4,4, 4.6,4.8, 2.6,3.4)}</g>`
              + tri([[x,y+20,Z+20],[x+30,y+20,Z+20],[x+30,y+10,Z+30],[x,y+10,Z+30]]) + tri([[x+30,y+20,Z+20],[x+30,y,Z+20],[x+30,y+10,Z+30]]),
      (x, y) => box(x,y,Z, 36,22,34) + `<g class="wins">${wins(FRONT(x,y+22,Z+34), 2.4,5, 7,6, 4.8,4.8, 2.8,3.2)}${wins(SIDE(x+36,y+22,Z+34), 2.2,5, 4,6, 5,4.8, 2.8,3.2)}`
              + `${wins(FRONT(x+14,y+15,Z+44), 1.5,2, 2,2, 3,4, 2,2.4)}</g>`
              + rect(FRONT(x,y+22,Z+34), 36,2.6,0,'face recess') + rect(FRONT(x,y+22,Z+4), 36,4,0,'face recess')
              + box(x+14,y+7,Z+34, 8,8,10) + `<path class="wire" d="${path([[x+18,y+11,Z+44],[x+18,y+11,Z+58]])}"/>`,
      (x, y) => box(x,y,Z, 20,20,104) + `<g class="wins">${both(x,y,20,20,104, [1.5,3, 1,1, 25, 0,4.1, 17,2])}</g>`
              + box(x+3,y+3,Z+104, 14,14,6) + `<path class="wire" d="${path([[x+10,y+10,Z+110],[x+10,y+10,Z+124]])}"/>`,
      (x, y) => box(x,y,Z, 42,14,38) + `<g class="wins">${wins(FRONT(x,y+14,Z+38), 1.8,1.8, 9,9, 4.6,4.1, 2.6,2.8)}${wins(SIDE(x+42,y+14,Z+38), 1.5,1.8, 3,9, 4.4,4.1, 2.4,2.8)}</g>`
              + [12.5, 30].map(u => `<g transform="${FRONT(x+u-1,y+14,Z+38)}"><rect class="detail" width="1" height="38"/></g>`).join(''),
      (x, y) => box(x+15,y+4,Z+14, 3,3,9) + box(x,y,Z, 22,18,12)
              + `<g class="wins">${wins(FRONT(x,y+18,Z+12), 2.5,3.5, 2,1, 6.5,0, 4.5,4.5)}${wins(SIDE(x+22,y+18,Z+12), 3,3.5, 2,1, 8,0, 4,4.5)}</g>`
              + rect(FRONT(x+16,y+18,Z+8), 3.6,8,0,'face recess')
              + tri([[x,y+18,Z+12],[x+22,y+18,Z+12],[x+22,y+9,Z+21],[x,y+9,Z+21]]) + tri([[x+22,y+18,Z+12],[x+22,y,Z+12],[x+22,y+9,Z+21]])
              + `<path class="wire" d="${path([[x-6,y+26,Z],[x-6,y+26,Z+8]])}"/><circle class="face" cx="${P(x-6,y+26,Z+13)[0]}" cy="${P(x-6,y+26,Z+13)[1]}" r="6"/>`,
      (x, y) => box(x,y,Z, 44,14,50) + `<g class="wins">${wins(FRONT(x,y+14,Z+50), 1.4,1.8, 10,12, 4.3,4, 2.4,2.6)}${wins(SIDE(x+44,y+14,Z+50), 1.6,1.8, 3,12, 4.4,4, 2.4,2.6)}</g>`
              + box(x+8,y+4,Z+50, 6,6,4) + box(x+30,y+4,Z+50, 6,6,4),
      (x, y) => box(x,y,Z, 16,16,54) + `<g class="wins">${wins(FRONT(x,y+16,Z+54), 1.8,2, 3,13, 4.8,4, 2.6,2.6)}${wins(SIDE(x+16,y+16,Z+54), 1.8,2, 3,4, 4.8,4, 2.6,2.6)}</g>`
              + box(x+16,y,Z, 20,16,36) + `<g class="wins">${wins(FRONT(x+16,y+16,Z+36), 1.6,2, 4,8, 4.8,4.2, 2.6,2.6)}${wins(SIDE(x+36,y+16,Z+36), 1.8,2, 3,8, 4.8,4.2, 2.6,2.6)}</g>`,
      (x, y) => box(x,y,Z, 34,26,8) + `<g class="wins">${wins(FRONT(x,y+26,Z+8), 1.5,2, 1,1, 0,0, 31,4)}${wins(SIDE(x+34,y+26,Z+8), 1.5,2, 1,1, 0,0, 23,4)}</g>`
              + box(x+8,y+4,Z+8, 18,18,66) + `<g class="wins">${both(x+8,y+4,18,18,66, [2,2.5, 4,4, 13, 4,4.9, 2.6,3])}</g>`,
    ];
    const FOOT = [[18,18],[46,16],[30,20],[36,22],[20,20],[42,14],[22,18],[44,14],[36,16],[34,26]];

    // base slab, river, districts (back to front), buildings (back to front)
    let svg = extrude(SLAB, -8, 0) + poly(SLAB, 0, 'face top');
    svg += poly([...RW, ...RE.slice().reverse()], 0.2, 'river');
    svg += `<path class="wave" d="${path([[...M(151,8),0.3],[...M(141,60),0.3],[...M(151,110),0.3],[...M(161,150),0.3],[...M(151,200),0.3],[...M(165,238),0.3]])}"/>`;
    const order = D.map((d, i) => i).sort((a, b) => (anchors[a][0] + anchors[a][1]) - (anchors[b][0] + anchors[b][1]));
    order.forEach(i => { svg += extrude(D[i].p, 0, Z) + poly(D[i].p, Z, 'dist', `data-i="${i}"`) + poly(D[i].p, Z, 'tint', `id="kyiv-t${i}"`); });
    order.forEach(i => {
      const [w, d] = FOOT[i], [ax, ay] = anchors[i];
      const [px, py] = P(ax, ay, Z), f = 0.74;   // shrink about the footprint centre (uniform 3D scale)
      svg += `<g class="bld" id="kyiv-b${i}" data-i="${i}" transform="translate(${px} ${py}) scale(${f}) translate(${-px} ${-py})">${BUILD[i](ax - w/2, ay - d/2)}</g>`;
    });
    D.forEach((d, i) => {
      const [w, dd] = FOOT[i], [sx, sy] = P(anchors[i][0] + w * 0.37, anchors[i][1] + dd * 0.37, Z);
      svg += `<text class="dname" id="kyiv-n${i}" x="${sx.toFixed(1)}" y="${(sy + 8).toFixed(1)}">${d.n}</text>`;
    });

    // transformer yard: pad, tank with insulators, switch cabinet, feeder to the city
    svg += `<g transform="${shT}">${box(292,16,-8, 86,74,8, 4)}</g>`;
    svg += `<path id="kyiv-feed-u" class="wire-under" d="${path(FEED)}"/>`;
    svg += `<path id="kyiv-feed" class="wire" d="${path(FEED)}"/>`;
    svg += `<path id="kyiv-feedp" class="pulse" pathLength="1000" d="${path(FEED)}"/>`;
    svg += `<g transform="${shT}">`;
    svg += box(334,22,0, 36,30,44);
    svg += `<g transform="${SIDE(370,52,44)}">${api.iso.slits(3,27,3, 4,40)}</g>`;
    [0,1,2].forEach(j => {
      const ix = 340 + j * 10;
      svg += box(ix,34,44, 4,4,6) + box(ix+0.5,34.5,50, 3,3,6) + box(ix,34,56, 4,4,2);
    });
    svg += box(300,60,0, 60,22,96);
    [0,1,2].forEach(j => { svg += `<path class="wire" id="kyiv-hv${j}" d="${path([[342 + j*10,36,58],[344 + j*6,50,80],[354 - j*14,68,96]])}"/>`; });
    svg += `<g transform="${SIDE(360,82,96)}">${api.iso.slits(4,18,3.5, 30,60)}
      <path class="face" d="M11 8 L17 19 L5 19 Z"/><path class="lbl" d="M11.6 10.5 L9.2 15 L11.3 15 L10.2 18 L13 13.6 L10.9 13.6 Z"/></g>`;

    let cab = `<g transform="${FRONT(300,82,96)}">
      <text class="lbl" x="4" y="4.6" font-size="3">НАВАНТАЖЕННЯ / ГЕНЕРАЦІЯ</text>
      <rect class="face recess" x="4" y="6" width="52" height="7" rx="1"/>
      <rect id="kyiv-load" class="scr-accent" x="5" y="7" width="0" height="5" rx=".6" filter="url(#soft)"/>
      <rect id="kyiv-cap" class="scr" x="0" y="5" width="1" height="9"/>`;
    D.forEach((d, i) => {
      const cu = 6 + (i % 5) * 12, v0 = i < 5 ? 20 : 58, hv = v0 + 15;
      cab += `<g class="sw" id="kyiv-s${i}" data-i="${i}">
        <rect class="face recess" x="${cu-4.5}" y="${v0}" width="9" height="28" rx="1"/>
        <rect class="led" id="kyiv-c${i}" x="${cu-2.6}" y="${v0+1.4}" width="5.2" height="2.4" rx=".6"/>
        <g class="bladeg" id="kyiv-bl${i}" data-h="${cu} ${hv}">
          <rect class="blade" x="${cu-1}" y="${v0+3.2}" width="2" height="12"/>
          <rect class="blade" x="${cu-3.6}" y="${v0+2.2}" width="7.2" height="2.4" rx="1"/>
        </g>
        <circle class="face" cx="${cu}" cy="${hv}" r="1.5"/>
        <text class="lbl" x="${cu}" y="${v0+32.5}" font-size="2.5" text-anchor="middle">${(i + 1) % 10} ${d.s}</text>
        <rect class="selm" id="kyiv-m${i}" x="${cu-5.6}" y="${v0-1.2}" width="11.2" height="35.6" rx="1.5"/>
      </g>`;
    });
    svg += cab + `<rect id="kyiv-warn" class="led" x="50" y="15.5" width="6" height="2" rx="1"/></g></g>`;

    stage.setAttribute('viewBox', K.viewBox); stage.innerHTML = svg;
    const $ = id => stage.querySelector('#' + id);
    R = D.map((d, i) => ({ sw: $('kyiv-s'+i), c: $('kyiv-c'+i), bl: $('kyiv-bl'+i), m: $('kyiv-m'+i), b: $('kyiv-b'+i), t: $('kyiv-t'+i), n: $('kyiv-n'+i) }));
    loadEl = $('kyiv-load'); capEl = $('kyiv-cap'); warn = $('kyiv-warn'); feed = $('kyiv-feed'); feedp = $('kyiv-feedp');
    hv = [0,1,2].map(j => $('kyiv-hv'+j));
    }
    draw(mq.matches);
    const onMq = e => { draw(e.matches); render(); };
    mq.addEventListener('change', onMq);
    // disclaimer in the page header (free space there, so the plate still fits one screen)
    const note = document.createElement('span');
    note.className = 'kyiv-note';
    note.textContent = 'Генерація і споживання — умовні ігрові цифри · розподіл між районами за населенням (2016)';
    note.style.cssText = 'color:var(--ink);text-transform:none;letter-spacing:.03em;font-size:12px';
    document.querySelector('.top')?.append(note);
    // the goal is the point of the game: lift it out of the hint into a lit chip that turns red on overload
    const goalCss = document.createElement('style');
    goalCss.textContent = `
      .kyiv-goal { display:inline-flex; align-items:center; gap:8px; margin-right:14px; padding:4px 12px; border-radius:999px;
        color:var(--accent-hi); border:1px solid var(--accent); background:var(--accent-dim); box-shadow:0 0 14px var(--accent-dim);
        letter-spacing:.12em; transition:color .2s, border-color .2s, background .2s; }
      .kyiv-goal::before { content:''; width:6px; height:6px; border-radius:50%; background:var(--accent); box-shadow:0 0 8px var(--accent); }
      .kyiv-goal.warn { color:#FF9A9C; border-color:#E5484D; background:rgba(229,72,77,.14); box-shadow:0 0 16px rgba(229,72,77,.35);
        animation:kyiv-goal-blink .6s steps(2) infinite; }
      .kyiv-goal.warn::before { background:#E5484D; box-shadow:0 0 8px #E5484D; }
      @keyframes kyiv-goal-blink { 50% { opacity:.55; } }
      #hint { display:flex; flex-wrap:wrap; align-items:center; gap:6px 0; }
      .kyiv-pad { display:none; }
      .kyiv-touch { display:none; }
      @media (max-width: 700px) {
        #stageHolder { height:clamp(240px, calc(100dvh - 330px - var(--navh, 0px)), calc(100vw - 30px)); }
        figure { padding:14px 12px; }
        .top { gap:4px 12px; }
        .kyiv-note { font-size:10.5px !important; }
        .kyiv-goal { margin-right:0; font-size:11px; letter-spacing:.08em; padding:4px 10px; }
        .kyiv-keys { display:none; }
        .kyiv-touch { display:inline; font-size:11px; }
        .kyiv-pad { display:grid; grid-template-columns:repeat(5, 1fr); gap:6px; margin:4px 0 2px; }
        .kyiv-pad button { font:inherit; font-size:9.5px; letter-spacing:.02em; color:var(--ink); background:var(--bg); border:1px solid var(--edge);
          border-radius:10px; padding:8px 2px 7px; display:grid; justify-items:center; gap:5px; cursor:pointer; touch-action:manipulation; min-height:44px; }
        .kyiv-pad button i { width:18px; height:4px; border-radius:2px; background:var(--detail); }
        .kyiv-pad button.on { color:var(--accent-hi); border-color:var(--accent); }
        .kyiv-pad button.on i { background:var(--accent); box-shadow:0 0 8px var(--accent); }
        .kyiv-pad.alarm button { color:#FF9A9C; border-color:#E5484D; animation:kyiv-goal-blink .6s steps(2) infinite; }
        .kyiv-pad.alarm button i { background:#E5484D; box-shadow:0 0 8px #E5484D; }
      }`;
    document.head.append(goalCss);
    const hintEl = document.getElementById('hint');
    if (hintEl) hintEl.innerHTML = '<span class="kyiv-goal" id="kyiv-goal">Мета: тримай навантаження нижче генерації</span><span class="kyiv-keys">Рубильники 1–0 або клік · ←→ вибір, пробіл перемикає</span><span class="kyiv-touch">Торкайся рубильників або будинків</span>';
    const goalEl = document.getElementById('kyiv-goal');
    // phones: the cabinet switches are too small to tap, so mirror them as a row of touch buttons
    const pad = document.createElement('div');
    pad.className = 'kyiv-pad';
    pad.innerHTML = D.map((d, i) => `<button type="button" tabindex="-1" data-k="${i}"><i></i>${d.s}</button>`).join('');
    pad.addEventListener('click', e => { const b = e.target.closest('button[data-k]'); if (b) toggle(+b.dataset.k); });
    stage.parentElement.after(pad);
    pad.addEventListener('mousedown', e => e.preventDefault());   // pad buttons never take keyboard focus
    const padBtns = [...pad.querySelectorAll('button')];

    const MAXMW = 1400, TOTAL = D.reduce((s, d) => s + d.mw, 0);
    const st = { on: D.map(() => true), sel: 0, cap: 1300, capTo: 1300, over: 0, t: 0, litTime: 0, nextCap: 12, tripped: 0, last: 0 };
    const load = () => D.reduce((s, d, i) => s + (st.on[i] ? d.mw : 0), 0);

    function render() {
      const L = load(), any = st.on.some(Boolean);
      R.forEach((r, i) => {
        const on = st.on[i];
        r.sw.classList.toggle('on', on); r.c.classList.toggle('hot', on);
        r.b.classList.toggle('on', on); r.t.classList.toggle('on', on); r.n.classList.toggle('on', on);
        r.m.classList.toggle('hot', st.sel === i);
        padBtns[i].classList.toggle('on', on);
        const [hx, hy] = r.bl.dataset.h.split(' ');
        r.bl.setAttribute('transform', on ? '' : `rotate(180 ${hx} ${hy})`);
      });
      loadEl.setAttribute('width', (50 * L / MAXMW).toFixed(2));
      capEl.setAttribute('x', (5 + 50 * st.cap / MAXMW).toFixed(2));
      const over = L > st.cap;
      loadEl.classList.toggle('over', over); goalEl?.classList.toggle('warn', over || !!st.alarm); warn.classList.toggle('hot', over); warn.classList.toggle('over', over);
      feed.classList.toggle('hot', any); hv.forEach(w => w.classList.toggle('hot', any));
      stage.classList.toggle('alarm', !!st.alarm); pad.classList.toggle('alarm', !!st.alarm);
      api.power(any);
    }
    function readout() {
      const L = load(), n = st.on.filter(Boolean).length, pct = st.t > 0 ? Math.round(100 * st.litTime / st.t) : 100;
      let s;
      if (st.alarm) s = 'аварія · захист вимкнув усі лінії · увімкни рубильник';
      else if (st.note && st.t < st.note.until && L <= st.cap) s = st.note.txt;
      else if (L > st.cap) s = `перевантаження ${L} / ${Math.round(st.cap)} МВт · ${Math.ceil(5 - st.over)} с до аварії`;
      else s = `${L} / ${Math.round(st.cap)} МВт · ${n}/10 районів · світло ${pct}%`;
      if (s !== st.lastMsg) { api.readout(s); st.lastMsg = s; }
    }
    // synthesized knife-switch sounds: mechanical clack + thump, an arc zap and transformer hum on closing
    let A = null, NOISE = null;
    function snd(kind) {
      try {
        if (!A && kind === 'trip') return;
        A = api.audio();   // cached; also resumes a context that started suspended
        const { ctx, out } = A, t = ctx.currentTime;
        if (!NOISE) {
          NOISE = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
          const ch = NOISE.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
        }
        const env = (node, at, peak, dur) => { const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, at);
          g.gain.exponentialRampToValueAtTime(peak, at + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
          node.connect(g); g.connect(out); return g; };
        const noise = (at, type, f, q, peak, dur) => { const n = ctx.createBufferSource(); n.buffer = NOISE;
          const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q;
          n.connect(b); env(b, at, peak, dur); n.start(at); n.stop(at + dur + 0.02); };
        const tone = (at, type, f0, f1, peak, dur, lp) => { const o = ctx.createOscillator(); o.type = type;
          o.frequency.setValueAtTime(f0, at); o.frequency.exponentialRampToValueAtTime(f1, at + dur);
          let node = o; if (lp) { const b = ctx.createBiquadFilter(); b.type = 'lowpass'; b.frequency.value = lp; o.connect(b); node = b; }
          env(node, at, peak, dur); o.start(at); o.stop(at + dur + 0.02); };
        const clack = (at, f) => { noise(at, 'bandpass', f, 1.4, 0.9, 0.07); tone(at, 'sine', 140, 45, 0.7, 0.12); };
        if (kind === 'on') {
          clack(t, 2600);
          noise(t + 0.012, 'highpass', 3500, 0.7, 0.35, 0.06);          // arc as the blade meets the contacts
          tone(t + 0.02, 'sawtooth', 100, 100, 0.07, 0.45, 420);        // transformer picks up the load
        } else if (kind === 'off') {
          clack(t, 1700);
          tone(t, 'sawtooth', 100, 55, 0.06, 0.3, 380);                  // hum dies away
        } else if (kind === 'trip') {
          [0, 0.05, 0.11, 0.16].forEach((d, j) => clack(t + d, 1400 + j * 300));
          noise(t, 'bandpass', 900, 0.8, 0.6, 0.35);
          tone(t, 'sawtooth', 100, 40, 0.12, 0.6, 500);
        }
      } catch (e) {}
    }
    function toggle(i) {
      st.on[i] = !st.on[i]; st.sel = i; st.alarm = false;
      st.note = { until: st.t + 2.2, txt: `${D[i].n} · ${D[i].pop} тис. жителів · ${D[i].mw} МВт · ${st.on[i] ? 'увімкнено' : 'вимкнено'}` };
      snd(st.on[i] ? 'on' : 'off');
      if (st.on[i]) api.replay(feedp, 'go');
      render(); readout();
    }

    api.loop(ts => {
      if (!st.last) st.last = ts;
      const dt = Math.min(0.1, (ts - st.last) / 1000); st.last = ts;
      st.t += dt; st.litTime += dt * st.on.filter(Boolean).length / 10;
      if (st.tripped > 0) st.tripped -= dt;
      // generation drifts: after a calm start it wanders between ~55% and ~105% of full demand
      st.nextCap -= dt;
      if (st.nextCap <= 0) { st.capTo = 650 + Math.random() * 600; st.nextCap = 7 + Math.random() * 5; }
      st.cap += (st.capTo - st.cap) * Math.min(1, dt * 0.8);
      if (load() > st.cap) {
        st.over += dt;
        if (st.over >= 5) { st.on = st.on.map(() => false); st.over = 0; st.tripped = 3; st.alarm = true; snd('trip'); }
      } else st.over = Math.max(0, st.over - dt * 2);
      render(); readout();
    });

    stage.addEventListener('click', e => {
      const t = e.target.closest('[data-i]');
      if (t && stage.contains(t)) toggle(+t.dataset.i);
    });
    render(); readout();

    // game keys are caught first (capture) so a focused button can never swallow space / Enter / arrows
    const GAME_KEYS = new Set(['0','1','2','3','4','5','6','7','8','9',' ','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown']);
    const onKey = e => {
      if (e.metaKey || e.ctrlKey || e.altKey || !GAME_KEYS.has(e.key) || !stage.isConnected) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (e.type === 'keydown') handle.key(e); else if (handle.keyup) handle.keyup(e);
    };
    window.addEventListener('keydown', onKey, true); window.addEventListener('keyup', onKey, true);
    const handle = {
      key(e) {
        if (/^[0-9]$/.test(e.key)) { toggle((+e.key + 9) % 10); return true; }
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { st.sel = (st.sel + 1) % 10; render(); return true; }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { st.sel = (st.sel + 9) % 10; render(); return true; }
        if (e.key === ' ' || e.key === 'Enter') { toggle(st.sel); return true; }
        return false;
      },
      unmount() { window.removeEventListener('keydown', onKey, true); window.removeEventListener('keyup', onKey, true); note.remove(); goalCss.remove(); pad.remove(); mq.removeEventListener('change', onMq); },
      demo() { api.after(400, () => toggle(4)); api.after(900, () => toggle(7)); },
    };
    return handle;
  },
});
