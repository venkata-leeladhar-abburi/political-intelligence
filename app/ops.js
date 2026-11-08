/* Political Intelligence Platform · operations pages
   Surveys (list, progress, create wizard), Field force (live location), Verification (checks,
   sarcasm, respondent profile), Users and roles, Settings and audit. */
(function () {
  'use strict';
  const PI = window.PI, M = window.M, U = window.U, V = (window.V = window.V || {}), S = () => window.APP;
  const { DISTS, byN, rng, hash } = PI;
  const { $, $$, ic, esc, IN, p0, f1 } = U;
  const stateBadge = (s) => s === 'live' ? '<span class="badge accent live">Live</span>' : s === 'scheduled' ? '<span class="badge">Scheduled</span>' : s === 'draft' ? '<span class="badge ai">Draft</span>' : '<span class="badge good">Closed</span>';

  /* ======================= SURVEYS ======================= */
  V.surveys = function (el) {
    const canMake = M.roleCan(S().role, 'surveys') === 2;
    let sel = M.surveys[0];
    el.innerHTML = `${V.head('Surveys', 'Plan a round, write the questionnaire, assign teams and watch it fill up booth by booth.', `${canMake ? `<button type="button" class="btn primary" data-r="new">${ic('plus')}New survey</button>` : '<span class="badge">View only for Command Center</span>'}`)}
      <div class="kpis">${V.kpi('Collected this round', 'users', IN(M.surveys.filter((s) => s.state === 'live').reduce((t, s) => t + s.done, 0)), 'across all live surveys', 'hero')}${V.kpi('Live surveys', 'clip', M.surveys.filter((s) => s.state === 'live').length, '2 more scheduled or in draft')}${V.kpi('Median length', 'clock', '9 min 40 s', 'target 8–12 minutes')}${V.kpi('Question bank', 'book', M.QBANK.length + ' core', '138 tested questions in Telugu')}</div>
      <div class="card flush"><div class="tbl-wrap"><table class="tbl"><thead><tr><th scope="col">Survey</th><th scope="col">Scope</th><th scope="col">Progress</th><th scope="col">Status</th><th scope="col">Dates</th><th scope="col">Owner</th></tr></thead><tbody id="svRows"></tbody></table></div></div>
      <div class="grid g-64" id="svDetail"></div>`;
    const rows = () => {
      $('#svRows', el).innerHTML = M.surveys.map((s) => { const pc = s.target ? (s.done / s.target) * 100 : 0; return `<tr class="click" data-id="${s.id}" aria-selected="${s === sel}" tabindex="0"><td class="nm"><b>${esc(s.name)}</b><small>${esc(s.id)} · ${esc(s.type)} · ${s.qs} questions · ${esc(s.lang)}</small></td><td>${esc(s.scope)}</td><td style="min-width:180px"><div style="display:flex;align-items:center;gap:10px"><span class="track grad" style="flex:1"><i style="width:${pc}%"></i></span><b class="num" style="font-size:13px">${p0(pc)}</b></div><small class="muted">${IN(s.done)} of ${IN(s.target)}</small></td><td>${stateBadge(s.state)}</td><td class="num">${esc(s.start)} – ${esc(s.end)}</td><td>${esc(s.owner)}</td></tr>`; }).join('');
      $$('#svRows tr', el).forEach((tr) => { const open = () => { sel = M.surveys.find((x) => x.id === tr.dataset.id); rows(); detail(); }; tr.addEventListener('click', open); tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); }); });
    };
    const detail = () => {
      const s = sel, live = s.state === 'live', r = rng(hash(s.id));
      const dist = DISTS.map((d) => ({ d, pc: live ? 20 + r() * 60 : s.state === 'closed' ? 88 + r() * 12 : 0 })).sort((a, b) => b.pc - a.pc);
      const quotas = [['Women', 50, 47 + r() * 6], ['Men', 50, 48 + r() * 4], ['18–25', 19, 14 + r() * 6], ['26–40', 33, 31 + r() * 4], ['41–60', 31, 30 + r() * 4], ['60+', 17, 15 + r() * 4], ['Rural mandals', 64, 60 + r() * 6], ['Corporations and towns', 36, 33 + r() * 6]];
      $('#svDetail', el).innerHTML = `<div class="card"><div class="card-h"><div><h3>${esc(s.name)}</h3><p>${esc(s.scope)} · ${esc(s.start)} – ${esc(s.end)} · owner ${esc(s.owner)}</p></div>${stateBadge(s.state)}</div>
        ${s.state === 'draft' || s.state === 'scheduled' ? `<div class="verdict"><b>${s.state === 'draft' ? 'Not started' : 'Starts ' + esc(s.start)}</b><p>${s.state === 'draft' ? 'Finish the questionnaire and assign teams, then publish it to the Field App.' : 'Agents get it on their phones the evening before. Quotas and booths are already assigned.'}</p></div>` : `<div class="dp-sec"><h4><span>Progress by district</span><span>of target</span></h4>${U.bars(dist.slice(0, 10).map((x) => ({ l: x.d.name, v: x.pc })), { max: 100 })}</div>`}
        </div>
        <div class="grid" style="align-content:start"><div class="card"><div class="card-h"><div><h3>Quotas</h3><p>Filled against the voter roll</p></div></div>${U.bars(quotas.map(([l, t, x]) => ({ l, v: (x / t) * 100 * (live ? 0.9 : s.state === 'closed' ? 1 : 0), vt: s.state === 'draft' ? '—' : p0(Math.min(100, (x / t) * 100 * (live ? 0.9 : 1))) })), { max: 100 })}</div>
        <div class="card"><div class="card-h"><div><h3>Questionnaire</h3><p>${s.qs} questions · v${s.state === 'closed' ? '2.1' : '3.0'}</p></div><button type="button" class="btn sm" data-r="qs">Preview</button></div><div class="list">${M.QBANK.slice(0, 5).map((q) => `<div class="li"><span class="ico">${ic(q.kind.startsWith('Voice') ? 'mic' : q.kind.startsWith('Details') ? 'user' : q.kind.startsWith('Secret') ? 'lock' : 'check')}</span><span class="t"><b>${esc(q.t)}</b><small>${esc(q.sec)} · ${esc(q.kind)}</small></span></div>`).join('')}</div></div></div>`;
      $('[data-r="qs"]', el).addEventListener('click', () => U.dialog({ title: 'Questionnaire preview', sub: `${esc(s.name)} · shown in Telugu on the Field App`, wide: true, body: `<div class="list">${M.QBANK.map((q, i) => `<div class="li"><span class="ico">${i + 1}</span><span class="t"><b>${esc(q.t)}</b><small>${esc(q.sec)} · ${esc(q.kind)}</small></span></div>`).join('')}</div>` }));
    };
    rows(); detail();
    const nb = $('[data-r="new"]', el); if (nb) nb.addEventListener('click', () => V.newSurvey(() => { sel = M.surveys[0]; rows(); detail(); }));
  };

  /* create-survey wizard */
  V.newSurvey = function (done) {
    const steps = ['Basics', 'Scope', 'Questions', 'Team', 'Rules'];
    const f = { name: '', type: 'Tracker', lang: ['Telugu'], dists: [15], kinds: ['corp', 'muni', 'mandal'], per: 400, qs: M.QBANK.map((q) => q.id), extra: '', start: '2026-11-10', end: '2026-11-24', fence: 250, minLen: 6, back: 10, sar: 75 };
    let i = 0;
    const seats = () => f.dists.reduce((t, d) => t + DISTS[d - 1].acs.length, 0);
    const body = () => {
      const stp = `<div class="steps">${steps.map((s, j) => `<span class="${j === i ? 'on' : j < i ? 'done' : ''}"><i>${j < i ? '✓' : j + 1}</i>${s}</span>`).join('')}</div>`;
      if (i === 0) return stp + `<label class="fld"><span>Survey name</span><input class="inp" id="nsName" value="${esc(f.name)}" placeholder="For example: Guntur youth pulse, November" aria-describedby="nsErr"><small class="err" id="nsErr" hidden>Give the survey a name so agents can find it.</small></label>
        <div class="fld"><span>Type</span>${U.seg('Survey type', [['Tracker', 'Tracker'], ['Deep-dive', 'Deep-dive'], ['Pulse', 'Pulse'], ['Flash', 'Flash poll']], f.type)}</div>
        <div class="fld"><span>Languages on the Field App</span><div class="opt-grid">${['Telugu', 'English', 'Urdu', 'Hindi'].map((l) => `<label class="chk"><input type="checkbox" data-lang="${l}"${f.lang.includes(l) ? ' checked' : ''}>${l}</label>`).join('')}</div></div>`;
      if (i === 1) { const n = seats() * f.per; return stp + `<div class="fld"><span>Districts (${f.dists.length} chosen · ${seats()} seats)</span><div class="opt-grid" style="max-height:220px;overflow:auto">${DISTS.map((d) => `<label class="chk"><input type="checkbox" data-d="${d.id}"${f.dists.includes(d.id) ? ' checked' : ''}>${esc(d.name)}</label>`).join('')}</div></div>
        <div class="fld"><span>Area types</span><div class="opt-grid">${[['corp', 'Municipal corporations'], ['muni', 'Municipalities and nagar panchayats'], ['mandal', 'Rural mandals']].map(([k, l]) => `<label class="chk"><input type="checkbox" data-k="${k}"${f.kinds.includes(k) ? ' checked' : ''}>${l}</label>`).join('')}</div></div>
        <label class="fld"><span>Interviews per seat: <b class="num" id="nsPerO">${IN(f.per)}</b></span><input type="range" id="nsPer" min="100" max="1500" step="50" value="${f.per}" style="accent-color:var(--warm)"></label>
        <div class="verdict"><b>${IN(n)} interviews · seat margin ${U.moe(f.per)} · district ${U.moe(n / f.dists.length || 1)}</b><p>Below 100 per area we never show percentages, so booths roll up to mandals and seats.</p></div>`; }
      if (i === 2) return stp + `<div class="fld"><span>From the question bank</span><div class="list">${M.QBANK.map((q) => `<label class="chk" style="margin-top:6px"><input type="checkbox" data-q="${q.id}"${f.qs.includes(q.id) ? ' checked' : ''}><span style="flex:1"><b style="display:block;font-weight:600">${esc(q.t)}</b><small class="muted">${esc(q.sec)} · ${esc(q.kind)}</small></span></label>`).join('')}</div></div>
        <label class="fld"><span>Add your own question (optional)</span><input class="inp" id="nsExtra" value="${esc(f.extra)}" placeholder="Typed in English; our team adds the tested Telugu wording"></label>`;
      if (i === 3) return stp + `<div class="tbl-wrap"><table class="tbl"><thead><tr><th scope="col">District</th><th scope="col">Supervisor</th><th scope="col" class="r">Agents</th><th scope="col" class="r">Per agent / day</th></tr></thead><tbody>${f.dists.map((d) => `<tr><td>${esc(DISTS[d - 1].name)}</td><td><select class="sel" aria-label="Supervisor for ${esc(DISTS[d - 1].name)}">${M.users.filter((u) => u.role === 'command' && u.sub === 'Supervisor').map((u) => `<option>${esc(u.name)}</option>`).join('')}</select></td><td class="r">${Math.ceil((DISTS[d - 1].acs.length * f.per) / 25 / 10)}</td><td class="r">25</td></tr>`).join('')}</tbody></table></div>
        <p class="muted" style="margin:0">Booths are split among agents by distance. Each agent sees only their booths and their own interviews.</p>`;
      return stp + `<div class="grid g2" style="gap:14px"><label class="fld"><span>Start</span><input class="inp" type="date" id="nsS" value="${f.start}"></label><label class="fld"><span>End</span><input class="inp" type="date" id="nsE" value="${f.end}"></label></div>
        ${[['fence', 'Booth fence radius', 100, 500, 25, ' m'], ['minLen', 'Shortest valid interview', 3, 12, 1, ' min'], ['back', 'Back-check calls', 0, 25, 1, '% of interviews'], ['sar', 'Flip tone automatically above', 60, 95, 5, '% sarcasm confidence']].map(([k, l, a, b, s, u]) => `<label class="fld"><span>${l}: <b class="num" data-o="${k}">${f[k]}${u}</b></span><input type="range" data-rg="${k}" data-u="${u}" min="${a}" max="${b}" step="${s}" value="${f[k]}" style="accent-color:var(--warm)"></label>`).join('')}
        <div class="verdict"><b>Election silence is automatic</b><p>Results leave the Client Portal 48 hours before polling in any seat in scope (RP Act Section 126). Field work and verification continue.</p></div>`;
    };
    const foot = () => `<button type="button" class="btn ghost" data-r="back"${i === 0 ? ' disabled' : ''}>Back</button><button type="button" class="btn primary" data-r="next">${i === steps.length - 1 ? 'Create and schedule' : 'Continue'}</button>`;
    const d = U.dialog({ title: 'New survey', sub: 'Five short steps. You can save and come back.', body: body(), foot: foot(), wide: true });
    const read = () => {
      const q = (s) => $(s, d);
      if (i === 0) { f.name = q('#nsName').value.trim(); f.lang = $$('[data-lang]', d).filter((x) => x.checked).map((x) => x.dataset.lang); const sg = $('.seg', d); f.type = $('[aria-pressed="true"]', sg).dataset.v; }
      if (i === 1) { f.dists = $$('[data-d]', d).filter((x) => x.checked).map((x) => +x.dataset.d); f.kinds = $$('[data-k]', d).filter((x) => x.checked).map((x) => x.dataset.k); }
      if (i === 2) { f.qs = $$('[data-q]', d).filter((x) => x.checked).map((x) => x.dataset.q); f.extra = q('#nsExtra').value; }
      if (i === 4) { f.start = q('#nsS').value; f.end = q('#nsE').value; $$('[data-rg]', d).forEach((x) => (f[x.dataset.rg] = +x.value)); }
    };
    const draw = () => {
      $('.dlg-b', d).innerHTML = body(); $('.dlg-f', d).innerHTML = foot();
      U.onSeg(d, '.seg', () => {});
      const per = $('#nsPer', d); if (per) per.addEventListener('input', () => { f.per = +per.value; read(); const keep = per.value; draw(); $('#nsPer', d).value = keep; $('#nsPer', d).focus(); });
      $$('[data-d],[data-k]', d).forEach((x) => x.addEventListener('change', () => { read(); draw(); }));
      $$('[data-rg]', d).forEach((x) => x.addEventListener('input', () => { $(`[data-o="${x.dataset.rg}"]`, d).textContent = x.value + x.dataset.u; }));
      $('[data-r="back"]', d).addEventListener('click', () => { read(); i--; draw(); });
      $('[data-r="next"]', d).addEventListener('click', () => {
        read();
        if (i === 0 && !f.name) { const n = $('#nsName', d); n.setAttribute('aria-invalid', 'true'); $('#nsErr', d).hidden = false; n.focus(); return; }
        if (i === 1 && !f.dists.length) { U.toast('Choose at least one district.'); return; }
        if (i < steps.length - 1) { i++; draw(); return; }
        const fmt = (s) => new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        M.surveys.unshift({ id: 'S-' + (33 + M.surveys.length), name: f.name, type: f.type, scope: `${seats()} seats · ${f.dists.length} district${f.dists.length > 1 ? 's' : ''}`, target: seats() * f.per, done: 0, state: 'scheduled', start: fmt(f.start), end: fmt(f.end), qs: f.qs.length + (f.extra ? 1 : 0), lang: f.lang.join(', '), owner: S().user() });
        d.close(); U.toast(`${f.name} scheduled. ${Math.ceil((seats() * f.per) / 250)} agents will get it on their phones.`);
        if (done) done(); else if (S().page === 'surveys') S().go('surveys');
      });
    };
    draw();
  };

  /* ======================= FIELD FORCE ======================= */
  V.field = function (el) {
    const ags = M.agents; let sel = ags[7], filter = 'all';
    const counts = (k) => ags.filter((a) => a.status === k).length;
    el.innerHTML = `${V.head('Field force', 'Every agent on duty, where they are and how their day is going. Location is shared only during duty hours, and agents see when it is on.', `<span class="badge accent live">Guntur team · live</span><select class="sel" aria-label="Team"><option>Guntur district · 24 agents</option><option>All districts · 1,248 agents</option></select>`)}
      <div class="kpis">${V.kpi('Done today', 'checkc', IN(ags.reduce((t, a) => t + a.done, 0)), 'of ' + IN(ags.length * 25) + ' target', 'hero')}${V.kpi('Interviewing', 'mic', counts('interview'), 'right now')}${V.kpi('Moving', 'route', counts('travel'), 'to the next booth')}${V.kpi('Idle or offline', 'wifioff', counts('idle') + counts('offline'), 'saved interviews sync later')}${V.kpi('Location alerts', 'alert', counts('fence') + counts('mock'), 'outside fence or mock-GPS')}</div>
      <div class="grid g-64"><div class="card map-card"><div class="map-top"><div><b>Live positions</b><div class="map-hint">Lines show the last hour. Red rings need action.</div></div>${U.seg('Show', [['all', 'All'], ['alert', 'Alerts'], ['interview', 'Interviewing']], filter)}</div><div class="mapbox" id="ffMap"><svg aria-label="Live map of agents in Guntur district" role="img"></svg></div><div class="map-foot">${U.legend([['Interviewing', 'var(--ink)'], ['Moving or idle', 'var(--ink-3)'], ['Alert', 'var(--bad)']])}<span class="map-hint">Updated every 15 s</span></div></div>
      <div class="card" id="ffAgent"></div></div>
      <div class="card flush"><div class="tbl-wrap"><table class="tbl"><thead><tr><th scope="col">Agent</th><th scope="col">Seat · area · booth</th><th scope="col">Status</th><th scope="col">Today</th><th scope="col" class="r">Battery</th><th scope="col" class="r">Last ping</th><th scope="col" class="r">Score</th></tr></thead><tbody id="ffRows"></tbody></table></div></div>`;
    const d = DISTS[14], svg = $('#ffMap svg', el);
    const posOf = (a, t = 0) => { const u = M.unitById(a.unit), g = M.unitGeo(byN.get(a.ac)), pts = g.booths[u.i]; const p = pts[Math.floor(a.seed * pts.length) % pts.length] || g.seeds[u.i]; const w = a.status === 'travel' ? 3 : a.status === 'fence' ? 9 : 0.6; return [p[0] + Math.sin(t * 0.7 + a.seed * 9) * w + (a.status === 'fence' ? 10 : 0), p[1] + Math.cos(t * 0.5 + a.seed * 7) * w]; };
    const b = PI.bbox(d.d), pad = 8; let tick = 0;
    svg.setAttribute('viewBox', `${b.x - pad} ${b.y - pad} ${b.w + pad * 2} ${b.h + pad * 2}`);
    const draw = () => {
      const k = (b.w + pad * 2) / Math.max(svg.clientWidth || 600, 200);
      const show = ags.filter((a) => filter === 'all' || (filter === 'alert' ? ['fence', 'mock', 'offline', 'idle'].includes(a.status) : a.status === filter));
      svg.innerHTML = `${d.acs.map((n) => `<path class="a" d="${byN.get(n).d}" fill="var(--map-base)" style="cursor:default"/>`).join('')}${d.acs.map((n) => { const a = byN.get(n); return `<text class="lb" x="${a.c[0]}" y="${a.c[1] - 6 * k}" font-size="${11 * k}" stroke-width="${3 * k}" opacity=".7">${esc(a.name)}</text>`; }).join('')}
        ${show.map((a) => { const trail = [0, 1, 2, 3, 4].map((j) => posOf(a, tick - j * 1.4)); const p = trail[0]; const bad = ['fence', 'mock'].includes(a.status); const c = bad ? 'var(--bad)' : a.status === 'interview' ? 'var(--ink)' : 'var(--ink-3)'; return `<polyline points="${trail.map((q) => q.join(',')).join(' ')}" fill="none" stroke="${c}" stroke-width="1.2" stroke-dasharray="2 2" vector-effect="non-scaling-stroke" opacity=".5"/>${bad || a === sel ? `<circle class="ring" cx="${p[0]}" cy="${p[1]}" r="${6 * k}" stroke="${c}"/>` : ''}<circle class="ag" cx="${p[0]}" cy="${p[1]}" r="${(a === sel ? 6 : 4.4) * k}" fill="${c}" data-a="${a.id}" style="cursor:pointer" data-tip="${esc(U.tipRows(a.name + ' · ' + a.id, [['Status', M.AGENT_STATUS[a.status][0]], ['Today', a.done + ' of 25'], ['Seat', byN.get(a.ac).name]]))}"/>`; }).join('')}`;
    };
    const rows = () => {
      $('#ffRows', el).innerHTML = ags.map((a) => { const [st, c] = M.AGENT_STATUS[a.status]; return `<tr class="click" data-a="${a.id}" aria-selected="${a === sel}" tabindex="0"><td><div class="who"><span class="av">${U.initials(a.name)}</span><span class="nm"><b>${esc(a.name)}</b><small>${a.id}</small></span></div></td><td class="nm"><b>${esc(byN.get(a.ac).name)}</b><small>${esc(M.unitById(a.unit).name)} · Booth ${a.booth}</small></td><td><span class="badge ${c === 'muted' ? '' : c}">${esc(st)}</span></td><td style="min-width:140px"><div style="display:flex;gap:8px;align-items:center"><span class="track" style="flex:1"><i style="width:${(a.done / a.target) * 100}%"></i></span><b class="num" style="font-size:13px">${a.done}/25</b></div></td><td class="r">${a.battery}%</td><td class="r">${a.ping ? a.ping + ' min' : 'now'}</td><td class="r">${a.score}</td></tr>`; }).join('');
      $$('#ffRows tr', el).forEach((tr) => { const go = () => { sel = ags.find((x) => x.id === tr.dataset.a); rows(); agent(); draw(); }; tr.addEventListener('click', go); tr.addEventListener('keydown', (e) => e.key === 'Enter' && go()); });
    };
    const agent = () => {
      const a = sel, [st, c] = M.AGENT_STATUS[a.status], s = byN.get(a.ac);
      const tl = [['08:55', 'Started duty · location sharing on', 'clock'], ['09:12', `Reached Booth ${a.booth} · inside fence (40 m)`, 'pin'], ['09:31', 'Interview IV-481213 · 9 min · verified', 'checkc'], ['10:02', 'Interview IV-481226 · tone check sent to review', 'chat']];
      if (a.status === 'fence') tl.push(['11:47', `Started an interview 610 m from Booth ${a.booth}`, 'alert']);
      if (a.status === 'mock') tl.push(['11:20', 'Mock-location app found on the phone · 3 interviews held', 'alert']);
      if (a.status === 'offline') tl.push(['11:03', 'Lost network · 6 interviews saved, encrypted', 'wifioff']);
      if (a.status === 'idle') tl.push(['11:10', 'No movement or interviews for 38 minutes', 'clock']);
      $('#ffAgent', el).innerHTML = `<div class="card-h"><div class="who"><span class="av warm">${U.initials(a.name)}</span><div><h3>${esc(a.name)}</h3><p>${a.id} · ${esc(s.name)} · supervisor ${esc(a.supervisor)}</p></div></div><span class="badge ${c === 'muted' ? '' : c}">${esc(st)}</span></div>
        <div class="facts-grid">${[[a.done + '/25', 'Today'], [a.avgMin + ' min', 'Avg length'], [a.score, 'Quality score'], [a.battery + '%', 'Battery'], [a.queued, 'Waiting to sync'], [a.rejected, 'Rejected today']].map(([x, l]) => `<div><b>${x}</b><span>${l}</span></div>`).join('')}</div>
        <div class="dp-sec" style="margin-top:16px"><h4>Today</h4><div class="list">${tl.map(([t, x, i]) => `<div class="li"><span class="ico ${i === 'alert' ? 'bad' : ''}">${ic(i)}</span><span class="t"><b>${esc(x)}</b><small>${t}</small></span></div>`).join('')}</div></div>
        <div class="acts" style="margin-top:12px"><button type="button" class="btn sm" data-t="Calling ${esc(a.name)} on ${esc(a.phone)}">${ic('phone')}Call</button><button type="button" class="btn sm" data-t="Message sent to ${esc(a.name)} in Telugu.">${ic('chat')}Message</button><button type="button" class="btn sm" data-t="Choose a booth on the map to move ${esc(a.name)} there.">${ic('route')}Reassign</button>${['fence', 'mock'].includes(a.status) ? `<button type="button" class="btn sm bad" data-t="${esc(a.name)}'s interviews from today are held until a supervisor reviews them.">${ic('lock')}Hold interviews</button>` : ''}</div>
        <p class="muted" style="font-size:13px;margin:12px 0 0">Location is recorded only between 8 am and 7 pm while the app is open; agents see a sharing badge. Tracks are kept 30 days.</p>`;
      $$('[data-t]', $('#ffAgent', el)).forEach((x) => x.addEventListener('click', () => U.toast(x.dataset.t)));
    };
    svg.addEventListener('click', (e) => { const c = e.target.closest('[data-a]'); if (!c) return; sel = ags.find((x) => x.id === c.dataset.a); rows(); agent(); draw(); });
    U.onSeg(el, '.map-top .seg', (v) => { filter = v; draw(); });
    rows(); agent(); requestAnimationFrame(draw);
    const t = setInterval(() => { if (!document.body.contains(svg)) { clearInterval(t); return; } tick += 1; draw(); }, U.reduced ? 15000 : 3000);
  };

  /* ======================= VERIFICATION ======================= */
  V.verify = function (el) {
    let filter = 'review', sel = M.queue.find((x) => x.status === 'review');
    const st = M.vals({ kind: 'state', id: 0 });
    el.innerHTML = `${V.head('Verification', 'Nine automatic checks on every interview, AI for tone and sarcasm, and a person for anything unsure. Nothing reaches a dashboard until it passes.', `<button type="button" class="btn" data-r="rules">${ic('sliders')}Rules</button>`)}
      <div class="kpis">${V.kpi('Auto-verified today', 'shield', '94.1%', 'passed all nine checks', 'hero')}${V.kpi('Waiting for review', 'eye', M.queue.filter((x) => x.status === 'review').length, 'oldest 2 h 10 min')}${V.kpi('Sarcasm caught', 'chat', IN(st.sarcasm), `${IN(st.review)} sent to people this round`)}${V.kpi('Rejected', 'xc', IN(st.flagged), 'fake, outside fence or repeated voice')}${V.kpi('Back-check calls', 'phone', '10%', '96.4% confirmed the interview')}</div>
      <div class="card lead"><div class="card-h"><div><h3>Verification path · ${esc(M.ROUNDS[M.round].name)}</h3><p>Every interview, from the phone to the dashboard</p></div></div><div class="funnel">${[['Collected', st.iv + st.flagged], ['Passed nine checks', st.iv], ['Tone resolved by AI', st.iv - st.review], ['Back-checked or cleared', Math.round(st.iv * 0.995)], ['On dashboards', Math.round((st.iv * st.verified) / 100)]].map(([l, x], i, arr) => `<div class="fn"><span>${l}</span><span class="track grad"><i style="width:${(x / arr[0][1]) * 100}%;opacity:${1 - i * 0.13}"></i></span><b>${IN(x)}</b></div>`).join('')}</div></div>
      <div class="vq"><div class="card flush"><div class="card-h" style="padding:16px 16px 0">${U.seg('Filter', [['review', 'Needs review'], ['auto', 'Auto-verified'], ['done', 'Decided'], ['all', 'All']], filter)}</div><div class="tbl-wrap"><table class="tbl"><thead><tr><th scope="col">Interview</th><th scope="col">Agent · seat</th><th scope="col">Flags</th><th scope="col" class="r">Length</th></tr></thead><tbody id="vqRows"></tbody></table></div></div><div class="card" id="vqDet"></div></div>`;
    const flagsOf = (q) => M.CHECKS.filter(([k]) => q.checks[k] !== 'pass').map(([k, l]) => `<span class="badge ${q.checks[k] === 'fail' ? 'bad' : 'warn'}">${esc(l)}</span>`).join(' ') || '<span class="badge good">All clear</span>';
    const rows = () => {
      const list = M.queue.filter((q) => filter === 'all' || (filter === 'done' ? ['approved', 'rejected'].includes(q.status) : q.status === filter));
      $('#vqRows', el).innerHTML = list.map((q) => `<tr class="click" data-id="${q.id}" aria-selected="${q === sel}" tabindex="0"><td class="nm"><b>${q.id}</b><small>${q.time} · ${esc(q.say.issue)}</small></td><td class="nm"><b>${esc(q.agent)}</b><small>${esc(byN.get(q.ac).name)} · Booth ${q.booth}</small></td><td style="max-width:280px"><div style="display:flex;flex-wrap:wrap;gap:4px">${q.status === 'approved' ? '<span class="badge good">Approved</span>' : q.status === 'rejected' ? '<span class="badge bad">Rejected</span>' : flagsOf(q)}</div></td><td class="r">${q.len}</td></tr>`).join('') || `<tr><td colspan="4" class="muted" style="padding:24px">Nothing here. Every interview in this view has been decided.</td></tr>`;
      $$('#vqRows tr[data-id]', el).forEach((tr) => { const go = () => { sel = M.queue.find((x) => x.id === tr.dataset.id); rows(); det(); }; tr.addEventListener('click', go); tr.addEventListener('keydown', (e) => e.key === 'Enter' && go()); });
    };
    const det = () => {
      const q = sel, host = $('#vqDet', el); if (!q) { host.innerHTML = '<p class="muted">Choose an interview.</p>'; return; }
      const s = q.say, a = byN.get(q.ac), sarState = s.sar > 0.75 ? 'auto' : s.sar > 0.4 ? 'unsure' : 'genuine';
      const fl = (k, label) => `<div><small><span>${label}</span><span class="tag${q.who.edited.includes(k) ? ' ed' : ''}">${q.who.edited.includes(k) ? 'Edited by agent' : 'AI filled'}</span></small><b>${esc(q.who[k])}</b></div>`;
      host.innerHTML = `<div class="card-h"><div><h3>${q.id}</h3><p>${esc(q.agent)} · ${esc(a.name)} · ${esc(M.unitById(q.unit).name)} · Booth ${q.booth} · ${q.time} · ${q.len}</p></div>${q.status === 'approved' ? '<span class="badge good">Approved</span>' : q.status === 'rejected' ? '<span class="badge bad">Rejected</span>' : q.status === 'auto' ? '<span class="badge good">Auto-verified</span>' : '<span class="badge warn">Needs review</span>'}</div>
        <div class="dp-sec"><h4>Nine checks</h4><div class="checks">${M.CHECKS.map(([k, l, dsc]) => { const r = q.checks[k]; const txt = k === 'fence' ? (r === 'fail' ? `${q.dist} m from the booth` : `${q.dist} m from the booth`) : k === 'length' ? q.len + ' recorded' : dsc; return `<div class="ck ${r}">${ic(r === 'pass' ? 'checkc' : r === 'warn' ? 'alert' : 'xc')}<span><b>${esc(l)}</b><small>${esc(txt)}</small></span></div>`; }).join('')}</div></div>
        <div class="dp-sec"><h4>Open answer · ${esc(s.issue)}</h4><div class="quote"><div class="te" lang="te">${esc(s.te)}</div><div class="en">${esc(s.en)}</div>${U.player(12, hash(q.id) % 50)}</div></div>
        <div class="sar"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap"><b>Tone and sarcasm</b><span class="badge ${sarState === 'auto' ? 'ai' : sarState === 'unsure' ? 'warn' : 'good'}">${sarState === 'auto' ? 'Sarcasm · polarity flipped' : sarState === 'unsure' ? 'Unsure · your call' : 'Genuine'}</span></div>
          <div class="sar-row"><div><small>Words alone say</small><b>${s.literal === 'positive' ? 'Positive' : 'Negative'} about ${esc(s.issue)}</b></div>${ic('arrow')}<div><small>The voter meant</small><b>${s.meant === 'positive' ? 'Positive' : 'Negative'} about ${esc(s.issue)}</b></div></div>
          <div><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><span>Sarcasm confidence</span><b class="num">${Math.round(s.sar * 100)}%</b></div><div class="conf"><i style="width:${s.sar * 100}%"></i><span class="z" style="left:40%"></span><span class="z" style="left:75%"></span></div><div style="display:flex;justify-content:space-between;font-size:12px;color:var(--ink-3);margin-top:4px"><span>Keep as said</span><span>Human review 40–75%</span><span>Flip</span></div></div>
          <ul>${s.cues.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div>
        <div class="dp-sec"><h4><span>Respondent details</span><span class="muted">Personal data stored apart, masked for analysts</span></h4><div class="prof">${fl('name', 'Name')}${fl('age', 'Age')}${fl('gender', 'Gender')}${fl('job', 'Occupation')}${fl('edu', 'Education')}${fl('hh', 'Household size')}</div></div>
        ${['auto', 'review'].includes(q.status) ? `<div class="acts"><button type="button" class="btn primary" data-r="ok">${ic('check')}Approve</button><select class="sel" aria-label="Reason to reject" data-r="why"><option>Outside booth fence</option><option>Too short or rushed</option><option>Same voice as another interview</option><option>No consent heard</option><option>Mock-GPS</option></select><button type="button" class="btn bad" data-r="no">Reject</button><button type="button" class="btn ghost" data-r="call">${ic('phone')}Back-check call</button></div>${sarState === 'unsure' ? `<div class="acts"><span class="muted" style="font-size:13px">Tone decision:</span><button type="button" class="btn sm" data-r="keep">Keep as positive</button><button type="button" class="btn sm" data-r="flip">Mark sarcastic (negative)</button></div>` : ''}` : ''}`;
      const act = (status, msg) => { q.status = status; U.toast(msg); const nx = M.queue.find((x) => x.status === 'review' && x !== q); if (filter === 'review' && nx) sel = nx; rows(); det(); };
      const ok = $('[data-r="ok"]', host); if (ok) ok.addEventListener('click', () => act('approved', `${q.id} approved. It now counts in ${a.name}.`));
      const no = $('[data-r="no"]', host); if (no) no.addEventListener('click', () => act('rejected', `${q.id} rejected: ${$('[data-r="why"]', host).value}. ${q.agent}'s score updated.`));
      const call = $('[data-r="call"]', host); if (call) call.addEventListener('click', () => U.toast('Back-check call added to today’s list. The voter is asked two questions to confirm.'));
      const keep = $('[data-r="keep"]', host); if (keep) keep.addEventListener('click', () => U.toast('Kept as genuine praise. The model learns from your choice.'));
      const flip = $('[data-r="flip"]', host); if (flip) flip.addEventListener('click', () => U.toast('Marked sarcastic. Scored negative on ' + s.issue + ', and the model learns from it.'));
    };
    U.onSeg(el, '.vq .seg', (v) => { filter = v; rows(); });
    $('[data-r="rules"]', el).addEventListener('click', () => S().go('settings'));
    rows(); det();
  };

  /* ======================= USERS AND ROLES ======================= */
  V.users = function (el) {
    let tab = 'users';
    const isAdmin = S().role === 'admin';
    el.innerHTML = `${V.head('Users and roles', 'Add people, give them a role and an area, and they see exactly what that role allows. Every change is logged.', isAdmin ? `<button type="button" class="btn" data-r="bulk">${ic('upload')}Import agents (CSV)</button><button type="button" class="btn primary" data-r="add">${ic('plus')}Add user</button>` : '')}
      <div class="kpis">${['admin', 'command', 'field', 'client'].map((r) => V.kpi(M.ROLES[r].name, r === 'admin' ? 'key' : r === 'command' ? 'laptop' : r === 'field' ? 'phone' : 'crown', r === 'field' ? IN(M.FIELD.agents) : M.users.filter((u) => u.role === r).length, M.ROLES[r].who)).join('')}</div>
      <div class="card flush"><div style="padding:14px 16px 0" class="dp-tabs" role="tablist" aria-label="Users and roles"><button type="button" role="tab" data-v="users" aria-selected="true">People</button><button type="button" role="tab" data-v="perm" aria-selected="false" tabindex="-1">What each role can do</button><button type="button" role="tab" data-v="log" aria-selected="false" tabindex="-1">Access log</button></div><div id="usBody"></div></div>`;
    const body = $('#usBody', el);
    const draw = () => {
      if (tab === 'users') {
        body.innerHTML = `<div class="tbl-wrap"><table class="tbl"><thead><tr><th scope="col">Person</th><th scope="col">Role</th><th scope="col">Area they can see</th><th scope="col">Status</th><th scope="col">Last active</th><th scope="col"><span class="sr">Actions</span></th></tr></thead><tbody>${M.users.map((u) => `<tr><td><div class="who"><span class="av">${U.initials(u.name)}</span><span class="nm"><b>${esc(u.name)}</b><small>${esc(u.phone)}${u.mfa ? ' · 2-step sign-in' : ' · PIN on device'}</small></span></div></td><td><b style="font-weight:600">${esc(M.ROLES[u.role].name)}</b>${u.sub ? `<br><small class="muted">${esc(u.sub)}</small>` : ''}</td><td>${esc(u.scope)}</td><td><span class="badge ${u.status === 'Active' ? 'good' : u.status === 'Invited' ? 'accent' : 'bad'}">${esc(u.status)}</span></td><td class="muted">${esc(u.last)}</td><td class="r">${isAdmin ? `<button type="button" class="btn sm ghost" data-ed="${u.id}">${ic('edit')}Edit</button>` : ''}</td></tr>`).join('')}</tbody></table></div><p class="muted" style="padding:0 16px 16px;margin:0;font-size:13px">Showing 14 of ${IN(M.FIELD.agents + 14)} people. Field surveyors are usually imported in bulk from the agency roster.</p>`;
        $$('[data-ed]', body).forEach((b) => b.addEventListener('click', () => editUser(M.users.find((u) => u.id === b.dataset.ed))));
      } else if (tab === 'perm') {
        const lv = (n) => `<span class="perm p${n}">${n === 2 ? 'Full' : n === 1 ? 'View' : '—'}</span>`;
        body.innerHTML = `<div class="tbl-wrap"><table class="tbl"><thead><tr><th scope="col">Module</th>${['admin', 'command', 'field', 'client'].map((r) => `<th scope="col">${M.ROLES[r].name}</th>`).join('')}</tr></thead><tbody>${M.PERMS.map((p, i) => `<tr><td>${esc(p[0])}</td>${[2, 3, 4, 5].map((j) => `<td>${isAdmin && j > 2 ? `<button type="button" class="btn sm ghost" data-pi="${i}" data-pj="${j}" aria-label="Change ${esc(p[0])} for ${esc(Object.values(M.ROLES)[j - 2].name)}">${lv(p[j])}</button>` : lv(p[j])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
          <div class="acts" style="padding:0 16px 16px"><span class="muted" style="font-size:13px">See the product as:</span>${['admin', 'command', 'field'].map((r) => `<button type="button" class="btn sm" data-as="${r}">${M.ROLES[r].name}</button>`).join('')}<a class="btn sm" href="portal.html">Client viewer</a></div>`;
        $$('[data-pi]', body).forEach((b) => b.addEventListener('click', () => { const p = M.PERMS[+b.dataset.pi], j = +b.dataset.pj; p[j] = (p[j] + 1) % 3; draw(); U.toast(`${Object.values(M.ROLES)[j - 2].name} now has ${p[j] === 2 ? 'full' : p[j] === 1 ? 'view' : 'no'} access to ${p[0]}.`); }));
        $$('[data-as]', body).forEach((b) => b.addEventListener('click', () => { const s = $('#roleSel'); s.value = b.dataset.as; s.dispatchEvent(new Event('change')); }));
      } else {
        const log = [['Arjun Rao', 'Added Vasanth Kumar as Command Center · Supervisor (Visakhapatnam, Anakapalli)', '09:42'], ['Arjun Rao', 'Suspended Kiran B. (FA-2428) after 3 rejected interviews', 'Yesterday 18:10'], ['Meera Iyer', 'Gave Client viewer access to Campaign office, Guntur (Guntur district only)', 'Yesterday 11:05'], ['System', 'Signed out 4 idle Command Center sessions after 30 minutes', 'Yesterday 02:00'], ['Prakash Reddy', 'Downloaded District brief: Guntur (PDF)', 'Nov 2, 16:22'], ['Meera Iyer', 'Changed back-check calls from 8% to 10%', 'Nov 1, 10:15']];
        body.innerHTML = `<div class="list" style="padding:6px 16px 16px">${log.map(([w, t, at]) => `<div class="li"><span class="av">${U.initials(w)}</span><span class="t"><b>${esc(t)}</b><small>${esc(w)} · ${esc(at)}</small></span></div>`).join('')}</div>`;
      }
    };
    U.tablist($('.dp-tabs', el), (v) => { tab = v; draw(); });
    draw();
    function editUser(u) {
      const isNew = !u; u = u || { name: '', role: 'field', sub: '', scope: 'Guntur district', status: 'Invited', last: 'Never', phone: '', mfa: false };
      const scopes = ['Whole state', ...DISTS.map((d) => d.name + ' district'), 'Guntur West · Booth 112'];
      const d = U.dialog({ title: isNew ? 'Add a user' : 'Edit ' + u.name, sub: 'They get an SMS invite and sign in with a PIN (Field App) or 2-step sign-in (web).',
        body: `<label class="fld"><span>Full name</span><input class="inp" id="uName" value="${esc(u.name)}" aria-describedby="uErr"><small class="err" id="uErr" hidden>Enter the person’s name.</small></label>
          <label class="fld"><span>Mobile number</span><input class="inp" id="uPh" inputmode="tel" placeholder="+91 98xxx xxxxx" value="${esc(u.phone.includes('•') ? '' : u.phone)}" aria-describedby="uPhErr"><small class="err" id="uPhErr" hidden>Use a 10-digit Indian mobile number, for example 98480 12345.</small></label>
          <div class="fld"><span>Role</span><div class="opt-grid">${[['admin', 'Admin', 'Everything, incl. users and costs'], ['command', 'Command Center', 'Run the field, verify, analyse'], ['field', 'Field Surveyor', 'Field App, own interviews'], ['client', 'Client viewer', 'Client Portal, read only']].map(([k, l, s]) => `<label class="chk"><input type="radio" name="urole" value="${k}"${u.role === k ? ' checked' : ''}><span><b style="display:block;font-weight:600">${l}</b><small class="muted">${s}</small></span></label>`).join('')}</div></div>
          <label class="fld" id="uSubW"><span>Job inside Command Center</span><select class="sel" id="uSub"><option${u.sub === 'Supervisor' ? ' selected' : ''}>Supervisor</option><option${u.sub === 'Analyst' ? ' selected' : ''}>Analyst</option></select></label>
          <label class="fld"><span>Area they can see</span><select class="sel" id="uScope">${scopes.map((s) => `<option${s === u.scope ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select></label>`,
        foot: `${!isNew ? `<button type="button" class="btn ghost bad" data-r="sus">${u.status === 'Suspended' ? 'Reactivate' : 'Suspend'}</button>` : ''}<button type="button" class="btn ghost" data-close>Cancel</button><button type="button" class="btn primary" data-r="save">${isNew ? 'Send invite' : 'Save'}</button>` });
      const syncSub = () => { $('#uSubW', d).hidden = $('[name="urole"]:checked', d).value !== 'command'; };
      $$('[name="urole"]', d).forEach((x) => x.addEventListener('change', syncSub)); syncSub();
      const sus = $('[data-r="sus"]', d); if (sus) sus.addEventListener('click', () => { u.status = u.status === 'Suspended' ? 'Active' : 'Suspended'; d.close(); draw(); U.toast(`${u.name} is ${u.status.toLowerCase()}.`); });
      $('[data-r="save"]', d).addEventListener('click', () => {
        const nm = $('#uName', d), ph = $('#uPh', d); let bad = false;
        nm.setAttribute('aria-invalid', String(!nm.value.trim())); $('#uErr', d).hidden = !!nm.value.trim(); if (!nm.value.trim()) bad = true;
        const digits = ph.value.replace(/\D/g, '').replace(/^91/, '');
        const phBad = isNew ? !/^[6-9]\d{9}$/.test(digits) : ph.value && !/^[6-9]\d{9}$/.test(digits);
        ph.setAttribute('aria-invalid', String(!!phBad)); $('#uPhErr', d).hidden = !phBad; if (phBad) bad = true;
        if (bad) { (nm.value.trim() ? ph : nm).focus(); return; }
        Object.assign(u, { name: nm.value.trim(), role: $('[name="urole"]:checked', d).value, scope: $('#uScope', d).value });
        u.sub = u.role === 'command' ? $('#uSub', d).value : '';
        if (digits) u.phone = '+91 ' + digits.slice(0, 5) + ' ••• ' + digits.slice(-2);
        if (isNew) { u.id = 'U' + (200 + M.users.length); u.mfa = u.role !== 'field'; M.users.unshift(u); }
        d.close(); draw(); U.toast(isNew ? `Invite sent to ${u.name}. They can sign in as ${M.ROLES[u.role].name}.` : `${u.name} updated.`);
      });
    }
    const add = $('[data-r="add"]', el); if (add) add.addEventListener('click', () => editUser(null));
    const bulk = $('[data-r="bulk"]', el); if (bulk) bulk.addEventListener('click', () => U.toast('Upload a CSV with name, mobile, district and booth. Each agent gets a PIN by SMS.'));
  };

  /* ======================= SETTINGS AND AUDIT ======================= */
  V.settings = function (el) {
    const rows = [
      ['Election silence', 'Hide results from clients 48 hours before polling (RP Act Section 126). Field work continues.', 'sil', !!M.silence],
      ['Auto-delete voice clips', 'Raw voice is deleted 90 days after the round closes; transcripts stay, anonymised.', 'del', true],
      ['Mask personal details for analysts', 'Names and phone numbers are visible only to Admins and the back-check team.', 'mask', true],
      ['Hold interviews from flagged phones', 'Mock-GPS or rooted devices: interviews wait for a supervisor.', 'hold', true],
      ['Location only during duty hours', 'Agents are tracked 8 am to 7 pm while the app is open, never after.', 'duty', true],
    ];
    el.innerHTML = `${V.head('Settings and audit', 'Compliance, verification rules and data retention. Changes need an Admin and are logged.')}
      <div class="grid g2"><div class="card"><div class="card-h"><h3>Compliance and privacy</h3><span class="badge">DPDP Act 2023</span></div><div class="list">${rows.map(([t, s, k, on]) => `<div class="li"><span class="t"><b>${t}</b><small style="white-space:normal">${s}</small></span><button type="button" class="switch" role="switch" aria-checked="${on}" aria-label="${esc(t)}" data-k="${k}"></button></div>`).join('')}</div></div>
      <div class="card"><div class="card-h"><h3>Verification rules</h3><span class="badge">Applies to new interviews</span></div><div class="grid" style="gap:14px">${[['Booth fence radius', 250, 100, 500, ' m'], ['Shortest valid interview', 6, 3, 12, ' min'], ['Back-check calls', 10, 0, 25, '%'], ['Same-voice match threshold', 92, 80, 99, '%'], ['Flip tone automatically above', 75, 60, 95, '%'], ['Send tone to a person above', 40, 20, 60, '%']].map(([l, v, a, b, u], i) => `<label class="fld"><span>${l}: <b class="num" id="rg${i}">${v}${u}</b></span><input type="range" min="${a}" max="${b}" value="${v}" data-o="rg${i}" data-u="${u}" style="accent-color:var(--warm)"></label>`).join('')}</div></div></div>
      <div class="card"><div class="card-h"><h3>Audit log</h3><button type="button" class="btn sm" data-r="exp">${ic('download')}Export log</button></div><div class="list">${[['Meera Iyer', 'Changed back-check calls from 8% to 10%', 'Nov 1, 10:15'], ['System', 'Deleted 14,220 Round 1 voice clips (90-day rule)', 'Oct 29, 02:00'], ['Arjun Rao', 'Turned on election silence for the Tirupati by-election seats', 'Oct 12, 18:00'], ['Prakash Reddy', 'Rejected 3 interviews from FA-2526 (mock-GPS)', 'Today, 11:24'], ['Priya Menon', 'Approved round note: Guntur district', 'Today, 10:02']].map(([w, t, at]) => `<div class="li"><span class="av">${U.initials(w)}</span><span class="t"><b>${esc(t)}</b><small>${esc(w)} · ${esc(at)}</small></span></div>`).join('')}</div></div>`;
    $$('.switch', el).forEach((s) => s.addEventListener('click', () => { const on = s.getAttribute('aria-checked') !== 'true'; s.setAttribute('aria-checked', String(on)); if (s.dataset.k === 'sil') M.silence = on; U.toast(`${s.getAttribute('aria-label')} ${on ? 'on' : 'off'}. Logged.`); }));
    $$('input[type=range]', el).forEach((r) => r.addEventListener('input', () => { $('#' + r.dataset.o, el).textContent = r.value + r.dataset.u; }));
    $('[data-r="exp"]', el).addEventListener('click', () => U.download('audit-log.csv', '﻿Who,What,When\r\nMeera Iyer,Changed back-check calls from 8% to 10%,"Nov 1, 10:15"\r\nSystem,Deleted 14220 Round 1 voice clips (90-day rule),"Oct 29, 02:00"\r\n', 'text/csv'));
  };
})();
