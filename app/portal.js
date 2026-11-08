/* Political Intelligence Platform · Client Portal
   For the strategist: today's read, where the race is decided, ruling vs opposition, voices,
   the map, an analyst to ask, and reports to download. Read only. Phone first. */
(function () {
  'use strict';
  const PI = window.PI, M = window.M, U = window.U;
  const { ACS, DISTS, byN } = PI;
  const { $, $$, ic, esc, IN, p0, f1, sg } = U;
  const TABS = [['today', 'Today', 'home'], ['map', 'Map', 'map'], ['seats', 'Seats', 'pin'], ['voices', 'Voices', 'chat'], ['ask', 'Ask', 'spark'], ['reports', 'Reports', 'download']];
  let tab = (location.hash.slice(1) && TABS.some(([k]) => k === location.hash.slice(1))) ? location.hash.slice(1) : 'today';
  const root = $('#portal');
  root.innerHTML = `<header class="pt-top"><a class="brand" href="index.html"><svg aria-hidden="true"><use href="#logo"/></svg><span><b>Political Intelligence</b><small>Client Portal</small></span></a>
      <nav class="pt-tabs" aria-label="Portal">${TABS.map(([k, l, i]) => `<a href="#${k}" data-t="${k}">${ic(i)}<span>${l}</span></a>`).join('')}</nav>
      <div class="acts"><label class="sr" for="ptRound">Round</label><select class="sel hide-s" id="ptRound">${M.ROUNDS.filter((r) => r.state === 'closed').map((r) => `<option value="${r.id}"${r.id === M.round ? ' selected' : ''}>${r.name}</option>`).join('')}</select><button type="button" class="btn icon" id="ptTheme" aria-label="Switch theme">${ic('sun')}</button><span class="av warm" title="Strategy desk">SD</span></div></header>
    <main class="pt-page" id="ptPage" tabindex="-1"></main>`;
  const page = $('#ptPage');

  const st = { kind: 'state', id: 0 };
  function today() {
    const v = M.vals(st), p = M.vals(st, M.round - 1), n = M.note(st);
    const toss = ACS.map((a) => ({ a, v: M.vals({ kind: 'ac', id: a.n }) })).filter((x) => x.v.cls === 'Toss-up').sort((x, y) => x.v.margin - y.v.margin);
    const movers = DISTS.map((d) => { const x = M.vals({ kind: 'district', id: d.id }), y = M.vals({ kind: 'district', id: d.id }, M.round - 1); return { d, x, sw: (x.A - y.A) - (x.B - y.B) }; }).sort((a, b) => b.sw - a.sw);
    page.innerHTML = `<section class="pt-hero"><span class="pt-orb" aria-hidden="true"></span><span class="pt-glow" aria-hidden="true"></span>
        <div class="pt-hero-in"><span class="badge pt-pill">${esc(M.ROUNDS[M.round].name)} · ${esc(M.ROUNDS[M.round].dates)} · approved</span>
          <h1>${v.margin < 1 ? 'Neck and neck.' : `${M.PARTY[v.lead].name} ahead.`}<br><span class="pt-grad">${v.seats['Toss-up']} seats decide it.</span></h1>
          <p>${esc(n.summary)}</p>
          <div class="pt-nums">
            <div><span>Party A · ruling</span><b>${p0(v.A)}</b><em>${sg(v.A - p.A)} pts</em></div>
            <div><span>Party B · opposition</span><b>${p0(v.B)}</b><em>${sg(v.B - p.B)} pts</em></div>
            <div><span>Seats · Party A</span><b>${v.seats.lo.A}–${v.seats.hi.A}</b><em>of 175</em></div>
            <div><span>Seats · Party B</span><b>${v.seats.lo.B}–${v.seats.hi.B}</b><em>of 175</em></div>
          </div>
          <small class="pt-meta">n = ${IN(v.iv)} verified interviews · ${U.moe(v.iv)} · weighted to the voter roll · demo data</small></div></section>
      <div class="grid g3">
        <div class="card pt-warm"><span class="k">${ic('gauge')}Government approval</span><b>${p0(v.gov)}</b><span class="d">${sg(v.gov - p.gov)} pts since ${esc(M.ROUNDS[M.round - 1].short)}</span>${M.meter('Anti-incumbency index', Math.round(v.anti) + ' / 100')}</div>
        <div class="card"><div class="card-h"><div><h3>Leaders</h3><p>Rated good or very good</p></div></div>${M.h2h([['Chief Minister vs opposition leader', v.cm, v.opp], ['Trusted on jobs', M.cuts(st).trust[0][1], M.cuts(st).trust[0][2]]])}</div>
        <div class="card"><div class="card-h"><div><h3>Biggest problems</h3><p>Named by voters, in their words</p></div></div>${U.bars(v.iss.slice(0, 4).map(([k, x]) => ({ l: k, v: x, d: (p.iss.find(([kk]) => kk === k) || [0, x])[1] ? x - (p.iss.find(([kk]) => kk === k) || [0, x])[1] : null })), { max: 40 })}</div>
      </div>
      <div class="grid g-64">
        <div class="card"><div class="card-h"><div><h3>Where it is being decided</h3><p>Closest seats this round · tap one for its brief</p></div><a class="btn sm" href="#seats">All ${toss.length}</a></div><div class="kids">${toss.slice(0, 8).map((x) => `<button type="button" class="kid" data-ac="${x.a.n}"><span class="nm"><b>${esc(x.a.name)}</b><small>${esc(DISTS[x.a.dist - 1].name)} · ${M.SEAT_KIND[M.seatKind(x.a)]}</small></span><span class="mini" aria-hidden="true"><i style="flex:${x.v.A};background:${U.pc('A')}"></i><i style="flex:${x.v.B};background:${U.pc('B')}"></i></span><span class="v">${M.lead(x.v)}</span>${ic('chevr')}</button>`).join('')}</div></div>
        <div class="grid" style="align-content:start"><div class="card"><div class="card-h"><div><h3>Moving districts</h3><p>Change in the A–B gap since ${esc(M.ROUNDS[M.round - 1].short)}</p></div></div><div class="list">${[...movers.slice(0, 2), ...movers.slice(-2).reverse()].map((m) => `<div class="li"><span class="ico ${m.sw > 0 ? 'warm' : 'ai'}">${ic('trend')}</span><span class="t"><b>${esc(m.d.name)}</b><small>${m.sw > 0 ? 'Towards Party A' : 'Towards Party B'} · now ${M.PARTY[m.x.lead].name} +${f1(m.x.margin)}</small></span><b class="num">${sg(Math.abs(m.sw))}</b></div>`).join('')}</div></div>
          <div class="card pt-ask"><span class="orb" aria-hidden="true"></span><div><h3>Ask the analyst</h3><p>“Where is the opposition gaining?”</p></div><a class="btn primary sm" href="#ask">Ask</a></div></div>
      </div>
      <div class="card"><div class="card-h"><div><h3>Voices from this round</h3><p>Verified clips, translated from Telugu. Sarcasm is caught and scored by what was meant.</p></div><a class="btn sm" href="#voices">More voices</a></div><div class="grid g3">${M.SAYINGS.slice(0, 3).map((s, i) => voice(s, i)).join('')}</div></div>`;
    $$('[data-ac]', page).forEach((b) => b.addEventListener('click', () => { location.hash = 'map'; setTimeout(() => window.__ptMap && window.__ptMap.go({ kind: 'ac', id: +b.dataset.ac }), 60); }));
  }
  const voice = (s, i) => `<div class="quote"><div class="te" lang="te">${esc(s.te)}</div><div class="en">${esc(s.en)}</div><div class="meta"><span class="badge">${esc(s.issue)}</span>${s.sar > 0.75 ? '<span class="badge ai">Sarcasm · counted as negative</span>' : s.sar > 0.4 ? '<span class="badge warn">Tone checked by a reviewer</span>' : '<span class="badge good">Genuine</span>'}</div>${U.player(9 + i * 2, 30 + i)}</div>`;

  function map() {
    page.innerHTML = `<div class="page-h"><div><h2>Map</h2><p>Open any district, seat, mandal, corporation or municipality on its own.</p></div></div><div class="mapx"><div class="card map-card" id="ptMap"></div><aside class="card dp" id="ptPanel" aria-label="Area details"></aside></div>`;
    const panel = M.Panel($('#ptPanel', page), { en: st, canEdit: false, onPick: (en) => m.go(en) });
    const m = M.MapX($('#ptMap', page), { uid: 'pt', level: 'district', onFocus: (en) => panel.show(en), onBooth: (b) => panel.booth(b) });
    window.__ptMap = m;
  }
  function seats() {
    let filt = 'Toss-up';
    page.innerHTML = `<div class="page-h"><div><h2>Seats</h2><p>Every seat with its call. Toss-ups are inside the margin of error.</p></div>${U.seg('Call', [['Toss-up', 'Toss-up'], ['Lean', 'Lean'], ['Safe', 'Safe'], ['all', 'All 175']], filt)}</div><div class="card flush"><div class="tbl-wrap"><table class="tbl"><thead><tr><th scope="col">Seat</th><th scope="col">District</th><th scope="col">Type</th><th scope="col">Lead</th><th scope="col" class="r">A</th><th scope="col" class="r">B</th><th scope="col" class="r">n</th></tr></thead><tbody id="ptSeats"></tbody></table></div></div>`;
    const draw = () => { $('#ptSeats', page).innerHTML = ACS.map((a) => ({ a, v: M.vals({ kind: 'ac', id: a.n }) })).filter((x) => filt === 'all' || x.v.cls === filt).sort((x, y) => x.v.margin - y.v.margin).map((x) => `<tr class="click" data-ac="${x.a.n}" tabindex="0"><td class="nm"><b>${esc(x.a.name)}</b><small>#${x.a.n}${x.a.type !== 'GEN' ? ' · ' + x.a.type : ''}</small></td><td>${esc(DISTS[x.a.dist - 1].name)}</td><td>${M.SEAT_KIND[M.seatKind(x.a)]}</td><td><span class="dot" style="background:${U.pc(x.v.lead)}"></span> ${M.PARTY[x.v.lead].name} +${f1(x.v.margin)} <span class="badge${x.v.cls === 'Toss-up' ? ' accent' : ''}">${x.v.cls}</span></td><td class="r">${p0(x.v.A)}</td><td class="r">${p0(x.v.B)}</td><td class="r">${IN(x.v.iv)}</td></tr>`).join('');
      $$('#ptSeats tr', page).forEach((tr) => { const go = () => { location.hash = 'map'; setTimeout(() => window.__ptMap && window.__ptMap.go({ kind: 'ac', id: +tr.dataset.ac }), 60); }; tr.addEventListener('click', go); tr.addEventListener('keydown', (e) => e.key === 'Enter' && go()); }); };
    U.onSeg(page, '.seg', (x) => { filt = x; draw(); }); draw();
  }
  function voices() {
    page.innerHTML = `<div class="page-h"><div><h2>Voices</h2><p>Real answers from this round, verified and translated. Names are never shown.</p></div></div><div class="grid g3">${M.SAYINGS.map((s, i) => voice(s, i)).join('')}</div>
      <div class="card"><div class="card-h"><div><h3>How we read tone</h3><p>Why the numbers don’t count sarcasm as praise</p></div></div><div class="grid g3">${[['Words', 'Praise words next to a complaint, or a claim followed by a challenge.'], ['Voice', 'Flat or drawn-out tone, a laugh, a pause before the second half.'], ['Context', 'The voter’s own ratings and the area’s top issues. Unsure clips go to a Telugu-speaking reviewer.']].map(([t, s]) => `<div><b style="display:block;margin-bottom:4px">${t}</b><span class="muted">${s}</span></div>`).join('')}</div></div>`;
  }
  function ask() {
    page.innerHTML = `<div class="pt-askpage"><span class="orb big" aria-hidden="true"></span><h2>Ask the analyst</h2><p>English or Telugu. Every answer shows its sample and margin.</p><form class="chat-in" id="ptAsk" style="border:0;padding:0;width:100%;max-width:640px"><label class="sr" for="ptQ">Question</label><input class="inp" id="ptQ" placeholder="How is the ruling party doing in Guntur?"><button class="btn primary" type="submit">${ic('send')}Ask</button></form><div class="sugg" style="max-width:640px;width:100%;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">${['Which seats are toss-ups?', 'Where is the opposition gaining?', 'What do women think?', 'Summarise Tenali Municipality'].map((q) => `<button type="button">${ic('spark')}${q}</button>`).join('')}</div><div id="ptAns" style="width:100%;max-width:760px" aria-live="polite"></div></div>`;
    const run = (q) => { if (!q.trim()) { $('#ptQ', page).focus(); return; } const a = M.ask(q); $('#ptAns', page).innerHTML = `<div class="card msg-a"><div class="meta"><span class="badge ai">n = ${IN(a.n)}</span><span class="badge">${U.moe(a.n)}</span></div><div class="txt">${a.text}</div>${a.cards && a.cards.length ? `<div class="cards">${a.cards.map(([b, s]) => `<div><b>${b}</b><span>${esc(s)}</span></div>`).join('')}</div>` : ''}${a.quote ? voice(a.quote, 1) : ''}</div>`; };
    $('#ptAsk', page).addEventListener('submit', (e) => { e.preventDefault(); run($('#ptQ', page).value); });
    $$('.sugg button', page).forEach((b) => b.addEventListener('click', () => { $('#ptQ', page).value = b.textContent.trim(); run(b.textContent.trim()); }));
  }
  function reports() {
    const list = [['state', st, 'State summary', 'All 175 seats, seat ranges, districts that decide it'], ['ro', st, 'Ruling vs opposition', 'Approval, leaders, anti-incumbency, trust on issues'], ['district', { kind: 'district', id: 15 }, 'District brief · Guntur', 'Seats, mandals, corporations and the round note'], ['ac', { kind: 'ac', id: 94 }, 'Seat deep-dive · Guntur West', 'A toss-up seat end to end'], ['notes', st, 'Round notes pack', 'Approved notes for the state and every district'], ['issues', st, 'Issues and voices', 'What voters named and how they said it']];
    page.innerHTML = `<div class="page-h"><div><h2>Reports</h2><p>Shared with you by the research team. PDF to read and forward, CSV for your own analysis.</p></div></div><div class="grid g3">${list.map(([t, en, n, d], i) => `<div class="card pt-rep"><span class="ico warm">${ic('file')}</span><div><h3>${esc(n)}</h3><p>${esc(d)}</p><small class="muted">${esc(M.ROUNDS[M.round].name)} · shared Nov 3</small></div><div class="acts"><button type="button" class="btn sm primary" data-i="${i}" data-f="pdf">${ic('download')}PDF</button>${t !== 'notes' ? `<button type="button" class="btn sm" data-i="${i}" data-f="csv">CSV</button>` : ''}</div></div>`).join('')}</div>`;
    $$('[data-i]', page).forEach((b) => b.addEventListener('click', () => { const [t, en] = list[+b.dataset.i]; M.exportReport({ type: t, en, format: b.dataset.f }); }));
  }
  const VIEWS = { today, map, seats, voices, ask, reports };
  function route() {
    tab = TABS.some(([k]) => k === location.hash.slice(1)) ? location.hash.slice(1) : 'today';
    $$('.pt-tabs a', root).forEach((a) => (a.dataset.t === tab ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    if (M.silence) { page.innerHTML = `<div class="locked-page">${ic('lock')}<h2>Election silence</h2><p class="muted">Results are paused 48 hours before polling (RP Act Section 126). They return when polling ends.</p></div>`; return; }
    page.classList.toggle('tall', tab === 'map');
    VIEWS[tab](); window.scrollTo(0, 0);
    document.title = `${TABS.find(([k]) => k === tab)[1]} · Client Portal · Political Intelligence Platform`;
  }
  window.addEventListener('hashchange', route);
  $('#ptRound').addEventListener('change', (e) => { M.round = +e.target.value; route(); });
  const tb = $('#ptTheme'); const sync = () => { const t = document.documentElement.dataset.theme; tb.innerHTML = ic(t === 'dark' ? 'sun' : 'moon'); tb.setAttribute('aria-label', `Switch to ${t === 'dark' ? 'light' : 'dark'} theme`); };
  tb.addEventListener('click', () => { U.theme.set(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); sync(); if (tab !== 'map') route(); });
  sync(); route();
})();
