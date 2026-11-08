/* Twelve extras on a winding path (product.html #features).
   After the reference: wide cards sit offset left and right, a large node on each card's
   outer edge, one glowing line sweeps node to node in wide arcs, running under the cards
   and around their outer sides, and draws itself (eased) down to where you are reading.
   Cards ahead of the line wait dimmed. The line stops on the rim of the brand ring, which
   hands over to the violet horizon. Icons are thin node glyphs: white hairlines, gradient
   rings and small lit dots, in our violet / magenta / orange / gold.
   Cheap to run: no SVG filters, the glow is two soft strokes under the line, and each
   frame only moves dash offsets. */
(function () {
  'use strict';
  const box = document.getElementById('xtPath');
  if (!box) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* glyph strokes, 24 unit box drawn at ~50px */
  const W = 'stroke="#fff" stroke-opacity=".88" stroke-width=".8" fill="none"';
  const RING = 'stroke="url(#xtgRing)" stroke-width="1" fill="none"';
  const RW = 'stroke="url(#xtgWarm)" stroke-width="1" fill="none"';
  const dW = (x, y, r = 1.5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#xtgWarm)"/>`;
  const dV = (x, y, r = 1.5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#xtgViolet)"/>`;
  const oW = (x, y, r = 1.5) => `<circle cx="${x}" cy="${y}" r="${r}" ${W}/>`;
  const oG = (x, y, r = 1.5) => `<circle cx="${x}" cy="${y}" r="${r}" ${RW}/>`;

  const ICONS = {
    /* a ring with the swing curve through it: who moved between two choices */
    swing: `<circle cx="12" cy="12" r="9" ${W}/><path d="M5.2 12c2.4 0 2.6-3.6 6.8-3.6M12 15.6c4.2 0 4.4-3.6 6.8-3.6" ${RING}/>${oW(5.2, 12, 1.4)}${oG(12, 12, 1.4)}${oW(18.8, 12, 1.4)}`,
    /* a gauge with three bands and a settled needle */
    ranges: `<path d="M3.5 16.5a8.5 8.5 0 0 1 17 0" ${RING}/><path d="M7 16.5a5 5 0 0 1 10 0" ${W}/><path d="M12 16.5l3.4-4.6" ${W}/>${dW(12, 16.5, 1.6)}${oW(3.5, 16.5, 1.2)}${oW(20.5, 16.5, 1.2)}`,
    /* a circle of voters, two still undecided */
    undecided: `${oW(12, 4.6)}${oG(19, 9.6)}${oW(16.4, 17.8)}${oG(7.6, 17.8)}${oW(5, 9.6)}<circle cx="12" cy="12" r="2.6" ${RING}/>${dV(12, 12, 1)}`,
    /* rings of priority around one booth */
    target: `<circle cx="12" cy="12" r="9" ${RING}/><circle cx="12" cy="12" r="5" ${RW}/>${dW(12, 12, 1.4)}`,
    /* a mood line that drops, and the alert ring on the drop */
    alert: `<path d="M2.8 11h3.4l2-3.6 3.4 9.2 2.2-4.8h7.4" ${W} stroke-linejoin="round" stroke-linecap="round"/><circle cx="13.8" cy="11.8" r="4.4" ${RING}/>${dW(13.8, 11.8, 1.3)}`,
    /* layered checks inside a hexagon */
    shield: `<path d="M12 2.8l8 4.6v9.2l-8 4.6-8-4.6V7.4z" ${RING}/><path d="M12 7.4l4 2.3v4.6l-4 2.3-4-2.3V9.7z" ${W}/>${dW(12, 12, 1.3)}`,
    /* a ballot box with its slot and a vote falling in */
    ballot: `<rect x="4.5" y="10" width="15" height="10" rx="2.2" ${RING}/><path d="M9 10h6" ${W} stroke-width="1.2"/><path d="M12 4.6v3" ${W} stroke-dasharray="1 1.2"/>${dW(12, 3.4, 1.4)}${oW(8.6, 15, 1.3)}${oW(15.4, 15, 1.3)}`,
    /* a voice wave in a ring */
    voice: `<circle cx="12" cy="12" r="9" ${RING}/><path d="M7.4 11v2M9.7 9.2v5.6M12 7.4v9.2M14.3 9.2v5.6M16.6 11v2" ${W} stroke-linecap="round" stroke-width="1"/>`,
    /* the sample: a grid of interviews, a few counted */
    grid: `${[6.5, 12, 17.5].flatMap((y) => [6.5, 12, 17.5].map((x) => (x === 12 && y === 12 ? dW(x, y, 1.7) : (x === 17.5 && y === 6.5) || (x === 6.5 && y === 17.5) ? oG(x, y, 1.4) : oW(x, y, 1.4)))).join('')}<rect x="2.8" y="2.8" width="18.4" height="18.4" rx="5" ${RING}/>`,
    /* a lead agent and the field team, scored */
    team: `<path d="M12 5.4v11.2M12 5.4l-5.6 9.6M12 5.4l5.6 9.6" ${W}/>${dW(12, 5.4, 1.9)}${dV(6.4, 15, 1.8)}${dV(17.6, 15, 1.8)}${oW(12, 18.4, 1.8)}`,
    /* two groups that overlap where seats are decided */
    venn: `<circle cx="9" cy="12" r="6" ${RING}/><circle cx="15" cy="12" r="6" ${W}/>${dW(12, 12, 1.4)}`,
    /* the wider conversation */
    globe: `<circle cx="12" cy="12" r="9" ${RING}/><ellipse cx="12" cy="12" rx="3.8" ry="9" ${W}/><path d="M3 12h18" ${W}/>`,
  };

  const ITEMS = [
    ['swing', 'Swing tracker', 'Past vote against today’s choice shows exactly who moved, round by round.'],
    ['ranges', 'Win ranges', 'Safe, Lean or Toss-up for each seat, never a fake-precise number.'],
    ['undecided', 'Undecided finder', 'Who the undecided are, where they live and what moves them.'],
    ['target', 'Booth priority list', 'Strong, weak and battleground booths, so effort goes where it counts.'],
    ['alert', 'Sentiment alerts', 'A warning the moment a district’s mood drops between rounds.'],
    ['shield', 'Fraud Shield', 'Booth fence, length, fake-GPS block, same-voice check and back-checks.'],
    ['ballot', 'Secret-ballot mode', 'The voter taps their own choice: a digital dummy ballot box.'],
    ['voice', 'Evidence player', 'Click any quote and hear the anonymised voice behind it.'],
    ['grid', 'Automatic method note', 'Every report carries its sample, its margin and its profile.'],
    ['team', 'Agent scorecards and pay', 'A quality score for each agent and pay per valid interview.'],
    ['venn', 'Women and youth modules', 'The gender and first-time-voter gaps that decide close seats.'],
    ['globe', 'Social listening, later', 'Telugu YouTube, X and news comments set beside the ground data.'],
  ];
  /* card's left edge (% of the inner row) and the edge that carries its node:
     the reference's rhythm, L R R L, so the line swings round each pair */
  const LAYOUT = [[0, 'l'], [34, 'r'], [45, 'r'], [32, 'l'], [11, 'l'], [18, 'r'], [29, 'r'], [46, 'l'], [26, 'l'], [4, 'r'], [15, 'r'], [7, 'r']];
  /* the line's colour as it reaches each node (ours), then the ring */
  const COL = ['#ffb340', '#ca45ff', '#fe881b', '#ca45ff', '#8130ff', '#f79fff', '#fe881b', '#ca45ff', '#8130ff', '#f79fff', '#fe881b', '#ca45ff', '#8130ff'];

  box.innerHTML = `<svg class="xt-defs" aria-hidden="true" width="0" height="0"><defs>
      <linearGradient id="xtgRing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8130ff"/><stop offset=".55" stop-color="#ca45ff"/><stop offset="1" stop-color="#ffb340"/></linearGradient>
      <linearGradient id="xtgWarm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd600"/><stop offset="1" stop-color="#fe881b"/></linearGradient>
      <linearGradient id="xtgViolet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ca45ff"/><stop offset="1" stop-color="#8130ff"/></linearGradient>
    </defs></svg>
    <svg class="xt-svg" aria-hidden="true"></svg>
    <ol class="xt-list">${ITEMS.map(([i, t, d], k) => {
      const [x, side] = LAYOUT[k];
      return `<li class="xt-item ${side}" style="--x:${x}%"><span class="xt-node"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[i]}</svg></span><div class="xt-card"><div class="xt-tx"><b>${t}</b><span>${d}</span></div></div></li>`;
    }).join('')}</ol>
    <div class="xt-ring" aria-hidden="true"><svg viewBox="0 0 48 48"><use href="#ring"/></svg></div>`;

  const svg = box.querySelector('.xt-svg');
  const items = [...box.querySelectorAll('.xt-item')];
  const ring = box.querySelector('.xt-ring');
  let segs = [], at = [], total = 0, samples = [], cur = 0, target = 0, run = 0, ringOn = false;

  const f = (n) => n.toFixed(1);
  const norm = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };

  function build() {
    const b = box.getBoundingClientRect();
    if (!b.width) return;
    const mid = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2 - b.left, r.top + r.height / 2 - b.top, r.width / 2]; };
    const P = items.map((li) => mid(li.querySelector('.xt-node')));
    const [rx, ry, rr] = mid(ring);
    const stacked = P.every((p) => Math.abs(p[0] - P[0][0]) < 2); /* phone: one rail */
    /* where the line starts and ends: a short run-in through the first node, and the
       top of the ring's rim (it never enters the ring) */
    const start = stacked ? [P[0][0], P[0][1] - 80] : [P[0][0] - P[0][2] - 34, P[0][1]];
    const end = [rx, ry - rr * 0.92 - 2];
    const pts = [start, ...P.map((p) => [p[0], p[1]]), end];
    /* One smooth line, not twelve joined pieces. The direction of travel at a node is the
       line from the node before it to the node after it (Catmull-Rom): the same direction
       on both sides, so no corner can show, and it follows the real spacing, so wide
       crossings stay shallow and short ones stay steep — no hairpins either. The run-in is
       flat and the ring is met from straight above. */
    const tan = pts.map((p, i) => {
      if (stacked) return [0, 1];
      if (i === 0) return [Math.sign(pts[1][0] - pts[0][0]) || 1, 0];
      if (i === pts.length - 1) return [0, 1];
      const t = norm(pts[i + 1][0] - pts[i - 1][0], pts[i + 1][1] - pts[i - 1][1]);
      return t[1] > 0.02 ? t : norm(t[0], 0.02); /* always falling: never doubles back up */
    });
    /* one cubic per gap, handles a fixed share of the gap so every sweep has the same
       weight, and never past the far end's height, which is what keeps it loop-free */
    const ds = [], cub = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const A = pts[i], B = pts[i + 1], tA = tan[i], tB = tan[i + 1];
      const dist = Math.hypot(B[0] - A[0], B[1] - A[1]), dy = Math.max(B[1] - A[1], 1);
      let h1 = dist * 0.42, h2 = dist * 0.42;
      if (tA[1] > 0.001) h1 = Math.min(h1, (dy * 0.92) / tA[1]);
      if (tB[1] > 0.001) h2 = Math.min(h2, (dy * 0.92) / tB[1]);
      cub.push([A, [A[0] + tA[0] * h1, A[1] + tA[1] * h1], [B[0] - tB[0] * h2, B[1] - tB[1] * h2], B]);
      ds.push(`M${f(A[0])} ${f(A[1])}C${f(A[0] + tA[0] * h1)} ${f(A[1] + tA[1] * h1)} ${f(B[0] - tB[0] * h2)} ${f(B[1] - tB[1] * h2)} ${f(B[0])} ${f(B[1])}`);
    }
    const full = ds.map((d, i) => (i ? d.replace(/^M[^C]+/, '') : d)).join('');
    const Wd = f(b.width), H = f(b.height);
    svg.setAttribute('viewBox', `0 0 ${Wd} ${H}`);
    const grads = ds.map((_, i) => {
      const A = pts[i], B = pts[i + 1], c0 = COL[Math.max(0, i - 1)], c1 = COL[i];
      return `<linearGradient id="xtgS${i}" gradientUnits="userSpaceOnUse" x1="${f(A[0])}" y1="${f(A[1])}" x2="${f(B[0])}" y2="${f(B[1])}"><stop offset="0" stop-color="${c0}"/>${i === 1 ? '<stop offset=".45" stop-color="#8130ff"/>' : ''}<stop offset="1" stop-color="${c1}"/></linearGradient>`;
    }).join('');
    svg.innerHTML = `<defs>${grads}</defs><path class="xt-base" d="${full}"/>${ds.map((d, i) => `<g class="xt-seg" stroke="url(#xtgS${i})"><path class="xt-halo" d="${d}"/><path class="xt-glow" d="${d}"/><path class="xt-line" d="${d}"/></g>`).join('')}`;
    /* segment lengths, and where along the whole line each node sits */
    let acc = 0;
    segs = [...svg.querySelectorAll('.xt-seg')].map((g) => {
      const ps = [...g.querySelectorAll('path')], len = ps[0].getTotalLength();
      ps.forEach((p) => { p.style.strokeDasharray = `${f(len + 1)} ${f(len + 2)}`; });
      const s = { g, ps, len, from: acc }; acc += len; return s;
    });
    total = acc;
    at = P.map((_, i) => segs[i].from + segs[i].len); /* segment i ends at node i */
    /* sample the whole line so a page height maps to a length along it */
    /* evaluated from the cubics themselves (24 steps each, chord lengths scaled to each
       segment's real length): ~300 sums instead of ~1,000 getPointAtLength calls (0.75 s) */
    samples = [[0, cub.length ? cub[0][0][1] : 0]]; let maxY = samples[0][1];
    const bz = (a, b, c, d, t) => { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; };
    cub.forEach(([A, C1, C2, B], i) => {
      const n = 24, xy = [A];
      for (let k = 1; k <= n; k++) { const t = k / n; xy.push([bz(A[0], C1[0], C2[0], B[0], t), bz(A[1], C1[1], C2[1], B[1], t)]); }
      const ch = xy.slice(1).map((q, k) => Math.hypot(q[0] - xy[k][0], q[1] - xy[k][1])), sum = ch.reduce((a, b) => a + b, 0) || 1;
      let L = segs[i].from;
      ch.forEach((c, k) => { L += (c / sum) * segs[i].len; maxY = Math.max(maxY, xy[k + 1][1]); samples.push([L, maxY]); });
    });
    target = goal(); if (reduced) cur = target;
    paint(true);
  }

  function lengthAt(y) {
    if (!samples.length || y <= samples[0][1]) return 0;
    let lo = 0, hi = samples.length - 1;
    if (y >= samples[hi][1]) return total;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (samples[m][1] < y) lo = m; else hi = m; }
    const [L0, y0] = samples[lo], [L1, y1] = samples[hi];
    return L0 + (L1 - L0) * ((y - y0) / Math.max(y1 - y0, 0.001));
  }
  /* the line's tip rides two thirds of the way down the screen */
  const goal = () => (reduced ? total : lengthAt(innerHeight * 0.66 - box.getBoundingClientRect().top));

  function paint(force) {
    for (const s of segs) {
      const v = Math.min(Math.max(cur - s.from, 0), s.len);
      if (v <= 0.2) { if (force || s.on !== false) { s.g.style.visibility = 'hidden'; s.on = false; } continue; }
      if (s.on !== true) { s.g.style.visibility = ''; s.on = true; }
      const off = f(s.len + 1 - v);
      if (off !== s.off) { s.off = off; s.ps.forEach((p) => { p.style.strokeDashoffset = off; }); }
    }
    for (let i = 0; i < items.length; i++) {
      const on = cur >= at[i] - 2;
      if (items[i]._on !== on) { items[i]._on = on; items[i].classList.toggle('lit', on); }
    }
    const r = cur >= total - 2;
    if (r !== ringOn) { ringOn = r; ring.classList.toggle('lit', r); }
  }

  /* ease the tip toward the reading line, so a flick of the wheel still draws smoothly */
  function tick() {
    const d = target - cur;
    if (Math.abs(d) < 0.6) { cur = target; paint(); run = 0; return; }
    cur += d * 0.14;
    paint();
    run = requestAnimationFrame(tick);
  }
  const kick = () => { target = goal(); if (!run) run = requestAnimationFrame(tick); };

  /* built once it comes near (motion.js), then only rebuilt when the box really changes size */
  const start = () => {
    let rt = 0, lastW = -1, lastH = -1;
    const rebuild = (force) => { cancelAnimationFrame(rt); rt = requestAnimationFrame(() => {
      const w = box.offsetWidth, h = box.offsetHeight;
      if (force !== true && w === lastW && h === lastH) return;
      lastW = w; lastH = h; build(); kick();
    }); };
    addEventListener('scroll', kick, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(rebuild).observe(box);
    else addEventListener('resize', rebuild);
    if (document.fonts && document.fonts.status !== 'loaded' && document.fonts.ready) document.fonts.ready.then(() => rebuild(true));
    lastW = box.offsetWidth; lastH = box.offsetHeight; build(); kick();
  };
  if (window.PI && typeof window.PI.near === 'function') window.PI.near(box, start); else start();
})();
