/* Political Intelligence Platform · footer
   One screen closes every page: the promise, four doors into the product, the pages that matter,
   and a garden that listens. Every plant is a voter waiting to be heard. Pull one and it evolves:
   a bud opens into a ring of speech-bubble petals, a pod's typing dots turn into a voice wave, an
   orb gains the platform's ring. The card plays what that voter said while the voice runs through
   the four doors. Hear all eight and the whole garden is in bloom.
   The style follows the reference footer (hairline stems, split-gradient leaves, gold orbs on
   stalks); the forms are our own: speech bubbles, voice waves and the brand ring. No lotus or
   other party symbols. Built near the viewport, grown once on arrival, loops pause off screen and
   everything holds still for reduced motion. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W = 500, H = 1000;
  const n1 = (v) => Math.round(v * 10) / 10;
  const rng = (seed) => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  const VOICES = [
    ['Drinking water comes once in four days. We buy cans now.', 'Water', 'neg', 'Srikakulam · woman, 41'],
    ['The road to the mandal office is finally done. Buses come on time.', 'Roads', 'pos', 'Guntur · man, 52'],
    ['My son finished his degree two years ago. Still no job.', 'Jobs', 'neg', 'Visakhapatnam · woman, 47'],
    ['The pension reaches us on the first of every month now.', 'Welfare', 'pos', 'Kurnool · man, 68'],
    ['Paddy prices fell and fertiliser went up. Who will help us?', 'Farming', 'neg', 'West Godavari · farmer, 39'],
    ['I have not decided yet. I will see who comes to our village.', 'Undecided', 'mix', 'Prakasam · first-time voter, 19'],
    ['The hospital has doctors now, but medicines keep running out.', 'Health', 'mix', 'Anantapur · woman, 35'],
    ['The girls’ hostel near the college changed everything for my daughter.', 'Education', 'pos', 'Krishna · mother, 44'],
  ];
  const SENT = { pos: 'Positive', neg: 'Negative', mix: 'Mixed' };

  /* Two compositions, each drawn from its page edge inwards (x = 0 is the outer edge; the right one
     is mirrored in CSS). Tall plants stand at the edges and step down towards the centre, leaving a
     valley for the words. k: kind, x: root, t: head [x, y], b: bend, s: head scale, f: pod fill,
     lv: leaves [place on stem 0–1, side ±1, size, spread in degrees]. */
  const GARDENS = {
    l: {
      plants: [
        { k: 'orb', x: 18, t: [34, 486], b: -18, s: 1.05, lv: [[0.34, 1, 0.9, 56]] },
        { k: 'bloom', x: 74, t: [118, 300], b: 34, s: 1.12, open: 1, lv: [[0.1, -1, 1.75, 66], [0.36, 1, 1.2, 54], [0.6, -1, 0.72, 50]] },
        { k: 'pod', x: 158, t: [204, 404], b: -44, s: 1, f: 0, w: 100, h: 64, lv: [[0.14, 1, 1.55, 62], [0.5, -1, 0.78, 52]] },
        { k: 'orb', x: 118, t: [134, 732], b: 12, s: 0.66, lv: [] },
        { k: 'bloom', x: 266, t: [306, 574], b: -26, s: 0.9, lv: [[0.12, 1, 1.45, 60], [0.46, -1, 0.85, 54]] },
        { k: 'orb', x: 350, t: [370, 690], b: 22, s: 0.8, lv: [[0.42, 1, 0.66, 50]] },
        { k: 'pod', x: 398, t: [404, 830], b: -14, s: 0.8, f: 2, w: 86, h: 56, lv: [[0.2, -1, 1.15, 58]] },
      ],
      sprigs: [
        { x: 214, t: [256, 300], b: 40, br: [[0.4, -1, 74, 0], [0.6, 1, 58, 1], [0.8, -1, 40, 0]] },
        { x: 452, t: [470, 900], b: -10, br: [[0.55, -1, 38, 1]] },
      ],
      dust: [[64, 140, 7, 0], [236, 196, 4, 1], [330, 340, 9, 2], [20, 620, 5, 0], [190, 640, 12, 3], [300, 780, 6, 1], [420, 560, 5, 0], [150, 210, 3, 1], [380, 470, 4, 3], [470, 740, 8, 2]],
    },
    r: {
      plants: [
        { k: 'bloom', x: 44, t: [84, 252], b: 22, s: 1.18, open: 1, lv: [[0.1, 1, 1.8, 64], [0.32, -1, 1.1, 56], [0.56, 1, 0.8, 52]] },
        { k: 'orb', x: 132, t: [168, 380], b: -26, s: 1.15, lv: [[0.4, -1, 0.85, 52]] },
        { k: 'pod', x: 200, t: [226, 452], b: 38, s: 1, f: 1, w: 96, h: 62, lv: [[0.16, -1, 1.5, 60], [0.52, 1, 0.75, 52]] },
        { k: 'orb', x: 14, t: [26, 662], b: 10, s: 0.8, lv: [] },
        { k: 'bloom', x: 296, t: [330, 616], b: -30, s: 0.86, lv: [[0.12, 1, 1.4, 62], [0.44, -1, 0.8, 54]] },
        { k: 'pod', x: 412, t: [420, 812], b: 14, s: 0.78, f: 0, w: 84, h: 56, lv: [[0.22, 1, 1.1, 58]] },
        { k: 'orb', x: 368, t: [386, 726], b: -16, s: 0.62, lv: [[0.5, -1, 0.6, 50]] },
      ],
      sprigs: [
        { x: 262, t: [298, 328], b: -36, br: [[0.42, 1, 70, 1], [0.64, -1, 52, 0], [0.84, 1, 36, 1]] },
        { x: 96, t: [92, 560], b: -20, br: [[0.6, 1, 44, 0]] },
      ],
      dust: [[200, 120, 6, 0], [40, 380, 9, 2], [280, 230, 4, 1], [420, 380, 6, 0], [120, 520, 4, 3], [250, 700, 11, 3], [460, 640, 5, 1], [340, 520, 3, 0], [170, 860, 7, 2], [470, 900, 4, 0]],
    },
  };

  /* the platform's palette, in the reference's arrangement: deep indigo roots, violet bodies, pink and gold tips */
  const POD = [['#1b4dfe', '#8130ff', '#e58cff'], ['#8130ff', '#ca45ff', '#fe881b'], ['#fe881b', '#ffb340', '#ffd600']];
  const DUST = ['#ffd600', '#fe881b', '#8130ff', '#f79fff'];
  const lin = (id, x2, y2, stops, extra = '') => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"${extra}>${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
  const defs = (id) => [
    `<linearGradient id="${id}st" gradientUnits="userSpaceOnUse" x1="0" y1="${H}" x2="0" y2="140"><stop offset="0" stop-color="#1b4dfe"/><stop offset=".55" stop-color="#8130ff"/><stop offset="1" stop-color="#d77bff"/></linearGradient>`,
    `<linearGradient id="${id}hr" gradientUnits="userSpaceOnUse" x1="0" y1="${H}" x2="0" y2="260"><stop offset="0" stop-color="#8130ff" stop-opacity=".3"/><stop offset=".55" stop-color="#ca45ff"/><stop offset="1" stop-color="#ffd600"/></linearGradient>`,
    lin(`${id}la`, 1, 0, [[0, '#1b4dfe'], [0.62, '#4f3bff'], [1, '#b26bff']]),
    lin(`${id}lb`, 1, 0.3, [[0, '#2f2bff'], [0.36, '#8a2cff'], [0.66, '#ee86ff'], [0.9, '#ffc46a'], [1, '#ffd600']]),
    lin(`${id}bd`, 0, 1, [[0, '#e4a2ff'], [0.42, '#8130ff'], [1, '#1b4dfe']]),
    lin(`${id}pt`, 0, 1, [[0, '#ffb8f4'], [0.42, '#c04bff'], [1, '#3b2bff']]),
    lin(`${id}au`, 0, 1, [[0, '#ffd0f6'], [0.42, '#ffd600'], [1, '#ffa31a']]),
    lin(`${id}sh`, 1, 1, [[0.5, '#fff', 0.16], [0.5, '#fff', 0]]),
    lin(`${id}rg`, 1, 1, [[0, '#1b4dfe'], [0.45, '#ac24ff'], [0.75, '#fe881b'], [1, '#ffd600']]),
    ...POD.map((c, i) => lin(`${id}p${i}`, 1, 1, c.map((col, j) => [j / (c.length - 1), col]))),
    ...DUST.map((c, i) => `<radialGradient id="${id}d${i}"><stop offset="0" stop-color="${c}" stop-opacity=".85"/><stop offset=".55" stop-color="${c}" stop-opacity=".45"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`),
  ].join('');

  /* a speech bubble with its tail reaching (tx, ty) from the bottom edge between a and b */
  const bubble = (x0, y0, w, h, r, a, b, tx, ty) => `M${x0 + r} ${y0}H${x0 + w - r}A${r} ${r} 0 0 1 ${x0 + w} ${y0 + r}V${y0 + h - r}A${r} ${r} 0 0 1 ${x0 + w - r} ${y0 + h}H${a}L${tx} ${ty}L${b} ${y0 + h}H${x0 + r}A${r} ${r} 0 0 1 ${x0} ${y0 + h - r}V${y0 + r}A${r} ${r} 0 0 1 ${x0 + r} ${y0}Z`;
  /* one petal = a small speech bubble whose tail points at the flower's heart */
  const PETAL = bubble(-18, -72, 36, 44, 14, 3, -5, -3, -14);
  const LEAF_A = 'M0 0C8 -48 86 -80 160 -20Z';
  const LEAF_B = 'M0 0C28 28 122 32 160 -20Z';
  const HS = { bloom: 1.3, pod: 1.12, orb: 1.22 };
  const bars = (cx, cy, hs, gap, w) => hs.map((v, i) => `<rect x="${n1(cx - ((hs.length - 1) * gap) / 2 + i * gap - w / 2)}" y="${n1(cy - v / 2)}" width="${w}" height="${v}" rx="${w / 2}" style="--i:${i}"/>`).join('');

  function head(id, p, r) {
    if (p.k === 'bloom') {
      const rot0 = Math.round(r() * 30) - 15;
      p.oc = [0, -40];
      return `<circle class="hit" cy="-40" r="58"/>`
        + `<g class="bud"><path d="M0 6C-27 -8 -28 -54 0 -88C28 -54 27 -8 0 6Z" fill="url(#${id}bd)"/><path d="M0 6C-27 -8 -28 -54 0 -88Z" fill="#fff" opacity=".1"/>`
        + `<g class="dots" fill="#fff">${[-10, 0, 10].map((x, i) => `<circle cx="${x}" cy="-38" r="3.6" style="--i:${i}"/>`).join('')}</g></g>`
        + `<g class="bl" transform="translate(0 -40)"><path class="nk" d="M0 40V0" stroke="url(#${id}st)" stroke-width="3" fill="none"/>`
        + Array.from({ length: 5 }, (_, i) => `<g transform="rotate(${rot0 + i * 72})"><g class="pt" style="--i:${i}"><path d="${PETAL}" fill="url(#${id}pt)"/><path d="${PETAL}" fill="url(#${id}sh)"/></g></g>`).join('')
        + `<circle class="core" r="15" fill="url(#${id}au)"/><g class="wv" fill="#fff">${bars(0, 0, [5, 10, 14, 9, 5], 4.4, 2.4)}</g></g>`;
    }
    if (p.k === 'pod') {
      const w = p.w, h = p.h, rr = Math.min(22, h / 2 - 4), x0 = -24, y0 = -(h + 14), cx = x0 + w / 2, cy = y0 + h / 2;
      const d = bubble(x0, y0, w, h, rr, 12, -2, 0, 0);
      p.oc = [cx, cy];
      return `<path class="hit" d="${d}"/><path d="${d}" fill="url(#${id}p${p.f})"/><path d="${d}" fill="url(#${id}sh)"/>`
        + `<g class="dots" fill="#fff">${[-13, 0, 13].map((x, i) => `<circle cx="${n1(cx + x)}" cy="${n1(cy)}" r="4.4" style="--i:${i}"/>`).join('')}</g>`
        + `<g class="wv" fill="#fff">${bars(cx, cy, [8, 16, 26, 14, 22, 11, 6], 7.2, 3.8)}</g>`;
    }
    p.oc = [0, -20];
    return `<circle class="hit" cy="-20" r="34"/><circle class="ping" cy="-20" r="20" fill="none" stroke="#ffd600" stroke-width="1.4" style="animation-delay:${n1(-r() * 4.6)}s"/>`
      + `<circle class="ob" cy="-20" r="20" fill="url(#${id}au)"/><path d="M0 -40A20 20 0 0 0 0 0Z" fill="#fff" opacity=".12"/>`
      + `<circle class="orbit" cy="-20" r="29" pathLength="100" fill="none" stroke="url(#${id}rg)" stroke-width="3.4" stroke-linecap="round" transform="rotate(-90 0 -20)"/>`;
  }

  /* Below laptop width the garden is a band between the words and the links: the same plants on
     stems about half as tall, heads and leaves at full size, cropped to the lower part of the scene. */
  const BAND = window.matchMedia('(max-width: 1100px), (max-aspect-ratio: 5/4)');
  const F = 0.52, VB0 = 440;
  const plants = [];
  function side(id, seed, band, sx = 1) {
    const g = GARDENS[id], r = rng(seed);
    const yf = (y) => (band ? H - (H - y) * F : y);
    const xf = (x) => n1(x * sx);
    let out = '', back = '';
    g.dust.forEach(([x, y0, rad, c]) => {
      const y = n1(yf(y0));
      back += `<circle class="du" cx="${xf(x)}" cy="${y}" r="${rad}" fill="url(#${id}d${c})" style="animation-delay:${n1(-r() * 7)}s;animation-duration:${n1(6 + r() * 5)}s"/>`;
    });
    g.sprigs.forEach((s, j) => {
      const sxr = xf(s.x), sy = n1(yf(s.t[1])), cx = (sxr + xf(s.t[0])) / 2 + s.b, cy = H - (H - sy) * 0.55;
      const sp = { x0: sxr, cx, cy, tx: xf(s.t[0]), ty: sy };
      const d0 = 0.35 + j * 0.3;
      let br = '';
      s.br.forEach(([t, sd, len, c], i) => {
        const [px, py] = qpt(sp, t), ex = px + sd * len * 0.72, ey = py - len * 0.7;
        br += `<path class="hr" pathLength="100" fill="none" stroke="url(#${id}hr)" stroke-linecap="round" d="M${n1(px)} ${n1(py)}Q${n1(px + sd * len * 0.1)} ${n1(py - len * 0.55)} ${n1(ex)} ${n1(ey)}" stroke-width="1.1" style="--d:${n1(d0 + 0.6 + i * 0.15)}s"/>`
          + `<circle class="nd" cx="${n1(ex)}" cy="${n1(ey)}" r="${c ? 3.2 : 4}" fill="${c ? '#f79fff' : '#ffd600'}" style="--d:${n1(d0 + 1.3 + i * 0.15)}s"/>`;
      });
      const [tx, ty] = [xf(s.t[0]), sy];
      br += `<path class="hr" pathLength="100" fill="none" stroke="url(#${id}hr)" stroke-linecap="round" d="M${tx} ${ty}q-4 -16 -14 -22M${tx} ${ty}q6 -14 16 -18" stroke-width="1" style="--d:${n1(d0 + 1)}s"/>`
        + `<circle class="nd" cx="${tx - 14}" cy="${ty - 22}" r="3" fill="#ca45ff" style="--d:${n1(d0 + 1.4)}s"/><circle class="nd" cx="${tx + 16}" cy="${ty - 18}" r="3" fill="#f79fff" style="--d:${n1(d0 + 1.5)}s"/>`;
      back += `<g class="sp" style="transform-origin:${sxr}px ${H}px;animation-delay:${n1(-r() * 8)}s;animation-duration:${n1(7 + r() * 4)}s"><path class="hr" pathLength="100" fill="none" stroke="url(#${id}hr)" stroke-linecap="round" d="M${sxr} ${H}Q${n1(cx)} ${n1(cy)} ${tx} ${ty}" stroke-width="1.4" style="--d:${n1(d0)}s"/>${br}</g>`;
    });
    g.plants.forEach((spec, i) => {
      const p = {
        side: id, k: spec.k, x0: xf(spec.x), hx: xf(spec.t[0]), hy: yf(spec.t[1]), s: spec.s, vbh: band ? H - VB0 : H, vbw: W * sx, f: spec.f || 0, w: spec.w, h: spec.h,
        dx: 0, dy: 0, evolved: !!spec.open,
        lv: spec.lv.map(([t, sd, size, spread]) => ({ t, side: sd, size, spread })),
      };
      p.cx0 = (p.x0 + p.hx) / 2 + spec.b; p.cy0 = H - (H - p.hy) * 0.55;
      const k = plants.length, d = n1(0.15 + i * 0.16 + r() * 0.1);
      const sw = spec.k === 'bloom' ? 3 : spec.k === 'pod' ? 2.6 : 2.1;
      const leaves = p.lv.map((l, j) => `<g class="lw"><g class="lf" style="--d:${n1(d + 0.45 + l.t * 0.7 + j * 0.05)}s"><path d="${LEAF_A}" fill="url(#${id}la)"/><path d="${LEAF_B}" fill="url(#${id}lb)"/><path d="M3 -.4L152 -19" stroke="#ffd600" stroke-opacity=".34" stroke-width=".8" fill="none"/></g></g>`).join('');
      const hd = head(id, p, r);
      out += `<g class="pl pl-${spec.k}${spec.open ? ' is-evolved' : ''}" data-k="${k}" style="transform-origin:${p.x0}px ${H}px;animation-delay:${n1(-r() * 8)}s;animation-duration:${n1(6.5 + r() * 4)}s">`
        + `<path class="st" pathLength="100" fill="none" stroke="url(#${id}st)" stroke-width="${sw}" stroke-linecap="round" style="--d:${d}s"/>`
        + `<path class="sg" pathLength="100" fill="none" stroke="#ffe9a8" stroke-width="${sw + 0.8}" stroke-linecap="round"/>`
        + `<g class="lvs">${leaves}</g>`
        + `<g class="hd"><g class="hp" style="--d:${n1(d + 1)}s"><g class="hi" style="transform-origin:${n1(p.oc[0])}px ${n1(p.oc[1])}px">${hd}</g></g></g></g>`;
      plants.push(p);
    });
    return `<svg class="fg-side fg-${id}" viewBox="0 ${band ? VB0 : 0} ${n1(W * sx)} ${band ? H - VB0 : H}" preserveAspectRatio="xMinYMax meet" aria-hidden="true" focusable="false"><defs>${defs(id)}</defs><g class="fg-back">${back}</g>${out}</svg>`;
  }

  /* points and tangents on the quadratic stem from (x0, H) through (cx, cy) to (tx, ty) */
  function qpt(p, t) { const u = 1 - t; return [u * u * p.x0 + 2 * u * t * p.cx + t * t * p.tx, u * u * H + 2 * u * t * p.cy + t * t * p.ty]; }
  function qang(p, t) { const u = 1 - t; return Math.atan2(2 * u * (p.cy - H) + 2 * t * (p.ty - p.cy), 2 * u * (p.cx - p.x0) + 2 * t * (p.tx - p.cx)) * 180 / Math.PI; }

  /* the stem bends after its head: the head moves fully, the curve partly, the leaves ride the curve */
  function draw(p) {
    p.tx = p.hx + p.dx; p.ty = p.hy + p.dy; p.cx = p.cx0 + p.dx * 0.5; p.cy = p.cy0 + p.dy * 0.4;
    const d = `M${p.x0} ${H}Q${n1(p.cx)} ${n1(p.cy)} ${n1(p.tx)} ${n1(p.ty)}`;
    p.st.setAttribute('d', d); p.sg.setAttribute('d', d);
    p.hd.setAttribute('transform', `translate(${n1(p.tx)} ${n1(p.ty)}) rotate(${n1(p.dx * 0.07)}) scale(${n1(p.s * HS[p.k] * 100) / 100})`);
    p.lv.forEach((l) => {
      const [x, y] = qpt(p, l.t), a = qang(p, l.t) + l.side * l.spread;
      l.el.setAttribute('transform', `translate(${n1(x)} ${n1(y)}) rotate(${n1(a)}) scale(${l.size} ${l.side < 0 ? -l.size : l.size})`);
    });
  }

  function init() {
    const foot = $('#footer'), box = $('#fgGarden');
    if (!foot || !box) return;
    /* a wide band spreads the plants sideways (never wider than 1.9×) so the two halves meet */
    let sx = 1;
    const spread = () => {
      if (!BAND.matches || !box.clientHeight) return 1;
      return Math.round(Math.max(1, Math.min(1.9, (box.clientWidth / 2 / box.clientHeight) * (H - VB0) / W)) * 20) / 20;
    };
    const render = () => {
      const was = plants.map((p) => p.evolved);
      plants.length = 0;
      sx = spread();
      box.innerHTML = side('l', 7, BAND.matches, sx) + side('r', 29, BAND.matches, sx);
      $$('.pl', box).forEach((g) => {
        const p = plants[+g.dataset.k];
        p.g = g; p.st = $('.st', g); p.sg = $('.sg', g); p.hd = $('.hd', g); p.svg = g.ownerSVGElement;
        $$('.lw', g).forEach((el, j) => { p.lv[j].el = el; });
        if (was[+g.dataset.k]) { p.evolved = true; g.classList.add('is-evolved'); }
        draw(p);
      });
    };
    const build = () => {
      if (box.dataset.built) return;
      box.dataset.built = '1';
      render();
      wire(foot, box);
      /* crossing the band breakpoint redraws the scene in place, already grown, keeping what has bloomed */
      const swap = () => render();
      if (BAND.addEventListener) BAND.addEventListener('change', swap); else if (BAND.addListener) BAND.addListener(swap);
      /* the band's width decides how far the plants spread, so watch its box (it may first be measured
         while the footer is still skipped off screen) */
      let rt = 0;
      const refit = () => { clearTimeout(rt); rt = setTimeout(() => { if (BAND.matches && spread() !== sx) render(); }, 160); };
      if ('ResizeObserver' in window) new ResizeObserver(refit).observe(box); else window.addEventListener('resize', refit, { passive: true });
    };
    if (!('IntersectionObserver' in window)) { build(); box.classList.add('is-grown'); return; }
    /* built ahead of time: in the first idle moment after the page has loaded, or as soon as the
       footer is within a screen and a half, so arriving at it never waits on (or stutters for) the build */
    const near = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { near.disconnect(); build(); } }, { rootMargin: '150% 0px' });
    near.observe(foot);
    const early = () => { if (box.dataset.built) return; near.disconnect(); build(); };
    const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(early, { timeout: 2500 }) : setTimeout(early, 600));
    if (document.readyState === 'complete') setTimeout(idle, 400); else addEventListener('load', () => setTimeout(idle, 400), { once: true });
    /* the garden starts growing as the footer's top edge comes into view, not a third of the way in */
    const grow = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      grow.disconnect(); build();
      if (BAND.matches && spread() !== sx) render();
      requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('is-grown')));
    }, { threshold: 0.01, rootMargin: '0px 0px -6% 0px' });
    grow.observe(foot);
    new IntersectionObserver((es) => es.forEach((e) => foot.classList.toggle('is-live', e.isIntersecting && !reduced))).observe(foot);
  }

  function wire(foot, box) {
    const gsap = window.gsap;
    const card = $('#fgVoice'), doors = $('.fg-doors', foot);
    const q = card && $('.fg-vq', card), tag = card && $('.fg-vt', card), who = card && $('.fg-vwho', card), cnt = card && $('.fg-vc', card), pips = card ? $$('.fg-vp i', card) : [];

    const home = (p, from) => {
      if (from) { p.dx = from.x; p.dy = from.y; }
      if (gsap) {
        gsap.killTweensOf(p);
        gsap.to(p, { dx: 0, dy: 0, duration: reduced ? 0.25 : 1.4, ease: reduced ? 'power2.out' : 'elastic.out(1, 0.32)', onUpdate: () => draw(p) });
      } else { p.dx = 0; p.dy = 0; draw(p); }
    };

    /* a plant evolves once: bud → bloom, typing → voice, orb → ringed */
    const evolve = (p, delay = 0) => {
      if (p.evolved) return;
      p.evolved = true;
      if (delay) setTimeout(() => p.g.classList.add('is-evolved'), delay); else p.g.classList.add('is-evolved');
    };
    /* a light runs up the stem into the head while the plant speaks */
    const pulse = (p) => {
      p.g.classList.add('is-speaking');
      clearTimeout(p.t); p.t = setTimeout(() => p.g.classList.remove('is-speaking'), 2600);
      if (reduced || !p.sg.animate) return;
      p.sg.animate([{ strokeDashoffset: 10, opacity: 1 }, { strokeDashoffset: -100, opacity: 0.2 }], { duration: 900, easing: 'cubic-bezier(.33,1,.68,1)' });
    };
    const flow = () => {
      if (!doors || reduced) return;
      doors.classList.remove('is-flow'); void doors.offsetWidth; doors.classList.add('is-flow');
      clearTimeout(flow.t); flow.t = setTimeout(() => doors.classList.remove('is-flow'), 1600);
    };

    const heard = new Set(); let vi = -1, full = false;
    const speak = (p) => {
      vi = (vi + 1) % VOICES.length;
      heard.add(vi);
      evolve(p); pulse(p); flow();
      if (!card) return;
      const [text, issue, s, place] = VOICES[vi];
      card.classList.add('is-on', 'is-used');
      q.textContent = `“${text}”`;
      q.classList.remove('swap'); void q.offsetWidth; q.classList.add('swap');
      tag.hidden = false; tag.textContent = `${issue} · ${SENT[s]}`; tag.dataset.s = s;
      who.textContent = place;
      pips.forEach((el, i) => el.classList.toggle('on', i < heard.size));
      cnt.textContent = `${heard.size} of ${VOICES.length}`;
      clearTimeout(speak.t); speak.t = setTimeout(() => card.classList.remove('is-on'), 3400);
      if (heard.size === VOICES.length && !full) { full = true; setTimeout(fullBloom, 3600); }
    };
    /* every voice heard: the rest of the garden opens, outer plants first */
    const fullBloom = () => {
      foot.classList.add('is-full');
      plants.filter((p) => !p.evolved).sort((a, b) => a.hy - b.hy).forEach((p, i) => evolve(p, reduced ? 0 : i * 140));
      if (!card) return;
      q.textContent = 'All eight voices heard. Now picture every booth, every round.';
      q.classList.remove('swap'); void q.offsetWidth; q.classList.add('swap');
      tag.textContent = 'Full bloom'; tag.dataset.s = 'all';
      who.textContent = 'That is one survey round on the platform';
    };

    /* drag: the pointer maps to garden units, the right garden is mirrored, the pull is rubber-banded */
    const MAX = 150;
    const band = (d) => Math.sign(d) * MAX * (1 - Math.exp(-Math.abs(d) / MAX));
    let drag = null;
    box.addEventListener('pointerdown', (e) => {
      const hd = e.target.closest('.hd'); if (!hd) return;
      const p = plants[+hd.parentNode.dataset.k];
      if (gsap) gsap.killTweensOf(p);
      const rect = p.svg.getBoundingClientRect(), k = 1 / Math.min(rect.width / p.vbw, rect.height / p.vbh);
      drag = { p, id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: p.dx, oy: p.dy, k, flip: p.side === 'r' ? -1 : 1, moved: false };
      try { hd.setPointerCapture(e.pointerId); } catch (err) { /* synthetic or stale pointer */ }
      p.g.classList.add('is-held');
      speak(p);
      e.preventDefault();
    });
    box.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = (e.clientX - drag.sx) * drag.k * drag.flip, dy = (e.clientY - drag.sy) * drag.k;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      drag.p.dx = band(drag.ox + dx); drag.p.dy = band(drag.oy + dy);
      draw(drag.p);
    });
    const end = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const p = drag.p;
      p.g.classList.remove('is-held');
      /* a plain tap still gets a small pluck so it feels alive */
      if (!drag.moved && !reduced) home(p, { x: 0, y: -28 }); else home(p);
      drag = null;
    };
    box.addEventListener('pointerup', end);
    box.addEventListener('pointercancel', end);

    /* keyboard and mouse users without a drag: pluck the next plant that has not spoken yet */
    const next = card && $('.fg-vn', card);
    if (next) {
      next.addEventListener('click', () => {
        const visible = plants.filter((p) => p.svg.getBoundingClientRect().width > 0);
        const pool = visible.filter((p) => !p.evolved);
        const list = pool.length ? pool : visible;
        const p = list[Math.floor(Math.random() * list.length)] || plants[0];
        speak(p);
        if (!reduced) home(p, { x: (p.side === 'l' ? 1 : -1) * 30, y: -42 });
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
