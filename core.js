/* Political Intelligence Platform · core
   Data model, helpers, charts, the map renderer and the detail panel.
   Everything here is shared by the hero, the gallery, the map explorer and the AI analyst. */
(function () {
  'use strict';
  const AP = window.AP;
  const PI = (window.PI = {});

  /* ---------------- helpers ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const IN = (n) => Math.round(n).toLocaleString('en-IN');
  const RS = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  const f1 = (n) => (Math.round(n * 10) / 10).toFixed(1);
  const pc = (n) => Math.round(n) + '%';
  const sgn = (n, d = 0) => (n > 0.04 ? '+' : n < -0.04 ? '−' : '±') + Math.abs(n).toFixed(d);
  const ic = (id, cls) => `<svg${cls ? ` class="${cls}"` : ''} aria-hidden="true" focusable="false"><use href="#i-${id}"/></svg>`;
  const logo = () => '<svg aria-hidden="true" focusable="false"><use href="#logo"/></svg>';
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hash = (s) => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = (seed) => { let a = seed >>> 0 || 1; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const moe = (n) => 98 / Math.sqrt(n);
  const moeTxt = (n) => '±' + moe(n).toFixed(1) + '%';

  const hex2rgb = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const rgb2hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };
  const ramp = (stops, t) => { t = clamp(t, 0, 1); const x = t * (stops.length - 1); const i = Math.min(Math.floor(x), stops.length - 2); return mix(stops[i], stops[i + 1], x - i); };

  /* ---------------- data model ---------------- */
  const PARTY = {
    A: { name: 'Party A', c: '#e26a0c' },
    B: { name: 'Party B', c: '#7f5af0' },
    C: { name: 'Party C', c: '#d4569a' },
    O: { name: 'Others', c: '#8a839c' },
    U: { name: 'Undecided', c: '#4a4458' },
  };
  /* issues share a short warm-violet set; issue identity is carried by the icon and label, never colour alone */
  const ISSUE = {
    Jobs: ['#e26a0c', 'brief'], 'Drinking water': ['#7f5af0', 'drop'], Irrigation: ['#b9a3ff', 'leaf'],
    'Farm prices': ['#ffb36b', 'leaf'], Prices: ['#d4569a', 'tag'], Roads: ['#8a839c', 'road'],
    Traffic: ['#8a839c', 'car'], Migration: ['#8a839c', 'route'], Healthcare: ['#8a839c', 'heart'],
    Housing: ['#8a839c', 'building'], Drainage: ['#8a839c', 'drop'], MLA: ['#8a839c', 'user'], Education: ['#8a839c', 'grad'],
  };
  const issueC = (k) => (ISSUE[k] || ['#a997ce'])[0];
  const issueI = (k) => (ISSUE[k] || [0, 'alert'])[1];

  const ACS = AP.acs;
  const DISTS = AP.districts;
  const byN = new Map(ACS.map((a) => [a.n, a]));
  const KEYS = ['pos', 'neu', 'neg', 'd1', 'A', 'B', 'C', 'O', 'U', 'A1', 'B1', 'mla'];

  function agg(list) {
    let iv = 0, bo = 0;
    const s = {}; KEYS.forEach((k) => (s[k] = 0));
    const iss = {};
    list.forEach((a) => {
      iv += a.iv; bo += a.bo;
      KEYS.forEach((k) => (s[k] += a[k] * a.iv));
      a.iss.forEach(([k, p]) => (iss[k] = (iss[k] || 0) + p * a.iv));
    });
    KEYS.forEach((k) => (s[k] /= iv));
    s.iss = Object.entries(iss).map(([k, v]) => [k, v / iv]).sort((x, y) => y[1] - x[1]);
    s.iv = iv; s.bo = bo; s.n = list.length; s.pos1 = s.pos - s.d1;
    const order = ['A', 'B', 'C'].sort((x, y) => s[y] - s[x]);
    s.lead = order[0]; s.second = order[1]; s.margin = s[order[0]] - s[order[1]];
    s.top = s.iss[0][0];
    return s;
  }
  ACS.forEach((a) => {
    a.pos1 = a.pos - a.d1;
    const order = ['A', 'B', 'C'].sort((x, y) => a[y] - a[x]);
    a.lead = order[0]; a.second = order[1]; a.margin = a[order[0]] - a[order[1]];
    a.top = a.iss[0][0];
    a.D = DISTS[a.dist - 1];
  });
  DISTS.forEach((d) => {
    d.list = d.acs.map((n) => byN.get(n));
    d.agg = agg(d.list);
    const rc = {}; d.list.forEach((a) => (rc[a.region] = (rc[a.region] || 0) + 1));
    d.region = Object.entries(rc).sort((x, y) => y[1] - x[1])[0][0];
  });
  const STATE = agg(ACS);
  const REG = [...new Set(ACS.map((a) => a.region))];
  const REGAGG = Object.fromEntries(REG.map((r) => [r, agg(ACS.filter((a) => a.region === r))]));
  const seatClass = (m) => (m >= 8 ? 'Safe' : m >= 4 ? 'Lean' : 'Toss-up');
  const DEFAULT_AC = { 15: 94 };
  const bestAC = (distId) => DEFAULT_AC[distId] || DISTS[distId - 1].acs[0];

  /* synthetic demographic cuts, stable per area (demo data) */
  function demo(key, s) {
    const r = rng(hash('demo' + key));
    const male = 50 + (r() * 4 - 1.5);
    const ages = [['18–25', 17 + r() * 4], ['26–40', 35 + r() * 5], ['41–60', 30 + r() * 4]];
    ages.push(['60+', 100 - ages.reduce((t, x) => t + x[1], 0)]);
    const posBy = [s.pos - 8 - r() * 4, s.pos - 2 - r() * 2, s.pos + 1 + r() * 3, s.pos + 5 + r() * 4];
    return {
      male, female: 100 - male, ages, posBy,
      women: s.pos + 2 + r() * 2.5, men: s.pos - 2 - r() * 2,
      rural: s.pos - 1 - r() * 2, urban: s.pos + 1 + r() * 3,
      womenA: s.A + 1 + r() * 2, menA: s.A - 1 - r() * 2,
    };
  }

  /* ---------------- shapes ---------------- */
  const BB = new Map();
  function bbox(d) {
    if (BB.has(d)) return BB.get(d);
    const nums = d.match(/-?\d+(?:\.\d+)?/g).map(Number);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (let i = 0; i < nums.length - 1; i += 2) {
      const x = nums[i], y = nums[i + 1];
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    const b = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    BB.set(d, b);
    return b;
  }
  function shapeSVG(d, size = 40, fill = 'url(#gBrand)') {
    const b = bbox(d); const p = Math.max(b.w, b.h) * 0.08;
    return `<svg width="${size}" height="${size}" viewBox="${b.x - p} ${b.y - p} ${b.w + p * 2} ${b.h + p * 2}" aria-hidden="true"><path d="${d}" fill="${fill}"/></svg>`;
  }
  function waveBars(n, seed, cls = '') {
    const r = rng(seed || 7);
    let out = '';
    for (let i = 0; i < n; i++) {
      const h = 18 + Math.abs(Math.sin(i * 0.55)) * 50 + r() * 32;
      out += `<i class="${cls}" style="height:${Math.round(h)}%"></i>`;
    }
    return out;
  }

  /* ---------------- charts ---------------- */
  function donut(segs, o = {}) {
    const size = o.size || 120, w = o.w || 14, r = (size - w) / 2, C = 2 * Math.PI * r;
    const total = segs.reduce((t, s) => t + s.v, 0) || 1;
    let off = 0;
    const arcs = segs.map((s) => {
      const len = (s.v / total) * C;
      const el = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${s.c}" stroke-width="${w}" stroke-dasharray="${Math.max(len - 2.2, 0.01).toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}"/>`;
      off += len;
      return el;
    }).join('');
    const label = o.aria || [o.big, o.small].filter(Boolean).join(' ');
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(label)}"><g transform="rotate(-90 ${size / 2} ${size / 2})"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="${w}"/>${arcs}</g>${o.big ? `<text x="50%" y="${o.small ? '46%' : '52%'}" text-anchor="middle" dominant-baseline="middle" fill="${o.ink || '#fff'}" style="font:700 ${Math.round(size * 0.2)}px var(--font)">${o.big}</text>` : ''}${o.small ? `<text x="50%" y="66%" text-anchor="middle" fill="${o.sub || '#a997ce'}" style="font:600 ${Math.round(size * 0.095)}px var(--font)">${o.small}</text>` : ''}</svg>`;
  }
  function hbars(rows, o = {}) {
    const max = o.max || 100, w = o.w || 82, fmt = o.fmt || ((v) => Math.round(v) + '%');
    return `<div class="hbars">${rows.map((r) => `<div class="hbar" style="grid-template-columns:${w}px 1fr 46px"><span>${esc(r.label)}</span><span class="tr">${r.ghost != null ? `<i class="ghost" style="width:${clamp((r.ghost / max) * 100, 0, 100)}%"></i>` : ''}<i style="width:${clamp((r.v / max) * 100, 0, 100)}%;background:${r.c}"></i></span><b>${fmt(r.v)}</b></div>`).join('')}</div>`;
  }
  function lineChart(series, o = {}) {
    const w = o.w || 360, h = o.h || 150, min = o.min ?? 30, max = o.max ?? 70;
    const labels = o.labels || ['Round 1', 'Round 2'], ticks = o.ticks || [40, 50, 60];
    const px = 36, py = 12, iw = w - px - 16, ih = h - py - 26;
    const X = (i, n) => px + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
    const Y = (v) => py + ih - ((v - min) / (max - min)) * ih;
    let g = ticks.map((t) => `<line x1="${px}" x2="${w - 16}" y1="${Y(t).toFixed(1)}" y2="${Y(t).toFixed(1)}" stroke="rgba(255,255,255,.08)"/><text x="${px - 8}" y="${(Y(t) + 4).toFixed(1)}" text-anchor="end" fill="#a997ce" style="font:600 11px var(--font)">${t}%</text>`).join('');
    g += labels.map((l, i) => `<text x="${X(i, labels.length).toFixed(1)}" y="${h - 6}" text-anchor="middle" fill="#a997ce" style="font:600 11px var(--font)">${l}</text>`).join('');
    series.forEach((s) => {
      const pts = s.pts.map((v, i) => [X(i, s.pts.length), Y(v)]);
      const line = pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
      if (s.area) g += `<path d="M${line}L${pts[pts.length - 1][0].toFixed(1)} ${py + ih}L${pts[0][0].toFixed(1)} ${py + ih}Z" fill="${s.c}" opacity=".13"/>`;
      g += `<path d="M${line}" fill="none" stroke="${s.c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
      g += pts.map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4.5" fill="#0b0b0d" stroke="${s.c}" stroke-width="2.6"/>`).join('');
    });
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="${esc(o.aria || 'Trend chart')}">${g}</svg>`;
  }
  const legRow = (label, v, c, delta) => `<div><span><i style="background:${c}"></i>${esc(label)}</span><b>${pc(v)}</b>${delta != null ? `<em class="${delta >= 0 ? 'up' : 'dn'}" style="font-style:normal;font-size:12px">${sgn(delta)}</em>` : '<em></em>'}</div>`;
  function sentDonut(s, size = 112) {
    return `<div class="donut-row">${donut([{ v: s.pos, c: '#fe881b' }, { v: s.neu, c: '#a997ce' }, { v: s.neg, c: '#7f5af0' }], { size, w: 13, big: pc(s.pos), small: 'positive', aria: `Positive ${pc(s.pos)}, neutral ${pc(s.neu)}, negative ${pc(s.neg)}` })}<div class="donut-leg">${legRow('Positive', s.pos, '#fe881b', s.d1)}${legRow('Neutral', s.neu, '#a997ce')}${legRow('Negative', s.neg, '#7f5af0')}</div></div>`;
  }
  function intentBars(s, ghost) {
    const rows = ['A', 'B', 'C', 'O', 'U'].map((k) => ({ label: PARTY[k].name, v: s[k], c: PARTY[k].c, ghost: ghost && (k === 'A' || k === 'B') ? s[k + '1'] : null }));
    return hbars(rows, { max: 60, w: 88 });
  }
  function issueTiles(s, n = 3) {
    return `<div class="issue-tiles">${s.iss.slice(0, n).map(([k, v], i) => {
      const dv = [3, 2, -1, 1, 2][i];
      return `<div class="issue">${ic(issueI(k))}<span>${esc(k)}</span><b>${pc(v)}</b><em class="${dv >= 0 ? 'up' : 'dn'}">${sgn(dv)} pts</em></div>`;
    }).join('')}</div>`;
  }
  function quoteFor(k) { return AP.quotes.find((q) => q.k === k) || AP.quotes[0]; }
  function quoteHTML(q, where, len = 14) {
    return `<div class="vquote"><span class="te" lang="te">${esc(q.te)}</span><span class="en">“${esc(q.en)}”</span><div class="player" data-len="${len}"><button type="button" aria-label="Play voter clip">${ic('play')}</button><span class="wave" aria-hidden="true">${waveBars(42, hash(q.en))}</span><time>0:00 / 0:${String(len).padStart(2, '0')}</time></div><small>${esc(q.who)}, ${esc(where)} · anonymised clip</small></div>`;
  }

  /* ---------------- map ---------------- */
  const SENT_STOPS = ['#300681', '#4f12b8', '#8130ff', '#ac24ff', '#ca45ff', '#ee5fa6', '#fe881b', '#ffb340', '#ffd600'];
  const COVER_STOPS = ['#111114', '#300681', '#1c4eff', '#2ba7ff', '#a8dcff'];
  const METRICS = {
    sent: {
      label: 'Positive mood',
      color: (s) => ramp(SENT_STOPS, (s.pos - 40) / 26),
      legend: () => ({ type: 'ramp', stops: SENT_STOPS, ticks: ['40%', '47%', '53%', '60%', '66%'], title: 'Positive mood' }),
    },
    lead: {
      label: 'Who leads',
      color: (s) => mix('#111114', PARTY[s.lead].c, clamp(0.35 + s.margin / 14, 0.35, 1)),
      legend: () => ({ type: 'cats', title: 'Who leads · deeper colour = bigger lead', items: ['A', 'B', 'C'].map((k) => [PARTY[k].name, PARTY[k].c]) }),
    },
    swing: {
      label: 'Change since Round 1',
      color: (s) => (s.d1 >= 0 ? mix('#2a1f45', '#fe881b', clamp(s.d1 / 9, 0, 1)) : mix('#2a1f45', '#1c4eff', clamp(-s.d1 / 4, 0, 1))),
      legend: () => ({ type: 'ramp', stops: ['#1c4eff', '#2a1f45', '#fe881b'], ticks: ['−4 pts', '0', '+9 pts'], title: 'Change in positive mood since Round 1' }),
    },
    issue: {
      label: 'Top issue',
      color: (s) => issueC(s.top),
      legend: (lvl) => ({ type: 'cats', title: 'Top issue', items: [...new Set((lvl === 'district' ? DISTS.map((d) => d.agg.top) : ACS.map((a) => a.top)))].map((k) => [k, issueC(k)]) }),
    },
    cover: {
      label: 'Coverage',
      color: (s, lvl) => ramp(COVER_STOPS, ((lvl === 'district' ? s.iv / s.n : s.iv) - 880) / 250),
      legend: () => ({ type: 'ramp', stops: COVER_STOPS, ticks: ['880', '1,000', '1,130'], title: 'Interviews per seat' }),
    },
  };
  function legendHTML(L) {
    if (L.type === 'ramp') return `<b>${esc(L.title)}</b><div class="ramp" style="background:linear-gradient(90deg,${L.stops.join(',')})"></div><div class="ramp-ticks">${L.ticks.map((t) => `<span>${t}</span>`).join('')}</div>`;
    return `<b>${esc(L.title)}</b><div class="legend">${L.items.map(([n, c]) => `<span><i style="background:${c}"></i>${esc(n)}</span>`).join('')}</div>`;
  }
  const statsOf = (en) => (en.kind === 'district' ? DISTS[en.id - 1].agg : byN.get(en.id));
  const nameOf = (en) => (en.kind === 'district' ? DISTS[en.id - 1].name : byN.get(en.id).name);
  function tipHTML(en) {
    const s = statsOf(en);
    const sub = en.kind === 'district' ? `District · ${s.n} seats` : `${byN.get(en.id).D.name} district`;
    return `<b>${esc(nameOf(en))}</b><div class="mt-row" style="margin-bottom:6px">${sub} · ${IN(s.iv)} interviews</div>
      <div class="mt-row"><span>Positive mood</span><strong>${pc(s.pos)} (${sgn(s.d1)})</strong></div>
      <div class="mt-row"><span>Leads</span><strong>${PARTY[s.lead].name} · ${pc(s[s.lead])}</strong></div>
      <div class="mt-row"><span>Top issue</span><strong>${esc(s.top)}</strong></div>`;
  }

  let mapSeq = 0;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function MapView(el, o) {
    const id = 'mp' + ++mapSeq;
    const opt = Object.assign({ level: 'district', metric: 'sent', labels: true, labelMin: 3800, labelSize: 13, tip: true, onSelect: null, selKind: null, selId: null, region: null, highlight: null, base: true }, o || {});
    el.classList.add('amap');
    el.innerHTML = `<svg viewBox="-14 -14 1028 884" role="img" aria-label="Map of Andhra Pradesh">
      <defs>
        <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b997ff"/><stop offset=".5" stop-color="#ca45ff"/><stop offset="1" stop-color="#fe881b"/></linearGradient>
        <filter id="${id}b" x="-15%" y="-15%" width="130%" height="130%"><feGaussianBlur stdDeviation="14"/></filter>
      </defs>
      ${opt.base ? `<g aria-hidden="true"><path d="${AP.state}" fill="url(#${id}g)" opacity=".5" filter="url(#${id}b)"/><path d="${AP.state}" transform="translate(0 12)" fill="#0f0526"/><path d="${AP.state}" transform="translate(0 6)" fill="#2a0c5e"/></g>` : ''}
      <g class="mp-acs">${ACS.map((a) => `<path class="mp-ac" data-n="${a.n}" d="${a.d}"/>`).join('')}</g>
      <g class="mp-ds">${DISTS.map((d) => `<path class="mp-d" data-d="${d.id}" d="${d.d}"/>`).join('')}</g>
      <g class="mp-dots"></g>
      <g class="mp-labels"></g>
    </svg>`;
    const svg = el.querySelector('svg');
    const acEls = new Map($$('.mp-ac', svg).map((p) => [+p.dataset.n, p]));
    const dEls = new Map($$('.mp-d', svg).map((p) => [+p.dataset.d, p]));
    const labels = svg.querySelector('.mp-labels');

    function paint() {
      const M = METRICS[opt.metric];
      svg.classList.toggle('lvl-ac', opt.level === 'ac');
      const dCol = new Map(DISTS.map((d) => [d.id, M.color(d.agg, 'district')]));
      ACS.forEach((a) => {
        const p = acEls.get(a.n);
        const c = opt.level === 'district' ? dCol.get(a.dist) : M.color(a, 'ac');
        p.style.fill = c;
        p.style.stroke = opt.level === 'district' ? c : 'rgba(4,4,5,.8)';
        const reg = opt.level === 'district' ? a.D.region : a.region;
        p.classList.toggle('dim', !!((opt.region && reg !== opt.region) || (opt.highlight && !opt.highlight.has(a.n))));
      });
      DISTS.forEach((d) => dEls.get(d.id).classList.toggle('dim', !!(opt.region && d.region !== opt.region && opt.level === 'district')));
      markSel();
    }
    function markSel() {
      acEls.forEach((p) => p.classList.remove('sel'));
      dEls.forEach((p) => p.classList.remove('sel'));
      if (opt.selKind === 'ac' && acEls.has(opt.selId)) { const p = acEls.get(opt.selId); p.classList.add('sel'); p.parentNode.appendChild(p); }
      if (opt.selKind === 'district' && dEls.has(opt.selId)) { const p = dEls.get(opt.selId); p.classList.add('sel'); p.parentNode.appendChild(p); }
      drawLabels();
    }
    function drawLabels() {
      if (!opt.labels) { labels.innerHTML = ''; return; }
      const out = [];
      if (opt.level === 'district') {
        DISTS.forEach((d) => {
          const sel = opt.selKind === 'district' && opt.selId === d.id;
          if (!sel && d.area < opt.labelMin) return;
          const nm = d.name.replace('Alluri Sitharama Raju', 'ASR').replace('Parvathipuram Manyam', 'Manyam').replace('Sri Sathya Sai', 'Sathya Sai');
          out.push(`<text class="mp-label" x="${d.c[0]}" y="${d.c[1]}" text-anchor="middle" dominant-baseline="middle" style="font-size:${sel ? opt.labelSize * 1.35 : opt.labelSize}px">${esc(nm)}</text>`);
        });
      } else if (opt.selKind === 'ac' && byN.has(opt.selId)) {
        const a = byN.get(opt.selId);
        out.push(`<text class="mp-label" x="${a.c[0]}" y="${a.c[1] - 18}" text-anchor="middle" style="font-size:${opt.labelSize * 1.35}px">${esc(a.name)}</text>`);
      }
      labels.innerHTML = out.join('');
    }
    const entityAt = (t) => (t.dataset && t.dataset.d ? { kind: 'district', id: +t.dataset.d } : t.dataset && t.dataset.n ? { kind: 'ac', id: +t.dataset.n } : null);
    let tip = null;
    if (opt.tip && finePointer) {
      tip = document.createElement('div');
      tip.className = 'map-tip'; tip.setAttribute('aria-hidden', 'true');
      el.appendChild(tip);
      svg.addEventListener('pointermove', (e) => {
        const en = entityAt(e.target);
        if (!en) { tip.classList.remove('show'); return; }
        tip.innerHTML = tipHTML(en);
        const r = el.getBoundingClientRect();
        let x = e.clientX - r.left + 18, y = e.clientY - r.top + 18;
        if (x + 230 > r.width) x = e.clientX - r.left - 236;
        if (y + 150 > r.height) y = e.clientY - r.top - 150;
        tip.style.left = x + 'px'; tip.style.top = y + 'px';
        tip.classList.add('show');
      });
      svg.addEventListener('pointerleave', () => tip.classList.remove('show'));
    }
    if (opt.onSelect) {
      svg.addEventListener('click', (e) => { const en = entityAt(e.target); if (en) opt.onSelect(en); });
    } else {
      svg.style.cursor = 'default';
      $$('.mp-d, .mp-ac', svg).forEach((p) => (p.style.cursor = 'default'));
    }
    paint();
    return {
      el, svg, opt,
      set(o2) { Object.assign(opt, o2); paint(); },
      select(kind, id) { opt.selKind = kind; opt.selId = id; markSel(); },
      dots(html) { svg.querySelector('.mp-dots').innerHTML = html; },
    };
  }

  /* ---------------- detail panel ---------------- */
  const TABS = [['overview', 'Overview'], ['intention', 'Voter intention'], ['issues', 'Issues'], ['people', 'Demographics'], ['trends', 'Trends']];
  function panelBody(en, tab) {
    const s = statsOf(en);
    const key = en.kind + en.id;
    const where = en.kind === 'district' ? DISTS[en.id - 1].name + ' district' : byN.get(en.id).name;
    if (tab === 'overview') {
      return `<div class="dp-2"><div class="panel"><div class="h5">Voter sentiment <small>Round 2</small></div>${sentDonut(s, 104)}</div>
        <div class="panel"><div class="h5">Voting intention <small>projected</small></div>${intentBars(s)}</div></div>
        <div class="panel"><div class="h5">Top voter issues <small>vs Round 1</small></div>${issueTiles(s)}</div>
        <div class="panel"><div class="h5">Positive mood <small>Round 1 → Round 2</small></div><div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center">${lineChart([{ pts: [s.pos1, s.pos], c: '#fe881b', area: true }], { w: 300, h: 118, min: 35, max: 70, ticks: [40, 55, 70], aria: `Positive mood from ${pc(s.pos1)} to ${pc(s.pos)}` })}<div class="trend-pill"><b>${sgn(s.d1)} pts</b><span>since Round 1</span></div></div></div>`;
    }
    if (tab === 'intention') {
      const extra = en.kind === 'district'
        ? (() => { const c = { A: 0, B: 0, C: 0 }; DISTS[en.id - 1].list.forEach((a) => c[a.lead]++); return `<div class="stat"><b>${c.A} · ${c.B}${c.C ? ' · ' + c.C : ''}</b><span>seats led by A · B${c.C ? ' · C' : ''}</span></div>`; })()
        : `<div class="stat"><b>${pc(s.mla)}</b><span>MLA satisfaction</span></div>`;
      return `<div class="panel"><div class="h5">Voting intention <small>n = ${IN(s.iv)} · ${moeTxt(s.iv)}</small></div>${intentBars(s, true)}<div class="legend" style="margin-top:10px"><span><i style="background:rgba(255,255,255,.35)"></i>Round 1</span><span><i style="background:#fff"></i>Round 2</span></div></div>
        <div class="stat-grid"><div class="stat"><b>${s.margin < 1 ? 'Level' : PARTY[s.lead].name}</b><span>${s.margin < 1 ? `${PARTY[s.lead].name} and ${PARTY[s.second].name} within 1 pt` : `leads by ${f1(s.margin)} pts`}</span></div><div class="stat"><b>${seatClass(s.margin)}</b><span>race status</span></div><div class="stat"><b>${pc(s.U)}</b><span>still undecided</span></div>${extra}</div>`;
    }
    if (tab === 'issues') {
      const q = en.kind === 'ac' ? AP.quotes[byN.get(en.id).q] || quoteFor(s.top) : quoteFor(s.top);
      return `<div class="panel"><div class="h5">What voters raise most <small>share naming it</small></div>${hbars(s.iss.slice(0, 6).map(([k, v]) => ({ label: k, v, c: issueC(k) })), { max: Math.max(40, s.iss[0][1] + 6), w: 112 })}</div>${quoteHTML(q, where)}`;
    }
    if (tab === 'people') {
      const dm = demo(key, s);
      return `<div class="dp-2"><div class="panel"><div class="h5">Respondent profile</div><div class="legend" style="justify-content:space-between;margin-bottom:8px"><span><i style="background:#b997ff"></i>Men ${pc(dm.male)}</span><span><i style="background:#f79fff"></i>Women ${pc(dm.female)}</span></div><div class="ramp" style="background:linear-gradient(90deg,#b997ff 0 ${dm.male}%,#f79fff ${dm.male}% 100%)"></div></div>
        <div class="panel"><div class="h5">Positive mood by gender</div>${hbars([{ label: 'Women', v: dm.women, c: '#f79fff' }, { label: 'Men', v: dm.men, c: '#b997ff' }], { max: 80, w: 60 })}</div></div>
        <div class="panel"><div class="h5">Positive mood by age <small>share of sample</small></div>${hbars(dm.ages.map((a, i) => ({ label: `${a[0]} · ${pc(a[1])}`, v: dm.posBy[i], c: ramp(SENT_STOPS, (dm.posBy[i] - 40) / 26) })), { max: 80, w: 104 })}</div>
        <div class="stat-grid"><div class="stat"><b>${pc(dm.rural)}</b><span>positive, rural</span></div><div class="stat"><b>${pc(dm.urban)}</b><span>positive, urban</span></div></div>`;
    }
    const shift = (k) => `<div><span><i style="background:${PARTY[k].c}"></i>${PARTY[k].name}</span><b>${pc(s[k + '1'])} → ${pc(s[k])}</b><em class="${s[k] - s[k + '1'] >= 0 ? 'up' : 'dn'}" style="font-style:normal;font-size:12px">${sgn(s[k] - s[k + '1'])}</em></div>`;
    return `<div class="panel"><div class="h5">Mood <small>Round 1 → Round 2</small></div>${lineChart([{ pts: [s.pos1, s.pos], c: '#fe881b', area: true }, { pts: [s.neg + s.d1 * 0.6, s.neg], c: '#7f5af0' }], { w: 340, h: 150, min: 15, max: 70, ticks: [20, 40, 60], aria: 'Positive and negative mood across rounds' })}<div class="legend"><span><i style="background:#fe881b"></i>Positive</span><span><i style="background:#7f5af0"></i>Negative</span></div></div>
      <div class="panel"><div class="h5">Intention shift</div><div class="donut-leg">${shift('A')}${shift('B')}</div></div>
      ${en.kind === 'ac' ? `<div class="stat-grid"><div class="stat"><b>${pc(s.mla)}</b><span>MLA satisfaction</span></div><div class="stat"><b>${byN.get(en.id).bo}</b><span>booths sampled</span></div></div>` : ''}`;
  }
  function Panel(el, o) {
    const st = { en: (o && o.en) || { kind: 'district', id: 15 }, tab: 'overview' };
    const onPick = o && o.onPick;
    function head() {
      const en = st.en, s = statsOf(en);
      if (en.kind === 'district') {
        const d = DISTS[en.id - 1];
        return `<div class="dp-head"><span class="crest">${shapeSVG(d.d, 40)}</span><div style="min-width:0"><div class="h5">${esc(d.name)} <span>District</span></div><p>${d.agg.n} constituencies · ${IN(s.iv)} interviews · ${IN(s.bo)} booths</p></div>
          <label class="dp-pick"><span class="sr">Choose a district</span><select data-pick="district">${DISTS.map((x) => `<option value="${x.id}"${x.id === d.id ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select>${ic('chev')}</label></div>`;
      }
      const a = byN.get(en.id);
      return `<div class="dp-head"><span class="crest">${shapeSVG(a.d, 40)}</span><div style="min-width:0"><div class="h5">${esc(a.name)} <span>${a.type === 'GEN' ? 'Seat' : a.type + ' seat'}</span></div><p>${esc(a.D.name)} district · ${IN(a.iv)} interviews · ${a.bo} booths</p></div>
        <label class="dp-pick"><span class="sr">Choose a constituency</span><select data-pick="ac">${DISTS.map((d) => `<optgroup label="${esc(d.name)}">${d.list.map((x) => `<option value="${x.n}"${x.n === a.n ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</optgroup>`).join('')}</select>${ic('chev')}</label></div>`;
    }
    function render() {
      el.innerHTML = `${head()}<div class="dp-tabs" role="tablist" aria-label="Detail views">${TABS.map(([k, l]) => `<button type="button" role="tab" data-t="${k}" aria-selected="${k === st.tab}" tabindex="${k === st.tab ? 0 : -1}">${l}</button>`).join('')}</div><div class="dp-body" role="tabpanel">${panelBody(st.en, st.tab)}</div>`;
      tabs(el.querySelector('.dp-tabs'), (b) => { st.tab = b.dataset.t; el.querySelector('.dp-body').innerHTML = panelBody(st.en, st.tab); });
      const sel = el.querySelector('select');
      sel.addEventListener('change', () => { const en = { kind: sel.dataset.pick, id: +sel.value }; st.en = en; render(); onPick && onPick(en); });
    }
    render();
    return { show(en) { st.en = en; render(); }, current: () => st.en, el };
  }

  /* ---------------- tabs, toast, player ---------------- */
  function tabs(container, onChange) {
    const items = () => $$('[role="tab"]', container);
    function activate(btn, focus) {
      items().forEach((b) => { const on = b === btn; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
      if (focus) btn.focus();
      onChange && onChange(btn);
    }
    container.addEventListener('click', (e) => { const b = e.target.closest('[role="tab"]'); if (b && container.contains(b)) activate(b); });
    container.addEventListener('keydown', (e) => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
      const list = items(); const i = list.indexOf(document.activeElement); if (i < 0) return;
      e.preventDefault();
      const next = e.key === 'ArrowRight' || e.key === 'ArrowDown', prev = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
      const j = next ? (i + 1) % list.length : prev ? (i - 1 + list.length) % list.length : e.key === 'Home' ? 0 : list.length - 1;
      activate(list[j], true);
    });
    return { activate };
  }
  function toast(host, msg) {
    let t = host.querySelector(':scope > .toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); host.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600);
  }
  document.addEventListener('click', (e) => {
    const tb = e.target.closest('[data-toast]');
    if (tb) { const host = tb.closest('.app, .chat, .prod-art, .sheet, section') || document.body; toast(host, tb.dataset.toast); }
    const b = e.target.closest('.player button');
    if (!b) return;
    const pl = b.closest('.player'); const bars = $$('.wave i', pl); const time = pl.querySelector('time');
    const total = +(pl.dataset.len || 14);
    const stop = (reset) => { clearInterval(pl._t); pl._t = null; b.innerHTML = ic('play'); b.setAttribute('aria-label', 'Play voter clip'); if (reset) { pl._i = 0; setTimeout(() => bars.forEach((x) => x.classList.remove('p')), 700); } };
    if (pl._t) { stop(false); return; }
    let i = pl._i || 0;
    b.innerHTML = ic('pause'); b.setAttribute('aria-label', 'Pause voter clip');
    pl._t = setInterval(() => {
      i++; pl._i = i;
      bars.forEach((x, k) => x.classList.toggle('p', k < i));
      const sec = Math.round((total * i) / bars.length);
      if (time) time.textContent = `0:${String(sec).padStart(2, '0')} / 0:${String(total).padStart(2, '0')}`;
      if (i >= bars.length) stop(true);
    }, (total * 1000) / bars.length / 3);
  });

  /* ---------------- app chrome + overview ---------------- */
  const PAGES = [['overview', 'Overview'], ['surveys', 'Surveys'], ['analytics', 'Analytics'], ['ai', 'AI Analyst'], ['reports', 'Reports'], ['field', 'Field Ops']];
  function topBar(active, mode) {
    const nav = PAGES.map(([k, l]) => {
      const inner = `${k === 'ai' ? ic('spark') : ''}${l}`;
      return mode === 'tabs'
        ? `<button type="button" role="tab" data-v="${k}" aria-selected="${k === active}" tabindex="${k === active ? 0 : -1}">${inner}</button>`
        : `<button type="button" data-jump="${k}" class="${k === active ? 'on' : ''}"${k === active ? ' aria-current="page"' : ''}>${inner}</button>`;
    }).join('');
    return `<div class="app-top"><div class="app-logo">${logo()}<span>Political Intelligence<small>Command Center</small></span></div>
      <span class="app-state">${ic('pin')}Andhra Pradesh${ic('chev')}</span>
      <div class="app-nav"${mode === 'tabs' ? ' role="tablist" aria-label="Dashboard pages"' : ' aria-label="Dashboard pages"'}>${nav}</div>
      <div class="app-tools"><i class="hide-sm">${ic('search')}</i><i class="dot hide-sm">${ic('bell')}</i><span class="avatar" aria-hidden="true">SR</span></div></div>`;
  }
  function kpiRow(items) {
    return `<div class="kpis">${items.map(([i, b, s, e, dn]) => `<div class="kpi"><span class="ki">${ic(i)}</span><div style="min-width:0"><b>${b}</b><span>${s}</span>${e ? `<em class="${dn ? 'dn' : ''}">${e}</em>` : ''}</div></div>`).join('')}</div>`;
  }
  function overviewInto(body, o) {
    const opts = Object.assign({ labelMin: 3700, labelSize: 13 }, o || {});
    body.innerHTML = `<div class="app-head"><div><div class="ttl">Andhra Pradesh</div><p>Voter mood, intention and top issues across 28 districts and 175 seats.</p></div>
      <div class="app-actions"><button type="button" class="chip-btn" data-toast="Round picker: Round 1 and Round 2 are available.">${ic('cal')}Round 2 · Aug 15 – Sep 10, 2026${ic('chev')}</button><button type="button" class="chip-btn" data-toast="Comparing with Round 1. Changes show as + and −.">${ic('swap')}vs Round 1</button><button type="button" class="chip-btn primary" data-toast="Export: PDF in Telugu and English, or Excel.">${ic('download')}Export</button></div></div>
      ${kpiRow([['users', IN(STATE.iv), 'Interviews', '+12% vs R1'], ['pin', '175 / 175', 'Constituencies', '100% covered'], ['layers', '28 / 28', 'Districts', '100% covered'], ['wave', IN(STATE.iv), 'Voice clips', 'Verified'], ['spark', pc(STATE.pos), 'Positive mood', sgn(STATE.d1) + ' pts vs R1'], ['shield', '98.4%', 'Data quality', '+1.2 pts']])}
      <div class="ov"><div class="ov-map"><div class="ov-map-top"><div class="seg sm" role="tablist" aria-label="Map level"><button type="button" role="tab" data-l="district" aria-selected="true">District view</button><button type="button" role="tab" data-l="ac" aria-selected="false" tabindex="-1">Constituency view</button></div><span class="badge purple">Click the map</span></div><div class="ov-mapbox"></div><div class="ov-map-foot"><div class="ov-legend">${legendHTML(METRICS.sent.legend())}</div></div></div><aside class="dpanel" aria-label="Selected area"></aside></div>`;
    const panel = Panel(body.querySelector('.dpanel'), { en: { kind: 'district', id: 15 }, onPick: (en) => map.select(en.kind, en.id) });
    const map = MapView(body.querySelector('.ov-mapbox'), { level: 'district', metric: 'sent', labelMin: opts.labelMin, labelSize: opts.labelSize, selKind: 'district', selId: 15, onSelect: (en) => { map.select(en.kind, en.id); panel.show(en); } });
    tabs(body.querySelector('.ov-map-top .seg'), (btn) => {
      const lvl = btn.dataset.l; const cur = panel.current();
      const en = lvl === 'district'
        ? { kind: 'district', id: cur.kind === 'ac' ? byN.get(cur.id).dist : cur.id }
        : { kind: 'ac', id: cur.kind === 'district' ? bestAC(cur.id) : cur.id };
      map.set({ level: lvl, selKind: en.kind, selId: en.id });
      panel.show(en);
    });
    return { map, panel };
  }

  Object.assign(PI, {
    $, $$, IN, RS, f1, pc, sgn, ic, logo, esc, clamp, reduced, hash, rng, moe, moeTxt, mix, ramp,
    PARTY, ISSUE, issueC, issueI, ACS, DISTS, byN, STATE, REG, REGAGG, agg, demo, seatClass, bestAC,
    bbox, shapeSVG, waveBars, donut, hbars, lineChart, sentDonut, intentBars, issueTiles, quoteFor, quoteHTML,
    SENT_STOPS, COVER_STOPS, METRICS, legendHTML, statsOf, nameOf, MapView, Panel, tabs, toast, topBar, kpiRow, overviewInto, PAGES,
  });
})();
