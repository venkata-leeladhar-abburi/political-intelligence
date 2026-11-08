/* Political Intelligence Platform · Trust page (trust.html), prefix iv-.
   The page makes the case to an investor in seven steps: the problem, who pays, the election
   calendar, unit economics, the revenue streams, how quickly it is built and how cheaply it runs,
   and why its numbers hold up. Illustrations come from the footer garden's own forms (hairline
   stems, split-gradient leaves, speech-bubble pods, speech-bubble-petal blooms, gold orbs with the
   brand ring); every head carries a small glyph that says what the plant stands for.
   Builders: buyer scenes + tabs (#ivBuy), revenue garden + streams (#ivRev), revenue sizer (#ivCalc),
   check stem (#ivStem). Everything is built near the viewport and holds still for reduced motion. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const n1 = (v) => Math.round(v * 10) / 10;
  const near = (el, fn) => {
    if (!el) return;
    if (window.PI && typeof window.PI.near === 'function') { window.PI.near(el, fn); return; }
    fn();
  };

  const { scene, grow, defs, bars, PETAL } = window.PIGarden;

  /* ================================================================ buyers */
  const BUYERS = [
    {
      key: 'party', name: 'Political parties', line: 'Their own surveys, seat by seat, every round.',
      uses: ['Booth-level mood, ruling vs opposition, round on round', 'Which seats to fight for, and which issues move them', 'Candidate and leader ratings, heard in voters’ own words'],
      pays: 'Setup, then a fee per verified interview and support each round', apps: 'Command Center · Client Portal · Field App',
      art: { plants: [
        { k: 'orb', x: 48, t: [60, 236], b: -10, s: 0.9, lv: [[0.4, 1, 0.34, 54]] },
        { k: 'pod', x: 138, t: [118, 176], b: -24, f: 1, g: 'wave', w: 96, h: 60, lv: [[0.16, 1, 0.55, 60], [0.5, -1, 0.34, 52]] },
        { k: 'bloom', x: 244, t: [238, 116], b: 18, s: 0.74, rot: 8, lv: [[0.12, -1, 0.66, 64], [0.38, 1, 0.48, 56], [0.62, -1, 0.3, 50]] },
        { k: 'pod', x: 346, t: [370, 160], b: 26, f: 2, g: 'pin', w: 70, h: 62, lv: [[0.2, -1, 0.5, 58]] },
        { k: 'orb', x: 432, t: [440, 252], b: 8, s: 0.66, ring: false, lv: [] },
      ], sprigs: [{ x: 300, t: [310, 136], b: -26 }], dust: [[90, 120, 6, 0], [190, 60, 4, 3], [420, 96, 7, 2], [330, 70, 3, 1], [30, 170, 4, 3]] },
    },
    {
      key: 'agency', name: 'Survey & polling agencies', line: 'Proof behind every interview they sell.',
      uses: ['Fake and rushed interviews caught before they count', 'Open answers coded by AI in hours, not by hand in weeks', 'Their own brand on the reports their clients receive'],
      pays: 'A white-label licence and a fee per verified interview', apps: 'Command Center · Field App · white-label portal',
      art: { plants: [
        { k: 'pod', x: 92, t: [76, 186], b: -16, f: 0, g: 'check', w: 84, h: 58, lv: [[0.2, 1, 0.5, 60]] },
        { k: 'pod', x: 214, t: [206, 112], b: 14, f: 1, g: 'check', w: 96, h: 64, lv: [[0.12, -1, 0.66, 64], [0.44, 1, 0.42, 54]] },
        { k: 'pod', x: 336, t: [344, 168], b: 22, f: 2, g: 'check', w: 84, h: 58, lv: [[0.18, -1, 0.52, 60], [0.5, 1, 0.3, 50]] },
        { k: 'orb', x: 438, t: [432, 244], b: -8, s: 0.78, lv: [[0.45, -1, 0.3, 50]] },
        { k: 'orb', x: 30, t: [34, 262], b: 6, s: 0.58, ring: false, lv: [] },
      ], sprigs: [{ x: 160, t: [150, 150], b: 20 }], dust: [[150, 70, 6, 2], [290, 54, 4, 0], [440, 120, 8, 3], [40, 110, 5, 1]] },
    },
    {
      key: 'media', name: 'TV channels & news media', line: 'Opinion polls and trackers they can stand behind.',
      uses: ['Weekly trackers with seat ranges and margins on screen', 'Real, consented voter voices to play on air', 'The election-silence switch keeps them inside the law'],
      pays: 'A fee per poll or tracker round, plus each verified interview', apps: 'Client Portal · Ask the Data · exports',
      art: { plants: [
        { k: 'pod', x: 80, t: [70, 214], b: -14, f: 0, g: 'wave', w: 84, h: 56, gk: 0.86, lv: [[0.2, 1, 0.46, 60]] },
        { k: 'pod', x: 236, t: [176, 132], b: -20, f: 1, g: 'chart', w: 178, h: 106, gk: 1.3, sw: 3.2, lv: [[0.12, 1, 0.7, 62], [0.4, -1, 0.46, 54]] },
        { k: 'orb', x: 406, t: [410, 196], b: 16, s: 0.9, lv: [[0.3, -1, 0.5, 56]] },
        { k: 'orb', x: 452, t: [458, 270], b: 4, s: 0.5, ring: false, lv: [] },
      ], sprigs: [{ x: 360, t: [372, 120], b: 24 }], dust: [[30, 120, 6, 3], [140, 40, 4, 0], [460, 90, 7, 2], [400, 46, 3, 1]] },
    },
    {
      key: 'consult', name: 'Consultancies & candidates', line: 'Ground truth for the people who plan the campaign.',
      uses: ['A deep read of one seat, its mandals and its booths', 'The undecided voters, and what would move them', 'Questions answered in plain words by Ask the Data'],
      pays: 'Setup per engagement, then per verified interview', apps: 'Client Portal · Ask the Data · reports',
      art: { plants: [
        { k: 'pod', x: 96, t: [84, 184], b: -18, f: 0, g: 'trend', w: 88, h: 60, lv: [[0.18, 1, 0.52, 60], [0.5, -1, 0.3, 50]] },
        { k: 'orb', x: 240, t: [236, 150], b: 12, s: 1.55, g: 'spark', lv: [[0.14, -1, 0.66, 64], [0.42, 1, 0.46, 56]] },
        { k: 'pod', x: 372, t: [392, 176], b: 22, f: 2, g: 'pin', w: 70, h: 62, lv: [[0.2, -1, 0.5, 58]] },
        { k: 'orb', x: 456, t: [452, 260], b: -6, s: 0.6, ring: false, lv: [] },
      ], sprigs: [{ x: 168, t: [158, 120], b: 18 }, { x: 318, t: [326, 108], b: -20 }], dust: [[40, 110, 6, 2], [250, 40, 4, 0], [440, 100, 7, 3], [120, 60, 3, 1]] },
    },
  ];

  function Buyers() {
    const host = $('#ivBuy');
    if (!host) return;
    near(host, () => {
      const tabs = $$('[role="tab"]', host);
      const stage = $('.iv-buy-art', host), panel = $('.iv-buy-txt', host);
      /* the scenes are drawn on a 480 × 300 ground; a taller canvas (420) keeps the heads where they are and lets the stems run longer */
      stage.innerHTML = BUYERS.map((b, i) => `<div class="iv-buy-scene${i === 0 ? ' is-on' : ''}" data-k="${b.key}">${scene(`ivb${i}`, 480, 420, { ...b.art, dust: b.art.dust.map(([x, y, r, c]) => [x, y + 60, r, c]), plants: b.art.plants.map((p) => ({ ...p, t: [p.t[0], p.t[1] + 60] })), sprigs: (b.art.sprigs || []).map((q) => ({ ...q, t: [q.t[0], q.t[1] + 60] })) })}</div>`).join('');
      grow(stage);
      const show = (i, focus) => {
        const b = BUYERS[i];
        tabs.forEach((t, j) => { t.setAttribute('aria-selected', j === i ? 'true' : 'false'); t.tabIndex = j === i ? 0 : -1; });
        if (focus) tabs[i].focus();
        $$('.iv-buy-scene', stage).forEach((s, j) => s.classList.toggle('is-on', j === i));
        panel.setAttribute('aria-labelledby', tabs[i].id);
        panel.innerHTML = `<h3>${b.name}</h3><p class="iv-buy-line">${b.line}</p>`
          + `<ul>${b.uses.map((u) => `<li>${u}</li>`).join('')}</ul>`
          + `<dl><div><dt>How they pay</dt><dd>${b.pays}</dd></div><div><dt>What they use</dt><dd>${b.apps}</dd></div></dl>`;
        panel.classList.remove('is-swap'); void panel.offsetWidth; panel.classList.add('is-swap');
      };
      tabs.forEach((t, i) => {
        t.addEventListener('click', () => show(i));
        t.addEventListener('keydown', (e) => {
          const k = e.key, n = tabs.length;
          let j = null;
          if (k === 'ArrowDown' || k === 'ArrowRight') j = (i + 1) % n;
          else if (k === 'ArrowUp' || k === 'ArrowLeft') j = (i - 1 + n) % n;
          else if (k === 'Home') j = 0; else if (k === 'End') j = n - 1;
          if (j != null) { e.preventDefault(); show(j, true); }
        });
      });
      show(0);
    });
  }

  /* ================================================================ revenue garden */
  const STREAMS = [
    { name: 'Setup fee', when: 'Once, per client', how: 'Agreed per deal', grow: 'Every new client, every new state.', body: 'Sets a client up: their seats and booths, question bank, users and roles, branding and training for the field team.' },
    { name: 'Per verified interview', when: 'Every round', how: '₹5–10 an interview', grow: 'More seats, more rounds, more clients. Costs us about ₹0.24.', body: 'Paid only for interviews that pass all nine checks, so the client pays for proof, and the fee grows with every round they run.' },
    { name: 'Support per round', when: 'Each survey round', how: 'Agreed per deal', grow: 'Rounds repeat all through the election year.', body: 'New questions for the round, field-team training, support through survey weeks and the round notes. Upkeep pays for itself.' },
    { name: 'New states', when: 'Per state rollout', how: 'A separate rollout fee', grow: '31 legislatures, each on its own election clock.', body: 'Each state adds its map, its language and its question bank to the same platform. Telangana is next: same language, 119 seats.' },
    { name: 'White-label & add-ons', when: 'Yearly licence', how: 'Priced per agency', grow: 'Agencies resell it to their own clients.', body: 'Agencies run the platform under their own brand. Add-ons follow: extra analyst seats, custom reports, social listening.' },
  ];
  const REV = {
    root: [70, 1130],
    plants: [
      { key: 0, k: 'orb', x: 196, t: [180, 330], b: -18, s: 1.5, g: 'rupee', lv: [[0.3, 1, 0.8, 58], [0.62, -1, 0.5, 52]] },
      { key: 2, k: 'pod', x: 400, t: [372, 236], b: -30, f: 0, g: 'cycle', w: 128, h: 80, gk: 1.1, lv: [[0.14, 1, 1.05, 62], [0.48, -1, 0.66, 54]] },
      { key: 1, k: 'bloom', x: 604, t: [596, 168], b: 22, s: 1.18, rot: 6, sw: 3.4, lv: [[0.1, -1, 1.2, 66], [0.32, 1, 0.9, 58], [0.56, -1, 0.62, 52]] },
      { key: 3, k: 'bloom', x: 820, t: [846, 266], b: 26, s: 0.84, rot: -10, lv: [[0.14, -1, 0.95, 62], [0.46, 1, 0.6, 54]] },
      { key: 4, k: 'pod', x: 1016, t: [1032, 292], b: 16, f: 2, g: 'spark', w: 112, h: 72, lv: [[0.18, -1, 0.9, 60], [0.5, 1, 0.5, 52]] },
    ],
    sprigs: [{ x: 300, t: [286, 214], b: 24 }, { x: 716, t: [728, 196], b: -20 }, { x: 930, t: [920, 170], b: 22 }],
    dust: [[110, 160, 9, 0], [260, 90, 5, 3], [470, 120, 8, 2], [700, 60, 5, 0], [960, 110, 9, 3], [1110, 200, 6, 1], [520, 300, 4, 1], [1150, 360, 5, 0], [60, 380, 6, 2]],
  };
  /* where each stream's tag sits, in scene units, and which side of the head it hangs from */
  const HEADS = { 0: [234, 300, 'r'], 1: [690, 121, 'r'], 2: [338, 182, 'l'], 3: [782, 232, 'l'], 4: [1064, 196, 'u'] };

  function Revenue() {
    const host = $('#ivRev');
    if (!host) return;
    near(host, () => {
      const art = $('.iv-rev-art', host), tabs = $$('[role="tab"]', host), card = $('.iv-rev-card', host);
      art.insertAdjacentHTML('afterbegin', scene('ivr', 1200, 520, REV));
      art.insertAdjacentHTML('beforeend', STREAMS.map((s, i) => `<span class="iv-tag iv-tag-${HEADS[i][2]}" data-key="${i}" style="left:${n1(HEADS[i][0] / 12)}%;top:${n1(HEADS[i][1] / 5.2)}%" aria-hidden="true"><b>${i + 1}</b>${s.name}</span>`).join(''));
      grow(art);
      const show = (i, focus) => {
        const s = STREAMS[i];
        tabs.forEach((t, j) => { t.setAttribute('aria-selected', j === i ? 'true' : 'false'); t.tabIndex = j === i ? 0 : -1; });
        if (focus) tabs[i].focus();
        host.dataset.on = i;
        $$('.iv-pl[data-key], .iv-tag', art).forEach((g) => g.classList.toggle('is-on', +g.dataset.key === i));
        card.setAttribute('aria-labelledby', tabs[i].id);
        card.innerHTML = `<div class="iv-rev-main"><span class="iv-rev-n">${String(i + 1).padStart(2, '0')}</span><h3>${s.name}</h3><p>${s.body}</p></div>`
          + `<dl class="iv-rev-facts"><div><dt>When it is paid</dt><dd>${s.when}</dd></div><div><dt>How much</dt><dd>${s.how}</dd></div><div><dt>Why it grows</dt><dd>${s.grow}</dd></div></dl>`;
        card.classList.remove('is-swap'); void card.offsetWidth; card.classList.add('is-swap');
      };
      tabs.forEach((t, i) => {
        t.addEventListener('click', () => show(i));
        t.addEventListener('keydown', (e) => {
          const n = tabs.length; let j = null;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % n;
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + n) % n;
          else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = n - 1;
          if (j != null) { e.preventDefault(); show(j, true); }
        });
      });
      /* the plants and their tags are a second, pointer-only way in */
      $$('.iv-pl[data-key], .iv-tag', art).forEach((g) => g.addEventListener('click', () => show(+g.dataset.key)));
      show(1);
    });
  }

  /* ================================================================ revenue sizer */
  /* monthly running cost for a monthly interview volume, from the lean plan on the Pricing page:
     4,000 → ₹844 · 17,500 → ₹5,249 · 35,000 → ₹8,312, then about ₹0.175 per extra interview */
  const COST = [[0, 0], [4000, 844], [17500, 5249], [35000, 8312]];
  const runCost = (n) => {
    for (let i = 1; i < COST.length; i++) if (n <= COST[i][0]) { const [a, ca] = COST[i - 1], [b, cb] = COST[i]; return ca + (cb - ca) * (n - a) / (b - a); }
    return 8312 + (n - 35000) * 0.175;
  };
  const inr = (v) => {
    if (v >= 1e7) return `₹${(v / 1e7).toFixed(v >= 1e8 ? 0 : 2).replace(/\.?0+$/, '')} crore`;
    if (v >= 1e5) return `₹${(v / 1e5).toFixed(v >= 1e6 ? 1 : 2).replace(/\.?0+$/, '')} lakh`;
    return `₹${Math.round(v).toLocaleString('en-IN')}`;
  };
  function Calc() {
    const host = $('#ivCalc');
    if (!host) return;
    const f = {};
    $$('input[type="range"]', host).forEach((r) => { f[r.name] = r; });
    const fees = $$('[data-fee]', host);
    let fee = 7.5;
    const out = (k) => $(`[data-out="${k}"]`, host);
    const fill = (r) => r.style.setProperty('--p', `${((r.value - r.min) / (r.max - r.min)) * 100}%`);
    const run = () => {
      const c = +f.clients.value, seats = +f.seats.value, per = +f.per.value, rounds = +f.rounds.value;
      Object.values(f).forEach(fill);
      out('clients').textContent = c;
      out('seats').textContent = seats;
      out('per').textContent = per;
      out('rounds').textContent = rounds;
      const monthly = c * seats * per;                 /* one round runs over about a month */
      const year = monthly * rounds;
      const rev = year * fee;
      const cost = runCost(monthly) * rounds;
      const margin = rev > 0 ? (1 - cost / rev) * 100 : 0;
      out('rev').textContent = inr(rev);
      out('n').textContent = year.toLocaleString('en-IN');
      out('cost').textContent = inr(cost);
      out('margin').textContent = `${margin.toFixed(1)}%`;
      out('per1').textContent = `₹${(runCost(monthly) / Math.max(1, monthly)).toFixed(2)}`;
      $('.iv-calc-bar i', host).style.setProperty('--c', `${Math.max(0.6, (cost / Math.max(1, rev)) * 100)}%`);
    };
    Object.values(f).forEach((r) => r.addEventListener('input', run));
    fees.forEach((b) => b.addEventListener('click', () => {
      fee = +b.dataset.fee;
      fees.forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      run();
    }));
    run();
  }

  /* ================================================================ fieldwork dots */
  function Dots() {
    const host = $('#ivDots');
    if (!host) return;
    /* 100 dots = ₹200 of fieldwork per interview; our ₹7.50 fee lights about four of them */
    host.innerHTML = Array.from({ length: 100 }, (_, i) => `<i${i >= 96 ? ' class="on"' : ''} style="--i:${i}"></i>`).join('');
  }

  /* ================================================================ check stem */
  function Stem() {
    const host = $('#ivStem');
    if (!host) return;
    const b = $('.iv-bloom', host);
    if (b) {
      b.innerHTML = `<svg viewBox="-80 -80 160 160" focusable="false">${defs('ivs', 160)}<g class="iv-bl">`
        + Array.from({ length: 5 }, (_, k) => `<g transform="rotate(${8 + k * 72})"><path d="${PETAL}" fill="url(#ivspt)"/><path d="${PETAL}" fill="url(#ivssh)"/></g>`).join('')
        + `<circle r="15" fill="url(#ivsau)"/><g class="ivw" fill="#fff">${bars(0, 0, [5, 10, 14, 9, 5], 4.4, 2.4)}</g></g></svg>`;
    }
    grow(host);
  }

  function init() {
    [Buyers, Revenue, Calc, Dots, Stem].forEach((f) => { try { f(); } catch (e) { console.error('[trust]', f.name, e); } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
