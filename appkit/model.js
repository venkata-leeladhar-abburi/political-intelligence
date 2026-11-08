/* Political Intelligence Platform · app data model
   Builds on window.PI (core.js): adds rounds, mandals and urban bodies, ruling-vs-opposition measures,
   field agents, surveys, users and roles, the verification queue and round notes.
   All figures are illustrative demo data, stable per area. */
(function () {
  'use strict';
  const PI = window.PI, AP = window.AP;
  const { ACS, DISTS, byN, rng, hash, clamp, moe } = PI;
  const M = (window.M = {});

  /* ---------------- rounds ---------------- */
  M.ROUNDS = [
    { id: 0, short: 'Baseline', name: 'Baseline', dates: 'Jan 12 – Feb 8, 2026', state: 'closed' },
    { id: 1, short: 'Round 1', name: 'Round 1', dates: 'May 4 – May 30, 2026', state: 'closed' },
    { id: 2, short: 'Round 2', name: 'Round 2', dates: 'Aug 15 – Sep 10, 2026', state: 'closed' },
    { id: 3, short: 'Round 3', name: 'Round 3 (in field)', dates: 'Oct 27 – Nov 21, 2026', state: 'live', done: 0.41 },
  ];
  M.round = 2;

  /* ---------------- parties (demo placeholders, never real names) ---------------- */
  M.PARTY = {
    A: { name: 'Party A', role: 'Ruling', v: '--pA' },
    B: { name: 'Party B', role: 'Main opposition', v: '--pB' },
    C: { name: 'Party C', role: 'Opposition', v: '--pC' },
    O: { name: 'Others', role: '', v: '--pO' },
    U: { name: 'Undecided', role: '', v: '--pU' },
  };
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  M.col = (k) => css(M.PARTY[k] ? M.PARTY[k].v : k);
  M.cssv = css;

  /* ---------------- urban local bodies ----------------
     17 municipal corporations (2026). Seats fully inside a corporation are split into ward groups;
     seats partly inside get a ward group plus their rural mandals. */
  const CORP = {
    'Srikakulam': [5], 'Vizianagaram': [18], 'Greater Visakhapatnam': [21, 22, 23, 24, 25, -20, -30, -31], 'Kakinada': [41, -38],
    'Rajamahendravaram': [50, -51], 'Eluru': [65], 'Machilipatnam': [75], 'Vijayawada': [79, 80, 81], 'Mangalagiri-Tadepalli': [-87],
    'Guntur': [94, 95], 'Ongole': [108], 'Nellore': [117, -118], 'Tirupati': [167], 'Kadapa': [126], 'Kurnool': [137],
    'Anantapuramu': [153], 'Chittoor': [-172],
  };
  M.CORP = CORP;
  const corpOf = new Map();
  Object.entries(CORP).forEach(([name, list]) => list.forEach((n) => corpOf.set(Math.abs(n), { name, full: n > 0 })));
  /* municipalities (M) and nagar panchayats (NP) that sit inside a seat; town name differs from the seat where noted */
  const TOWN = {
    1: 'Ichchapuram', 2: 'Palasa-Kasibugga', 6: 'Amadalavalasa', 9: 'Rajam', 10: 'Palakonda:NP', 12: 'Parvathipuram', 13: 'Salur', 14: 'Bobbili',
    17: 'Nellimarla:NP', 32: 'Yelamanchili', 34: 'Narsipatnam', 35: 'Tuni', 37: 'Pithapuram', 39: 'Peddapuram', 42: 'Ramachandrapuram', 44: 'Amalapuram',
    48: 'Mandapeta', 54: 'Kovvur', 55: 'Nidadavole', 57: 'Palakollu', 58: 'Narasapuram', 59: 'Bhimavaram', 61: 'Tanuku', 62: 'Tadepalligudem',
    68: 'Chintalapudi:NP', 69: 'Tiruvuru:NP', 70: 'Nuzvid', 72: 'Gudivada', 74: 'Pedana', 82: 'Kondapalli', 83: 'Nandigama:NP', 84: 'Jaggayyapeta',
    88: 'Ponnur', 90: 'Repalle', 91: 'Tenali', 92: 'Bapatla', 96: 'Chilakaluripet', 97: 'Narasaraopet', 98: 'Sattenapalle', 99: 'Vinukonda',
    100: 'Gurazala:NP', 101: 'Macherla', 103: 'Darsi:NP', 105: 'Addanki:NP', 106: 'Chirala', 109: 'Kandukur', 111: 'Markapuram', 112: 'Giddalur:NP',
    113: 'Kanigiri:NP', 114: 'Kavali', 115: 'Atmakur', 120: 'Gudur', 121: 'Sullurpeta', 122: 'Venkatagiri', 124: 'Badvel', 125: 'Rajampet',
    128: 'Rayachoti', 129: 'Pulivendula', 131: 'Jammalamadugu', 132: 'Proddatur', 133: 'Mydukur', 134: 'Allagadda', 136: 'Nandikotkur', 139: 'Nandyal',
    141: 'Dhone', 144: 'Yemmiganur', 146: 'Adoni', 148: 'Rayadurg', 150: 'Guntakal', 151: 'Tadipatri', 154: 'Kalyandurg', 156: 'Madakasira',
    157: 'Hindupur', 158: 'Penukonda:NP', 159: 'Puttaparthi', 160: 'Dharmavaram', 161: 'Kadiri', 164: 'Madanapalle', 165: 'Punganur',
    168: 'Srikalahasti', 170: 'Nagari', 174: 'Palamaner', 175: 'Kuppam',
  };
  /* official mandal names for the demo's focus district (Guntur); elsewhere the seat's home mandal plus numbered stand-ins until the boundary files load */
  const MANDALS = {
    86: ['Tadikonda', 'Thullur', 'Phirangipuram', 'Medikonduru'], 87: ['Duggirala'], 88: ['Ponnur', 'Chebrolu', 'Pedakakani'],
    91: ['Tenali', 'Kollipara'], 93: ['Prathipadu', 'Pedanandipadu', 'Vatticherukuru', 'Kakumanu'],
  };
  const LOCALITY = { 94: ['Brodipet', 'Arundelpet', 'Lakshmipuram', 'Pattabhipuram'], 95: ['Kothapet', 'Nallapadu', 'Old Guntur', 'Sangadigunta'] };
  M.KIND = { mandal: 'Rural mandal', corp: 'Municipal corporation', muni: 'Municipality', np: 'Nagar panchayat' };
  M.KIND_SHORT = { mandal: 'Mandal', corp: 'Corporation', muni: 'Municipality', np: 'Nagar panchayat' };

  function seatKind(a) {
    const c = corpOf.get(a.n);
    if (c && c.full) return 'corp';
    if (c) return 'mixed';
    return TOWN[a.n] ? 'town' : 'rural';
  }
  M.seatKind = seatKind;
  M.SEAT_KIND = { corp: 'Corporation seat', mixed: 'Corporation + rural', town: 'Town + rural', rural: 'Rural seat' };

  /* units = the pieces a seat splits into: ward groups, a town, rural mandals */
  const UNITS = new Map();
  M.units = function (a) {
    if (UNITS.has(a.n)) return UNITS.get(a.n);
    const r = rng(hash('units' + a.n));
    const out = [];
    const c = corpOf.get(a.n);
    if (c && c.full) {
      const groups = 3 + Math.floor(r() * 2), per = 12 + Math.floor(r() * 4);
      const loc = LOCALITY[a.n] || [];
      for (let i = 0; i < groups; i++) out.push({ kind: 'corp', body: c.name, name: `${loc[i] ? loc[i] + ' · ' : ''}Wards ${i * per + 1}–${(i + 1) * per}`, wards: per });
    } else {
      if (c) out.push({ kind: 'corp', body: c.name, name: `${c.name} wards`, wards: 9 + Math.floor(r() * 10) });
      const t = TOWN[a.n];
      if (t) { const [nm, k] = t.split(':'); out.push({ kind: k === 'NP' ? 'np' : 'muni', body: nm, name: `${nm} ${k === 'NP' ? 'Nagar Panchayat' : 'Municipality'}`, wards: k === 'NP' ? 20 : 28 + Math.floor(r() * 12) }); }
      const named = MANDALS[a.n];
      const nMand = named ? named.length : (c ? 1 : 3) + Math.floor(r() * (c ? 2 : 3));
      for (let i = 0; i < nMand; i++) out.push({ kind: 'mandal', name: named ? named[i] : i === 0 ? a.name.replace(/ (City|Rural|Urban|East|West|North|South|Central)$/, '') : `${a.name} mandal ${i + 1}`, placeholder: !named && i > 0, villages: 14 + Math.floor(r() * 22) });
    }
    /* share of the seat's interviews, then metrics jittered from the seat */
    let tot = 0; out.forEach((u) => { u.w = u.kind === 'mandal' ? 0.7 + r() * 0.7 : 1 + r() * 0.6; tot += u.w; });
    out.forEach((u, i) => {
      u.id = a.n * 100 + i; u.ac = a.n; u.i = i; u.share = u.w / tot;
      u.jit = { A: (r() - 0.5) * (u.kind === 'mandal' ? 9 : 6), pos: (r() - 0.5) * 10, U: (r() - 0.5) * 3 };
      u.booths = Math.max(6, Math.round(a.bo * u.share));
      u.boothsAll = Math.round(u.booths * (5.2 + r() * 1.6));
      u.urban = u.kind !== 'mandal';
    });
    UNITS.set(a.n, out);
    return out;
  };
  M.unitById = (id) => { const a = byN.get(Math.floor(id / 100)); return M.units(a)[id % 100]; };
  M.districtULB = function (d) {
    const corp = Object.keys(CORP).filter((k) => CORP[k].some((n) => byN.get(Math.abs(n)).dist === d.id));
    const towns = d.acs.filter((n) => TOWN[n]).map((n) => TOWN[n].split(':'));
    return { corp, muni: towns.filter((t) => !t[1]).map((t) => t[0]), np: towns.filter((t) => t[1]).map((t) => t[0]) };
  };

  /* ---------------- values for any area, any round ---------------- */
  const norm = (o) => { const t = o.A + o.B + o.C + o.O + o.U; ['A', 'B', 'C', 'O', 'U'].forEach((k) => (o[k] = (o[k] * 100) / t)); return o; };
  function acRound(a, rd) {
    const r = rng(hash('rd' + a.n + ':' + rd));
    const dA = a.A - a.A1, dB = a.B - a.B1;
    let o;
    if (rd === 2) o = { A: a.A, B: a.B, C: a.C, O: a.O, U: a.U, pos: a.pos, neg: a.neg, iv: a.iv };
    else if (rd === 1) o = { A: a.A1, B: a.B1, C: a.C + (r() - 0.5), O: a.O, U: a.U + 1.6, pos: a.pos - a.d1, neg: a.neg + a.d1 * 0.5, iv: Math.round(a.iv * (0.9 + r() * 0.06)) };
    else if (rd === 0) o = { A: a.A1 - dA * 0.6 + (r() - 0.5) * 2, B: a.B1 - dB * 0.5 + (r() - 0.5) * 2, C: a.C + (r() - 0.3), O: a.O + 0.5, U: a.U + 3.4, pos: a.pos - a.d1 - 2 - r() * 3, neg: a.neg + a.d1 * 0.6 + 1, iv: Math.round(a.iv * (0.55 + r() * 0.08)) };
    else o = { A: a.A + dA * 0.35 + (r() - 0.5) * 2.4, B: a.B + dB * 0.35 + (r() - 0.5) * 2.4, C: a.C, O: a.O, U: Math.max(3, a.U - 0.8), pos: a.pos + a.d1 * 0.3 + (r() - 0.5) * 3, neg: a.neg - a.d1 * 0.2, iv: Math.round(a.iv * (0.3 + r() * 0.22)) };
    norm(o);
    o.neu = Math.max(8, 100 - o.pos - o.neg);
    o.mla = a.mla + (rd - 2) * 1.4 + (r() - 0.5) * 2;
    return o;
  }
  /* ruling-vs-opposition measures derived from intention and mood (stable per area) */
  function derive(o, key, rd) {
    const r = rng(hash('dv' + key + ':' + rd));
    o.gov = clamp(o.pos * 0.52 + o.A * 0.55 + (r() - 0.5) * 4, 22, 78);          // approve of the state government
    o.cm = clamp(o.gov + 2 + (r() - 0.5) * 6, 20, 80);                            // Chief Minister rating (Party A leader)
    o.opp = clamp(o.B * 0.92 + 9 + (r() - 0.5) * 6, 18, 72);                       // main opposition leader rating
    o.anti = clamp(100 - o.gov + (o.mla < 46 ? 6 : 0) - 8, 15, 75);               // anti-incumbency index (0–100)
    o.welfare = clamp(58 + (r() - 0.5) * 16, 40, 78);                             // households that received a scheme
    o.welfA = clamp(o.A + 6 + r() * 4, 20, 70);                                   // Party A share among beneficiaries
    o.nonA = clamp(o.A - 5 - r() * 3, 15, 65);
    const ord = ['A', 'B', 'C'].sort((x, y) => o[y] - o[x]);
    o.lead = ord[0]; o.second = ord[1]; o.margin = o[ord[0]] - o[ord[1]];
    o.cls = o.margin >= 8 ? 'Safe' : o.margin >= 4 ? 'Lean' : 'Toss-up';
    o.net = o.pos - o.neg;
    o.moe = moe(o.iv);
    o.verified = clamp(95.2 + r() * 4.2, 90, 99.6);
    o.flagged = Math.round(o.iv * (0.006 + r() * 0.018));
    o.sarcasm = Math.round(o.iv * (0.025 + r() * 0.03));
    o.review = Math.round(o.sarcasm * (0.18 + r() * 0.2));
    return o;
  }
  function weighted(list, rd) {
    const t = { A: 0, B: 0, C: 0, O: 0, U: 0, pos: 0, neg: 0, mla: 0, iv: 0 };
    list.forEach((o) => { ['A', 'B', 'C', 'O', 'U', 'pos', 'neg', 'mla'].forEach((k) => (t[k] += o[k] * o.iv)); t.iv += o.iv; });
    ['A', 'B', 'C', 'O', 'U', 'pos', 'neg', 'mla'].forEach((k) => (t[k] /= t.iv || 1));
    t.neu = 100 - t.pos - t.neg;
    return t;
  }
  const CACHE = new Map();
  M.vals = function (en, rd = M.round) {
    const key = en.kind + ':' + en.id + ':' + rd;
    if (CACHE.has(key)) return CACHE.get(key);
    let o;
    if (en.kind === 'ac') {
      const a = byN.get(en.id); o = acRound(a, rd);
      o.iss = a.iss.map(([k, p], i) => [k, p + (rd - 2) * (i === 0 ? -1.2 : 0.6)]);
      o.target = 1200; o.bo = a.bo; o.boAll = 230 + (hash('b' + a.n) % 90);
    } else if (en.kind === 'unit') {
      const u = M.unitById(en.id), p = M.vals({ kind: 'ac', id: u.ac }, rd);
      o = { A: p.A + u.jit.A, B: p.B - u.jit.A * 0.8, C: p.C, O: p.O, U: p.U + u.jit.U, pos: clamp(p.pos + u.jit.pos, 20, 85), neg: clamp(p.neg - u.jit.pos * 0.5, 4, 50), iv: Math.round(p.iv * u.share), mla: p.mla + u.jit.pos * 0.4 };
      norm(o); o.neu = Math.max(6, 100 - o.pos - o.neg);
      const rr = rng(hash('ui' + u.id));
      o.iss = p.iss.map(([k, v]) => [k, Math.max(4, v + (rr() - 0.5) * 8)]).sort((x, y) => y[1] - x[1]);
      if (u.kind === 'mandal' && !o.iss.some(([k]) => k === 'Irrigation')) o.iss[2] = ['Irrigation', 12 + rr() * 6];
      o.target = Math.round(p.target * u.share); o.bo = u.booths; o.boAll = u.boothsAll;
    } else {
      const list = en.kind === 'district' ? DISTS[en.id - 1].acs : en.kind === 'region' ? ACS.filter((a) => a.region === en.id).map((a) => a.n) : ACS.map((a) => a.n);
      const vs = list.map((n) => M.vals({ kind: 'ac', id: n }, rd));
      o = weighted(vs, rd);
      const iss = {}; vs.forEach((v) => v.iss.forEach(([k, p]) => (iss[k] = (iss[k] || 0) + p * v.iv)));
      o.iss = Object.entries(iss).map(([k, v]) => [k, v / o.iv]).sort((x, y) => y[1] - x[1]).slice(0, 6);
      o.target = list.length * 1200; o.bo = vs.reduce((t, v) => t + v.bo, 0); o.boAll = vs.reduce((t, v) => t + v.boAll, 0);
      o.seats = { A: 0, B: 0, C: 0, Safe: 0, Lean: 0, 'Toss-up': 0, lo: {}, hi: {} };
      vs.forEach((v) => { o.seats[v.lead]++; o.seats[v.cls]++; });
      /* win ranges: toss-ups can fall either way */
      ['A', 'B', 'C'].forEach((k) => { o.seats.lo[k] = vs.filter((v) => v.lead === k && v.cls !== 'Toss-up').length; o.seats.hi[k] = vs.filter((v) => v.lead === k || (v.cls === 'Toss-up' && v.second === k)).length; });
      o.list = list;
    }
    o.iv = Math.max(o.iv, 1);
    derive(o, key, rd);
    if (rd === 3 && en.kind !== 'unit') o.target = o.target;
    CACHE.set(key, o);
    return o;
  };
  M.clear = () => CACHE.clear();
  M.lead = (v) => (v.margin < 0.5 ? 'Level' : `${M.PARTY[v.lead].name.slice(-1)} +${(Math.round(v.margin * 10) / 10).toFixed(1)}`);

  /* names and parents */
  M.name = (en) => en.kind === 'state' ? 'Andhra Pradesh' : en.kind === 'district' ? DISTS[en.id - 1].name : en.kind === 'ac' ? byN.get(en.id).name : en.kind === 'region' ? en.id : M.unitById(en.id).name;
  M.kindLabel = (en) => en.kind === 'state' ? 'State' : en.kind === 'district' ? 'District' : en.kind === 'ac' ? 'Assembly constituency' : en.kind === 'region' ? 'Region' : M.KIND[M.unitById(en.id).kind];
  M.parent = (en) => en.kind === 'district' ? { kind: 'state', id: 0 } : en.kind === 'ac' ? { kind: 'district', id: byN.get(en.id).dist } : en.kind === 'unit' ? { kind: 'ac', id: M.unitById(en.id).ac } : null;
  M.path = (en) => { const p = []; let e = en; while (e) { p.unshift(e); e = M.parent(e); } return p; };
  M.children = (en) => en.kind === 'state' ? DISTS.map((d) => ({ kind: 'district', id: d.id })) : en.kind === 'district' ? DISTS[en.id - 1].acs.map((n) => ({ kind: 'ac', id: n })) : en.kind === 'ac' ? M.units(byN.get(en.id)).map((u) => ({ kind: 'unit', id: u.id })) : [];
  M.childLabel = (en) => en.kind === 'state' ? 'Districts' : en.kind === 'district' ? 'Constituencies' : en.kind === 'ac' ? 'Mandals and urban bodies' : 'Booths';
  M.same = (a, b) => a && b && a.kind === b.kind && a.id === b.id;

  /* search across districts, seats, mandals, corporations and towns */
  M.search = function (q) {
    q = q.trim().toLowerCase(); if (q.length < 2) return [];
    const out = [];
    DISTS.forEach((d) => d.name.toLowerCase().includes(q) && out.push({ kind: 'district', id: d.id, sub: 'District · ' + d.acs.length + ' seats' }));
    ACS.forEach((a) => a.name.toLowerCase().includes(q) && out.push({ kind: 'ac', id: a.n, sub: 'Constituency · ' + DISTS[a.dist - 1].name }));
    ACS.forEach((a) => M.units(a).forEach((u) => !u.placeholder && u.name.toLowerCase().includes(q) && !out.some((x) => x.kind === 'unit' && M.unitById(x.id).name === u.name) && out.push({ kind: 'unit', id: u.id, sub: M.KIND_SHORT[u.kind] + ' · ' + a.name })));
    return out.slice(0, 9);
  };

  /* ---------------- field force ---------------- */
  const AGENT_NAMES = ['Ravi K.', 'Lakshmi P.', 'Suresh M.', 'Anitha R.', 'Kiran B.', 'Divya S.', 'Mahesh T.', 'Swathi N.', 'Prasad V.', 'Padma L.', 'Naresh G.', 'Kavya D.', 'Srinivas Y.', 'Haritha J.', 'Venkatesh A.', 'Bhavani C.', 'Ramesh P.', 'Sravani K.', 'Gopi M.', 'Deepika R.', 'Ashok N.', 'Manasa T.', 'Chaitanya B.', 'Jyothi S.'];
  const AGENT_SEATS = [94, 94, 94, 95, 95, 95, 87, 87, 86, 86, 88, 88, 91, 91, 93, 93, 94, 95, 87, 86, 91, 88, 93, 94];
  M.agents = AGENT_NAMES.map((name, i) => {
    const r = rng(hash('ag' + i)); const ac = AGENT_SEATS[i]; const units = M.units(byN.get(ac)); const u = units[i % units.length];
    const status = i === 2 ? 'offline' : i === 7 ? 'fence' : i === 13 ? 'idle' : i === 18 ? 'mock' : i % 5 === 3 ? 'travel' : 'interview';
    const done = status === 'offline' ? 14 : Math.round(6 + r() * 17);
    return {
      id: 'FA-' + (2400 + i * 7), name, ac, unit: u.id, booth: 40 + Math.floor(r() * 180), status, done, target: 25, queued: status === 'offline' ? 6 : Math.floor(r() * 3),
      battery: Math.round(28 + r() * 70), ping: status === 'offline' ? 47 : Math.round(r() * 4), score: Math.round(82 + r() * 17), seed: r(), phone: '+91 9' + String(800000000 + Math.floor(r() * 99999999)).slice(0, 4) + ' ••• ' + String(10 + Math.floor(r() * 89)),
      supervisor: i < 12 ? 'Prakash Reddy' : 'Sunitha Naidu', lang: 'Telugu', rejected: status === 'mock' ? 3 : Math.floor(r() * 2), avgMin: (7 + r() * 5).toFixed(1),
    };
  });
  M.AGENT_STATUS = {
    interview: ['Interviewing', 'good'], travel: ['Moving to next booth', 'muted'], idle: ['Idle 38 min', 'warn'], offline: ['Offline · 6 saved on phone', 'warn'],
    fence: ['Outside booth fence', 'bad'], mock: ['Mock-GPS app detected', 'bad'],
  };
  M.FIELD = { agents: 1248, online: 1131, supervisors: 52, todayDone: 18420, todayTarget: 31200 };

  /* ---------------- surveys ---------------- */
  M.surveys = [
    { id: 'S-31', name: 'AP statewide tracker · Round 3', type: 'Tracker', scope: 'All 175 seats', target: 210000, done: 86310, state: 'live', start: 'Oct 27', end: 'Nov 21', qs: 24, lang: 'Telugu, English, Urdu', owner: 'Meera Iyer' },
    { id: 'S-30', name: 'Guntur district deep-dive', type: 'Deep-dive', scope: '7 seats · 29 units', target: 14000, done: 9320, state: 'live', start: 'Oct 30', end: 'Nov 14', qs: 31, lang: 'Telugu', owner: 'Prakash Reddy' },
    { id: 'S-29', name: 'Women and welfare module', type: 'Module', scope: '60 seats', target: 18000, done: 11140, state: 'live', start: 'Oct 27', end: 'Nov 21', qs: 12, lang: 'Telugu', owner: 'Priya Menon' },
    { id: 'S-28', name: 'Youth jobs pulse (18–25)', type: 'Pulse', scope: '40 urban seats', target: 8000, done: 0, state: 'scheduled', start: 'Nov 10', end: 'Nov 17', qs: 10, lang: 'Telugu, English', owner: 'Nikhil Varma' },
    { id: 'S-27', name: 'AP statewide tracker · Round 2', type: 'Tracker', scope: 'All 175 seats', target: 210000, done: 196412, state: 'closed', start: 'Aug 15', end: 'Sep 10', qs: 24, lang: 'Telugu, English, Urdu', owner: 'Meera Iyer' },
    { id: 'S-24', name: 'AP statewide tracker · Round 1', type: 'Tracker', scope: 'All 175 seats', target: 210000, done: 180544, state: 'closed', start: 'May 4', end: 'May 30', qs: 22, lang: 'Telugu, English', owner: 'Meera Iyer' },
    { id: 'S-32', name: 'Municipal corporations flash poll', type: 'Flash', scope: '17 corporations', target: 6800, done: 0, state: 'draft', start: '—', end: '—', qs: 8, lang: 'Telugu', owner: 'Arjun Rao' },
  ];
  M.QBANK = [
    { id: 'q1', sec: 'Respondent', t: 'Name (optional), age, gender, occupation, education, ward or village, household size', kind: 'Details · AI fills from voice' },
    { id: 'q2', sec: 'Respondent', t: 'Did your household receive any government scheme this year? Which ones?', kind: 'Multi choice' },
    { id: 'q3', sec: 'Government', t: 'How satisfied are you with the state government’s work?', kind: 'Scale 1–5' },
    { id: 'q4', sec: 'Government', t: 'How would you rate the Chief Minister?', kind: 'Scale 1–5' },
    { id: 'q5', sec: 'Opposition', t: 'How would you rate the main opposition leader?', kind: 'Scale 1–5' },
    { id: 'q6', sec: 'Local', t: 'How satisfied are you with your MLA?', kind: 'Scale 1–5' },
    { id: 'q7', sec: 'Issues', t: 'What is the biggest problem in your area right now?', kind: 'Voice · open' },
    { id: 'q8', sec: 'Issues', t: 'Which party do you trust most to solve it?', kind: 'Single choice' },
    { id: 'q9', sec: 'Vote', t: 'If the election were held today, whom would you vote for?', kind: 'Secret ballot' },
    { id: 'q10', sec: 'Vote', t: 'Whom did you vote for in 2024?', kind: 'Secret ballot' },
    { id: 'q11', sec: 'Open', t: 'Anything else you want the government to hear?', kind: 'Voice · open' },
  ];

  /* ---------------- users and roles ---------------- */
  M.ROLES = {
    admin: { name: 'Admin', who: 'Sets up rounds, users, quotas, compliance and costs', home: 'overview' },
    command: { name: 'Command Center', who: 'Supervisors and analysts: run the field, verify, analyse, report', home: 'overview' },
    field: { name: 'Field Surveyor', who: 'Collects interviews on the Android app', home: 'fieldapp' },
    client: { name: 'Client viewer', who: 'Reads results in the Client Portal', home: 'portal' },
  };
  /* what each role can do per module: 2 = full, 1 = view, 0 = none */
  M.PERMS = [
    ['Overview', 'overview', 2, 1, 0, 1], ['Surveys and questionnaires', 'surveys', 2, 1, 0, 0], ['Field force and live location', 'field', 2, 2, 0, 0],
    ['Verification queue', 'verify', 2, 2, 0, 0], ['Analytics', 'analytics', 2, 2, 0, 1], ['Map explorer', 'map', 2, 2, 0, 1],
    ['AI analyst', 'ai', 2, 2, 0, 1], ['Round notes', 'notes', 2, 2, 0, 1], ['Reports and downloads', 'reports', 2, 2, 0, 1],
    ['Users and roles', 'users', 2, 0, 0, 0], ['Settings and audit log', 'settings', 2, 0, 0, 0], ['Field App (own interviews only)', 'fieldapp', 1, 1, 2, 0],
  ];
  M.roleCan = (role, page) => { const i = { admin: 2, command: 3, field: 4, client: 5 }[role]; const row = M.PERMS.find((p) => p[1] === page); return row ? row[i] : 0; };
  const U0 = [
    ['Arjun Rao', 'admin', 'Whole state', 'Active', 'Now'], ['Meera Iyer', 'admin', 'Whole state', 'Active', '12 min ago'],
    ['Prakash Reddy', 'command', 'Guntur district', 'Active', '3 min ago', 'Supervisor'], ['Sunitha Naidu', 'command', 'Guntur, Bapatla', 'Active', '25 min ago', 'Supervisor'],
    ['Rahim Shaik', 'command', 'Kurnool, Nandyal', 'Active', '1 h ago', 'Supervisor'], ['Vasanth Kumar', 'command', 'Visakhapatnam, Anakapalli', 'Invited', 'Never', 'Supervisor'],
    ['Priya Menon', 'command', 'Whole state', 'Active', '8 min ago', 'Analyst'], ['Nikhil Varma', 'command', 'Whole state', 'Active', '2 h ago', 'Analyst'],
    ['Ravi K.', 'field', 'Guntur West · Booth 112', 'Active', 'Now'], ['Lakshmi P.', 'field', 'Guntur West · Booth 87', 'Active', '1 min ago'],
    ['Suresh M.', 'field', 'Guntur West · Booth 64', 'Active', '47 min ago'], ['Kiran B.', 'field', 'Guntur East · Booth 45', 'Suspended', '3 days ago'],
    ['Strategy desk', 'client', '175 seats (read only)', 'Active', 'Today'], ['Campaign office, Guntur', 'client', 'Guntur district (read only)', 'Active', 'Yesterday'],
  ];
  M.users = U0.map(([name, role, scope, status, last, sub], i) => ({ id: 'U' + (101 + i), name, role, sub: sub || '', scope, status, last, mfa: role !== 'field', phone: '+91 9' + (8000 + i * 37) + ' ••• ' + (12 + i * 3) }));

  /* ---------------- verification queue ---------------- */
  M.CHECKS = [
    ['fence', 'Inside the booth fence', 'GPS within 250 m of the booth'], ['length', 'Interview length', 'At least 6 minutes'], ['mock', 'No mock-GPS app', 'Device location is real'],
    ['voice', 'New voice', 'Not the same voice as earlier interviews'], ['consent', 'Consent recorded', 'Spoken consent in the clip'], ['pattern', 'Answer pattern', 'No straight-lining or rushed taps'],
    ['speed', 'Travel speed', 'Not too fast between interviews'], ['ai', 'Transcript confidence', 'Speech engine is sure of the words'], ['sarcasm', 'Tone check', 'Sarcasm and mixed tone resolved'],
  ];
  const SAYINGS = [
    { te: 'ఆహా, మా రోడ్లు అద్భుతంగా ఉన్నాయి! వర్షం వస్తే పడవలో వెళ్ళొచ్చు.', en: 'Oh wow, our roads are wonderful! When it rains we can go by boat.', issue: 'Roads', literal: 'positive', meant: 'negative', sar: 0.91, cues: ['“ఆహా” (oh wow) opens a complaint', 'Praise followed by a flood image', 'Flat, drawn-out tone and a short laugh', 'Same voter rated roads 1 of 5'] },
    { te: 'అవును, ఉద్యోగాలు చాలా ఇచ్చారు… మా అబ్బాయి ఇంకా ఖాళీగానే ఉన్నాడు.', en: 'Yes, they have given so many jobs… my son is still sitting idle.', issue: 'Jobs', literal: 'positive', meant: 'negative', sar: 0.84, cues: ['Agreement word, then a personal contradiction', 'Pause before the second half', 'Jobs is this ward’s top issue'] },
    { te: 'పెన్షన్ టైమ్‌కి వస్తుంది, నిజంగా బాగుంది.', en: 'The pension comes on time, it is really good.', issue: 'Welfare', literal: 'positive', meant: 'positive', sar: 0.06, cues: ['Warm, rising tone', 'No contradiction in other answers', 'Kept as genuine praise'] },
    { te: 'నీళ్ళు బాగానే వస్తున్నాయి లే… వారానికి ఒకసారి.', en: 'Water is coming fine, sure… once a week.', issue: 'Drinking water', literal: 'positive', meant: 'negative', sar: 0.58, cues: ['“లే” softens it, could be either', 'Qualifier undercuts the praise', 'Model unsure: sent to a reviewer'] },
    { te: 'MLA గారు బాగా పని చేస్తున్నారు, మా వీధికి డ్రైనేజీ వేశారు.', en: 'Our MLA is working well, he laid drainage on our street.', issue: 'MLA', literal: 'positive', meant: 'positive', sar: 0.04, cues: ['Concrete example backs the praise', 'Kept as genuine praise'] },
    { te: 'ధరలు తగ్గాయి అంటారు… మార్కెట్‌కి వెళ్ళి చూడండి.', en: 'They say prices have come down… go to the market and see.', issue: 'Prices', literal: 'positive', meant: 'negative', sar: 0.88, cues: ['Reported claim, then a challenge', 'Sharp falling tone at the end'] },
  ];
  M.SAYINGS = SAYINGS;
  M.queue = (() => {
    const r = rng(hash('queue'));
    const out = [];
    for (let i = 0; i < 36; i++) {
      const ag = M.agents[i % M.agents.length]; const a = byN.get(ag.ac); const s = SAYINGS[i % SAYINGS.length];
      const checks = {}; M.CHECKS.forEach(([k]) => (checks[k] = 'pass'));
      if (ag.status === 'fence' || i % 11 === 4) checks.fence = 'fail';
      if (ag.status === 'mock') { checks.mock = 'fail'; checks.speed = 'fail'; }
      if (i % 9 === 5) checks.length = 'warn';
      if (i % 13 === 7) checks.voice = 'fail';
      if (i % 7 === 2) checks.pattern = 'warn';
      if (s.sar > 0.4 && s.sar < 0.75) checks.sarcasm = 'warn';
      if (i % 10 === 8) checks.ai = 'warn';
      const fails = Object.values(checks).filter((v) => v === 'fail').length, warns = Object.values(checks).filter((v) => v === 'warn').length;
      const minute = 8 + Math.floor(r() * 50);
      out.push({
        id: 'IV-' + (481200 + i * 13), agent: ag.name, agentId: ag.id, ac: a.n, unit: ag.unit, booth: ag.booth, time: `${10 + Math.floor(i / 6)}:${String(minute).padStart(2, '0')}`,
        len: checks.length === 'warn' ? '4:12' : `${7 + Math.floor(r() * 6)}:${String(Math.floor(r() * 60)).padStart(2, '0')}`, dist: checks.fence === 'fail' ? 610 + Math.floor(r() * 900) : 20 + Math.floor(r() * 160),
        checks, say: s, status: fails ? 'review' : warns ? 'review' : 'auto', fails, warns, conf: (0.86 + r() * 0.12).toFixed(2),
        who: { name: ['Lakshmi', 'Venkata Rao', 'Fathima', 'Naga Raju', 'Sujatha', 'Prasanna'][i % 6], age: 22 + Math.floor(r() * 50), gender: i % 2 ? 'Male' : 'Female', job: ['Tailoring (self-employed)', 'Farmer', 'Homemaker', 'Auto driver', 'Teacher', 'Daily wage labour'][i % 6], edu: ['Class 10', 'Degree', 'Class 5', 'Intermediate'][i % 4], hh: 3 + Math.floor(r() * 4), edited: i % 4 === 1 ? ['age'] : i % 4 === 3 ? ['job'] : [] },
      });
    }
    return out;
  })();

  /* ---------------- round notes ---------------- */
  const NOTE_KEY = 'pi-notes-v1';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(NOTE_KEY) || '{}'); } catch (e) { saved = {}; }
  const f1 = (n) => (Math.round(n * 10) / 10).toFixed(1);
  M.draftNote = function (en, rd = M.round) {
    const v = M.vals(en, rd), p = rd > 0 ? M.vals(en, rd - 1) : null, nm = M.name(en);
    const dA = p ? v.A - p.A : 0, dG = p ? v.gov - p.gov : 0;
    const ld = M.PARTY[v.lead].name, sc = M.PARTY[v.second].name;
    const lead = v.margin < 1 ? `${ld} and ${sc} are level` : `${ld} leads ${sc} by ${f1(v.margin)} points`;
    const iss = v.iss.slice(0, 3).map(([k, x]) => `${k} (${Math.round(x)}%)`).join(', ');
    const cover = Math.round((v.iv / v.target) * 100);
    return {
      summary: `${M.ROUNDS[rd].name} in ${nm}: ${lead} (n = ${v.iv.toLocaleString('en-IN')}, ±${f1(v.moe)}). ${v.cls === 'Toss-up' && en.kind === 'ac' ? 'Treat as a toss-up.' : ''}`.trim(),
      politics: `Government approval ${Math.round(v.gov)}%${p ? ` (${dG >= 0 ? '+' : '−'}${f1(Math.abs(dG))} since ${M.ROUNDS[rd - 1].short})` : ''}. Chief Minister rating ${Math.round(v.cm)}%, main opposition leader ${Math.round(v.opp)}%. Party A ${p ? (dA >= 0 ? 'gained ' : 'lost ') + f1(Math.abs(dA)) + ' points' : 'baseline set'}. Anti-incumbency index ${Math.round(v.anti)} of 100.`,
      issues: `Top issues: ${iss}. Households that received a scheme back Party A at ${Math.round(v.welfA)}%, against ${Math.round(v.nonA)}% among the rest.`,
      field: `${cover}% of the interview target done, ${f1(v.verified)}% verified, ${v.flagged} flagged for fraud checks. ${v.sarcasm} sarcastic answers caught; ${v.review} went to a human reviewer.`,
      next: v.cls === 'Toss-up' ? 'Raise the sample to 1,500 next round and add a booth-level priority list.' : cover < 90 ? 'Close the interview gap before analysis is final; move two agents from finished booths.' : 'Keep the sample; add a youth (18–25) boost where the gap is widest.',
    };
  };
  M.note = function (en, rd = M.round) {
    const k = en.kind + ':' + en.id + ':' + rd;
    if (saved[k]) return saved[k];
    const st = M.noteStatus(en, rd);
    return { ...M.draftNote(en, rd), status: st, by: st === 'AI draft' ? 'AI analyst' : st === 'Reviewed' ? 'Prakash Reddy' : 'Priya Menon', at: st === 'AI draft' ? '' : 'Nov 3' };
  };
  M.saveNote = function (en, rd, note) {
    saved[en.kind + ':' + en.id + ':' + rd] = note;
    try { localStorage.setItem(NOTE_KEY, JSON.stringify(saved)); } catch (e) { /* private mode: keep in memory */ }
  };
  M.noteStatus = (en, rd = M.round) => {
    const k = en.kind + ':' + en.id + ':' + rd; if (saved[k]) return saved[k].status;
    const h = hash('ns' + k) % 10; return rd < 2 ? 'Approved' : h < 4 ? 'Approved' : h < 7 ? 'Reviewed' : 'AI draft';
  };

  /* ---------------- live feed ---------------- */
  M.feed = function (n = 8) {
    const r = rng(hash('feed' + Math.floor(Date.now() / 20000)));
    return Array.from({ length: n }, (_, i) => {
      const ag = M.agents[Math.floor(r() * M.agents.length)]; const a = byN.get(ag.ac); const s = SAYINGS[Math.floor(r() * SAYINGS.length)];
      return { ag, a, s, ago: i === 0 ? 'now' : `${i * 2 + Math.floor(r() * 2)} min ago`, ok: r() > 0.12 };
    });
  };
})();
