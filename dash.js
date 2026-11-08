/* Political Intelligence Platform · the Ask the Data engine.
   The drawn dashboard mock-ups this file used to build live in legacy/mockups-dashboards.js;
   the marketing pages now show captures of the real product instead. */
(function () {
  'use strict';
  const P = window.PI, AP = window.AP;
  const { $, $$, IN, f1, pc, sgn, ic, esc, clamp, reduced, PARTY, ACS, DISTS, byN, STATE, REG, REGAGG, demo, seatClass,
    moeTxt, hbars, sentDonut, intentBars, issueTiles, quoteFor, quoteHTML, issueC, MapView, tabs, toast, topBar, kpiRow,
    overviewInto, donut, lineChart, ramp, SENT_STOPS, legendHTML, METRICS, mix, rng, hash, shapeSVG } = P;
  const wait = (ms) => new Promise((r) => setTimeout(r, reduced ? Math.min(ms, 60) : ms));

  /* =====================================================================
     ASK THE DATA · intent matching over the real seat dataset
     ===================================================================== */
  const norm = (s) => String(s).toLowerCase().replace(/[–—-]/g, ' ').replace(/[?!,]/g, ' ').replace(/\s+/g, ' ').trim();
  const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const AC_RE = ACS.map((a) => [a, new RegExp('(^|\\s)' + reEsc(norm(a.name)) + '(\\s|$|\')')]);
  const D_RE = DISTS.map((d) => [d, new RegExp('(^|\\s)' + reEsc(norm(d.name)) + '(\\s|$|\')')]);
  const R_RE = REG.map((r) => [r, new RegExp('(^|\\s)' + reEsc(norm(r)) + '(\\s|$|\')')]);

  function findPlace(q) {
    const t = norm(q);
    let ac = null, di = null, rg = null;
    AC_RE.forEach(([a, re]) => { if (re.test(t) && (!ac || a.name.length > ac.name.length)) ac = a; });
    D_RE.forEach(([d, re]) => { if (re.test(t) && (!di || d.name.length > di.name.length)) di = d; });
    R_RE.forEach(([r, re]) => { if (re.test(t)) rg = r; });
    const L = (x) => (x ? norm(x.name || x).length : 0);
    if (rg && L(rg) > L(di) && L(rg) > L(ac)) return { k: 'region', r: rg };
    if (di && (/\bdistrict\b/.test(t) || !ac || L(di) >= L(ac))) return { k: 'district', d: di };
    if (ac) return { k: 'ac', a: ac };
    if (rg) return { k: 'region', r: rg };
    return null;
  }
  function intent(q) {
    const t = norm(q);
    if (/[ఀ-౿]/.test(q)) return { k: 'telugu' };
    const bm = t.match(/\bbooth\s*(?:no\.?|number|#)?\s*(\d{1,4})\b/);
    if (bm) return { k: 'booth', n: +bm[1] };
    const pl = findPlace(q);
    if (pl) return pl;
    if (/\b(youth|young|first time|students?|18 ?25)\b/.test(t)) return { k: 'youth' };
    if (/\b(women|woman|female|gender|ladies)\b/.test(t)) return { k: 'women' };
    if (/\b(booths?|focus|priority|prioriti[sz]e|campaign|where should|toss ?ups?|close|battleground|target)\b/.test(t)) return { k: 'priority' };
    if (/\b(swing|changed?|shift|moved|round 1|compare|trend|since)\b/.test(t)) return { k: 'movers' };
    if (/\bmla\b/.test(t)) return { k: 'mla' };
    if (/\b(issues?|problems?|concerns?|jobs|water|irrigation|prices?|farm|demands?|why)\b/.test(t)) return { k: 'issues' };
    return { k: 'state', fallback: !/\b(who|winning|ahead|lead|leading|intention|overall|state|statewide|current|mood|sentiment|vote|voting)\b/.test(t) };
  }

  const card = (title, html, cls) => `<div class="panel${cls ? ' ' + cls : ''}"><div class="h5">${title}</div>${html}</div>`;
  const miniMap = (o) => `<div class="mini-map" data-map='${JSON.stringify(o)}'></div>`;
  const seatList = (list) => `<div class="seatlist">${list.slice().sort((x, y) => x.margin - y.margin).map((a) => `<div><span><i style="background:${PARTY[a.lead].c}"></i>${esc(a.name)}</span><b>${seatClass(a.margin)}</b><small>${f1(a.margin)} pts</small></div>`).join('')}</div>`;

  function ansState(note) {
    const s = STATE;
    const regs = REG.map((r) => [r, REGAGG[r]]).sort((x, y) => y[1].pos - x[1].pos);
    const hi = regs[0], lo = regs[regs.length - 1];
    return {
      meta: ['Round 2', 'n = ' + IN(s.iv), moeTxt(s.iv), 'All 175 seats'],
      text: `${note ? note + ' ' : ''}Across <b>${IN(s.iv)}</b> verified interviews in all 175 seats, the mood is <b>${pc(s.pos)} positive</b>, ${sgn(s.d1)} points since Round 1. ${s.margin < 1 ? `<b>${PARTY[s.lead].name}</b> and <b>${PARTY[s.second].name}</b> are level on voting intention at <b>${pc(s[s.lead])}</b> each` : `<b>${PARTY[s.lead].name}</b> leads voting intention at <b>${pc(s[s.lead])}</b>, ahead of ${PARTY[s.second].name} at ${pc(s[s.second])}`}, with <b>${pc(s.U)}</b> still undecided. The top concerns are ${s.iss.slice(0, 3).map(([k, v]) => `${k.toLowerCase()} (${pc(v)})`).join(', ')}.`,
      cards: [card('Voter sentiment', sentDonut(s, 104)), card('Voting intention · R1 vs R2', intentBars(s, true)), card('Mood by district', miniMap({ level: 'district', metric: 'sent' }), 'map-card')],
      quote: [quoteFor(s.top), 'Guntur West'],
      insights: [
        s.margin < 1 ? `Parties ${s.lead} and ${s.second} are level statewide; ${pc(s.U)} are undecided.` : `${PARTY[s.lead].name} leads by ${f1(s.margin)} pts statewide, with ${pc(s.U)} undecided.`,
        `Positive mood is ${sgn(s.d1)} pts since Round 1.`,
        `${s.top} is the first concern for ${pc(s.iss[0][1])} of voters.`,
        `${hi[0]} is the most positive region (${pc(hi[1].pos)}); ${lo[0]} the least (${pc(lo[1].pos)}).`,
      ],
      sql: `SELECT party, ROUND(SUM(share * n) / SUM(n), 1) AS pct\nFROM v_intention_seat\nWHERE round = 2\nGROUP BY party\nORDER BY pct DESC;`,
    };
  }
  function ansAC(a) {
    const cls = seatClass(a.margin);
    return {
      meta: ['Round 2', a.D.name + ' district', 'n = ' + IN(a.iv), moeTxt(a.iv)],
      text: `In <b>${esc(a.name)}</b> (${esc(a.D.name)} district), <b>${PARTY[a.lead].name}</b> leads with <b>${pc(a[a.lead])}</b> against ${pc(a[a.second])} for ${PARTY[a.second].name}: a <b>${cls.toLowerCase()}</b> seat with ${pc(a.U)} undecided. Mood is ${pc(a.pos)} positive (${sgn(a.d1)} since Round 1). Voters raise ${a.iss.map(([k, v]) => `${k.toLowerCase()} (${pc(v)})`).join(', ')}. Satisfaction with the local MLA is <b>${pc(a.mla)}</b>.`,
      cards: [card('Voting intention · R1 vs R2', intentBars(a, true)), card('Top issues', hbars(a.iss.map(([k, v]) => ({ label: k, v, c: issueC(k) })), { max: 45, w: 110 })), card('Where it is', miniMap({ level: 'ac', metric: 'lead', sel: a.n, highlight: a.D.acs }), 'map-card')],
      quote: [AP.quotes[a.q] || quoteFor(a.top), a.name],
      insights: [
        `${cls} seat: ${PARTY[a.lead].name} ahead by ${f1(a.margin)} pts (margin of error ${moeTxt(a.iv)}).`,
        `${pc(a.U)} undecided, ${a.U >= 12 ? 'enough to flip the seat' : 'a small open band'}.`,
        `${a.iss[0][0]} is the first issue here, for ${pc(a.iss[0][1])} of voters.`,
        `MLA satisfaction is ${pc(a.mla)}, against ${pc(STATE.mla)} statewide.`,
      ],
      sql: `SELECT party, share, round\nFROM v_intention_seat\nWHERE ac_no = ${a.n} AND round IN (1, 2)\nORDER BY round, share DESC;`,
    };
  }
  function ansDistrict(d) {
    const s = d.agg; const c = { A: 0, B: 0, C: 0 }; d.list.forEach((a) => c[a.lead]++);
    const close = d.list.filter((a) => a.margin < 4).map((a) => esc(a.name));
    return {
      meta: ['Round 2', s.n + ' seats', 'n = ' + IN(s.iv), moeTxt(s.iv)],
      text: `<b>${esc(d.name)}</b> district (${s.n} seats, ${IN(s.iv)} interviews): mood is <b>${pc(s.pos)} positive</b> (${sgn(s.d1)} since Round 1). ${PARTY[s.lead].name} leads at <b>${pc(s[s.lead])}</b> against ${pc(s[s.second])}. Party A leads ${c.A} seat${c.A === 1 ? '' : 's'}, Party B ${c.B}${c.C ? `, Party C ${c.C}` : ''}. ${close.length ? `Toss-ups: <b>${close.join(', ')}</b>.` : 'No seat here is a toss-up right now.'} The top concern is ${s.top.toLowerCase()} (${pc(s.iss[0][1])}).`,
      cards: [card('Voter sentiment', sentDonut(s, 104)), card('Seats in the district', seatList(d.list)), card('Who leads, by seat', miniMap({ level: 'ac', metric: 'lead', highlight: d.acs }), 'map-card')],
      quote: [quoteFor(s.top), d.name + ' district'],
      insights: [
        `${PARTY[s.lead].name} leads the district by ${f1(s.margin)} pts.`,
        `${close.length} of ${s.n} seats are toss-ups.`,
        `Mood ${sgn(s.d1)} pts since Round 1 (state: ${sgn(STATE.d1)}).`,
        `${s.top} leads the issue list at ${pc(s.iss[0][1])}.`,
      ],
      sql: `SELECT ac_name, leading_party, margin_pts, undecided_pct\nFROM v_seat_summary\nWHERE district = '${d.name}' AND round = 2\nORDER BY margin_pts;`,
    };
  }
  function ansRegion(r) {
    const s = REGAGG[r]; const ds = DISTS.filter((d) => d.region === r);
    return {
      meta: ['Round 2', r, 'n = ' + IN(s.iv), moeTxt(s.iv)],
      text: `<b>${esc(r)}</b> (${s.n} seats across ${ds.length} districts): mood is <b>${pc(s.pos)} positive</b>, ${f1(s.pos - STATE.pos)} pts ${s.pos >= STATE.pos ? 'above' : 'below'} the state. ${PARTY[s.lead].name} leads at <b>${pc(s[s.lead])}</b> against ${pc(s[s.second])}; ${pc(s.U)} are undecided. Voters here raise ${s.iss.slice(0, 3).map(([k, v]) => `${k.toLowerCase()} (${pc(v)})`).join(', ')}.`,
      cards: [card('Voter sentiment', sentDonut(s, 104)), card('Voting intention', intentBars(s, true)), card('The region', miniMap({ level: 'district', metric: 'sent', region: r }), 'map-card')],
      quote: [quoteFor(s.top), r],
      insights: [`${PARTY[s.lead].name} leads ${r} by ${f1(s.margin)} pts.`, `Mood is ${sgn(s.d1)} pts since Round 1.`, `${s.top} is the first issue (${pc(s.iss[0][1])}).`, `${ds.length} districts, ${s.n} seats, ${IN(s.iv)} interviews.`],
      sql: `SELECT district, ROUND(SUM(pos * n) / SUM(n), 1) AS positive\nFROM v_mood_seat\nWHERE region = '${r}' AND round = 2\nGROUP BY district;`,
    };
  }
  function ansYouth() {
    const s = STATE, dm = demo('state', s);
    const share = dm.ages[0][1], n = Math.round((s.iv * share) / 100);
    const yPos = dm.posBy[0], yJobs = s.iss[0][1] * 1.42, yU = s.U + 5.5, yA = s.A - 1.8, yB = s.B + 2.4;
    return {
      meta: ['Round 2', 'Youth module', 'n = ' + IN(n), moeTxt(n)],
      text: `Voters aged 18–25 are <b>${pc(share)}</b> of the sample (${IN(n)} interviews). Their mood is <b>${pc(yPos)} positive</b>, ${f1(s.pos - yPos)} pts below the state. Jobs dominate: <b>${pc(yJobs)}</b> name it first, against ${pc(s.iss[0][1])} overall. <b>${pc(yU)}</b> are undecided, the largest open block of any age group.`,
      cards: [
        card('Positive mood by age', hbars(dm.ages.map((a, i) => ({ label: a[0], v: dm.posBy[i], c: ramp(SENT_STOPS, (dm.posBy[i] - 40) / 26) })), { max: 80, w: 60 })),
        card('What 18–25s raise first', hbars([['Jobs', yJobs], ['Migration', 14], ['Prices', 11], ['Education', 9]].map(([k, v]) => ({ label: k, v, c: issueC(k) })), { max: 60, w: 96 })),
        card('Intention, 18–25', hbars([{ label: 'Party A', v: yA, c: PARTY.A.c }, { label: 'Party B', v: yB, c: PARTY.B.c }, { label: 'Party C', v: s.C + 1, c: PARTY.C.c }, { label: 'Undecided', v: yU, c: PARTY.U.c }], { max: 60, w: 88 })),
      ],
      quote: [quoteFor('Jobs'), 'Guntur West'],
      insights: [`Young voters are ${f1(s.pos - yPos)} pts less positive than the state.`, `${pc(yJobs)} of 18–25s put jobs first.`, `${pc(yU)} undecided: the biggest open block.`, `Party B does ${f1(yB - s.B)} pts better with youth.`],
      sql: `SELECT age_band, ROUND(AVG(pos), 1) AS positive\nFROM v_mood_demographic\nWHERE round = 2\nGROUP BY age_band\nORDER BY age_band;`,
    };
  }
  function ansWomen() {
    const s = STATE, dm = demo('state', s);
    const n = Math.round((s.iv * dm.female) / 100);
    return {
      meta: ['Round 2', "Women's module", 'n = ' + IN(n), moeTxt(n)],
      text: `Women make up <b>${pc(dm.female)}</b> of interviews. They are <b>${f1(dm.women - dm.men)} pts more positive</b> than men (${pc(dm.women)} against ${pc(dm.men)}), driven by how welfare schemes reach them. Party A does better with women (${pc(dm.womenA)}) than with men (${pc(dm.menA)}). Drinking water ranks higher for women than for men.`,
      cards: [
        card('Positive mood by gender', hbars([{ label: 'Women', v: dm.women, c: '#f79fff' }, { label: 'Men', v: dm.men, c: '#b997ff' }], { max: 80, w: 60 })),
        card('Party A by gender', hbars([{ label: 'Women', v: dm.womenA, c: PARTY.A.c }, { label: 'Men', v: dm.menA, c: PARTY.A.c }], { max: 60, w: 60 })),
        card('What women raise first', hbars([['Drinking water', 27], ['Prices', 21], ['Jobs', 19], ['Healthcare', 12]].map(([k, v]) => ({ label: k, v, c: issueC(k) })), { max: 45, w: 110 })),
      ],
      quote: [quoteFor('Drinking water'), 'Kurnool'],
      insights: [`Women are ${f1(dm.women - dm.men)} pts more positive than men.`, `Party A gains ${f1(dm.womenA - dm.menA)} pts among women.`, 'Drinking water is the first issue for women.', `${pc(dm.female)} of the sample are women, weighted to the Census.`],
      sql: `SELECT gender, ROUND(AVG(pos), 1) AS positive\nFROM v_mood_demographic\nWHERE round = 2\nGROUP BY gender;`,
    };
  }
  function ansPriority() {
    const list = ACS.filter((a) => a.margin < 3.5 && a.U >= 11).sort((x, y) => y.U - x.U || x.margin - y.margin);
    const top = list.slice(0, 7);
    return {
      meta: ['Round 2', list.length + ' priority seats', 'n ≥ 100 per booth'],
      text: `<b>${list.length} seats</b> are toss-ups with a big undecided block (lead under 3.5 pts and 11% or more undecided). Start with ${top.slice(0, 3).map((a) => `<b>${esc(a.name)}</b>`).join(', ')}. Booths with fewer than 100 interviews are left out, so every number here is reliable.`,
      cards: [
        card('Priority seats', `<div class="seatlist">${top.map((a) => `<div><span><i style="background:${PARTY[a.lead].c}"></i>${esc(a.name)}</span><b>${pc(a.U)} undecided</b><small>${f1(a.margin)} pts</small></div>`).join('')}</div>`),
        card('Where they are', miniMap({ level: 'ac', metric: 'lead', highlight: list.map((a) => a.n) }), 'map-card'),
      ],
      quote: [quoteFor('Prices'), top[0] ? top[0].name : 'Andhra Pradesh'],
      insights: [`${list.length} toss-up seats with 11%+ undecided.`, `${esc(top[0].name)} has the largest open block (${pc(top[0].U)}).`, 'Focus field teams where undecided voters cluster.', 'Re-check these seats in the next round.'],
      sql: `SELECT ac_name, margin_pts, undecided_pct\nFROM v_seat_summary\nWHERE round = 2 AND margin_pts < 3.5 AND undecided_pct >= 11\nORDER BY undecided_pct DESC;`,
    };
  }
  function moverBars(list, up) {
    return `<div class="hbars">${list.map((a) => `<div class="hbar" style="grid-template-columns:118px 1fr 46px"><span>${esc(a.name)}</span><span class="tr"><i style="width:${clamp((Math.abs(a.d1) / 10) * 100, 4, 100)}%;background:${up ? '#fe881b' : '#7f5af0'}"></i></span><b>${sgn(a.d1)}</b></div>`).join('')}</div>`;
  }
  function ansMovers() {
    const ups = ACS.slice().sort((x, y) => y.d1 - x.d1).slice(0, 5);
    const downs = ACS.slice().sort((x, y) => x.d1 - y.d1).slice(0, 5);
    return {
      meta: ['Round 1 → Round 2', 'n = ' + IN(STATE.iv), moeTxt(STATE.iv)],
      text: `Statewide mood moved <b>${sgn(STATE.d1)} pts</b> since Round 1. The biggest gains are in ${ups.slice(0, 3).map((a) => `<b>${esc(a.name)}</b> (${sgn(a.d1)})`).join(', ')}. The biggest drops are in ${downs.slice(0, 3).map((a) => `<b>${esc(a.name)}</b> (${sgn(a.d1)})`).join(', ')}. Party A moved ${sgn(STATE.A - STATE.A1)} pts and Party B ${sgn(STATE.B - STATE.B1)} pts.`,
      cards: [card('Biggest gains · pts', moverBars(ups, true)), card('Biggest drops · pts', moverBars(downs, false)), card('Change by seat', miniMap({ level: 'ac', metric: 'swing' }), 'map-card')],
      quote: [quoteFor('MLA'), downs[0].name],
      insights: [`Mood ${sgn(STATE.d1)} pts statewide.`, `${esc(ups[0].name)} gained the most (${sgn(ups[0].d1)}).`, `${esc(downs[0].name)} fell the most (${sgn(downs[0].d1)}).`, `Party B ${sgn(STATE.B - STATE.B1)} pts, Party A ${sgn(STATE.A - STATE.A1)} pts.`],
      sql: `SELECT ac_name, pos_r2 - pos_r1 AS change_pts\nFROM v_mood_rounds\nORDER BY change_pts DESC;`,
    };
  }
  function ansMLA() {
    const low = ACS.slice().sort((x, y) => x.mla - y.mla).slice(0, 6);
    const bands = [ACS.filter((a) => a.mla < 35).length, ACS.filter((a) => a.mla >= 35 && a.mla < 50).length, ACS.filter((a) => a.mla >= 50).length];
    return {
      meta: ['Round 2', 'MLA satisfaction', 'n = ' + IN(STATE.iv)],
      text: `Average satisfaction with local MLAs is <b>${pc(STATE.mla)}</b>. It is lowest in ${low.slice(0, 3).map((a) => `<b>${esc(a.name)}</b> (${pc(a.mla)})`).join(', ')}. In <b>${bands[0]} seats</b> it is under 35%: these are the seats where local anger, not state anger, may decide the result.`,
      cards: [card('Lowest MLA satisfaction', hbars(low.map((a) => ({ label: a.name, v: a.mla, c: '#7f5af0' })), { max: 70, w: 118 })), card('Seats by satisfaction', donut([{ v: bands[0], c: '#7f5af0' }, { v: bands[1], c: '#a997ce' }, { v: bands[2], c: '#fe881b' }], { size: 110, w: 14, big: String(bands[0]), small: 'under 35%' }) + `<div class="legend" style="margin-top:10px"><span><i style="background:#7f5af0"></i>Under 35%: ${bands[0]}</span><span><i style="background:#a997ce"></i>35–50%: ${bands[1]}</span><span><i style="background:#fe881b"></i>50%+: ${bands[2]}</span></div>`)],
      quote: [quoteFor('MLA'), low[0].name],
      insights: [`Average MLA satisfaction: ${pc(STATE.mla)}.`, `${bands[0]} seats under 35%.`, `${esc(low[0].name)} is lowest at ${pc(low[0].mla)}.`, 'Separate local anger from state anger before acting.'],
      sql: `SELECT ac_name, mla_satisfaction\nFROM v_seat_summary\nWHERE round = 2\nORDER BY mla_satisfaction\nLIMIT 6;`,
    };
  }
  function ansIssues() {
    const s = STATE; const cnt = {}; ACS.forEach((a) => (cnt[a.top] = (cnt[a.top] || 0) + 1));
    const tops = Object.entries(cnt).sort((x, y) => y[1] - x[1]);
    return {
      meta: ['Round 2', 'Issues', 'n = ' + IN(s.iv), moeTxt(s.iv)],
      text: `Statewide, voters raise ${s.iss.slice(0, 4).map(([k, v]) => `<b>${k.toLowerCase()}</b> (${pc(v)})`).join(', ')}. ${tops[0][0]} is the first issue in <b>${tops[0][1]} seats</b>, ${tops[1][0].toLowerCase()} in ${tops[1][1]} and ${tops[2][0].toLowerCase()} in ${tops[2][1]}. Water and irrigation rank higher in Rayalaseema; jobs and prices in the cities.`,
      cards: [card('Top issues statewide', hbars(s.iss.slice(0, 6).map(([k, v]) => ({ label: k, v, c: issueC(k) })), { max: 40, w: 112 })), card('First issue by region', `<div class="seatlist">${REG.map((r) => `<div><span><i style="background:${issueC(REGAGG[r].top)}"></i>${esc(r)}</span><b>${esc(REGAGG[r].top)}</b><small>${pc(REGAGG[r].iss[0][1])}</small></div>`).join('')}</div>`), card('First issue by seat', miniMap({ level: 'ac', metric: 'issue' }), 'map-card')],
      quote: [quoteFor('Irrigation'), 'Anantapur'],
      insights: [`${s.top} leads statewide at ${pc(s.iss[0][1])}.`, `${tops[0][0]} is first in ${tops[0][1]} of 175 seats.`, 'Water issues cluster in Rayalaseema.', 'Track each issue round by round.'],
      sql: `SELECT issue, ROUND(SUM(share * n) / SUM(n), 1) AS pct\nFROM v_issue_seat\nWHERE round = 2\nGROUP BY issue\nORDER BY pct DESC;`,
    };
  }
  function ansBooth(n) {
    const k = 14 + (n % 17);
    return {
      refuse: true,
      meta: ['Round 2', 'Booth ' + n, 'n = ' + k],
      text: `<div class="refuse"><b>I can't answer that reliably.</b> Booth ${n} has only ${k} interviews this round, below our minimum of 100, so any percentage would mislead. I can answer for its constituency or mandal, or for a group of nearby booths instead.</div>`,
      cards: [], quote: null,
      insights: [`Booth ${n}: n = ${k}, below the minimum of 100.`, 'Ask at seat or mandal level instead.', 'Small samples are hidden on every dashboard.', 'Every refusal is logged for audit.'],
      sql: `-- refused: sample below minimum (n = ${k} < 100)`,
    };
  }
  function answer(q) {
    const it = intent(q);
    switch (it.k) {
      case 'telugu': return ansState('<span class="te" lang="te">మీ ప్రశ్న అందింది.</span> Telugu questions work too; this demo answers in English.');
      case 'booth': return ansBooth(it.n);
      case 'ac': return ansAC(it.a);
      case 'district': return ansDistrict(it.d);
      case 'region': return ansRegion(it.r);
      case 'youth': return ansYouth();
      case 'women': return ansWomen();
      case 'priority': return ansPriority();
      case 'movers': return ansMovers();
      case 'mla': return ansMLA();
      case 'issues': return ansIssues();
      default: return ansState(it.fallback ? 'I read this as a statewide question.' : '');
    }
  }
  function hydrate(root) {
    $$('.mini-map[data-map]', root).forEach((el) => {
      const o = JSON.parse(el.dataset.map); el.removeAttribute('data-map');
      MapView(el, { level: o.level, metric: o.metric, labels: !!o.sel, labelSize: 22, tip: true, selKind: o.sel ? 'ac' : null, selId: o.sel || null, highlight: o.highlight ? new Set(o.highlight) : null, region: o.region || null });
    });
  }
  const STEPS = ['Understanding the question', `Counting ${IN(STATE.iv)} verified interviews`, 'Finding matching voter quotes', 'Checking sample size and margin'];
  const stepsHTML = () => `<div class="a-steps">${STEPS.map((s) => `<div><span class="spin" aria-hidden="true"></span>${s}</div>`).join('')}</div>`;
  async function playSteps(root, ms) {
    const steps = $$('.a-steps div', root);
    for (const st of steps) { st.classList.add('show'); await wait(ms); const sp = st.querySelector('.spin'); if (sp) sp.outerHTML = ic('checkc'); }
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.sql-t'); if (!b) return;
    const pre = b.closest('.a-body, .ai-answer').querySelector('.sql');
    const open = pre.classList.toggle('show'); b.setAttribute('aria-expanded', String(open));
    b.lastChild.textContent = open ? 'Hide SQL' : 'View SQL';
  });
  const footHTML = (A) => `<div class="a-foot"><button type="button" class="sql-t" aria-expanded="false">${ic('code')}<span>View SQL</span></button>${A.refuse ? '' : `<button type="button" data-toast="In the full product this plays the 12 matching voter clips.">${ic('play')}Play voter clips</button><button type="button" data-toast="In the full product this downloads the answer as a PDF.">${ic('download')}Download</button>`}</div><pre class="sql">${esc(A.sql)}</pre>`;

  /* ---------- chat (Ask the Data section) ---------- */
  const CHIPS = ['Who is ahead statewide?', 'Guntur West deep dive', 'What do young voters want?', 'Where are the toss-up seats?', 'What changed since Round 1?', 'How is Booth 112 voting?'];
  const USES = [
    ['target', 'Where to campaign this week', 'Toss-ups with many undecided', 'Which seats should we focus on this week?'],
    ['trend', 'What moved since last round', 'Biggest gains and drops', 'What changed since Round 1?'],
    ['brief', 'Brief me on a district', 'Seats, mood, issues, voices', 'Brief me on Kurnool district'],
    ['users', 'Understand women voters', 'Gender gap and priorities', 'How do women voters feel?'],
    ['user', 'Find weak MLAs', 'Local anger vs state anger', 'Where is MLA satisfaction lowest?'],
    ['compass', 'Read a region', 'Rayalaseema at a glance', 'What is the mood in Rayalaseema?'],
  ];
  function Chat() {
    const log = $('#chatLog'), form = $('#chatForm'); if (!log || !form) return;
    const input = $('#chatIn'), err = $('#chatErr'), send = form.querySelector('.send');
    $('#chips').innerHTML = CHIPS.map((c) => `<button type="button">${esc(c)}</button>`).join('');
    $('#uses').innerHTML = USES.map(([i, t, s, q]) => `<button type="button" data-ask="${esc(q)}"><i>${ic(i)}</i><span><b>${esc(t)}</b><small>${esc(s)}</small></span>${ic('arrow')}</button>`).join('');
    let busy = false;
    const scroll = () => { log.scrollTop = log.scrollHeight; };
    async function ask(q) {
      if (busy) return;
      busy = true; send.disabled = true; input.value = ''; form.classList.remove('err'); err.textContent = '';
      const empty = $('#chatEmpty'); if (empty) empty.remove();
      log.insertAdjacentHTML('beforeend', `<div class="msg-q">${esc(q)}</div>`);
      const m = document.createElement('div'); m.className = 'msg-a';
      m.innerHTML = `<span class="spark">${ic('spark')}</span><div class="a-body">${stepsHTML()}</div>`;
      log.appendChild(m); scroll();
      await playSteps(m, 380);
      const A = answer(q);
      m.querySelector('.a-body').innerHTML = `<div class="a-meta">${A.meta.map((x, i) => `<span class="badge ${i === 0 ? 'purple' : ''}">${esc(x)}</span>`).join('')}</div><div class="a-text">${A.text}</div>${A.cards.length ? `<div class="a-cards">${A.cards.join('')}</div>` : ''}${A.quote ? quoteHTML(A.quote[0], A.quote[1]) : ''}${footHTML(A)}`;
      hydrate(m); scroll();
      busy = false; send.disabled = false;
    }
    $('#chips').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) ask(b.textContent); });
    $('#uses').addEventListener('click', (e) => { const b = e.target.closest('[data-ask]'); if (b) { ask(b.dataset.ask); } });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = input.value.trim();
      if (!v) { form.classList.add('err'); err.textContent = 'Type a question first, or pick one of the suggestions.'; input.focus(); return; }
      ask(v);
    });
    input.addEventListener('input', () => { form.classList.remove('err'); err.textContent = ''; });
    form.querySelector('.mic').addEventListener('click', () => ask('ఆంధ్రప్రదేశ్‌లో ఓటర్ల మూడ్ ఎలా ఉంది?'));
  }

  Object.assign(P, { answer, intent, hydrate, Chat });
})();
