/* Political Intelligence Platform · page sections */
(function () {
  'use strict';
  const P = window.PI, AP = window.AP;
  const { $, $$, IN, RS, f1, pc, sgn, ic, esc, clamp, reduced, PARTY, ACS, DISTS, byN, STATE, REG, demo, moeTxt, hbars,
    sentDonut, intentBars, quoteFor, issueC, MapView, Panel, tabs, legendHTML, METRICS, mix, ramp, rng, SENT_STOPS,
    shapeSVG, waveBars, donut } = P;
  const GW = byN.get(94);

  /* ---------------- nav ---------------- */
  function Nav() {
    const nav = $('#nav'), menu = $('#navMenu'), links = $$('#navLinks a');
    /* the bar stays fixed at the top of every page: no hide-on-scroll */
    const close = () => { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open menu'); };
    menu.addEventListener('click', () => { const o = nav.classList.toggle('is-open'); menu.setAttribute('aria-expanded', String(o)); menu.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); });
    links.forEach((a) => a.addEventListener('click', close));
    nav.querySelector('.btn').addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { close(); menu.focus(); } });
    const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.removeAttribute('aria-current'));
      const a = map.get(e.target.id); if (a) a.setAttribute('aria-current', 'true');
    }), { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------------- reveal ---------------- */
  function Reveal() {
    const els = $$('.rv');
    if (!('IntersectionObserver' in window) || reduced) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -2% 0px', threshold: 0 });
    els.forEach((e) => io.observe(e));
  }

  /* ---------------- hero tilt ---------------- */
  /* motion.css drives the tilt from the scroll position where the browser supports scroll
     timelines; elsewhere the stage is measured once and only scrollY is read per frame */
  function HeroTilt() {
    const stage = $('#heroStage'); if (!stage || reduced) return;
    if (window.CSS && CSS.supports('animation-timeline: view()')) return;
    const br = stage.querySelector('.browser');
    let raf = 0, top = 0, vh = 0;
    const measure = () => { top = stage.offsetTop; let p = stage.offsetParent; while (p) { top += p.offsetTop; p = p.offsetParent; } vh = window.innerHeight; };
    const upd = () => {
      raf = 0;
      const t = clamp(1 - (top - window.scrollY - vh * 0.12) / (vh * 0.62), 0, 1);
      br.style.transform = `rotateX(${((1 - t) * 16).toFixed(2)}deg) scale(${(0.93 + 0.07 * t).toFixed(3)})`;
    };
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    window.addEventListener('resize', () => { measure(); upd(); });
    measure(); upd();
  }

  /* ---------------- contents ---------------- */
  const CT = [
    ['phone', 'Field App', 'An Android app that collects interviews offline, in Telugu, with a voice clip, GPS and time on every answer.', ['Offline sync', 'Voice clips', 'GPS fence', 'Secret ballot', 'Consent'], '#apps', 'See the Field App'],
    ['laptop', 'Command Center', 'Plan rounds, set quotas, watch agents live and review every flagged interview from one screen.', ['Survey builder', 'Quotas', 'Live field map', 'Quality queue', 'Agent pay'], '#apps', 'See the Command Center'],
    ['crown', 'Client Portal', 'A calm summary for leaders and strategists on laptop and phone, with reports in Telugu and English.', ['Seat summaries', 'Evidence player', 'PDF reports', 'Alerts'], '#apps', 'See the Client Portal'],
    ['map', 'Live Map', 'All 28 districts and 175 seats. Switch what the map shows and click anywhere for the full story.', ['28 districts', '175 seats', '5 map modes', 'Search', 'Drill-down'], 'demo.html#map', 'Open the live map'],
    ['bars', 'Analytics', 'Mood, intention, issues, age and gender cuts, round-by-round change and the seat outlook.', ['Sentiment', 'Intention', 'Issues', 'Age and gender', 'Round vs round'], 'demo.html#demo-command', 'See the dashboards'],
    ['spark', 'AI Analyst', 'Ask in English or Telugu. Get the numbers, the margin of error and the voices behind them.', ['English and Telugu', 'Numbers and quotes', 'Sample and margin', 'Guardrails'], 'demo.html#ask', 'Try Ask the Data'],
    ['ear', 'Speech Engine', 'Our own Telugu speech engine turns voice into text and scores every issue, for about ₹0.04 a minute.', ['Telugu speech', 'Issue sentiment', 'Emotion', 'Human review'], 'how.html#engine', 'See the speech engine'],
    ['shield', 'Fraud Shield', 'Every interview is checked: booth fence, length, fake GPS, and a voice already heard elsewhere.', ['Geo-fence', 'Duration', 'Mock GPS', 'Same voice', 'Back-checks'], 'how.html#how', 'See the checks'],
    ['coins', 'Savings', 'See what paid speech APIs would cost, what our engine saves, and the full monthly bill.', ['Cost calculator', 'Monthly bill', 'Simple charges'], '#savings', 'Estimate your savings'],
  ];
  function Contents() {
    const grid = $('#ctGrid'); if (!grid) return;
    grid.innerHTML = CT.map(([i, t], k) => `<button type="button" class="ct-tile" data-k="${k}" aria-pressed="${k === 0}"><span class="ring">${ic(i)}</span>${esc(t)}</button>`).join('');
    const title = $('#ctTitle'), text = $('#ctText'), chips = $('#ctChips'), link = $('#ctLink');
    const set = (k) => {
      const [, t, d, c, href, l] = CT[k];
      title.textContent = t; text.textContent = d;
      chips.innerHTML = c.map((x) => `<span>${esc(x)}</span>`).join('');
      link.href = href; link.firstChild.textContent = l + ' ';
      $$('.ct-tile', grid).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.k === k)));
    };
    grid.addEventListener('click', (e) => { const b = e.target.closest('.ct-tile'); if (b) set(+b.dataset.k); });
    grid.addEventListener('mouseover', (e) => { const b = e.target.closest('.ct-tile'); if (b && window.matchMedia('(hover: hover)').matches) set(+b.dataset.k); });
    grid.addEventListener('focusin', (e) => { const b = e.target.closest('.ct-tile'); if (b) set(+b.dataset.k); });
    set(0);
  }

  /* ---------------- problem / solution art ---------------- */
  function Art() {
    const old = $('#artOld'), neu = $('#artNew');
    const form = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect width="104" height="132" rx="10" fill="#fff" stroke="rgba(26,11,84,.14)" stroke-width="1.5"/>${[22, 40, 58, 76, 94].map((yy, i) => `<rect x="14" y="${yy}" width="${[76, 60, 70, 48, 64][i]}" height="7" rx="3.5" fill="rgba(26,11,84,${i % 2 ? 0.08 : 0.14})"/>`).join('')}<circle cx="80" cy="112" r="11" fill="#fde3e8"/><text x="80" y="117" text-anchor="middle" style="font:800 14px var(--font)" fill="#c03852">?</text></g>`;
    if (old) old.innerHTML = `<svg viewBox="0 0 520 210" aria-hidden="true">${form(42, 46, -9)}${form(150, 30, 4)}${form(258, 50, -3)}<g transform="translate(392 44)"><rect width="100" height="118" rx="14" fill="#fff" stroke="rgba(26,11,84,.14)" stroke-width="1.5"/><rect width="100" height="32" rx="14" fill="#c03852"/><rect y="18" width="100" height="14" fill="#c03852"/><text x="50" y="22" text-anchor="middle" fill="#fff" style="font:700 12px var(--font)">REPORT DUE</text><text x="50" y="78" text-anchor="middle" fill="#1a0b54" style="font:700 30px var(--font)">3–4</text><text x="50" y="100" text-anchor="middle" fill="rgba(26,11,84,.64)" style="font:600 13px var(--font)">weeks later</text></g></svg>`;
    if (neu) neu.innerHTML = `<svg viewBox="0 0 520 210" aria-hidden="true"><defs><linearGradient id="artG" x1="0" x2="1"><stop offset="0" stop-color="#1b4dfe"/><stop offset=".5" stop-color="#ac24ff"/><stop offset="1" stop-color="#fe881b"/></linearGradient></defs>
      <g transform="translate(40 26)"><rect width="92" height="160" rx="18" fill="#f9f9f9"/><rect x="10" y="14" width="72" height="8" rx="4" fill="rgba(26,11,84,.14)"/><circle cx="46" cy="70" r="22" fill="url(#artG)"/><use href="#i-mic" x="35" y="59" width="22" height="22" style="color:#fff"/>${[...Array(9)].map((_, i) => `<rect x="${14 + i * 7.5}" y="${112 - [8, 14, 20, 12, 22, 16, 10, 18, 9][i] / 2}" width="4.5" height="${[8, 14, 20, 12, 22, 16, 10, 18, 9][i]}" rx="2" fill="#8130ff"/>`).join('')}<rect x="10" y="132" width="72" height="16" rx="8" fill="#7f5af0"/></g>
      <g transform="translate(150 70)"><rect width="104" height="30" rx="15" fill="rgba(61,220,151,.18)"/><use href="#i-pin" x="10" y="7" width="16" height="16" style="color:#3fbf8a"/><text x="32" y="20" fill="#fff" style="font:700 12px var(--font)">GPS · 6:12</text></g>
      <path d="M262 106h46" stroke="url(#artG)" stroke-width="3" stroke-dasharray="6 6"><animate attributeName="stroke-dashoffset" from="24" to="0" dur="1s" repeatCount="indefinite"/></path><path d="M304 98l10 8-10 8" fill="none" stroke="#ca45ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <g transform="translate(330 30)"><rect width="160" height="150" rx="18" fill="rgba(255,255,255,.08)"/>${[[56, '#fe881b'], [38, '#b997ff'], [26, '#8130ff'], [18, '#ffd600']].map(([w, c], i) => `<rect x="16" y="${26 + i * 26}" width="${w * 2.2}" height="12" rx="6" fill="${c}"/>`).join('')}<circle cx="136" cy="128" r="12" fill="#3fbf8a"/><path d="M130 128l4 4 8-9" fill="none" stroke="#0b2a1d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
  }

  /* ---------------- scale ---------------- */
  function Scale() {
    const zs = $('#zState'), zd = $('#zDist'), za = $('#zAc');
    if (zs) zs.innerHTML = `<defs><linearGradient id="zsG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b997ff"/><stop offset=".5" stop-color="#ca45ff"/><stop offset="1" stop-color="#fe881b"/></linearGradient><filter id="zsB"><feGaussianBlur stdDeviation="18"/></filter></defs><path d="${AP.state}" fill="url(#zsG)" opacity=".55" filter="url(#zsB)"/><path d="${AP.state}" fill="url(#zsG)"/>`;
    if (zd) zd.innerHTML = DISTS.map((d, i) => `<path d="${d.d}" fill="${ramp(['#300681', '#8130ff', '#ac24ff', '#ca45ff', '#fe881b', '#ffd600'], (i % 7) / 6)}" stroke="#050506" stroke-width="2.5"/>`).join('');
    if (za) za.innerHTML = ACS.map((a) => `<path d="${a.d}" fill="${ramp(SENT_STOPS, (a.pos - 40) / 26)}" stroke="#050506" stroke-width="1.2"/>`).join('');
    const dots = (cv, perAc, size, colors, seed) => {
      if (!cv || !cv.getContext) return;
      const ctx = cv.getContext('2d'), sx = cv.width / 1000, sy = cv.height / 853, r = rng(seed);
      ctx.setTransform(sx, 0, 0, sy, 0, 0);
      ACS.forEach((a) => {
        const p = new Path2D(a.d); const [x0, y0, x1, y1] = a.bb; const k = perAc(a);
        let placed = 0, tries = 0;
        while (placed < k && tries < k * 30) {
          tries++;
          const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0);
          if (!ctx.isPointInPath(p, x * sx, y * sy)) continue;
          ctx.fillStyle = colors[Math.floor(r() * colors.length)];
          ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
          placed++;
        }
      });
    };
    dots($('#zBooth'), (a) => Math.round(a.bo * 0.42), 3.4, ['#b997ff', '#8130ff', '#ac24ff', '#dd95ff'], 5);
    dots($('#zVoter'), (a) => (a.urban ? 120 : 52), 1.8, ['#fe881b', '#ffd600', '#f79fff', '#ca45ff', '#ffb340'], 9);
  }

  /* ---------------- engine side visuals ---------------- */
  function Voice() {
    const w = $('#vWave'); if (!w) return;
    const r = rng(12); let s = '';
    for (let i = 0; i < 46; i++) { const h = 20 + Math.abs(Math.sin(i * 0.5)) * 55 + r() * 25; s += `<i style="height:${Math.round(h)}%;animation-delay:${-(i * 0.07).toFixed(2)}s"></i>`; }
    w.innerHTML = s;
  }

  /* ---------------- personas ---------------- */
  const PERSONAS = [
    { i: 'phone', app: ['phone', 'Field App'], name: 'Ravi, 24', role: 'Field agent · Guntur West', quote: 'I walk eight hours in the sun. The app has to work with one thumb and no signal.', meta: [['Device', 'Budget Android'], ['Where', 'Villages, patchy 4G'], ['Language', 'Telugu first'], ['Uses it', 'All day, outdoors']], goals: ['Finish 25 good interviews a day', 'Get paid fairly and on time', 'Never lose a saved interview'], pains: ['No signal in many booths', 'Glare on the screen', 'Long forms, small buttons'],
      flow: [['phone', 'Sign in with a PIN', 'Field App'], ['target', "See today's target", 'Today'], ['pin', 'Reach the booth', 'GPS check'], ['shield', 'Read consent aloud', 'Consent'], ['clip', 'Tap the answers', 'Questions'], ['mic', 'Record open answers', 'Recorder'], ['lock', 'Voter votes privately', 'Secret ballot'], ['refresh', 'Save now, sync later', 'Sync queue']], key: [5, 7] },
    { i: 'users', app: ['laptop', 'Command Center'], name: 'Lakshmi, 35', role: 'District supervisor · Guntur', quote: 'I need to know which booth is behind before lunch, not at the end of the week.', meta: [['Device', 'Phone and laptop'], ['Where', 'District office, field'], ['Language', 'Telugu and English'], ['Uses it', 'Every day of a round']], goals: ['Hit every quota on time', 'Catch fake interviews early', 'Keep agents motivated'], pains: ['No live view of the field', 'Checking audio by hand', 'Late, messy reports'],
      flow: [['map', 'Open the live field map', 'Field Ops'], ['alert', 'Spot lagging booths', 'Alerts'], ['users', 'Move agents', 'Assign'], ['shield', 'Review flagged interviews', 'Quality queue'], ['play', 'Listen to the clip', 'Evidence'], ['check', 'Approve or reject', 'Decision'], ['refresh', 'Order a back-check', 'Back-checks']], key: [3, 5] },
    { i: 'bars', app: ['laptop', 'Command Center'], name: 'Arjun, 29', role: 'Data analyst', quote: 'Give me clean, weighted numbers, with the margin on every one.', meta: [['Device', 'Laptop, two screens'], ['Where', 'Office'], ['Language', 'English'], ['Uses it', 'Hours a day']], goals: ['Trustworthy weighted results', 'Fast round-on-round compare', 'Reports without copy-paste'], pains: ['Raw spreadsheets', 'Hand-coding open answers', 'No method trail'],
      flow: [['bars', 'Open Analytics', 'Analytics'], ['filter', 'Filter round and region', 'Filters'], ['swap', 'Compare Round 1 and 2', 'Compare'], ['users', 'Drill into age and gender', 'Demographics'], ['scale', 'Check sample and margin', 'Method'], ['file', 'Build the report', 'Reports']], key: [2, 4] },
    { i: 'crown', app: ['phone', 'Client Portal'], name: 'Mr. Rao, 52', role: 'Campaign strategist', quote: 'Tell me where we stand, why, and where to act. On one screen.', meta: [['Device', 'Phone first'], ['Where', 'On the move, war room'], ['Language', 'Telugu and English'], ['Uses it', 'A few minutes, often']], goals: ['Know where the party stands', 'Understand why', 'Decide where to act'], pains: ['Long PDFs and jargon', 'Numbers without proof', 'Waiting weeks for reports'],
      flow: [['home', 'Open the portal', 'Portal home'], ['map', 'Tap a district', 'Map'], ['pin', 'Read the seat summary', 'Seat page'], ['spark', 'Ask why', 'AI Analyst'], ['play', 'Hear the voters', 'Evidence'], ['share', 'Share the brief', 'Reports']], key: [3] },
    { i: 'sliders', app: ['laptop', 'Command Center'], name: 'Sameer, 31', role: 'Platform admin', quote: 'Setting up a round should take an afternoon, not a week.', meta: [['Device', 'Laptop'], ['Where', 'Office'], ['Language', 'English'], ['Uses it', 'Before and during rounds']], goals: ['Launch rounds quickly', 'Right access for each person', 'Stay inside the law'], pains: ['Manual user setup', 'Unclear costs', 'Compliance worries'],
      flow: [['clip', 'Create the round', 'Surveys'], ['pen', 'Build the questionnaire', 'Builder'], ['target', 'Set quotas and booths', 'Quotas'], ['users', 'Add agents and roles', 'Users'], ['lock', 'Set election-silence dates', 'Compliance'], ['coins', 'Watch costs', 'Billing']], key: [4] },
  ];
  function People() {
    const tl = $('#perTabs'), card = $('#perCard'); if (!tl) return;
    const n2 = (n) => String(n).padStart(2, '0');
    tl.innerHTML = PERSONAS.map((p, i) => `<button type="button" class="per-tab" role="tab" id="pt${i}" aria-controls="perCard" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-i="${i}"><span class="pt-n">${n2(i + 1)}</span><span class="pt-t"><b>${esc(p.name.split(',')[0])}</b><small>${esc(p.role.split(' · ')[0])}</small></span>${ic('chev', 'pt-c')}</button>`).join('');
    const draw = (i) => {
      const p = PERSONAS[i], [name, age] = p.name.split(', ');
      card.setAttribute('aria-labelledby', 'pt' + i);
      card.classList.remove('in');
      card.innerHTML = `<header class="pb-top"><span class="pb-mark">${ic(p.i)}</span><div class="pb-id"><h3>${esc(name)}<span>, ${esc(age)}</span></h3><p>${esc(p.role)}</p></div><div class="pb-app"><span class="pb-count">${n2(i + 1)} / ${n2(PERSONAS.length)}</span><span class="pb-badge">${ic(p.app[0])}${esc(p.app[1])}</span></div></header>
        <blockquote class="pb-quote"><p>${esc(p.quote)}</p></blockquote>
        <dl class="pb-spec">${p.meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        <div class="pb-lists"><div><h4>Goals</h4><ul class="goal">${p.goals.map((g) => `<li>${ic('check')}${esc(g)}</li>`).join('')}</ul></div><div><h4>Frustrations</h4><ul class="pain">${p.pains.map((g) => `<li>${ic('minus')}${esc(g)}</li>`).join('')}</ul></div></div>
        <div class="pb-journey"><div class="pj-h"><h4>${esc(name)}'s journey</h4><span>${p.flow.length} steps · <em>${p.key.length}</em> designed with extra care</span></div><ol class="pj" style="--n:${p.flow.length}">${p.flow.map(([ico, t, s], k) => `<li class="${p.key.includes(k) ? 'key' : ''}" style="--k:${k}"><i>${ic(ico)}</i><span><b>${esc(t)}</b><small>${esc(s)}</small>${p.key.includes(k) ? '<em>Extra care</em>' : ''}</span></li>`).join('')}</ol></div>`;
      requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('in')));
    };
    tabs(tl, (b) => draw(+b.dataset.i));
    draw(0);
  }

  /* ---------------- sitemap + UX ---------------- */
  const SMAP = [
    ['phone', '#7f5af0', 'Field App', 'Android · works offline', [['Sign in with PIN'], ['Today', ['Target', 'Booths', 'Sync status']], ['Interview', ['Consent', 'Questions', 'Voice recorder', 'Secret ballot']], ['Sync queue'], ['My earnings'], ['Help and training']]],
    ['laptop', '#8130ff', 'Command Center', 'Web · admins and supervisors', [['Overview'], ['Surveys', ['Builder', 'Question bank', 'Quotas and booths']], ['Field Ops', ['Live map', 'Agents', 'Pay']], ['Quality', ['Flags', 'Audio review', 'Back-checks']], ['Analytics'], ['AI Analyst'], ['Reports'], ['Admin', ['Users and roles', 'Election silence', 'Audit log', 'Costs']]]],
    ['crown', '#fe881b', 'Client Portal', 'Web and phone · strategists', [['Overview'], ['Map explorer', ['District pages', 'Seat pages']], ['AI Analyst'], ['Evidence player'], ['Reports'], ['Alerts']]],
  ];
  const UX = [
    ['Five-second rule', 'Every screen answers its main question in big type first. Detail waits one click away.', '<div style="text-align:center"><b style="font-size:46px;font-weight:700;letter-spacing:-.03em;line-height:1">52%</b><div style="font-size:12.5px;color:var(--ink-2);font-weight:600;margin-top:4px">positive mood</div></div>'],
    ['Telugu first', 'Every label, question and report comes in Telugu and English, with numbers in lakh and crore.', '<div class="seg on-light sm" aria-hidden="true"><button type="button" tabindex="-1" aria-selected="true">తెలుగు</button><button type="button" tabindex="-1">English</button></div>'],
    ['Built for sun and one thumb', '56 px touch targets, strong contrast and a field mode for bright light.', `<span class="btn btn-ink" aria-hidden="true">${ic('check')}Save interview</span>`],
    ['Offline is normal', 'Saved work is always visible. An interview is never lost, signal or not.', `<div style="display:grid;gap:8px;justify-items:center"><span class="ph-pill off" style="font-size:12.5px;height:30px;padding:0 12px">${ic('wifioff')} No signal · 6 saved</span><span class="ph-pill ok" style="font-size:12.5px;height:30px;padding:0 12px">${ic('check')} Synced</span></div>`],
    ['Evidence one tap away', 'Every number shows its sample, its margin and the voices behind it.', '<div style="display:grid;gap:6px;justify-items:center"><b style="font-size:32px;line-height:1">41%</b><span class="badge" style="background:#fff;color:var(--ink)">n = 1,084 · ±3.0%</span></div>'],
    ['Detail on demand', 'State, district, seat, booth. Each level opens from the one above it.', `<div style="display:flex;gap:4px;align-items:center;font-size:12.5px;font-weight:700;flex-wrap:wrap;justify-content:center">${['State', 'Guntur', 'Guntur West', 'Booth 112'].map((x, i) => `${i ? '<svg width="14" height="14" aria-hidden="true" style="transform:rotate(-90deg)"><use href="#i-chev"/></svg>' : ''}<span style="padding:6px 10px;border-radius:10px;background:${i === 3 ? 'var(--ink)' : '#fff'};color:${i === 3 ? '#fff' : 'var(--ink)'}">${x}</span>`).join('')}</div>`],
    ['Honest numbers', 'Ranges instead of fake precision, and a clear refusal when a sample is too small.', '<div style="width:86%"><div style="position:relative;height:12px;border-radius:12px;background:#fff"><i style="position:absolute;left:38%;width:18%;top:0;bottom:0;border-radius:12px;background:linear-gradient(90deg,#1b4dfe,#ac24ff 50%,#fe881b)"></i></div><div style="display:flex;justify-content:space-between;font-size:12px;margin-top:8px;font-weight:600"><span>Party B 41–47%</span><b>Toss-up</b></div></div>'],
    ['Accessible to everyone', 'WCAG 2.2 AA contrast, full keyboard use and screen-reader labels throughout.', '<div style="display:flex;gap:10px;align-items:center"><span style="width:56px;height:56px;border-radius:16px;background:var(--ink);color:#fff;display:grid;place-items:center;font-weight:800;font-size:19px;outline:2px solid #b997ff;outline-offset:3px">Aa</span><span style="font-weight:800;font-size:22px">7.1 : 1</span></div>'],
  ];
  function Sitemap() {
    const el = $('#smap'); if (!el) return;
    const tree = (items) => `<ul class="tree">${items.map(([n, kids]) => `<li><span>${esc(n)}</span>${kids ? `<ul>${kids.map((k) => `<li><span>${esc(k)}</span></li>`).join('')}</ul>` : ''}</li>`).join('')}</ul>`;
    el.innerHTML = SMAP.map(([i, c, t, s, items], k) => `<div class="sm-col rv" style="--d:${k * 90}ms"><header><i style="background:${c}">${ic(i)}</i><span><b>${t}</b><small>${s}</small></span></header>${tree(items)}</div>`).join('');
    const ux = $('#uxRules');
    if (ux) ux.innerHTML = UX.map(([t, d, demoH], k) => `<div class="ux-p rv" style="--d:${(k % 4) * 70}ms"><div class="demo">${demoH}</div><h4>${t}</h4><p>${d}</p></div>`).join('');
  }

  /* ---------------- map explorer ---------------- */
  function Explorer() {
    const box = $('#mapBox'), panelEl = $('#mapPanel'); if (!box || !panelEl) return;
    let level = 'district', metric = 'sent', region = null;
    const legend = $('#mapLegend');
    const setLegend = () => (legend.innerHTML = legendHTML(METRICS[metric].legend(level)));
    const panel = Panel(panelEl, { en: { kind: 'district', id: 15 }, onPick: (en) => map.select(en.kind, en.id) });
    const map = MapView(box, { level, metric, labelMin: 2500, labelSize: 12.5, selKind: 'district', selId: 15, onSelect: (en) => { map.select(en.kind, en.id); panel.show(en); } });
    setLegend();
    const lvlTabs = tabs($('#lvlSeg'), (b) => {
      level = b.dataset.l; const cur = panel.current();
      const en = level === 'district' ? { kind: 'district', id: cur.kind === 'ac' ? byN.get(cur.id).dist : cur.id } : { kind: 'ac', id: cur.kind === 'district' ? P.bestAC(cur.id) : cur.id };
      map.set({ level, selKind: en.kind, selId: en.id }); panel.show(en); setLegend();
    });
    tabs($('#metricSeg'), (b) => { metric = b.dataset.m; map.set({ metric }); setLegend(); });
    const rc = $('#regionChips');
    rc.innerHTML = `<button type="button" aria-pressed="true" data-r="">All regions</button>` + REG.map((r) => `<button type="button" aria-pressed="false" data-r="${esc(r)}">${esc(r)}</button>`).join('');
    const setRegion = (r) => { region = r || null; $$('[data-r]', rc).forEach((x) => x.setAttribute('aria-pressed', String((x.dataset.r || null) === region))); map.set({ region }); };
    rc.addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (b) setRegion(b.dataset.r); });

    const input = $('#acSearch'), res = $('#acResults');
    const ITEMS = [...DISTS.map((d) => ({ kind: 'district', id: d.id, name: d.name, sub: `District · ${d.agg.n} seats` })), ...ACS.map((a) => ({ kind: 'ac', id: a.n, name: a.name, sub: `${a.D.name} district` }))];
    let act = -1, cur = [];
    const closeRes = () => { res.classList.remove('show'); input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); };
    const paintAct = () => { $$('[role="option"]', res).forEach((b, i) => { b.classList.toggle('act', i === act); b.setAttribute('aria-selected', String(i === act)); }); if (act >= 0) input.setAttribute('aria-activedescendant', 'acopt' + act); };
    function renderRes() {
      const q = input.value.trim().toLowerCase();
      if (!q) { closeRes(); return; }
      cur = ITEMS.filter((x) => x.name.toLowerCase().includes(q)).sort((x, y) => (x.name.toLowerCase().startsWith(q) ? 0 : 1) - (y.name.toLowerCase().startsWith(q) ? 0 : 1)).slice(0, 8);
      act = cur.length ? 0 : -1;
      res.innerHTML = cur.length ? cur.map((x, i) => `<button type="button" role="option" id="acopt${i}" data-i="${i}" aria-selected="false"><span>${esc(x.name)}</span><small>${esc(x.sub)}</small></button>`).join('') : `<p class="empty" style="margin:0;padding:14px">No district or seat matches “${esc(input.value)}”.</p>`;
      res.classList.add('show'); input.setAttribute('aria-expanded', 'true'); paintAct();
    }
    function pick(x) {
      closeRes(); input.value = x.name;
      const need = x.kind === 'district' ? 'district' : 'ac';
      if (need !== level) { level = need; const btn = $(`#lvlSeg [data-l="${need}"]`); $$('#lvlSeg [role="tab"]').forEach((b) => { b.setAttribute('aria-selected', String(b === btn)); b.tabIndex = b === btn ? 0 : -1; }); setLegend(); }
      setRegion('');
      map.set({ level, selKind: x.kind, selId: x.id }); panel.show({ kind: x.kind, id: x.id });
    }
    input.addEventListener('input', renderRes);
    input.addEventListener('keydown', (e) => {
      if (!res.classList.contains('show')) { if (e.key === 'ArrowDown' && input.value) renderRes(); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (cur.length) { act = (act + (e.key === 'ArrowDown' ? 1 : -1) + cur.length) % cur.length; paintAct(); } }
      else if (e.key === 'Enter') { e.preventDefault(); if (cur[act]) pick(cur[act]); }
      else if (e.key === 'Escape') closeRes();
    });
    res.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) pick(cur[+b.dataset.i]); });
    document.addEventListener('click', (e) => { if (!e.target.closest('.search')) closeRes(); });
    void lvlTabs;
  }

  /* ---------------- beyond the brief ---------------- */
  const ADDS = [
    ['Analytics', [['sankey', '#fe881b', 'Swing tracker', 'Past vote against today’s choice shows exactly who moved, round by round.'], ['scale', '#fe881b', 'Win ranges', 'Safe, Lean or Toss-up for each seat, never a fake-precise number.'], ['users', '#fe881b', 'Undecided finder', 'Who the undecided are, where they live and what moves them.'], ['target', '#fe881b', 'Booth priority list', 'Strong, weak and battleground booths, so effort goes where it counts.'], ['bell', '#fe881b', 'Sentiment alerts', 'A warning the moment a district’s mood drops between rounds.']]],
    ['Trust', [['shield', '#fe881b', 'Fraud Shield', 'Booth fence, length, fake-GPS block, same-voice check and back-checks.'], ['lock', '#fe881b', 'Secret-ballot mode', 'The voter taps their own choice: a digital dummy ballot box.'], ['play', '#fe881b', 'Evidence player', 'Click any quote and hear the anonymised voice behind it.'], ['book', '#fe881b', 'Automatic method note', 'Every report carries its sample, its margin and its profile.']]],
    ['Field and growth', [['coins', '#fe881b', 'Agent scorecards and pay', 'A quality score for each agent and pay per valid interview.'], ['users', '#fe881b', 'Women and youth modules', 'The gender and first-time-voter gaps that decide close seats.'], ['globe', '#fe881b', 'Social listening, later', 'Telugu YouTube, X and news comments set beside the ground data.']]],
  ];
  function Features() {
    if (!$('#swingCard')) return;
    const g = $('#featPath'); /* the twelve extras now live in extras.js; this only fills the swing chart */
    const items = ADDS.flatMap(([h, rows]) => rows.map(([i, , t, d]) => [h, i, t, d]));
    if (g) g.innerHTML = `<svg class="fp-svg" aria-hidden="true"></svg><ol class="fp-list">${items.map(([h, i, t, d], k) => `<li class="fp-item ${k % 2 ? 'r' : 'l'}" style="grid-row:${k + 1} / span 2"><span class="fp-node">${ic(i)}</span><div class="fp-card"><b>${t}</b><span>${d}</span><em>${h}</em></div></li>`).join('')}</ol>`;
    const L = [['Party A', 41, '#e26a0c'], ['Party B', 40, '#7f5af0'], ['Party C', 6, '#d4569a'], ['Undecided', 13, '#83799e']];
    const R = [['Party A', 39, '#e26a0c'], ['Party B', 43, '#7f5af0'], ['Party C', 6, '#d4569a'], ['Undecided', 12, '#83799e']];
    const F = [[0, 0, 36], [0, 1, 3], [0, 3, 2], [1, 1, 37], [1, 0, 1.5], [1, 3, 1.5], [2, 2, 5], [2, 1, 0.5], [2, 0, 0.5], [3, 3, 8.5], [3, 1, 2.5], [3, 0, 1], [3, 2, 1]];
    const H = 300, gap = 10, k = (H - gap * 3) / 100, x0 = 100, x1 = 392, w = 14;
    const pos = (arr) => { let y = 10; return arr.map(([, v]) => { const p = y; y += v * k + gap; return p; }); };
    const ly = pos(L), ry = pos(R); const lo = L.map(() => 0), ro = R.map(() => 0);
    const flows = F.map(([a, b, v]) => { const h = v * k; const y0 = ly[a] + lo[a]; const y1 = ry[b] + ro[b]; lo[a] += h; ro[b] += h; const mx = (x0 + w + x1) / 2; return `<path d="M${x0 + w} ${y0}C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}L${x1} ${y1 + h}C${mx} ${y1 + h} ${mx} ${y0 + h} ${x0 + w} ${y0 + h}Z" fill="${L[a][2]}" opacity="${a === b ? 0.22 : 0.62}"/>`; }).join('');
    const nodes = (arr, ys, x, anchor) => arr.map(([n, v, c], i) => `<rect x="${x}" y="${ys[i]}" width="${w}" height="${v * k}" rx="4" fill="${c}"/><text x="${anchor === 'end' ? x - 8 : x + w + 8}" y="${ys[i] + (v * k) / 2 + 4}" text-anchor="${anchor}" fill="#fff" style="font:600 12.5px var(--font)">${n} ${v}%</text>`).join('');
    $('#swingCard').innerHTML = `<h4>Swing tracker, at a glance</h4><p>Round 1 choice on the left, Round 2 on the right. Bright bands are the voters who moved. Example seat, demo data.</p><svg viewBox="0 0 520 ${H + 20}" role="img" aria-label="Example swing between Round 1 and Round 2: Party B gains from Party A and the undecided">${flows}${nodes(L, ly, x0, 'end')}${nodes(R, ry, x1, 'start')}</svg><div class="legend"><span><i style="background:#7f5af0"></i>3 pts moved from A to B</span><span><i style="background:#83799e"></i>2.5 pts of undecided chose B</span></div>`;
  }

  /* ---------------- savings ---------------- */
  function Savings() {
    const ids = ['sAc', 'sIv', 'sMin', 'sRd']; const els = Object.fromEntries(ids.map((i) => [i, $('#' + i)]));
    if (!els.sAc) return;
    let rate = 0.75; const OURS = 0.04;
    const fill = (el) => el.style.setProperty('--p', (((el.value - el.min) / (el.max - el.min)) * 100).toFixed(1) + '%');
    function calc() {
      const ac = +els.sAc.value, iv = +els.sIv.value, mn = +els.sMin.value, rd = +els.sRd.value;
      $('#oAc').textContent = ac; $('#oIv').textContent = IN(iv); $('#oMin').textContent = mn.toFixed(1); $('#oRd').textContent = rd; $('#oRate').textContent = '₹' + rate.toFixed(2);
      const minutes = ac * iv * mn, paid = minutes * rate, ours = minutes * OURS;
      $('#cPaid').textContent = RS(paid); $('#cOurs').textContent = RS(ours); $('#cMin').textContent = IN(minutes) + ' min of audio';
      $('#cYear').textContent = RS((paid - ours) * rd);
      $('#cLine').textContent = `${Math.round((1 - OURS / rate) * 100)}% lower, round after round, across ${IN(ac * iv * rd)} interviews a year.`;
      $('#bPaid').style.width = '100%'; $('#vPaid').textContent = RS(paid * rd);
      $('#bOurs').style.width = Math.max((OURS / rate) * 100, 2) + '%'; $('#vOurs').textContent = RS(ours * rd);
      const svg = $('#cumChart'), W = 600, Hh = 150, maxV = paid * rd || 1;
      const X = (i) => 8 + (i / rd) * (W - 16), Y = (v) => Hh - 8 - (v / maxV) * (Hh - 22);
      const pp = Array.from({ length: rd + 1 }, (_, i) => [X(i), Y(paid * i)]), oo = Array.from({ length: rd + 1 }, (_, i) => [X(i), Y(ours * i)]);
      const line = (a) => a.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
      svg.innerHTML = `<defs><linearGradient id="cumG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fe881b" stop-opacity=".5"/><stop offset="1" stop-color="#fe881b" stop-opacity=".05"/></linearGradient></defs><path d="M${line(pp)}L${line(oo.slice().reverse())}Z" fill="url(#cumG)"/><path d="M${line(pp)}" fill="none" stroke="#7f5af0" stroke-width="3" vector-effect="non-scaling-stroke"/><path d="M${line(oo)}" fill="none" stroke="#fe881b" stroke-width="3" vector-effect="non-scaling-stroke"/>${pp.map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="#7f5af0"/>`).join('')}`;
      ids.forEach((i) => fill(els[i]));
      P.plan = { ac, iv, mn, rd, interviewsYear: ac * iv * rd };
      document.dispatchEvent(new CustomEvent('plan'));
    }
    ids.forEach((i) => els[i].addEventListener('input', calc));
    $('#presets').addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (!b) return; rate = +b.dataset.r; $$('#presets [data-r]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); calc(); });
    calc();
  }

  /* ---------------- monthly costs ---------------- */
  const MC0 = [
    ['Speech engine', 'Telugu audio to transcript and analysis', [572, 2502, 5004]],
    ['AI analyst questions', '500 to 2,000 questions a month', [150, 300, 600]],
    ['Quote search index', 'Finds matching voter quotes', [37, 162, 323]],
    ['App server', 'API, workers, queue, reports · free tier, India', [0, 0, 0]],
    ['Database and backups', 'Managed database, daily backups', [0, 2200, 2200]],
    ['Audio storage', 'Encrypted, deleted after 6 months', [0, 0, 100]],
    ['Maps', 'Open map data, no fees', [0, 0, 0]],
    ['Sign-in and security', 'PIN sign-in, no SMS charges', [0, 0, 0]],
    ['Monitoring', 'Error and uptime alerts', [0, 0, 0]],
    ['Domain', 'About ₹1,000 a year', [85, 85, 85]],
  ];
  const OLD = [14600, 58463, 97725], VOL = [4000, 17500, 35000];
  const MCC = ['#fe881b', '#ac24ff', '#b997ff', '#ffd600', '#f79fff', '#7f5af0', '#dd95ff', '#3fbf8a'];
  function Monthly() {
    const rowsEl = $('#mcRows'); if (!rowsEl) return;
    let scale = 2;
    const rows = MC0.map(([name, sub, vals]) => ({ name, sub, vals: vals.slice(), on: true }));
    const parse = (v) => { const d = String(v).replace(/[,\s₹]/g, ''); return /^\d*$/.test(d) ? +d || 0 : NaN; };
    function draw() {
      rowsEl.innerHTML = rows.map((r, i) => `<div class="mc-row${r.on ? '' : ' off'}" data-i="${i}"><button type="button" class="sw" role="switch" aria-checked="${r.on}" aria-label="Include ${esc(r.name)}"></button><div class="nm"><label class="sr" for="mcn${i}">Cost name</label><input id="mcn${i}" value="${esc(r.name)}" data-f="name"><small>${esc(r.sub)}</small></div><div class="amt"><span>₹</span><label class="sr" for="mca${i}">Monthly amount for ${esc(r.name)}</label><input id="mca${i}" inputmode="numeric" value="${IN(r.vals[scale])}" data-f="amt"></div><button type="button" class="icon-btn" data-del aria-label="Remove ${esc(r.name)}">${ic('trash')}</button></div>`).join('');
      totals();
    }
    function totals() {
      const live = rows.filter((r) => r.on);
      const tot = live.reduce((t, r) => t + (r.vals[scale] || 0), 0);
      $('#mcTotal').textContent = RS(tot);
      const segs = live.filter((r) => r.vals[scale] > 0).sort((a, b) => b.vals[scale] - a.vals[scale]);
      const top = segs.slice(0, 4), rest = segs.slice(4).reduce((t, r) => t + r.vals[scale], 0);
      const parts = top.map((r, i) => ({ v: r.vals[scale], c: MCC[i], n: r.name })).concat(rest ? [{ v: rest, c: '#83799e', n: 'Everything else' }] : []);
      $('#mcDonut').outerHTML = donut(parts.length ? parts : [{ v: 1, c: '#3a2d58' }], { size: 130, w: 16, big: tot ? '' : '₹0' }).replace('<svg ', '<svg id="mcDonut" ');
      $('#mcLegend').innerHTML = parts.map((p) => `<div><i style="background:${p.c}"></i>${esc(p.n)} · ${RS(p.v)}</div>`).join('') || '<div>Nothing switched on.</div>';
      const keep = OLD[scale] - tot;
      $('#mcCompare').innerHTML = `With paid speech APIs and paid servers, the same volume costs <b>${RS(OLD[scale])}</b> a month. You keep <b>${RS(Math.max(keep, 0))}</b> (${Math.max(0, Math.round((keep / OLD[scale]) * 100))}%) every month.`;
      $('#mcPer').textContent = '₹' + (tot / VOL[scale]).toFixed(2);
    }
    rowsEl.addEventListener('input', (e) => {
      const inp = e.target; const i = +inp.closest('.mc-row').dataset.i;
      if (inp.dataset.f === 'name') { rows[i].name = inp.value; return; }
      const v = parse(inp.value); const bad = Number.isNaN(v);
      inp.closest('.amt').classList.toggle('err', bad); inp.setAttribute('aria-invalid', String(bad));
      if (!bad) { if (rows[i].custom) rows[i].vals = [v, v, v]; else rows[i].vals[scale] = v; totals(); }
    });
    rowsEl.addEventListener('focusout', (e) => { const inp = e.target; if (inp.dataset.f === 'amt') { const i = +inp.closest('.mc-row').dataset.i; inp.value = IN(rows[i].vals[scale]); inp.closest('.amt').classList.remove('err'); inp.removeAttribute('aria-invalid'); } });
    rowsEl.addEventListener('click', (e) => {
      const row = e.target.closest('.mc-row'); if (!row) return; const i = +row.dataset.i;
      if (e.target.closest('.sw')) { rows[i].on = !rows[i].on; const sw = row.querySelector('.sw'); sw.setAttribute('aria-checked', String(rows[i].on)); row.classList.toggle('off', !rows[i].on); totals(); }
      if (e.target.closest('[data-del]')) { rows.splice(i, 1); draw(); $('#mcAdd').focus(); }
    });
    $('#mcAdd').addEventListener('click', () => { rows.push({ name: 'New cost', sub: 'Edit the name and the amount', vals: [0, 0, 0], on: true, custom: true }); draw(); const n = $(`#mcn${rows.length - 1}`); if (n) { n.focus(); n.select(); } });
    tabs($('#scaleSeg'), (b) => { scale = +b.dataset.s; draw(); });
    draw();
  }

  /* ---------------- engagement ---------------- */
  const INC = ['Field App for Android, works offline', 'Command Center for admins', 'Client Portal on laptop and phone', 'Our own Telugu speech engine', 'Issue-level sentiment AI', 'Ask the Data AI analyst', 'Live district and seat map', 'Analytics and round comparison', 'Fraud Shield and quality checks', 'Reports in Telugu and English', 'Sampling plan and questionnaire', 'Consent and data-law compliance', 'Security and India hosting', 'Field pilot in 2–3 seats', 'Training for agents and admins', 'Launch and handover support'];
  function Engage() {
    const inc = $('#inc'); if (!inc) return;
    inc.innerHTML = INC.map((t) => `<div>${ic('checkc')}${esc(t)}</div>`).join('');
    const dev = $('#fDev'), sup = $('#fSup'); let ppi = 8;
    const parse = (v) => { const d = v.replace(/[,\s₹]/g, ''); if (!d) return null; return /^\d+$/.test(d) ? +d : NaN; };
    const check = (inp, hint) => { const v = parse(inp.value); const bad = Number.isNaN(v); inp.closest('.fee-in').classList.toggle('err', bad); inp.setAttribute('aria-invalid', String(bad)); $('#' + hint).textContent = bad ? 'Use numbers only, for example 12,00,000.' : ''; return bad ? null : v; };
    function update() {
      const d = check(dev, 'fDevHint'), s = check(sup, 'fSupHint');
      const plan = P.plan || { rd: 6, interviewsYear: 175 * 200 * 6 };
      $('#eRounds').textContent = plan.rd; $('#eIvN').textContent = IN(plan.interviewsYear);
      const ivTot = plan.interviewsYear * ppi;
      $('#eDev').textContent = d != null ? RS(d) : 'Not entered';
      $('#eSup').textContent = s != null ? RS(s * plan.rd) : 'Not entered';
      $('#eIv').textContent = RS(ivTot);
      /* the caption sits under the number, so the total stays one clean figure */
      const left = (d == null ? 1 : 0) + (s == null ? 1 : 0);
      $('#eTot').innerHTML = esc(RS((d || 0) + (s || 0) * plan.rd + ivTot))
        + (left ? `<small>so far &#183; ${left === 1 ? 'one amount' : 'two amounts'} still to enter</small>` : '');
    }
    [dev, sup].forEach((inp) => { inp.addEventListener('input', update); inp.addEventListener('blur', () => { const v = parse(inp.value); if (v != null && !Number.isNaN(v)) inp.value = IN(v); }); });
    $('#ppi').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (!b) return; ppi = +b.dataset.v; $$('#ppi [data-v]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); update(); });
    document.addEventListener('plan', update);
    update();
  }

  /* ---------------- delivery ---------------- */
  // one accent (launch orange): it marks the selected discipline, the current week and the launch
  // [key, icon, title, what they do, head count, short name]
  const ROLES = [['ux', 'pen', 'UI/UX designer', 'Research, flows, design system, every screen', '1', 'Design'], ['fs', 'code', 'Full-stack developers', 'Field App, web apps, APIs and database', '3', 'Full-stack'], ['ai', 'brain', 'AI engineers', 'Speech engine, sentiment, AI analyst', '2–3', 'AI'], ['ops', 'server', 'DevOps and database', 'India hosting, security, backups, speed', '1', 'DevOps'], ['qa', 'test', 'QA and field testing', 'Test plans, the pilot, launch checks', '1', 'QA']];
  // [workstream, detail, first week, last week, bar label, owners]
  const GANTT = [
    ['Research and UX', 'Discovery, users, questionnaire, sampling', 1, 3, 'Discovery and research', 'ux'],
    ['UI design and design system', 'Flows, screens, components', 2, 6, 'Design system and screens', 'ux'],
    ['Field App', 'Offline, audio, GPS, sync', 4, 10, 'Offline app, audio, sync', 'fs'],
    ['Backend, database, APIs', 'Roles, security, queues, reports', 3, 10, 'APIs, roles, data', 'fs ops'],
    ['Speech engine and AI', 'Telugu benchmark, sentiment', 3, 9, 'Telugu engine and sentiment', 'ai'],
    ['Dashboards, map, analytics', 'Command Center and portal', 6, 11, 'Dashboards and map', 'fs ux'],
    ['Ask the Data analyst', 'Questions, quotes, guardrails', 8, 11, 'AI analyst', 'ai fs'],
    ['Testing, security, pilot', 'Load tests, review, 2–3 seats', 9, 12, 'Pilot in real seats', 'qa ops'],
    ['Launch and handover', 'Go-live, training, support', 12, 12, 'Launch', 'ux fs ai ops qa'],
  ];
  const PHASES = ['Discover and design', 'Build', 'AI, pilot and launch'];
  const MILES = [[6, 'Screens designed'], [8, 'Pilot begins'], [12, 'Launch']];
  const HARD = [['Offline sync', 'Interviews saved for days on cheap phones, then merged safely.', 5], ['Telugu speech in noise', 'Dialects, village noise and Telugu-English mixing.', 5], ['Fraud detection', 'Fake GPS, rushed interviews and repeated voices.', 4], ['Honest statistics', 'Weighting, margins and minimum samples.', 4], ['Data law', 'Consent, retention and election-silence rules.', 3]];
  const PERF = [['layers', 'Pre-built summaries', 'Dashboards read ready-made tables, not millions of raw rows.'], ['map', 'Light vector maps', 'Shapes, not images: quick to load and sharp on any screen.'], ['bolt', 'Cached answers', 'Common AI questions answer instantly from cache.'], ['download', 'Load on demand', 'Audio, charts and reports load only when someone opens them.']];
  const ARCH = [
    ['Apps people use', [['phone', 'Field App', 'Android · works offline'], ['laptop', 'Command Center', 'Web · admins and supervisors'], ['crown', 'Client Portal', 'Web and phone']]],
    ['Secure API, India region', [['shield', 'Secure API', 'Every app connects here', ['India region', 'Sign-in and roles', 'Audit log', 'Job queue']]]],
    ['Engines', [['ear', 'Speech engine', 'Telugu speech and analysis'], ['finger', 'Fraud Shield', 'Fence, GPS, voice match'], ['file', 'Reports', 'PDF, Telugu and English']]],
    ['Data and AI', [['db', 'Database', 'Row-level security'], ['spark', 'AI Analyst', 'Numbers and quote search'], ['lock', 'Audio storage', 'Encrypted, auto-delete']]],
  ];
  const wk = (a, b) => (a === b ? `Week ${a}` : `Weeks ${a}–${b}`);
  function Delivery() {
    const root = $('#delivery'), chart = $('#dlChart'); if (!chart) return;

    // the team as a hemicycle: seats fill by angle across both rows, left to right
    const cx = 320, cy = 304, seats = [];
    [[4, 170], [5, 262]].forEach(([n, r]) => { for (let i = 0; i < n; i++) { const a = Math.PI - (Math.PI * (i + 0.5)) / n; seats.push({ a, x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) }); } });
    seats.sort((p, q) => q.a - p.a);
    let k = 0; const seatSVG = [];
    ROLES.forEach(([key, icon, , , n]) => {
      const c = n === '2–3' ? 3 : +n;
      for (let j = 0; j < c; j++, k++) {
        const s = seats[k], opt = n === '2–3' && j === 2;
        seatSVG.push(`<g transform="translate(${s.x.toFixed(1)} ${s.y.toFixed(1)})"><g class="dl-pop" style="--k:${k}"><g class="dl-seat${opt ? ' opt' : ''}" data-r="${key}"><circle class="dl-halo" r="48"/><circle class="dl-disc" r="34"/><use href="#i-${icon}" x="-14" y="-14" width="28" height="28"/></g></g></g>`);
      }
    });
    const arc = (r) => `<path class="dl-arc" d="M${cx - r} ${cy}A${r} ${r} 0 0 1 ${cx + r} ${cy}"/>`;
    $('#dlSeats').innerHTML = `${arc(170)}${arc(262)}<path class="dl-floor" d="M20 ${cy + 22}H620"/>${seatSVG.join('')}<text class="dl-num" id="dlNum" x="${cx}" y="${cy - 8}" text-anchor="middle">8–9</text>`;

    $('#dlRoles').innerHTML = ROLES.map(([key, , t, d, n]) => {
      const own = GANTT.filter((g) => g[5].split(' ').includes(key));
      return `<div class="dl-role" data-r="${key}"><button type="button" aria-expanded="false" aria-controls="dlOwn-${key}"><span class="dl-n tnum">${n}</span><span class="dl-rt"><b>${t}</b><small>${d}</small></span>${ic('chev', 'dl-cv')}</button><div class="dl-own" id="dlOwn-${key}"><div><ul aria-label="${t} work on">${own.map(([w, , a, b]) => `<li><span>${w}</span><small>${wk(a, b)}</small></li>`).join('')}</ul></div></div></div>`;
    }).join('');
    $('#dlSeg').innerHTML = `<button type="button" data-r="" aria-pressed="true">Everyone</button>${ROLES.map(([key, , , , , s]) => `<button type="button" data-r="${key}" aria-pressed="false">${s}</button>`).join('')}`;

    // the roadmap: bars fill as the week marker passes them (--p = weeks elapsed, 0–12)
    chart.innerHTML = `<div class="dl-stripes" aria-hidden="true">${PHASES.map(() => '<i></i>').join('')}</div>
      <div class="dl-phases"><span></span><div>${PHASES.map((t, i) => `<div class="dl-ph"><b>${t}</b><small><span class="dl-phm">Month ${i + 1} · </span>${wk(i * 4 + 1, i * 4 + 4)}</small></div>`).join('')}</div></div>
      <div class="dl-body">
        <div class="dl-lines" aria-hidden="true">${MILES.map(([x], i) => `<i style="--x:${x}"${i === MILES.length - 1 ? ' class="end"' : ''}></i>`).join('')}</div>
        <div class="dl-weeks" aria-hidden="true"><span></span><div>${Array.from({ length: 12 }, (_, i) => `<span>W${i + 1}</span>`).join('')}</div></div>
        <ol class="dl-rows">${GANTT.map(([t, s, a, b, l, own]) => `<li class="dl-ws" data-own="${own}"><div class="dl-wl"><b>${t}</b><small>${s}</small><span class="dl-ww">${wk(a, b)}</span></div><div class="dl-track" aria-hidden="true"><span class="dl-bar${a === b ? ' short' : ''}" style="--a:${a - 1};--len:${b - a + 1}"><i></i><em>${l}</em></span></div></li>`).join('')}</ol>
        <div class="dl-ms"><span></span><div>${MILES.map(([x, t], i) => `<span${i === MILES.length - 1 ? ' class="end"' : ''} style="--x:${x}"><i aria-hidden="true"></i>${t}<small class="sr">, end of week ${x}</small></span>`).join('')}</div></div>
        <div class="dl-play" aria-hidden="true"><div><b id="dlNow">Week 1</b></div></div>
      </div>`;

    const lvT = ['', '', '', 'Demanding', 'Hard', 'Very hard'];
    $('#dlHard').innerHTML = HARD.map(([t, d, lv], k) => `<li class="rv${lv === 5 ? ' top' : ''}" style="--d:${k * 70}ms"><div><b>${t}</b><p>${d}</p></div><div class="dl-lv"><span role="img" aria-label="Difficulty ${lv} of 5">${[1, 2, 3, 4, 5].map((x) => `<i${x <= lv ? ' class="on"' : ''} style="--k:${x}"></i>`).join('')}</span><small>${lvT[lv]}</small></div></li>`).join('');

    const arch = $('#dlArch');
    arch.innerHTML = `<svg class="dl-wires" aria-hidden="true"></svg>${ARCH.map(([h, nodes]) => `<div class="dl-col"><h4>${h}</h4><ul>${nodes.map(([i, t, s, list]) => `<li class="dl-node${list ? ' dl-hub' : ''}"><span class="dl-ni">${ic(i)}</span><span class="dl-nt"><b>${t}</b><small>${s}</small></span>${list ? `<ul class="dl-hubl">${list.map((x) => `<li>${ic('check')}${x}</li>`).join('')}</ul>` : ''}</li>`).join('')}</ul></div>`).join('')}`;
    $('#dlPerf').innerHTML = PERF.map(([i, t, d], k) => `<div class="rv" style="--d:${k * 60}ms"><b>${ic(i)}${t}</b><span>${d}</span></div>`).join('');

    // one selection drives the seats, the roster and the roadmap
    const seatEls = $$('.dl-seat', $('#dlSeats')), roleEls = $$('.dl-role', $('#dlRoles')), segBtns = $$('#dlSeg button'), rowEls = $$('.dl-ws', chart);
    const num = $('#dlNum'), cap = $('.dl-hemi figcaption b');
    let sel = '';
    function pick(r) {
      if (r === sel) return;
      sel = r;
      const role = ROLES.find((x) => x[0] === r);
      root.classList.toggle('dl-has', !!r);
      seatEls.forEach((g) => g.classList.toggle('on', g.dataset.r === r));
      roleEls.forEach((el) => { const on = el.dataset.r === r; el.classList.toggle('on', on); el.querySelector('button').setAttribute('aria-expanded', String(on)); });
      segBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.r === r)));
      rowEls.forEach((li) => li.classList.toggle('on', !!r && li.dataset.own.split(' ').includes(r)));
      num.textContent = role ? role[4] : '8–9';
      cap.textContent = role ? `${role[2]}.` : 'Specialists on one team.';
      if (!reduced && num.animate) num.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.23,1,.32,1)' });
    }
    $('#dlRoles').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) pick(sel === b.parentElement.dataset.r ? '' : b.parentElement.dataset.r); });
    $('#dlSeg').addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (b) pick(b.dataset.r); });
    $('#dlSeats').addEventListener('click', (e) => { const g = e.target.closest('.dl-seat'); if (g) pick(sel === g.dataset.r ? '' : g.dataset.r); });

    // the week marker: scrubbed by scroll on wide screens, played once on phones
    const now = $('#dlNow'), phs = $$('.dl-ph', chart), stripes = $$('.dl-stripes i', chart);
    let lastW = 0;
    /* only the bars and the marker read --p: writing it on them alone keeps each scroll frame's
       style work to those few elements instead of the whole chart */
    const pEls = $$('.dl-bar i, .dl-play > div', chart);
    const setP = (p) => {
      const v = p.toFixed(3);
      pEls.forEach((el) => el.style.setProperty('--p', v));
      const w = p >= 11.98 ? 13 : Math.floor(p) + 1;
      if (w === lastW) return;
      lastW = w; now.textContent = w > 12 ? 'Launch' : `Week ${w}`;
      const ph = Math.min(2, Math.floor((w - 1) / 4));
      phs.forEach((el, i) => el.classList.toggle('now', i === ph));
      stripes.forEach((el, i) => el.classList.toggle('now', i === ph));
      rowEls.forEach((li, i) => li.classList.toggle('live', w <= 12 && w >= GANTT[i][2] && w <= GANTT[i][3]));
    };
    const G = window.gsap, ST = window.ScrollTrigger;
    if (reduced || !G || !ST) { chart.classList.add('still'); setP(12); phs.concat(stripes).forEach((el) => el.classList.remove('now')); }
    else {
      G.registerPlugin(ST);
      const st = { p: 0 };
      G.matchMedia().add({ wide: '(min-width: 901px)', narrow: '(max-width: 900px)' }, (c) => {
        st.p = 0; setP(0);
        if (c.conditions.wide) G.to(st, { p: 12, ease: 'none', onUpdate: () => setP(st.p), scrollTrigger: { trigger: chart, start: 'top 72%', end: 'bottom 50%', scrub: 0.6, refreshPriority: -1 } });
        else G.to(st, { p: 12, duration: 1.8, ease: 'power2.out', onUpdate: () => setP(st.p), scrollTrigger: { trigger: chart, start: 'top 85%', once: true, refreshPriority: -1 } });
      });
    }

    // architecture wires, measured from the real nodes; packets flow only while on screen
    const wires = $('.dl-wires', arch), cols = $$('.dl-col', arch).map((c) => $$(':scope > ul > .dl-node', c));
    function wire() {
      if (getComputedStyle(wires).display === 'none') { wires.innerHTML = ''; return; }
      const R = arch.getBoundingClientRect();
      const box = (el) => { const r = el.getBoundingClientRect(); return { l: r.left - R.left, r: r.right - R.left, y: r.top - R.top + r.height / 2 }; };
      const [apps, [hub], eng, data] = cols.map((c) => c.map(box));
      const f = (v) => v.toFixed(1);
      const curve = (x1, y1, x2, y2) => { const m = (x1 + x2) / 2; return `M${f(x1)} ${f(y1)}C${f(m)} ${f(y1)} ${f(m)} ${f(y2)} ${f(x2)} ${f(y2)}`; };
      const paths = [...apps.map((a, i) => curve(a.r, a.y, hub.l, hub.y + (i - 1) * 34)), ...eng.map((e, i) => curve(hub.r, hub.y + (i - 1) * 34, e.l, e.y)), ...eng.map((e, i) => curve(e.r, e.y, data[i].l, data[i].y))];
      wires.setAttribute('viewBox', `0 0 ${f(R.width)} ${f(R.height)}`);
      const pk = (d, k) => { const b = `${((Math.floor(k / 3) * 0.8) + (k % 3) * 0.27).toFixed(2)}s`; return `<g class="pk"><circle r="7" class="pk-h"/><circle r="3"/><animateMotion dur="2.4s" begin="${b}" repeatCount="indefinite" path="${d}" calcMode="spline" keyTimes="0;1" keySplines=".45 0 .25 1"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.85;1" dur="2.4s" begin="${b}" repeatCount="indefinite"/></g>`; };
      wires.innerHTML = paths.map((d) => `<path d="${d}"/>`).join('') + (reduced ? '' : paths.map(pk).join(''));
      if (!seen && wires.pauseAnimations) wires.pauseAnimations();
    }
    let seen = false, raf = 0;
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (wires.pauseAnimations) wires[seen ? 'unpauseAnimations' : 'pauseAnimations'](); }).observe(arch);
    else seen = true;
    if ('ResizeObserver' in window) new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(wire); }).observe(arch);
    else window.addEventListener('resize', wire);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(wire);
    wire();
  }

  /* ---------------- research ---------------- */
  function Research() {
    const pred = $('#pred'); if (!pred) return;
    const D = [['KK Survey', 161], ['RTV', 144], ['Peoples Pulse', 123], ['Chanakya Strategies', 120], ['Aaraa', 76], ['CPS', 72], ['Partha Chanakya', 60]];
    pred.innerHTML = D.map(([n, v]) => `<div class="pred-row"><span>${n}</span><span class="tr"><i class="${Math.abs(v - 164) <= 5 ? 'near' : ''}" style="width:${(v / 175) * 100}%"></i><span class="act" style="left:${(164 / 175) * 100}%" aria-hidden="true"></span></span><b>${v}</b></div>`).join('');
    const QB = [['user', '#8130ff', 'Respondent profile', 'Age, gender, education, work, area, first-time voter', false], ['lock', '#8130ff', 'Vote', 'Choice on the secret-ballot screen, past vote, certainty', false], ['crown', '#8130ff', 'Leaders', 'Preferred CM, trust, MLA satisfaction and access', false], ['clip', '#8130ff', 'Government report card', 'Satisfaction, and "another chance?" with reasons', true], ['brief', '#8130ff', 'Issues and economy', 'Biggest problem, jobs, prices, income', true], ['drop', '#8130ff', 'Schemes and services', 'Schemes received and on time; water, roads, health', false]];
    $('#qblocks').innerHTML = QB.map(([i, c, t, d, r], k) => `<div class="qb rv" style="--d:${k * 60}ms"><span class="l" style="background:${c}">${ic(i)}</span><b>${t}</b><p>${d}</p>${r ? `<span class="rec-tag">${ic('mic')}Open answer recorded</span>` : ''}</div>`).join('');
    const steps = [['Seats by size', 'Picked in proportion', 'to population', 'scale'], ['4 booths a seat', 'Chosen by', 'systematic random', 'pin'], ['25 voters a booth', 'Drawn from the', 'electoral roll', 'users'], ['Interview at home', 'Alone where', 'possible', 'home'], ['Weight to Census', 'Age, gender, area,', 'community', 'sliders']];
    const sm = $('#samplingM');
    if (sm) sm.innerHTML = steps.map(([t, x, y, i]) => `<li><i>${ic(i)}</i><span><b>${t}</b><small>${x} ${y}</small></span></li>`).join('') + '<li style="grid-template-columns:1fr"><small style="color:#dd95ff;font-weight:600">800–1,200 interviews per seat give reliable seat-level results</small></li>';
    $('#sampling').innerHTML = `<svg viewBox="0 0 1000 230" aria-hidden="true"><defs><linearGradient id="smpG" x1="0" x2="1"><stop offset="0" stop-color="#1b4dfe"/><stop offset=".5" stop-color="#ac24ff"/><stop offset="1" stop-color="#fe881b"/></linearGradient></defs><path d="M100 72H900" stroke="url(#smpG)" stroke-width="3" stroke-dasharray="7 7"/>${steps.map(([t, a, b, i], k) => { const x = 100 + k * 200; return `<circle cx="${x}" cy="72" r="38" fill="#2a1468" stroke="url(#smpG)" stroke-width="3"/><use href="#i-${i}" x="${x - 16}" y="56" width="32" height="32" style="color:#fff"/><text x="${x}" y="142" text-anchor="middle" fill="#fff" style="font:700 17px var(--font)">${t}</text><text x="${x}" y="166" text-anchor="middle" fill="#cfc3ec" style="font:500 13.5px var(--font)">${a}</text><text x="${x}" y="186" text-anchor="middle" fill="#cfc3ec" style="font:500 13.5px var(--font)">${b}</text>`; }).join('')}<text x="500" y="222" text-anchor="middle" fill="#dd95ff" style="font:600 13.5px var(--font)">800–1,200 interviews per seat give reliable seat-level results</text></svg>`;
  }

  /* ---------------- competitors ---------------- */
  function Compete() {
    const el = $('#comp'); if (!el) return;
    const cols = ['This platform', 'Survey tools<br><small class="m">SurveyCTO · ODK · Kobo</small>', 'Pollster agencies', 'Political analytics firms', 'Social listening tools'];
    const rows = [
      ['Offline field app', 'y', 'y', 'In-house', 'Varies', 'n'],
      ['Voice evidence per answer', 'Every open answer', 'Random audits', 'n', 'Rare', 'n'],
      ['Telugu speech to text', 'y', 'n', 'Manual', 'Unclear', 'n'],
      ['Sentiment per issue', 'y', 'n', 'Manual coding', 'Claimed', 'Online only'],
      ['Fraud and same-voice checks', 'y', 'GPS, audits', 'Supervisors', 'n', 'n'],
      ['Swing, anti-incumbency, booth priority', 'y', 'n', 'As a service', 'y', 'n'],
      ['AI analyst with evidence', 'y', 'n', 'n', 'Some', 'Some'],
      ['Live dashboard you own', 'y', 'Build it yourself', 'Reports only', 'Varies', 'y'],
      ['Typical cost', 'Build + per interview', '$198–700 a month', '₹140–400 an interview', 'Custom retainers', 'Enterprise pricing'],
    ];
    const cell = (v) => (v === 'y' ? `<span class="y">${ic('checkc')}<span class="sr">Yes</span></span>` : v === 'n' ? `<span class="n">${ic('minus')}<span class="sr">No</span></span>` : `<span class="m">${v}</span>`);
    el.innerHTML = `<table><caption class="sr">How this platform compares with other options</caption><thead><tr><th scope="col">Capability</th>${cols.map((c, i) => `<th scope="col" class="${i === 0 ? 'us' : ''}">${c}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr><th scope="row">${r[0]}</th>${r.slice(1).map((v, i) => `<td class="${i === 0 ? 'us' : ''}">${cell(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }

  /* ---------------- trust ---------------- */
  function Trust() {
    const l = $('#layers'); if (!l) return;
    const LAYERS = [['globe', '#8130ff', 'Hosted in India', 'Servers and backups stay in Indian data centres.'], ['lock', '#8130ff', 'Encrypted everywhere', 'In transit, at rest, and on the phone itself.'], ['users', '#8130ff', 'Each client sees only their seats', 'Role-based access, down to the row.'], ['finger', '#8130ff', 'Personal data kept apart', 'No voter ID numbers; names stored apart from answers.'], ['mic', '#8130ff', 'Anonymised voices', 'No names in clips; raw audio deleted after the agreed period.'], ['eye', '#8130ff', 'Every action logged', 'Each view, export and AI question goes in an audit log.']];
    l.innerHTML = LAYERS.map(([i, c, t, d]) => `<div class="layer"><i style="background:${c}">${ic(i)}</i><div><b>${t}</b><span>${d}</span></div></div>`).join('');
    const sw = $('#silence'), txt = $('#silenceTxt');
    sw.addEventListener('click', () => { const on = sw.getAttribute('aria-checked') !== 'true'; sw.setAttribute('aria-checked', String(on)); txt.textContent = on ? 'On: publishing and exports are locked during notified windows.' : 'Off: publishing is open. It switches on by itself when a silence window starts.'; });
  }

  /* ---------------- risks ---------------- */
  const RISKS = [
    { t: 'Telugu speech mistakes in noisy fields', L: 2, I: 3, i: 'mic', fix: ['We test on real field clips from every region before launch', 'Agents get simple mic guidance, and clip-on mics for big rounds', 'Unsure clips go to a human review queue', 'A paid speech service double-checks the rare unclear clip'] },
    { t: 'Fake or careless interviews', L: 3, I: 3, i: 'finger', fix: ['Booth fence, minimum length and fake-GPS block on every interview', 'Same-voice detection across all interviews', 'Random back-checks by supervisors', 'Agent scorecards tie pay to valid interviews'] },
    { t: 'A wrong prediction hurts trust', L: 1, I: 3, i: 'scale', fix: ['Ranges and Safe, Lean, Toss-up instead of single numbers', 'Every report carries its method note', 'The AI refuses samples that are too small', 'Weighting to the Census for every result'] },
    { t: 'A data leak', L: 1, I: 3, i: 'lock', fix: ['India hosting with encryption everywhere', 'Row-level access: each client sees only their seats', 'Minimal personal data, voices anonymised', 'Audit log and a security review before launch'] },
    { t: 'Scope keeps growing', L: 3, I: 2, i: 'layers', fix: ['A signed scope for each phase', 'New requests are priced and scheduled, not squeezed in', 'Weekly demos keep everyone aligned'] },
    { t: 'AI costs run over', L: 1, I: 2, i: 'coins', fix: ['Smart recording: only open answers are recorded', 'Monthly caps and budget alerts', 'Per-interview pricing keeps costs predictable'] },
    { t: 'Server down during a round', L: 2, I: 2, i: 'server', fix: ['Phones keep working offline and sync later', 'Daily backups with tested restore', 'Move to a paid cloud server within an hour'] },
    { t: 'Late inputs for the round', L: 3, I: 1, i: 'clock', fix: ['A fixed weekly review on the client side', 'Questionnaire and agent list agreed before the build', 'A pilot plan agreed up front'] },
  ];
  const LV = ['', 'Low', 'Medium', 'High'];
  function Risks() {
    const grid = $('#mxGrid'), det = $('#riskDetail'); if (!grid) return;
    const seen = {};
    grid.insertAdjacentHTML('beforeend', RISKS.map((r, k) => {
      const key = r.L + '-' + r.I; const n = (seen[key] = (seen[key] || 0) + 1) - 1;
      const left = ((r.L - 0.5) / 3) * 100 + (n ? 9 : 0), top = ((3 - r.I + 0.5) / 3) * 100 + (n ? 8 : 0);
      return `<button type="button" class="mx-dot" data-k="${k}" style="left:${left}%;top:${top}%" aria-pressed="${k === 0}" aria-label="${esc(r.t)}: likelihood ${LV[r.L]}, impact ${LV[r.I]}">${ic(r.i)}</button>`;
    }).join(''));
    const show = (k) => {
      const r = RISKS[k];
      $$('.mx-dot', grid).forEach((d) => d.setAttribute('aria-pressed', String(+d.dataset.k === k)));
      det.innerHTML = `<h3>${esc(r.t)}</h3><div class="lvls"><span class="badge ${r.L === 3 ? 'orange' : 'purple'}">Likelihood: ${LV[r.L]}</span><span class="badge ${r.I === 3 ? 'orange' : 'purple'}">Impact: ${LV[r.I]}</span></div><ul class="fixes">${r.fix.map((f) => `<li>${ic('checkc')}${esc(f)}</li>`).join('')}</ul><div class="risk-list" role="group" aria-label="All risks">${RISKS.map((x, i) => `<button type="button" data-k="${i}" aria-pressed="${i === k}">${esc(x.t)}</button>`).join('')}</div>`;
    };
    grid.addEventListener('click', (e) => { const d = e.target.closest('.mx-dot'); if (d) show(+d.dataset.k); });
    det.addEventListener('click', (e) => { const b = e.target.closest('.risk-list [data-k]'); if (b) { show(+b.dataset.k); const nb = det.querySelector(`.risk-list [data-k="${b.dataset.k}"]`); if (nb) nb.focus(); } });
    show(0);
  }

  /* ---------------- design system ----------------
     Its own panel: a strip of every colour token, then one sideways rail per part
     (colour, gradients, type, foundations, components). Rails scroll natively (touch,
     trackpad, arrow keys), drag with a mouse, and step with the arrow buttons. */
  function System() {
    const el = $('#ds'); if (!el) return;
    const INK = '#1a0b54';
    const lum = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255].reduce((a, v, i) => { v /= 255; return a + [0.2126, 0.7152, 0.0722][i] * (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); }, 0); };
    const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const grade = (r) => r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'Large text' : 'Decor only';
    const onIt = (h) => ratio(h, '#ffffff') >= ratio(h, INK) ? '#ffffff' : INK;

    /* colour tokens: [name, hex, role, ground for text tokens] */
    const COL = [
      ['surfaces', 'Surfaces', [['bg', '#060607', 'Product canvas, dark'], ['body_dark', '#060607', 'Website ground'], ['card', '#111114', 'Cards, dark'], ['card-2', '#18181c', 'Inputs, hover, dark'], ['card-3', '#1f1e24', 'Tracks, chosen nav'], ['light bg', '#f5f3f8', 'Product canvas, light'], ['light card', '#ffffff', 'Cards, light']]],
      ['text', 'Text', [['ink on dark', '#f5f2fa', 'Primary text on dark', '#111114'], ['ink-2 on dark', '#bdb7c8', 'Secondary text on dark', '#111114'], ['ink on light', '#17122a', 'Primary text on light', '#ffffff'], ['ink-2 on light', '#5d5970', 'Secondary text on light', '#ffffff']]],
      ['brand', 'Accents', [['warm', '#fe881b', 'The one data accent: key numbers, Party A, positive mood'], ['warm ink', '#b45300', 'Warm text on light grounds'], ['violet', '#8130ff', 'Second pole: Party B, AI, opposition'], ['violet tint', '#b997ff', 'Violet text and focus ring on dark'], ['primary', '#1c4eff', 'Start of the primary button sweep only']]],
      ['data', 'Data', [['Party A', '#e26a0c', 'Ruling party in demos'], ['Party B', '#7f5af0', 'Main opposition in demos'], ['Party C', '#d4569a', 'Third party in demos'], ['Others', '#8a839c', 'Others'], ['Neutral', '#f0c49a', 'Neutral mood']]],
      ['status', 'Status', [['good', '#3fbf8a', 'Verified, rising'], ['warn', '#f2b33d', 'Needs a look'], ['bad', '#ef5a6f', 'Rejected, falling']]],
    ];
    const ALL = COL.flatMap(([g, , list]) => list.map((t) => ({ g, n: t[0], h: t[1] })));
    const ORDER = ['#060607', '#060607', '#111114', '#18181c', '#1f1e24', '#17122a', '#7f5af0', '#8130ff', '#1c4eff', '#b997ff', '#d4569a', '#ef5a6f', '#b45300', '#e26a0c', '#fe881b', '#f2b33d', '#3fbf8a', '#8a839c', '#5d5970', '#bdb7c8', '#f0c49a', '#f5f3f8', '#f5f2fa', '#ffffff'];
    const strip = ORDER.map((h) => ALL.find((t) => t.h === h)).filter(Boolean);

    const chip = (g, [n, h, role, ground]) => {
      const bg = ground || h, fg = ground ? h : onIt(h), r = ratio(fg, bg);
      return `<button type="button" class="chip" data-g="${g}" data-hex="${h}" style="--bg:${bg};--fg:${fg}" aria-label="${n}, ${h}. ${role}. Contrast ${r.toFixed(1)} to 1. Copy the hex value">
        <span class="chip-face" aria-hidden="true"><span class="chip-aa">Aa</span>${ground ? `<i class="chip-dot" style="background:${h}"></i>` : ''}<span class="chip-cr">${r.toFixed(1)}:1<b>${grade(r)}</b></span></span>
        <span class="chip-meta" aria-hidden="true"><b>${n}</b><span class="chip-hex">${h}</span><small>${role}</small></span>
        <span class="chip-ok" aria-hidden="true">${ic('check')}Copied</span></button>`;
    };
    const colour = COL.map(([g, label, list]) => `<div class="chip-sep" data-g="${g}"><b>${label}</b><span>${list.length}</span></div>${list.map((t) => chip(g, t)).join('')}`).join('');

    /* gradients: [name, css, where it is used, stage kind, stops] */
    const GR = [
      ['Headline, dark', 'linear-gradient(90deg,#ca45ff,#fe881b 62%,#ffb340)', 'The second half of headlines on dark grounds. Warm, never blue.', 'tdark', [['#ca45ff', 0], ['#fe881b', 62], ['#ffb340', 100]]],
      ['Headline, light', 'linear-gradient(90deg,#8130ff,#d9650a 70%,#c2560a)', 'Headlines on light sheets; darker stops keep 3:1 on white.', 'tlight', [['#8130ff', 0], ['#d9650a', 70], ['#c2560a', 100]]],
      ['Button sweep', 'linear-gradient(90deg,#1c4eff,#ac24ff 50%,#fe881b)', 'Three times the button width. On hover it slides to warm in one second.', 'sweep', [['#1c4eff', 0], ['#ac24ff', 50], ['#fe881b', 100]]],
      ['Warm', 'linear-gradient(139deg,#ac24ff,#fe881b 73%,#ffd600)', 'The one hero number per page, the approval card, the AI mark.', 'warm', [['#ac24ff', 0], ['#fe881b', 73], ['#ffd600', 100]]],
      ['Orb', 'radial-gradient(circle at 0 0,#1b4dfe 10%,#ac24ff 30%,#f79fff 50%,#ffd600 70%,#fe881b 90%)', 'The AI analyst and the Client Portal hero sphere.', 'orb', [['#1b4dfe', 10], ['#ac24ff', 30], ['#f79fff', 50], ['#ffd600', 70], ['#fe881b', 90]]],
      ['Horizon', 'linear-gradient(180deg,#300681,#ac24ff 46%,#8130ff 74%,#6d6cff)', 'The violet field under a dark dome: hero, page heads, closing call.', 'cool', [['#300681', 0], ['#ac24ff', 46], ['#8130ff', 74], ['#6d6cff', 100]]],
      ['Gradient line', 'linear-gradient(90deg,#ca45ff,#fe881b 62%,#ffb340)', 'The 2 px line under the current link.', 'line', [['#ca45ff', 0], ['#fe881b', 62], ['#ffb340', 100]]],
      ['Card glow', 'radial-gradient(circle at 0 100%,#1e1d23,#111114 70%)', 'Dark cards and panels on the website.', 'card', [['#1e1d23', 0], ['#111114', 70]]],
    ];
    const stage = (k, g) => ({
      tdark: `<span class="g-word" style="background-image:${g}">Every voter</span>`,
      tlight: `<span class="g-word" style="background-image:${g}">Every voter</span>`,
      sweep: `<button type="button" class="btn btn-primary btn-md g-btn">Plan a pilot</button><span class="g-win" aria-hidden="true"><i></i></span>`,
      line: `<span class="g-nav" aria-hidden="true"><span>Dashboards</span><span class="on">Delivery</span></span>`,
      card: `<span class="g-mini" aria-hidden="true"><small>Interviews today</small><b>1,284</b><em>+12% vs yesterday</em></span>`,
      orb: `<span class="g-orb" aria-hidden="true"></span><span class="g-ring" aria-hidden="true">${ic('spark')}</span>`,
      cool: `<span class="g-say" aria-hidden="true"><b>54%</b>positive in Guntur West</span>`,
      warm: `<span class="g-say" aria-hidden="true"><em><i></i>Live survey</em><b>412</b>interviews this hour</span>`,
    })[k];
    const gradients = GR.map(([n, g, use, k, stops]) => `<article class="dcard gcard gk-${k}"><div class="dcard-stage" style="--g:${g}">${stage(k, g)}</div>
      <div class="dcard-meta"><h4>${n}</h4><p>${use}</p><i class="g-bar" style="background:linear-gradient(90deg,${stops.map(([c, p]) => `${c} ${p}%`).join(',')})"></i><span class="g-stops">${stops.map(([c, p]) => `<span><i style="background:${c}"></i>${c} ${p}%</span>`).join('')}</span></div></article>`).join('');

    /* type: [name, use, sample style, sample, size, weight, line, tracking, card width] */
    const TY = [
      ['Display', 'Hero headlines', '--fs:72px;font-weight:500;line-height:1.05;letter-spacing:-.027em', 'Hear every voter', '84', '500', '1.12', '−2.7%', 600],
      ['Heading 2', 'Section headings', '--fs:56px;font-weight:500;line-height:1.05;letter-spacing:-.03em', 'Where to act next', '68', '500', '1.05', '−3%', 520],
      ['Heading 3', 'Panel and rail titles', '--fs:41.78px;font-weight:500;line-height:1.1;letter-spacing:-.02em', 'Seat outlook', '41.78', '500', '1.1', '−2%', 420],
      ['Heading 4', 'Card titles', '--fs:29.06px;font-weight:600;line-height:1.15', 'Booth priority list', '29.06', '600', '1.15', '0', 380],
      ['Body', 'Reading text', '--fs:18.17px;line-height:1.5', 'Every answer is evidence: a voice, a place and a time, checked before it counts.', '18.17', '400', '1.5', '0', 380],
      ['Label', 'Controls and tiles', '--fs:15.43px;font-weight:600;line-height:1.4', 'Interviews today', '15.43', '600', '1.4', '0', 320],
      ['Small', 'Help text', '--fs:14.52px;line-height:1.45', 'Updated two minutes ago from 38 agents.', '14.52', '400', '1.45', '0', 320],
      ['Caption', 'Badges and chart notes only', '--fs:12.69px;font-weight:700;line-height:1.4', 'n = 1,084, margin ±3.0%', '12.69', '700', '1.4', '+1%', 320],
    ];
    const spec = (a) => `<dl class="t-spec">${[['Size', a[0]], ['Weight', a[1]], ['Line', a[2]], ['Track', a[3]]].map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join('')}</dl>`;
    const type = `<article class="tcard t-family" style="--w:360px"><header><b>Urbanist</b><span>The whole interface</span></header><p class="t-aa" aria-hidden="true">Aa</p>
        <div class="t-weights">${[400, 500, 600, 700, 800].map((w) => `<span><b style="font-weight:${w}">Aa</b>${w}</span>`).join('')}</div>
        <p class="t-note">A free stand-in for the brand’s Mazzard H. One setting swaps it in once the licence is bought.</p></article>`
      + TY.map(([n, use, st, sample, ...a]) => `<article class="tcard" style="--w:${a[4]}px"><header><b>${n}</b><span>${use}</span></header><p class="t-sample" data-live data-def="${esc(sample)}" style="${st}">${esc(sample)}</p>${spec(a)}</article>`).join('')
      + `<article class="tcard" style="--w:400px"><header><b>Telugu</b><span>Noto Sans Telugu</span></header><div class="t-te"><p class="te" lang="te">పెన్షన్ మాత్రం టైమ్‌కి వస్తుంది.</p><small>“The pension at least comes on time.”</small></div>${spec(['30', '500', '1.6', '0'])}</article>`
      + `<article class="tcard" style="--w:400px"><header><b>Numbers</b><span>Tabular figures, Indian grouping</span></header><div class="t-num"><b>1,73,309</b><span><em>₹8,300</em> a month</span><span><em>54%</em> ±3.0%</span></div>${spec(['56', '700', '1', '−2%'])}</article>`;

    /* foundations */
    const lane = (t, label) => `<div class="f-lane" style="--t:${t}ms"><span>${label}</span><span class="f-track"><span class="f-run"><i></i></span></span><b>${t} ms</b></div>`;
    const F = [
      ['Spacing', 'A 13 px rhythm from 4 to 156 px. Sections breathe at 104 to 176 px.', `<div class="f-space">${[4, 13, 26, 39, 52, 78, 104, 156].map((v) => `<span>${v}</span><i style="--v:${v}"></i>`).join('')}</div>`],
      ['Corners', 'Small things get tight corners, big surfaces soft ones.', `<div class="f-rad">${[['9', 'Chips'], ['14', 'Buttons'], ['16', 'Navigation'], ['18', 'Cards'], ['29', 'Sheets'], ['999', 'Tabs']].map(([r, l]) => `<span><i style="border-radius:${r}px"></i><b>${r === '999' ? 'Pill' : r + ' px'}</b>${l}</span>`).join('')}</div>`],
      ['Depth', 'Layers separate by tone and a 1 px line. Only floating things cast a shadow.', `<div class="f-depth" aria-hidden="true"><span class="fd1">Page</span><span class="fd2">Card glow and 1 px line</span><span class="fd3">Floating: phones, toasts</span></div>`],
      ['Easing', 'One curve for everything: a quick start and a long, soft landing.', `<div class="f-ease"><svg viewBox="-6 -6 112 112" aria-hidden="true"><path class="ax" d="M0 0V100H100"/><path class="hd" d="M0 100L16 0M100 0L30 0"/><circle class="hd-d" cx="16" cy="0" r="3"/><circle class="hd-d" cx="30" cy="0" r="3"/><path class="cv" d="M0 100C16 0 30 0 100 0"/></svg><code>cubic-bezier(.16, 1, .3, 1)</code></div>${lane(1000, 'Ease out')}`],
      ['Speed', 'Three speeds: hovers, tabs and panels, reveals and the button sweep.', `<div class="f-lanes">${lane(350, 'Instant')}${lane(400, 'Fast')}${lane(1000, 'Normal')}</div>`],
      ['Touch targets', 'Nothing a thumb needs is smaller than 44 px. The Field App goes to 46.', `<div class="f-touch">${[44, 48, 54].map((v) => `<span><i style="--v:${v}px"></i><b>${v} px</b>${v === 44 ? 'Minimum' : v === 48 ? 'Inputs' : 'Buttons'}</span>`).join('')}</div>`],
      ['Focus', 'A 2 px sky ring, 3 px clear of the control, on everything you can reach with Tab.', `<div class="f-focus"><span class="btn btn-secondary btn-md is-focus" aria-hidden="true">Explore the map</span><span class="f-key" aria-hidden="true"><kbd>Tab</kbd>moves focus</span></div>`],
    ];
    const replay = (k) => k === 'Easing' || k === 'Speed' ? `<button type="button" class="f-replay" aria-label="Replay the ${k.toLowerCase()} demo">${ic('refresh')}Replay</button>` : '';
    const found = F.map(([n, d, st]) => `<article class="dcard fcard"><div class="dcard-stage">${st}</div><div class="dcard-meta"><h4>${n}</h4><p>${d}</p>${replay(n)}</div></article>`).join('');

    /* components */
    const C = [
      ['Button, primary', 'shadcn/ui Button', '54 px tall with 14 px corners. Every state is drawn, including loading.', `<div class="c-states">${[['Default', ''], ['Hover', 'is-hover'], ['Focus', 'is-focus'], ['Pressed', 'is-active'], ['Disabled', 'is-disabled'], ['Loading', 'is-loading']].map(([l, c]) => `<span><span class="btn btn-primary btn-md ${c}" aria-hidden="true">Plan a pilot</span><small>${l}</small></span>`).join('')}</div>`],
      ['Button, other kinds', 'shadcn/ui Button', 'Secondary outlines fill navy on hover. Light sits on coloured cards.', `<div class="c-col"><span class="btn btn-secondary" aria-hidden="true">Explore the map</span><span class="c-light"><span class="btn btn-light btn-md" aria-hidden="true">Plan the pilot</span></span><span class="c-row"><span class="btn btn-primary btn-md" aria-hidden="true">Medium, 48</span><span class="btn btn-secondary btn-sm" aria-hidden="true">Small, 40</span></span></div>`],
      ['Input', 'shadcn/ui Input', 'Errors name the problem and the fix, tied to the field for screen readers.', `<div class="c-fields"><div class="field"><label for="dsI1">Seat</label><input id="dsI1" placeholder="Search a seat"></div><div class="field"><label for="dsI2">Seat</label><input id="dsI2" class="is-focus" value="Guntur West"></div><div class="field"><label for="dsI3">Amount</label><input id="dsI3" class="is-error" value="12 lakh" aria-invalid="true" aria-describedby="dsI3e"><small class="e" id="dsI3e">Use numbers only, for example 12,00,000.</small></div><div class="field"><label for="dsI4">Round</label><input id="dsI4" value="Round 1" disabled></div></div>`],
      ['Segmented tabs', 'shadcn/ui Tabs', 'Arrow keys move between options. The chosen one turns white.', `<div class="c-col"><div class="seg sm c-seg" role="group" aria-label="Map level">${[['Districts', '28 districts'], ['Seats', '175 constituencies'], ['Mandals', 'About 679 mandals']].map(([l, o], i) => `<button type="button" aria-pressed="${i === 1}" data-o="${o}">${l}</button>`).join('')}</div><output class="c-out" aria-live="polite">175 constituencies</output></div>`],
      ['Badges', 'shadcn/ui Badge', 'Always words, never colour alone. 26 px tall.', `<div class="c-badges"><span class="badge live">Live</span><span class="badge done">Completed</span><span class="badge draft">Draft</span><span class="badge flag">Flagged</span><span class="badge warn">Check</span><span class="badge blue">Synced</span><span class="badge purple">Round 2</span><span class="badge orange">Rising</span></div>`],
      ['Switch and slider', 'shadcn/ui Switch, Slider', 'Both work here. The value always sits beside its label.', `<div class="c-col c-ctl"><label class="c-sw"><span>Offline mode</span><button type="button" class="sw" role="switch" aria-checked="true" aria-label="Offline mode"></button></label><label class="c-sl" for="dsSl"><span>Interviews per seat <output id="dsSlO">400</output></span><input id="dsSl" type="range" min="100" max="1000" step="50" value="400"></label></div>`],
      ['Number tile', 'Card', 'Icon, value, label and change. Figures line up in tabular numerals.', `<div class="c-col"><div class="kpi"><span class="ki">${ic('users')}</span><div><b>${IN(STATE.iv)}</b><span>Interviews</span><em>+12% vs R1</em></div></div><div class="kpi"><span class="ki">${ic('spark')}</span><div><b>${pc(STATE.pos)}</b><span>Positive mood</span><em>${sgn(STATE.d1)} pts</em></div></div></div>`],
      ['Survey estimate', 'Card', 'Every estimate shows its sample and margin. Leads under 1 point read Level.', `<div class="c-est"><b>54%</b><span>positive in Guntur West</span><span class="c-meta"><span class="badge done">n = 1,084</span><span class="badge done">±3.0%</span><span class="badge purple">Round 2</span></span></div>`],
      ['Toast', 'shadcn/ui Sonner', 'Confirms an action in the words of the button that caused it.', `<div class="c-col c-toast"><button type="button" class="btn btn-primary btn-md c-save">Save the round</button><div class="toast" role="status"></div></div>`],
    ];
    const comps = C.map(([n, base, d, st]) => `<article class="dcard ccard"><div class="dcard-stage">${st}</div><div class="dcard-meta"><h4>${n}<small>${base}</small></h4><p>${d}</p></div></article>`).join('');

    const rail = (id, title, desc, body, tools = '') => `<div class="rail" id="ds-${id}">
      <div class="wrap rail-head"><div class="rv"><h3>${title}</h3><p>${desc}</p></div><div class="rail-tools rv" style="--d:80ms">${tools}<div class="rail-nav"><button type="button" class="rail-btn" data-dir="-1" aria-label="Scroll ${title.toLowerCase()} back">${ic('arrow')}</button><button type="button" class="rail-btn" data-dir="1" aria-label="Scroll ${title.toLowerCase()} forward">${ic('arrow')}</button></div></div></div>
      <div class="rail-track" tabindex="0" role="region" aria-label="${title}. Scrolls sideways">${body}</div>
      <div class="wrap"><span class="rail-bar" aria-hidden="true"><i></i></span></div></div>`;

    const parts = [['colour', 'Colour', ALL.length], ['gradients', 'Gradients', GR.length], ['type', 'Type', TY.length + 3], ['foundations', 'Foundations', F.length], ['components', 'Components', C.length]];
    el.innerHTML = `<div class="wrap"><div class="ds-strip rv" role="group" aria-label="All ${ALL.length} colour tokens, darkest to lightest">${strip.map((t, i) => `<button type="button" class="ds-sl" data-hex="${t.h}" style="--c:${t.h};--fg:${onIt(t.h)};--i:${i}" aria-label="${t.n}, ${t.h}. Show it in the colour list"><span>${t.n}<em>${t.h}</em></span></button>`).join('')}</div>
        <nav class="ds-parts rv" aria-label="Design system parts">${parts.map(([id, l, n]) => `<a href="#ds-${id}">${l}<span>${n}</span></a>`).join('')}</nav></div>
      ${rail('colour', 'Colour', 'The reference brand’s exact values, named as the design file names them. Each chip shows its best text colour and contrast. Select one to copy it.', colour, `<div class="seg sm ds-groups" role="group" aria-label="Jump to a colour group">${COL.map(([g, l], i) => `<button type="button" data-g="${g}" aria-pressed="${i === 0}">${l}</button>`).join('')}</div>`)}
      ${rail('gradients', 'Gradients', 'The only eight gradients in the product, each shown where it is used.', gradients)}
      ${rail('type', 'Type', 'One family carries everything, with Noto Sans Telugu for Telugu. Type below to try your own words at every size.', type, `<label class="ds-try"><span class="sr">Try your own words</span><input type="text" maxlength="48" placeholder="Try your own words" autocomplete="off"></label>`)}
      ${rail('foundations', 'Foundations', 'Space, corners, depth and motion: the rules every screen shares.', found)}
      ${rail('components', 'Components', 'shadcn/ui anatomy in the brand’s own style, with the states people actually meet.', comps)}
      <p class="sr" aria-live="polite" id="dsLive"></p>`;

    /* ---- rails ---- */
    const live = $('#dsLive');
    /* each rail reads its geometry first and writes after; on load all five rails read, then
       all five write, so the page is laid out once instead of once per rail */
    const firsts = [];
    $$('.rail', el).forEach((r) => {
      const track = r.querySelector('.rail-track'), bar = r.querySelector('.rail-bar'), thumb = bar.querySelector('i');
      const [prev, next] = r.querySelectorAll('.rail-btn');
      const groups = r.querySelectorAll('.ds-groups button');
      const pad = () => parseFloat(getComputedStyle(track).paddingLeft) || 0;
      let raf = 0, want = null, wantT = 0;
      const measure = () => {
        const max = track.scrollWidth - track.clientWidth, x = track.scrollLeft;
        let cur = null;
        if (groups.length) {
          const edge = x + pad() + 40; cur = groups[0].dataset.g;
          r.querySelectorAll('.chip-sep').forEach((s) => { if (s.offsetLeft <= edge) cur = s.dataset.g; });
          if (x >= max - 2) cur = groups[groups.length - 1].dataset.g;
          if (want && performance.now() - wantT < 1500) cur = want;
        }
        return { max, x, f: max > 0 ? track.clientWidth / track.scrollWidth : 1, cur };
      };
      const apply = ({ max, x, f, cur }) => {
        const p = max > 0 ? x / max : 0;
        thumb.style.width = f * 100 + '%';
        thumb.style.transform = `translateX(${f < 1 ? (p * (1 - f) / f) * 100 : 0}%)`;
        bar.hidden = max <= 2;
        prev.disabled = x <= 2; next.disabled = x >= max - 2;
        r.classList.toggle('no-scroll', max <= 2); r.classList.toggle('at-end', x >= max - 2);
        if (cur) groups.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.g === cur)));
      };
      const update = () => { raf = 0; apply(measure()); };
      const queue = () => { if (!raf) raf = requestAnimationFrame(update); };
      track.addEventListener('scroll', queue, { passive: true });
      window.addEventListener('resize', queue);
      firsts.push([measure, apply]);
      const go = (left) => track.scrollTo({ left, behavior: reduced ? 'auto' : 'smooth' });
      [prev, next].forEach((b) => b.addEventListener('click', () => {
        const dir = +b.dataset.dir, x = track.scrollLeft, w = track.clientWidth - pad() * 2;
        const cards = [...track.children].filter((c) => c.offsetWidth > 60);
        // move by whole cards: forward to the first card cut off on the right, back by about one view
        const t = dir > 0 ? cards.find((c) => c.offsetLeft + c.offsetWidth > x + pad() + w + 2) : [...cards].reverse().find((c) => c.offsetLeft - pad() <= x - w * 0.9) || cards[0];
        go(t ? t.offsetLeft - pad() : dir * w);
      }));
      groups.forEach((b) => b.addEventListener('click', () => {
        const s = r.querySelector(`.chip-sep[data-g="${b.dataset.g}"]`); if (!s) return;
        want = b.dataset.g; wantT = performance.now(); go(s.offsetLeft - pad());
      }));

      /* mouse drag: native scrolling covers touch and trackpads */
      let drag = null, moved = false;
      track.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('input, textarea, .c-seg, .sw, .c-save, .g-btn, label')) return;
        drag = { x: e.clientX, left: track.scrollLeft, t: performance.now(), v: 0 }; moved = false;
      });
      window.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const dx = e.clientX - drag.x;
        if (!moved && Math.abs(dx) < 6) return;
        if (!moved) { moved = true; track.classList.add('is-drag'); }
        const now = performance.now(), nx = drag.left - dx;
        drag.v = (nx - track.scrollLeft) / Math.max(1, now - drag.t); drag.t = now;
        track.scrollLeft = nx;
      });
      window.addEventListener('pointerup', () => {
        if (!drag) return;
        const v = drag.v; drag = null;
        if (!moved) return;
        // land on the nearest card in the direction of the throw, then hand back to snapping
        const aim = track.scrollLeft + v * 220 + pad();
        const cards = [...track.children];
        const t = cards.reduce((a, c) => Math.abs(c.offsetLeft - aim) < Math.abs(a.offsetLeft - aim) ? c : a, cards[0]);
        go(Math.max(0, t.offsetLeft - pad()));
        setTimeout(() => track.classList.remove('is-drag'), reduced ? 0 : 450);
      });
      track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    });
    requestAnimationFrame(() => { const m = firsts.map(([measure]) => measure()); firsts.forEach(([, apply], i) => apply(m[i])); });

    /* ---- colour: copy on select, strip jumps to its chip ---- */
    el.addEventListener('click', (e) => {
      const c = e.target.closest('.chip');
      if (!c) return;
      const h = c.dataset.hex;
      if (navigator.clipboard) navigator.clipboard.writeText(h).catch(() => {});
      c.classList.add('is-copied'); live.textContent = `Copied ${h}`;
      clearTimeout(c._t); c._t = setTimeout(() => c.classList.remove('is-copied'), 1600);
    });
    $$('.ds-sl', el).forEach((s) => s.addEventListener('click', () => {
      const rail = $('#ds-colour'), track = rail.querySelector('.rail-track');
      const c = rail.querySelector(`.chip[data-hex="${s.dataset.hex}"]`); if (!c) return;
      // the row moves instantly while it is still below the fold, then the page glides down to it
      track.scrollTo({ left: c.offsetLeft - (parseFloat(getComputedStyle(track).paddingLeft) || 0), behavior: 'auto' });
      rail.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      c.focus({ preventScroll: true });
      c.classList.remove('is-flash'); void c.offsetWidth; c.classList.add('is-flash');
    }));
    const stripEl = $('.ds-strip', el);
    if (reduced || !('IntersectionObserver' in window)) stripEl.classList.add('drawn');
    else {
      const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { stripEl.classList.add('drawn'); io.disconnect(); } }, { threshold: 0.35 });
      io.observe(stripEl);
    }

    /* ---- gradients: tap the sweep button to see the sweep on touch screens ---- */
    $$('.g-btn', el).forEach((b) => b.addEventListener('click', () => b.closest('.gcard').classList.toggle('is-on')));

    /* ---- type tester ---- */
    const tryIn = $('.ds-try input', el), samples = $$('.t-sample[data-live]', el);
    tryIn.addEventListener('input', () => { const v = tryIn.value.trim(); samples.forEach((s) => { s.textContent = v || s.dataset.def; }); });

    /* ---- motion demos: play once when seen, replay on request ---- */
    const play = (card) => { card.classList.remove('go'); void card.offsetWidth; card.classList.add('go'); };
    const motion = $$('.fcard', el).filter((c) => c.querySelector('.f-lane'));
    motion.forEach((c) => {
      c.querySelector('.f-replay').addEventListener('click', () => play(c));
      c.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') play(c); });
    });
    if (reduced || !('IntersectionObserver' in window)) motion.forEach((c) => c.classList.add('go'));
    else {
      const mo = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { setTimeout(() => play(e.target), 250); mo.unobserve(e.target); } }), { threshold: 0.6 });
      motion.forEach((c) => mo.observe(c));
    }

    /* ---- working components ---- */
    const seg = $('.c-seg', el), out = $('.c-out', el), segB = $$('button', seg);
    const pick = (b, focus) => { segB.forEach((x) => { x.setAttribute('aria-pressed', String(x === b)); x.tabIndex = x === b ? 0 : -1; }); out.textContent = b.dataset.o; if (focus) b.focus(); };
    segB.forEach((b) => { b.tabIndex = b.getAttribute('aria-pressed') === 'true' ? 0 : -1; b.addEventListener('click', () => pick(b)); });
    seg.addEventListener('keydown', (e) => {
      const i = segB.indexOf(document.activeElement); if (i < 0) return;
      const j = e.key === 'ArrowRight' ? (i + 1) % segB.length : e.key === 'ArrowLeft' ? (i - 1 + segB.length) % segB.length : e.key === 'Home' ? 0 : e.key === 'End' ? segB.length - 1 : -1;
      if (j < 0) return; e.preventDefault(); pick(segB[j], true);
    });
    const sw = $('.c-sw .sw', el);
    sw.addEventListener('click', (e) => { e.preventDefault(); sw.setAttribute('aria-checked', String(sw.getAttribute('aria-checked') !== 'true')); });
    const sl = $('#dsSl'), slo = $('#dsSlO');
    const fill = () => { slo.textContent = IN(+sl.value); sl.style.setProperty('--p', ((sl.value - sl.min) / (sl.max - sl.min)) * 100 + '%'); };
    sl.addEventListener('input', fill); fill();
    const save = $('.c-save', el), tst = save.parentElement.querySelector('.toast');
    save.addEventListener('click', () => { tst.textContent = 'Round saved. 12 agents notified.'; tst.classList.add('show'); clearTimeout(tst._h); tst._h = setTimeout(() => tst.classList.remove('show'), 2600); });
  }

  /* ---------------- init ---------------- */
  /* a page may leave out the script that defines a builder (how.html has no dash.js): skip it */
  const run = (name, f) => { if (typeof f !== 'function') return; try { f(); } catch (e) { console.error('[' + name + ']', e); } };
  function init() {
    run('nav', Nav);
    run('tilt', HeroTilt);
    run('contents', Contents);
    run('art', Art);
    run('scale', Scale);
    run('voice', Voice);
    run('people', People);
    run('sitemap', Sitemap);
    run('explorer', Explorer);
    run('chat', P.Chat);
    run('features', Features);
    run('savings', Savings);
    run('monthly', Monthly);
    run('engage', Engage);
    run('delivery', Delivery);
    run('research', Research);
    run('compete', Compete);
    run('trust', Trust);
    run('risks', Risks);
    run('system', System);
    run('reveal', Reveal);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
