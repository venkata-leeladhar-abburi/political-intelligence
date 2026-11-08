/* Political Intelligence Platform · Command Center shell
   Sidebar, top bar, router, roles (Admin, Command Center, Field Surveyor), theme, global search
   and the Overview page. Other pages register on window.V from ops.js, insight.js and fieldapp.js. */
(function () {
  'use strict';
  const PI = window.PI, M = window.M, U = window.U;
  const { $, $$, ic, esc, IN, p0, f1 } = U;
  const V = (window.V = window.V || {});

  const NAV = [
    ['Operate', [['overview', 'Overview', 'home'], ['surveys', 'Surveys', 'clip'], ['field', 'Field force', 'route'], ['verify', 'Verification', 'shield']]],
    ['Understand', [['analytics', 'Analytics', 'bars'], ['map', 'Map explorer', 'map'], ['ai', 'AI analyst', 'spark'], ['notes', 'Round notes', 'note']]],
    ['Deliver', [['reports', 'Reports', 'download']]],
    ['Admin', [['users', 'Users and roles', 'users'], ['settings', 'Settings and audit', 'sliders']]],
    ['Field', [['fieldapp', 'Field App', 'phone']]],
  ];
  const TITLE = Object.fromEntries(NAV.flatMap(([, it]) => it.map(([k, l]) => [k, l])));
  /* pages that take the viewport: the head stays put and the work area scrolls inside it */
  const TALL = new Set(['map', 'analytics', 'verify']);
  const ME = { admin: ['Arjun Rao', 'Admin'], command: ['Prakash Reddy', 'Supervisor · Guntur'], field: ['Ravi K.', 'Field Surveyor · FA-2400'] };

  const S = (window.APP = {
    role: (() => { try { return new URLSearchParams(location.search).get('role') || localStorage.getItem('pi-role') || 'admin'; } catch (e) { return 'admin'; } })(),
    page: null, focus: null,
    user: () => ME[S.role][0],
    go(page, focus) { if (focus) S.focus = focus; if (location.hash.slice(1) !== page) location.hash = page; else route(); },
  });

  /* ---------------- shell ---------------- */
  const root = $('#app');
  root.innerHTML = `<div class="shell"><aside class="side" id="side" aria-label="Sections"></aside><div class="main"><header class="top">
      <button type="button" class="btn ghost icon menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="side">${ic('menu')}</button>
      <h1 id="pgTitle">Overview</h1><span class="sp"></span>
      <div class="search" role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-owns="gsRes">${ic('search')}<input class="inp" id="gs" type="search" placeholder="Search district, seat, mandal, town" aria-label="Search areas" aria-controls="gsRes" autocomplete="off"><div class="res" id="gsRes" role="listbox" hidden></div></div>
      <label class="sr" for="roundSel">Round</label><select class="sel hide-s" id="roundSel">${M.ROUNDS.map((r) => `<option value="${r.id}"${r.id === M.round ? ' selected' : ''}>${r.name}</option>`).join('')}</select>
      <button type="button" class="btn icon" id="themeBtn" aria-label="Switch to light theme">${ic('sun')}</button>
      <label class="sr" for="roleSel">View as</label><select class="sel" id="roleSel" title="View the product as this role">${['admin', 'command', 'field'].map((r) => `<option value="${r}"${r === S.role ? ' selected' : ''}>${M.ROLES[r].name}</option>`).join('')}</select>
    </header><main class="page" id="page" tabindex="-1"></main></div></div>`;
  const side = $('#side'), page = $('#page');

  function drawSide() {
    const q = M.queue.filter((x) => x.status === 'review').length;
    const counts = { verify: q, field: M.agents.filter((a) => ['fence', 'mock', 'offline'].includes(a.status)).length };
    side.innerHTML = `<a class="brand" href="index.html" aria-label="Political Intelligence Platform home"><svg aria-hidden="true"><use href="#logo"/></svg><span><b>Political Intelligence</b><small>${S.role === 'field' ? 'Field App' : 'Command Center'}</small></span></a>
      ${NAV.map(([g, items]) => {
        const vis = items.filter(([k]) => S.role === 'field' ? M.roleCan('field', k) : k !== 'fieldapp' || true);
        if (!vis.length) return '';
        return `<div class="nav-g">${g}</div>${vis.map(([k, l, i]) => { const can = M.roleCan(S.role, k); return `<button type="button" class="nav-i${can ? '' : ' locked'}" data-p="${k}"${S.page === k ? ' aria-current="page"' : ''}${can ? '' : ` aria-disabled="true" title="${esc(M.ROLES[S.role].name)} cannot open ${esc(l)}"`}>${ic(i)}<span>${l}</span>${can && counts[k] ? `<span class="ct">${counts[k]}</span>` : ''}</button>`; }).join('')}`;
      }).join('')}
      <div class="side-foot">${S.role === 'field' ? '' : `<div class="silence"><button type="button" class="switch" role="switch" id="silSw" aria-checked="${M.silence ? 'true' : 'false'}" aria-label="Election silence"></button><div><b>Election silence</b><span>${M.silence ? 'On: results hidden from clients' : 'Off: clients see results'}</span></div></div>`}
        <div class="who" style="padding:6px 8px"><span class="av warm">${U.initials(ME[S.role][0])}</span><span style="min-width:0"><b style="display:block;font-size:14px">${esc(ME[S.role][0])}</b><small class="muted">${esc(ME[S.role][1])}</small></span></div>
        <a class="btn ghost sm" href="portal.html">${ic('crown')}Open Client Portal</a></div>`;
    $$('.nav-i', side).forEach((b) => b.addEventListener('click', () => {
      if (b.classList.contains('locked')) { U.toast(`${M.ROLES[S.role].name} has no access to ${TITLE[b.dataset.p]}. An admin can change this in Users and roles.`); return; }
      closeMenu(); S.go(b.dataset.p);
    }));
    const sw = $('#silSw', side);
    if (sw) sw.addEventListener('click', () => {
      if (S.role !== 'admin') { U.toast('Only an Admin can switch election silence.'); return; }
      M.silence = !M.silence; drawSide(); U.toast(M.silence ? 'Election silence on. Client Portal results are hidden; field work continues.' : 'Election silence off. Clients can see results again.');
    });
  }

  /* menu on phones */
  const menuBtn = $('#menuBtn'); let scrim;
  function closeMenu() { side.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); if (scrim) { scrim.remove(); scrim = null; } }
  menuBtn.addEventListener('click', () => {
    if (side.classList.contains('open')) { closeMenu(); return; }
    side.classList.add('open'); menuBtn.setAttribute('aria-expanded', 'true');
    scrim = document.createElement('div'); scrim.className = 'scrim'; scrim.addEventListener('click', closeMenu); document.body.appendChild(scrim);
    const f = $('.nav-i', side); if (f) f.focus();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && side.classList.contains('open')) { closeMenu(); menuBtn.focus(); } });

  /* theme */
  const themeBtn = $('#themeBtn');
  const syncTheme = () => { const t = document.documentElement.dataset.theme; themeBtn.innerHTML = ic(t === 'dark' ? 'sun' : 'moon'); themeBtn.setAttribute('aria-label', `Switch to ${t === 'dark' ? 'light' : 'dark'} theme`); };
  themeBtn.addEventListener('click', () => { U.theme.set(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); syncTheme(); });
  syncTheme();
  document.addEventListener('themechange', () => { if (S.page && !['map', 'overview'].includes(S.page)) route(); });

  /* round */
  $('#roundSel').addEventListener('change', (e) => { M.round = +e.target.value; route(); U.toast(`Showing ${M.ROUNDS[M.round].name}${M.round === 3 ? ': provisional, 41% of interviews in' : ''}.`); });

  /* role */
  $('#roleSel').addEventListener('change', (e) => {
    S.role = e.target.value; try { localStorage.setItem('pi-role', S.role); } catch (er) { /* ignore */ }
    const home = M.ROLES[S.role].home;
    U.toast(`Now viewing as ${M.ROLES[S.role].name}. ${M.ROLES[S.role].who}.`);
    if (!M.roleCan(S.role, S.page)) S.go(home); else { drawSide(); route(); }
  });

  /* global search */
  const gs = $('#gs'), res = $('#gsRes'); let hits = [], hi = -1;
  const showRes = () => {
    hits = M.search(gs.value); hi = -1;
    res.hidden = !hits.length; gs.parentElement.setAttribute('aria-expanded', String(!!hits.length));
    res.innerHTML = hits.map((h, i) => `<button type="button" role="option" id="gs${i}" data-i="${i}" aria-selected="false"><b>${esc(M.name(h))}</b><small>${esc(h.sub)}</small></button>`).join('');
  };
  const pick = (h) => { gs.value = ''; res.hidden = true; if (S.role === 'field') return; S.go('map', h); };
  gs.addEventListener('input', showRes);
  gs.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); hi = (hi + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length; $$('button', res).forEach((b, i) => b.setAttribute('aria-selected', String(i === hi))); gs.setAttribute('aria-activedescendant', 'gs' + hi); }
    if (e.key === 'Enter' && hits.length) { e.preventDefault(); pick(hits[Math.max(0, hi)]); }
    if (e.key === 'Escape') { res.hidden = true; }
  });
  res.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) pick(hits[+b.dataset.i]); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.search')) res.hidden = true; });

  /* ---------------- router ---------------- */
  function route() {
    let p = location.hash.slice(1) || M.ROLES[S.role].home;
    if (!V[p]) p = M.ROLES[S.role].home;
    if (!M.roleCan(S.role, p)) { p = M.ROLES[S.role].home; history.replaceState(null, '', '#' + p); }
    S.page = p;
    $('#pgTitle').textContent = TITLE[p] || '';
    document.title = `${TITLE[p]} · Command Center · Political Intelligence Platform`;
    drawSide();
    page.dataset.page = p;
    page.classList.toggle('tall', TALL.has(p));
    page.innerHTML = '';
    try { V[p](page); } catch (err) { console.error(err); page.innerHTML = `<div class="card">This page could not load. ${esc(err.message)}</div>`; }
    S.focus = null;
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  /* ---------------- shared page bits ---------------- */
  V.head = (title, sub, acts = '') => `<div class="page-h"><div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div>${acts ? `<div class="acts">${acts}</div>` : ''}</div>`;
  V.kpi = (k, i, b, d, cls = '') => `<div class="kpi ${cls}"><span class="k">${ic(i)}${k}</span><b>${b}</b>${d ? `<span class="d">${d}</span>` : ''}</div>`;
  V.roundTag = () => `<span class="badge ${M.ROUNDS[M.round].state === 'live' ? 'accent live' : ''}">${esc(M.ROUNDS[M.round].name)} · ${esc(M.ROUNDS[M.round].dates)}</span>`;

  /* ---------------- overview ---------------- */
  V.overview = function (el) {
    const st = { kind: 'state', id: 0 }, v = M.vals(st), p = M.round ? M.vals(st, M.round - 1) : null, live = M.ROUNDS[3];
    const F = M.FIELD, rev = M.queue.filter((x) => x.status === 'review').length;
    const alerts = [
      ['alert', 'bad', 'Mock-GPS app on FA-2526', 'Gopi M. · Mangalagiri · 3 interviews held back', 'verify'],
      ['pin', 'bad', 'Outside the booth fence', 'Swathi N. · Mangalagiri · 610 m from Booth 141', 'field'],
      ['trend', 'warm', 'Party A down 2.8 pts in Tenali', 'Round 3 so far vs Round 2 · women 26–40 moved most', 'map'],
      ['chat', 'ai', `${rev} answers need a tone check`, 'Possible sarcasm the AI was not sure about', 'verify'],
      ['wifioff', 'warm', 'Suresh M. offline for 47 min', '6 interviews saved on the phone, will sync', 'field'],
    ];
    el.innerHTML = `${V.head(`Good morning, ${esc(S.user().split(' ')[0])}`, `Round 3 is in the field: ${Math.round(live.done * 100)}% of 2,10,000 interviews collected. Results below are ${esc(M.ROUNDS[M.round].name)}.`, `${V.roundTag()}<button type="button" class="btn" data-go="reports">${ic('download')}Reports</button>${M.roleCan(S.role, 'surveys') === 2 ? `<button type="button" class="btn primary" data-r="new">${ic('plus')}New survey</button>` : ''}`)}
      <div class="kpis">
        ${V.kpi('Round 3 collected', 'users', IN(86310), `<em class="up">${IN(F.todayDone)}</em> today of ${IN(F.todayTarget)}`, 'hero')}
        ${V.kpi('Agents online', 'route', `${IN(F.online)} <small class="muted" style="font-size:15px">/ ${IN(F.agents)}</small>`, `${F.agents - F.online} offline or off duty`)}
        ${V.kpi('Verified', 'shield', f1(v.verified) + '%', `${rev} waiting for review`)}
        ${V.kpi('Party A (ruling)', 'flag', p0(v.A), p ? U.dl(v.A - p.A) + ' since ' + M.ROUNDS[M.round - 1].short : '')}
        ${V.kpi('Party B (opposition)', 'flag', p0(v.B), p ? U.dl(v.B - p.B) + ' since ' + M.ROUNDS[M.round - 1].short : '')}
        ${V.kpi('Govt approval', 'gauge', p0(v.gov), p ? U.dl(v.gov - p.gov) : '')}
      </div>
      <div class="grid g-73">
        <div class="card map-card" id="ovMap"></div>
        <div class="grid" style="align-content:start">
          <div class="card lead"><div class="card-h"><div><h3>Needs attention</h3><p>Sorted by what costs data first</p></div></div><div class="list">${alerts.map(([i, c, t, s, go]) => `<button type="button" class="li" data-go="${go}" style="border-left:0;border-right:0;border-bottom:0;background:none;text-align:left;width:100%;cursor:pointer"><span class="ico ${c}">${ic(i)}</span><span class="t"><b>${esc(t)}</b><small>${esc(s)}</small></span>${ic('chevr')}</button>`).join('')}</div></div>
          <div class="card"><div class="card-h"><div><h3>Seat picture</h3><p>${esc(M.ROUNDS[M.round].name)} · ${v.seats['Toss-up']} toss-ups</p></div></div>${M.verdict(st, v)}</div>
        </div>
      </div>
      <div class="grid g3">
        <div class="card"><div class="card-h"><div><h3>Round 3 progress by district</h3><p>Interviews against target</p></div><button type="button" class="btn sm" data-go="surveys">All surveys</button></div>${U.bars(PI.DISTS.map((d) => { const x = M.vals({ kind: 'district', id: d.id }, 3); return { l: d.name, v: Math.min(100, (x.iv / x.target) * 100) * 1.2, vt: p0(Math.min(100, (x.iv / x.target) * 100 * 1.2)), tip: U.tipRows(d.name, [['Interviews', IN(x.iv)], ['Target', IN(x.target)]]) }; }).sort((a, b) => b.v - a.v).slice(0, 9), { max: 100, grad: true })}</div>
        <div class="card"><div class="card-h"><div><h3>Live from the field</h3><p>Verified interviews as they sync</p></div><span class="badge accent live">Live</span></div><div class="list" id="ovFeed"></div></div>
        <div class="card"><div class="card-h"><div><h3>Ruling vs opposition</h3><p>Statewide, ${esc(M.ROUNDS[M.round].short)}</p></div><button type="button" class="btn sm" data-go="analytics">Analytics</button></div>${M.h2h([['Vote share', v.A, v.B], ['Leader rating', v.cm, v.opp], ['Women', M.cuts(st).gender[0][1], M.cuts(st).gender[0][2]], ['Youth 18–25', M.cuts(st).age[0][1], M.cuts(st).age[0][2]]])}<div style="margin-top:14px">${M.meter('Anti-incumbency index', Math.round(v.anti) + ' / 100', 100, 'Share of voters who want a change, adjusted for MLA ratings')}</div></div>
      </div>`;
    const panelHost = document.createElement('div');
    const map = M.MapX($('#ovMap', el), { uid: 'ov', level: 'district', metric: 'lead', onFocus: (en) => { S.focus = en; } });
    $('#ovMap', el).insertAdjacentHTML('beforeend', `<div class="acts"><button type="button" class="btn sm" data-r="openmap">${ic('map')}Open this area in Map explorer</button></div>`);
    $('[data-r="openmap"]', el).addEventListener('click', () => S.go('map', map.get()));
    void panelHost;
    const feed = () => { $('#ovFeed', el).innerHTML = M.feed(5).map((f) => `<div class="li"><span class="ico ${f.ok ? 'warm' : 'bad'}">${ic(f.ok ? 'checkc' : 'alert')}</span><span class="t"><b>${esc(f.a.name)} · Booth ${f.ag.booth}</b><small>${esc(f.ag.name)} · ${f.ok ? 'verified' : 'held for review'} · ${f.ago}</small></span><span class="badge">${esc(f.s.issue)}</span></div>`).join(''); };
    feed(); const t = setInterval(() => { if (!document.body.contains(el) || S.page !== 'overview') { clearInterval(t); return; } feed(); }, 20000);
    wireGo(el);
    const nb = $('[data-r="new"]', el); if (nb) nb.addEventListener('click', () => V.newSurvey());
  };
  function wireGo(el) { $$('[data-go]', el).forEach((b) => b.addEventListener('click', () => S.go(b.dataset.go))); }
  V.wireGo = wireGo;

  /* boot once every page module has registered */
  document.addEventListener('DOMContentLoaded', () => { if (!location.hash) history.replaceState(null, '', '#' + M.ROLES[S.role].home); route(); });
})();
