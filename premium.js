/* Political Intelligence Platform · premium layer
   The reference brand's signature visuals, rebuilt in SVG and CSS with its exact palette:
   twinkling stars, the torus of light lines behind the election-cycle cards, the glowing
   path through the add-ons, voice ribbons, the light fountain over the closing ring and
   the footer garden. Loops run only while on screen and stay still for reduced motion. */
(function () {
  'use strict';
  const P = window.PI;
  const { $, $$, clamp, reduced, rng } = P;
  const NS = 'http://www.w3.org/2000/svg';

  /* run frame(t) on every animation frame while el is on screen; time stands still
     while the page is being scrolled, so scrolling never competes with the loop.
     `margin` starts the clock before the element arrives, so a loop that opens with a
     slow entrance is already under way by the time it is looked at */
  function loop(el, frame, margin = '80px 0px') {
    frame(0);
    if (reduced || !('IntersectionObserver' in window)) return;
    let raf = 0, last = 0, acc = 0;
    const still = P.scrolling || (() => false);
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(now - last, 50) / 1000 : 0; last = now;
      if (still()) return;
      acc += dt; frame(acc);
    };
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting && !raf) { last = 0; raf = requestAnimationFrame(tick); }
      else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
    }), { rootMargin: margin }).observe(el);
  }

  /* ---------------- twinkling stars ---------------- */
  /* stars twinkle in three groups at different phases: three layers, not one per star */
  function Stars() {
    $$('.stars').forEach((box, j) => {
      const n = +box.dataset.stars || 20, r = rng(41 + j * 13), groups = ['', '', ''];
      for (let k = 0; k < n; k++) {
        const s = r() < 0.25 ? 3 : 2;
        groups[k % 3] += `<i style="left:${(r() * 100).toFixed(2)}%;top:${(r() * 100).toFixed(2)}%;width:${s}px;height:${s}px;--o:${(0.45 + r() * 0.55).toFixed(2)}"></i>`;
      }
      box.innerHTML = groups.map((g, k) => `<span class="st-g" style="--dl:${(-k * 2.4).toFixed(1)}s">${g}</span>`).join('');
    });
  }

  /* ---------------- hero: dawn horizon ---------------- */
  function Horizon() {
    const hz = $('#heroHz'); if (!hz) return;
    const hero = hz.parentElement, cta = $('.hero-cta', hero), stage = $('#heroStage');
    const svg = $('.hz-lines', hz), sun = $('.hz-sun', hz), glow = $('i', sun);
    let G = null, key = '';

    /* fit the dome under the buttons: rim 96px below them, field down to mid-dashboard.
       offsetTop ignores the entry transforms, so the fit is stable while things animate in */
    function fit() {
      const W = hz.clientWidth, wide = W >= 900;
      if (!W) return; /* not laid out yet: the ResizeObserver calls again once it is */
      const rimY = Math.round(cta.offsetTop + cta.offsetHeight + (wide ? 96 : 60));
      const H = Math.round(stage.offsetTop + stage.offsetHeight * (wide ? 0.56 : 0.5));
      const k = [W, rimY, H].join();
      if (k === key) return;
      key = k;
      const rx = W * (wide ? 0.6 : 0.82), ry = rimY * (wide ? 0.88 : 0.8), cx = W / 2, cy = rimY - ry;
      const edgeY = cy + ry * Math.sqrt(Math.max(0, 1 - (cx / rx) ** 2));
      G = { W, H, cx, cy, rx, ry };
      [['--cx', cx], ['--cy', cy], ['--rx', rx], ['--ry', ry], ['--rimY', rimY], ['--edgeY', edgeY], ['--hzH', H]]
        .forEach(([n, v]) => hz.style.setProperty(n, v.toFixed(1) + 'px'));
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      /* the rim is drawn as two halves, so it grows outward from the lowest point */
      const half = (x, sweep) => `<path class="hz-rim" pathLength="1" d="M${cx} ${rimY}A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 ${sweep} ${x} ${edgeY.toFixed(1)}"/>`;
      svg.innerHTML = `<defs><linearGradient id="hzRimG" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0"><stop offset="0" stop-color="#dd95ff" stop-opacity=".15"/><stop offset=".3" stop-color="#f79fff" stop-opacity=".75"/><stop offset=".5" stop-color="#fff"/><stop offset=".7" stop-color="#f79fff" stop-opacity=".75"/><stop offset="1" stop-color="#dd95ff" stop-opacity=".15"/></linearGradient></defs>${half(0, 1)}${half(W, 0)}`;
    }
    /* voice ripples leave the rim as plain ellipses (motion.css), so they scale on the compositor */
    const rip = document.createElement('div');
    rip.className = 'hz-rip';
    rip.innerHTML = Array.from({ length: 5 }, (_, i) => `<i style="--k:${i}"></i>`).join('');
    hz.insertBefore(rip, svg);
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(hero); else window.addEventListener('resize', fit);
    if (document.fonts) document.fonts.ready.then(fit);
    requestAnimationFrame(() => requestAnimationFrame(() => hz.classList.add('is-drawn')));

    /* one light on the rim: u runs from -1 (left edge) to 1 (right edge) */
    let u = 0, target = null;
    hero.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || !G) return;
      const r = hz.getBoundingClientRect();
      target = e.clientY - r.top < G.H ? clamp((e.clientX - r.left - G.cx) / (G.W / 2), -0.94, 0.94) : null;
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { target = null; });
    loop(hz, (t) => {
      if (!G) return;
      const goal = target == null ? 0.7 * Math.sin((t * Math.PI * 2) / 26) : target;
      u += (goal - u) * (target == null ? 0.02 : 0.07);
      const dx = u * (G.W / 2), x = G.cx + dx;
      const dy = G.ry * Math.sqrt(Math.max(0.0001, 1 - (dx / G.rx) ** 2));
      const a = (Math.atan(-(G.ry * G.ry * dx) / (G.rx * G.rx * dy)) * 180) / Math.PI;
      sun.style.transform = `translate3d(${x.toFixed(1)}px,${(G.cy + dy).toFixed(1)}px,0) rotate(${a.toFixed(2)}deg)`;
      glow.style.opacity = (1 - 0.5 * Math.abs(u)).toFixed(3);
    });
    if (!reduced && 'IntersectionObserver' in window) {
      new IntersectionObserver((es) => es.forEach((e) => hz.classList.toggle('is-live', e.isIntersecting))).observe(hz);
    }
  }

  /* ---------------- election cycle: torus of light lines + cards ---------------- */
  function Cycle() {
    const svg = $('#cyTorus'), box = $('#cyCards');
    if (box) {
      const cards = $$('.cy-card', box);
      const set = (c) => cards.forEach((x) => x.classList.toggle('is-on', x === c));
      box.addEventListener('mouseover', (e) => { const c = e.target.closest('.cy-card'); if (c && window.matchMedia('(hover: hover)').matches) set(c); });
      box.addEventListener('focusin', (e) => { const c = e.target.closest('.cy-card'); if (c) set(c); });
      box.addEventListener('click', (e) => { const c = e.target.closest('.cy-card'); if (c) set(c); });
    }
    if (!svg) return;
    /* meridians of a torus seen side-on: circles at the edges, slivers in the middle */
    const N = 34, cx = 700, cy = 500, R = 420, r = 280, ry = 470;
    svg.innerHTML = `<defs><linearGradient id="tqG" gradientUnits="userSpaceOnUse" x1="0" y1="${cy - ry}" x2="0" y2="${cy + ry}">
      <stop offset="0" stop-color="#ca45ff"/><stop offset=".1" stop-color="#8130ff"/><stop offset=".24" stop-color="#1b4dfe" stop-opacity=".75"/><stop offset=".4" stop-color="#1b4dfe" stop-opacity="0"/>
      <stop offset=".6" stop-color="#fe881b" stop-opacity="0"/><stop offset=".78" stop-color="#fe881b" stop-opacity=".75"/><stop offset=".92" stop-color="#ffd600"/><stop offset="1" stop-color="#ffd600"/></linearGradient></defs>
      <g fill="none" stroke="url(#tqG)" stroke-width="0.9">${'<ellipse vector-effect="non-scaling-stroke"/>'.repeat(N)}</g>`;
    const els = $$('ellipse', svg);
    let drawn = -1;
    loop(svg, (t) => {
      if (t && t - drawn < 1 / 30) return; /* the torus turns slowly: 30 frames a second is plenty */
      drawn = t;
      els.forEach((e, k) => {
        const th = (k / N) * Math.PI * 2 + t * 0.07, c = Math.cos(th);
        e.setAttribute('cx', (cx + R * c).toFixed(1));
        e.setAttribute('cy', cy);
        e.setAttribute('rx', Math.max(r * Math.abs(c), 0.5).toFixed(1));
        e.setAttribute('ry', ry);
        e.setAttribute('opacity', Math.sin(th) > 0 ? '0.8' : '0.32');
      });
    });
  }

  /* ---------------- add-ons: glowing path drawn as you scroll ---------------- */
  function FeatPath() {
    const box = $('#featPath'); if (!box) return;
    const svg = $('.fp-svg', box), items = $$('.fp-item', box);
    if (!svg || !items.length) return;
    let line, glow, head, total = 0, at = [];
    function build() {
      const b = box.getBoundingClientRect();
      const pts = items.map((li) => { const n = li.querySelector('.fp-node').getBoundingClientRect(); return [n.left + n.width / 2 - b.left, n.top + n.height / 2 - b.top]; });
      const W = b.width, H = b.height, [fx, fy] = pts[0], [lx, ly] = pts[pts.length - 1];
      const segs = [`M${fx} ${Math.max(0, fy - 110)}L${fx} ${fy}`];
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], h = (y1 - y0) * 0.55;
        segs.push(`C${x0} ${y0 + h} ${x1} ${y1 - h} ${x1} ${y1}`);
      }
      const d = segs.join('') + `L${lx} ${Math.min(H, ly + 110)}`;
      svg.setAttribute('viewBox', `0 0 ${W.toFixed(0)} ${H.toFixed(0)}`);
      svg.innerHTML = `<defs><linearGradient id="fpG" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${H.toFixed(0)}"><stop offset="0" stop-color="#b997ff"/><stop offset=".5" stop-color="#ca45ff"/><stop offset="1" stop-color="#fe881b"/></linearGradient><filter id="fpBlur" x="-50%" y="-5%" width="200%" height="110%"><feGaussianBlur stdDeviation="7"/></filter></defs>
        <path class="fp-base" d="${d}"/><path class="fp-glow" d="${d}" stroke="url(#fpG)" filter="url(#fpBlur)"/><path class="fp-line" d="${d}" stroke="url(#fpG)"/><circle class="fp-head" r="5"/>`;
      line = $('.fp-line', svg); glow = $('.fp-glow', svg); head = $('.fp-head', svg);
      total = line.getTotalLength();
      /* path length at each node: measure each segment once and add them up */
      const probe = document.createElementNS(NS, 'path'); svg.appendChild(probe);
      let sum = 0;
      at = pts.map((_, i) => {
        probe.setAttribute('d', i ? `M${pts[i - 1][0]} ${pts[i - 1][1]}${segs[i]}` : segs[0]);
        return (sum += probe.getTotalLength());
      });
      probe.remove();
      [line, glow].forEach((p) => { p.style.strokeDasharray = `${total} ${total}`; });
      /* where the box sits on the page: scrolling then reads only scrollY, never layout */
      boxTop = b.top + window.scrollY; boxH = b.height; lastP = -1;
      upd();
    }
    let boxTop = 0, boxH = 1, lastP = -1;
    function upd() {
      if (!line) return;
      const vh = window.innerHeight;
      const p = reduced ? 1 : clamp((vh * 0.6 - (boxTop - window.scrollY)) / (boxH * 0.92), 0, 1);
      if (Math.abs(p - lastP) < 0.0015) return;
      lastP = p;
      const L = total * p;
      line.style.strokeDashoffset = glow.style.strokeDashoffset = (total - L).toFixed(1);
      const pt = line.getPointAtLength(Math.max(L, 0.1));
      head.setAttribute('cx', pt.x.toFixed(1)); head.setAttribute('cy', pt.y.toFixed(1));
      head.style.opacity = p > 0.002 && p < 0.998 ? 1 : 0;
      items.forEach((li, i) => li.classList.toggle('lit', L >= at[i] - 4));
    }
    let raf = 0;
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; upd(); }); }, { passive: true });
    /* built when the section comes near (motion.js); a resize re-measures */
    (P.near || ((el, fn) => fn()))(box, () => {
      if ('ResizeObserver' in window) new ResizeObserver(() => build()).observe(box); else window.addEventListener('resize', build);
      build();
      /* content above can still grow (lazy sections): when the page's height changes, re-read the box's place */
      if ('ResizeObserver' in window) new ResizeObserver(() => { const b = box.getBoundingClientRect(); boxTop = b.top + window.scrollY; boxH = b.height; lastP = -1; upd(); }).observe(document.body);
    });
  }

  /* ---------------- voice ribbons ----------------
     One twisted band of fine light lines that sweeps up from the bottom left, dips through the
     middle and climbs to the top right, warm at its start and cool at its end. Each line is
     offset from the spine along a slowly turning direction, so the band twists and the lines
     cross like hatching. Glass chips ride the spine, one per step from voice to insight. */
  function Ribbons() {
    const svg = $('#ribbons'); if (!svg) return;
    const N = 34, W = 1600, H = 600, S = 36;
    const chips = $$('#rbChips li');
    svg.innerHTML = `<defs><linearGradient id="rbG" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0"><stop offset="0" stop-color="#fe881b" stop-opacity="0"/><stop offset=".08" stop-color="#fe881b" stop-opacity=".9"/><stop offset=".22" stop-color="#f79fff"/><stop offset=".42" stop-color="#ca45ff"/><stop offset=".66" stop-color="#ac24ff"/><stop offset=".84" stop-color="#8130ff"/><stop offset=".95" stop-color="#1b4dfe"/><stop offset="1" stop-color="#b997ff" stop-opacity="0"/></linearGradient></defs><g fill="none" stroke="url(#rbG)" stroke-width="1">${'<path vector-effect="non-scaling-stroke"/>'.repeat(N)}</g>`;
    const ps = $$('path', svg);
    /* spine through [u, y] keys, eased so each key is a crest or trough: rises from the bottom
       left to a crest, dives to a trough past the middle, climbs to the top right */
    const KEYS = [[0, 0.96], [0.2, 0.2], [0.5, 0.86], [0.93, 0.14], [1, 0.1]];
    const spineY = (u, t) => {
      let i = 0; while (i < KEYS.length - 2 && u > KEYS[i + 1][0]) i++;
      const [u0, y0] = KEYS[i], [u1, y1] = KEYS[i + 1], f = (1 - Math.cos(Math.PI * clamp((u - u0) / (u1 - u0), 0, 1))) / 2;
      return H * (y0 + (y1 - y0) * f + 0.03 * Math.sin(u * 7 - t * 0.4));
    };
    const half = (u) => H * 0.17 * (0.3 + 0.7 * Math.sin(Math.PI * clamp(u * 1.1, 0, 1)));
    ps.forEach((p, i) => p.setAttribute('opacity', (0.35 + 0.55 * (1 - Math.abs(i / (N - 1) - 0.5) * 2)).toFixed(2)));
    /* few points, drawn as one smooth curve (Catmull-Rom as cubic Béziers) */
    const curve = (pts) => {
      let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
        d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
      }
      return d;
    };
    /* chips stay put in the layout and ride the spine with a transform */
    let boxH = svg.clientHeight || H, drawn = -1;
    if ('ResizeObserver' in window) new ResizeObserver(() => { boxH = svg.clientHeight || H; }).observe(svg);
    chips.forEach((c) => { c.style.left = (+c.dataset.u * 100).toFixed(2) + '%'; c.style.top = '0'; });
    loop(svg, (t) => {
      if (t && t - drawn < 1 / 30) return; /* a slow twist needs no more than 30 frames a second */
      drawn = t;
      ps.forEach((p, i) => {
        const k = i / (N - 1) - 0.5, pts = [];
        for (let j = 0; j <= S; j++) {
          const u = j / S, a = u * Math.PI * 1.7 + 0.6 - t * 0.3, w = half(u) * k * 2;
          pts.push([u * W + w * Math.sin(a) * 1.1, spineY(u, t) + w * Math.cos(a)]);
        }
        p.setAttribute('d', curve(pts));
      });
      chips.forEach((c) => {
        const y = spineY(+c.dataset.u, t) + (+c.dataset.k || 0) * H * 0.07;
        c.style.transform = `translate(-50%, calc(-50% + ${((y / H) * boxH).toFixed(1)}px))`;
      });
    });
  }

  /* ---------------- closing fountain: light streams branch off one stem ----------------
     Like the reference: a straight stem with three pairs of branches leaving it at different
     heights, each an S-curve that is vertical where it leaves the stem and again at its tip,
     coloured gold at the stem → lilac → purple → blue at the tip. The streams grow up out of
     the ring when the section arrives; then haloed sparks glide down them into the ring,
     and the ring glows each time one lands. */
  function Fountain() {
    const box = $('#fountain'); if (!box) return;
    const W = 760, H = 560, cx = 380, bot = 520;
    const PAIRS = [[96, 38, 269], [200, 12, 365], [338, 12, 460]]; /* tip offset, tip y, where it leaves the stem */
    const BRANCH = [[0, '#fe881b', 1], [0.18, '#ffd600', 0.85], [0.36, '#f79fff', 0.9], [0.52, '#dd95ff', 0.95], [0.7, '#ac24ff', 1], [0.86, '#8130ff', 0.9], [0.97, '#1b4dfe', 0.5], [1, '#1b4dfe', 0]];
    const STEM = [[0, '#fe881b', 0], [0.1, '#fe881b', 1], [0.44, '#ffd600', 0.85], [0.55, '#f79fff', 0.9], [0.66, '#dd95ff', 0.95], [0.8, '#ac24ff', 1], [0.93, '#8130ff', 0.8], [1, '#1b4dfe', 0]];
    const stops = (S) => S.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('');
    const grads = [`<linearGradient id="fnS" gradientUnits="userSpaceOnUse" x1="${cx}" y1="${bot}" x2="${cx}" y2="0">${stops(STEM)}</linearGradient>`];
    const lines = [`<path class="fn-l" d="M${cx} ${bot}V0" stroke="url(#fnS)" pathLength="100" style="--k:0"/>`];
    const routes = [`M${cx} 0V${bot}`];
    PAIRS.forEach(([dx, yt, yj], i) => [-1, 1].forEach((s) => {
      const xt = cx + s * dx, span = yj - yt, a = span * 0.25, b = span * 0.45, id = `fn${i}${s < 0 ? 'l' : 'r'}`;
      grads.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${cx}" y1="${yj}" x2="${xt}" y2="${yt}">${stops(BRANCH)}</linearGradient>`);
      lines.push(`<path class="fn-l" d="M${cx} ${yj}C${cx} ${yj - a} ${xt} ${yt + b} ${xt} ${yt}" stroke="url(#${id})" pathLength="100" style="--k:${i + 1}"/>`);
      routes.push(`M${xt} ${yt}C${xt} ${yt + b} ${cx} ${yj - a} ${cx} ${yj}V${bot}`);
    }));
    box.innerHTML = `<svg class="fn-lines" viewBox="0 0 ${W} ${H}"><defs>${grads.join('')}<filter id="fnGlow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.6" result="b"/><feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 .6 0" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#fnGlow)">${lines.join('')}</g></svg>`
      + `<svg class="fn-stars" viewBox="0 0 ${W} ${H}"><defs><radialGradient id="fnHalo"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".2" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#f2f2ff" stop-opacity=".14"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`
      + routes.map((d) => `<path d="${d}" fill="none"/>`).join('')
      + routes.map(() => '<g class="fn-star" opacity="0"><circle r="14" fill="url(#fnHalo)"/><circle r="2.3" fill="#fff"/></g>').join('') + '</svg>';
    const rp = $$('.fn-stars path', box), stars = $$('.fn-star', box), ring = $('.close-ring');
    const lens = rp.map((p) => p.getTotalLength());
    const place = (g, ri, p) => { const pt = rp[ri].getPointAtLength(p * lens[ri]); g.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`); };
    if (reduced || !('IntersectionObserver' in window)) {
      box.classList.add('in');
      [[5, 0.32], [2, 0.5], [0, 0.72]].forEach(([ri, p], k) => { place(stars[k], ri, p); stars[k].setAttribute('opacity', '1'); });
      return;
    }
    /* The streams grow long before the section is reached, through the same lazy layer the
       heavy sections use: within about a screen and a half, or in an idle moment after load,
       whichever comes first. So the fountain is already standing when it is looked at, however
       fast the page was scrolled; only the sparks wait for the reader to arrive. */
    const DRAW = 1.63; /* the CSS draw: 1.3s plus the last branch's 330ms delay */
    let inAt = 0;
    const lift = () => { if (inAt) return; inAt = performance.now(); box.classList.add('in'); };
    if (P.near) P.near(box, lift, '150% 0px'); else lift();
    const land = () => {
      if (!ring || !ring.animate) return;
      ring.animate([
        { filter: 'drop-shadow(0 0 8px rgba(202, 69, 255, 0.35))', transform: 'scale(1)' },
        { filter: 'drop-shadow(0 0 24px rgba(202, 69, 255, 0.95))', transform: 'scale(1.06)', offset: 0.22 },
        { filter: 'drop-shadow(0 0 8px rgba(202, 69, 255, 0.35))', transform: 'scale(1)' },
      ], { duration: 1200, easing: 'cubic-bezier(.16, 1, .3, 1)' });
    };
    /* one spark per stream, launched in a staggered order, resting a moment between runs */
    const r = rng(19), SPEED = 165;
    const run = [3, 0, 6, 2, 5, 1, 4].map((ri, k) => ({ ri, g: stars[k], start: 0.35 + k * 0.42, travel: lens[ri] / SPEED }));
    let shown = false;
    loop(box, (t) => {
      /* the first spark waits for the streams it rides to finish drawing: usually none of
         that wait is left, because they grew while the section was still below */
      if (!shown) {
        if (!inAt) return;
        shown = true;
        const left = Math.max(0, DRAW - (performance.now() - inAt) / 1000);
        run.forEach((s) => { s.start += t + left; });
      }
      run.forEach((s) => {
        if (t < s.start) { s.g.setAttribute('opacity', '0'); return; }
        const p = (t - s.start) / s.travel;
        if (p >= 1) { land(); s.start = t + 0.8 + r() * 2.8; s.g.setAttribute('opacity', '0'); return; }
        place(s.g, s.ri, p);
        s.g.setAttribute('opacity', Math.max(0, Math.min(1, p / 0.12, (1 - p) / 0.08)).toFixed(2));
      });
    }, '45% 0px');
  }

  /* ---------------- footer garden: draggable speech bubbles on stems ----------------
     Built only when the footer comes near. Pull a bubble and its stem bends after it,
     let go and it springs home; each pull plays a (demo) voter's voice in the card. */
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

  function Garden() {
    const box = $('#garden'); if (!box) return;
    const card = $('#ftVoice');
    if (!('IntersectionObserver' in window)) { buildGarden(box, card); return; }
    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      io.disconnect(); buildGarden(box, card);
    }, { rootMargin: '700px 0px' });
    io.observe(box);
  }

  function buildGarden(box, card) {
    const FILLS = [['#1b4dfe', '#ac24ff'], ['#ac24ff', '#f79fff'], ['#fe881b', '#ffd600'], ['#b997ff', '#8130ff'], ['#ca45ff', '#fe881b'], ['#8130ff', '#dd95ff']];
    const W = 640, H = 460, plants = [];
    const side = (id, seed) => {
      const r = rng(seed);
      const defs = FILLS.map(([a, b], i) => `<linearGradient id="${id}f${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`).join('')
        + `<linearGradient id="${id}s" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1b4dfe"/><stop offset="1" stop-color="#ca45ff"/></linearGradient>`
        + `<linearGradient id="${id}l0" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1b4dfe"/><stop offset="1" stop-color="#8130ff"/></linearGradient>`
        + `<linearGradient id="${id}l1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8130ff"/><stop offset="1" stop-color="#dd95ff"/></linearGradient>`;
      let out = '';
      const n = 8;
      for (let i = 0; i < n; i++) {
        const bx = 26 + (i / (n - 1)) * 520 + (r() - 0.5) * 36;
        const h = 420 - bx * 0.48 + (r() - 0.5) * 70;
        const hx = bx + (r() - 0.35) * 70, hy = H - h, bend = (r() - 0.5) * 90;
        let leaves = '';
        const nl = 1 + Math.floor(r() * 2);
        for (let l = 0; l < nl; l++) {
          const t = 0.3 + r() * 0.3, ly = H - h * t, lx = bx + bend * t * 0.9, dir = l % 2 ? -1 : 1, rot = dir * (18 + r() * 34) - (dir < 0 ? 180 : 0), sc = 0.55 + r() * 0.55;
          leaves += `<path d="M0 0C22 -20 62 -24 92 -6C62 8 24 12 0 0Z" fill="url(#${id}l${l % 2})" opacity=".92" transform="translate(${lx.toFixed(1)} ${ly.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${sc.toFixed(2)})"/>`;
        }
        const w = 62 + r() * 38, hh = 44 + r() * 20, rx = Math.min(22, hh / 2), x0 = hx - w * 0.32, y0 = hy - hh;
        const f = Math.floor(r() * FILLS.length);
        const bubble = `<path d="M${(x0 + rx).toFixed(1)} ${y0.toFixed(1)}h${(w - 2 * rx).toFixed(1)}a${rx} ${rx} 0 0 1 ${rx} ${rx}v${(hh - 2 * rx).toFixed(1)}a${rx} ${rx} 0 0 1 -${rx} ${rx}H${(hx + 12).toFixed(1)}L${hx.toFixed(1)} ${(hy + 16).toFixed(1)}L${(hx - 2).toFixed(1)} ${(y0 + hh).toFixed(1)}H${(x0 + rx).toFixed(1)}a${rx} ${rx} 0 0 1 -${rx} -${rx}v-${(hh - 2 * rx).toFixed(1)}a${rx} ${rx} 0 0 1 ${rx} -${rx}Z" fill="url(#${id}f${f})"/>`;
        const cxm = x0 + w / 2, cym = y0 + hh / 2;
        const kind = r();
        const inner = kind < 0.45
          ? [-1, 0, 1].map((q) => `<circle cx="${(cxm + q * 11).toFixed(1)}" cy="${cym.toFixed(1)}" r="3.6" fill="#fff"/>`).join('')
          : kind < 0.85
            ? [7, 15, 22, 13, 18, 9].map((v, q) => `<rect x="${(cxm - 21 + q * 7.6).toFixed(1)}" y="${(cym - v / 2).toFixed(1)}" width="3.6" height="${v}" rx="1.8" fill="#fff" opacity=".92"/>`).join('')
            : '';
        const k = plants.length;
        plants.push({ side: id, bx, h, hx, hy, bend, x: 0, y: 0 });
        out += `<g class="pl" data-k="${k}" style="transform-origin:${bx.toFixed(0)}px ${H}px;animation-delay:${(-r() * 8).toFixed(2)}s;animation-duration:${(6 + r() * 4).toFixed(2)}s"><path class="st" fill="none" stroke="url(#${id}s)" stroke-width="${(2.4 + r() * 1.4).toFixed(1)}" stroke-linecap="round"/><g class="lv">${leaves}</g><g class="bh"><g class="bi">${bubble}${inner}</g></g></g>`;
      }
      let dots = '';
      for (let i = 0; i < 12; i++) {
        const c = ['#ffd600', '#fe881b', '#f79fff', '#b997ff'][Math.floor(r() * 4)];
        dots += `<circle class="pd" cx="${(20 + r() * 560).toFixed(1)}" cy="${(40 + r() * 330).toFixed(1)}" r="${(2.5 + r() * 3.5).toFixed(1)}" fill="${c}" style="animation-delay:${(-r() * 6).toFixed(2)}s"/>`;
      }
      return `<svg class="${id}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMinYMax meet" aria-hidden="true"><defs>${defs}</defs>${dots}${out}</svg>`;
    };
    box.innerHTML = side('l', 5) + side('r', 23);

    /* bend the stem after the bubble: the head moves fully, the curve and the leaves partly */
    const draw = (p) => {
      p.st.setAttribute('d', `M${p.bx.toFixed(1)} ${H}Q${(p.bx + p.bend + p.x * 0.45).toFixed(1)} ${(H - p.h * 0.55 + p.y * 0.35).toFixed(1)} ${(p.hx + p.x).toFixed(1)} ${(p.hy + 18 + p.y).toFixed(1)}`);
      p.bh.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
      p.lv.setAttribute('transform', `translate(${(p.x * 0.3).toFixed(1)} ${(p.y * 0.3).toFixed(1)})`);
    };
    $$('.pl', box).forEach((g) => {
      const p = plants[+g.dataset.k];
      p.g = g; p.st = $('.st', g); p.bh = $('.bh', g); p.lv = $('.lv', g); p.svg = g.ownerSVGElement;
      draw(p);
    });

    const gsap = window.gsap;
    const home = (p, from) => {
      if (gsap) {
        gsap.killTweensOf(p);
        if (from) { p.x = from.x; p.y = from.y; }
        gsap.to(p, { x: 0, y: 0, duration: reduced ? 0.25 : 1.3, ease: reduced ? 'power2.out' : 'elastic.out(1, 0.3)', onUpdate: () => draw(p) });
      } else { p.x = 0; p.y = 0; draw(p); }
    };

    /* the voice card */
    const q = card && $('.fv-q', card), tag = card && $('.fv-tag', card), cnt = card && $('.fv-count', card);
    const heard = new Set(); let vi = -1;
    const speak = (p) => {
      vi = (vi + 1) % VOICES.length;
      const [text, issue, s, who] = VOICES[vi];
      heard.add(vi);
      if (p) p.g.classList.add('is-heard');
      if (!card) return;
      card.classList.add('is-on');
      q.textContent = `“${text}”`;
      q.classList.remove('swap'); void q.offsetWidth; q.classList.add('swap');
      tag.textContent = `${issue} · ${SENT[s]}`; tag.dataset.s = s;
      cnt.textContent = heard.size === VOICES.length ? `All 8 heard · ${who}` : `${who} · ${heard.size} of 8 heard`;
      clearTimeout(speak.t); speak.t = setTimeout(() => card.classList.remove('is-on'), 3200);
    };

    /* drag: pointer moves map to SVG units, the right garden is mirrored, pull is rubber-banded */
    const MAX = 150;
    const band = (d) => Math.sign(d) * MAX * (1 - Math.exp(-Math.abs(d) / MAX));
    let drag = null;
    box.addEventListener('pointerdown', (e) => {
      const g = e.target.closest('.pl'); if (!g || !e.target.closest('.bh')) return;
      const p = plants[+g.dataset.k];
      if (gsap) gsap.killTweensOf(p);
      const rect = p.svg.getBoundingClientRect();
      drag = { p, id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: p.x, oy: p.y, k: W / rect.width, flip: p.side === 'r' ? -1 : 1, moved: false };
      try { e.target.closest('.bh').setPointerCapture(e.pointerId); } catch (err) { /* synthetic or stale pointer */ }
      g.classList.add('is-held');
      speak(p);
      e.preventDefault();
    });
    box.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = (e.clientX - drag.sx) * drag.k * drag.flip, dy = (e.clientY - drag.sy) * drag.k;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      drag.p.x = band(drag.ox + dx); drag.p.y = band(drag.oy + dy);
      draw(drag.p);
    });
    const end = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const p = drag.p;
      p.g.classList.remove('is-held');
      /* a plain tap still gets a small pluck so it feels alive */
      if (!drag.moved && !reduced) home(p, { x: 0, y: -26 }); else home(p);
      drag = null;
    };
    box.addEventListener('pointerup', end);
    box.addEventListener('pointercancel', end);

    /* keyboard and mouse users without a drag: pluck the next bubble from the card */
    const next = card && $('.fv-next', card);
    if (next) {
      let pi = 0;
      next.addEventListener('click', () => {
        const visible = plants.filter((p) => p.svg.getBoundingClientRect().width > 0);
        const p = visible[(pi = (pi + 5) % visible.length)] || plants[0];
        speak(p);
        if (!reduced) home(p, { x: (pi % 2 ? 1 : -1) * 34, y: -40 });
      });
    }

    if (!reduced) {
      new IntersectionObserver((es) => es.forEach((e) => box.classList.toggle('is-live', e.isIntersecting))).observe(box);
    }
  }

  const run = (name, f) => { try { f(); } catch (e) { console.error('[' + name + ']', e); } };
  function init() {
    run('stars', Stars);
    run('horizon', Horizon);
    run('cycle', Cycle);
    run('featpath', FeatPath);
    run('ribbons', Ribbons);
    run('fountain', Fountain);
    run('garden', Garden);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
