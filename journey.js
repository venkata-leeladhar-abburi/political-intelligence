/* Political Intelligence Platform · the interview journey and the three role apps
   One set of high-fidelity screens serves both sections: the Field App for agents (light,
   readable in sun, Android), the Command Center for admins, supervisors and analysts, and
   the Client Portal for strategists (dark). Every scene is drawn at a fixed design size
   and scaled as one picture. Wide screens get a pinned GSAP story scrubbed by scroll;
   phones and reduced motion get the same scenes stacked and still. */
(function () {
  'use strict';
  const P = window.PI, AP = window.AP;
  const { $, $$, IN, pc, sgn, ic, esc, reduced, PARTY, ACS, DISTS, byN, STATE, moeTxt, seatClass, ramp, SENT_STOPS, rng, f1 } = P;
  const gsap = window.gsap, ST = window.ScrollTrigger, CE = window.CustomEase;
  const GW = byN.get(94);
  const QUOTE = AP.quotes[GW.q];
  const W = 760, H = 600;

  /* ---------------- small parts ---------------- */
  const wave = (n, seed, cls = '') => {
    const r = rng(seed); let s = '';
    for (let i = 0; i < n; i++) s += `<i style="height:${Math.round(22 + Math.abs(Math.sin(i * 0.55 + seed)) * 58 + r() * 20)}%;animation-delay:${-(i * 0.08).toFixed(2)}s"></i>`;
    return `<span class="wv${cls ? ' ' + cls : ''}">${s}</span>`;
  };
  const tick = '<svg class="tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 12.5l3.8 3.8L17.5 8.8" pathLength="1"/></svg>';
  const sbar = (signal, net) => `<div class="sb"><b>9:41</b><span>${net ? `<em>${net}</em>` : ''}<i class="sig">${[1, 2, 3, 4].map((k) => `<u${k <= signal ? ' class="on"' : ''}></u>`).join('')}</i><i class="bat"><u></u></i></span></div>`;
  const phone = (screen, opt = {}) => `<div class="dv dv-phone${opt.dark ? ' dk' : ' droid'}${opt.cls ? ' ' + opt.cls : ''}"${opt.style ? ` style="${opt.style}"` : ''}><span class="dv-k k1"></span><span class="dv-k k2"></span><span class="dv-k k3"></span><div class="dv-scr">${screen}<span class="dv-isl"></span><span class="dv-glare"></span></div></div>`;
  const win = (url, body, opt = {}) => `<div class="dv dv-win${opt.cls ? ' ' + opt.cls : ''}"${opt.style ? ` style="${opt.style}"` : ''}><div class="dv-bar"><i></i><i></i><i></i><span>${ic('lock')}${url}</span></div><div class="dv-body">${body}</div></div>`;
  const tabbar = (on, items) => `<nav class="ap-tabs">${items.map(([i, l], k) => `<span${k === on ? ' class="on"' : ''}>${ic(i)}<em>${l}</em></span>`).join('')}</nav>`;
  const ring = (v, size, w, c) => `<svg class="rg" viewBox="0 0 ${size} ${size}" style="width:${size}px;height:${size}px"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - w}" class="rg-t" stroke-width="${w}"/><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - w}" class="rg-v" stroke-width="${w}" pathLength="100" stroke="${c}" style="stroke-dasharray:${v} 100"/></svg>`;
  const donut3 = (a, size) => {
    const r = size / 2 - 7; let o = 0;
    const arc = (v, c) => { const s = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${c}" stroke-width="9" pathLength="100" stroke-dasharray="${Math.max(v - 1.5, 0)} ${100 - Math.max(v - 1.5, 0)}" stroke-dashoffset="${-o}"/>`; o += v; return s; };
    return `<svg class="d3" viewBox="0 0 ${size} ${size}" style="width:${size}px;height:${size}px">${arc(a.pos, '#fe881b')}${arc(a.neu, '#a997ce')}${arc(a.neg, '#b997ff')}</svg>`;
  };
  const UC = '#a997ce';
  const pcol = (k) => (k === 'U' ? UC : PARTY[k].c);

  /* the state map, defined once and reused by every map in the scenes */
  function sprite() {
    if (document.getElementById('jmSprite')) return;
    const d = document.createElement('div');
    d.innerHTML = `<svg id="jmSprite" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
      <g id="jmAcs">${ACS.map((a) => `<path d="${a.d}"/>`).join('')}</g>
      <g id="jmSent">${ACS.map((a) => `<path d="${a.d}" fill="${ramp(SENT_STOPS, (a.pos - 40) / 26)}"/>`).join('')}</g>
      <linearGradient id="jmLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b997ff" stop-opacity=".1"/><stop offset=".5" stop-color="#ca45ff"/><stop offset="1" stop-color="#fe881b" stop-opacity=".9"/></linearGradient>
    </defs></svg>`;
    document.body.prepend(d.firstElementChild);
  }
  const DSET = new Set(DISTS[14].acs);
  const GBOX = (() => {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    ACS.forEach((a) => { if (!DSET.has(a.n)) return; x0 = Math.min(x0, a.bb[0]); y0 = Math.min(y0, a.bb[1]); x1 = Math.max(x1, a.bb[2]); y1 = Math.max(y1, a.bb[3]); });
    const w = x1 - x0, h = y1 - y0, p = Math.max(w, h) * 0.14;
    return [x0 - p, y0 - p, w + 2 * p, h + 2 * p].map((v) => v.toFixed(1)).join(' ');
  })();

  /* ---------------- Field App · agent · light, Android ---------------- */
  const F = {
    today: () => `<div class="ap lt">${sbar(2, '')}
      <div class="ap-top"><div><small><span class="te" lang="te">నమస్కారం</span> · Monday, Round 2</small><b>Ravi Kumar</b></div><span class="ap-av">RK</span></div>
      <div class="ap-body">
        <div class="td-hero">${ring(72, 64, 7, '#fff')}<div><small>Today's interviews</small><b>18<span> / 25</span></b><em>7 to go · 6 saved offline</em></div></div>
        <div class="ap-h">Your booths today</div>
        ${[['112', 'Brodipet', '0.4 km', 7, 8], ['118', 'Arundelpet', '1.2 km', 6, 8], ['121', 'Lakshmipuram', '2.1 km', 5, 9]].map(([b, p, d, v, t], i) => `<div class="td-b${i === 0 ? ' now' : ''}"><span class="td-n">${b}</span><div><b>${p}</b><small>${d} · ${v} of ${t} done</small></div><span class="mini"><i style="width:${Math.round((v / t) * 100)}%"></i></span></div>`).join('')}
      </div>
      <div class="ap-cta"><span class="ap-btn">Start interview ${ic('arrow')}</span></div>
      ${tabbar(0, [['home', 'Today'], ['pin', 'Booths'], ['refresh', 'Sync'], ['user', 'Profile']])}
    </div>`,
    record: () => `<div class="ap lt">${sbar(0, 'No service')}
      <div class="ap-top sm"><span class="ap-ic bk">${ic('chev')}</span><div><b>Booth 112</b><small>Brodipet · interview 19</small></div><span class="ap-st off"><i></i>Offline</span></div>
      <div class="rc-prog"><span>Question 7 of 18</span><span class="seg">${Array.from({ length: 18 }, (_, i) => `<i${i < 7 ? ' class="on"' : ''}></i>`).join('')}</span></div>
      <div class="ap-body">
        <div class="rc-q"><p class="te" lang="te">మీ ఊరిలో అతి పెద్ద సమస్య ఏమిటి?</p><span>What is the biggest problem in your village?</span></div>
        <div class="rc-rec"><div class="rc-top"><span class="rc-dot"></span><span>Recording the answer</span><b>0:24</b></div>${wave(30, 3)}<div class="rc-ctl"><span>Pause</span><span class="rc-stop"><i></i></span><span>Redo</span></div></div>
        <div class="rc-ok"><span>${ic('checkc')}Consent recorded</span><span>${ic('pin')}In fence · 18 m</span></div>
      </div>
      <div class="ap-cta"><span class="ap-btn">Next question ${ic('arrow')}</span></div>
    </div>`,
    sync: () => `<div class="ap lt">${sbar(4, '4G')}
      <div class="ap-top"><div><small>Signal is back</small><b>Uploading interviews</b></div><span class="ap-st on"><i></i>Online</span></div>
      <div class="ap-body">
        <div class="sy-card"><div class="sy-top"><b><span class="sy-n">4</span><em> of 6</em></b><span>uploaded</span></div><span class="sy-bar"><i></i></span><small>${ic('lock')}Encrypted until it reaches the server</small></div>
        ${[['112', '6m 12s', 2], ['112', '5m 48s', 2], ['112', '7m 02s', 2], ['118', '6m 30s', 2], ['118', '5m 55s', 1], ['121', '6m 41s', 0]].map(([b, t, s]) => `<div class="sy-row s${s}"><span class="sy-ic">${s === 2 ? ic('check') : s === 1 ? '<i class="spin"></i>' : ic('clock')}</span><div><b>Booth ${b}</b><small>${t} · 3 clips</small></div><em>${s === 2 ? 'Uploaded' : s === 1 ? '68%' : 'Waiting'}</em></div>`).join('')}
      </div>
    </div>`,
    ballot: () => `<div class="ap lt">${sbar(0, 'No service')}
      <div class="bl-head"><span class="bl-lock">${ic('lock')}</span><b>Secret ballot</b><span>Hand the phone to the voter. Their choice stays private.</span></div>
      <div class="ap-body">
        <div class="bl-q"><p class="te" lang="te">ఈరోజు ఎన్నికలు జరిగితే మీ ఓటు ఎవరికి?</p><span>If the election were today, who gets your vote?</span></div>
        ${[['Party A', PARTY.A.c], ['Party B', PARTY.B.c], ['Party C', PARTY.C.c], ['Others', '#83799e'], ['Not decided yet', '#bdbdd3']].map(([n, c], i) => `<div class="bl-opt${i === 1 ? ' sel' : ''}"><i style="background:${c}"></i><b>${n}</b><span class="bl-r"></span></div>`).join('')}
      </div>
      <div class="ap-cta"><span class="ap-btn ink">${ic('lock')} Confirm privately</span></div>
    </div>`,
  };

  /* ---------------- Client Portal · strategist · dark ---------------- */
  const level = STATE.margin < 1;
  const worst = ACS.slice().sort((x, y) => x.d1 - y.d1)[0];
  const spark = (() => {
    const pts = [44, 46, 45, 48, 47, 50, 49, 52, 51, 54.1], w = 220, h = 46;
    const x = (i) => (i / (pts.length - 1)) * w, y = (v) => h - 6 - ((v - 42) / 14) * (h - 12);
    const d = pts.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join('');
    return `<svg class="spk" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><path d="${d}L${w} ${h}L0 ${h}Z" fill="rgba(255,255,255,.16)"/><path d="${d}" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
  })();
  const C = {
    home: () => `<div class="ap dk">${sbar(4, '5G')}
      <div class="ap-top"><div><small>Client Portal · Round 2</small><b>Andhra Pradesh</b></div><span class="ap-av g">MR</span></div>
      <div class="ap-body">
        <div class="po-hero"><small>Positive mood, statewide</small><b>${pc(STATE.pos)}</b><em>${sgn(STATE.d1)} pts since Round 1</em>${spark}</div>
        <div class="ap-card"><div class="ap-ch"><b>Voting intention</b><span class="pill">${level ? 'A and B level' : `${PARTY[STATE.lead].name} leads`}</span></div>
          ${['B', 'A', 'C', 'U'].map((k) => `<div class="vi"><span><i style="background:${pcol(k)}"></i>${PARTY[k].name}</span><b>${f1(STATE[k])}%</b><span class="vb"><u style="width:${(STATE[k] * 2.2).toFixed(1)}%;background:${pcol(k)}"></u></span></div>`).join('')}
        </div>
        <div class="po-alert">${ic('alert')}<div><b>Mood fell ${Math.abs(worst.d1)} pts in ${esc(worst.name)}</b><small>${esc(worst.top)} is the top issue there</small></div><span class="chev">${ic('chev')}</span></div>
      </div>
      ${tabbar(0, [['home', 'Home'], ['map', 'Map'], ['spark', 'Ask'], ['file', 'Reports']])}
    </div>`,
    seat: () => `<div class="ap dk">${sbar(4, '5G')}
      <div class="ap-top sm"><span class="ap-ic bk">${ic('chev')}</span><div><b>${esc(GW.name)}</b><small>Guntur · n = ${IN(GW.iv)}</small></div><span class="pill warm">${seatClass(GW.margin)}</span></div>
      <div class="ap-body">
        <div class="se-top">${donut3(GW, 86)}<div><small>Positive mood</small><b>${pc(GW.pos)}</b><em>${sgn(GW.d1)} pts since Round 1</em></div></div>
        <div class="ap-card"><div class="ap-ch"><b>${PARTY[GW.lead].name} leads by ${GW.margin} pts</b><span class="pill">${moeTxt(GW.iv)}</span></div>
          ${['B', 'A', 'C', 'U'].map((k) => `<div class="vi"><span><i style="background:${pcol(k)}"></i>${PARTY[k].name}</span><b>${pc(GW[k])}</b><span class="vb"><u style="width:${GW[k] * 2}%;background:${pcol(k)}"></u></span></div>`).join('')}
        </div>
        <div class="ap-card"><div class="ap-ch"><b>Top issues</b><span class="pill">Round 2</span></div>
          ${GW.iss.map(([k, v]) => `<div class="vi"><span>${esc(k)}</span><b>${pc(v)}</b><span class="vb"><u style="width:${v * 3}%;background:linear-gradient(90deg,#8130ff,#fe881b)"></u></span></div>`).join('')}
        </div>
        <div class="se-voice"><span class="pl">${ic('play')}</span><div><p>“${esc(QUOTE.en)}”</p><small>${esc(QUOTE.who)} · 0:14</small></div></div>
      </div>
    </div>`,
    ask: () => `<div class="ap dk">${sbar(4, '5G')}
      <div class="ap-top sm"><span class="ap-ic sp">${ic('spark')}</span><div><b>Ask the Data</b><small>English or <span class="te" lang="te">తెలుగు</span></small></div><span class="pill">Round 2</span></div>
      <div class="ap-body ch">
        <div class="ch-q">Why did the mood move in Guntur West?</div>
        <div class="ch-steps"><span>${tick}Read ${IN(GW.iv)} interviews</span><span>${tick}Compared Round 1 and 2</span><span>${tick}Found 12 voter clips</span></div>
        <div class="ch-a"><p>Mood rose <b>${sgn(GW.d1)} pts</b> to <b>${pc(GW.pos)} positive</b>. Jobs is the top issue at ${pc(GW.iss[0][1])}, and MLA satisfaction is ${pc(GW.mla)}.</p><div class="ch-meta"><span>n = ${IN(GW.iv)}</span><span>${moeTxt(GW.iv)}</span><span>vs Round 1</span></div><div class="ch-clip"><span class="pl">${ic('play')}</span>${wave(24, 7)}<time>0:14</time></div></div>
        <div class="ch-sug"><span>Only women voters</span><span>Compare with Guntur East</span></div>
      </div>
      <div class="ch-in"><span>Ask in English or <span class="te" lang="te">తెలుగు</span>…</span><i>${ic('send')}</i></div>
    </div>`,
  };

  /* ---------------- Command Center · admin, supervisor, analyst ---------------- */
  const side = (on) => `<aside class="cc-side"><span class="cc-logo"><svg aria-hidden="true"><use href="#logo"/></svg></span>${['grid', 'clip', 'map', 'users', 'shield', 'spark', 'file', 'sliders'].map((i, k) => `<span${k === on ? ' class="on"' : ''}>${ic(i)}</span>`).join('')}</aside>`;
  const kpi = (i, l, v, d, cls = '') => `<div class="kp"><small>${ic(i)}${l}</small><b class="${cls}">${v}</b><em>${d}</em></div>`;
  const BOOTHS = [[452.6, 374.2], [457.4, 376.6], [453.6, 381.2], [457.9, 381.9]];
  const CMD = {
    plan: () => `<div class="cc">${side(1)}<div class="cc-main">
      <div class="cc-head"><div><small>Surveys · New round</small><b>Round 3 · Andhra Pradesh</b></div><span class="cc-btn">${ic('rocket')}Launch round</span></div>
      <div class="cc-steps"><span class="done">${ic('check')}Seats</span><b></b><span class="done">${ic('check')}Booths</span><b></b><span class="on">Quotas</span><b></b><span>Team</span><b></b><span>Review</span></div>
      <div class="cc-g2">
        <div class="cc-card cc-map"><div class="h">Guntur West<small>4 booths · 100 interviews</small></div><svg class="mm" viewBox="${GBOX}"><use href="#jmAcs" fill="#141417" stroke="#050506" stroke-width=".5"/>${ACS.filter((a) => DSET.has(a.n)).map((a) => `<path d="${a.d}" class="${a.n === 94 ? 'gw' : 'gd'}"/>`).join('')}${BOOTHS.map(([x, y], k) => `<circle class="bt" cx="${x}" cy="${y}" r="1.25" style="--k:${k}"/>`).join('')}</svg><div class="mm-l"><span><i class="l1"></i>Guntur district</span><span><i class="l2"></i>Guntur West</span><span><i class="l3"></i>Booth</span></div></div>
        <div class="cc-card"><div class="h">Quotas per seat<small>matches the voter roll</small></div>
          ${[['Women', 50, '#f79fff'], ['Men', 50, '#b997ff'], ['18–25', 19, '#fe881b'], ['26–40', 37, '#ca45ff'], ['41–60', 31, '#8130ff'], ['60+', 13, '#7f5af0']].map(([l, v, c]) => `<div class="qrow"><span>${l}</span><span class="qbar"><i style="width:${v * 1.6}%;background:${c}"></i></span><b>${v}%</b></div>`).join('')}
          <div class="q-note">${ic('refresh')}Rebalances by itself as interviews arrive</div>
        </div>
      </div>
      <div class="cc-chips"><span><b>175</b><small>seats</small></span><span><b>700</b><small>booths</small></span><span><b>17,500</b><small>interviews a round</small></span><span><b>10</b><small>days in the field</small></span></div>
    </div></div>`,
    overview: () => `<div class="cc">${side(0)}<div class="cc-main">
      <div class="cc-head"><div><small>Overview · Round 2</small><b>Andhra Pradesh</b></div><span class="cc-live"><i></i>Live · updated 2 min ago</span></div>
      <div class="cc-kpis">${kpi('users', 'Interviews', IN(STATE.iv), '+12% vs Round 1', 'cnt')}${kpi('trend', 'Positive mood', pc(STATE.pos), sgn(STATE.d1) + ' pts')}${kpi('map', 'Seats covered', '175 / 175', 'All 28 districts')}${kpi('shield', 'Data quality', '98.4%', '+1.2 pts')}</div>
      <div class="cc-g2 ov">
        <div class="cc-card cc-map"><div class="h">Mood by seat<small>Round 2 · weighted</small></div><svg class="mm" viewBox="0 0 1000 853"><use href="#jmSent" stroke="#050506" stroke-width="1.3"/><path d="${GW.d}" class="gwsel"/><circle class="pulse" cx="${GW.c[0]}" cy="${GW.c[1]}" r="30"/><circle class="pulse p2" cx="${GW.c[0]}" cy="${GW.c[1]}" r="30"/><circle class="gwdot" cx="${GW.c[0]}" cy="${GW.c[1]}" r="11"/></svg><div class="mm-k"><span>Negative</span><i></i><span>Positive</span></div></div>
        <div class="cc-card cc-seat"><div class="h">${esc(GW.name)}<span class="pill warm">${seatClass(GW.margin)}</span></div>
          <div class="cs-top">${donut3(GW, 76)}<div><b>${pc(GW.pos)}</b><small>positive mood · ${sgn(GW.d1)} pts</small></div></div>
          ${['B', 'A', 'C', 'U'].map((k) => `<div class="qrow"><span>${PARTY[k].name}</span><span class="qbar"><i style="width:${GW[k] * 2}%;background:${pcol(k)}"></i></span><b>${pc(GW[k])}</b></div>`).join('')}
          <div class="q-note">${ic('scale')}n = ${IN(GW.iv)} · ${moeTxt(GW.iv)} · top issue Jobs ${pc(GW.iss[0][1])}</div>
        </div>
      </div>
    </div></div>`,
    field: () => {
      const r = rng(31), dots = [];
      ACS.forEach((a, i) => { if (i % 3) return; const s = r(); dots.push(`<circle cx="${(a.c[0] + (r() - 0.5) * 8).toFixed(1)}" cy="${(a.c[1] + (r() - 0.5) * 8).toFixed(1)}" r="10" class="${s < 0.74 ? 'a' : s < 0.88 ? 's' : 'o'}"/>`); });
      return `<div class="cc">${side(2)}<div class="cc-main">
      <div class="cc-head"><div><small>Field operations · Round 2 · Day 4 of 10</small><b>Live field</b></div><span class="cc-live"><i></i>Live</span><span class="cc-btn ghost">${ic('download')}Export day</span></div>
      <div class="cc-kpis">${kpi('users', 'Agents active', '132 / 140', '94% in the field')}${kpi('clip', 'Interviews today', '3,284', '+8% vs average')}${kpi('shield', 'Passed checks', '96%', '4% sent for review')}${kpi('clock', 'Average length', '6m 05s', 'target 5–9 min')}</div>
      <div class="cc-g3">
        <div class="cc-card cc-map"><div class="h">Agents on the map<small>each dot is an agent</small></div><svg class="mm" viewBox="0 0 1000 853"><use href="#jmAcs" fill="#2b2148" stroke="#060607" stroke-width="1.4"/><g class="ag">${dots.join('')}</g></svg><div class="mm-l"><span><i class="la"></i>Active</span><span><i class="ls"></i>Syncing</span><span><i class="lo"></i>Offline, saved</span></div></div>
        <div class="cc-card"><div class="h">Agents<small>Guntur district</small></div>
          ${[['RK', 'Ravi K.', 'Booth 112 · Brodipet', 18, 'a', 'Active'], ['LP', 'Lakshmi P.', 'Booth 87 · Arundelpet', 22, 's', 'Syncing 3'], ['SM', 'Suresh M.', 'Booth 64 · Nallapadu', 14, 'o', '6 saved offline'], ['AN', 'Anitha N.', 'Booth 121 · Lakshmipuram', 20, 'a', 'Active'], ['VR', 'Venkat R.', 'Booth 140 · Pattabhipuram', 11, 'w', 'Behind target']].map(([av, n, b, v, s, l]) => `<div class="ag-row"><span class="av">${av}</span><div><b>${n}</b><small>${b}</small></div><span class="ag-p"><i style="width:${v * 4}%"></i></span><em class="st-${s}">${l}</em></div>`).join('')}
        </div>
        <div class="cc-card"><div class="h">Quality queue<small>3 to review</small></div>
          ${[['#A-1131', 'Outside the booth fence', '212 m away', 'bad'], ['#A-1127', 'Same voice as #A-0998', '0.93 match', 'bad'], ['#A-1119', 'Shorter than 3 minutes', '2m 41s', 'warn']].map(([id, t, v, s]) => `<div class="qc-row ${s}"><div><b>${id} · ${t}</b><small>${v}</small></div><span class="qc-a"><span>${ic('play')}</span><span class="no">${ic('x')}</span><span class="yes">${ic('check')}</span></span></div>`).join('')}
          <div class="q-note">${ic('refresh')}Back-checks booked for 2% of interviews</div>
        </div>
      </div>
    </div></div>`;
    },
  };

  /* ---------------- the eight steps ---------------- */
  const co = (x, y, cls, icon, b, s) => `<div class="co e ${cls}" style="left:${x}px;top:${y}px"><span class="ci">${ic(icon)}</span><div><b>${b}</b><small>${s}</small></div></div>`;
  const lines = (paths) => `<svg class="sc-lines" viewBox="0 0 ${W} ${H}" aria-hidden="true">${paths.map(([d, x, y]) => `<path class="ld" d="${d}" pathLength="1"/><circle class="ldot" cx="${x}" cy="${y}" r="3.2"/>`).join('')}</svg>`;
  const glow = (x, y, c) => `<span class="sc-glow" style="left:${x - 300}px;top:${y - 300}px;--g:${c}"></span>`;
  const TE = 'రోడ్లు అసలు బాలేవు, మా ఊర్లో పిల్లలకి ఉద్యోగాలు లేవు. పెన్షన్ మాత్రం టైమ్‌కి వస్తుంది.';
  const PHONE_AT = 'left:246px;top:24px';

  const STEPS = [
    { k: 'Plan', acc: '129 48 255', who: ['crown', 'Admin · Command Center'], h: 'Plan the round', p: 'Pick seats, booths and quotas. The sample mirrors each seat by age, gender and area, so results stand up in public.', facts: ['175 seats', '700 booths', '17,500 interviews a round'],
      scene: () => `${glow(380, 300, 'rgba(129,48,255,.34)')}${win('command.center / rounds / new', CMD.plan(), { style: 'left:0;top:34px;width:760px;height:500px' })}${co(476, 506, 'pu', 'target', 'Quotas set for every seat', 'Age, gender and area')}` },
    { k: 'Collect', acc: '172 36 255', focus: [216, 328], who: ['phone', 'Field agent · Field App'], h: 'Collect, even offline', p: 'Ravi reaches Booth 112 in Guntur West. Consent first, then tapped answers and three short voice recordings, with or without signal.', facts: ['Booth 112', '6 min 12 s', '3 voice clips', 'No signal'],
      scene: () => `${glow(380, 300, 'rgba(172,36,255,.36)')}${lines([['M514 136 C 540 136, 540 112, 562 112', 514, 136], ['M514 300 C 540 300, 548 282, 574 282', 514, 300], ['M246 238 C 222 238, 214 222, 196 222', 246, 238], ['M246 420 C 222 420, 216 444, 200 444', 246, 420]])}${phone(F.record(), { cls: 'keep', style: PHONE_AT })}${co(560, 88, 'warn', 'wifioff', 'No signal', 'Saved on the phone')}${co(572, 258, 'ok', 'pin', 'Inside the booth fence', '18 m from Booth 112')}${co(4, 198, 'ok', 'checkc', 'Consent recorded', '0:21, read in Telugu')}${co(18, 420, 'pu', 'mic', '3 voice clips', 'Only open answers')}` },
    { k: 'Sync', acc: '59 104 255', focus: [216, 328], who: ['cloud', 'Automatic · Sync'], h: 'Sync when signal returns', p: 'Interviews wait encrypted on the phone and upload by themselves when the network is back. Nothing is lost.', facts: ['6 queued', 'Encrypted', 'Retries on its own'],
      scene: () => `${glow(420, 300, 'rgba(27,77,254,.34)')}<svg class="sc-lines sy-path" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path class="ld" d="M514 262 C 560 262, 572 300, 610 300" pathLength="1"/></svg><span class="pk" style="--d:0s"></span><span class="pk" style="--d:-.6s"></span><span class="pk" style="--d:-1.2s"></span>${phone(F.sync(), { cls: 'keep', style: PHONE_AT })}<div class="sv e"><span class="sv-o">${ic('cloud')}</span><b>India-region servers</b><small>Encrypted in transit</small></div>${co(10, 150, 'pu', 'layers', '6 interviews', 'Waited safely offline')}${co(20, 410, 'ok', 'refresh', 'Retries by itself', 'If the signal drops again')}` },
    { k: 'Verify', acc: '61 220 151', who: ['shield', 'Automatic · Fraud Shield'], h: 'Check that it is real', p: 'Before it counts, every interview is checked: inside the booth fence, long enough, no fake GPS, and a voice not heard in any other interview.', facts: ['Booth fence', 'Length', 'Mock GPS', 'Unique voice'],
      scene: () => `${glow(230, 300, 'rgba(61,220,151,.20)')}<div class="rd e"><span class="rd-r r1"></span><span class="rd-r r2"></span><span class="rd-r r3"></span><span class="rd-sw"></span><span class="rd-f"></span><span class="rd-hub">${ic('building')}</span><span class="rd-pt in" style="left:57%;top:41%"></span><span class="rd-lb in" style="left:61%;top:33%">Interview · 18 m</span><span class="rd-pt out" style="left:88%;top:16%"></span><span class="rd-lb out" style="left:62%;top:6%">Other attempt · 212 m</span><span class="rd-cap">Booth 112 fence · 150 m</span></div>
        <div class="vc e"><div class="vc-h"><span>Interview #A-1124</span><span class="vc-pass">${ic('checkc')}Passed</span></div>
          ${[['pin', 'Inside booth fence', '18 m'], ['clock', 'Long enough', '6:12'], ['shield', 'No fake GPS app', 'Clean'], ['finger', 'Voice not heard before', 'Unique'], ['refresh', 'Random back-check', 'Not picked']].map(([i, l, v]) => `<div class="vc-row">${ic(i)}<span>${l}</span><b>${v}</b>${tick}</div>`).join('')}
          <div class="vc-f">Counted in the results</div></div>` },
    { k: 'Transcribe', acc: '202 69 255', who: ['ear', 'Automatic · Speech engine'], h: 'Hear the Telugu', p: 'Our speech engine writes each clip down word for word, in Telugu, in about five seconds a minute.', facts: ['Word for word', '≈5 s a minute', '≈₹0.04 a minute'],
      scene: () => `${glow(380, 300, 'rgba(202,69,255,.30)')}<div class="tx e"><div class="tx-h"><span class="tx-ic">${ic('ear')}</span><b>Clip 2 of 3 · 0:18</b><span class="pill">Telugu → text</span><span class="tx-live"><i></i>Transcribing</span></div>
        <div class="tx-w">${wave(64, 21, 'base')}${wave(64, 21, 'lit')}<span class="tx-head"></span></div>
        <p class="tx-te te" lang="te">${TE.split(' ').map((w) => `<span class="w">${w}</span>`).join(' ')}</p>
        <p class="tx-en">“Roads are terrible, no jobs for youngsters. Pension does come on time.”</p>
        <div class="tx-s"><span>${ic('clock')}Processed in <b>1.6 s</b></span><span>${ic('coins')}<b>≈₹0.04</b> a minute</span><span>${ic('checkc')}Confidence <b>0.94</b></span></div></div>` },
    { k: 'Analyse', acc: '254 136 27', who: ['brain', 'Automatic · AI analysis'], h: 'Understand every issue', p: 'The same pass scores each issue and leader, tags the emotion and keeps the strongest quote. Unsure results go to a person.', facts: ['3 issues found', 'Confidence 0.88', 'No review needed'],
      scene: () => `${glow(400, 300, 'rgba(254,136,27,.22)')}<div class="an-q e"><small>What the voter said</small><p><span class="hl n">Roads are terrible</span>, <span class="hl n">no jobs for youngsters</span>. <span class="hl p">Pension does come on time</span>.</p><p class="an-te te" lang="te">${TE}</p><div class="an-who">${ic('user')}Man, 34 · Booth 112 · Clip 2 of 3</div></div>
        <div class="an-r e"><div class="an-h"><b>Issues found</b><span class="pill">3</span></div>
          ${[['road', 'Roads', 'Negative', 'n', 0.86], ['brief', 'Jobs', 'Negative', 'n', 0.79], ['coins', 'Pension', 'Positive', 'p', 0.71]].map(([i, l, s, c, v]) => `<div class="an-i ${c}"><i>${ic(i)}</i><b>${l}</b><em>${s}</em><span class="an-m"><u style="width:${v * 100}%"></u></span></div>`).join('')}
          <div class="an-e"><span>Anger</span><span>Disappointment</span><span>Leader: MLA, negative</span></div>
          <div class="an-c">${ring(88, 52, 5, 'url(#gBrand)')}<div><b>Confidence 0.88</b><small>No review needed · goes to the dashboard</small></div></div></div>` },
    { k: 'Map', acc: '43 167 255', who: ['bars', 'Analyst · Command Center'], h: 'See it on the map', p: "Within the hour Guntur West updates: mood, intention and issues, weighted to the seat's real population.", facts: ['Guntur West', 'n = ' + IN(GW.iv), moeTxt(GW.iv)],
      scene: () => `${glow(380, 300, 'rgba(43,167,255,.26)')}${win('command.center / overview', CMD.overview(), { style: 'left:10px;top:46px;width:740px;height:496px' })}` },
    { k: 'Ask', acc: '185 151 255', focus: [362, 328], who: ['spark', 'Strategist · Client Portal'], h: 'Ask why', p: 'A strategist asks why the mood moved. The answer comes with numbers, a margin and the voices behind it.', facts: ['Answer in seconds', '12 voter clips', 'English or Telugu'],
      scene: () => `${glow(470, 300, 'rgba(172,36,255,.34)')}${phone(C.ask(), { dark: true, style: 'left:392px;top:24px' })}<div class="ev e"><div class="ev-h">${ic('play')}<b>Evidence</b><span class="pill">12 clips</span></div><p>“${esc(QUOTE.en)}”</p><p class="te" lang="te">${esc(QUOTE.te)}</p><div class="ev-p"><span class="pl">${ic('play')}</span>${wave(30, 11)}<time>0:14</time></div><small>${esc(QUOTE.who)} · Guntur West · anonymised</small></div>${co(78, 448, 'pu', 'scale', 'n = ' + IN(GW.iv) + ' · ' + moeTxt(GW.iv), 'Every answer shows its margin')}` },
  ];

  const n2 = (i) => String(i + 1).padStart(2, '0');
  /* One step's words. The accent travels with the step, so the chip, the facts and the
     ghost numeral behind the heading all pick up the same colour as the scene's light. */
  const text = (s, i) => `<div class="jr-t" style="--acc-rgb:${s.acc}">
      <div class="jr-say"><span class="jr-meta"><span class="jr-ix">${n2(i)}<em>/ ${n2(STEPS.length - 1)}</em></span><span class="jr-who"><i>${ic(s.who[0])}</i>${esc(s.who[1])}</span></span><h3>${esc(s.h)}</h3><p>${esc(s.p)}</p></div>
      <ul class="jr-facts">${s.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
    </div>`;

  /* ---------------- scale-to-fit ---------------- */
  const fitters = new Set();
  /* on narrow screens a box can focus on part of its scene (data-mx, data-mw) or keep a minimum scale and scroll sideways (data-min) */
  const fitOne = (box) => {
    const c = box.firstElementChild; if (!c || !box.clientWidth) return;
    const narrow = window.innerWidth <= 560, crop = narrow && box.dataset.mw;
    const w = crop ? +box.dataset.mw : +box.dataset.w || W, h = +box.dataset.h || H, x = crop ? +box.dataset.mx : 0;
    let k = box.clientWidth / w;
    const min = narrow ? +box.dataset.min || 0 : 0, scroll = min && k < min;
    if (scroll) k = min;
    box.classList.toggle('crop', !!crop);
    box.classList.toggle('scrollx', !!scroll);
    box.style.aspectRatio = scroll ? 'auto' : `${w} / ${h}`;
    box.style.height = scroll ? `${Math.round(h * k)}px` : '';
    c.style.transform = `translate(${(-x * k).toFixed(1)}px, 0) scale(${k.toFixed(4)})`;
  };
  const ro = 'ResizeObserver' in window ? new ResizeObserver((es) => es.forEach((e) => fitOne(e.target))) : null;
  const fit = (box) => { fitters.add(box); if (ro) ro.observe(box); fitOne(box); };
  window.addEventListener('resize', () => fitters.forEach(fitOne));

  /* ---------------- easing ---------------- */
  let EO = 'power3.out', EIO = 'power3.inOut';
  if (gsap && CE) { gsap.registerPlugin(CE); CE.create('pi-out', '0.23,1,0.32,1'); CE.create('pi-io', '0.77,0,0.175,1'); EO = 'pi-out'; EIO = 'pi-io'; }
  if (gsap && ST) { gsap.registerPlugin(ST); gsap.config({ nullTargetWarn: false }); }

  /* ---------------- the journey ---------------- */
  /* Built lazily (motion.js): about two screens before it arrives, or while the browser is
     idle after load. Only the version the screen needs is built: the pinned story on wide
     screens, the stacked scenes on phones, tablets and reduced motion. */
  const near = P.near || ((el, fn) => fn());
  function Journey() {
    const root = $('#journey'); if (!root) return;
    const build = (mode) => {
      if (root.querySelector(mode === 'pin' ? '.jr-pin' : '.jr-list')) return;
      if (mode === 'pin') {
        root.insertAdjacentHTML('afterbegin', `<div class="jr-pin" style="--acc-rgb:${STEPS[0].acc}">
          <div class="jr-sky" aria-hidden="true"><span class="jr-orb brand"></span><span class="jr-acc" data-a></span><span class="jr-acc" data-a></span><span class="jr-mesh"></span></div>
          <div class="wrap jr-in">
            <div class="jr-copy">${STEPS.map(text).join('')}</div>
            <div class="jr-stage" aria-hidden="true" data-w="${W}"><div class="jr-canvas">${STEPS.map((s, i) => `<div class="sc" data-i="${i}">${s.scene()}</div>`).join('')}</div><span class="jr-plate"></span><span class="jr-rim"></span></div>
          </div>
          <div class="wrap jr-bar"><span class="jr-track"><i class="jr-fill"></i></span><ol class="jr-chap" aria-label="Journey steps">${STEPS.map((s, i) => `<li><button type="button" data-i="${i}"><i class="jr-cd" aria-hidden="true"></i><span>${s.k}</span></button></li>`).join('')}</ol></div>
        </div>`);
        $$('.jr-stage', root).forEach(fit);
        return;
      }
      root.insertAdjacentHTML('beforeend', `<div class="jr-list">${STEPS.map((s, i) => `<article class="jm" data-i="${i}" style="--acc-rgb:${s.acc}">${text(s, i)}<div class="jm-stage" aria-hidden="true" data-w="${W}"${s.focus ? ` data-mx="${s.focus[0]}" data-mw="${s.focus[1]}"` : ''}><div class="jr-canvas"><div class="sc is-live">${s.scene()}</div></div><span class="jr-plate"></span><span class="jr-rim"></span></div></article>`).join('')}</div>`);
      $$('.jm-stage', root).forEach(fit);
      /* stacked scenes sit still; their small loops run while on screen */
      const live = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => e.target.querySelector('.sc').classList.toggle('is-live', e.isIntersecting)), { rootMargin: '0px 0px -10% 0px' }) : null;
      $$('.jm', root).forEach((m) => { if (live) { m.querySelector('.sc').classList.remove('is-live'); live.observe(m); } });
    };

    near(root, () => {
      if (!gsap || !ST) { build('list'); return; }
      const mm = gsap.matchMedia();
      /* `any` always matches: matchMedia only runs this when at least one condition does */
      mm.add({ wide: '(min-width: 1024px) and (min-height: 620px)', calm: '(prefers-reduced-motion: reduce)', any: 'all' }, (ctx) => {
        const { wide, calm } = ctx.conditions;
        if (wide && !calm) {
          build('pin'); root.classList.add('is-pinned');
          const stop = pinned(root, ctx);
          return () => { stop(); root.classList.remove('is-pinned'); };
        }
        build('list');
        /* stacked steps rise in through the shared CSS reveal (motion.css): compositor-only,
           no per-step ScrollTrigger to update on every scroll frame */
        $$('.jm', root).forEach((m) => {
          m.querySelectorAll('.jr-t > *').forEach((el, k) => { el.classList.add('rv', 'rv-t'); el.style.setProperty('--d', `${k * 70}ms`); });
          const stage = m.querySelector('.jm-stage'); if (stage) stage.classList.add('rv', 'rv-m');
        });
        if (P.scan) P.scan(root);
        return undefined;
      });
    });
  }

  /* the scrubbed story, assembled one scene at a time so the page stays responsive while it
     builds (PI.chunks); everything is recorded in the matchMedia context, so a resize that
     leaves the wide layout reverts it cleanly. Scrubbed tweens move only opacity and transform */
  function pinned(root, ctx) {
    const pin = $('.jr-pin', root), scenes = $$('.sc', pin), texts = $$('.jr-t', pin), chaps = $$('.jr-chap button', pin), fill = $('.jr-fill', pin);
    const rim = $('.jr-rim', pin), accs = $$('.jr-acc', pin);
    const TR = 1.5, HOLD = 1, N = STEPS.length;
    let dead = false;
    const q = (s, sel) => Array.from(s.querySelectorAll(sel));

    /* each scene's entrance, placed at time t on the master timeline */
    const enter = (tl, s, i, t) => {
      const keep = s.querySelector('.dv.keep') && scenes[i - 1] && scenes[i - 1].querySelector('.dv.keep');
      tl.fromTo(q(s, '.sc-glow'), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1, ease: EO }, t);
      tl.fromTo(s, { scale: 1.022 }, { scale: 1, duration: 1.3, ease: EO, transformOrigin: '50% 52%' }, t);
      if (keep) {
        /* same phone, new screen: the old frame stays on show while only the new screen fades in over it, then the identical frames swap */
        const dv = s.querySelector('.dv.keep');
        tl.set(dv, { visibility: 'hidden' }, t - 0.05).set(q(s, '.dv.keep .ap'), { visibility: 'visible' }, t - 0.05);
        tl.fromTo(q(s, '.dv .ap'), { opacity: 0 }, { opacity: 1, duration: 0.55, ease: EO }, t + 0.1);
        tl.set(dv, { visibility: 'visible' }, t + TR - 0.25);
      }
      else tl.fromTo(q(s, '.dv'), { y: 70, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: EO }, t);
      tl.fromTo(q(s, '.e'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: EO, stagger: 0.06 }, t + 0.15);
      tl.fromTo(q(s, '.ld'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.55, ease: EIO, stagger: 0.06 }, t + 0.25);
      tl.fromTo(q(s, '.ldot'), { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.06 }, t + 0.25);
      SCENE[i] && SCENE[i](tl, s, t);
    };
    const leave = (tl, s, i, t) => {
      const keepNext = scenes[i + 1] && scenes[i + 1].querySelector('.dv.keep') && s.querySelector('.dv.keep');
      tl.to(q(s, '.e, .sc-lines'), { y: -18, opacity: 0, duration: 0.5, ease: EIO, stagger: 0.03 }, t);
      if (!keepNext) tl.to(q(s, '.dv'), { y: -40, opacity: 0, scale: 0.97, duration: 0.6, ease: EIO }, t);
      tl.to(q(s, '.sc-glow'), { opacity: 0, duration: 0.6 }, t);
      tl.to(s, { scale: 0.986, duration: 0.6, ease: EIO, transformOrigin: '50% 52%' }, t);
    };
    /* scene-specific choreography */
    const bars = (tl, els, t, d = 0.06, dur = 0.5) => tl.fromTo(els, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: dur, ease: EO, stagger: d }, t);
    const SCENE = {
      2: (tl, s, t) => {
        tl.fromTo(q(s, '.sy-row, .sy-card'), { x: 22, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: EO, stagger: 0.05 }, t + 0.2);
        tl.fromTo(q(s, '.sy-bar i'), { scaleX: 0.08 }, { scaleX: 0.66, duration: 0.8, ease: EIO }, t + 0.4);
        const n = s.querySelector('.sy-n'), o = { v: 0 };
        tl.fromTo(o, { v: 0 }, { v: 4, duration: 0.8, ease: 'none', onUpdate: () => { n.textContent = Math.round(o.v); } }, t + 0.4);
      },
      3: (tl, s, t) => {
        tl.fromTo(q(s, '.rd-r, .rd-f'), { scale: 0.86, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: EO, stagger: 0.06 }, t + 0.1);
        tl.fromTo(q(s, '.rd-pt, .rd-lb'), { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: EO, stagger: 0.08 }, t + 0.5);
        tl.fromTo(q(s, '.vc-row'), { x: 16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: EO, stagger: 0.07 }, t + 0.45);
        tl.fromTo(q(s, '.vc-row .tick path'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3, ease: EO, stagger: 0.07 }, t + 0.5);
        tl.fromTo(q(s, '.vc-pass'), { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: EO }, t + 0.85);
      },
      4: (tl, s, t) => {
        const words = q(s, '.tx-te .w');
        tl.fromTo(q(s, '.wv.lit'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.85, ease: 'none' }, t + 0.2);
        /* scenes are drawn at a fixed design size and scaled as a picture, so this width never changes */
        const txw = s.querySelector('.tx-w');
        tl.fromTo(q(s, '.tx-head'), { x: 0 }, { x: txw ? txw.offsetWidth : 0, duration: 0.85, ease: 'none' }, t + 0.2);
        tl.fromTo(words, { opacity: 0.14 }, { opacity: 1, duration: 0.22, ease: 'none', stagger: 0.63 / words.length }, t + 0.2);
        tl.fromTo(q(s, '.tx-en, .tx-s span'), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28, ease: EO, stagger: 0.04 }, t + 0.85);
      },
      5: (tl, s, t) => {
        tl.fromTo(q(s, '.hl'), { backgroundSize: '0% 0.42em' }, { backgroundSize: '100% 0.42em', duration: 0.4, ease: EIO, stagger: 0.12 }, t + 0.35);
        tl.fromTo(q(s, '.an-i'), { x: 18, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: EO, stagger: 0.1 }, t + 0.45);
        bars(tl, q(s, '.an-m u'), t + 0.5, 0.08);
        tl.fromTo(q(s, '.an-c .rg-v'), { strokeDashoffset: 88 }, { strokeDashoffset: 0, duration: 0.5, ease: EO }, t + 0.7);
      },
      6: (tl, s, t) => {
        const b = s.querySelector('.kp b.cnt'), o = { v: 0 }, target = STATE.iv;
        tl.fromTo(o, { v: target * 0.82 }, { v: target, duration: 0.8, ease: EO, onUpdate: () => { b.textContent = IN(Math.round(o.v)); } }, t + 0.3);
        tl.fromTo(q(s, '.kp'), { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: EO, stagger: 0.06 }, t + 0.25);
        tl.fromTo(q(s, '.cc-seat'), { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: EO }, t + 0.45);
        bars(tl, q(s, '.cc-seat .qbar i'), t + 0.5, 0.05);
      },
      7: (tl, s, t) => {
        tl.fromTo(q(s, '.ch-q'), { y: 14, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: EO }, t + 0.35);
        tl.fromTo(q(s, '.ch-steps span'), { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.3, ease: EO, stagger: 0.1 }, t + 0.5);
        tl.fromTo(q(s, '.ch-steps .tick path'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3, ease: EO, stagger: 0.1 }, t + 0.55);
        tl.fromTo(q(s, '.ch-a'), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: EO }, t + 0.75);
      },
    };

    let tl = null;
    const kids = (x) => Array.from(x.children);
    const scene = (i) => {
      const t = tl.duration();
      leave(tl, scenes[i - 1], i - 1, t);
      /* the old words lift away line by line; the new ones settle in the same rhythm */
      tl.to(texts[i - 1], { opacity: 0, duration: 0.4, ease: EIO }, t);
      tl.to(kids(texts[i - 1]), { y: -18, opacity: 0, duration: 0.42, ease: EIO, stagger: 0.035 }, t);
      tl.set(scenes[i], { autoAlpha: 1 }, t + 0.2);
      enter(tl, scenes[i], i, t + 0.25);
      tl.set(texts[i], { opacity: 1 }, t + 0.4);
      tl.fromTo(kids(texts[i]), { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.62, ease: EO, stagger: 0.07 }, t + 0.42);
      /* the plate's rim light sweeps open as the scene lands */
      if (rim) tl.fromTo(rim, { scaleX: 0.25, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.95, ease: EO, immediateRender: false }, t + 0.3);
      tl.set(scenes[i - 1], { autoAlpha: 0 }, t + TR);
      tl.addLabel('s' + i, t + TR);
      tl.to({}, { duration: HOLD }, t + TR);
    };
    const steps = [() => {
      gsap.set(scenes, { autoAlpha: 0 }); gsap.set(scenes[0], { autoAlpha: 1 });
      gsap.set(texts, { opacity: 0 }); gsap.set(texts[0], { opacity: 1 });
      if (rim) gsap.set(rim, { transformOrigin: '50% 50%' });
      tl = gsap.timeline({ paused: true, defaults: { ease: EO } });
      tl.addLabel('s0', 0).to({}, { duration: HOLD });
    }];
    for (let i = 1; i < N; i++) steps.push(() => scene(i));
    steps.push(() => finish());
    (P.chunks || ((list) => list.forEach((f) => f())))(steps.map((f) => () => { if (!dead) ctx.add(f); }));
    return () => { dead = true; };

    function finish() {
    const stops = STEPS.map((_, i) => tl.labels['s' + i]);
    const last = stops[N - 1];

    /* the first scene powers on when the section arrives; it is not part of the scrub */
    const s0 = scenes[0];
    gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 72%', once: true } })
      .fromTo(q(s0, '.cc-card, .cc-chips span, .cc-steps > *'), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: EO, stagger: 0.04 })
      .fromTo(q(s0, '.mm .gd'), { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.05 }, 0.3)
      .fromTo(q(s0, '.qbar i'), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.8, ease: EO, stagger: 0.06 }, 0.35)
      .fromTo(q(s0, '.bt'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, transformOrigin: '50% 50%', duration: 0.4, ease: EO, stagger: 0.08 }, 0.8);

    /* the room takes the colour of the step it is showing: one soft light fades up while
       the one before it fades out, so the hue travels instead of snapping. */
    let lit = 0;
    const light = (rgb, first) => {
      pin.style.setProperty('--acc-rgb', rgb);
      if (!accs.length) return;
      const inc = accs[lit], out = accs[1 - lit];
      inc.style.setProperty('--c', rgb);
      if (first) { gsap.set(inc, { opacity: 1 }); gsap.set(out, { opacity: 0 }); }
      else {
        gsap.to(inc, { opacity: 1, duration: 1.1, ease: EO, overwrite: 'auto' });
        gsap.to(out, { opacity: 0, duration: 1.1, ease: EO, overwrite: 'auto' });
      }
      lit = 1 - lit;
    };
    light(STEPS[0].acc, true);

    let cur = -1;
    const sync = () => {
      const time = tl.time();
      fill.style.transform = `scaleX(${((0.5 + Math.min(1, time / last) * (N - 1)) / N).toFixed(4)})`;
      let i = 0; stops.forEach((L, k) => { if (time >= L - TR * 0.55) i = k; });
      if (i === cur) return;
      const firstRun = cur === -1; cur = i;
      light(STEPS[i].acc, firstRun);
      chaps.forEach((c, k) => { c.classList.toggle('on', k === i); c.classList.toggle('done', k < i); if (k === i) c.setAttribute('aria-current', 'step'); else c.removeAttribute('aria-current'); });
      scenes.forEach((s, k) => s.classList.toggle('is-live', k === i));
      texts.forEach((x, k) => { x.style.pointerEvents = k === i ? '' : 'none'; });
    };
    /* the nav stays fixed at the top, through the pinned story too */
    const tuck = () => {};
    const st = ST.create({
      animation: tl, trigger: pin, start: 'top top', pin: true, scrub: 0.8, anticipatePin: 1,
      end: () => '+=' + Math.round(window.innerHeight * (0.8 * (N - 1) + 0.5)),
      onRefresh: sync,
      onToggle: (self) => tuck(self.isActive),
    });
    ctx.add(() => () => tuck(false));
    tl.eventCallback('onUpdate', sync);
    sync();
    chaps.forEach((c, k) => c.addEventListener('click', () => {
      const y = st.start + (stops[k] / tl.duration()) * (st.end - st.start);
      window.scrollTo({ top: Math.ceil(y) + 2, behavior: 'smooth' });
    }));
    /* the pin adds its scroll length below the story: later triggers re-measure once, when idle */
    (window.requestIdleCallback || setTimeout)(() => ST.refresh());
    document.fonts && document.fonts.ready.then(() => ST.refresh());
    }
  }

  /* ---------------- three apps, one per role ---------------- */
  function Apps() {
    const t = $('#appTabs'); if (!t) return;
    near($('#apps') || t, () => AppsNow(t));
  }
  /* The art in each panel used to be drawn here (a trio of phones, a Field Ops window).
     It is now a capture of the real product, so this only switches panels and animates
     them in. The drawings are kept in legacy/mockups-apps.js. */
  function AppsNow(t) {
    const show = (panel) => {
      if (!gsap || reduced || !panel) return;
      gsap.fromTo(panel.querySelectorAll('.prod-art .browser'), { y: 46, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: EO, overwrite: true });
      gsap.fromTo(panel.querySelectorAll('.prod-lead > *, .flist li'), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: EO, stagger: 0.05, overwrite: true });
    };
    P.tabs(t, (b) => { let shown = null; $$('.prod').forEach((p) => { p.hidden = p.id !== b.getAttribute('aria-controls'); if (!p.hidden) shown = p; }); $$('.fit', shown || document).forEach(fitOne); show(shown); });
    if (gsap && ST && !reduced) ST.create({ trigger: '#apps', start: 'top 70%', once: true, onEnter: () => show($$('.prod').find((p) => !p.hidden)) });
  }

  const run = (name, f) => { try { f(); } catch (e) { console.error('[' + name + ']', e); } };
  function init() { run('sprite', sprite); run('journey', Journey); run('apps', Apps); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
