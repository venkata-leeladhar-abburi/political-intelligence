/* Political Intelligence Platform · reports
   One report description feeds three outputs: the on-screen preview, a real PDF (A4, built here,
   no library) and a CSV of every area in scope. */
(function () {
  'use strict';
  const PI = window.PI, M = window.M, U = window.U;
  const { DISTS, byN } = PI;
  const { IN, p0, f1, sg, esc } = U;

  M.REPORTS = [
    { id: 'state', name: 'State summary', icon: 'globe', desc: 'Where every party stands across 175 seats, with seat ranges and the districts that decide it.', fmts: ['pdf', 'csv'], scope: ['state'] },
    { id: 'district', name: 'District brief', icon: 'layers', desc: 'One district: seats, mandals, corporations and municipalities, issues and the round note.', fmts: ['pdf', 'csv'], scope: ['district'] },
    { id: 'ac', name: 'Constituency deep-dive', icon: 'pin', desc: 'One seat end to end: vote, leaders, issues, people, every mandal and urban body.', fmts: ['pdf', 'csv'], scope: ['ac'] },
    { id: 'unit', name: 'Mandal / urban body report', icon: 'building', desc: 'One mandal, corporation ward group, municipality or nagar panchayat.', fmts: ['pdf', 'csv'], scope: ['unit'] },
    { id: 'ro', name: 'Ruling vs opposition', icon: 'scale', desc: 'Approval, leader ratings, anti-incumbency and who is trusted on each issue.', fmts: ['pdf', 'csv'], scope: ['state', 'district', 'ac', 'unit'] },
    { id: 'issues', name: 'Issues and voices', icon: 'chat', desc: 'Top problems by area with change since last round and verified voter quotes.', fmts: ['pdf', 'csv'], scope: ['state', 'district', 'ac', 'unit'] },
    { id: 'field', name: 'Field operations', icon: 'route', desc: 'Coverage against target, agents, idle and offline time, payouts due.', fmts: ['pdf', 'csv'], scope: ['state', 'district', 'ac'] },
    { id: 'quality', name: 'Verification and quality', icon: 'shield', desc: 'Every check, what failed, sarcasm caught, human reviews and back-check calls.', fmts: ['pdf', 'csv'], scope: ['state', 'district', 'ac'] },
    { id: 'notes', name: 'Round notes pack', icon: 'note', desc: 'The approved note for the area and each area inside it, ready to share.', fmts: ['pdf'], scope: ['state', 'district', 'ac'] },
    { id: 'raw', name: 'Data export', icon: 'db', desc: 'Every area in scope as rows, down to mandals and urban bodies if you choose.', fmts: ['csv'], scope: ['state', 'district', 'ac'] },
  ];

  /* ---------- report description ---------- */
  M.buildReport = function ({ type, en, round = M.round }) {
    const keep = M.round; M.round = round;
    const v = M.vals(en), p = round > 0 ? M.vals(en, round - 1) : null, c = M.cuts(en), nm = M.name(en), R = M.ROUNDS[round];
    const kids = M.children(en);
    const T = M.REPORTS.find((r) => r.id === type) || M.REPORTS[0];
    const doc = {
      title: `${T.name}: ${nm}`, sub: `${M.kindLabel(en)} · ${R.name} · ${R.dates}`,
      meta: `n = ${IN(v.iv)} verified interviews · margin of error ${U.moe(v.iv)} at 95% · weighted by age, gender and area · demo data, illustrative`,
      kpis: [[p0(v.A), 'Party A (ruling)'], [p0(v.B), 'Party B (opposition)'], [`${M.lead(v)}`, 'Lead'], [p0(v.gov), 'Govt approval']],
      sec: [],
    };
    const intent = { h: 'Vote if the election were held today', bars: ['A', 'B', 'C', 'O', 'U'].map((k) => ({ l: M.PARTY[k].name, v: v[k], c: k, d: p ? v[k] - p[k] : null })) };
    const verdict = (() => {
      if (v.seats) return { h: 'Seat picture', p: `Party A ${v.seats.lo.A}–${v.seats.hi.A} seats, Party B ${v.seats.lo.B}–${v.seats.hi.B}${v.seats.hi.C ? `, Party C ${v.seats.lo.C}–${v.seats.hi.C}` : ''} of ${v.list.length}. ${v.seats.Safe} safe, ${v.seats.Lean} leaning, ${v.seats['Toss-up']} toss-ups.` };
      return { h: 'Verdict', p: `${M.PARTY[v.lead].name} leads ${M.PARTY[v.second].name} by ${f1(v.margin)} points: ${v.cls}. ${v.cls === 'Toss-up' ? 'Inside the margin of error.' : ''}` };
    })();
    const ro = { h: 'Ruling vs opposition', rows: [['Vote share', v.A, v.B], ['Leader rating (CM vs opposition leader)', v.cm, v.opp], ['Women', c.gender[0][1], c.gender[0][2]], ['Youth 18–25', c.age[0][1], c.age[0][2]], ['Households with a scheme', c.welfare[0][1], c.welfare[0][2]]] };
    const roNums = { h: 'Government standing', p: `Government approval ${p0(v.gov)}${p ? ` (${sg(v.gov - p.gov)} since ${M.ROUNDS[round - 1].short})` : ''}. Chief Minister rating ${p0(v.cm)}. Opposition leader ${p0(v.opp)}. MLA satisfaction ${p0(v.mla)}. Anti-incumbency index ${Math.round(v.anti)} of 100.` };
    const issues = { h: 'Biggest problems named', bars: v.iss.slice(0, 6).map(([k, x]) => { const pp = p && p.iss.find(([kk]) => kk === k); return { l: k, v: x, c: 'warm', d: pp ? x - pp[1] : null }; }) };
    const voices = { h: 'Voter voices (verified, translated from Telugu)', quotes: M.SAYINGS.slice(0, 3).map((s) => `“${s.en}” · ${s.issue}${s.sar > 0.75 ? ' · sarcasm detected, scored negative' : ''}`) };
    const n = M.note(en, round);
    const note = { h: `Round note (${n.status})`, p: [n.summary, n.politics, n.issues, n.field, 'Next: ' + n.next].join(' ') };
    const table = (title) => ({ h: title, table: { head: ['Area', 'Lead', 'A %', 'B %', 'Approval', 'n'], rows: kids.map((k) => { const x = M.vals(k); return [M.name(k), `${M.lead(x)}${x.cls && k.kind === 'ac' ? ' ' + x.cls : ''}`, p0(x.A), p0(x.B), p0(x.gov), IN(x.iv)]; }) } });
    const method = { h: 'Method', p: `Face-to-face interviews by trained agents on the offline Field App. Each interview carries a voice clip, GPS and time, and passes nine checks (booth fence, length, mock-GPS, same voice, consent, answer pattern, travel speed, transcript confidence, tone). Sarcasm is detected from words, tone and the voter's other answers; unsure clips go to a human reviewer. Results are weighted to the electoral roll. Areas under 100 interviews are not reported as percentages.` };
    if (type === 'state' || type === 'district' || type === 'ac' || type === 'unit') {
      doc.sec.push(verdict, intent, ro, roNums, issues);
      if (kids.length) doc.sec.push(table(M.childLabel(en)));
      if (type === 'ac' || type === 'unit') doc.sec.push({ h: 'People', rows: c.age.concat(c.gender), }, voices);
      doc.sec.push(note, method);
    } else if (type === 'ro') {
      doc.sec.push(ro, roNums, { h: 'Why people back Party A', bars: c.reasonsA.map(([l, x]) => ({ l, v: x, c: 'A' })) }, { h: 'Why people back Party B', bars: c.reasonsB.map(([l, x]) => ({ l, v: x, c: 'B' })) }, { h: 'Who is trusted to fix each issue', rows: c.trust }, { h: 'By occupation', rows: c.job });
      if (kids.length) doc.sec.push(table('By ' + M.childLabel(en).toLowerCase()));
      doc.sec.push(method);
    } else if (type === 'issues') {
      doc.sec.push(issues, { h: 'Who is trusted to fix each issue', rows: c.trust }, voices);
      if (kids.length) doc.sec.push({ h: 'Top issue by area', table: { head: ['Area', 'Top issue', 'Share', 'Second'], rows: kids.map((k) => { const x = M.vals(k); return [M.name(k), x.iss[0][0], p0(x.iss[0][1]), x.iss[1][0]]; }) } });
      doc.sec.push(method);
    } else if (type === 'field') {
      doc.kpis = [[p0(Math.min(100, (v.iv / v.target) * 100)), 'Of target done'], [IN(v.iv), 'Interviews'], [IN(M.FIELD.online), 'Agents online now'], [f1(v.verified) + '%', 'Verified']];
      doc.sec.push({ h: 'Coverage by area', table: { head: ['Area', 'Done', 'Target', 'Coverage', 'Verified'], rows: kids.map((k) => { const x = M.vals(k); return [M.name(k), IN(x.iv), IN(x.target), p0(Math.min(100, (x.iv / x.target) * 100)), f1(x.verified) + '%']; }) } },
        { h: 'Agents (Guntur team today)', table: { head: ['Agent', 'Seat', 'Done', 'Status', 'Score'], rows: M.agents.map((a) => [a.name + ' ' + a.id, byN.get(a.ac).name, `${a.done}/${a.target}`, M.AGENT_STATUS[a.status][0], a.score]) } }, method);
    } else if (type === 'quality') {
      doc.kpis = [[f1(v.verified) + '%', 'Verified'], [IN(v.flagged), 'Fraud flags'], [IN(v.sarcasm), 'Sarcasm caught'], [IN(v.review), 'Human reviews']];
      doc.sec.push({ h: 'Verification path', bars: [['Collected', v.iv + v.flagged], ['Passed auto checks', v.iv], ['Tone resolved', v.iv - v.review], ['Verified', Math.round((v.iv * v.verified) / 100)]].map(([l, x]) => ({ l, v: (x / (v.iv + v.flagged)) * 100, vt: IN(x), c: 'warm' })) },
        { h: 'Checks that failed most', table: { head: ['Check', 'What it tests', 'Failed'], rows: M.CHECKS.map(([k, l, d], i) => [l, d, IN(Math.round(v.flagged * [0.34, 0.18, 0.06, 0.12, 0.03, 0.11, 0.05, 0.07, 0.04][i]))]) } },
        { h: 'How sarcasm is handled', p: 'The speech engine scores what was said and how it was said: praise words next to a complaint, a flat or drawn-out tone, laughter, and answers that contradict the voter\'s ratings. Above 75% confidence the polarity is flipped and the clip is tagged; between 40% and 75% it goes to a Telugu-speaking reviewer; every decision is logged.' }, method);
    } else if (type === 'notes') {
      doc.sec.push(note);
      kids.forEach((k) => { const nn = M.note(k, round); doc.sec.push({ h: `${M.name(k)} (${nn.status})`, p: [nn.summary, nn.politics, nn.issues, 'Next: ' + nn.next].join(' ') }); });
    } else if (type === 'raw') {
      doc.sec.push({ h: 'Data export', p: 'This report is a CSV file. Choose CSV to download every area in scope.' });
    }
    M.round = keep;
    return doc;
  };

  /* ---------- HTML preview ---------- */
  const colOf = (c) => c === 'warm' ? '#e8710a' : c === 'A' ? '#d9650a' : c === 'B' ? '#6d3ef0' : c === 'C' ? '#c2408a' : c === 'O' ? '#8c869a' : c === 'U' ? '#cfc9da' : '#e8710a';
  M.previewHTML = function (doc, limit = 99) {
    return `<div class="paper"><div class="ph"><div><h4>${esc(doc.title)}</h4><div class="pm">${esc(doc.sub)}</div></div><div class="pm" style="text-align:right">Political Intelligence Platform<br>Prepared by One Stop Solutions</div></div>
      <div class="pk">${doc.kpis.map(([b, s]) => `<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join('')}</div>
      ${doc.sec.slice(0, limit).map((s) => `<div style="display:grid;gap:6px"><h5>${esc(s.h)}</h5>${s.p ? `<p>${esc(s.p)}</p>` : ''}${s.bars ? s.bars.map((b) => `<div class="pb"><span>${esc(b.l)}</span><span style="background:#f0edf5;border-radius:99px;overflow:hidden"><i style="width:${Math.min(100, b.v * (b.vt ? 1 : 1.6))}%;background:${colOf(b.c)}"></i></span><span>${b.vt || p0(b.v)}</span></div>`).join('') : ''}${s.rows ? s.rows.map(([l, a, b]) => `<div class="pb" style="grid-template-columns:150px 1fr 70px"><span>${esc(l)}</span><span style="display:flex;gap:2px"><i style="width:${a}%;background:${colOf('A')}"></i><i style="width:${b}%;background:${colOf('B')}"></i></span><span>${p0(a)} · ${p0(b)}</span></div>`).join('') : ''}${s.quotes ? s.quotes.map((q) => `<p>${esc(q)}</p>`).join('') : ''}${s.table ? `<table><thead><tr>${s.table.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${s.table.rows.slice(0, 12).map((r) => `<tr>${r.map((x) => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>${s.table.rows.length > 12 ? `<p class="pm">+ ${s.table.rows.length - 12} more rows in the download</p>` : ''}` : ''}</div>`).join('')}
      <div class="pm">${esc(doc.meta)}</div></div>`;
  };

  /* ---------- PDF (A4, Helvetica, WinAnsi) ---------- */
  const WIN = { '–': '\\226', '—': '\\227', '±': '\\261', '·': '\\267', '’': '\\222', '‘': '\\221', '“': '\\223', '”': '\\224', '…': '\\205', '•': '\\225', '−': '-', '₹': 'Rs ', ' ': ' ', '→': '->', '×': '\\327' };
  const enc = (s) => Array.from(String(s)).map((ch) => { const c = ch.charCodeAt(0); if (ch === '(' || ch === ')' || ch === '\\') return '\\' + ch; if (c < 128) return ch; return WIN[ch] != null ? WIN[ch] : ''; }).join('');
  const wid = (s, size, bold) => String(s).length * size * (bold ? 0.56 : 0.51);
  function PDF() {
    const W = 595, H = 842, pages = []; let cur, y;
    const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255].map((x) => x.toFixed(3)).join(' '); };
    const api = {
      W, H, M: 44,
      page() { cur = []; pages.push(cur); y = 54; return api; },
      get y() { return y; }, set y(v) { y = v; },
      need(h) { if (y + h > H - 50) { api.page(); } },
      text(x, yy, s, size = 10, bold = false, color = '#17122a') { cur.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${hex(color)} rg ${x.toFixed(1)} ${(H - yy).toFixed(1)} Td (${enc(s)}) Tj ET`); },
      rect(x, yy, w, h, color) { cur.push(`${hex(color)} rg ${x.toFixed(1)} ${(H - yy - h).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)} re f`); },
      line(x1, y1, x2, y2, color = '#e5e0ec', w = 0.8) { cur.push(`${hex(color)} RG ${w} w ${x1} ${H - y1} m ${x2} ${H - y2} l S`); },
      wrap(s, x, maxW, size = 10, bold = false, color = '#3a3450', lh = 1.42) {
        const words = String(s).split(/\s+/); let ln = '';
        const flush = () => { api.need(size * lh); api.text(x, y + size, ln, size, bold, color); y += size * lh; ln = ''; };
        words.forEach((w) => { const t = ln ? ln + ' ' + w : w; if (wid(t, size, bold) > maxW && ln) { flush(); ln = w; } else ln = t; });
        if (ln) flush();
      },
      out() {
        const objs = [];
        const add = (s) => { objs.push(s); return objs.length; };
        add('<< /Type /Catalog /Pages 2 0 R >>');
        add('PAGES');
        add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
        add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
        const kids = [];
        pages.forEach((ops, i) => {
          ops.push(`BT /F1 8 Tf 0.45 0.42 0.52 rg 44 26 Td (${enc(`Political Intelligence Platform · demo data, illustrative · page ${i + 1} of ${pages.length}`)}) Tj ET`);
          const stream = ops.join('\n');
          const ci = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
          kids.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${ci} 0 R >>`));
        });
        objs[1] = `<< /Type /Pages /Kids [${kids.map((k) => k + ' 0 R').join(' ')}] /Count ${kids.length} >>`;
        let s = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'; const offs = [];
        objs.forEach((o, i) => { offs.push(s.length); s += `${i + 1} 0 obj\n${o}\nendobj\n`; });
        const xref = s.length;
        s += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('');
        s += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
        const bytes = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i) & 255;
        return new Blob([bytes], { type: 'application/pdf' });
      },
    };
    return api;
  }
  M.toPDF = function (doc) {
    const P = PDF().page(), X = P.M, CW = P.W - P.M * 2;
    P.rect(0, 0, P.W, 118, '#111114'); P.rect(0, 116, P.W, 3, '#fe881b');
    P.text(X, 40, 'POLITICAL INTELLIGENCE PLATFORM', 8, true, '#ffa552');
    let ty = 64; const tw = doc.title.split(': ');
    P.text(X, ty, tw[0], 20, true, '#ffffff'); ty += 22; if (tw[1]) { P.text(X, ty, tw.slice(1).join(': '), 14, false, '#e8e3f2'); ty += 14; }
    P.text(X, 108, doc.sub, 9, false, '#b9b3c6');
    P.y = 140;
    const kw = (CW - 18) / 4;
    doc.kpis.forEach(([b, s], i) => { const x = X + i * (kw + 6); P.rect(x, P.y, kw, 52, '#f4f1f8'); P.text(x + 10, P.y + 24, b, 16, true); P.text(x + 10, P.y + 40, s, 8, false, '#6a6380'); });
    P.y += 72;
    doc.sec.forEach((s) => {
      P.need(46);
      P.text(X, P.y + 11, s.h, 11.5, true); P.y += 20;
      if (s.p) { P.wrap(s.p, X, CW, 9.5); P.y += 4; }
      if (s.bars) s.bars.forEach((b) => { P.need(16); P.text(X, P.y + 9, b.l, 9); P.rect(X + 150, P.y + 2, CW - 230, 8, '#f0edf5'); P.rect(X + 150, P.y + 2, Math.max(1, Math.min(1, (b.vt ? b.v : b.v * 1.6) / 100) * (CW - 230)), 8, colOf(b.c)); P.text(X + CW - 70, P.y + 9, (b.vt || p0(b.v)) + (b.d != null ? `  ${sg(b.d)}` : ''), 9, true); P.y += 15; });
      if (s.rows) { s.rows.forEach(([l, a, b]) => { P.need(16); P.text(X, P.y + 9, l, 9); const bw = (CW - 260) / Math.max(100, a + b + 2); P.rect(X + 170, P.y + 2, a * bw, 8, colOf('A')); P.rect(X + 170 + a * bw + 2, P.y + 2, b * bw, 8, colOf('B')); P.text(X + CW - 78, P.y + 9, `A ${p0(a)} · B ${p0(b)}`, 9, true); P.y += 15; }); }
      if (s.quotes) s.quotes.forEach((q) => P.wrap(q, X, CW, 9.5, false, '#3a3450'));
      if (s.table) {
        const cols = s.table.head.length, first = Math.min(190, CW * 0.36), rest = (CW - first) / (cols - 1);
        const cx = (i) => X + (i === 0 ? 0 : first + (i - 1) * rest);
        const headRow = () => { P.need(18); P.rect(X, P.y, CW, 16, '#f4f1f8'); s.table.head.forEach((h, i) => P.text(cx(i) + 4, P.y + 11, h, 8, true, '#2d2d34')); P.y += 18; };
        headRow();
        s.table.rows.forEach((r) => { if (P.y + 15 > P.H - 50) { P.page(); headRow(); } r.forEach((x, i) => P.text(cx(i) + 4, P.y + 10, String(x).slice(0, i === 0 ? 34 : 22), 8.5, i === 0)); P.line(X, P.y + 14, X + CW, P.y + 14); P.y += 15; });
      }
      P.y += 12;
    });
    P.need(40); P.line(X, P.y, X + CW, P.y, '#17122a', 1); P.y += 6; P.wrap(doc.meta, X, CW, 8, false, '#6a6380');
    P.wrap('Prepared by One Stop Solutions · November 2026. Party names are placeholders; all figures are demo data.', X, CW, 8, false, '#6a6380');
    return P.out();
  };

  /* ---------- CSV ---------- */
  M.toCSV = function (en, round = M.round, deep = false) {
    const keep = M.round; M.round = round;
    const head = ['Level', 'Name', 'Type', 'District', 'Constituency', 'Interviews (n)', 'Margin of error ±', 'Party A %', 'Party B %', 'Party C %', 'Others %', 'Undecided %', 'Lead', 'Margin pts', 'Call', 'Govt approval %', 'CM rating %', 'Opposition leader %', 'Anti-incumbency (0-100)', 'Positive %', 'Neutral %', 'Negative %', 'Top issue', 'Second issue', 'Verified %', 'Fraud flags', 'Sarcasm caught', 'Note status', 'Round'];
    const rows = [];
    const row = (e) => {
      const v = M.vals(e); const a = e.kind === 'ac' ? byN.get(e.id) : e.kind === 'unit' ? byN.get(M.unitById(e.id).ac) : null;
      const type = e.kind === 'unit' ? M.KIND[M.unitById(e.id).kind] : a ? `${a.type} · ${M.SEAT_KIND[M.seatKind(a)]}` : M.kindLabel(e);
      rows.push([M.kindLabel(e), M.name(e), type, e.kind === 'district' ? M.name(e) : a ? DISTS[a.dist - 1].name : '', a ? a.name : '', v.iv, f1(v.moe), f1(v.A), f1(v.B), f1(v.C), f1(v.O), f1(v.U), M.PARTY[v.lead].name, f1(v.margin), e.kind === 'ac' || e.kind === 'unit' ? v.cls : '', f1(v.gov), f1(v.cm), f1(v.opp), Math.round(v.anti), f1(v.pos), f1(v.neu), f1(v.neg), v.iss[0][0], v.iss[1] ? v.iss[1][0] : '', f1(v.verified), v.flagged, v.sarcasm, M.noteStatus(e, round), M.ROUNDS[round].name]);
    };
    row(en);
    const walk = (e, depth) => M.children(e).forEach((k) => { row(k); if (deep && depth < 3) walk(k, depth + 1); });
    if (en.kind === 'state' && !deep) PI.ACS.forEach((a) => row({ kind: 'ac', id: a.n })); else walk(en, 0);
    M.round = keep;
    const q = (x) => { const s = String(x); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    return '﻿' + [head, ...rows].map((r) => r.map(q).join(',')).join('\r\n');
  };

  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  M.history = [];
  M.exportReport = function ({ type, en, format = 'pdf', round = M.round, deep = false }) {
    const R = M.ROUNDS[round], T = M.REPORTS.find((r) => r.id === type) || M.REPORTS[0];
    const name = `${slug(T.name)}-${slug(M.name(en))}-${slug(R.short)}.${format}`;
    if (format === 'csv') U.download(name, M.toCSV(en, round, deep), 'text/csv;charset=utf-8');
    else U.download(name, M.toPDF(M.buildReport({ type, en, round })));
    M.history.unshift({ name, type: T.name, area: M.name(en), round: R.short, format: format.toUpperCase(), at: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), args: { type, en, format, round, deep } });
    U.toast(`Downloading ${name}`);
    document.dispatchEvent(new CustomEvent('reportmade'));
  };
})();
