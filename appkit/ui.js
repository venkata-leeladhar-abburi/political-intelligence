/* Political Intelligence Platform · UI kit for the product pages
   Formatting, icons, charts with hover, toast, dialog, theme and small widgets. */
(function () {
  'use strict';
  const PI = window.PI, M = window.M;
  const U = (window.U = {});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = PI.esc;
  Object.assign(U, { $, $$, esc });

  U.ic = (id, cls = 'i') => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${id}"/></svg>`;
  U.IN = (n) => Math.round(n).toLocaleString('en-IN');
  U.p0 = (n) => Math.round(n) + '%';
  U.f1 = (n) => (Math.round(n * 10) / 10).toFixed(1);
  U.sg = (n, d = 1) => (n > 0.049 ? '+' : n < -0.049 ? '−' : '±') + Math.abs(n).toFixed(d);
  U.dl = (n, d = 1, unit = ' pts') => `<em class="${n > 0.049 ? 'up' : n < -0.049 ? 'dn' : ''}">${U.sg(n, d)}${unit}</em>`;
  U.moe = (n) => '±' + U.f1(98 / Math.sqrt(Math.max(n, 1)));
  U.initials = (s) => s.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  U.pc = (k) => `var(${M.PARTY[k].v})`;
  U.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- theme ---------- */
  U.theme = {
    get() { try { return localStorage.getItem('pi-theme') || 'dark'; } catch (e) { return 'dark'; } },
    set(t) { document.documentElement.dataset.theme = t; try { localStorage.setItem('pi-theme', t); } catch (e) { /* ignore */ } document.dispatchEvent(new CustomEvent('themechange')); },
  };
  document.documentElement.dataset.theme = U.theme.get();

  /* ---------- toast ---------- */
  let tEl;
  U.toast = (msg) => {
    if (!tEl) { tEl = document.createElement('div'); tEl.className = 'toast'; tEl.setAttribute('role', 'status'); document.body.appendChild(tEl); }
    tEl.textContent = msg; tEl.classList.add('on');
    clearTimeout(tEl._h); tEl._h = setTimeout(() => tEl.classList.remove('on'), 2800);
  };

  /* ---------- tooltip ---------- */
  let tip;
  U.tip = (html, x, y) => {
    if (!tip) { tip = document.createElement('div'); tip.className = 'tip'; tip.setAttribute('aria-hidden', 'true'); document.body.appendChild(tip); }
    if (html == null) { tip.classList.remove('on'); return; }
    tip.innerHTML = html; tip.classList.add('on');
    const w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = Math.min(innerWidth - w - 10, Math.max(10, x + 14)) + 'px';
    tip.style.top = Math.min(innerHeight - h - 10, Math.max(10, y - h - 12)) + 'px';
  };
  U.tipRows = (title, rows) => `<b>${esc(title)}</b>${rows.map(([k, v]) => `<div class="tr"><span>${esc(k)}</span><span>${v}</span></div>`).join('')}`;
  /* hover for any element carrying data-tip (html stored on the node) */
  document.addEventListener('pointermove', (e) => {
    const t = e.target.closest && e.target.closest('[data-tip]');
    if (t && e.pointerType !== 'touch') U.tip(t.dataset.tip, e.clientX, e.clientY); else if (tip && tip.classList.contains('on') && !e.target.closest('.mapbox')) U.tip(null);
  });

  /* ---------- dialog ---------- */
  U.dialog = function ({ title, sub = '', body = '', foot = '', wide = false, onOpen }) {
    const d = document.createElement('dialog');
    d.className = 'dlg' + (wide ? ' wide' : '');
    d.setAttribute('aria-label', title);
    d.innerHTML = `<div class="dlg-h"><div><h3>${esc(title)}</h3>${sub ? `<p>${sub}</p>` : ''}</div><button type="button" class="btn ghost icon" data-close aria-label="Close">${U.ic('x')}</button></div><div class="dlg-b">${body}</div>${foot ? `<div class="dlg-f">${foot}</div>` : ''}`;
    document.body.appendChild(d);
    d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
    d.addEventListener('close', () => d.remove());
    d.showModal();
    if (onOpen) onOpen(d);
    return d;
  };

  /* ---------- segmented control ---------- */
  U.seg = (name, items, cur) => `<div class="seg" role="group" aria-label="${esc(name)}">${items.map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${String(v) === String(cur)}">${l}</button>`).join('')}</div>`;
  U.onSeg = (root, sel, fn) => {
    $$(sel + ' button', root).forEach((b) => b.addEventListener('click', () => {
      $$('button', b.parentElement).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      fn(b.dataset.v, b);
    }));
  };
  /* tablist with arrow keys */
  U.tablist = (el, fn) => {
    const bs = $$('[role="tab"]', el);
    const pick = (b, focus) => { bs.forEach((x) => { const on = x === b; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; }); if (focus) b.focus(); fn(b.dataset.v, b); };
    bs.forEach((b) => b.addEventListener('click', () => pick(b)));
    el.addEventListener('keydown', (e) => {
      const i = bs.indexOf(document.activeElement); if (i < 0) return;
      const j = e.key === 'ArrowRight' ? (i + 1) % bs.length : e.key === 'ArrowLeft' ? (i - 1 + bs.length) % bs.length : e.key === 'Home' ? 0 : e.key === 'End' ? bs.length - 1 : -1;
      if (j >= 0) { e.preventDefault(); pick(bs[j], true); }
    });
  };

  /* ---------- charts ---------- */
  U.bars = (rows, o = {}) => `<div class="bars">${rows.map((r) => {
    const max = o.max || 100;
    const g = o.grad && !r.c;
    return `<div class="bar-r"${r.tip ? ` data-tip="${esc(r.tip)}"` : ''}><span class="l">${r.c ? `<i class="dot" style="background:${r.c}"></i>` : ''}<span>${esc(r.l)}</span></span><span class="track${g ? ' grad' : ''}"><i style="width:${Math.max(0, Math.min(100, (r.v / max) * 100))}%${g ? '' : `;background:${r.c || 'var(--warm)'}`}"></i></span><span class="v">${r.vt != null ? r.vt : U.p0(r.v)}${r.d != null ? `<small>${U.sg(r.d)}</small>` : ''}</span></div>`;
  }).join('')}</div>`;

  U.stack = (segs, h) => `<div class="stack"${h ? ` style="height:${h}px"` : ''}>${segs.map((s) => `<i style="flex-basis:${s.v}%;background:${s.c}" data-tip="${esc(U.tipRows(s.l, [['Share', U.p0(s.v)]]))}"></i>`).join('')}</div>`;
  U.legend = (items) => `<div class="legend">${items.map(([l, c, ring]) => `<span><i class="dot" style="${ring ? `box-shadow:inset 0 0 0 1.5px ${c}` : `background:${c}`}"></i>${esc(l)}</span>`).join('')}</div>`;

  U.donut = (segs, o = {}) => {
    const size = 132, w = o.w || 14, r = (size - w) / 2, C = 2 * Math.PI * r; let off = 0;
    const tot = segs.reduce((t, s) => t + s.v, 0) || 1;
    const arcs = segs.map((s) => { const len = (s.v / tot) * C; const gap = segs.length > 1 ? 2.5 : 0; const a = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${s.c}" stroke-width="${w}" stroke-dasharray="${Math.max(0, len - gap)} ${C}" stroke-dashoffset="${-off}" stroke-linecap="butt"/>`; off += len; return a; }).join('');
    return `<div class="donut"><svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--card-3)" stroke-width="${w}"/>${arcs}</svg><div class="c"><b>${o.center || ''}</b><small>${o.sub || ''}</small></div></div>`;
  };

  /* line chart: series [{name, c, pts:[..]}], labels [...] ; hover crosshair + tooltip */
  U.line = (el, series, labels, o = {}) => {
    const W = 640, H = o.h || 220, pl = 34, pr = 14, pt = 14, pb = 28;
    const all = series.flatMap((s) => s.pts);
    const lo = o.lo != null ? o.lo : Math.floor((Math.min(...all) - 3) / 5) * 5, hi = o.hi != null ? o.hi : Math.ceil((Math.max(...all) + 3) / 5) * 5;
    const x = (i) => pl + (i * (W - pl - pr)) / Math.max(1, labels.length - 1), y = (v) => pt + ((hi - v) * (H - pt - pb)) / (hi - lo || 1);
    const ticks = []; for (let v = lo; v <= hi + 0.01; v += (hi - lo) / 4) ticks.push(v);
    const grid = ticks.map((v) => `<line class="ax" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/><text x="${pl - 8}" y="${y(v) + 4}" text-anchor="end">${Math.round(v)}${o.unit || '%'}</text>`).join('');
    const xl = labels.map((l, i) => `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${esc(l)}</text>`).join('');
    const lines = series.map((s) => `<path d="${s.pts.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join('')}" fill="none" stroke="${s.c}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"${s.dash ? ' stroke-dasharray="5 5"' : ''}/>` + s.pts.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="${i === s.pts.length - 1 ? 4.5 : 3}" fill="${s.c}" stroke="var(--card)" stroke-width="2"/>`).join('')).join('');
    const ends = series.map((s) => { const v = s.pts[s.pts.length - 1]; return { y: y(v), t: `${s.name} ${Math.round(v)}${o.unit || '%'}` }; }).sort((a, b) => a.y - b.y);
    for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 14) ends[i].y = ends[i - 1].y + 14;
    el.innerHTML = `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || 'Trend chart')}">${grid}${xl}${lines}<line class="xh" x1="0" x2="0" y1="${pt}" y2="${H - pb}" stroke="var(--line-3)" stroke-dasharray="3 3" opacity="0"/><rect x="${pl}" y="${pt}" width="${W - pl - pr}" height="${H - pt - pb}" fill="transparent"/></svg></div>`;
    const svg = el.querySelector('svg'), xh = svg.querySelector('.xh');
    svg.addEventListener('pointermove', (e) => {
      const b = svg.getBoundingClientRect(); const px = ((e.clientX - b.left) / b.width) * W;
      const i = Math.max(0, Math.min(labels.length - 1, Math.round(((px - pl) / (W - pl - pr)) * (labels.length - 1))));
      xh.setAttribute('x1', x(i)); xh.setAttribute('x2', x(i)); xh.setAttribute('opacity', 1);
      U.tip(U.tipRows(labels[i], series.map((s) => [s.name, U.f1(s.pts[i]) + (o.unit || '%')])), e.clientX, e.clientY);
    });
    svg.addEventListener('pointerleave', () => { xh.setAttribute('opacity', 0); U.tip(null); });
    if (o.legend !== false) el.insertAdjacentHTML('beforeend', `<div style="margin-top:10px">${U.legend(series.map((s) => [s.name, s.c]))}</div>`);
  };

  /* ---------- seat board ----------
     A seat picture you can actually read: a projection bar with the majority line,
     then one labelled row per call (safe / lean / toss-up), then the full list for
     anyone who wants the names. Colour is never the only carrier: every group is
     counted and named, and the table repeats it all as text. */
  const CALL_ORDER = [
    ['sA', 'Safe Party A', 'a', (v) => v.lead === 'A' && v.cls === 'Safe'],
    ['lA', 'Lean Party A', 'a lean', (v) => v.lead === 'A' && v.cls === 'Lean'],
    ['ts', 'Toss-up', 'ts', (v) => v.cls === 'Toss-up'],
    ['lB', 'Lean Party B', 'b lean', (v) => v.lead === 'B' && v.cls === 'Lean'],
    ['sB', 'Safe Party B', 'b', (v) => v.lead === 'B' && v.cls === 'Safe'],
    ['ot', 'Other parties', 'o', (v) => v.lead !== 'A' && v.lead !== 'B' && v.cls !== 'Toss-up'],
  ];
  U.seatBoard = function (vs, o = {}) {
    const tot = vs.length || 1, maj = Math.floor(tot / 2) + 1;
    const showMaj = o.maj != null ? o.maj : tot >= 30;
    const used = new Set();
    const groups = CALL_ORDER.map(([k, label, cls, test]) => {
      const list = vs.filter((v) => !used.has(v) && test(v)).sort((a, b) => b.margin - a.margin);
      list.forEach((v) => used.add(v));
      return { k, label, cls, list };
    }).filter((g) => g.list.length);
    const g = Object.fromEntries(groups.map((x) => [x.k, x.list.length]));
    const held = (p) => vs.filter((v) => v.lead === p && v.cls !== 'Toss-up').length;
    const reach = (p) => held(p) + vs.filter((v) => v.cls === 'Toss-up' && (v.lead === p || v.second === p)).length;
    const lo = { A: held('A'), B: held('B') }, hi = { A: reach('A'), B: reach('B') };
    const tossN = vs.filter((v) => v.cls === 'Toss-up').length;
    const otherN = tot - lo.A - lo.B - tossN;
    const pct = (n) => (n / tot) * 100;
    const win = (p) => (lo[p] >= maj ? 'enough for a majority' : hi[p] >= maj ? 'and can still reach a majority' : 'short of a majority');
    const upto = (p) => (hi[p] === lo[p] ? '' : `, up to ${hi[p]} if the toss-ups fall its way`);
    const sum = showMaj
      ? `${tot} seats, ${maj} needed for a majority. Party A leads in ${lo.A}, ${win('A')}${upto('A')}. Party B leads in ${lo.B}, ${win('B')}${upto('B')}. ${tossN} ${tossN === 1 ? 'seat is a toss-up' : 'seats are toss-ups'}.`
      : `${tot} seat${tot === 1 ? '' : 's'}. Party A leads in ${lo.A}${upto('A')}. Party B leads in ${lo.B}${upto('B')}. ${tossN === 0 ? 'None is a toss-up' : tossN === 1 ? '1 is a toss-up' : tossN + ' are toss-ups'}.`;
    const seg = (cls, n, lab) => (n ? `<span class="s ${cls}" style="width:${pct(n)}%"${n / tot > 0.08 ? '' : ' data-tiny="1"'} data-tip="${esc(U.tipRows(lab, [['Seats', n], ['Share of house', U.p0(pct(n))]]))}"><b>${n}</b></span>` : '');
    const bar = `<div class="sb-bar${showMaj ? '' : ' nomaj'}"><div class="sb-track">${seg('a', lo.A, 'Party A holds')}${seg('ts', tossN, 'Toss-ups')}${seg('o', otherN, 'Other parties')}${seg('b', lo.B, 'Party B holds')}</div>${showMaj ? `<i class="sb-maj" style="left:${pct(maj - 0.5)}%" aria-hidden="true"></i><span class="sb-majl" style="left:${pct(maj - 0.5)}%">${maj} to win</span>` : ''}</div>`;
    const ends = `<div class="sb-ends"><span class="e a"><i class="dot" style="background:var(--pA)"></i>Party A <b>${lo.A}–${hi.A}</b></span><span class="e m">${tossN === 0 ? 'No toss-ups' : `${tossN} toss-up${tossN === 1 ? '' : 's'}${showMaj ? ' decide it' : ''}`}</span><span class="e b"><b>${lo.B}–${hi.B}</b> Party B<i class="dot" style="background:var(--pB)"></i></span></div>`;
    const dot = (v) => `<i class="sd" data-tip="${esc(U.tipRows(v.nm, [['Leads', M.PARTY[v.lead].name], ['Margin', U.f1(v.margin) + ' pts'], ['Call', v.cls]]))}"></i>`;
    const rows = groups.map((x) => `<div class="sb-g"><span class="sb-gh ${x.cls}"><i class="key"></i><span class="l">${x.label}</span><b>${x.list.length}</b></span><span class="sb-gd ${x.cls}" role="img" aria-label="${x.list.length} ${x.label.toLowerCase()} seat${x.list.length === 1 ? '' : 's'}">${x.list.map(dot).join('')}</span></div>`).join('');
    const tbl = `<details class="sb-list"${o.open ? ' open' : ''}><summary><span>All ${tot} seat${tot === 1 ? '' : 's'}, with margins</span>${U.ic('chevr', 'i c')}</summary><div class="sb-tw"><table class="tbl sb-tbl"><thead><tr><th scope="col">Seat</th><th scope="col">District</th><th scope="col">Leads</th><th scope="col" class="r">Margin</th><th scope="col">Call</th></tr></thead><tbody>${groups.flatMap((x) => x.list).map((v) => `<tr><th scope="row">${o.pick ? `<button type="button" class="seat-row" data-k="ac" data-id="${v.n}">${esc(v.nm)}</button>` : esc(v.nm)}</th><td>${esc(v.dist || '')}</td><td><span class="pill ${v.lead === 'A' ? 'a' : v.lead === 'B' ? 'b' : 'o'}">${M.PARTY[v.lead].name}</span></td><td class="r num">+${U.f1(v.margin)}</td><td><span class="call ${v.cls === 'Toss-up' ? 'ts' : v.cls === 'Lean' ? 'ln' : 'sf'}">${v.cls}</span></td></tr>`).join('')}</tbody></table></div></details>`;
    return `<div class="seatboard"><p class="sr">${esc(sum)}</p><div class="sb-h"><span class="sb-t">${esc(o.title || 'Seat projection')}</span><span class="sb-n">${tot} seat${tot === 1 ? '' : 's'}${showMaj ? ' · ' + maj + ' to win' : ''}</span></div>${bar}${ends}<div class="sb-gs">${rows}</div>${o.list === false ? '' : tbl}</div>`;
  };
  /* kept for callers that only want the raw squares */
  U.seatStrip = (vs) => U.seatBoard(vs, { list: false });

  /* ---------- voice player (simulated playback) ---------- */
  U.waves = (n, seed) => { const r = PI.rng(seed || 7); let s = ''; for (let i = 0; i < n; i++) s += `<i style="height:${Math.round(20 + Math.abs(Math.sin(i * 0.5)) * 50 + r() * 30)}%"></i>`; return s; };
  U.player = (len = 14, seed = 3) => `<div class="vplayer" data-len="${len}"><button type="button" aria-label="Play voter clip">${U.ic('play')}</button><div class="wave" aria-hidden="true">${U.waves(42, seed)}</div><time>0:${String(len).padStart(2, '0')}</time></div>`;
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.vplayer button'); if (!b) return;
    const pl = b.closest('.vplayer'), bars = $$('.wave i', pl), time = $('time', pl), total = +pl.dataset.len;
    if (pl._t) { clearInterval(pl._t); pl._t = null; b.innerHTML = U.ic('play'); b.setAttribute('aria-label', 'Play voter clip'); return; }
    let i = pl._i || 0; b.innerHTML = U.ic('pause'); b.setAttribute('aria-label', 'Pause voter clip');
    pl._t = setInterval(() => {
      i++; pl._i = i; const k = Math.round((i / (total * 4)) * bars.length);
      bars.forEach((x, j) => x.classList.toggle('p', j < k));
      const s = Math.max(0, total - Math.floor(i / 4)); time.textContent = '0:' + String(s).padStart(2, '0');
      if (i >= total * 4) { clearInterval(pl._t); pl._t = null; pl._i = 0; b.innerHTML = U.ic('play'); setTimeout(() => { bars.forEach((x) => x.classList.remove('p')); time.textContent = '0:' + String(total).padStart(2, '0'); }, 600); }
    }, 250);
  });

  /* ---------- downloads ---------- */
  U.download = (name, data, type) => {
    const blob = data instanceof Blob ? data : new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };
})();
