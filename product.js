/* Political Intelligence Platform · Product page (product.html), prefix pd-.
   An investor reads: the loop (four steps, drawn as one garden), the apps (a real screen each, with
   what it does and why it matters to the business), five people, the paid rounds of an election,
   scale, the twelve features (extras.js), the competition (sections.js Compete) and the product map.
   Builders here: Loop (#pdLoop), Apps (#pdApps), People (#pdPpl), Map (#pdMap). */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const ic = (n) => `<svg aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const near = (el, fn) => { if (!el) return; if (window.PI && typeof window.PI.near === 'function') window.PI.near(el, fn); else fn(); };
  const G = window.PIGarden;

  /* roving tabs: arrows, Home and End move and select */
  function tabs(list, show) {
    const t = $$('[role="tab"]', list);
    t.forEach((b, i) => {
      b.addEventListener('click', () => show(i));
      b.addEventListener('keydown', (e) => {
        const n = t.length; let j = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % n;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + n) % n;
        else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = n - 1;
        if (j != null) { e.preventDefault(); show(j); t[j].focus(); }
      });
    });
    return (i) => t.forEach((b, j) => { b.setAttribute('aria-selected', j === i ? 'true' : 'false'); b.tabIndex = j === i ? 0 : -1; });
  }
  const swap = (el) => { el.classList.remove('is-swap'); void el.offsetWidth; el.classList.add('is-swap'); };

  /* ================================================================ the loop, as one garden */
  function Loop() {
    const host = $('#pdLoop');
    if (!host || !G) return;
    near(host, () => {
      const art = $('.pd-loop-art', host);
      const spec = {
        plants: [
          { k: 'pod', x: 160, t: [112, 196], b: -28, f: 1, g: 'wave', w: 124, h: 78, lv: [[0.18, 1, 0.82, 60], [0.5, -1, 0.5, 52]] },
          { k: 'orb', x: 452, t: [450, 206], b: 18, s: 1.7, g: 'check', lv: [[0.2, -1, 0.82, 62], [0.5, 1, 0.5, 54]] },
          { k: 'bloom', x: 752, t: [750, 214], b: -20, s: 1.08, rot: 6, lv: [[0.16, 1, 0.86, 62], [0.48, -1, 0.56, 54]] },
          { k: 'pod', x: 1052, t: [1000, 206], b: 24, f: 2, g: 'chart', w: 152, h: 94, gk: 1.15, lv: [[0.16, -1, 0.84, 60], [0.5, 1, 0.5, 52]] },
        ],
        sprigs: [{ x: 300, t: [300, 230], b: 20 }, { x: 900, t: [906, 220], b: -18 }],
        dust: [[60, 120, 7, 0], [300, 70, 5, 3], [600, 50, 6, 2], [880, 90, 5, 1], [1150, 140, 8, 3], [1180, 300, 4, 0], [30, 300, 5, 2]],
      };
      /* the voice travels head to head along one glowing line */
      const link = 'M174 136C260 34 380 34 450 150C540 34 660 34 750 150C840 34 960 34 1050 110';
      const svg = G.scene('pdl', 1200, 380, spec).replace('</svg>', `<path d="${link}" fill="none" stroke="url(#pdlrg)" stroke-width="1.6" stroke-opacity=".45" stroke-dasharray="3 7"/><path class="pd-run" d="${link}" pathLength="100" fill="none" stroke="#ffd600" stroke-width="3.2" stroke-linecap="round"/></svg>`);
      art.innerHTML = svg;
      G.grow(art);
    });
  }

  /* ================================================================ apps */
  const APPS = [
    { img: 'field-app', url: 'Field App · today’s interviews', who: 'Field agents, like Ravi', line: 'Collect a verified interview at the doorstep, with one thumb and no signal.',
      feats: ['Consent, tapped answers and the voter’s recorded voice in one flow', 'Works offline for days and syncs safely when signal returns', 'GPS, time and a secret-ballot screen on every interview'],
      biz: 'Every paid interview starts here. Clean collection is what lets us charge for proof.', go: ['/demo#demo-field', 'Open the Field App'] },
    { img: 'command-center-dark', url: 'Command Center · Overview', who: 'Supervisors, analysts and admins', line: 'Run every survey round: the field force, verification, analytics and reports.',
      feats: ['A live agent map and a queue for every flagged interview', 'Weighted results, round-on-round compare and ten report types', 'Users, roles, election silence and costs in one place'],
      biz: 'Agencies work in it every day of a round. Daily use is what keeps a client with us.', go: ['/demo#demo-command', 'Open the Command Center'] },
    { img: 'client-portal', url: 'Client Portal · Today', who: 'Strategists and party leaders', line: 'Today’s read on one screen: who leads, by how much, and where to act.',
      feats: ['Seat ranges, approval, leaders and issues at a glance', 'Tap any district or seat for its full story', 'Hear what voters said, in their own voice'],
      biz: 'This is what the buyer pays for, readable in five seconds on a phone.', go: ['/demo#demo-portal', 'Open the Client Portal'] },
    { img: 'ai-analyst', url: 'Command Center · AI analyst', who: 'Anyone with access, in English or Telugu', line: 'Ask in plain words. Get the number, the margin and the voices behind it.',
      feats: ['Counts from verified data, never guesses', 'Finds matching quotes across thousands of transcripts', 'Refuses when a sample is too small to be honest'],
      biz: 'Our premium feature, and the reason a strategist opens the platform every day.', go: ['/demo#ask', 'Ask it a question'] },
  ];
  function Apps() {
    const host = $('#pdApps');
    if (!host) return;
    const list = $('.pd-app-tabs', host), panel = $('#pdAppP'), copy = $('.pd-app-copy', host);
    const img = $('.pd-app-shot img', host), url = $('.pd-app-shot .url', host);
    /* warm the other screenshots once the section is near */
    near(host, () => APPS.forEach((a) => { const i = new Image(); i.src = `assets/product/${a.img}.webp`; }));
    let sel;
    const show = (i) => {
      const a = APPS[i];
      sel(i);
      panel.setAttribute('aria-labelledby', `pdA${i}`);
      copy.innerHTML = `<p class="pd-who">${ic('user')}${esc(a.who)}</p><h3>${esc(a.line)}</h3>`
        + `<ul>${a.feats.map((f) => `<li>${ic('check')}<span>${esc(f)}</span></li>`).join('')}</ul>`
        + `<p class="pd-biz"><b>Why it matters</b>${esc(a.biz)}</p>`
        + `<a class="btn btn-primary btn-md" href="${a.go[0]}">${esc(a.go[1])} ${ic('arrow')}</a>`;
      swap(copy);
      img.classList.add('is-out');
      const next = `assets/product/${a.img}.webp`;
      const done = () => { img.classList.remove('is-out'); };
      setTimeout(() => {
        img.alt = `${a.url}: ${a.line}`;
        url.textContent = a.url;
        if (img.getAttribute('src') !== next) { img.onload = done; img.src = next; if (img.complete) done(); } else done();
      }, 160);
    };
    sel = tabs(list, show);
    show(0);
  }

  /* ================================================================ people */
  /* the same five people as the rest of the site (sections.js), with who pays marked */
  const PEOPLE = [
    { ini: 'R', name: 'Ravi', age: 24, role: 'Field agent', where: 'Guntur West', app: ['phone', 'Field App'], tag: 'Uses it all day',
      quote: 'I walk eight hours in the sun. The app has to work with one thumb and no signal.',
      meta: [['Device', 'Budget Android'], ['Works in', 'Villages, patchy 4G'], ['Language', 'Telugu first'], ['Uses it', 'All day, outdoors']],
      goals: ['Finish 25 good interviews a day', 'Get paid fairly and on time', 'Never lose a saved interview'], pains: ['No signal in many booths', 'Glare on the screen', 'Long forms and small buttons'],
      flow: ['Sign in with a PIN', 'See today’s target', 'Reach the booth', 'Read consent aloud', 'Tap the answers', 'Record open answers', 'Voter votes privately', 'Save now, sync later'], key: [5, 7] },
    { ini: 'L', name: 'Lakshmi', age: 35, role: 'District supervisor', where: 'Guntur', app: ['laptop', 'Command Center'], tag: 'Every day of a round',
      quote: 'I need to know which booth is behind before lunch, not at the end of the week.',
      meta: [['Device', 'Phone and laptop'], ['Works in', 'District office, field'], ['Language', 'Telugu and English'], ['Uses it', 'Every day of a round']],
      goals: ['Hit every quota on time', 'Catch fake interviews early', 'Keep agents motivated'], pains: ['No live view of the field', 'Checking audio by hand', 'Late, messy reports'],
      flow: ['Open the live field map', 'Spot lagging booths', 'Move agents', 'Review flagged interviews', 'Listen to the clip', 'Approve or reject', 'Order a back-check'], key: [3, 5] },
    { ini: 'A', name: 'Arjun', age: 29, role: 'Data analyst', where: 'Head office', app: ['laptop', 'Command Center'], tag: 'Hours a day',
      quote: 'Give me clean, weighted numbers, with the margin on every one.',
      meta: [['Device', 'Laptop, two screens'], ['Works in', 'Office'], ['Language', 'English'], ['Uses it', 'Hours a day']],
      goals: ['Trustworthy weighted results', 'Fast round-on-round compare', 'Reports without copy and paste'], pains: ['Raw spreadsheets', 'Hand-coding open answers', 'No method trail'],
      flow: ['Open Analytics', 'Filter round and region', 'Compare Round 1 and 2', 'Drill into age and gender', 'Check sample and margin', 'Build the report'], key: [2, 4] },
    { ini: 'R', name: 'Mr. Rao', age: 52, role: 'Campaign strategist', short: 'Strategist', where: 'War room', app: ['bars', 'Client Portal'], tag: 'Pays for it', payer: true,
      quote: 'Tell me where we stand, why, and where to act. On one screen.',
      meta: [['Device', 'Phone first'], ['Works in', 'On the move, war room'], ['Language', 'Telugu and English'], ['Uses it', 'A few minutes, often']],
      goals: ['Know where the party stands', 'Understand why', 'Decide where to act'], pains: ['Long PDFs and jargon', 'Numbers without proof', 'Waiting weeks for reports'],
      flow: ['Open the portal', 'Tap a district', 'Read the seat summary', 'Ask why', 'Hear the voters', 'Share the brief'], key: [3] },
    { ini: 'S', name: 'Sameer', age: 31, role: 'Platform admin', where: 'Head office', app: ['laptop', 'Command Center'], tag: 'Before each round',
      quote: 'Setting up a round should take an afternoon, not a week.',
      meta: [['Device', 'Laptop'], ['Works in', 'Office'], ['Language', 'English'], ['Uses it', 'Before and during rounds']],
      goals: ['Launch rounds quickly', 'The right access for each person', 'Stay inside the law'], pains: ['Manual user setup', 'Unclear costs', 'Compliance worries'],
      flow: ['Create the round', 'Build the questionnaire', 'Set quotas and booths', 'Add agents and roles', 'Set election-silence dates', 'Watch costs'], key: [4] },
  ];
  function People() {
    const host = $('#pdPpl');
    if (!host) return;
    const list = $('.pd-ppl-tabs', host), card = $('#pdPplP');
    list.innerHTML = PEOPLE.map((p, i) => `<button type="button" role="tab" id="pdP${i}" aria-controls="pdPplP" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"${p.payer ? ' class="is-payer"' : ''}>`
      + `<span class="pd-av" aria-hidden="true"><span>${p.ini}</span></span><span class="pd-pt"><b>${esc(p.name)}</b><small>${esc(p.short || p.role)}</small></span><span class="pd-tag">${esc(p.tag)}</span></button>`).join('');
    let sel;
    const show = (i) => {
      const p = PEOPLE[i];
      sel(i);
      card.setAttribute('aria-labelledby', `pdP${i}`);
      card.innerHTML = `<div class="pd-pc-top"><div class="pd-pc-id"><span class="pd-av pd-av-lg" aria-hidden="true"><span>${p.ini}</span></span><div><h3>${esc(p.name)}, ${p.age}</h3><p>${esc(p.role)} · ${esc(p.where)}</p></div></div><span class="pd-pc-app">${ic(p.app[0])}${esc(p.app[1])}</span></div>`
        + `<blockquote class="pd-quote"><p>“${esc(p.quote)}”</p></blockquote>`
        + `<dl class="pd-meta">${p.meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`
        + `<div class="pd-gp"><div><h4>What they need</h4><ul class="pd-g">${p.goals.map((g) => `<li>${ic('check')}<span>${esc(g)}</span></li>`).join('')}</ul></div><div><h4>What gets in the way today</h4><ul class="pd-p">${p.pains.map((g) => `<li>${ic('minus')}<span>${esc(g)}</span></li>`).join('')}</ul></div></div>`
        + `<div class="pd-jr"><h4>${esc(p.name)}’s path through the product <span>${p.flow.length} steps · highlighted steps got extra design care</span></h4><ol style="--n:${p.flow.length}">${p.flow.map((s, k) => `<li${p.key.includes(k) ? ' class="key"' : ''}><i>${k + 1}</i><span>${esc(s)}</span></li>`).join('')}</ol></div>`;
      swap(card);
    };
    sel = tabs(list, show);
    show(0);
  }

  /* ================================================================ product map */
  const MAP = [
    ['phone', 'Field App', 'Android, works offline', [['Sign in with PIN'], ['Today', ['Target', 'Booths', 'Sync status']], ['Interview', ['Consent', 'Questions', 'Voice recorder', 'Secret ballot']], ['Sync queue'], ['My earnings'], ['Help and training']]],
    ['laptop', 'Command Center', 'Web, for admins and supervisors', [['Overview'], ['Surveys', ['Builder', 'Question bank', 'Quotas and booths']], ['Field Ops', ['Live map', 'Agents', 'Pay']], ['Quality', ['Flags', 'Audio review', 'Back-checks']], ['Analytics'], ['AI Analyst'], ['Reports'], ['Admin', ['Users and roles', 'Election silence', 'Audit log', 'Costs']]]],
    ['bars', 'Client Portal', 'Web and phone, for strategists', [['Today'], ['Map explorer', ['District pages', 'Seat pages']], ['AI Analyst'], ['Voices'], ['Reports'], ['Alerts']]],
  ];
  function ProductMap() {
    const el = $('#pdMap');
    if (!el) return;
    el.innerHTML = MAP.map(([i, name, sub, items], k) => {
      const n = items.reduce((a, [, kids]) => a + 1 + (kids ? kids.length : 0), 0);
      return `<article class="pd-mc rv" style="--d:${k * 80}ms"><header><span class="pd-mi">${ic(i)}</span><div><h3>${name}</h3><p>${sub}</p></div><b class="pd-mn">${n}<small>screens</small></b></header>`
        + `<ul>${items.map(([t, kids]) => `<li><b>${esc(t)}</b>${kids ? `<span>${kids.map((x) => `<i>${esc(x)}</i>`).join('')}</span>` : ''}</li>`).join('')}</ul></article>`;
    }).join('');
  }

  function init() {
    [Loop, Apps, People, ProductMap].forEach((f) => { try { f(); } catch (e) { console.error('[product]', f.name, e); } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
