/* Political Intelligence Platform · insight pages
   Analytics (ruling vs opposition, drivers, movers, segments), Map explorer, AI analyst,
   Round notes and Reports. */
(function () {
  'use strict';
  const PI = window.PI, M = window.M, U = window.U, V = (window.V = window.V || {}), S = () => window.APP;
  const { DISTS, ACS, byN } = PI;
  const { $, $$, ic, esc, IN, p0, f1, sg } = U;

  /* ======================= ANALYTICS ======================= */
  V.analytics = function (el) {
    const f = { area: 'state:0', seg: 'all', kind: 'all' };
    const enOf = () => { const [k, id] = f.area.split(':'); return { kind: k, id: +id }; };
    el.innerHTML = `${V.head('Analytics', 'Where the ruling party and the opposition stand, why, and who is moving. Every number carries its sample and margin.', `${V.roundTag()}<button type="button" class="btn" data-r="csv">${ic('download')}This view (CSV)</button>`)}
      <div class="card" style="padding:14px 16px"><div class="acts"><label class="sr" for="anArea">Area</label><select class="sel" id="anArea"><option value="state:0">Andhra Pradesh · 175 seats</option>${DISTS.map((d) => `<option value="district:${d.id}">${esc(d.name)} · ${d.acs.length} seats</option>`).join('')}</select>${U.seg('Voters', [['all', 'All voters'], ['women', 'Women'], ['men', 'Men'], ['youth', '18–25'], ['senior', '60+'], ['welfare', 'Scheme homes']], f.seg)}${U.seg('Seats', [['all', 'All seats'], ['corp', 'Corporation'], ['town', 'Town'], ['rural', 'Rural']], f.kind)}</div></div>
      <div id="anBody" class="grid"></div>`;
    const body = $('#anBody', el);
    const draw = () => {
      const en = enOf(), v = M.vals(en), p = M.round ? M.vals(en, M.round - 1) : null, c = M.cuts(en);
      const segAB = { all: [v.A, v.B], women: c.gender[0].slice(1), men: c.gender[1].slice(1), youth: c.age[0].slice(1), senior: c.age[3].slice(1), welfare: c.welfare[0].slice(1) }[f.seg];
      const segN = Math.round(v.iv * { all: 1, women: 0.5, men: 0.5, youth: 0.19, senior: 0.17, welfare: v.welfare / 100 }[f.seg]);
      const seats = (v.list || []).map((n) => ({ n, ...M.vals({ kind: 'ac', id: n }), pv: M.round ? M.vals({ kind: 'ac', id: n }, M.round - 1) : null })).filter((s) => f.kind === 'all' || (f.kind === 'corp' ? ['corp', 'mixed'].includes(M.seatKind(byN.get(s.n))) : M.seatKind(byN.get(s.n)) === f.kind));
      const lo = (k) => seats.filter((s) => s.lead === k && s.cls !== 'Toss-up').length, hi = (k) => seats.filter((s) => s.lead === k || (s.cls === 'Toss-up' && s.second === k)).length;
      const rs = M.ROUNDS.filter((r) => r.id <= M.round);
      const movers = seats.filter((s) => s.pv).map((s) => ({ ...s, sw: (s.A - s.pv.A) - (s.B - s.pv.B) })).sort((a, b) => a.sw - b.sw);
      const segName = { all: 'All voters', women: 'Women', men: 'Men', youth: 'Voters 18–25', senior: 'Voters 60+', welfare: 'Scheme households' }[f.seg];
      body.innerHTML = `<div class="kpis">
          ${V.kpi('Party A · ruling', 'flag', p0(segAB[0]), p && f.seg === 'all' ? U.dl(v.A - p.A) + ' since ' + M.ROUNDS[M.round - 1].short : segName)}
          ${V.kpi('Party B · opposition', 'flag', p0(segAB[1]), p && f.seg === 'all' ? U.dl(v.B - p.B) + ' since ' + M.ROUNDS[M.round - 1].short : segName)}
          ${V.kpi('Gap', 'scale', `${segAB[0] >= segAB[1] ? 'A' : 'B'} +${f1(Math.abs(segAB[0] - segAB[1]))}`, `n = ${IN(segN)} · ${U.moe(segN)}`, 'hero')}
          ${V.kpi('Seats · Party A', 'pin', `${lo('A')}–${hi('A')}`, `of ${seats.length} ${f.kind === 'all' ? '' : 'chosen '}seats`)}
          ${V.kpi('Seats · Party B', 'pin', `${lo('B')}–${hi('B')}`, `${seats.filter((s) => s.cls === 'Toss-up').length} toss-ups decide it`)}
          ${V.kpi('Govt approval', 'gauge', p0(v.gov), p ? U.dl(v.gov - p.gov) : '')}
        </div>
        <div class="grid g-64"><div class="card lead"><div class="card-h"><div><h3>The race across rounds</h3><p>${esc(M.name(en))} · vote if held today · ${esc(segName.toLowerCase())}</p></div></div><div id="anTrend"></div></div>
          <div class="card"><div class="card-h"><div><h3>Ruling vs opposition</h3><p>Party A ruling · Party B main opposition</p></div></div>${M.h2h([['Vote share', segAB[0], segAB[1]], ['Leader rating', v.cm, v.opp], ['Women', c.gender[0][1], c.gender[0][2]], ['Youth 18–25', c.age[0][1], c.age[0][2]], ['Farmers', c.job[0][1], c.job[0][2]], ['Scheme homes', c.welfare[0][1], c.welfare[0][2]]])}
          <div class="grid g2" style="gap:12px;margin-top:16px">${M.meter('Approve of the government', v.gov)}${M.meter('Anti-incumbency index', Math.round(v.anti) + ' / 100')}</div></div></div>
        <div class="grid g3"><div class="card"><div class="card-h"><div><h3>Why people back Party A</h3><p>Reasons given in their own words, coded by AI</p></div></div>${U.bars(c.reasonsA.map(([l, x]) => ({ l, v: x, c: U.pc('A') })), { max: 45 })}</div>
          <div class="card"><div class="card-h"><div><h3>Why people back Party B</h3><p>Reasons given in their own words, coded by AI</p></div></div>${U.bars(c.reasonsB.map(([l, x]) => ({ l, v: x, c: U.pc('B') })), { max: 45 })}</div>
          <div class="card"><div class="card-h"><div><h3>Who is trusted on the top issues</h3><p>“Which party will fix it?”</p></div></div>${M.h2h(c.trust)}</div></div>
        <div class="grid g2"><div class="card"><div class="card-h"><div><h3>Mood and tone</h3><p>Positive, neutral and negative answers about the government, after sarcasm is resolved</p></div></div><div id="anMood"></div><p class="muted" style="font-size:13px;margin:10px 0 0">${IN(v.sarcasm)} sarcastic answers were caught this round. Without the tone check, positive mood would read ${f1(v.pos + (v.sarcasm / v.iv) * 100)}% instead of ${f1(v.pos)}%.</p></div>
          <div class="card"><div class="card-h"><div><h3>Issues that moved</h3><p>Share naming it as the biggest problem</p></div></div>${U.bars(v.iss.slice(0, 6).map(([k, x]) => { const pp = p && p.iss.find(([kk]) => kk === k); return { l: k, v: x, d: pp ? x - pp[1] : null }; }), { max: 40 })}</div></div>
        <div class="grid g2"><div class="card"><div class="card-h"><div><h3>Swinging to Party B</h3><p>Biggest change in the A–B gap since ${M.round ? esc(M.ROUNDS[M.round - 1].short) : 'the baseline'}</p></div></div>${moverTable(movers.slice(0, 6))}</div>
          <div class="card"><div class="card-h"><div><h3>Swinging to Party A</h3><p>Biggest change in the A–B gap since ${M.round ? esc(M.ROUNDS[M.round - 1].short) : 'the baseline'}</p></div></div>${moverTable(movers.slice(-6).reverse())}</div></div>
        <div class="grid g2"><div class="card"><div class="card-h"><div><h3>By age</h3><p>Party A vs Party B</p></div></div>${M.h2h(c.age)}</div><div class="card"><div class="card-h"><div><h3>By occupation</h3><p>Party A vs Party B</p></div></div>${M.h2h(c.job)}</div></div>
        <div class="card"><div class="card-h"><div><h3>Every seat</h3><p>Grouped by how safe the call is. Open the list for names and margins, or click a seat to open it on the map.</p></div></div>${U.seatBoard(seats.map((s) => ({ ...s, nm: byN.get(s.n).name, dist: DISTS[byN.get(s.n).dist - 1].name })), { pick: true, title: 'Seat projection' })}</div>`;
      U.line($('#anTrend', body), [{ name: 'Party A', c: U.pc('A'), pts: rs.map((r) => M.vals(en, r.id).A + (segAB[0] - v.A)) }, { name: 'Party B', c: U.pc('B'), pts: rs.map((r) => M.vals(en, r.id).B + (segAB[1] - v.B)) }, { name: 'Undecided', c: 'var(--ink-3)', dash: true, pts: rs.map((r) => M.vals(en, r.id).U) }], rs.map((r) => r.short), { h: 240, label: 'Vote share by round' });
      U.line($('#anMood', body), [{ name: 'Positive', c: 'var(--pos)', pts: rs.map((r) => M.vals(en, r.id).pos) }, { name: 'Neutral', c: 'var(--neu)', pts: rs.map((r) => M.vals(en, r.id).neu) }, { name: 'Negative', c: 'var(--neg)', pts: rs.map((r) => M.vals(en, r.id).neg) }], rs.map((r) => r.short), { h: 200, lo: 0, label: 'Mood by round' });
      $$('[data-seat]', body).forEach((b) => b.addEventListener('click', () => S().go('map', { kind: 'ac', id: +b.dataset.seat })));
      $$('.seat-row', body).forEach((b) => b.addEventListener('click', () => S().go('map', { kind: 'ac', id: +b.dataset.id })));
    };
    const moverTable = (list) => `<div class="kids">${list.map((s) => `<button type="button" class="kid" data-seat="${s.n}"><span class="nm"><b>${esc(byN.get(s.n).name)}</b><small>${esc(DISTS[byN.get(s.n).dist - 1].name)} · ${M.PARTY[s.lead].name} +${f1(s.margin)} · ${s.cls}</small></span><span class="mini" aria-hidden="true"><i style="flex:${s.A};background:${U.pc('A')}"></i><i style="flex:${s.B};background:${U.pc('B')}"></i></span><span class="v">${sg(s.sw)}</span>${ic('chevr')}</button>`).join('')}</div>`;
    $('#anArea', el).addEventListener('change', (e) => { f.area = e.target.value; draw(); });
    U.onSeg(el, '.seg[aria-label="Voters"]', (x) => { f.seg = x; draw(); });
    U.onSeg(el, '.seg[aria-label="Seats"]', (x) => { f.kind = x; draw(); });
    $('[data-r="csv"]', el).addEventListener('click', () => M.exportReport({ type: 'raw', en: enOf(), format: 'csv' }));
    draw();
  };

  /* ======================= MAP EXPLORER ======================= */
  V.map = function (el) {
    const start = S().focus || { kind: 'state', id: 0 };
    el.innerHTML = `${V.head('Map explorer', 'Open any district, seat, mandal, corporation or municipality on its own, with every number we hold for it.', V.roundTag())}<div class="mapx"><div class="card map-card" id="mxMap"></div><aside class="card dp" id="mxPanel" aria-label="Area details"></aside></div>`;
    const panel = M.Panel($('#mxPanel', el), { en: start, onPick: (en) => map.go(en), user: S().user, canEdit: M.roleCan(S().role, 'notes') === 2 });
    const map = M.MapX($('#mxMap', el), { uid: 'mx', focus: start, level: start.kind === 'state' ? 'district' : 'district', onFocus: (en) => panel.show(en), onBooth: (b) => panel.booth(b) });
  };

  /* ======================= ROUND NOTES ======================= */
  V.notes = function (el) {
    let en = { kind: 'district', id: 15 };
    const canEdit = M.roleCan(S().role, 'notes') === 2;
    const all = () => DISTS.map((d) => ({ kind: 'district', id: d.id })).concat(ACS.map((a) => ({ kind: 'ac', id: a.n })));
    const count = (s) => all().filter((e) => M.noteStatus(e) === s).length;
    el.innerHTML = `${V.head('Round notes', 'An AI draft for every district and seat after each round. Supervisors correct it, analysts approve it, and approved notes go into reports and the Client Portal.', `${V.roundTag()}<button type="button" class="btn" data-r="pack">${ic('download')}Notes pack (PDF)</button>`)}
      <div class="kpis">${V.kpi('Approved', 'checkc', count('Approved'), 'shared with the client', 'hero')}${V.kpi('Reviewed', 'edit', count('Reviewed'), 'waiting for an analyst')}${V.kpi('AI drafts', 'spark', count('AI draft'), 'need a supervisor')}${V.kpi('Areas', 'layers', 28 + 175, '28 districts and 175 seats')}</div>
      <div class="grid g-64" style="align-items:start"><div class="card flush"><div class="card-h" style="padding:16px 16px 0">${U.seg('Show', [['district', 'Districts'], ['ac', 'Seats']], 'district')}<select class="sel" id="ntSt" aria-label="Status"><option value="">Any status</option><option>AI draft</option><option>Reviewed</option><option>Approved</option></select></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th scope="col">Area</th><th scope="col">Note</th><th scope="col">Status</th></tr></thead><tbody id="ntRows"></tbody></table></div></div><aside class="card dp" id="ntPanel" aria-label="Note"></aside></div>`;
    let lvl = 'district';
    const panel = M.Panel($('#ntPanel', el), { en, user: S().user, canEdit, onPick: (x) => { en = x; panel.show(x, 'note'); } });
    panel.show(en, 'note');
    const rows = () => {
      const want = $('#ntSt', el).value;
      const list = (lvl === 'district' ? DISTS.map((d) => ({ kind: 'district', id: d.id })) : ACS.map((a) => ({ kind: 'ac', id: a.n }))).filter((e) => !want || M.noteStatus(e) === want);
      $('#ntRows', el).innerHTML = list.map((e) => { const s = M.noteStatus(e); return `<tr class="click" data-k="${e.kind}" data-id="${e.id}" tabindex="0" aria-selected="${M.same(e, en)}"><td class="nm"><b>${esc(M.name(e))}</b><small>${e.kind === 'ac' ? esc(DISTS[byN.get(e.id).dist - 1].name) : DISTS[e.id - 1].acs.length + ' seats'}</small></td><td style="max-width:380px"><small class="muted" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(M.note(e).summary)}</small></td><td><span class="badge ${s === 'Approved' ? 'good' : s === 'Reviewed' ? 'accent' : 'ai'}">${s}</span></td></tr>`; }).join('');
      $$('#ntRows tr', el).forEach((tr) => { const go = () => { en = { kind: tr.dataset.k, id: +tr.dataset.id }; panel.show(en, 'note'); rows(); }; tr.addEventListener('click', go); tr.addEventListener('keydown', (e) => e.key === 'Enter' && go()); });
    };
    U.onSeg(el, '.seg', (x) => { lvl = x; rows(); });
    $('#ntSt', el).addEventListener('change', rows);
    $('#ntPanel', el).addEventListener('click', (e) => { if (e.target.closest('[data-r="nsave"],[data-r="napprove"],[data-r="nreset"]')) setTimeout(rows, 0); });
    $('[data-r="pack"]', el).addEventListener('click', () => M.exportReport({ type: 'notes', en: { kind: 'state', id: 0 }, format: 'pdf' }));
    rows();
  };

  /* ======================= REPORTS ======================= */
  V.reports = function (el) {
    const f = { type: 'district', level: 'district', d: 15, ac: 94, unit: 9401, format: 'pdf', round: M.round, deep: false };
    const T = () => M.REPORTS.find((r) => r.id === f.type);
    const en = () => f.level === 'state' ? { kind: 'state', id: 0 } : f.level === 'district' ? { kind: 'district', id: f.d } : f.level === 'ac' ? { kind: 'ac', id: f.ac } : { kind: 'unit', id: f.unit };
    el.innerHTML = `${V.head('Reports', 'Pick a report, pick the area and round, see it, download it. PDF for reading and sharing, CSV for your own analysis.')}
      <div class="rep-types" id="rpTypes" role="group" aria-label="Report type">${M.REPORTS.map((r) => `<button type="button" class="rt" data-t="${r.id}" aria-pressed="${r.id === f.type}"><span class="hd">${ic(r.icon)}<b>${esc(r.name)}</b></span><small>${esc(r.desc)}</small><span class="fm">${r.fmts.map((x) => `<span class="badge">${x.toUpperCase()}</span>`).join('')}</span></button>`).join('')}</div>
      <div class="rep-build"><div class="card"><div class="card-h"><div><h3>Settings</h3><p id="rpDesc"></p></div></div><div class="grid" style="gap:14px" id="rpForm"></div>
        <div class="acts" style="margin-top:18px"><button type="button" class="btn primary" data-r="dl">${ic('download')}<span>Download</span></button><button type="button" class="btn" data-r="share">${ic('share')}Share to Client Portal</button></div>
        <div class="dp-sec" style="margin-top:22px"><h4>Downloaded in this session</h4><div class="list" id="rpHist"></div></div>
        <div class="dp-sec" style="margin-top:18px"><h4>Scheduled</h4><div class="list">${[['District brief · all 28 districts', 'Every Monday 8:00 · PDF to client', true], ['Field operations · Guntur', 'Daily 19:30 · PDF to supervisors', true], ['Data export · whole state', 'When a round closes · CSV to analysts', false]].map(([t, s, on]) => `<div class="li"><span class="ico">${ic('cal')}</span><span class="t"><b>${t}</b><small>${s}</small></span><button type="button" class="switch" role="switch" aria-checked="${on}" aria-label="${esc(t)}"></button></div>`).join('')}</div></div></div>
        <div><div class="card-h" style="margin:0 0 10px"><h3>Preview</h3><span class="muted" style="font-size:13px">First page, as it will print</span></div><div id="rpPrev"></div></div></div>`;
    const form = () => {
      const t = T(); if (!t.scope.includes(f.level)) f.level = t.scope[0];
      if (!t.fmts.includes(f.format)) f.format = t.fmts[0];
      const a = byN.get(f.ac); if (a.dist !== f.d) f.ac = DISTS[f.d - 1].acs[0];
      const units = M.units(byN.get(f.ac)); if (!units.some((u) => u.id === f.unit)) f.unit = units[0].id;
      $('#rpDesc', el).textContent = t.desc;
      $('#rpForm', el).innerHTML = `<div class="fld"><span>Area level</span>${U.seg('Area level', t.scope.map((s) => [s, { state: 'State', district: 'District', ac: 'Constituency', unit: 'Mandal / urban body' }[s]]), f.level)}</div>
        ${f.level !== 'state' ? `<label class="fld"><span>District</span><select class="sel" data-f="d">${DISTS.map((d) => `<option value="${d.id}"${d.id === f.d ? ' selected' : ''}>${esc(d.name)}</option>`).join('')}</select></label>` : ''}
        ${f.level === 'ac' || f.level === 'unit' ? `<label class="fld"><span>Constituency</span><select class="sel" data-f="ac">${DISTS[f.d - 1].acs.map((n) => `<option value="${n}"${n === f.ac ? ' selected' : ''}>${esc(byN.get(n).name)}</option>`).join('')}</select></label>` : ''}
        ${f.level === 'unit' ? `<label class="fld"><span>Mandal, corporation wards, municipality or nagar panchayat</span><select class="sel" data-f="unit">${M.units(byN.get(f.ac)).map((u) => `<option value="${u.id}"${u.id === f.unit ? ' selected' : ''}>${esc(u.name)} · ${M.KIND_SHORT[u.kind]}</option>`).join('')}</select></label>` : ''}
        <label class="fld"><span>Round</span><select class="sel" data-f="round">${M.ROUNDS.map((r) => `<option value="${r.id}"${r.id === f.round ? ' selected' : ''}>${esc(r.name)} · ${esc(r.dates)}</option>`).join('')}</select></label>
        <div class="fld"><span>Format</span>${U.seg('Format', t.fmts.map((x) => [x, x === 'pdf' ? 'PDF · to read and share' : 'CSV · opens in Excel']), f.format)}</div>
        ${t.id === 'raw' || f.format === 'csv' ? `<label class="chk"><input type="checkbox" data-f="deep"${f.deep ? ' checked' : ''}>Include every level below, down to mandals and urban bodies</label>` : ''}`;
      U.onSeg($('#rpForm', el), '.seg[aria-label="Area level"]', (v) => { f.level = v; form(); });
      U.onSeg($('#rpForm', el), '.seg[aria-label="Format"]', (v) => { f.format = v; form(); });
      $$('[data-f]', el).forEach((s) => s.addEventListener('change', () => { f[s.dataset.f] = s.type === 'checkbox' ? s.checked : +s.value; form(); }));
      $('[data-r="dl"] span', el).textContent = `Download ${f.format.toUpperCase()}`;
      prev();
    };
    const prev = () => {
      const doc = M.buildReport({ type: f.type, en: en(), round: f.round });
      $('#rpPrev', el).innerHTML = f.format === 'csv' ? `<div class="paper"><h4>${esc(M.name(en()))} · ${esc(M.ROUNDS[f.round].name)}</h4><p class="pm">CSV with 29 columns: interviews, margin, every party, lead and call, government and leader ratings, anti-incumbency, mood, top issues, verification, sarcasm and note status.</p><table><thead><tr><th>Area</th><th>Lead</th><th>A %</th><th>B %</th><th>n</th></tr></thead><tbody>${[en(), ...M.children(en()).slice(0, 8)].map((e) => { const v = M.vals(e, f.round); return `<tr><td>${esc(M.name(e))}</td><td>${M.PARTY[v.lead].name} +${f1(v.margin)}</td><td>${f1(v.A)}</td><td>${f1(v.B)}</td><td>${IN(v.iv)}</td></tr>`; }).join('')}</tbody></table></div>` : M.previewHTML(doc, 5);
    };
    const hist = () => { $('#rpHist', el).innerHTML = M.history.length ? M.history.slice(0, 6).map((h, i) => `<div class="li"><span class="ico warm">${ic('file')}</span><span class="t"><b>${esc(h.type)} · ${esc(h.area)}</b><small>${h.format} · ${esc(h.round)} · ${h.at}</small></span><button type="button" class="btn sm ghost" data-h="${i}" aria-label="Download again">${ic('download')}</button></div>`).join('') : '<p class="muted" style="margin:0;font-size:14px">Nothing yet. Downloads appear here so you can get them again.</p>'; $$('[data-h]', el).forEach((b) => b.addEventListener('click', () => M.exportReport(M.history[+b.dataset.h].args))); };
    $$('#rpTypes .rt', el).forEach((b) => b.addEventListener('click', () => { $$('#rpTypes .rt', el).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); f.type = b.dataset.t; form(); }));
    $('[data-r="dl"]', el).addEventListener('click', () => M.exportReport({ type: f.type, en: en(), format: f.format, round: f.round, deep: f.deep }));
    $('[data-r="share"]', el).addEventListener('click', () => U.toast(M.silence ? 'Election silence is on: sharing is paused until it ends.' : `${T().name} for ${M.name(en())} is now in the Client Portal library.`));
    $$('.switch', el).forEach((s) => s.addEventListener('click', () => { s.setAttribute('aria-checked', String(s.getAttribute('aria-checked') !== 'true')); U.toast('Schedule updated.'); }));
    document.addEventListener('reportmade', hist);
    form(); hist();
  };

  /* ======================= AI ANALYST ======================= */
  const TE = { 'గుంటూరు': 'Guntur', 'విశాఖపట్నం': 'Visakhapatnam', 'కర్నూలు': 'Kurnool', 'నెల్లూరు': 'Nellore', 'తిరుపతి': 'Tirupati', 'విజయవాడ': 'NTR', 'తెనాలి': 'Tenali', 'కడప': 'YSR Kadapa', 'అనంతపురం': 'Anantapur', 'చిత్తూరు': 'Chittoor' };
  M.ask = function (q0) {
    let q = q0.trim(); const te = /[ఀ-౿]/.test(q);
    Object.entries(TE).forEach(([k, x]) => { q = q.replace(k, x); });
    const L = q.toLowerCase();
    const st = { kind: 'state', id: 0 }, v0 = M.vals(st);
    const base = { n: v0.iv, sql: '' };
    const place = (() => {
      const hit = (arr, f) => arr.filter(f).sort((a, b) => M.name(b).length - M.name(a).length)[0];
      const u = hit(ACS.flatMap((a) => M.units(a).filter((x) => !x.placeholder && x.kind !== 'corp').map((x) => ({ kind: 'unit', id: x.id }))), (e) => L.includes(M.unitById(e.id).body ? M.unitById(e.id).body.toLowerCase() + ' municipality' : '###') || L.includes(M.unitById(e.id).name.toLowerCase() + ' mandal'));
      const a = hit(ACS.map((x) => ({ kind: 'ac', id: x.n })), (e) => L.includes(M.name(e).toLowerCase()));
      const d = hit(DISTS.map((x) => ({ kind: 'district', id: x.id })), (e) => L.includes(M.name(e).toLowerCase()));
      return u || a || d;
    })();
    const bm = L.match(/booth\s*(\d+)/);
    if (bm) return { ...base, n: 24, text: `<b>I can't answer that reliably.</b> Booth ${bm[1]} has only 24 interviews this round, below our minimum of 100, so any percentage would mislead. I can answer for its mandal or seat instead.`, meta: ['n = 24', 'Below minimum'], sql: `SELECT count(*) FROM interviews WHERE booth_id = ${bm[1]} AND round = ${M.round} AND verified;` };
    if (/sarcas|tone|irony|mock(ing)?\b/.test(L)) { const s = M.SAYINGS[0]; return { ...base, text: `This round the speech engine caught <b>${IN(v0.sarcasm)} sarcastic answers</b> (${f1((v0.sarcasm / v0.iv) * 100)}% of open answers). Each was scored by what was meant, not the literal words. ${IN(v0.review)} were unclear and went to a Telugu-speaking reviewer. Without this, positive mood would be overstated by about ${f1((v0.sarcasm / v0.iv) * 100)} points.`, cards: [[IN(v0.sarcasm), 'Sarcasm caught'], [IN(v0.review), 'Human reviews'], ['94%', 'Reviewer agreement with AI']], quote: s, sql: `SELECT count(*) FILTER (WHERE tone='sarcastic'), count(*) FILTER (WHERE tone_review) FROM answers WHERE round=${M.round};` }; }
    if (/agent|field|fraud|fake|surveyor|verif/.test(L)) { const bad = M.agents.filter((a) => ['fence', 'mock', 'idle', 'offline'].includes(a.status)); return { ...base, text: `${IN(M.FIELD.online)} of ${IN(M.FIELD.agents)} agents are online. In Guntur, <b>${bad.length} need attention</b>: ${bad.map((a) => `${a.name} (${M.AGENT_STATUS[a.status][0].toLowerCase()})`).join(', ')}. ${f1(v0.verified)}% of interviews pass all nine checks.`, cards: [[IN(M.FIELD.online), 'Agents online'], [bad.length, 'Need attention'], [f1(v0.verified) + '%', 'Verified']], go: 'field' }; }
    if (/toss|close|tight|battleground|marginal/.test(L)) { const list = ACS.map((a) => ({ a, v: M.vals({ kind: 'ac', id: a.n }) })).filter((x) => x.v.cls === 'Toss-up').sort((x, y) => x.v.margin - y.v.margin); return { ...base, text: `<b>${list.length} seats are toss-ups</b> (lead under 4 points). The closest: ${list.slice(0, 6).map((x) => `${x.a.name} (${M.lead(x.v)})`).join(', ')}.`, cards: [[list.length, 'Toss-up seats'], [list.filter((x) => x.v.lead === 'A').length, 'Party A just ahead'], [list.filter((x) => x.v.lead === 'B').length, 'Party B just ahead']], sql: `SELECT ac_name, lead, margin FROM seat_estimates WHERE round=${M.round} AND margin < 4 ORDER BY margin;` }; }
    if (/gain|swing|moving|momentum|shift/.test(L) && !place) { const m = ACS.map((a) => { const v = M.vals({ kind: 'ac', id: a.n }), p = M.vals({ kind: 'ac', id: a.n }, Math.max(0, M.round - 1)); return { a, sw: (v.B - p.B) - (v.A - p.A) }; }).sort((x, y) => y.sw - x.sw); const toB = /opposition|party b/.test(L) || !/ruling|party a/.test(L); const list = toB ? m.slice(0, 5) : m.slice(-5).reverse(); return { ...base, text: `Since ${M.ROUNDS[Math.max(0, M.round - 1)].short}, the biggest swings ${toB ? 'to Party B (opposition)' : 'to Party A (ruling)'}: ${list.map((x) => `${x.a.name} (${sg(Math.abs(x.sw))} pts)`).join(', ')}.`, cards: list.slice(0, 3).map((x) => [sg(Math.abs(x.sw)), x.a.name]), sql: 'SELECT ac_name, (b_r2-b_r1)-(a_r2-a_r1) AS swing FROM seat_estimates ORDER BY swing DESC LIMIT 5;' }; }
    if (/women|female|youth|young|farmer|student|senior|old/.test(L)) { const c = M.cuts(st); const row = /women|female/.test(L) ? c.gender[0] : /youth|young|student/.test(L) ? c.age[0] : /farmer/.test(L) ? c.job[0] : c.age[3]; return { ...base, n: Math.round(v0.iv * 0.3), text: `Among <b>${row[0].toLowerCase()}</b>, Party A has ${p0(row[1])} and Party B ${p0(row[2])}, a gap of ${f1(Math.abs(row[1] - row[2]))} points. Statewide the gap is ${f1(Math.abs(v0.A - v0.B))}.`, cards: [[p0(row[1]), 'Party A'], [p0(row[2]), 'Party B'], [U.moe(v0.iv * 0.3), 'Margin of error']] }; }
    if (/issue|problem|concern|worry/.test(L) && !place) return { ...base, text: `Statewide the biggest problems named are ${v0.iss.slice(0, 4).map(([k, x]) => `<b>${k}</b> (${p0(x)})`).join(', ')}.`, cards: v0.iss.slice(0, 3).map(([k, x]) => [p0(x), k]), quote: M.SAYINGS[1] };
    const en = place || st, v = M.vals(en), p = M.round ? M.vals(en, M.round - 1) : null;
    if (place || /ruling|government|opposition|approval|anti|lead|winning|stand|who|how/.test(L) || te) {
      const ld = M.PARTY[v.lead].name, sc = M.PARTY[v.second].name;
      const txt = `${v.margin < 1 ? `In <b>${esc(M.name(en))}</b> Party A and Party B are level` : `In <b>${esc(M.name(en))}</b> ${ld} leads ${sc} by <b>${f1(v.margin)} points</b>`} (${p0(v.A)} to ${p0(v.B)}${p ? `; Party A ${sg(v.A - p.A)} since ${M.ROUNDS[M.round - 1].short}` : ''}). Government approval is ${p0(v.gov)}, the Chief Minister rates ${p0(v.cm)} and the opposition leader ${p0(v.opp)}. Top issue: ${v.iss[0][0]} (${p0(v.iss[0][1])}).${v.seats ? ` Seat range: Party A ${v.seats.lo.A}–${v.seats.hi.A}, Party B ${v.seats.lo.B}–${v.seats.hi.B}.` : ` Call: ${v.cls}.`}`;
      const teLine = te ? `<div class="te" lang="te" style="margin-bottom:6px">${esc(M.name(en))} లో ${v.lead === 'A' ? 'పార్టీ A' : 'పార్టీ B'} ${f1(v.margin)} పాయింట్ల ఆధిక్యంలో ఉంది. ప్రభుత్వం పై సంతృప్తి ${p0(v.gov)}.</div>` : '';
      return { n: v.iv, text: teLine + txt, cards: [[p0(v.A), 'Party A · ruling'], [p0(v.B), 'Party B · opposition'], [p0(v.gov), 'Govt approval'], [Math.round(v.anti), 'Anti-incumbency']], quote: M.SAYINGS.find((s) => s.issue === v.iss[0][0]) || M.SAYINGS[0], en, sql: `SELECT party, round(100.0*sum(weight)/sum(sum(weight)) over (),1) AS share FROM vote_intention WHERE ${en.kind === 'state' ? 'true' : `${en.kind === 'district' ? 'district_id' : en.kind === 'ac' ? 'ac_no' : 'unit_id'} = ${en.id}`} AND round = ${M.round} AND verified GROUP BY party;` };
    }
    return { ...base, text: 'I answer from verified interviews only. Try a place (“How is Party A doing in Tenali?”), a group (“What do women think?”), toss-up seats, swings, issues, sarcasm, or the field team.', cards: [] };
  };
  V.ai = function (el) {
    const SUG = ['How is the ruling party doing in Guntur?', 'Where is the opposition gaining?', 'Which seats are toss-ups?', 'What do women think about the government?', 'How many answers were sarcastic this round?', 'Which agents need attention today?', 'Summarise Tenali Municipality', 'గుంటూరు లో ఎవరు ముందున్నారు?', 'What is the result in booth 112?'];
    el.innerHTML = `${V.head('AI analyst', 'Ask in English or Telugu. Answers come from verified interviews, with the sample, the margin and the voices behind them.', V.roundTag())}
      <div class="ai-wrap"><div class="card chat"><div class="chat-log" id="aiLog" aria-live="polite"><div class="ai-empty"><span class="orb big" aria-hidden="true"></span><h3>What <span class="grad-t">would you like to know?</span></h3><p>${IN(M.vals({ kind: 'state', id: 0 }).iv)} verified interviews, 175 seats, every mandal and urban body.</p></div></div>
        <form class="chat-in" id="aiForm"><label class="sr" for="aiQ">Your question</label><input class="inp" id="aiQ" placeholder="Ask about any area, party, group or issue" autocomplete="off" aria-describedby="aiErr"><button type="submit" class="btn primary">${ic('send')}Ask</button></form><small class="err" id="aiErr" hidden style="padding:0 16px 12px;color:var(--bad)">Type a question first, for example “Which seats are toss-ups?”</small></div>
        <div class="grid" style="align-content:start"><div class="card"><div class="card-h"><h3>Try asking</h3></div><div class="sugg">${SUG.map((s) => `<button type="button"${/[ఀ-౿]/.test(s) ? ' lang="te" class="te"' : ''}>${ic('spark')}${esc(s)}</button>`).join('')}</div></div>
        <div class="card"><div class="card-h"><h3>How it answers</h3></div><div class="list">${[['db', 'Reads only verified interviews'], ['scale', 'Shows n and the margin of error'], ['lock', 'Refuses areas under 100 interviews'], ['eye', 'Every query is logged for audit']].map(([i, t]) => `<div class="li"><span class="ico ai">${ic(i)}</span><span class="t"><b>${t}</b></span></div>`).join('')}</div></div></div></div>`;
    const log = $('#aiLog', el), inp = $('#aiQ', el);
    const ask = (q) => {
      if (!q.trim()) { $('#aiErr', el).hidden = false; inp.setAttribute('aria-invalid', 'true'); inp.focus(); return; }
      $('#aiErr', el).hidden = true; inp.removeAttribute('aria-invalid');
      const empty = $('.ai-empty', log); if (empty) empty.remove();
      log.insertAdjacentHTML('beforeend', `<div class="msg-q"${/[ఀ-౿]/.test(q) ? ' lang="te"' : ''}>${esc(q)}</div><div class="msg-a"><div class="who" style="display:flex;gap:10px;align-items:center"><span class="orb think" aria-hidden="true"></span>AI analyst</div><div class="think-steps"></div></div>`);
      const box = log.lastElementChild, steps = $('.think-steps', box);
      const st = ['Understanding the question', `Reading ${IN(M.vals({ kind: 'state', id: 0 }).iv)} verified interviews`, 'Checking the sample size', 'Writing the answer'];
      let i = 0;
      const next = () => {
        if (i < st.length) { steps.insertAdjacentHTML('beforeend', `<span>${ic('check')}${st[i]}</span>`); i++; log.scrollTop = log.scrollHeight; setTimeout(next, U.reduced ? 0 : 300); return; }
        const a = M.ask(q); steps.remove(); $('.orb', box).classList.remove('think');
        box.insertAdjacentHTML('beforeend', `<div class="meta"><span class="badge ai">n = ${IN(a.n)}</span><span class="badge">${U.moe(a.n)}</span><span class="badge">${esc(M.ROUNDS[M.round].short)}</span></div><div class="txt">${a.text}</div>${a.cards && a.cards.length ? `<div class="cards">${a.cards.map(([b, s]) => `<div><b>${b}</b><span>${esc(s)}</span></div>`).join('')}</div>` : ''}${a.quote ? `<div class="quote"><div class="te" lang="te">${esc(a.quote.te)}</div><div class="en">${esc(a.quote.en)}</div><div class="meta"><span class="badge">${esc(a.quote.issue)}</span>${a.quote.sar > 0.75 ? '<span class="badge ai">Sarcasm detected</span>' : ''}</div>${U.player(10, 21)}</div>` : ''}<div class="acts">${a.en ? `<button type="button" class="btn sm" data-map>${ic('map')}Open on the map</button><button type="button" class="btn sm" data-pdf>${ic('download')}PDF brief</button>` : ''}${a.go ? `<button type="button" class="btn sm" data-goto="${a.go}">${ic('route')}Open Field force</button>` : ''}${a.sql ? `<button type="button" class="btn sm ghost" data-sql aria-expanded="false">${ic('code')}View query</button>` : ''}</div>${a.sql ? `<pre hidden style="margin:0;padding:12px;border-radius:12px;background:var(--card-2);font-size:12.5px;overflow-x:auto;white-space:pre-wrap">${esc(a.sql)}</pre>` : ''}`);
        const sqlB = $('[data-sql]', box); if (sqlB) sqlB.addEventListener('click', () => { const pre = $('pre', box); pre.hidden = !pre.hidden; sqlB.setAttribute('aria-expanded', String(!pre.hidden)); });
        const mp = $('[data-map]', box); if (mp) mp.addEventListener('click', () => S().go('map', a.en));
        const pd = $('[data-pdf]', box); if (pd) pd.addEventListener('click', () => M.exportReport({ type: a.en.kind === 'state' ? 'state' : a.en.kind === 'district' ? 'district' : a.en.kind === 'ac' ? 'ac' : 'unit', en: a.en, format: 'pdf' }));
        const gt = $('[data-goto]', box); if (gt) gt.addEventListener('click', () => S().go(gt.dataset.goto));
        log.scrollTop = log.scrollHeight;
      };
      next();
    };
    $('#aiForm', el).addEventListener('submit', (e) => { e.preventDefault(); ask(inp.value); inp.value = ''; });
    $$('.sugg button', el).forEach((b) => b.addEventListener('click', () => ask(b.textContent.trim())));
  };
})();
