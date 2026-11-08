/* Political Intelligence Platform · drill-down map and area panel
   State → district → constituency → mandal / urban body → booths. Each level draws only the chosen
   area in place of the whole map; the panel shows everything known about it for the round. */
(function () {
  'use strict';
  const PI = window.PI, M = window.M, U = window.U;
  const { ACS, DISTS, byN, rng, hash, mix, clamp } = PI;
  const { $, $$, ic, esc, IN, p0, f1, sg } = U;
  const VB0 = [0, 0, 1000, 853];

  /* ---------------- geometry ---------------- */
  const RINGS = new Map();
  function rings(d) {
    if (RINGS.has(d)) return RINGS.get(d);
    const out = d.split(/M/).filter(Boolean).map((s) => { const n = s.match(/-?\d+(?:\.\d+)?/g).map(Number); const r = []; for (let i = 0; i < n.length - 1; i += 2) r.push([n[i], n[i + 1]]); return r; });
    RINGS.set(d, out); return out;
  }
  function inRings(rs, x, y) {
    let inside = false;
    rs.forEach((r) => { for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside; } });
    return inside;
  }
  const inConvex = (poly, x, y) => { for (let i = 0; i < poly.length; i++) { const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length]; if ((x2 - x1) * (y - y1) - (y2 - y1) * (x - x1) < 0) return false; } return true; };
  function clipHalf(poly, px, py, nx, ny) {
    /* keep the side where (p - P)·n <= 0 */
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const da = (a[0] - px) * nx + (a[1] - py) * ny, db = (b[0] - px) * nx + (b[1] - py) * ny;
      if (da <= 0) out.push(a);
      if ((da <= 0) !== (db <= 0)) { const t = da / (da - db); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    return out;
  }
  /* Sutherland–Hodgman: cut a seat ring to a convex cell, giving the unit's true outline */
  function clipToCell(subject, clip) {
    let out = subject;
    for (let i = 0; i < clip.length && out.length; i++) {
      const A = clip[i], B = clip[(i + 1) % clip.length];
      const inside = (p) => (B[0] - A[0]) * (p[1] - A[1]) - (B[1] - A[1]) * (p[0] - A[0]) >= 0;
      const cut = (P, Q) => { const a1 = B[1] - A[1], b1 = A[0] - B[0], c1 = a1 * A[0] + b1 * A[1], a2 = Q[1] - P[1], b2 = P[0] - Q[0], c2 = a2 * P[0] + b2 * P[1], det = a1 * b2 - a2 * b1 || 1e-9; return [(b2 * c1 - b1 * c2) / det, (a1 * c2 - a2 * c1) / det]; };
      const inp = out; out = [];
      for (let j = 0; j < inp.length; j++) { const P = inp[j], Q = inp[(j + 1) % inp.length], pi = inside(P), qi = inside(Q); if (qi) { if (!pi) out.push(cut(P, Q)); out.push(Q); } else if (pi) out.push(cut(P, Q)); }
    }
    return out;
  }
  const area = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };
  const GEO = new Map();
  /* mandal and ward-group outlines: Voronoi cells of well-spread seeds, clipped to the seat */
  function unitGeo(a) {
    if (GEO.has(a.n)) return GEO.get(a.n);
    const units = M.units(a), rs = rings(a.d), b = PI.bbox(a.d), r = rng(hash('geo' + a.n));
    const seeds = [];
    const sample = () => { for (let t = 0; t < 400; t++) { const x = b.x + r() * b.w, y = b.y + r() * b.h; if (inRings(rs, x, y)) return [x, y]; } return [b.x + b.w / 2, b.y + b.h / 2]; };
    units.forEach(() => {
      let best = null, bd = -1;
      for (let k = 0; k < 14; k++) { const c = sample(); const d = seeds.length ? Math.min(...seeds.map((s) => Math.hypot(s[0] - c[0], s[1] - c[1]))) : 1; if (d > bd) { bd = d; best = c; } }
      seeds.push(best);
    });
    /* ward groups sit together in the city part (first seeds), so order seeds by x for a calmer layout */
    const pad = Math.max(b.w, b.h);
    const cells = seeds.map((s, i) => {
      let poly = [[b.x - pad, b.y - pad], [b.x + b.w + pad, b.y - pad], [b.x + b.w + pad, b.y + b.h + pad], [b.x - pad, b.y + b.h + pad]];
      seeds.forEach((o, j) => { if (j === i) return; const mx = (s[0] + o[0]) / 2, my = (s[1] + o[1]) / 2; poly = clipHalf(poly, mx, my, o[0] - s[0], o[1] - s[1]); });
      if (area(poly) < 0) poly.reverse();
      return poly;
    });
    /* booths: points inside both the seat and the cell */
    const booths = units.map((u, i) => {
      const pts = []; let tries = 0;
      const rr = rng(hash('bt' + u.id));
      const cb = cells[i].reduce((o, [x, y]) => ({ x0: Math.min(o.x0, x), y0: Math.min(o.y0, y), x1: Math.max(o.x1, x), y1: Math.max(o.y1, y) }), { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 });
      const x0 = Math.max(cb.x0, b.x), x1 = Math.min(cb.x1, b.x + b.w), y0 = Math.max(cb.y0, b.y), y1 = Math.min(cb.y1, b.y + b.h);
      while (pts.length < u.booths && tries++ < 3000) { const x = x0 + rr() * (x1 - x0), y = y0 + rr() * (y1 - y0); if (inRings(rs, x, y) && inConvex(cells[i], x, y)) pts.push([x, y]); }
      return pts;
    });
    const shapes = cells.map((cell) => rings(a.d).map((r) => clipToCell(r, cell)).filter((p) => p.length > 2));
    const g = { seeds, cells, booths, shapes, bb: b };
    GEO.set(a.n, g); return g;
  }
  M.unitGeo = unitGeo;
  const polyD = (p) => 'M' + p.map(([x, y]) => x.toFixed(1) + ' ' + y.toFixed(1)).join('L') + 'Z';
  const shapeD = (list) => list.map(polyD).join('');
  function unitBox(u) {
    const g = unitGeo(byN.get(u.ac)), pts = g.shapes[u.i].flat();
    if (!pts.length) return PI.bbox(byN.get(u.ac).d);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  function boxOf(en) {
    if (en.kind === 'state') return { x: 0, y: 0, w: 1000, h: 853 };
    if (en.kind === 'district') return PI.bbox(DISTS[en.id - 1].d);
    if (en.kind === 'ac') return PI.bbox(byN.get(en.id).d);
    return unitBox(M.unitById(en.id));
  }
  function fit(b, el) {
    const ar = el.clientWidth && el.clientHeight ? el.clientWidth / el.clientHeight : 1000 / 853;
    const p = Math.max(b.w, b.h) * 0.035;
    let w = b.w + p * 2, h = b.h + p * 2;
    if (w / h > ar) h = w / ar; else w = h * ar;
    return [b.x + b.w / 2 - w / 2, b.y + b.h / 2 - h / 2, w, h];
  }

  /* ---------------- metrics ---------------- */
  const prevR = () => Math.max(0, M.round - 1);
  /* the mood ramp the website maps have always used: violet, magenta, warm, gold */
  const MOOD = ['#300681', '#4f12b8', '#8130ff', '#ac24ff', '#ca45ff', '#ee5fa6', '#fe881b', '#ffb340', '#ffd600'];
  M.METRICS = {
    lead: { label: 'Who leads', legend: 'cats' },
    gov: { label: 'Government approval', lo: 35, hi: 65, unit: '%' },
    swing: { label: 'Swing to Party A', lo: -4, hi: 4, unit: ' pts', div: true },
    und: { label: 'Undecided voters', lo: 3, hi: 12, unit: '%' },
    cover: { label: 'Interview coverage', lo: 60, hi: 100, unit: '%' },
    kind: { label: 'Urban or rural', legend: 'kind' },
  };
  function metricVal(m, en) {
    const v = M.vals(en);
    if (m === 'gov') return v.gov;
    if (m === 'swing') return v.A - M.vals(en, prevR()).A;
    if (m === 'und') return v.U;
    if (m === 'cover') return Math.min(100, (v.iv / v.target) * 100);
    return 0;
  }
  function kindOf(en) {
    if (en.kind === 'unit') { const k = M.unitById(en.id).kind; return k === 'mandal' ? 'rural' : k === 'corp' ? 'corp' : 'town'; }
    if (en.kind === 'ac') { const k = M.seatKind(byN.get(en.id)); return k === 'mixed' ? 'corp' : k; }
    return 'all';
  }
  function fillFor(m, en) {
    const C = (v) => M.cssv(v);
    const base = C('--map-base');
    if (m === 'lead') { const v = M.vals(en); return mix(base, C(M.PARTY[v.lead].v), clamp(0.34 + v.margin / 12, 0.34, 1)); }
    if (m === 'kind') {
      const k = en.kind === 'ac' ? M.seatKind(byN.get(en.id)) : en.kind === 'unit' ? M.unitById(en.id).kind : 'rural';
      return k === 'corp' ? C('--warm') : k === 'mixed' ? mix(base, C('--warm'), 0.62) : k === 'town' || k === 'muni' || k === 'np' ? mix(base, C('--violet'), 0.7) : mix(base, C('--ink'), 0.12);
    }
    const def = M.METRICS[m], x = metricVal(m, en);
    if (def.div) { const t = clamp(x / def.hi, -1, 1); return t >= 0 ? mix(C('--div-mid'), C('--div-1'), t) : mix(C('--div-mid'), C('--div-0'), -t); }
    return PI.ramp(MOOD, clamp((x - def.lo) / (def.hi - def.lo), 0, 1));
  }
  function legendHTML(m) {
    const C = (v) => M.cssv(v);
    if (m === 'lead') return `<b>Who leads · deeper colour = bigger lead</b>${U.legend(['A', 'B', 'C'].map((k) => [M.PARTY[k].name + ' · ' + M.PARTY[k].role, U.pc(k)]))}`;
    if (m === 'kind') return `<b>Urban or rural</b>${U.legend([['Municipal corporation', 'var(--warm)'], ['Corporation + rural', mix(C('--map-base'), C('--warm'), 0.62)], ['Municipality / nagar panchayat', mix(C('--map-base'), C('--violet'), 0.7)], ['Rural mandal', mix(C('--map-base'), C('--ink'), 0.12)]])}`;
    const d = M.METRICS[m];
    const stops = d.div ? `var(--div-0), var(--div-mid), var(--div-1)` : MOOD.join(', ');
    const t = d.div ? [`${d.lo}${d.unit} to B`, '0', `+${d.hi}${d.unit} to A`] : [`${d.lo}${d.unit}`, `${Math.round((d.lo + d.hi) / 2)}${d.unit}`, `${d.hi}${d.unit}+`];
    return `<b>${d.label}${d.div ? ' since ' + M.ROUNDS[prevR()].short : ''}</b><div class="ramp" style="background:linear-gradient(90deg,${stops})"></div><div class="ramp-t">${t.map((x) => `<span>${x}</span>`).join('')}</div>`;
  }

  /* ---------------- label placement ---------------- */
  /* Pole of inaccessibility: the point deepest inside the shape, so a name never
     falls in a bay or outside a crescent, plus the radius there, which says how
     much room the shape really has for type. Cached per path, and measured on a
     thinned outline because a label only needs the shape, not every vertex. */
  const POLE = new Map();
  const thin = (r) => { const step = Math.ceil(r.length / 44); if (step < 2) return r; const o = []; for (let i = 0; i < r.length; i += step) o.push(r[i]); return o.length > 2 ? o : r; };
  function pole(d) {
    if (POLE.has(d)) return POLE.get(d);
    const rs = rings(d).map(thin), pts = rs.flat();
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
    /* one pass over the edges gives both the distance to the outline and which side we are on */
    const probe = (x, y) => {
      let best = 1e18, inside = false;
      for (let k = 0; k < rs.length; k++) {
        const r = rs[k];
        for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
          const xi = r[i][0], yi = r[i][1], xj = r[j][0], yj = r[j][1];
          if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
          const dx = xj - xi, dy = yj - yi;
          const t = Math.max(0, Math.min(1, ((x - xi) * dx + (y - yi) * dy) / (dx * dx + dy * dy || 1e-9)));
          const ex = x - (xi + t * dx), ey = y - (yi + t * dy), dd = ex * ex + ey * ey;
          if (dd < best) best = dd;
        }
      }
      return (inside ? 1 : -1) * Math.sqrt(best);
    };
    let best = [(x0 + x1) / 2, (y0 + y1) / 2], bv = -1e9;
    let step = Math.max(x1 - x0, y1 - y0) / 14 || 1;
    for (let x = x0; x <= x1; x += step) for (let y = y0; y <= y1; y += step) { const v = probe(x, y); if (v > bv) { bv = v; best = [x, y]; } }
    for (let k = 0; k < 4; k++) {
      step /= 2;
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
        if (!dx && !dy) continue;
        const x = best[0] + dx * step, y = best[1] + dy * step, v = probe(x, y);
        if (v > bv) { bv = v; best = [x, y]; }
      }
    }
    /* the inside span across the label's own line: how much room the name really has */
    const chord = (y, x) => {
      const xs = [];
      for (const r of rs) for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
        const xi = r[i][0], yi = r[i][1], xj = r[j][0], yj = r[j][1];
        if ((yi > y) !== (yj > y)) xs.push(xi + ((y - yi) / (yj - yi)) * (xj - xi));
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) if (x >= xs[i] - 1e-6 && x <= xs[i + 1] + 1e-6) return xs[i + 1] - xs[i];
      return 0;
    };
    const out = { p: best, r: Math.max(0, bv), w: chord(best[1], best[0]) };
    POLE.set(d, out); return out;
  }
  /* text that stays readable on any fill: ink picked by the fill's luminance, with
     a halo of the opposite tone. Never relies on the theme's ink colour alone. */
  function lum(c) {
    let r = 20, g = 20, b = 20;
    if (/^#[0-9a-f]{6}$/i.test(c)) { const n = parseInt(c.slice(1), 16); r = n >> 16; g = (n >> 8) & 255; b = n & 255; }
    else { const m = String(c).match(/-?\d+(?:\.\d+)?/g); if (m && m.length >= 3) { r = +m[0]; g = +m[1]; b = +m[2]; } }
    const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }
  const inkFor = (fill) => (lum(fill) > 0.46 ? ['#08060d', 'rgba(255,255,255,.86)'] : ['#ffffff', 'rgba(4,3,8,.68)']);
  /* rough advance width for Urbanist at weight 700, good enough to reject labels that will not fit */
  const textW = (s, fs) => { let w = 0; for (const ch of s) w += /[iIlj.,'’:; ]/.test(ch) ? 0.3 : /[mwMW—–]/.test(ch) ? 0.88 : /[A-Z0-9]/.test(ch) ? 0.63 : 0.55; return w * fs; };

  /* ---------------- map view ---------------- */
  M.MapX = function (host, o = {}) {
    const st = { focus: o.focus || { kind: 'state', id: 0 }, level: o.level || 'district', metric: o.metric || 'lead', cat: 'all', booth: null };
    const uid = o.uid || '';
    const MINZ = 1, MAXZ = 24;
    host.innerHTML = `<div class="map-bar"><nav class="crumbs" aria-label="Map level"></nav><div class="acts">${o.compact ? '' : `<label class="sr" for="mx-m${uid}">Colour the map by</label><select class="sel" id="mx-m${uid}" data-r="metric">${Object.entries(M.METRICS).map(([k, d]) => `<option value="${k}"${k === st.metric ? ' selected' : ''}>${d.label}</option>`).join('')}</select>`}</div></div>
      <div class="map-bar sub"><div class="segs" data-r="opts"></div><p class="map-hint" id="mx-h${uid}"></p></div>
      <div class="mapbox pz">
        <svg viewBox="${VB0.join(' ')}" role="img" tabindex="0" aria-label="Map of Andhra Pradesh" aria-describedby="mx-h${uid}"></svg>
        <div class="map-ctl">
          <button type="button" class="mc" data-r="up" aria-label="Up one level">${ic('back')}</button>
          <div class="mc-z"><button type="button" class="mc" data-r="zin" aria-label="Zoom in">${ic('plus')}</button><button type="button" class="mc" data-r="zout" aria-label="Zoom out">${ic('minus')}</button></div>
          <button type="button" class="mc" data-r="fit" aria-label="Fit the area to the frame">${ic('locate')}</button>
        </div>
        <output class="map-zl" data-r="zl" aria-live="polite" aria-label="Zoom level">1.0×</output>
        <div class="map-key"><div class="lg"></div></div>
      </div>`;
    const svg = $('svg', host), box = $('.mapbox', host), crumbs = $('.crumbs', host), opts = $('[data-r="opts"]', host);
    let vb = VB0.slice(), base = VB0.slice(), anim = 0, lraf = 0, ltm = 0, LIST = [], moving = false;

    const zoomOf = () => base[2] / vb[2];
    function clampVB(v) {
      const z = clamp(base[2] / v[2], MINZ, MAXZ);
      const w = base[2] / z, h = base[3] / z;
      const x = clamp(v[0], base[0], base[0] + base[2] - w), y = clamp(v[1], base[1], base[1] + base[3] - h);
      return [x, y, w, h];
    }
    function applyVB() {
      svg.setAttribute('viewBox', vb.join(' '));
      const sx = (box.clientWidth || 700) / vb[2];
      svg.style.setProperty('--mk', (1 / sx).toFixed(4));
      const z = zoomOf();
      $('[data-r="zl"]', host).textContent = (Math.round(z * 10) / 10).toFixed(1) + '×';
      box.classList.toggle('zoomed', z > 1.02);
      $('[data-r="zout"]', host).disabled = z <= MINZ + 0.01;
      $('[data-r="zin"]', host).disabled = z >= MAXZ - 0.01;
      $('[data-r="fit"]', host).disabled = z <= MINZ + 0.01;
    }
    function setVB(target, animate) {
      cancelAnimationFrame(anim);
      const t = clampVB(target);
      if (!animate || U.reduced) { vb = t; applyVB(); queueLabels(); return; }
      const from = vb.slice(), t0 = performance.now(), D = 560;
      moving = true; svg.classList.add('moving');
      const land = () => { clearTimeout(settle); cancelAnimationFrame(anim); anim = 0; vb = t.slice(); applyVB(); moving = false; svg.classList.remove('moving'); relabel(); };
      const step = (now) => {
        const k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 4);
        vb = from.map((v, i) => v + (t[i] - v) * e); applyVB();
        if (k < 1) anim = requestAnimationFrame(step); else land();
      };
      const settle = setTimeout(land, D + 160);
      anim = requestAnimationFrame(step);
    }
    function queueLabels() {
      if (moving) return;
      cancelAnimationFrame(lraf); clearTimeout(ltm);
      const run = () => { cancelAnimationFrame(lraf); clearTimeout(ltm); relabel(); };
      lraf = requestAnimationFrame(run); ltm = setTimeout(run, 90);
    }
    function zoomAt(f, ux, uy) {
      const z = clamp(zoomOf() * f, MINZ, MAXZ);
      const w = base[2] / z, h = base[3] / z;
      setVB([ux - (ux - vb[0]) * (w / vb[2]), uy - (uy - vb[1]) * (h / vb[3]), w, h], false);
    }
    const centre = () => [vb[0] + vb[2] / 2, vb[1] + vb[3] / 2];
    const zoomStep = (f) => { const c = centre(); const z = clamp(zoomOf() * f, MINZ, MAXZ); const w = base[2] / z, h = base[3] / z; setVB([c[0] - w / 2, c[1] - h / 2, w, h], true); };

    const tipFor = (en) => {
      const v = M.vals(en);
      const rows = [['Leads', `${M.PARTY[v.lead].name} +${f1(v.margin)}`], ['Party A · B', `${p0(v.A)} · ${p0(v.B)}`], ['Govt approval', p0(v.gov)], ['Interviews', IN(v.iv)]];
      if (en.kind === 'ac') rows.push(['Seat type', M.SEAT_KIND[M.seatKind(byN.get(en.id))]]);
      if (en.kind === 'unit') rows.push(['Type', M.KIND[M.unitById(en.id).kind]]);
      return U.tipRows(M.name(en), rows);
    };
    function shapes() {
      const f = st.focus, out = [];
      if (f.kind === 'state') {
        if (st.level === 'district') DISTS.forEach((d) => out.push({ en: { kind: 'district', id: d.id }, d: d.d }));
        else ACS.forEach((a) => out.push({ en: { kind: 'ac', id: a.n }, d: a.d }));
      } else if (f.kind === 'district') DISTS[f.id - 1].acs.forEach((n) => out.push({ en: { kind: 'ac', id: n }, d: byN.get(n).d }));
      else if (f.kind === 'ac') { const a = byN.get(f.id), g = unitGeo(a); M.units(a).forEach((u, i) => out.push({ en: { kind: 'unit', id: u.id }, d: shapeD(g.shapes[i]) })); }
      else { const u = M.unitById(f.id), a = byN.get(u.ac), g = unitGeo(a); out.push({ en: f, d: shapeD(g.shapes[u.i]), solo: true }); }
      return out;
    }
    function catOk(en) { if (st.cat === 'all') return true; const k = kindOf(en); return k === 'all' || k === st.cat; }

    /* Labels are rebuilt whenever the view changes, so they keep one size on screen.
       Shapes are named in order of how much room they really have (the radius of the
       biggest circle that fits inside), and each name is tried at three sizes, in a
       shorter form and nudged up or down before it is given up. Anything that would
       still overlap a placed label waits for the next zoom step. */
    const DIR = { East: 'E.', West: 'W.', North: 'N.', South: 'S.', Greater: 'Gr.' };
    function nameForms(n) {
      const out = [n], w = n.split(' ');
      if (w.length > 1) {
        if (DIR[w[0]]) out.push(DIR[w[0]] + ' ' + w.slice(1).join(' '));
        else if (w[0] === 'Sri' || w[0] === 'Dr.') out.push(w.slice(1).join(' '));
        if (!DIR[w[0]] && w[0].length >= 5) out.push(w[0]);
      }
      return out;
    }
    function relabel() {
      const gl = $('g.labels', svg); if (!gl) return;
      const pxW = box.clientWidth || 700, pxH = box.clientHeight || 500;
      const sx = pxW / vb[2], sy = pxH / vb[3];
      const items = [];
      LIST.forEach((s) => {
        if (s.solo || !catOk(s.en)) return;
        const b = s.bb || (s.bb = PI.bbox(s.d));
        const w = b.w * sx, h = b.h * sy;
        if (w < 20 || h < 12) return;
        const pp = s.pole || (s.pole = pole(s.d));
        const px = (pp.p[0] - vb[0]) * sx, py = (pp.p[1] - vb[1]) * sy;
        if (px < -70 || py < -50 || px > pxW + 70 || py > pxH + 50) return;
        items.push({ s, px, py, w, h, by0: (b.y - vb[1]) * sy, by1: (b.y + b.h - vb[1]) * sy, rad: pp.r * Math.min(sx, sy), chord: (pp.w || 0) * sx });
      });
      items.sort((a, b) => b.rad - a.rad || b.w * b.h - a.w * a.h);
      const boxes = [], out = [];
      const hit = (a) => boxes.some((b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y);
      items.forEach((it) => {
        const v = M.vals(it.s.en);
        const full = M.name(it.s.en).split(' · ')[0].replace(/ (Municipality|Nagar Panchayat)$/, ' (M)');
        const forms = nameForms(full);
        const room = clamp(Math.max(it.rad * 2.3, it.chord * 0.96, it.w * 0.9), 26, 240);
        const sub = `${M.PARTY[v.lead].name.replace('Party ', '')} +${f1(v.margin)}`;
        const bfs = clamp(11 + it.rad * 0.1, 11, 14.5);
        let put = null;
        for (const size of [1, 0.92, 0.84, 0.77]) {
          const fs = bfs * size;
          for (const nm of forms) {
            const tw = textW(nm, fs);
            if (tw > room) continue;
            const canTwo = it.h > fs * 3 && it.rad * 2 > fs * 2.7 && textW(sub, fs * 0.84) <= room;
            for (const two of (canTwo ? [true, false] : [false])) {
              const lh = two ? fs * 2.08 : fs * 1.14;
              for (const dy of [0, -lh * 0.7, lh * 0.7]) {
                const cand = { x: it.px - tw / 2 - 2, y: it.py + dy - lh / 2 - 1, w: tw + 4, h: lh + 2 };
                if (cand.y < it.by0 - 5 || cand.y + cand.h > it.by1 + 5) continue;
                if (hit(cand)) continue;
                put = { fs, nm, two, dy, cand }; break;
              }
              if (put) break;
            }
            if (put) break;
          }
          if (put) break;
        }
        if (!put) {
          /* last resort: the shortest form, clipped, at the smallest size */
          const fs = bfs * 0.77, src = forms[forms.length - 1];
          let k = src.length;
          while (k > 6 && textW(src.slice(0, k) + '…', fs) > room) k--;
          if (k <= 6) return;
          /* an ellipsis that saves one letter is worse than the name itself */
          const nm = k >= src.length - 2 ? src : src.slice(0, k).trimEnd() + '…';
          const lh = fs * 1.14, tw = textW(nm, fs);
          for (const dy of [0, -lh * 0.8, lh * 0.8, -lh * 1.6, lh * 1.6]) {
            const cand = { x: it.px - tw / 2 - 2, y: it.py + dy - lh / 2 - 1, w: tw + 4, h: lh + 2 };
            if (cand.y < it.by0 - 5 || cand.y + cand.h > it.by1 + 5) continue;
            if (hit(cand)) continue;
            put = { fs, nm, two: false, dy, cand }; break;
          }
          if (!put) return;
        }
        boxes.push(put.cand);
        const [ink, halo] = inkFor(it.s.fill || '#222');
        const ux = it.s.pole.p[0];
        const uy = it.s.pole.p[1] + (put.dy - (put.two ? put.fs * 0.5 : 0)) / sy;
        out.push(`<text class="lb" x="${ux.toFixed(1)}" y="${uy.toFixed(1)}" font-size="${(put.fs / sx).toFixed(2)}" fill="${ink}" stroke="${halo}" stroke-width="${(3.6 / sx).toFixed(2)}">${esc(put.nm)}${put.two ? `<tspan class="s" x="${ux.toFixed(1)}" dy="${((put.fs * 1.16) / sy).toFixed(2)}" font-size="${((put.fs * 0.84) / sx).toFixed(2)}">${esc(sub)}</tspan>` : ''}</text>`);
      });
      gl.innerHTML = out.join('');
    }

    function render(animate) {
      const f = st.focus;
      LIST = shapes();
      base = fit(boxOf(f), box);
      const k = base[2] / Math.max(box.clientWidth || 700, 200);
      const soloFill = (en) => { const v = M.vals(en), c = M.cssv(M.PARTY[v.lead].v); return [mix(M.cssv('--map-base'), c, 0.16), mix(M.cssv('--map-base'), c, 0.7)]; };
      const dots = f.kind === 'ac';
      LIST.forEach((s) => { s.fill = s.solo ? soloFill(s.en)[0] : dots ? mix(M.cssv('--map-base'), fillFor(st.metric, s.en), 0.42) : fillFor(st.metric, s.en); s.bb = null; s.pole = null; });
      /* markers keep one size on screen: CSS reads --mk (user units per pixel) and --mr */
      svg.style.setProperty('--mr', f.kind === 'unit' ? '5' : '3.8');
      let h = '';
      h += `<g class="areas">${LIST.map((s) => { const sf = s.solo ? soloFill(s.en) : null; return `<path class="a${s.solo ? ' solo' : ''}${catOk(s.en) ? '' : ' dim'}" d="${s.d}" fill="${s.fill}"${sf ? ` style="stroke:${sf[1]}"` : ''} data-k="${s.en.kind}" data-id="${s.en.id}"/>`; }).join('')}</g>`;
      if (f.kind === 'state' && st.level === 'ac') h += `<g class="dls">${DISTS.map((d) => `<path class="dl" d="${d.d}"/>`).join('')}</g>`;
      if (f.kind === 'ac') h += `<path class="edge" d="${byN.get(f.id).d}"/>`;
      if (f.kind === 'ac' || f.kind === 'unit') {
        const a = byN.get(f.kind === 'ac' ? f.id : M.unitById(f.id).ac), g = unitGeo(a);
        const r = (f.kind === 'unit' ? 4.4 : 3.2) * k;
        h += `<g class="booths">${M.units(a).map((u, i) => (f.kind === 'unit' && u.id !== f.id) ? '' : g.booths[i].map((p, j) => { const uv = M.vals({ kind: 'unit', id: u.id }); const lead = (hash('bl' + u.id + ':' + j) % 100) < (uv.A / (uv.A + uv.B)) * 100 ? 'A' : 'B'; return `<circle class="bt" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r}" fill="${U.pc(lead)}" stroke-width="${f.kind === 'unit' ? 1.5 : 1}" data-b="${u.id}:${j}:${lead}"/>`; }).join('')).join('')}</g>`;
        const ags = M.agents.filter((x) => x.ac === a.n && (f.kind === 'ac' || x.unit === f.id));
        h += `<g class="ags">${ags.map((x) => { const ui = M.unitById(x.unit), pts = g.booths[ui.i]; const p = pts[Math.floor(x.seed * pts.length)] || g.seeds[ui.i]; const bad = x.status === 'fence' || x.status === 'mock'; return `<circle class="ring" cx="${p[0]}" cy="${p[1]}" r="${5 * k}" stroke="${bad ? 'var(--bad)' : 'var(--ink)'}"/><circle class="ag" cx="${p[0]}" cy="${p[1]}" r="${3.6 * k}" fill="${bad ? 'var(--bad)' : 'var(--ink)'}" data-tip="${esc(U.tipRows(x.name + ' · ' + x.id, [['Status', M.AGENT_STATUS[x.status][0]], ['Today', x.done + ' of ' + x.target], ['Last ping', x.ping ? x.ping + ' min ago' : 'now']]))}"/>`; }).join('')}</g>`;
      }
      h += '<g class="labels"></g>';
      svg.innerHTML = h;
      setVB(base, animate);
      if (!animate) relabel();
      $('[data-r="up"]', host).disabled = f.kind === 'state';
      crumbs.innerHTML = M.path(f).map((e, i, arr) => `${i ? ic('chevr') : ''}<button type="button" data-k="${e.kind}" data-id="${e.id}"${i === arr.length - 1 ? ' aria-current="true"' : ''}>${esc(M.name(e))}</button>`).join('');
      $('.lg', host).innerHTML = f.kind === 'unit' ? `<b>Sampled booths · who leads at each</b>${U.legend([['Party A', U.pc('A')], ['Party B', U.pc('B')], ['Agent now', 'var(--ink)']])}` : legendHTML(st.metric);
      $('.map-hint', host).textContent = (f.kind === 'state' ? 'Click a district or seat to open it.' : f.kind === 'district' ? 'Click a seat to open it. Booth dots appear at seat level.' : f.kind === 'ac' ? 'Each dot is a sampled booth; rings are agents working now.' : 'Booth dots are coloured by who leads there.') + ' Scroll or pinch to zoom, drag to pan.';
      opts.innerHTML = (f.kind === 'state' ? U.seg('Map level', [['district', 'Districts'], ['ac', 'Constituencies']], st.level) : '') +
        (f.kind !== 'unit' ? U.seg('Area type', [['all', 'All areas'], ['corp', 'Corporations'], ['town', 'Municipalities'], ['rural', 'Rural']], st.cat) : `<span class="badge accent">${esc(M.KIND[M.unitById(f.id).kind])}</span>`);
      U.onSeg(opts, '.seg[aria-label="Map level"]', (v) => { st.level = v; render(false); });
      U.onSeg(opts, '.seg[aria-label="Area type"]', (v) => { st.cat = v; if (st.focus.kind === 'state' && v !== 'all') st.level = 'ac'; render(false); });
      svg.setAttribute('aria-label', `Map of ${M.name(f)}, coloured by ${M.METRICS[st.metric].label.toLowerCase()}. ${M.children(f).length ? M.children(f).length + ' ' + M.childLabel(f).toLowerCase() + ' are listed in the panel beside it.' : ''}`);
    }
    function go(en, animate = true) { st.focus = en; st.booth = null; render(animate); if (o.onFocus) o.onFocus(en); }

    /* ---- pointer: click to drill, drag to pan, wheel and pinch to zoom ---- */
    const act = new Map(); let drag = null, pinch = null;
    const uxy = (e) => { const r = svg.getBoundingClientRect(); return [vb[0] + ((e.clientX - r.left) / r.width) * vb[2], vb[1] + ((e.clientY - r.top) / r.height) * vb[3]]; };
    svg.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      act.set(e.pointerId, [e.clientX, e.clientY]);
      if (act.size === 2) { const [a, b] = [...act.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, z: zoomOf(), c: uxy({ clientX: (a[0] + b[0]) / 2, clientY: (a[1] + b[1]) / 2 }) }; drag = null; return; }
      drag = { x: e.clientX, y: e.clientY, vb: vb.slice(), moved: 0, id: e.pointerId, cap: false };
    });
    svg.addEventListener('pointermove', (e) => {
      if (act.has(e.pointerId)) act.set(e.pointerId, [e.clientX, e.clientY]);
      if (pinch && act.size === 2) {
        const [a, b] = [...act.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1;
        const z = clamp(pinch.z * (d / pinch.d), MINZ, MAXZ), w = base[2] / z, h = base[3] / z;
        setVB([pinch.c[0] - w / 2, pinch.c[1] - h / 2, w, h], false);
        return;
      }
      if (drag) {
        const r = svg.getBoundingClientRect();
        drag.moved = Math.max(drag.moved, Math.hypot(e.clientX - drag.x, e.clientY - drag.y));
        if (drag.moved > 3) {
          /* only now take the pointer: capturing earlier would retarget the click to the svg
             and the shape under the cursor would never be opened */
          if (!drag.cap) { drag.cap = true; try { svg.setPointerCapture(drag.id); } catch (er) { /* ignore */ } }
          box.classList.add('grabbing'); U.tip(null);
          setVB([drag.vb[0] - (e.clientX - drag.x) * (drag.vb[2] / r.width), drag.vb[1] - (e.clientY - drag.y) * (drag.vb[3] / r.height), drag.vb[2], drag.vb[3]], false);
        }
        return;
      }
      const p = e.target.closest('path.a');
      if (!p || e.pointerType === 'touch') { if (!e.target.closest('[data-tip]')) U.tip(null); return; }
      U.tip(tipFor({ kind: p.dataset.k, id: +p.dataset.id }), e.clientX, e.clientY);
    });
    const endPtr = (e) => {
      act.delete(e.pointerId);
      if (act.size < 2) pinch = null;
      if (drag) { box.classList.remove('grabbing'); svg._moved = drag.moved; drag = null; queueLabels(); }
    };
    svg.addEventListener('pointerup', endPtr);
    svg.addEventListener('pointercancel', endPtr);
    svg.addEventListener('pointerleave', () => U.tip(null));
    box.addEventListener('wheel', (e) => {
      e.preventDefault();
      const [ux, uy] = uxy(e);
      zoomAt(Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.03 : 0.0022)), ux, uy);
    }, { passive: false });
    svg.addEventListener('dblclick', (e) => { const [ux, uy] = uxy(e); zoomAt(1.9, ux, uy); });
    svg.addEventListener('click', (e) => {
      if (svg._moved > 3) { svg._moved = 0; return; }
      /* a captured pointer (or a synthetic click) reports the svg itself, so fall back to
         whatever is actually under the cursor */
      let t = e.target;
      if (t === svg && e.clientX) t = document.elementFromPoint(e.clientX, e.clientY) || t;
      const bt = t.closest && t.closest('circle.bt');
      if (bt && o.onBooth) { const [uid2, j, lead] = bt.dataset.b.split(':'); o.onBooth({ unit: +uid2, j: +j, lead }); return; }
      const p = t.closest && t.closest('path.a'); if (!p) return;
      const en = { kind: p.dataset.k, id: p.dataset.k === 'region' ? p.dataset.id : +p.dataset.id };
      if (M.same(en, st.focus)) return;
      go(en);
    });
    svg.addEventListener('keydown', (e) => {
      const pan = (dx, dy) => { setVB([vb[0] + dx * vb[2] * 0.18, vb[1] + dy * vb[3] * 0.18, vb[2], vb[3]], true); e.preventDefault(); };
      if (e.key === '+' || e.key === '=') { zoomStep(1.6); e.preventDefault(); }
      else if (e.key === '-' || e.key === '_') { zoomStep(1 / 1.6); e.preventDefault(); }
      else if (e.key === '0') { setVB(base, true); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') pan(-1, 0);
      else if (e.key === 'ArrowRight') pan(1, 0);
      else if (e.key === 'ArrowUp') pan(0, -1);
      else if (e.key === 'ArrowDown') pan(0, 1);
      else if (e.key === 'Backspace') { const p = M.parent(st.focus); if (p) { go(p); e.preventDefault(); } }
    });
    crumbs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; go({ kind: b.dataset.k, id: +b.dataset.id }); });
    $('[data-r="up"]', host).addEventListener('click', () => { const p = M.parent(st.focus); if (p) go(p); });
    $('[data-r="zin"]', host).addEventListener('click', () => zoomStep(1.6));
    $('[data-r="zout"]', host).addEventListener('click', () => zoomStep(1 / 1.6));
    $('[data-r="fit"]', host).addEventListener('click', () => setVB(base, true));
    const ms = $('[data-r="metric"]', host); if (ms) ms.addEventListener('change', () => { st.metric = ms.value; render(false); });
    document.addEventListener('themechange', () => render(false));
    let rz; new ResizeObserver(() => { clearTimeout(rz); rz = setTimeout(() => render(false), 120); }).observe(box);
    let booted = false;
    const boot = () => { if (booted) return; booted = true; render(false); };
    requestAnimationFrame(boot); setTimeout(boot, 50);
    return { go, get: () => st.focus, set: (x) => { Object.assign(st, x); render(false); }, render };
  };

  /* ---------------- area panel ---------------- */
  /* demographic cuts, stable per area */
  function cuts(en) {
    const v = M.vals(en), r = rng(hash('cut' + en.kind + en.id + M.round));
    const j = (s) => (r() - 0.5) * s;
    return {
      gender: [['Women', v.A + 2.5 + j(2), v.B - 2 + j(2)], ['Men', v.A - 2.2 + j(2), v.B + 2 + j(2)]],
      age: [['18–25', v.A - 5 + j(3), v.B + 4 + j(3)], ['26–40', v.A - 1 + j(2), v.B + 1 + j(2)], ['41–60', v.A + 2 + j(2), v.B - 1 + j(2)], ['60+', v.A + 5 + j(3), v.B - 3 + j(3)]],
      job: [['Farmers', v.A + 1 + j(4), v.B + j(4)], ['Daily wage labour', v.A + 3 + j(4), v.B - 2 + j(4)], ['Salaried', v.A - 4 + j(4), v.B + 3 + j(4)], ['Business', v.A - 1 + j(4), v.B + 2 + j(4)], ['Students', v.A - 6 + j(4), v.B + 5 + j(4)], ['Homemakers', v.A + 4 + j(4), v.B - 3 + j(4)]],
      welfare: [['Received a scheme', v.welfA, v.B - 4 + j(2)], ['No scheme', v.nonA, v.B + 5 + j(2)]],
      reasonsA: [['Pensions arrive on time', 31 + j(6)], ['Welfare schemes', 24 + j(6)], ['Village roads', 14 + j(4)], ['Leader’s image', 12 + j(4)]],
      reasonsB: [['Jobs for the young', 29 + j(6)], ['Rising prices', 25 + j(6)], ['Local MLA', 15 + j(4)], ['Unkept promises', 13 + j(4)]],
      trust: v.iss.slice(0, 4).map(([k]) => [k, 38 + j(16), 36 + j(16)]),
    };
  }
  M.cuts = cuts;
  const h2h = (rows, la = 'Party A', lb = 'Party B') => `<div class="h2h"><div class="h2h-head"><span><i class="dot" style="background:var(--pA)"></i>${la}</span><span>${lb}<i class="dot" style="background:var(--pB)"></i></span></div>${rows.map(([l, a, b]) => `<div class="h2h-row" data-tip="${esc(U.tipRows(l, [[la, p0(a)], [lb, p0(b)], ['Gap', sg(a - b) + ' pts']]))}"><div class="h2h-t"><span>${esc(l)}</span><span class="num">${p0(a)} <span class="muted">·</span> ${p0(b)}</span></div><div class="h2h-b"><span class="h-l"><i style="width:${clamp(a / 0.7, 0, 100)}%"></i></span><span class="h-r"><i style="width:${clamp(b / 0.7, 0, 100)}%"></i></span></div></div>`).join('')}</div>`;
  M.h2h = h2h;
  const meter = (l, v, max = 100, note = '') => `<div class="meter"><div class="mt"><span>${esc(l)}</span><b>${typeof v === 'number' ? p0(v) : v}</b></div><span class="track"><i style="width:${clamp((parseFloat(v) / max) * 100, 0, 100)}%"></i></span>${note ? `<small class="muted">${note}</small>` : ''}</div>`;
  M.meter = meter;
  M.intentRows = (v, p) => ['A', 'B', 'C', 'O', 'U'].map((k) => ({ l: M.PARTY[k].name, c: U.pc(k), v: v[k], d: p ? v[k] - p[k] : null, tip: U.tipRows(M.PARTY[k].name + (M.PARTY[k].role ? ' · ' + M.PARTY[k].role : ''), [['This round', U.f1(v[k]) + '%'], ...(p ? [['Last round', U.f1(p[k]) + '%']] : []), ['Margin of error', U.moe(v.iv)]]) }));
  M.verdict = (en, v) => {
    const ld = M.PARTY[v.lead].name, sc = M.PARTY[v.second].name;
    if (en.kind === 'state' || en.kind === 'district' || en.kind === 'region') {
      const seats = v.list.map((n) => { const a = byN.get(n); return { ...M.vals({ kind: 'ac', id: n }), n, nm: a.name, dist: DISTS[a.dist - 1].name }; });
      const where = en.kind === 'state' ? 'across Andhra Pradesh' : `in ${M.name(en)}`;
      return `<div class="verdict"><b>${v.margin < 1 ? 'Level on votes' : `${ld} ahead by ${f1(v.margin)} pts`}</b><p>Vote share ${where} this round, weighted by sample size. The seat picture below turns those votes into a range, because toss-ups can fall either way.</p></div>
        ${U.seatBoard(seats, { pick: true, maj: en.kind === 'state', title: en.kind === 'state' ? 'Seat projection' : 'Seats here' })}`;
    }
    return `<div class="verdict"><b>${v.margin < 1 ? 'Level' : `${ld} +${f1(v.margin)} over ${sc}`} · ${v.cls}</b><p>${v.cls === 'Toss-up' ? 'Inside the margin of error. Either side can win it.' : v.cls === 'Lean' ? 'Ahead, but a small swing would close it.' : 'A clear lead outside the margin of error.'} n = ${IN(v.iv)}, ${U.moe(v.iv)}.</p></div>`;
  };

  M.Panel = function (host, o = {}) {
    let en = o.en || { kind: 'state', id: 0 }, tab = 'over', booth = null;
    const TABS = [['over', 'Overview'], ['ro', 'Ruling vs opposition'], ['iss', 'Issues & voices'], ['ppl', 'People'], ['fld', 'Field & quality'], ['note', 'Round notes']];
    function head() {
      const v = M.vals(en); const a = en.kind === 'ac' ? byN.get(en.id) : null; const u = en.kind === 'unit' ? M.unitById(en.id) : null;
      const d = en.kind === 'district' ? DISTS[en.id - 1].d : a ? a.d : u ? byN.get(u.ac).d : window.AP.state;
      const facts = [];
      if (en.kind === 'district') { const L = M.districtULB(DISTS[en.id - 1]); facts.push(`${DISTS[en.id - 1].acs.length} seats`, `${M.children(en).reduce((t, c) => t + M.units(byN.get(c.id)).length, 0)} mandals & urban bodies`); if (L.corp.length) facts.push(`${L.corp.length} corporation${L.corp.length > 1 ? 's' : ''}`); }
      if (a) facts.push(a.type === 'GEN' ? 'General seat' : `Reserved ${a.type}`, `${a.pc} PC`, M.SEAT_KIND[M.seatKind(a)]);
      if (u) facts.push(M.KIND[u.kind], u.wards ? `${u.wards} wards` : `${u.villages} villages`, `${u.boothsAll} booths`);
      if (en.kind === 'state') facts.push('28 districts', '175 seats', '17 corporations');
      const sub = en.kind === 'state' ? 'State · Andhra Pradesh' : en.kind === 'district' ? `District · ${DISTS[en.id - 1].region}` : a ? `Constituency #${a.n} · ${DISTS[a.dist - 1].name} district` : `${M.KIND[u.kind]} · ${byN.get(u.ac).name}`;
      return `<div class="dp-h"><div class="ttl"><span class="shape">${PI.shapeSVG(d, 34, 'var(--warm)')}</span><div style="min-width:0;flex:1"><h3>${esc(M.name(en))}</h3><div class="sub">${esc(sub)}${u && u.placeholder ? ' · stand-in name' : ''}</div></div><div class="acts"><button type="button" class="btn sm" data-r="pdf" aria-label="Download a PDF brief for ${esc(M.name(en))}">${ic('download')}Brief</button></div></div><div class="facts">${facts.map((f) => `<span class="badge">${esc(f)}</span>`).join('')}<span class="badge ${v.cls === 'Toss-up' ? 'accent' : ''}">${M.PARTY[v.lead].name} ${en.kind === 'ac' || en.kind === 'unit' ? v.cls.toLowerCase() : 'ahead'}</span></div></div>
        <div class="dp-tabs" role="tablist" aria-label="Area details">${TABS.map(([k, l]) => `<button type="button" role="tab" data-v="${k}" aria-selected="${k === tab}" tabindex="${k === tab ? 0 : -1}">${l}</button>`).join('')}</div><div class="dp-b" role="tabpanel"></div>`;
    }
    function kidsHTML() {
      const kids = M.children(en); if (!kids.length) return '';
      return `<div class="dp-sec"><h4><span>${M.childLabel(en)} · ${kids.length}</span><span>Lead</span></h4><div class="kids">${kids.map((c) => {
        const v = M.vals(c); const u = c.kind === 'unit' ? M.unitById(c.id) : null; const a = c.kind === 'ac' ? byN.get(c.id) : null;
        const sub = c.kind === 'district' ? `${DISTS[c.id - 1].acs.length} seats` : a ? `${a.type !== 'GEN' ? a.type + ' · ' : ''}${M.SEAT_KIND[M.seatKind(a)]}` : M.KIND_SHORT[u.kind];
        return `<button type="button" class="kid" data-k="${c.kind}" data-id="${c.id}"><span class="nm"><b>${esc(M.name(c))}</b><small>${esc(sub)}</small></span><span class="mini" aria-hidden="true"><i style="flex:${v.A};background:${U.pc('A')}"></i><i style="flex:${v.B};background:${U.pc('B')}"></i><i style="flex:${v.C + v.O + v.U};background:var(--card-3)"></i></span><span class="v">${M.lead(v)}</span>${ic('chevr')}</button>`;
      }).join('')}</div></div>`;
    }
    function body() {
      const v = M.vals(en), p = M.round > 0 ? M.vals(en, M.round - 1) : null, c = cuts(en), pr = M.ROUNDS[Math.max(0, M.round - 1)].short;
      const facts = (items) => `<div class="facts-grid">${items.map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join('')}</div>`;
      if (booth) {
        const u = M.unitById(booth.unit), k = 8 + (hash('bk' + booth.unit + booth.j) % 30);
        return `<div class="dp-sec"><h4>Booth ${40 + booth.j * 3} · ${esc(u.name)}</h4><div class="verdict"><b>${k} interviews this round</b><p>Below our minimum of 100, so booth-level percentages are hidden. These interviews count toward ${esc(u.name)} and the seat.</p></div>${facts([[k, 'Interviews'], [Math.round(k * 0.97), 'Verified'], ['Leans ' + booth.lead, 'Tally, not a forecast']])}<button type="button" class="btn" data-r="unbooth">${ic('back')}Back to ${esc(u.name)}</button></div>`;
      }
      if (tab === 'over') {
        const extra = en.kind === 'unit' ? [[M.unitById(en.id).wards || M.unitById(en.id).villages, M.unitById(en.id).wards ? 'Wards' : 'Villages']] : en.kind === 'ac' ? [[M.units(byN.get(en.id)).length, 'Mandals & urban bodies']] : [[IN(v.bo), 'Booths sampled']];
        return `${M.verdict(en, v)}${facts([[IN(v.iv), 'Interviews (n)'], [U.moe(v.iv), 'Margin of error'], [p0(Math.min(100, (v.iv / v.target) * 100)), 'Of target done'], [f1(v.verified) + '%', 'Verified'], [p0(v.gov), 'Govt approval'], ...extra])}
          <div class="dp-sec"><h4><span>Vote if held today</span><span>vs ${pr}</span></h4>${U.bars(M.intentRows(v, p), { max: 60 })}</div>
          <div class="dp-sec"><h4>Mood toward the government</h4>${U.stack([{ l: 'Positive', v: v.pos, c: 'var(--pos)' }, { l: 'Neutral', v: v.neu, c: 'var(--neu)' }, { l: 'Negative', v: v.neg, c: 'var(--neg)' }])}${U.legend([['Positive ' + p0(v.pos), 'var(--pos)'], ['Neutral ' + p0(v.neu), 'var(--neu)'], ['Negative ' + p0(v.neg), 'var(--neg)']])}</div>${kidsHTML()}`;
      }
      if (tab === 'ro') {
        return `<div class="dp-sec"><h4><span>Head to head</span><span>Party A ruling · Party B opposition</span></h4>${h2h([['Vote share', v.A, v.B], ['Leader rating', v.cm, v.opp], ['Women', c.gender[0][1], c.gender[0][2]], ['Youth 18–25', c.age[0][1], c.age[0][2]], ['Scheme homes', c.welfare[0][1], c.welfare[0][2]]])}</div>
          <div class="grid g2" style="gap:12px">${meter('Approve of the state government', v.gov, 100, p ? `${sg(v.gov - p.gov)} pts since ${pr}` : '')}${meter('Anti-incumbency index', Math.round(v.anti) + ' / 100', 100, 'Higher means more voters want a change')}${meter('Satisfied with the MLA', v.mla)}${meter('Chief Minister rating', v.cm)}</div>
          <div class="dp-sec"><h4>Across rounds</h4><div data-r="trend"></div></div>
          <div class="grid g2" style="gap:12px"><div class="dp-sec"><h4>Why people back Party A</h4>${U.bars(c.reasonsA.map(([l, x]) => ({ l, v: x, c: U.pc('A') })), { max: 45 })}</div><div class="dp-sec"><h4>Why people back Party B</h4>${U.bars(c.reasonsB.map(([l, x]) => ({ l, v: x, c: U.pc('B') })), { max: 45 })}</div></div>`;
      }
      if (tab === 'iss') {
        const qs = M.SAYINGS.filter((s) => v.iss.some(([k]) => k === s.issue)).concat(M.SAYINGS).slice(0, 3);
        return `<div class="dp-sec"><h4><span>Biggest problems named</span><span>vs ${pr}</span></h4>${U.bars(v.iss.slice(0, 6).map(([k, x]) => { const pp = p && p.iss.find(([kk]) => kk === k); return { l: k, v: x, d: pp ? x - pp[1] : null }; }), { max: 40 })}</div>
          <div class="dp-sec"><h4>Who is trusted to fix it</h4>${h2h(c.trust)}</div>
          <div class="dp-sec"><h4>Voices from this round</h4>${qs.map((s, i) => `<div class="quote"><div class="te" lang="te">${esc(s.te)}</div><div class="en">${esc(s.en)}</div><div class="meta"><span class="badge">${esc(s.issue)}</span>${s.sar > 0.75 ? '<span class="badge ai">Sarcasm detected · scored negative</span>' : s.sar > 0.4 ? '<span class="badge warn">Tone unclear · human review</span>' : '<span class="badge good">Genuine</span>'}</div>${U.player(9 + i * 3, 11 + i)}</div>`).join('')}</div>`;
      }
      if (tab === 'ppl') {
        return `<div class="dp-sec"><h4>Gender</h4>${h2h(c.gender)}</div><div class="dp-sec"><h4>Age</h4>${h2h(c.age)}</div><div class="dp-sec"><h4>Occupation</h4>${h2h(c.job)}</div><div class="dp-sec"><h4>Welfare schemes</h4>${h2h(c.welfare)}<small class="muted">${p0(v.welfare)} of households received at least one scheme this year.</small></div>`;
      }
      if (tab === 'fld') {
        const agents = en.kind === 'state' ? M.FIELD.agents : en.kind === 'district' ? DISTS[en.id - 1].acs.length * 7 : en.kind === 'ac' ? 7 : 2;
        return `${facts([[p0(Math.min(100, (v.iv / v.target) * 100)), 'Target done'], [IN(v.target), 'Target'], [agents, 'Agents assigned'], [f1(v.verified) + '%', 'Verified'], [IN(v.flagged), 'Fraud flags'], [IN(v.sarcasm), 'Sarcasm caught']])}
          <div class="dp-sec"><h4>Verification path</h4><div class="funnel">${[['Collected', v.iv + v.flagged], ['Passed auto checks', v.iv], ['Tone resolved by AI', v.iv - v.review], ['Verified', Math.round(v.iv * v.verified / 100)]].map(([l, x], i, arr) => `<div class="fn"><span>${l}</span><span class="track"><i style="width:${(x / arr[0][1]) * 100}%;opacity:${1 - i * 0.16}"></i></span><b>${IN(x)}</b></div>`).join('')}</div></div>
          <div class="dp-sec"><h4>Quality</h4><div class="grid g2" style="gap:12px">${meter('Interviews inside the booth fence', 98.1 - (hash('f' + en.id) % 20) / 10)}${meter('Back-check calls that confirmed', 96.4 - (hash('bc' + en.id) % 30) / 10)}${meter('Transcript confidence', 93 + (hash('tc' + en.id) % 50) / 10)}${meter('Human reviews done within 24 h', 91 + (hash('hr' + en.id) % 80) / 10)}</div></div>`;
      }
      if (tab === 'note') {
        const n = M.note(en), canEdit = o.canEdit !== false;
        const sec = [['summary', 'Summary'], ['politics', 'Political read'], ['issues', 'Issues'], ['field', 'Field and quality'], ['next', 'Actions for next round']];
        return `<div class="note-meta"><span class="badge ${n.status === 'Approved' ? 'good' : n.status === 'Reviewed' ? 'accent' : 'ai'}">${esc(n.status)}</span><span class="muted" style="font-size:13px">${esc(M.ROUNDS[M.round].name)} · ${n.by ? 'by ' + esc(n.by) : ''}${n.at ? ' · ' + esc(n.at) : ''}</span></div>
          ${sec.map(([k, l]) => `<div class="note-sec"><label for="nt-${k}">${l}</label><textarea class="inp" id="nt-${k}" data-k="${k}"${canEdit ? '' : ' readonly'}>${esc(n[k])}</textarea></div>`).join('')}
          ${canEdit ? `<div class="acts"><button type="button" class="btn" data-r="nsave">${ic('check')}Save as reviewed</button><button type="button" class="btn primary" data-r="napprove">Approve for client</button><button type="button" class="btn ghost" data-r="nreset">Redraft with AI</button></div>` : ''}`;
      }
      return '';
    }
    function draw() {
      host.innerHTML = head();
      const b = $('.dp-b', host); b.innerHTML = body();
      U.tablist($('.dp-tabs', host), (v) => { tab = v; booth = null; b.innerHTML = body(); wire(b); });
      wire(b);
      $('[data-r="pdf"]', host).addEventListener('click', () => M.exportReport({ type: en.kind === 'state' ? 'state' : en.kind === 'district' ? 'district' : en.kind === 'ac' ? 'ac' : 'unit', en, format: 'pdf' }));
    }
    function wire(b) {
      $$('.kid', b).forEach((k) => k.addEventListener('click', () => o.onPick && o.onPick({ kind: k.dataset.k, id: +k.dataset.id })));
      $$('.seat-row', b).forEach((k) => k.addEventListener('click', () => o.onPick && o.onPick({ kind: k.dataset.k, id: +k.dataset.id })));
      const tr = $('[data-r="trend"]', b);
      if (tr) { const rs = M.ROUNDS.filter((r) => r.id <= M.round); U.line(tr, [{ name: 'Party A', c: U.pc('A'), pts: rs.map((r) => M.vals(en, r.id).A) }, { name: 'Party B', c: U.pc('B'), pts: rs.map((r) => M.vals(en, r.id).B) }, { name: 'Govt approval', c: 'var(--ink-3)', dash: true, pts: rs.map((r) => M.vals(en, r.id).gov) }], rs.map((r) => r.short), { h: 200, label: 'Party A and Party B vote share by round' }); }
      const unb = $('[data-r="unbooth"]', b); if (unb) unb.addEventListener('click', () => { booth = null; b.innerHTML = body(); wire(b); });
      const read = () => { const n = { ...M.note(en) }; $$('textarea[data-k]', b).forEach((t) => (n[t.dataset.k] = t.value)); return n; };
      const now = () => new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      const who = (o.user && o.user()) || 'Prakash Reddy';
      const ns = $('[data-r="nsave"]', b); if (ns) ns.addEventListener('click', () => { M.saveNote(en, M.round, { ...read(), status: 'Reviewed', by: who, at: now() }); b.innerHTML = body(); wire(b); U.toast('Note saved as reviewed.'); });
      const na = $('[data-r="napprove"]', b); if (na) na.addEventListener('click', () => { M.saveNote(en, M.round, { ...read(), status: 'Approved', by: who, at: now() }); b.innerHTML = body(); wire(b); U.toast('Note approved. It now appears in reports and the Client Portal.'); });
      const nr = $('[data-r="nreset"]', b); if (nr) nr.addEventListener('click', () => { M.saveNote(en, M.round, { ...M.draftNote(en), status: 'AI draft', by: 'AI analyst', at: now() }); b.innerHTML = body(); wire(b); U.toast('A fresh draft was written from this round’s data.'); });
    }
    draw();
    return { show(x, t) { en = x; booth = null; if (t) tab = t; draw(); }, booth(bk) { booth = bk; $('.dp-b', host).innerHTML = body(); wire($('.dp-b', host)); }, current: () => en, redraw: draw };
  };
})();
