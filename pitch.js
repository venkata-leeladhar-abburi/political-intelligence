/* Investor presentation · /pitch
   One shared set of assumptions drives every number in the deck. Any input with data-k edits it,
   any element with data-o shows a result, and every slide recalculates together. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------------------------------------------------------------- assumptions */
  // k, label, help, unit ('rs' prefix, '%' or 'min' suffix), decimals allowed, default, presets
  const GROUPS = [
    ['scale', 'Scale', [
      ['clients', 'Clients', 'Paying clients in a year', '', 0, 3],
      ['seats', 'Seats per client', 'Constituencies each client surveys', '', 0, 175],
      ['perSeat', 'Interviews per seat, per round', '', '', 0, 200],
      ['rounds', 'Rounds a year', 'Survey rounds each client runs', '', 0, 4],
    ]],
    ['price', 'What we charge', [
      ['setup', 'Setup fee per client', 'Once, when a client starts', 'rs', 0, 1800000, [['Core', 1000000], ['Intelligence', 1800000], ['Enterprise', 3200000]]],
      ['fee', 'Fee per verified interview', '', 'rs', 1, 7.5, [['₹5', 5], ['₹7.50', 7.5], ['₹10', 10]]],
      ['retainer', 'Support retainer a month', 'Per client', 'rs', 0, 100000, [['₹60k', 60000], ['₹1 lakh', 100000], ['₹1.5 lakh', 150000]]],
      ['retainMonths', 'Retainer months a year', '', '', 0, 12],
    ]],
    ['client', 'Customer side', [
      ['fieldCost', 'Fieldwork cost per interview', 'What clients pay field agencies today', 'rs', 1, 200],
      ['fakeRate', 'Share of interviews that are fake', 'Our estimate', '%', 1, 10],
      ['openQs', 'Open answers per interview', 'Recorded and read', '', 0, 3],
      ['codingCost', 'Manual cost to read one answer', 'Our estimate: ₹5–10', 'rs', 1, 7.5],
    ]],
    ['cost', 'Our running cost', [
      ['minutes', 'Recorded minutes per interview', '', 'min', 1, 1.5],
      ['ourRate', 'Our speech engine, per minute', '', 'rs', 1, 0.04],
      ['fallback', 'Clips sent to a paid engine', 'Backup for unclear audio', '%', 1, 4],
      ['aiOther', 'AI analyst and search, per interview', '', 'rs', 1, 0.03],
      ['fixedOurs', 'Fixed cloud cost a month', 'Database, backups, domain, storage', 'rs', 0, 2500],
      ['team', 'Support team cost a month', 'Our estimate', 'rs', 0, 250000],
    ]],
    ['paid', 'Renting paid APIs instead', [
      ['paidRate', 'Paid speech API, per minute', 'Indian speech APIs charge ₹0.50–2', 'rs', 1, 1.25, [['₹0.50', 0.5], ['₹1.25', 1.25], ['₹2', 2]]],
      ['paidLLM', 'Separate AI analysis, per interview', '', 'rs', 1, 0.30],
      ['fixedPaid', 'Paid servers a month', '', 'rs', 0, 19100],
    ]],
  ];
  const DEF = {}, META = {};
  GROUPS.forEach(([, , items]) => items.forEach(([k, label, help, unit, dec, def, presets]) => { DEF[k] = def; META[k] = { label, help, unit, dec, presets }; }));

  const KEY = 'pi-pitch-v1';
  const S = Object.assign({}, DEF);
  try { const saved = JSON.parse(localStorage.getItem(KEY) || '{}'); for (const k in saved) if (k in DEF && Number.isFinite(saved[k])) S[k] = saved[k]; } catch (e) { /* storage blocked: defaults */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } };

  /* ---------------------------------------------------------------- formatting */
  const IN = (v, d = 0) => v.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
  const trim = (s) => s.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
  function inr(v) {
    if (!Number.isFinite(v)) return '—';
    const neg = v < 0, a = Math.abs(v);
    let s;
    if (a >= 1e7) s = `₹${trim((a / 1e7).toFixed(2))} crore`;
    else if (a >= 1e5) s = `₹${trim((a / 1e5).toFixed(a >= 1e6 ? 1 : 2))} lakh`;
    else if (a >= 100) s = `₹${IN(Math.round(a))}`;
    else s = `₹${a.toFixed(2)}`;
    return (neg ? '− ' : '') + s;
  }
  const rs2 = (v) => Number.isFinite(v) ? `₹${v < 10 ? v.toFixed(2) : IN(v, v % 1 ? 2 : 0)}` : '—';
  const pct = (v) => Number.isFinite(v) ? `${Math.round(v * 100)}%` : '—';
  const n0 = (v) => Number.isFinite(v) ? IN(Math.round(v)) : '—';
  const neg = (v) => `− ${inr(v)}`;
  function fmtInput(k) {
    const v = S[k], m = META[k];
    if (!m.dec) return IN(Math.round(v));
    if (m.unit === 'rs' && v % 1 && v >= 1) return v.toFixed(2);
    return trim(String(+v.toFixed(4)));
  }

  /* ---------------------------------------------------------------- the model */
  const MARKET = [175, 294, 518, 1038, 1581];
  function model() {
    const s = S, safe = (a, b) => (b ? a / b : NaN);
    const perRound = s.seats * s.perSeat;
    const annualIv = perRound * s.rounds * s.clients;
    const varOurs = s.minutes * s.ourRate + (s.fallback / 100) * s.minutes * s.paidRate + s.aiOther;
    const varPaid = s.minutes * s.paidRate + s.paidLLM;
    const paidMonth = perRound * varPaid + s.fixedPaid;
    const oursMonth = perRound * varOurs + s.fixedOurs;
    const runYear = annualIv * varOurs + 12 * s.fixedOurs;
    const paidYear = annualIv * varPaid + 12 * s.fixedPaid;
    const costPerIv = safe(runYear, annualIv);
    const revSetup = s.clients * s.setup;
    const revIv = annualIv * s.fee;
    const revRet = s.clients * s.retainer * s.retainMonths;
    const rev1 = revSetup + revIv + revRet, rev2 = revIv + revRet;
    const teamYear = 12 * s.team;
    const profit1 = rev1 - runYear - teamYear, profit2 = rev2 - runYear - teamYear;
    const fakeLoss = perRound * s.fieldCost * s.fakeRate / 100;
    const codingSaved = perRound * s.openQs * s.codingCost;
    const feeRound = perRound * s.fee;
    const clientNetRound = fakeLoss + codingSaved - feeRound;
    const retYear = s.retainer * s.retainMonths;
    const busyIv = perRound * s.clients;
    const busyVar = busyIv * varOurs;
    const busyCost = s.fixedOurs + busyVar + s.team;
    const retMonth = s.clients * s.retainer;
    return {
      perRound, annualIv, paidMonth, oursMonth, runYear, paidYear, costPerIv,
      ratio: safe(oursMonth, paidMonth),
      o: {
        seats: n0(s.seats), perSeat: n0(s.perSeat), rounds: n0(s.rounds), perRound: n0(perRound),
        fieldCost: rs2(s.fieldCost), fee: rs2(s.fee), fakeRate: `${trim(String(s.fakeRate))}%`,
        openQs: n0(s.openQs), codingCost: rs2(s.codingCost),
        roundField: inr(perRound * s.fieldCost),
        fakeLoss: inr(fakeLoss), codingSaved: inr(codingSaved), feeRoundNeg: neg(feeRound),
        clientNetRound: inr(clientNetRound),
        clientYear1: inr(clientNetRound * s.rounds - s.setup - retYear),
        clientYear2: inr(clientNetRound * s.rounds - retYear),
        annualIv: n0(annualIv),
        revSetup: inr(revSetup), revIv: inr(revIv), revRet: inr(revRet), rev1: inr(rev1), rev2: inr(rev2),
        runYearNeg: neg(runYear), teamYearNeg: neg(teamYear),
        profit1: inr(profit1), profit2: inr(profit2), margin1: pct(safe(profit1, rev1)), margin2: pct(safe(profit2, rev2)),
        costPerIv: rs2(costPerIv), ivMarginPct: pct(safe(s.fee - costPerIv, s.fee)),
        paidMonth: inr(paidMonth), oursMonth: inr(oursMonth),
        paidPerIv: rs2(safe(paidMonth, perRound)), oursPerIv: rs2(safe(oursMonth, perRound)),
        savePct: pct(1 - safe(oursMonth, paidMonth)), saveYear: inr(paidYear - runYear),
        busyIv: n0(busyIv), busyVar: inr(busyVar), fixedOurs: inr(s.fixedOurs), team: inr(s.team),
        busyCost: inr(busyCost), retMonth: inr(retMonth), coverPct: pct(safe(retMonth, busyCost)),
        ...Object.fromEntries(MARKET.map((seats, i) => [`mk${i}`, `${inr(seats * s.perSeat * s.rounds * s.fee)} / yr`])),
      },
    };
  }

  /* ---------------------------------------------------------------- render */
  function render(skip) {
    const m = model();
    $$('[data-o]').forEach((el) => { const v = m.o[el.dataset.o]; if (v !== undefined && el.textContent !== v) el.textContent = v; });
    $$('input[data-k]').forEach((inp) => { if (inp !== skip && inp !== document.activeElement) inp.value = fmtInput(inp.dataset.k); });
    $$('.chips[data-k]').forEach((g) => { const k = g.dataset.k; $$('button', g).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.v === S[k]))); });
    const bp = $('#barPaid'), bo = $('#barOurs');
    if (bp && bo) { const r = Number.isFinite(m.ratio) ? m.ratio : 0; bp.style.transform = `scaleX(${r > 1 ? 1 / r : 1})`; bo.style.transform = `scaleX(${Math.max(.012, r > 1 ? 1 : r)})`; }
    $$('#stairs li').forEach((li) => li.style.setProperty('--h', (+li.dataset.seats / 1581).toFixed(3)));
  }

  function set(k, v, src) {
    if (!(k in DEF) || !Number.isFinite(v) || v < 0) return;
    if (k === 'fakeRate' || k === 'fallback') v = Math.min(v, 100);
    S[k] = v; save(); render(src);
  }

  /* ---------------------------------------------------------------- assumptions panel */
  function buildPanel() {
    const host = $('#asmBody');
    host.innerHTML = GROUPS.map(([id, title, items]) => `<section class="asm-g" id="asm-${id}"><h3>${title}</h3>${items.map(([k, label, help, unit, , , presets]) => {
      const chips = presets ? `<div class="chips" data-k="${k}" role="group" aria-label="${label} presets">${presets.map(([t, v]) => `<button type="button" data-v="${v}">${t}</button>`).join('')}</div>` : '';
      const pre = unit === 'rs' ? '<i>₹</i>' : '', post = unit === '%' ? '<i>%</i>' : unit === 'min' ? '<i>min</i>' : '';
      return `<label class="fld"><span>${label}${help ? `<small>${help}</small>` : ''}</span><span class="fld-v">${pre}<input data-k="${k}" inputmode="decimal" autocomplete="off">${post}</span></label>${chips}`;
    }).join('')}</section>`).join('');
  }

  function bindInputs() {
    document.addEventListener('input', (e) => {
      const inp = e.target.closest('input[data-k]'); if (!inp) return;
      const raw = inp.value.replace(/[^\d.]/g, '');
      if (raw === '' || raw === '.') return;
      set(inp.dataset.k, parseFloat(raw), inp);
    });
    document.addEventListener('focusout', (e) => { const inp = e.target.closest && e.target.closest('input[data-k]'); if (inp) inp.value = fmtInput(inp.dataset.k); });
    document.addEventListener('focusin', (e) => { const inp = e.target.closest && e.target.closest('input[data-k]'); if (inp) requestAnimationFrame(() => inp.select()); });
    document.addEventListener('keydown', (e) => { const inp = e.target.closest && e.target.closest('input[data-k]'); if (inp && e.key === 'Enter') inp.blur(); });
    document.addEventListener('click', (e) => {
      const b = e.target.closest('.chips[data-k] button'); if (!b) return;
      set(b.closest('.chips').dataset.k, +b.dataset.v);
    });
    $('#resetBtn').addEventListener('click', () => { Object.assign(S, DEF); save(); render(); });
  }

  /* ---------------------------------------------------------------- sheets */
  let lastFocus = null;
  function openSheet(id, focusSel) {
    const sh = $('#' + id); lastFocus = document.activeElement;
    sh.hidden = false; document.documentElement.style.overflow = 'hidden';
    const target = (focusSel && $(focusSel, sh)) || $('.x', sh);
    if (focusSel && $(focusSel, sh)) $(focusSel, sh).scrollIntoView({ block: 'start' });
    requestAnimationFrame(() => (target.querySelector && target.querySelector('input') || $('.x', sh)).focus({ preventScroll: !!focusSel }));
  }
  function closeSheets() {
    $$('.sheet').forEach((s) => { s.hidden = true; });
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function bindSheets() {
    $('#openAsm').addEventListener('click', () => openSheet('asm'));
    $('#openIdx').addEventListener('click', () => openSheet('idx'));
    document.addEventListener('click', (e) => {
      const o = e.target.closest('[data-open-asm]'); if (o) { const g = o.getAttribute('data-open-asm'); openSheet('asm', g ? `#asm-${g}` : null); return; }
      if (e.target.closest('[data-close]')) closeSheets();
    });
    $('#idxList').addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); closeSheets(); go(+a.dataset.i); });
    // keep Tab inside an open sheet
    document.addEventListener('keydown', (e) => {
      const sh = $$('.sheet').find((s) => !s.hidden); if (!sh) return;
      if (e.key === 'Escape') { closeSheets(); return; }
      if (e.key !== 'Tab') return;
      const f = $$('button, input, a[href]', sh).filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
  }

  /* ---------------------------------------------------------------- slides */
  const slides = $$('.sl');
  const N = slides.length, pad = (i) => String(i).padStart(2, '0');
  let cur = -1;
  function go(i) { i = Math.max(0, Math.min(N - 1, i)); slides[i].scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }
  function setCur(i) {
    if (i === cur) return; cur = i;
    $('#barNum').textContent = pad(i + 1);
    $('#barTitle').textContent = slides[i].dataset.t;
    $('#barProg').style.transform = `scaleX(${N > 1 ? i / (N - 1) : 1})`;
    $('#ctlNum').textContent = `${i + 1} / ${N}`;
    $('#prevBtn').disabled = i === 0; $('#nextBtn').disabled = i === N - 1;
    $$('#idxList a').forEach((a) => a.setAttribute('aria-current', String(+a.dataset.i === i)));
  }
  function track() {
    let ticking = false;
    const measure = () => {
      ticking = false;
      const line = innerHeight * 0.42;
      let i = 0;
      for (let j = 0; j < N; j++) if (slides[j].getBoundingClientRect().top <= line) i = j;
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) i = N - 1;
      setCur(i);
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(measure); } }, { passive: true });
    addEventListener('resize', measure);
    measure();
  }
  function bindKeys() {
    $('#prevBtn').addEventListener('click', () => go(cur - 1));
    $('#nextBtn').addEventListener('click', () => go(cur + 1));
    document.addEventListener('keydown', (e) => {
      if ($$('.sheet').some((s) => !s.hidden)) return;
      const t = e.target;
      if (t.closest && t.closest('input, textarea, select, [contenteditable]')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k === 'ArrowDown' || k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !t.closest('button, a') && !e.shiftKey)) { e.preventDefault(); go(cur + 1); }
      else if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'PageUp' || (k === ' ' && e.shiftKey)) { e.preventDefault(); go(cur - 1); }
      else if (k === 'Home') { e.preventDefault(); go(0); }
      else if (k === 'End') { e.preventDefault(); go(N - 1); }
    });
  }
  function decorate() {
    slides.forEach((s, i) => { const u = $('.sl-ft .url', s); if (u) u.dataset.n = `${pad(i + 1)} / ${N}`; });
    $('#idxList').innerHTML = slides.map((s, i) => `<li><a href="#${s.id}" data-i="${i}"><small>${pad(i + 1)}</small><span>${s.dataset.t}</span></a></li>`).join('');
    const reveal = () => slides.forEach((s) => s.classList.add('in'));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.12 });
      slides.forEach((s) => io.observe(s));
    } else reveal();
    addEventListener('beforeprint', reveal);
    const pb = $('#printBtn'); if (pb) pb.addEventListener('click', () => { reveal(); window.print(); });
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) t.classList.add('in'); }
  }

  buildPanel();
  bindInputs();
  bindSheets();
  bindKeys();
  decorate();
  render();
  track();
})();
