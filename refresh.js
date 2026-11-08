/* ==========================================================================
   Section refresh · figures and motion for Why, Voice, Trust and Roadmap
   (styles in refresh.css). Loops run only while their section is on screen;
   under reduced motion everything is drawn once and holds still.
   ========================================================================== */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const f1 = (n) => n.toFixed(1);
  const rng = (s) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const watch = (el, cb, threshold = 0) => {
    if (!('IntersectionObserver' in window)) { cb(true); return; }
    new IntersectionObserver((es) => es.forEach((e) => cb(e.isIntersecting)), { threshold }).observe(el);
  };
  const restart = (el) => { el.style.transition = 'none'; void getComputedStyle(el).strokeDashoffset; el.style.transition = ''; };

  /* ---------------- why: the orb verdict ---------------- */
  function Why() {
    const root = $('#wy'), orb = $('#wyOrb'); if (!root || !orb) return;
    const olds = $$('.wy-old .wy-card', root), news = $$('.wy-new .wy-card', root), n = olds.length;
    const C = 300, R = 262, r = rng(11);
    let rose = '', ell = '', sparks = '';
    for (let i = 0; i < 32; i++) { const a = (i / 32) * Math.PI * 2; rose += `<circle cx="${f1(C + (R / 2) * Math.cos(a))}" cy="${f1(C + (R / 2) * Math.sin(a))}" r="${R / 2}" stroke="${i % 2 ? '#f79fff' : '#6d6cff'}"/>`; }
    for (let i = 0; i < 16; i++) ell += `<ellipse cx="${C + R * 0.5}" cy="${C}" rx="${R * 0.5}" ry="${R * 0.24}" transform="rotate(${(i * 360) / 16} ${C} ${C})"/>`;
    const SC = ['#8130ff', '#fe881b', '#ca45ff', '#2ba7ff', '#ac24ff'];
    for (let i = 0; i < 11; i++) {
      const a = r() * Math.PI * 2, d = 56 + r() * (R - 84), x = C + d * Math.cos(a), y = C + d * Math.sin(a), c = SC[i % SC.length], s = 2.6 + r() * 2.2;
      sparks += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(s * 3.4)}" fill="${c}" opacity=".2"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(s)}" fill="${c}"/>`;
    }
    /* back, two turning mesh rings, front (core, rim), turning sparks. The rings sit
       inside the rim by construction, so they need no clip */
    const layer = (cls, body) => `<div class="wy-rot ${cls}"><svg viewBox="0 0 600 600" focusable="false">${body}</svg></div>`;
    orb.innerHTML = `<svg viewBox="0 0 600 600" focusable="false">
      <defs>
        <linearGradient id="wyRim" x1=".12" y1=".88" x2=".88" y2=".12"><stop offset="0" stop-color="#ffd600"/><stop offset=".22" stop-color="#fe881b"/><stop offset=".48" stop-color="#f79fff"/><stop offset=".72" stop-color="#ac24ff"/><stop offset="1" stop-color="#1b4dfe"/></linearGradient>
        <radialGradient id="wyFill" cx=".3" cy=".28" r=".9"><stop offset="0" stop-color="#e9ebff"/><stop offset=".5" stop-color="#f6ecff"/><stop offset="1" stop-color="#ffe6cf"/></radialGradient>
        <radialGradient id="wyCore"><stop offset="0" stop-color="#fff"/><stop offset=".42" stop-color="#fff" stop-opacity=".92"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <filter id="wyBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
      </defs>
      <circle cx="${C}" cy="${C}" r="${R}" fill="url(#wyFill)"/>
    </svg>
    ${layer('', `<g fill="none" stroke-width=".9" opacity=".5">${rose}</g>`)}
    ${layer('rev', `<g fill="none" stroke="#ac24ff" stroke-width=".7" opacity=".22">${ell}</g>`)}
    <svg class="wy-front" viewBox="0 0 600 600" focusable="false">
      <circle cx="${C}" cy="${C}" r="108" fill="url(#wyCore)"/>
      <circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="url(#wyRim)" stroke-width="18" opacity=".55" filter="url(#wyBlur)"/>
      <circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="url(#wyRim)" stroke-width="8"/>
    </svg>
    ${layer('wy-sparks', sparks)}`;

    let on = -1, timer = 0, hover = false, live = false;
    const set = (i) => {
      if (i === on) return;
      olds.forEach((c, j) => c.classList.toggle('is-on', j === i));
      news.forEach((c, j) => c.classList.toggle('is-on', j === i));
      on = i;
    };
    const tick = () => {
      clearTimeout(timer);
      if (!live || hover || reduced) return;
      timer = setTimeout(() => { set((on + 1) % n); tick(); }, 3600);
    };
    [...olds, ...news].forEach((c, j) => {
      c.addEventListener('pointerenter', (e) => { if (e.pointerType === 'touch') return; hover = true; clearTimeout(timer); set(j % n); });
      c.addEventListener('pointerleave', () => { hover = false; tick(); });
      c.addEventListener('click', () => set(j % n));
    });
    watch(root, (v) => {
      live = v; root.classList.toggle('is-live', v && !reduced);
      if (v && on < 0) set(0);
      tick();
    }, 0.2);
  }

  /* ---------------- voice: one clip climbs the ribbon ---------------- */
  function VoiceFlow() {
    const st = $('#vwStage'), svg = $('#vwRibbon'), clip = $('#vwClip'), btn = $('#vwPlay'), bars = $('#vwBars');
    if (!st || !svg) return;
    const steps = $$('.vw-step', st), dot = $('.vw-dot', st);
    const r = rng(23); let b = '';
    for (let i = 0; i < 34; i++) { const h = 24 + Math.abs(Math.sin(i * 0.55)) * 52 + r() * 24; b += `<i style="--h:${Math.round(h)}%;--dl:${(-i * 0.09).toFixed(2)}s"></i>`; }
    if (bars) bars.innerHTML = b;

    // ribbon centre line, stage pixels: low on the left, climbing in steps to the right
    const W = 1400, N = 34, STEP = 35;
    const KEYS = {
      d: [[0, 596], [0.1, 582], [0.2, 540], [0.3, 488], [0.38, 470], [0.46, 502], [0.53, 478], [0.62, 424], [0.72, 402], [0.78, 410], [0.86, 364], [1, 330]],
      m: [[0, 112], [0.25, 96], [0.45, 70], [0.55, 80], [0.75, 52], [1, 36]],
    };
    const SPREAD = { d: 92, m: 44 };
    let mode = 'd', H = 660, phase = 0;
    const cr = (p0, p1, p2, p3, t) => 0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (3 * p1 - p0 - 3 * p2 + p3) * t * t * t);
    const yAt = (u) => {
      const K = KEYS[mode]; let i = 0;
      while (i < K.length - 2 && u > K[i + 1][0]) i++;
      const t = Math.max(0, Math.min(1, (u - K[i][0]) / (K[i + 1][0] - K[i][0])));
      const g = (j) => K[Math.max(0, Math.min(K.length - 1, j))][1];
      return cr(g(i - 1), g(i), g(i + 1), g(i + 2), t);
    };

    svg.innerHTML = `<defs>
        <linearGradient id="vwG" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0"><stop offset="0" stop-color="#1b4dfe"/><stop offset=".22" stop-color="#6d6cff"/><stop offset=".4" stop-color="#ac24ff"/><stop offset=".53" stop-color="#f79fff"/><stop offset=".7" stop-color="#fe881b"/><stop offset=".88" stop-color="#ffb340"/><stop offset="1" stop-color="#ffd600"/></linearGradient>
        <linearGradient id="vwFade" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".07" stop-color="#fff"/><stop offset=".93" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <mask id="vwMask" maskUnits="userSpaceOnUse" x="-10" y="-200" width="${W + 20}" height="1200"><rect x="-10" y="-200" width="${W + 20}" height="1200" fill="url(#vwFade)"/></mask>
      </defs>
      <g mask="url(#vwMask)"><path class="vw-glow" fill="none" stroke="url(#vwG)" stroke-width="26" stroke-linecap="round" opacity=".1"/>
      <g class="ln" fill="none" stroke="url(#vwG)" stroke-width="1" opacity=".62">${Array.from({ length: N }, (_, j) => `<path pathLength="1" style="--dl:${(j * 14)}ms"/>`).join('')}</g></g>`;
    const lines = $$('.ln path', svg), glow = $('.vw-glow', svg);

    // points to one smooth curve (Catmull-Rom as cubic Béziers), so no joins show
    const smooth = (ys) => {
      let d = 'M0 ' + f1(ys[0]);
      for (let i = 0; i < ys.length - 1; i++) {
        const y0 = ys[Math.max(0, i - 1)], y1 = ys[i], y2 = ys[i + 1], y3 = ys[Math.min(ys.length - 1, i + 2)], x1 = i * STEP;
        d += `C${f1(x1 + STEP / 3)} ${f1(y1 + (y2 - y0) / 6)} ${f1(x1 + (STEP * 2) / 3)} ${f1(y2 - (y3 - y1) / 6)} ${x1 + STEP} ${f1(y2)}`;
      }
      return d;
    };
    const XS = Array.from({ length: W / STEP + 1 }, (_, i) => i * STEP);
    const draw = () => {
      const S = SPREAD[mode], base = XS.map((x) => yAt(x / W));
      for (let j = 0; j < N; j++) {
        const s = j / (N - 1) - 0.5;
        lines[j].setAttribute('d', smooth(XS.map((x, i) => { const u = x / W; return base[i] + s * S * Math.cos(Math.PI * 2 * u * 1.25 + phase) + Math.sin(u * 9 + j * 0.35 + phase * 1.6) * 2.2; })));
      }
      glow.setAttribute('d', smooth(base));
    };
    const narrow = window.matchMedia('(max-width: 860px)');
    const layout = () => {
      mode = narrow.matches ? 'm' : 'd'; H = mode === 'd' ? 660 : 140;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const w = st.clientWidth || 1;
      steps.forEach((s, i) => {
        const line = $('.vw-line', s);
        if (mode === 'd') {
          const u = (s.offsetLeft + line.offsetLeft) / w, top = s.offsetTop + line.offsetTop;
          line.style.setProperty('--h', Math.max(40, yAt(u) - top) + 'px');
          s.dataset.u = u.toFixed(3);
        } else s.dataset.u = String([0.16, 0.4, 0.64, 0.88][i]);
      });
      draw();
    };

    /* the light travels as one Web Animation sampled from the ribbon, so it glides on the
       compositor; the steps light on timers placed where the eased light reaches them */
    let running = false;
    const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
    const when = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u < 0.5 ? Math.sqrt(u / 2) : 1 - Math.sqrt(2 * (1 - u)) / 2);
    const runClip = () => {
      if (running) return;
      running = true;
      steps.forEach((s) => s.classList.remove('is-lit', 'is-hot'));
      st.classList.add('is-armed'); clip.classList.add('is-playing'); btn.setAttribute('aria-pressed', 'true');
      const T = reduced ? 0 : 4600, w = st.clientWidth, K = 48;
      if (T && dot.animate) {
        dot.animate(Array.from({ length: K + 1 }, (_, k) => {
          const p = k / K, u = ease(p);
          return { offset: p, translate: `${f1(u * w)}px ${f1(yAt(u))}px`, opacity: k === 0 || k === K ? 0 : 1 };
        }), { duration: T, easing: 'linear' });
      }
      steps.forEach((s) => {
        const u = +s.dataset.u + 0.01;
        setTimeout(() => s.classList.add('is-lit', 'is-hot'), T * when(u));
        setTimeout(() => s.classList.remove('is-hot'), T * when(u + 0.14));
      });
      setTimeout(() => {
        clip.classList.remove('is-playing'); btn.setAttribute('aria-pressed', 'false');
        steps.forEach((s) => { s.classList.add('is-lit'); s.classList.remove('is-hot'); });
        running = false;
      }, T + 30);
    };
    btn.addEventListener('click', runClip);

    /* the ribbon is drawn once: the travelling light is its motion */
    let played = false;
    watch(st, (v) => {
      if (!v) return;
      svg.classList.add('is-drawn');
      if (!played) { played = true; setTimeout(runClip, reduced ? 0 : 900); }
    }, 0.3);
    layout();
  }

  /* ---------------- trust: rings, sweep and the silence dial ---------------- */
  function TrustRadar() {
    const tz = $('#tz'), viz = $('#tzViz'); if (!tz || !viz) return;
    const CX = 300, CY = 330, RS = [252, 206, 162, 120, 80], ANG = [-38, 206, 22, 148, 300];
    const ICON = ['globe', 'lock', 'users', 'finger', 'mic'], NAME = ['Hosted in India', 'Encrypted', 'Your seats only', 'Kept apart', 'Anonymised'];
    const pt = (r, a) => [CX + r * Math.cos((a * Math.PI) / 180), CY + r * Math.sin((a * Math.PI) / 180)];
    const r = rng(5);
    // trailing wedge: thin slices fading away from the leading edge
    let wedge = '';
    for (let i = 0; i < 14; i++) {
      const a0 = -i * 3.4, a1 = a0 - 3.6, [x0, y0] = pt(252, a0), [x1, y1] = pt(252, a1);
      wedge += `<path d="M${CX} ${CY}L${f1(x0)} ${f1(y0)}A252 252 0 0 0 ${f1(x1)} ${f1(y1)}Z" fill="#c9a6ff" opacity="${(0.26 * Math.pow(1 - i / 14, 1.6)).toFixed(3)}"/>`;
    }
    let dots = '';
    for (let i = 0; i < 30; i++) { const a = -r() * 46, d = 46 + r() * 200, [x, y] = pt(d, a); dots += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(1.4 + r() * 1.4)}" fill="#fff" opacity="${(0.25 + 0.7 * (1 + a / 46)).toFixed(2)}"/>`; }
    const [ex, ey] = pt(252, 0);
    const rings = RS.map((rr, i) => `<circle class="tz-ring" data-k="${i}" cx="${CX}" cy="${CY}" r="${rr}"/>`).join('');
    const nodes = RS.map((rr, i) => {
      const [x, y] = pt(rr, ANG[i]), right = Math.cos((ANG[i] * Math.PI) / 180) > 0;
      return `<g class="tz-node" data-k="${i}"><circle cx="${f1(x)}" cy="${f1(y)}" r="15" stroke-width="1"/><use href="#i-${ICON[i]}" x="${f1(x - 8)}" y="${f1(y - 8)}" width="16" height="16"/><text x="${f1(x + (right ? -24 : 24))}" y="${f1(y + 5)}" text-anchor="${right ? 'end' : 'start'}">${NAME[i]}</text></g>`;
    }).join('');
    // the final week as a dial: the last 48 hours before polling ends are silent
    const a0 = -90 - 360 * (2 / 7), [sx, sy] = pt(272, a0), [tx, ty] = pt(272, -90), arc = `M${f1(sx)} ${f1(sy)}A272 272 0 0 1 ${f1(tx)} ${f1(ty)}`;
    let ticks = '';
    for (let i = 0; i < 28; i++) { const a = -90 + i * (360 / 28), major = i % 4 === 0, [x0, y0] = pt(major ? 280 : 283, a), [x1, y1] = pt(292, a); ticks += `<line x1="${f1(x0)}" y1="${f1(y0)}" x2="${f1(x1)}" y2="${f1(y1)}" stroke="rgba(221,149,255,${major ? 0.55 : 0.25})" stroke-width="${major ? 1.6 : 1}"/>`; }
    const [lx, ly] = pt(226, -90 - 180 / 7);
    /* rings behind, the sweep on its own turning layer (the viewBox centre is the radar's centre,
       so the layer simply rotates about its middle on the compositor), orb, nodes and dial in front */
    viz.innerHTML = `<svg viewBox="0 0 600 660" focusable="false">
      <defs>
        <radialGradient id="tzOrb" cx=".38" cy=".34" r=".7"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#ddd2ff"/><stop offset="1" stop-color="#8f7bd6"/></radialGradient>
        <radialGradient id="tzHalo"><stop offset="0" stop-color="#c9a6ff" stop-opacity=".55"/><stop offset="1" stop-color="#c9a6ff" stop-opacity="0"/></radialGradient>
        <linearGradient id="tzArcG" gradientUnits="userSpaceOnUse" x1="${f1(sx)}" y1="${f1(sy)}" x2="${f1(tx)}" y2="${f1(ty)}"><stop offset="0" stop-color="#8130ff"/><stop offset=".6" stop-color="#ca45ff"/><stop offset="1" stop-color="#f79fff"/></linearGradient>
      </defs>
      <g class="tz-rings">${rings}</g>
    </svg>
    <div class="tz-sweep"><svg viewBox="0 0 600 660" focusable="false"><g class="tz-wedge">${wedge}</g><line x1="${CX}" y1="${CY}" x2="${f1(ex)}" y2="${f1(ey)}" stroke="#dd95ff" stroke-opacity=".7" stroke-width="1.2"/>${dots}</svg></div>
    <svg viewBox="0 0 600 660" focusable="false">
      <g class="tz-rings">
        <circle cx="${CX}" cy="${CY}" r="70" fill="url(#tzHalo)"/><circle cx="${CX}" cy="${CY}" r="33" fill="url(#tzOrb)"/>
        <text class="tz-orbtxt" x="${CX}" y="${CY + 62}" text-anchor="middle" fill="#cbbfea" style="font:600 13px var(--font)">Voter data</text>
        ${nodes}
      </g>
      <g class="tz-dial">
        ${ticks}
        <path class="tz-arc-off" d="${arc}"/><path class="tz-arc" d="${arc}"/>
        <text x="${CX}" y="${CY - 300}" text-anchor="middle">Polling ends</text>
        <text class="tz-big" x="${f1(lx)}" y="${f1(ly)}" text-anchor="middle">48 h</text>
        <text x="${f1(lx)}" y="${f1(ly + 20)}" text-anchor="middle">silence</text>
        <text x="${CX}" y="${CY + 300}" text-anchor="middle">The final week of a campaign</text>
        <g class="tz-lock"><circle cx="${CX}" cy="${CY}" r="58" fill="#131316" stroke="rgba(221,149,255,.35)"/>
          <path class="tz-shackle" d="M${CX - 12} ${CY - 4}v-9a12 12 0 0 1 24 0v9" fill="none" stroke="#dd95ff" stroke-width="4" stroke-linecap="round"/>
          <rect x="${CX - 19}" y="${CY - 5}" width="38" height="30" rx="7" fill="#8130ff"/><circle cx="${CX}" cy="${CY + 9}" r="3.6" fill="#fff"/></g>
        <text class="tz-lockstate" x="${CX}" y="${CY + 84}" text-anchor="middle">Exports locked</text>
      </g>
    </svg>`;
    const ringEls = $$('.tz-ring', viz), nodeEls = $$('.tz-node', viz), lockTxt = $('.tz-lockstate', viz);

    const tabs = [$('#tzTabP'), $('#tzTabL')], panes = [$('#tzProtect'), $('#tzLaw')];
    const lists = [panes[0], $('.tz-list', panes[1])];
    const items = (m) => $$('.tz-item', lists[m]);
    const DWELL = 4800;
    let mode = 0, idx = [0, 0], timer = 0, auto = !reduced, live = false, paused = false;
    tz.style.setProperty('--dwell', DWELL + 'ms');
    const open = (m, i) => {
      idx[m] = i;
      items(m).forEach((li, j) => { const on = j === i; li.classList.toggle('is-on', on); li.firstElementChild.setAttribute('aria-expanded', String(on)); });
      if (m === 0) {
        ringEls.forEach((c, j) => c.classList.toggle('is-on', j === i));
        nodeEls.forEach((g, j) => g.classList.toggle('is-on', j === i));
        tz.classList.toggle('is-log', i === 5);
      }
    };
    const tick = () => {
      clearTimeout(timer);
      const go = auto && live && !paused;
      tz.classList.toggle('is-auto', go);
      if (!go) return;
      timer = setTimeout(() => { open(mode, (idx[mode] + 1) % items(mode).length); tick(); }, DWELL);
    };
    lists.forEach((list, m) => list.addEventListener('click', (e) => {
      const btn = e.target.closest('.tz-item > button'); if (!btn) return;
      auto = false; open(m, items(m).indexOf(btn.parentElement)); tick();
    }));
    const setMode = (m, focus) => {
      mode = m; tz.dataset.mode = m ? 'law' : 'protect';
      tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(j === m)); t.tabIndex = j === m ? 0 : -1; });
      panes.forEach((p, j) => { p.hidden = j !== m; });
      if (focus) tabs[m].focus();
      open(m, idx[m]); tick();
    };
    tabs.forEach((t, j) => {
      t.addEventListener('click', () => setMode(j));
      t.addEventListener('keydown', (e) => {
        const k = { ArrowRight: 1, ArrowLeft: -1, Home: -9, End: 9 }[e.key]; if (!k) return;
        e.preventDefault(); setMode(Math.abs(k) === 9 ? (k > 0 ? 1 : 0) : (j + k + 2) % 2, true);
      });
    });
    const copy = $('.tz-copy', tz);
    copy.addEventListener('pointerenter', () => { paused = true; tick(); });
    copy.addEventListener('pointerleave', () => { paused = false; tick(); });
    copy.addEventListener('focusin', () => { paused = true; tick(); });
    copy.addEventListener('focusout', () => { paused = false; tick(); });
    const sw = $('#tzSilence'), txt = $('#tzSilenceTxt');
    sw.addEventListener('click', () => {
      const on = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', String(on));
      txt.textContent = on ? 'On: publishing and exports are locked during notified windows.' : 'Off: publishing is open. It switches on by itself when a silence window starts.';
      tz.classList.toggle('is-open', !on);
      lockTxt.textContent = on ? 'Exports locked' : 'Publishing open';
    });
    open(0, 0);
    watch(tz, (v) => { live = v; tz.classList.toggle('is-live', v && !reduced); tick(); }, 0.3);
  }

  /* ---------------- roadmap: the beam follows the stage you look at ---------------- */
  function Road() {
    const sec = $('#next'), list = $('#rmx'); if (!sec || !list) return;
    const beam = $('.rmx-beam', sec), cards = $$('.rmx-card', list);
    /* the beam slides with a transform: an offset in px from the section's centre */
    const aim = (c) => {
      let dx = 0;
      if (c) { const s = sec.getBoundingClientRect(), b = c.getBoundingClientRect(); dx = b.left + b.width / 2 - (s.left + s.width / 2); }
      beam.style.setProperty('--bdx', dx.toFixed(1) + 'px');
      cards.forEach((k) => k.classList.toggle('is-on', k === c));
    };
    cards.forEach((c) => c.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') aim(c); }));
    list.addEventListener('pointerleave', () => aim(null));
    const top = () => beam.style.setProperty('--bt', Math.max(0, list.offsetTop - 110) + 'px');
    top(); window.addEventListener('resize', top);
    watch(sec, (v) => { if (v) sec.classList.add('is-lit'); }, 0.15);
  }

  /* -------- how it works (teaser): one clip walks the eight steps -------- */
  function Proof() {
    const root = $('#proof'); if (!root) return;
    const steps = $$('.pf-step', root), bead = $('#pfBead', root);
    const num = $('#pfNum', root), secs = $('#pfSec', root), wave = $('#pfWave', root);
    const numWrap = $('#pfNumWrap', root), okRow = $('#pfOk', root);
    const state = $('#pfState', root), use = $('#pfUse', root);
    if (!steps.length || !bead) return;

    /* the orb's waveform: fifteen bars, each on its own phase */
    if (wave && !wave.children.length) {
      const r = rng(7); let h = '';
      for (let i = 0; i < 15; i++) h += `<i style="--h:${Math.round(11 + r() * 25)}px;--d:${(r() * -1.15).toFixed(2)}s"></i>`;
      wave.innerHTML = h;
    }

    const COL = steps.map((s) => s.style.getPropertyValue('--c').trim() || '#ca45ff');
    const CLOCK = [3, 9, 14, 23, 38, 52, 61, 68];      /* the clock on the card at each stop */
    const DASH = '···';
    const SCORE = [DASH, DASH, DASH, DASH, DASH, '+2.1', '+4.4', '+6.2'];
    let at = 0, timer = 0, live = false;

    /* the travelling glow sits on the stop that is working, in either direction */
    const place = (i) => {
      const d = $('.pf-dot', steps[i]); if (!d) return;
      const t = bead.parentElement.getBoundingClientRect(), b = d.getBoundingClientRect();
      bead.style.setProperty('--bx', (b.left + b.width / 2 - t.left).toFixed(1) + 'px');
      bead.style.setProperty('--by', (b.top + b.height / 2 - t.top).toFixed(1) + 'px');
      bead.style.setProperty('--bc', COL[i]);
    };
    const lit = (n) => steps.forEach((s, i) => s.classList.toggle('is-on', i < n));
    const show = (i) => {
      at = i; lit(i + 1); place(i);
      if (secs) secs.textContent = CLOCK[i] + 's';
      if (num) num.textContent = SCORE[i];
      /* the card only claims "verified" once the Verify stop has run, and only
         shows a score once Analyse has scored it */
      const ok = i >= 3;
      if (state) state.textContent = ok ? 'Verified in' : 'Listening';
      if (use) use.setAttribute('href', ok ? '#i-checkc' : '#i-clock');
      if (okRow) okRow.classList.toggle('is-ok', ok);
      if (numWrap) numWrap.classList.toggle('is-wait', i < 5);
    };

    const step = () => {
      if (!live || reduced) return;
      show(at);
      root.classList.add('is-run');
      const last = at === steps.length - 1;
      timer = setTimeout(() => {
        if (!last) { at += 1; step(); return; }
        /* a breath on the finished card, then the next clip starts at the door */
        root.classList.remove('is-run'); lit(0); at = 0; place(0);
        timer = setTimeout(step, 620);
      }, last ? 2900 : 780);
    };

    if (reduced) { requestAnimationFrame(() => { show(steps.length - 1); root.classList.add('is-run'); }); return; }
    watch(root, (v) => {
      live = v; root.classList.toggle('is-live', v);
      clearTimeout(timer); timer = 0;
      if (v) step();
    }, 0.2);
    window.addEventListener('resize', () => { if (live) place(at); });
  }


  /* ---------------- glance: one area read three ways ----------------
     The index teaser used to be a headline and two buttons. It now has to
     earn the claim: the same area is read on the living map, in the
     dashboard tile and by the AI analyst, from the same demo database.
     A tour walks four districts; any click (map or chip) hands over. */
  function Glance() {
    const root = $('#glance'), box = $('#glMap'); if (!root || !box || !window.PI) return;
    const P = window.PI;
    const { DISTS, PARTY, IN, pc, sgn, moeTxt, STATE, legendHTML, METRICS, seatClass } = P;
    const tip = $('#glTip'), pips = $('#glPips'), timer = $('#glTimer');
    const DWELL = 5200;

    const TE_D = {
      1: 'శ్రీకాకుళం', 2: 'పార్వతీపురం మన్యం', 3: 'విజయనగరం', 4: 'విశాఖపట్నం', 5: 'అల్లూరి సీతారామరాజు',
      6: 'పోలవరం', 7: 'అనకాపల్లి', 8: 'కాకినాడ', 9: 'కోనసీమ', 10: 'తూర్పు గోదావరి', 11: 'పశ్చిమ గోదావరి',
      12: 'ఏలూరు', 13: 'ఎన్టీఆర్', 14: 'కృష్ణా', 15: 'గుంటూరు', 16: 'పల్నాడు', 17: 'బాపట్ల', 18: 'ప్రకాశం',
      19: 'మార్కాపురం', 20: 'నెల్లూరు', 21: 'తిరుపతి', 22: 'వైఎస్సార్ కడప', 23: 'అన్నమయ్య', 24: 'నంద్యాల',
      25: 'కర్నూలు', 26: 'అనంతపురం', 27: 'శ్రీ సత్యసాయి', 28: 'చిత్తూరు',
    };
    const TE_I = {
      Jobs: 'ఉద్యోగాలు', 'Drinking water': 'తాగునీరు', Irrigation: 'సాగునీరు', 'Farm prices': 'పంట ధరలు',
      Prices: 'ధరలు', Roads: 'రోడ్లు', Traffic: 'ట్రాఫిక్', Migration: 'వలసలు', Healthcare: 'వైద్యం',
      Housing: 'ఇళ్ల వసతి', Drainage: 'మురుగు కాలువలు', MLA: 'ఎమ్మెల్యే పనితీరు', Education: 'విద్య',
    };
    const TE_S = { Safe: 'సురక్షిత ఆధిక్యం', Lean: 'స్వల్ప ఆధిక్యం', 'Toss-up': 'హోరాహోరీ' };
    const b = (s) => '<b>' + s + '</b>';
    const pts = (n) => sgn(n, 1) + ' pts';

    /* who leads how many of an area's seats */
    const seatsLed = (d) => {
      const c = {};
      d.list.forEach((a) => (c[a.lead] = (c[a.lead] || 0) + 1));
      return c;
    };

    function stopFor(id) {
      if (!id) {
        const topDs = DISTS.filter((d) => d.agg.top === STATE.top).length;
        return {
          id: 0, s: STATE, name: 'Andhra Pradesh', where: 'Andhra Pradesh · all 28 districts',
          seats: '175', seatsL: 'seats surveyed',
          q: 'Where does the state stand in Round 2?',
          qte: 'రౌండ్ 2లో రాష్ట్రం ఎక్కడ ఉంది?',
          a: `Across all 28 districts positive mood is ${b(pc(STATE.pos))}, ${STATE.d1 >= 0 ? 'up' : 'down'} ${b(pts(STATE.d1))} since Round 1. ${b(PARTY[STATE.lead].name)} and ${b(PARTY[STATE.second].name)} are level, ${b(STATE.margin.toFixed(1) + ' pts')} apart. ${b(STATE.top)} is the first issue voters raise, in ${b(topDs)} of the 28 districts.`,
          ate: `మొత్తం 28 జిల్లాల్లో సానుకూల మూడ్ ${b(pc(STATE.pos))} — రౌండ్ 1 కంటే ${b(Math.abs(STATE.d1).toFixed(1) + ' పాయింట్లు')} ${STATE.d1 >= 0 ? 'ఎక్కువ' : 'తక్కువ'}. ${b('పార్టీ ' + STATE.lead)}, ${b('పార్టీ ' + STATE.second)} మధ్య తేడా ${b(STATE.margin.toFixed(1) + ' పాయింట్')} మాత్రమే. ఓటర్లు ముందుగా చెప్పే సమస్య ${b(TE_I[STATE.top] || STATE.top)} — 28లో ${b(String(topDs))} జిల్లాల్లో.`,
        };
      }
      const d = DISTS[id - 1], s = d.agg, led = seatsLed(d), cls = seatClass(s.margin);
      const mine = led[s.lead] || 0;
      return {
        id, s, name: d.name, where: d.name + ' district',
        seats: mine + ' of ' + s.n, seatsL: 'seats led by ' + PARTY[s.lead].name,
        q: `What is driving ${d.name} right now?`,
        qte: `${TE_D[id] || d.name} జిల్లాలో ఏం జరుగుతోంది?`,
        a: `Positive mood in ${b(d.name)} is ${b(pc(s.pos))}, ${s.d1 >= 0 ? 'up' : 'down'} ${b(pts(s.d1))} since Round 1. Voters name ${b(s.top.toLowerCase())} first, ${b(Math.round(s.iss[0][1]) + '%')} of them. ${b(PARTY[s.lead].name)} leads by ${b(s.margin.toFixed(1) + ' pts')} — ${cls.toLowerCase()} — and is ahead in ${b(mine)} of its ${b(s.n)} seats.`,
        ate: `${b(TE_D[id] || d.name)} జిల్లాలో సానుకూల మూడ్ ${b(pc(s.pos))} — రౌండ్ 1 కంటే ${b(Math.abs(s.d1).toFixed(1) + ' పాయింట్లు')} ${s.d1 >= 0 ? 'ఎక్కువ' : 'తక్కువ'}. ఓటర్లు ముందుగా చెప్పేది ${b(TE_I[s.top] || s.top)} (${b(Math.round(s.iss[0][1]) + '%')}). ${b('పార్టీ ' + s.lead)} ${b(s.margin.toFixed(1) + ' పాయింట్ల')} ఆధిక్యంలో — ${TE_S[cls] || cls}; ${b(String(s.n))} స్థానాల్లో ${b(String(mine))} చోట్ల ముందంజ.`,
      };
    }

    /* the tour: the state, then four districts that read differently —
       a coastal lead, a toss-up on water, a clean sweep, a flat round */
    const TOUR = [0, 4, 25, 15, 21].map(stopFor);
    const map = P.MapView(box, {
      level: 'district', metric: 'sent', labels: true, labelMin: 5600, labelSize: 12.5, tip: false,
      onSelect: (en) => { if (en.kind === 'district') { hold(); show(stopFor(en.id)); } },
    });
    /* labels are drawn in viewBox units, so a narrow map needs bigger type
       and fewer of them to stay legible */
    const fitLabels = () => {
      const w = box.clientWidth || 640, k = 1028 / w;
      map.set({ labelSize: Math.round(11.5 * k * 10) / 10, labelMin: w < 520 ? 1e9 : w < 640 ? 9000 : 5600 });
    };
    fitLabels();
    const leg = $('#glLegend'); if (leg) leg.innerHTML = legendHTML(METRICS.sent.legend('district'));

    pips.innerHTML = TOUR.map((t, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-i="${i}">${t.id ? t.name : 'Whole state'}</button>`).join('');
    const pipEls = $$('button', pips);

    const el = {
      where: $('#glWhere'), big: $('#glBig'), delta: $('#glDelta'), h2h: $('#glH2h'), stats: $('#glStats'),
      q: $('#glQ'), a: $('#glA'), src: $('#glSrc'),
    };
    let lang = 'en', at = 0, cur = TOUR[0], live = false, held = false, t1 = 0;

    function place(st) {
      if (!st.id) { tip.classList.remove('on'); return; }
      const svg = box.querySelector('svg'); if (!svg) return;
      const c = DISTS[st.id - 1].c;
      const cv = tip.parentElement.getBoundingClientRect(), sr = svg.getBoundingClientRect();
      if (!sr.width) return;
      const x = sr.left - cv.left + ((c[0] + 14) / 1028) * sr.width;
      const y = sr.top - cv.top + ((c[1] + 14) / 884) * sr.height;
      const w = tip.offsetWidth || 186;
      const cx = Math.max(w / 2 + 4, Math.min(cv.width - w / 2 - 4, x));
      tip.style.setProperty('--x', cx + 'px');
      tip.style.setProperty('--y', Math.max((tip.offsetHeight || 120) * 1.16 + 10, y) + 'px');
      /* when the card is pushed off the district by the edge, the arrow stays on it */
      tip.style.setProperty('--ax', Math.max(16, Math.min(w - 16, x - cx + w / 2)) + 'px');
      tip.classList.add('on');
    }

    function show(st) {
      cur = st;
      const s = st.s;
      map.select(st.id ? 'district' : null, st.id || 0);
      tip.innerHTML = `<b>${st.name}</b>
        <div class="r"><span>Positive mood</span><strong>${pc(s.pos)} ${sgn(s.d1, 1)}</strong></div>
        <div class="r"><span><i class="pc" style="background:${PARTY[s.lead].c}"></i>${PARTY[s.lead].name}</span><strong>+${s.margin.toFixed(1)} pts</strong></div>
        <div class="r"><span>${s.top}</span><strong>${Math.round(s.iss[0][1])}%</strong></div>`;
      place(st);

      el.where.textContent = st.where;
      el.big.textContent = pc(s.pos);
      el.delta.className = s.d1 >= 0 ? 'gl-up' : 'gl-dn';
      el.delta.textContent = pts(s.d1) + ' since Round 1';
      el.h2h.innerHTML = ['A', 'B'].map((k) => `<div><span>${PARTY[k].name}</span><span class="tr"><i style="width:${Math.min(100, (s[k] / 50) * 100).toFixed(1)}%;background:${PARTY[k].c}"></i></span><strong>${pc(s[k])}</strong></div>`).join('');
      el.stats.innerHTML = `<div><b>${IN(s.iv)}</b><span>verified interviews</span></div>
        <div><b>${st.seats}</b><span>${st.seatsL}</span></div>
        <div><b>${moeTxt(s.iv)}</b><span>margin of error</span></div>`;

      el.q.textContent = lang === 'te' ? st.qte : st.q;
      el.a.innerHTML = lang === 'te' ? st.ate : st.a;
      el.a.setAttribute('lang', lang === 'te' ? 'te' : 'en');
      el.src.textContent = lang === 'te'
        ? `రౌండ్ 2 · n = ${IN(s.iv)} · ${moeTxt(s.iv)} · డెమో డేటా`
        : `Round 2 · n = ${IN(s.iv)} verified interviews · ${moeTxt(s.iv)} · demo data`;

      const i = TOUR.indexOf(st);
      pipEls.forEach((p, j) => p.setAttribute('aria-selected', String(j === i)));
      if (i >= 0) at = i;
      beat();
    }

    /* the five-second bar: restarted on every stop, and only while the tour runs */
    function beat() {
      root.classList.remove('is-run');
      if (held || reduced || !live) return;
      void timer.offsetWidth;
      root.classList.add('is-run');
    }
    function step() {
      clearTimeout(t1);
      if (held || reduced || !live) return;
      t1 = setTimeout(() => { at = (at + 1) % TOUR.length; show(TOUR[at]); step(); }, DWELL);
    }
    function hold() { held = true; clearTimeout(t1); root.classList.remove('is-run'); }

    pips.addEventListener('click', (e) => {
      const btn = e.target.closest('button'); if (!btn) return;
      hold(); show(TOUR[+btn.dataset.i]);
    });
    $$('#glance .gl-lang button').forEach((btn) => btn.addEventListener('click', () => {
      lang = btn.dataset.l;
      $$('#glance .gl-lang button').forEach((o) => { o.setAttribute('aria-selected', String(o === btn)); o.tabIndex = o === btn ? 0 : -1; });
      show(cur);
    }));
    window.addEventListener('resize', () => { fitLabels(); place(cur); }, { passive: true });

    root.style.setProperty('--gl-dwell', DWELL + 'ms');
    show(TOUR[0]);
    if (reduced) return;
    watch(root, (v) => { live = v; clearTimeout(t1); if (v) { beat(); step(); } else root.classList.remove('is-run'); }, 0.25);
  }

  const run = (name, f) => { try { f(); } catch (e) { console.error('[refresh ' + name + ']', e); } };
  const init = () => {
    run('why', Why); run('voice', VoiceFlow); run('trust', TrustRadar); run('road', Road); run('proof', Proof);
    /* the glance map draws 203 paths: build it only once the section is near */
    const gl = document.getElementById('glance');
    if (gl && window.PI && window.PI.near) window.PI.near(gl, () => run('glance', Glance));
    else run('glance', Glance);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
