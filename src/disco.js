FIGS.push({
  id: 'disco', name: 'Диско · вечірка',
  hint: 'Треки 1–4 або кнопки · пробіл — стоп / старт · L — режим світла',
  aria: 'Ізометрична диско-вечірка: танцпол зі світлом, диско-куля, діджейський пульт з перемикачами треків, колонки і світломузика, що реагує на звук.',
  css: `
    [data-fig="disco"] { --c1: var(--accent); --c2: #FF4FA3; --c3: #3DD6F5; }
    [data-fig="disco"] .k1 { fill: var(--c1); } [data-fig="disco"] .k2 { fill: var(--c2); } [data-fig="disco"] .k3 { fill: var(--c3); }
    [data-fig="disco"] .tile { stroke: none; }
    [data-fig="disco"] .tbase { fill: var(--recess); stroke: var(--detail); stroke-width: .6; vector-effect: non-scaling-stroke; }
    [data-fig="disco"] .spark { fill: var(--ink-hi); }
    [data-fig="disco"] .beam { mix-blend-mode: screen; }
    [data-fig="disco"] .person { fill: none; stroke: var(--ink-hi); stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
    [data-fig="disco"] .cloth { stroke: var(--ink-hi); stroke-width: 1.1; stroke-linejoin: round; vector-effect: non-scaling-stroke; fill-opacity: .42; }
    [data-fig="disco"] .seam { fill: none; stroke: var(--ink-hi); stroke-width: .8; vector-effect: non-scaling-stroke; opacity: .8; }
    [data-fig="disco"] .afro { fill: var(--body); stroke: var(--ink-hi); stroke-width: 1.1; vector-effect: non-scaling-stroke; }
    [data-fig="disco"] .head { fill: var(--body); stroke: var(--ink-hi); stroke-width: 1.3; vector-effect: non-scaling-stroke; }
    [data-fig="disco"] .ball { fill: var(--deck); stroke: var(--ink-hi); stroke-width: 1; vector-effect: non-scaling-stroke; }
    [data-fig="disco"] .facet { fill: none; stroke: var(--line); stroke-width: .6; vector-effect: non-scaling-stroke; opacity: .7; }
    [data-fig="disco"] .glint { fill: var(--ink-hi); }
    [data-fig="disco"] .neon { fill: var(--c2); font-family: var(--mono); font-weight: 500; letter-spacing: 3px; }
    [data-fig="disco"] .neon.off { fill: var(--detail); filter: none; }
    [data-fig="disco"] .pad { fill: var(--recess); stroke: var(--line); stroke-width: .8; vector-effect: non-scaling-stroke; cursor: pointer; transition: fill .15s; }
    [data-fig="disco"] .pad.on { fill: var(--accent); stroke: var(--accent-hi); }
    [data-fig="disco"] .padg { cursor: pointer; }
    [data-fig="disco"] .padg.on { filter: url(#soft); }
    [data-fig="disco"] .lbl { fill: var(--ink); font-family: var(--mono); pointer-events: none; }
    [data-fig="disco"] .vu { fill: var(--recess); }
    [data-fig="disco"] .cone { fill: var(--recess); stroke: var(--line); stroke-width: .8; vector-effect: non-scaling-stroke; }
    [data-fig="disco"] .strobe { fill: var(--ink-hi); pointer-events: none; }
  `,
  mount(stage, api) {
    const BALL = [180, 156, 100];
    const K = api.iso.frame([[0,0,-8],[300,0,-8],[0,240,-8],[300,240,-8],[0,0,124],[300,0,124],[0,240,124],[180,140,232]], 0.04, 4 / 3);
    const { P, TOP, FRONT, SIDE, rect, box, path } = K;
    const f2 = n => n.toFixed(2);

    // room: floor plate, back and left walls with a neon sign and acoustic slats
    let svg = box(0,0,-8, 300,240,8, 10);
    svg += box(0,0,0, 300,6,124) + box(0,0,0, 6,240,124);
    svg += `<g transform="${SIDE(6,240,124)}">${api.iso.slits(20,214,10, 14,108)}</g>`;
    svg += `<g transform="${FRONT(6,6,124)}">${api.iso.slits(14,60,8, 14,108)}${api.iso.slits(250,290,8, 14,108)}
      <text id="disco-neon" class="neon" x="174" y="62" font-size="19" text-anchor="middle" filter="url(#glow)">ДИСКО</text></g>`;

    // dance floor: raised platform with a 7×7 grid of light tiles
    const FX = 110, FY = 86, N = 7, TS = 20;
    svg += box(FX-2,FY-2,0, N*TS+4,N*TS+4,4, 2);
    let tiles = `<g transform="${TOP(FX,FY,4)}">`;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      tiles += `<rect class="tbase" x="${i*TS+1}" y="${j*TS+1}" width="${TS-2}" height="${TS-2}" rx="1.5"/>`;
      tiles += `<rect id="disco-t${i}-${j}" class="tile k1" x="${i*TS+1}" y="${j*TS+1}" width="${TS-2}" height="${TS-2}" rx="1.5" opacity="0"/>`;
    }
    svg += tiles + '</g>';
    // light pools of the PAR beams (on the floor, under the dancers)
    [0,1,2,3].forEach(k => { svg += `<ellipse id="disco-pool${k}" class="${['k1','k2','k3','k1'][k]}" rx="30" ry="17" opacity="0" filter="url(#bloom)"/>`; });
    // mirror-ball reflections, positioned every frame
    svg += `<g id="disco-sparks">${Array.from({ length: 80 }, () => '<circle class="spark" r="1.3"/>').join('')}</g>`;

    // speakers either side of the booth
    const speaker = x => box(x,18,0, 22,22,72) + `<g transform="${FRONT(x,40,72)}">
      <circle class="cone sp-w" cx="11" cy="20" r="8"/><circle class="detail" cx="11" cy="20" r="3"/>
      <circle class="cone sp-w" cx="11" cy="45" r="8"/><circle class="detail" cx="11" cy="45" r="3"/>
      <circle class="cone" cx="11" cy="63" r="3"/></g>`;
    svg += speaker(76);

    // DJ behind the booth (billboard), arms toward the decks
    const [djx, djy] = P(180, 13, 0);
    svg += `<g id="disco-dj" transform="translate(${f2(djx)} ${f2(djy)})"><g transform="scale(1.5)">
      <path class="cloth k1" d="M-3.4 -27 L3.4 -27 L3.2 -14 L-3.2 -14 Z"/><path class="person" d="M-8 -24 L-2.5 -26 L2.5 -26 L8 -24"/>
      <circle class="head" id="disco-djh" cx="0" cy="-33" r="4.2"/>
      <path class="person" d="M-4.8 -33 A4.8 4.8 0 0 1 4.8 -33" style="stroke:var(--accent)"/>
      <rect x="-6" y="-34.5" width="2" height="3.5" rx=".8" class="k1"/><rect x="4" y="-34.5" width="2" height="3.5" rx=".8" class="k1"/>
    </g></g>`;

    // DJ booth: decks + mixer on top, track pads and the light-music console on the front
    svg += box(100,20,0, 160,24,34, 2);
    svg += `<g transform="${TOP(100,20,34)}">
      ${[32,128].map((cx, k) => `<circle class="face recess" cx="${cx}" cy="12" r="10.5"/><g id="disco-plat${k}"><circle class="detail" cx="${cx}" cy="12" r="7"/>
        <line class="we-line" x1="${cx}" y1="12" x2="${cx}" y2="5" style="stroke:var(--ink-hi);stroke-width:1;vector-effect:non-scaling-stroke"/></g>
        <circle class="k1" cx="${cx}" cy="12" r="1.4"/><path class="wire" d="M${cx+13} 3 L${cx+12} 14 L${cx+6} 17"/>`).join('')}
      <rect class="face recess" x="58" y="4" width="44" height="16" rx="1.5"/>
      ${[0,1,2,3].map(k => `<rect class="detail" x="${64+k*9}" y="7" width="1" height="11"/><rect id="disco-fd${k}" class="face" x="${62+k*9}" y="12" width="5" height="2.4" rx=".6"/>`).join('')}
    </g>`;
    const TRACKS = ['ДИСКОТЕКА 77', 'НІЧНИЙ КИЇВ', 'ФАНК-СОДА', 'НЕОНОВИЙ ДНІПРО'];
    let panel = `<g transform="${FRONT(100,44,34)}">
      <text class="lbl" x="6" y="5.5" font-size="3.4" letter-spacing=".6">ТРЕКИ</text>
      <text class="lbl" x="130" y="5.5" font-size="3.4" letter-spacing=".6">СВІТЛОМУЗИКА</text>`;
    const PADS = [...TRACKS.map((t, i) => ({ k: 't' + i, label: `${i + 1} ${t.split(' ')[0]}` })), { k: 'stop', label: 'СТОП' }, { k: 'light', label: 'СВІТЛО' }];
    PADS.forEach((p, i) => {
      const u = 6 + i * 20;
      panel += `<g class="padg" id="disco-p${p.k}" data-pad="${p.k}"><rect class="pad" x="${u}" y="8" width="17" height="11" rx="1.6"/>
        <text class="lbl" x="${u + 8.5}" y="24.5" font-size="2.7" text-anchor="middle">${p.label}</text></g>`;
    });
    ['НЧ','СЧ','ВЧ'].forEach((b, k) => {
      const u = 131 + k * 9;
      panel += `<rect class="vu" x="${u}" y="8" width="6" height="18" rx="1"/><rect id="disco-vu${k}" class="k${k+1}" x="${u}" y="26" width="6" height="0" rx="1" filter="url(#soft)"/>
        <text class="lbl" x="${u + 3}" y="30.5" font-size="2.6" text-anchor="middle">${b}</text>`;
    });
    svg += panel + '</g>';
    svg += speaker(262);

    // dancers (billboards), back to front
    const DANCERS = [[205,140],[150,150],[235,175],[175,190],[132,210],[214,222]];
    const LEGS = '<path class="person" d="M-4 0 L0 -14 L4 0"/>';
    const OUTFIT = [
      c => LEGS + `<path class="cloth ${c}" d="M-3 -27 L3 -27 L6.2 -10.5 L-6.2 -10.5 Z"/><path class="seam" d="M-3.4 -21 L3.4 -21"/>`,
      c => `<path class="cloth ${c}" d="M-3 -14 L3 -14 L5.8 0 L2.4 0 L0 -9 L-2.4 0 L-5.8 0 Z"/><path class="cloth k0" style="fill:var(--body);fill-opacity:1" d="M-3.2 -27 L3.2 -27 L3 -14 L-3 -14 Z"/><path class="seam" d="M-1.6 -27 L0 -24 L1.6 -27"/>`,
      c => `<path class="cloth ${c}" d="M-3.2 -27 L3.2 -27 L3.6 -14 L5 0 L2 0 L0 -10 L-2 0 L-5 0 L-3.6 -14 Z"/><path class="seam" d="M-3.5 -16 L3.5 -16 M0 -27 L0 -16"/>`,
      c => LEGS + `<path class="cloth ${c}" d="M-3.8 -27 L3.8 -27 L4 -12.5 L-4 -12.5 Z"/><path class="seam" d="M-1.8 -27 L0 -20 L1.8 -27 M0 -20 L0 -12.5"/>`,
    ];
    const LOOK = [[0,'k2'],[1,'k3'],[2,'k1'],[3,'k2'],[0,'k3'],[1,'k1']];
    svg += '<g id="disco-crowd">';
    DANCERS.forEach(([x, y], i) => {
      const [o, c] = LOOK[i];
      svg += `<g id="disco-d${i}"><g transform="scale(1.5)">${OUTFIT[o](c)}<path class="person" id="disco-dp${i}" d=""/>
        ${o === 1 ? '<circle class="afro" cx="0" cy="-34" r="6.4"/>' : ''}<circle class="head" id="disco-dh${i}" cx="0" cy="-33" r="4.2"/></g></g>`;
    });
    svg += '</g>';

    // truss with four PAR cans, then the mirror ball on its wire
    svg += box(6,56,168, 284,8,6);
    svg += `<g transform="${FRONT(6,64,174)}">${api.iso.slits(6,280,8, 1,5)}</g>`;
    const LAMPS = [110, 155, 205, 250];
    LAMPS.forEach((lx, k) => {
      svg += box(lx-5,54,150, 10,12,18, 3);
      svg += `<g transform="${FRONT(lx-5,66,166)}"><circle id="disco-lens${k}" class="${['k1','k2','k3','k1'][k]}" cx="5" cy="9" r="3.6" opacity=".15" filter="url(#glow)"/></g>`;
    });
    svg += `<path class="wire" d="${path([[BALL[0],BALL[1],232],[BALL[0],BALL[1],BALL[2]+14]])}"/>`;
    const [bx, by] = P(...BALL);
    svg += `<defs><clipPath id="disco-clip"><circle cx="${f2(bx)}" cy="${f2(by)}" r="14"/></clipPath></defs>
      <circle class="ball" cx="${f2(bx)}" cy="${f2(by)}" r="14"/>
      <g clip-path="url(#disco-clip)"><g id="disco-mer"></g>
        ${[-10.5,-7,-3.5,0,3.5,7,10.5].map(dy => `<line class="facet" x1="${f2(bx-15)}" x2="${f2(bx+15)}" y1="${f2(by+dy)}" y2="${f2(by+dy)}"/>`).join('')}
        <g id="disco-glints">${Array.from({ length: 12 }, () => '<rect class="glint" width="2.6" height="2.6" opacity="0"/>').join('')}</g></g>`;

    // light beams last, blended over everything
    LAMPS.forEach((lx, k) => { svg += `<path id="disco-beam${k}" class="beam ${['k1','k2','k3','k1'][k]}" opacity="0" d=""/>`; });
    const vb = K.viewBox.split(' ').map(Number);
    svg += `<rect id="disco-strobe" class="strobe" x="0" y="0" width="${vb[2]}" height="${vb[3]}" opacity="0"/>`;

    stage.setAttribute('viewBox', K.viewBox); stage.innerHTML = svg;
    const $ = id => stage.querySelector('#' + id);
    const tilesEl = []; for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) tilesEl.push({ i, j, el: $(`disco-t${i}-${j}`) });
    const sparks = [...stage.querySelectorAll('#disco-sparks circle')];
    const glints = [...stage.querySelectorAll('#disco-glints rect')];
    const mer = $('disco-mer'), neon = $('disco-neon'), strobe = $('disco-strobe'), dj = $('disco-dj');
    const plat = [0,1].map(k => $('disco-plat' + k)), fader = [0,1,2,3].map(k => $('disco-fd' + k));
    const vu = [0,1,2].map(k => $('disco-vu' + k)), cones = [...stage.querySelectorAll('.sp-w')];
    const beams = [0,1,2,3].map(k => $('disco-beam' + k)), pools = [0,1,2,3].map(k => $('disco-pool' + k)), lens = [0,1,2,3].map(k => $('disco-lens' + k));
    // dancers live on the tile grid (rows 2–6, so nobody blocks the booth) and hop between tiles
    const tileC = (i, j) => [FX + i * TS + TS / 2, FY + j * TS + TS / 2];
    const dancers = DANCERS.map(([x, y], i) => {
      const tile = [Math.min(N - 1, Math.floor((x - FX) / TS)), Math.max(2, Math.min(N - 1, Math.floor((y - FY) / TS)))];
      return { g: $('disco-d' + i), p: $('disco-dp' + i), h: $('disco-dh' + i), tile, w: tileC(...tile), hop: 0, mv: null, lastStep: -9, col: 1, ph: i % 3 };
    });
    const crowd = $('disco-crowd'), flashT = {};
    let crowdOrder = '';
    const djHead = $('disco-djh');
    // a head takes the colour of the light that hits it (nearest beam pool), brightness follows that beam
    const paintHead = (el, col, a) => {
      if (a < 0.05) { el.style.fill = ''; el.style.fillOpacity = ''; el.removeAttribute('filter'); return; }
      el.style.fill = `var(--c${col})`; el.style.fillOpacity = (0.35 + 0.65 * a).toFixed(3); el.setAttribute('filter', 'url(#soft)');
    };
    const padEls = Object.fromEntries(PADS.map(p => [p.k, $('disco-p' + p.k)]));

    // ---------- HTML controls under the plate (big, touchable) ----------
    const ui = document.createElement('style');
    ui.textContent = `
      .disco-pad { display:grid; grid-template-columns:repeat(6, minmax(0,1fr)); gap:8px; margin:6px 0 2px; }
      .disco-pad button { font:inherit; font-size:11px; letter-spacing:.06em; color:var(--ink); background:var(--bg); border:1px solid var(--edge);
        border-radius:12px; padding:9px 6px; cursor:pointer; touch-action:manipulation; min-height:44px; display:grid; gap:4px; justify-items:center; }
      .disco-pad button i { width:20px; height:4px; border-radius:2px; background:var(--detail); }
      .disco-pad button:hover { color:var(--ink-hi); }
      .disco-pad button.on { color:var(--accent-hi); border-color:var(--accent); }
      .disco-pad button.on i { background:var(--accent); box-shadow:0 0 8px var(--accent); }
      #stageHolder { height:clamp(220px, calc(100dvh - 290px - var(--navh, 0px)), 62vw) !important; }
      .disco-touch { display:none; }
      @media (max-width: 700px) {
        .disco-keys { display:none; } .disco-touch { display:inline; }
        .disco-pad { grid-template-columns:repeat(3, minmax(0,1fr)); }
        #stageHolder { height:clamp(240px, calc(100dvh - 360px - var(--navh, 0px)), calc(100vw - 20px)) !important; }
        figure { padding:14px 12px; }
      }`;
    document.head.append(ui);
    const hintEl = document.getElementById('hint');
    if (hintEl) hintEl.innerHTML = '<span class="disco-keys">Треки 1–4 або кнопки · пробіл — стоп / старт · L — режим світла</span><span class="disco-touch">Обери трек кнопкою — і на танцпол</span>';
    const bar = document.createElement('div');
    bar.className = 'disco-pad';
    const LABELS = { t0: '1 · Дискотека 77', t1: '2 · Нічний Київ', t2: '3 · Фанк-сода', t3: '4 · Неоновий Дніпро', stop: '■ Стоп', light: 'Світло' };
    bar.innerHTML = PADS.map(p => `<button type="button" tabindex="-1" data-pad="${p.k}"><i></i><span>${LABELS[p.k]}</span></button>`).join('');
    stage.parentElement.after(bar);
    bar.addEventListener('mousedown', e => e.preventDefault());   // pad buttons never take keyboard focus
    const btns = Object.fromEntries([...bar.querySelectorAll('button')].map(b => [b.dataset.pad, b]));

    // ---------- music: four original patterns synthesised with WebAudio ----------
    const hz = m => 440 * 2 ** ((m - 69) / 12);
    let A = null, mix = null, NOISE = null;
    function audio() {
      A = api.audio();
      if (!mix) {
        const { ctx, out } = A;
        mix = ctx.createGain(); mix.gain.value = 0.55;
        const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
        mix.connect(comp); comp.connect(out);
        NOISE = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const ch = NOISE.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
      }
      return A;
    }
    const I = {
      env(node, t, peak, dur, attack = 0.003) {
        const g = A.ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        node.connect(g); g.connect(mix); return g;
      },
      kick(t, v = 1) {
        const o = A.ctx.createOscillator(); o.type = 'sine';
        o.frequency.setValueAtTime(155, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.11);
        I.env(o, t, 0.95 * v, 0.34); o.start(t); o.stop(t + 0.36);
      },
      noise(t, type, f, q, peak, dur) {
        const n = A.ctx.createBufferSource(); n.buffer = NOISE;
        const b = A.ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q;
        n.connect(b); I.env(b, t, peak, dur, 0.001); n.start(t, Math.random() * 0.5); n.stop(t + dur + 0.02);
      },
      hat(t, open = false, v = 1) { I.noise(t, 'highpass', 7600, 0.7, (open ? 0.16 : 0.11) * v, open ? 0.2 : 0.035); },
      clap(t, v = 1) { [0, 0.011, 0.023].forEach(d => I.noise(t + d, 'bandpass', 1500, 0.9, 0.42 * v, 0.11)); },
      snare(t, v = 1) {
        I.noise(t, 'bandpass', 1900, 0.8, 0.38 * v, 0.16);
        const o = A.ctx.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(200, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.1);
        I.env(o, t, 0.25 * v, 0.12); o.start(t); o.stop(t + 0.14);
      },
      bass(t, m, dur, type = 'sawtooth', cut = 700) {
        const o = A.ctx.createOscillator(); o.type = type; o.frequency.value = hz(m);
        const f = A.ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 6;
        f.frequency.setValueAtTime(cut * 2.4, t); f.frequency.exponentialRampToValueAtTime(cut * 0.6, t + dur);
        o.connect(f); I.env(f, t, 0.32, dur); o.start(t); o.stop(t + dur + 0.02);
      },
      chord(t, ms, dur, v = 0.06, type = 'sawtooth', cut = 2400) {
        const f = A.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cut;
        I.env(f, t, v, dur, 0.006);
        ms.forEach(m => [-7, 7].forEach(dt => { const o = A.ctx.createOscillator(); o.type = type; o.frequency.value = hz(m); o.detune.value = dt;
          o.connect(f); o.start(t); o.stop(t + dur + 0.02); }));
      },
      lead(t, m, dur, v = 0.05) {
        const o = A.ctx.createOscillator(); o.type = 'square'; o.frequency.value = hz(m);
        const f = A.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2600;
        o.connect(f); I.env(f, t, v, dur); o.start(t); o.stop(t + dur + 0.02);
      },
    };
    const minor = r => [r, r + 3, r + 7], major = r => [r, r + 4, r + 7];
    const SONGS = [
      { name: 'Дискотека 77', bpm: 120, play(s, b, t, d16) {      // four-on-the-floor, octave bass, offbeat strings
          const R = [45, 50, 43, 48][b], C = [minor(57), minor(62), major(55), major(60)][b];
          if (s % 4 === 0) I.kick(t);
          if (s === 4 || s === 12) I.clap(t);
          if (s % 4 === 2) I.hat(t, true); else if (s % 2) I.hat(t, false, 0.6);
          if (s % 2 === 0) I.bass(t, s % 4 === 0 ? R : R + 12, d16 * 1.6);
          if (s % 4 === 2) I.chord(t, C, d16 * 1.4);
        } },
      { name: 'Нічний Київ', bpm: 124, play(s, b, t, d16) {       // house: 16th hats, offbeat bass, syncopated stabs
          const R = [41, 37, 44, 39][b], C = [minor(65), major(61), major(60), major(63)][b];
          if (s % 4 === 0) I.kick(t);
          if (s === 4 || s === 12) I.clap(t, 0.9);
          I.hat(t, s % 4 === 2, s % 4 === 2 ? 1 : 0.45);
          if (s % 4 === 2) I.bass(t, R, d16 * 1.8, 'square', 420);
          if (s === 11) I.bass(t, R + 12, d16, 'square', 420);
          if (s === 3 || s === 10) I.chord(t, C, d16 * 2.2, 0.075, 'sawtooth', 1700);
        } },
      { name: 'Фанк-сода', bpm: 104, play(s, b, t, d16) {         // syncopated kick, slap riff, chicken-scratch
          const o = [0, 0, 5, 7][b];
          if (s === 0 || s === 7 || s === 10) I.kick(t);
          if (s === 4 || s === 12) I.snare(t); if (s === 9 || s === 15) I.snare(t, 0.25);
          I.hat(t, false, s % 2 ? 0.45 : 0.8);
          const riff = { 0: 40, 3: 40, 6: 43, 7: 45, 10: 52, 12: 50, 14: 47 };
          if (riff[s]) I.bass(t, riff[s] + o, d16 * 0.9, 'square', 800);
          if ([2, 6, 11, 14].includes(s)) I.chord(t, [64 + o, 68 + o, 74 + o], d16 * 0.5, 0.05, 'square', 2200);
        } },
      { name: 'Неоновий Дніпро', bpm: 100, play(s, b, t, d16) {   // synthwave: half-time beat, pulsing bass, arpeggio
          const R = [45, 41, 48, 43][b], C = b === 0 ? minor(R + 12) : major(R + 12);
          if (s === 0 || s === 8 || s === 10) I.kick(t);
          if (s === 4 || s === 12) I.snare(t, 1.1);
          if (s % 2 === 0) I.hat(t, false, 0.5);
          if (s % 2 === 0) I.bass(t, R, d16 * 1.7, 'sawtooth', 380);
          const arp = [C[0] + 12, C[1] + 12, C[2] + 12, C[0] + 24];
          I.lead(t, arp[s % 4], d16 * 0.9);
          if (s === 0) I.chord(t, C, d16 * 15, 0.035, 'sawtooth', 1200);
        } },
    ];
    const st = { track: -1, last: 0, step: 0, next: 0, light: 0, beatT: -9, beats: 0, rot: 0, t: 0, lastTs: 0,
                 low: 0, mid: 0, high: 0, beatQ: [], lastTrack: 0 };
    const MODES = ['музика', 'стробо', 'вимк'];

    api.every(25, () => {                                         // look-ahead sequencer
      if (st.track < 0 || !A) return;
      const song = SONGS[st.track], d16 = 60 / song.bpm / 4, ctx = A.ctx;
      while (st.next < ctx.currentTime + 0.12) {
        const s = st.step % 16, b = (st.step >> 4) % 4;
        try { song.play(s, b, st.next, d16); } catch (e) {}
        if (s % 4 === 0) st.beatQ.push(st.next);
        st.next += d16; st.step = (st.step + 1) % 64;
      }
    });

    function play(i) {
      audio();
      st.track = i; st.lastTrack = i; st.step = 0; st.beatQ = [];
      st.next = A.ctx.currentTime + 0.05;
      ui_(); readout();
    }
    function stop() { st.track = -1; st.beatQ = []; ui_(); readout(); }
    function pad(k) {
      if (k === 'stop') { st.track >= 0 ? stop() : play(st.lastTrack); return; }
      if (k === 'light') { st.light = (st.light + 1) % 3; ui_(); readout(); return; }
      const i = +k.slice(1); st.track === i ? stop() : play(i);
    }
    function ui_() {
      PADS.forEach(p => {
        const on = p.k === 'stop' ? st.track < 0 : p.k === 'light' ? st.light !== 2 : st.track === +p.k.slice(1);
        padEls[p.k].classList.toggle('on', on); padEls[p.k].querySelector('.pad').classList.toggle('on', on);
        btns[p.k].classList.toggle('on', on);
      });
      btns.light.querySelector('span').textContent = 'Світло: ' + MODES[st.light];
      btns.stop.querySelector('span').textContent = st.track >= 0 ? '■ Стоп' : '▶ Старт';
      api.power(st.track >= 0 && st.light !== 2);
    }
    function readout() {
      api.readout(st.track >= 0 ? `▶ ${SONGS[st.track].name} · ${SONGS[st.track].bpm} bpm · світло: ${MODES[st.light]}`
                                : `тиша · обери трек 1–4 · світло: ${MODES[st.light]}`);
    }

    stage.addEventListener('click', e => { const g = e.target.closest('[data-pad]'); if (g) pad(g.dataset.pad); });
    bar.addEventListener('click', e => { const b = e.target.closest('button[data-pad]'); if (b) pad(b.dataset.pad); });

    // ---------- light show, driven by the analyser and the sequencer's beat times ----------
    const POSES = [[[-8,-37],[8,-37]], [[-9,-22],[9,-31]], [[-7,-18],[7,-18]], [[-8,-20],[9,-38]], [[-10,-28],[10,-28]]];
    const spk = Array.from({ length: sparks.length }, (_, i) => ({ th: Math.random() * Math.PI * 2, ph: -1.25 + Math.random() * 1.6, s: Math.random() * 6 }));
    const gl = glints.map(() => ({ x: (Math.random() - 0.5) * 22, y: (Math.random() - 0.5) * 22 }));
    let fbuf = null;

    api.loop(ts => {
      const dt = st.lastTs ? Math.min(0.1, (ts - st.lastTs) / 1000) : 0; st.lastTs = ts; st.t += dt;
      const playing = st.track >= 0 && A, lightOn = st.light !== 2;
      // bands from the analyser (bins of ~47 Hz)
      if (playing) {
        const an = A.analyser; if (!fbuf) fbuf = new Uint8Array(an.frequencyBinCount);
        an.getByteFrequencyData(fbuf);
        const avg = (a, b) => { let s = 0; for (let i = a; i <= b; i++) s += fbuf[i]; return s / (b - a + 1) / 255; };
        st.low = Math.max(st.low * 0.86, avg(1, 4)); st.mid = Math.max(st.mid * 0.88, avg(8, 40)); st.high = Math.max(st.high * 0.85, avg(90, 200) * 1.8);
        while (st.beatQ.length && st.beatQ[0] <= A.ctx.currentTime) { st.beatQ.shift(); st.beatT = st.t; st.beats++; }
      } else { st.low *= 0.9; st.mid *= 0.9; st.high *= 0.9; }
      const env = playing ? Math.exp(-(st.t - st.beatT) * 5) : 0;
      const L = Math.min(1, st.low), Mi = Math.min(1, st.mid), H = Math.min(1, st.high);

      // steps: every 2nd beat one or two rested dancers hop to a free neighbouring tile
      if (playing && st.beats !== st.stepBeat) {
        st.stepBeat = st.beats;
        if (st.beats % 2 === 0) {
          const idle = dancers.filter(d => !d.mv && st.beats - d.lastStep >= 4).sort(() => Math.random() - 0.5);
          idle.slice(0, Math.random() < 0.35 ? 2 : 1).forEach(d => {
            const taken = new Set(dancers.map(o => (o.mv ? o.to : o.tile).join(',')));
            const opts = [[1,0],[-1,0],[0,1],[0,-1]].map(([a, b]) => [d.tile[0] + a, d.tile[1] + b])
              .filter(([i, j]) => i >= 0 && i < N && j >= 2 && j < N && !taken.has(i + ',' + j));
            if (!opts.length) return;
            d.to = opts[Math.floor(Math.random() * opts.length)];
            d.mv = { t0: st.t, from: d.w.slice(), dur: 0.32 }; d.lastStep = st.beats;
          });
        }
      }
      dancers.forEach(d => {
        if (!d.mv) return;
        const p = Math.min(1, (st.t - d.mv.t0) / d.mv.dur), e = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2, T = tileC(...d.to);
        d.w = [d.mv.from[0] + (T[0] - d.mv.from[0]) * e, d.mv.from[1] + (T[1] - d.mv.from[1]) * e];
        d.hop = Math.sin(Math.PI * p) * 7;
        if (p >= 1) { d.tile = d.to; d.mv = null; d.hop = 0; flashT[d.tile.join(',')] = { t: st.t, col: d.col }; }
      });

      // floor tiles: a new pattern every 8 beats, flashing on each beat
      const pat = Math.floor(st.beats / 8) % 4, bt = st.beats;
      tilesEl.forEach(({ i, j, el }) => {
        const ring = Math.max(Math.abs(i - 3), Math.abs(j - 3));
        let on, col;
        if (pat === 0) { on = (i + j + bt) % 2 === 0; col = 1 + (bt % 3); }
        else if (pat === 1) { on = ring === bt % 4; col = 1 + (ring % 3); }
        else if (pat === 2) { on = (i + j) % 4 === bt % 4; col = 1 + ((i + j) % 3); }
        else { on = ((i * 7 + j * 13 + bt * 5) % 5) < 2; col = 1 + ((i * 3 + j + bt) % 3); }
        let o = !playing || !lightOn ? (lightOn ? 0.05 + 0.04 * Math.sin(st.t * 1.5 + i + j) : 0) : on ? 0.3 + 0.7 * Math.max(env, L * 0.6) : 0.05;
        const fl = flashT[i + ',' + j];   // the tile a dancer just landed on lights up in that dancer's colour
        if (fl && lightOn) { const f = Math.exp(-(st.t - fl.t) * 3); if (f > 0.03) { o = Math.max(o, 0.95 * f); col = fl.col; } else delete flashT[i + ',' + j]; }
        el.setAttribute('opacity', o.toFixed(3));
        el.setAttribute('class', 'tile k' + col);
      });

      // mirror ball: spin, meridians, glints, reflections around the room
      st.rot += dt * (playing ? 0.9 : 0.25);
      const [bx, by] = P(...BALL);
      let m = '';
      for (let k = 0; k < 6; k++) { const a = st.rot + k * Math.PI / 6, rx = Math.abs(14 * Math.sin(a)); m += `<ellipse class="facet" cx="${f2(bx)}" cy="${f2(by)}" rx="${f2(rx)}" ry="14"/>`; }
      mer.innerHTML = m;
      glints.forEach((g, k) => {
        const on = lightOn && Math.random() < 0.12 + H * 0.5;
        g.setAttribute('x', f2(bx + gl[k].x - 1.3)); g.setAttribute('y', f2(by + gl[k].y - 1.3)); g.setAttribute('opacity', on ? '1' : '0');
      });
      const sparkBase = lightOn ? (playing ? 0.35 + 0.65 * Math.max(H, env * 0.6) : 0.25) : 0.06;
      spk.forEach((s, k) => {
        const th = s.th + st.rot, c = Math.cos(s.ph), d = [c * Math.cos(th), c * Math.sin(th), Math.sin(s.ph)];
        let best = null, tb = 1e9;
        const tryHit = (t, chk) => { if (t > 0 && t < tb) { const h = [BALL[0] + d[0] * t, BALL[1] + d[1] * t, BALL[2] + d[2] * t]; if (chk(h)) { tb = t; best = h; } } };
        if (d[2] < -0.02) tryHit((4 - BALL[2]) / d[2], h => h[0] > 6 && h[0] < 300 && h[1] > 6 && h[1] < 240);
        if (d[1] < -0.02) tryHit((6 - BALL[1]) / d[1], h => h[0] > 6 && h[0] < 300 && h[2] > 0 && h[2] < 124);
        if (d[0] < -0.02) tryHit((6 - BALL[0]) / d[0], h => h[1] > 6 && h[1] < 240 && h[2] > 0 && h[2] < 124);
        const el = sparks[k];
        if (!best) { el.setAttribute('opacity', '0'); return; }
        const [sx, sy] = P(...best);
        el.setAttribute('cx', f2(sx)); el.setAttribute('cy', f2(sy));
        el.setAttribute('opacity', (sparkBase * (0.55 + 0.45 * Math.sin(st.t * 7 + s.s))).toFixed(3));
      });

      // PAR beams sweep the floor; each colour follows one band
      const lvl = [L, Mi, H, L], spots = [], amps = [];
      LAMPS.forEach((lx, k) => {
        const a = playing && lightOn ? Math.min(1, 0.15 + lvl[k] * 0.9 + env * 0.25) : 0;
        const sx = 180 + 52 * Math.sin(st.t * 0.55 + k * 1.7), sy = 156 + 48 * Math.cos(st.t * 0.47 + k * 2.3);
        const [lx2, ly2] = P(lx, 66, 157), [px, py] = P(sx, sy, 4), rx = 30, ry = 17;
        beams[k].setAttribute('d', `M${f2(lx2 - 2)} ${f2(ly2)}L${f2(px - rx)} ${f2(py)}A${rx} ${ry} 0 0 0 ${f2(px + rx)} ${f2(py)}L${f2(lx2 + 2)} ${f2(ly2)}Z`);
        beams[k].setAttribute('opacity', (a * 0.16).toFixed(3));
        pools[k].setAttribute('cx', f2(px)); pools[k].setAttribute('cy', f2(py)); pools[k].setAttribute('opacity', (a * 0.55).toFixed(3));
        lens[k].setAttribute('opacity', (0.15 + a * 0.85).toFixed(3));
        spots.push([sx, sy]); amps.push(a);
      });
      const COLS = [1, 2, 3, 1];
      dancers.forEach(d => {
        let kb = 0, db = 1e9;
        spots.forEach(([sx, sy], k) => { const v = Math.hypot(sx - d.w[0], sy - d.w[1]); if (v < db) { db = v; kb = k; } });
        d.col = COLS[kb];
        paintHead(d.h, COLS[kb], amps[kb] * Math.max(0.55, 1 - db / 90));
      });
      paintHead(djHead, 1 + (st.beats % 3), playing && lightOn ? 0.4 + 0.6 * env : 0);

      // strobe mode: short white flashes on the beat
      const flash = playing && st.light === 1 && (st.t - st.beatT) < 0.05;
      strobe.setAttribute('opacity', flash ? '0.32' : '0');

      // people, decks, speakers, meters, neon
      const bob = env * 2.5;
      dancers.forEach((d, i) => {
        const pose = POSES[playing ? (st.beats + d.ph * 2 + i) % POSES.length : 2], [[hlx, hly], [hrx, hry]] = pose;
        d.p.setAttribute('d', `M${hlx} ${hly} L-2.5 -26 L2.5 -26 L${hrx} ${hry}`);   // arms over the outfit
        const [gx, gy] = P(d.w[0], d.w[1], 4 + d.hop);
        d.g.setAttribute('transform', `translate(${f2(gx)} ${f2(gy - (playing && !d.mv ? bob * (i % 2 ? 1 : 0.6) : 0))})`);
      });
      const sorted = dancers.slice().sort((a, b) => (a.w[0] + a.w[1]) - (b.w[0] + b.w[1]));   // paint order = depth
      const key = sorted.map(d => d.g.id).join();
      if (key !== crowdOrder) { sorted.forEach(d => crowd.appendChild(d.g)); crowdOrder = key; }
      dj.setAttribute('transform', `translate(${f2(djx)} ${f2(djy - (playing ? bob * 0.6 : 0))})`);
      plat.forEach((p, k) => p.setAttribute('transform', `rotate(${f2((playing ? st.t * 200 : 0) * (k ? 1 : 1.03))} ${k ? 128 : 32} 12)`));
      fader.forEach((f, k) => f.setAttribute('y', f2(12 - [L, Mi, H, (L + H) / 2][k] * 4)));
      cones.forEach(c => c.setAttribute('r', f2(8 * (1 + 0.14 * (playing ? Math.max(L, env) : 0)))));
      vu.forEach((v, k) => { const h = 18 * Math.min(1, [L, Mi, H][k]); v.setAttribute('y', f2(26 - h)); v.setAttribute('height', f2(h)); });
      neon.classList.toggle('off', !lightOn || (playing && st.light === 0 && env < 0.15 && (st.beats % 8) === 7));
    });

    ui_(); readout();
    // arriving from the sea battle after the bridge was hit: start the party straight away
    if (window.__discoAutoplay) { window.__discoAutoplay = false; api.after(250, () => play(0)); }
    // game keys are caught first (capture) so a focused button can never swallow space / Enter / arrows
    const GAME_KEYS = new Set(['1','2','3','4',' ','Enter','l','L','д','Д','ArrowLeft','ArrowRight']);
    const onKey = e => {
      if (e.metaKey || e.ctrlKey || e.altKey || !GAME_KEYS.has(e.key) || !stage.isConnected) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (e.type === 'keydown') handle.key(e); else if (handle.keyup) handle.keyup(e);
    };
    window.addEventListener('keydown', onKey, true); window.addEventListener('keyup', onKey, true);
    const handle = {
      key(e) {
        if (e.key >= '1' && e.key <= '4') { pad('t' + (+e.key - 1)); return true; }
        if (e.key === ' ' || e.key === 'Enter') { pad('stop'); return true; }
        if (e.key === 'l' || e.key === 'L' || e.key === 'д' || e.key === 'Д') { pad('light'); return true; }
        if (e.key === 'ArrowRight') { play(((st.track < 0 ? st.lastTrack : st.track) + 1) % 4); return true; }
        if (e.key === 'ArrowLeft') { play(((st.track < 0 ? st.lastTrack : st.track) + 3) % 4); return true; }
        return false;
      },
      unmount() { window.removeEventListener('keydown', onKey, true); window.removeEventListener('keyup', onKey, true); stop(); bar.remove(); ui.remove(); },
      demo() {},
    };
    return handle;
  },
});
