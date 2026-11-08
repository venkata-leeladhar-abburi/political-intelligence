/* Political Intelligence Platform · How it works (how.html), prefix hw-.
   1. Story (#hwStory): eight steps of one interview. The text scrolls normally; on wide screens a
      sticky stage on the right swaps to the active step's screen. No scroll-jacking, no pinning, no
      GSAP: an IntersectionObserver picks the step in the middle of the screen. Below 1000px each
      screen moves under its own step.
   2. Lab (#hwLab): the speech engine as a small machine you can drive. Pick a clip, then Hear ·
      Write · Read · Score. It runs on its own the first time it is seen; tapping a stage, a clip,
      Pause or Run again takes over. Reduced motion: no autoplay, stages switch without animation. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const ic = (n) => `<svg aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WIDE = window.matchMedia('(min-width: 1001px)');
  const near = (el, fn) => { if (!el) return; if (window.PI && typeof window.PI.near === 'function') window.PI.near(el, fn); else fn(); };
  const bars = (n, seed, cls = '') => { let s = seed, out = ''; for (let i = 0; i < n; i++) { s = (s * 9301 + 49297) % 233280; const h = 18 + Math.abs(Math.sin(i * 0.55 + seed)) * 62 + (s / 233280) * 20; out += `<i class="${cls}" style="--h:${Math.round(h)}%;--k:${i}"></i>`; } return out; };

  /* ================================================================ the eight screens */
  const TE_Q = 'మీ ఊరిలో అతి పెద్ద సమస్య ఏమిటి?';
  const SCREENS = [
    /* 1 plan */
    () => `<div class="hw-card hw-plan">
      <div class="hw-ch"><span class="hw-ct">${ic('clip')}New round · Round 3</span><span class="hw-pill">Draft</span></div>
      <div class="hw-kpis"><div><b>175</b><span>seats</span></div><div><b>700</b><span>booths</span></div><div><b>35,000</b><span>interviews</span></div></div>
      <p class="hw-lbl">Quotas, matched to each seat’s voter roll</p>
      <ul class="hw-q">${[['Women', 50], ['Men', 50], ['Age 18–29', 31], ['Age 30–49', 42], ['Age 50+', 27], ['Rural', 66]].map(([t, v], k) => `<li style="--k:${k}"><span>${t}</span><i><em style="--w:${v}%"></em></i><b>${v}%</b></li>`).join('')}</ul>
      <div class="hw-btn">${ic('rocket')}Launch round</div>
    </div>`,
    /* 2 collect */
    () => `<div class="hw-phone"><div class="hw-scr-in">
      <div class="hw-pbar"><span>9:41</span><span class="hw-off">${ic('wifioff')}No signal · saved</span></div>
      <p class="hw-pmeta">Booth 112 · Brodipet · interview 19</p>
      <div class="hw-qcard"><p class="te" lang="te">${TE_Q}</p><p>What is the biggest problem in your village?</p></div>
      <div class="hw-rec"><div class="hw-rec-t"><span><i></i>Recording the answer</span><b>0:24</b></div><div class="hw-wave">${bars(30, 3, 'w')}</div></div>
      <div class="hw-chips"><span>${ic('check')}Consent recorded</span><span>${ic('pin')}In fence · 18 m</span></div>
      <div class="hw-btn">Next question ${ic('arrow')}</div>
    </div></div>
    <div class="hw-float hw-f1">${ic('mic')}<span><b>3 voice clips</b>Only open answers</span></div>`,
    /* 3 sync */
    () => `<div class="hw-sync">
      <div class="hw-card hw-queue"><div class="hw-ch"><span class="hw-ct">${ic('phone')}Ravi’s phone</span><span class="hw-pill hw-ok">Online again</span></div>
        <ul>${[['Booth 112 · 19', 'Uploaded', 'ok'], ['Booth 112 · 18', 'Uploaded', 'ok'], ['Booth 118 · 4', 'Uploading', 'go'], ['Booth 121 · 1', 'Waiting', '']].map(([t, s, c], k) => `<li class="${c}" style="--k:${k}"><span>${t}</span><b>${c === 'ok' ? ic('check') : ''}${s}</b>${c === 'go' ? '<i><em></em></i>' : ''}</li>`).join('')}</ul>
        <p class="hw-note">${ic('lock')}Encrypted on the phone while offline</p></div>
      <div class="hw-pipe"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="hw-cloud">${ic('cloud')}<b>India servers</b><span>Encrypted in transit</span></div>
    </div>`,
    /* 4 verify */
    () => `<div class="hw-card hw-ver">
      <div class="hw-ch"><span class="hw-ct">${ic('shield')}Interview A-1124</span><span class="hw-pill hw-ok hw-late">Counted</span></div>
      <ul>${[['Inside the booth fence', '18 m'], ['Long enough to be real', '6 m 12 s'], ['No fake GPS app', 'Clean'], ['A voice not heard before', 'Unique'], ['Consent recorded', 'Yes'], ['A real answer pattern', 'Varied'], ['A possible travel speed', '4 km/h'], ['Words heard clearly', '0.93'], ['Tone resolved', 'Clear']].map(([t, v], k) => `<li style="--k:${k}"><i>${ic('check')}</i><span>${t}</span><b>${v}</b></li>`).join('')}</ul>
    </div>
    <div class="hw-float hw-f2"><i class="hw-bad">${ic('x')}</i><span><b>Held back</b>Booth 87 · 340 m outside the fence</span></div>`,
    /* 5 hear */
    () => `<div class="hw-card hw-hear">
      <div class="hw-ch"><span class="hw-ct">${ic('ear')}Clip 2 of 3 · 18 s</span><span class="hw-pill">Coastal Telugu</span></div>
      <div class="hw-wave hw-wave-l">${bars(46, 7, 'w')}<span class="hw-head"></span></div>
      <p class="hw-te te" lang="te">${'రోడ్లు అసలు బాలేవు, మా ఊర్లో పిల్లలకి ఉద్యోగాలు లేవు. పెన్షన్ మాత్రం టైమ్‌కి వస్తుంది.'.split(' ').map((w, k) => `<span style="--k:${k}">${w}</span>`).join(' ')}</p>
      <p class="hw-en">“Roads are terrible, no jobs for the young in our village. The pension does come on time.”</p>
      <div class="hw-chips"><span>${ic('check')}Village noise removed</span><span>${ic('check')}Voter’s voice only</span></div>
    </div>`,
    /* 6 read */
    () => `<div class="hw-card hw-read">
      <div class="hw-ch"><span class="hw-ct">${ic('brain')}What the voter feels</span><span class="hw-pill">4 issues</span></div>
      <ul class="hw-iss">${[['Roads', -0.8], ['Jobs for the young', -0.7], ['Pension', 0.6], ['MLA access', -0.5]].map(([t, v], k) => `<li style="--k:${k}"><span>${t}</span><i class="${v < 0 ? 'n' : 'p'}"><em style="--w:${Math.abs(v) * 50}%"></em></i><b class="${v < 0 ? 'n' : 'p'}">${v < 0 ? 'Negative' : 'Positive'}</b></li>`).join('')}</ul>
      <div class="hw-read-b"><div class="hw-emo"><span>Anger</span><span>Disappointment</span></div><div class="hw-conf"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" pathLength="100"/><circle class="v" cx="22" cy="22" r="18" pathLength="100" style="--v:88"/></svg><span><b>0.88</b>confidence · no review needed</span></div></div>
    </div>`,
    /* 7 map: filled from the real seat outlines when built */
    () => `<div class="hw-map"><svg class="hw-mapsvg" viewBox="0 0 1000 853" preserveAspectRatio="xMidYMid meet" aria-hidden="true"></svg>
      <div class="hw-card hw-mapk"><p class="hw-lbl">Guntur West · Round 3</p><b class="hw-big">63%</b><span>positive mood</span><span class="hw-up">${ic('trend')}+4 pts since Round 2</span><span class="hw-n">n = 1,128 · ±2.9%</span></div></div>`,
    /* 8 ask */
    () => `<div class="hw-card hw-ask">
      <div class="hw-ch"><span class="hw-ct">${ic('spark')}Ask the Data</span><span class="hw-pill">English · తెలుగు</span></div>
      <p class="hw-qb">Why did the mood rise in Guntur West?</p>
      <div class="hw-ab"><p>Mood rose <b>4 pts to 63%</b>. Pensions arriving on time is the top reason (29%). Roads are still the first complaint.</p>
        <div class="hw-ev"><span>n = 1,128</span><span>±2.9%</span><span>Round 2 → 3</span></div>
        <div class="hw-qt"><span class="hw-pb">${ic('play')}</span><span><b>“The pension comes on time now.”</b>Woman, 61 · Brodipet · 0:07</span></div></div>
    </div>`,
  ];
  const RAIL = ['Plan', 'Collect', 'Sync', 'Verify', 'Hear', 'Read', 'Map', 'Ask'];

  function drawMap(svg) {
    const AP = window.AP;
    if (!AP || !svg) return;
    /* the shaded-map ramp kept from the earlier dashboards: violet → magenta → orange → gold */
    const stops = ['#5b2bd6', '#8130ff', '#ca45ff', '#fe881b', '#ffd600'];
    const mix = (a, b, t) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const x = p(a), y = p(b); return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`; };
    const ramp = (t) => { t = Math.max(0, Math.min(0.999, t)) * (stops.length - 1); const i = Math.floor(t); return mix(stops[i], stops[i + 1], t - i); };
    const g = AP.acs.find((a) => a.n === 94);
    svg.innerHTML = `<path d="${AP.state}" fill="#111114" stroke="rgba(255,255,255,.18)" stroke-width="2"/>`
      + AP.acs.map((a) => `<path d="${a.d}" fill="${ramp((a.pos - 38) / 30)}" fill-opacity="${a.n === 94 ? 1 : 0.68}" stroke="#08080a" stroke-width="1"/>`).join('')
      + (g ? `<path d="${g.d}" fill="#ffd600" stroke="#fff" stroke-width="2.4"/><circle class="hw-rip" cx="${g.c[0]}" cy="${g.c[1]}" r="10"/><circle class="hw-rip" cx="${g.c[0]}" cy="${g.c[1]}" r="10" style="animation-delay:-1.2s"/><circle cx="${g.c[0]}" cy="${g.c[1]}" r="5" fill="#fff"/>` : '');
  }

  function Story() {
    const host = $('#hwStory');
    if (!host) return;
    const steps = $$('.hw-step', host), stage = $('#hwStage'), rail = $('.hw-rail', stage), box = $('.hw-screens', stage);
    rail.innerHTML = RAIL.map((t, i) => `<button type="button" data-i="${i}"><i></i><span>${t}</span></button>`).join('');
    box.innerHTML = SCREENS.map((f, i) => `<div class="hw-scr" data-i="${i}">${f()}</div>`).join('');
    const scrs = $$('.hw-scr', box), btns = $$('button', rail);
    near($('.hw-mapsvg', box), () => drawMap($('.hw-mapsvg', box)));
    let cur = -1;
    const set = (i) => {
      if (i === cur) return;
      cur = i;
      steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
      scrs.forEach((s, k) => s.classList.toggle('is-on', k === i));
      btns.forEach((b, k) => { b.classList.toggle('is-on', k === i); b.classList.toggle('is-done', k < i); b.setAttribute('aria-current', k === i ? 'step' : 'false'); });
      rail.style.setProperty('--p', `${(i / (RAIL.length - 1)) * 100}%`);
    };
    btns.forEach((b, i) => b.addEventListener('click', () => steps[i].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })));
    /* the step whose middle crosses the middle band of the screen is the active one */
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) set(+e.target.dataset.i); }), { rootMargin: '-46% 0px -46% 0px' });
      steps.forEach((s) => io.observe(s));
    }
    /* narrow screens: each screen sits under its own step */
    const place = () => {
      scrs.forEach((s, i) => { if (WIDE.matches) { if (s.parentNode !== box) box.appendChild(s); } else if (s.parentNode !== steps[i]) steps[i].appendChild(s); });
      if (!WIDE.matches) scrs.forEach((s) => s.classList.add('is-on'));
      else scrs.forEach((s, k) => s.classList.toggle('is-on', k === cur));
    };
    place();
    if (WIDE.addEventListener) WIDE.addEventListener('change', place); else if (WIDE.addListener) WIDE.addListener(place);
    set(0);
  }

  /* ================================================================ the engine lab */
  const CLIPS = [
    { who: 'Guntur West', what: 'Woman, 44 · 18 s', tag: 'Four issues at once', te: 'రోడ్లు అసలు బాలేవు, మా ఊర్లో పిల్లలకి ఉద్యోగాలు లేవు. పెన్షన్ మాత్రం టైమ్‌కి వస్తుంది. MLA ఎన్నికల తర్వాత ఒక్కసారి కూడా రాలేదు.',
      en: '“Roads are terrible, no jobs for the young in our village. The pension does come on time. The MLA hasn’t come even once since the election.”', dial: 'Coastal Telugu', sec: 18,
      iss: [['Roads', -0.8], ['Jobs for the young', -0.7], ['Pension', 0.6], ['MLA access', -0.5]], emo: ['Anger', 'Disappointment'], mood: 0.72, conf: 0.88 },
    { who: 'Kurnool', what: 'Man, 52 · 12 s', tag: 'One clear issue', te: 'నీళ్లు నాలుగు రోజులకి ఒకసారి వస్తున్నాయి. క్యాన్లు కొనుక్కుంటున్నాం.',
      en: '“Drinking water comes once in four days. We buy cans now.”', dial: 'Rayalaseema Telugu', sec: 12,
      iss: [['Drinking water', -0.9]], emo: ['Frustration'], mood: 0.64, conf: 0.91 },
    { who: 'Prakasam', what: 'Man, 37 · 9 s', tag: 'Sarcasm, caught', te: 'అవును, రోడ్లు చాలా బాగున్నాయి... వర్షం పడితే పడవలో వెళ్లొచ్చు.',
      en: '“Oh yes, the roads are wonderful... when it rains we can go by boat.”', dial: 'Coastal Telugu', sec: 9, sarcasm: 0.82,
      iss: [['Roads', -0.75]], emo: ['Sarcasm', 'Anger'], mood: 0.7, conf: 0.79 },
  ];
  const STAGES = [['ear', 'Hear'], ['pen', 'Write'], ['brain', 'Read'], ['gauge', 'Score']];
  const DWELL = 3200;

  function Lab() {
    const host = $('#hwLab');
    if (!host) return;
    const clipBox = $('.hw-clips', host), tabBox = $('.hw-tabs', host), panel = $('.hw-panel', host);
    const play = $('.hw-play', host), again = $('.hw-again', host), prog = $('.hw-prog i', host);
    clipBox.innerHTML = CLIPS.map((c, i) => `<button type="button" role="radio" aria-checked="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-i="${i}"><span class="hw-cw">${bars(14, i + 2)}</span><span class="hw-ci"><b>${c.who}</b><small>${c.what}</small></span><span class="hw-ctag${c.sarcasm ? ' s' : ''}">${c.tag}</span></button>`).join('');
    tabBox.innerHTML = STAGES.map(([i, t], k) => `<button type="button" role="tab" id="hwT${k}" aria-selected="${k === 0}" tabindex="${k === 0 ? 0 : -1}" data-k="${k}"><span class="hw-tn">${k + 1}</span>${ic(i)}<span>${t}</span></button>`).join('');
    const clipBtns = $$('button', clipBox), tabs = $$('button', tabBox);
    let clip = 0, stage = 0, auto = !reduced, timer = 0, started = false;

    const views = [
      (c) => `<div class="hw-v hw-v-hear"><div class="hw-vh"><span>Raw field audio</span><span>After cleaning</span></div>
        <div class="hw-2w"><div class="hw-wave hw-raw">${bars(36, clip + 11, 'w')}</div>${ic('arrow')}<div class="hw-wave hw-clean">${bars(36, clip + 4, 'w')}</div></div>
        <ul class="hw-facts-s"><li>${ic('check')}<span><b>${c.sec} seconds</b>the voter’s open answer</span></li><li>${ic('check')}<span><b>${c.dial}</b>dialect recognised</span></li><li>${ic('check')}<span><b>Village noise removed</b>agent’s voice separated out</span></li></ul></div>`,
      (c) => `<div class="hw-v hw-v-write"><p class="hw-te te" lang="te">${c.te.split(' ').map((w, k) => `<span style="--k:${k}">${w}</span>`).join(' ')}</p>
        <p class="hw-en">${c.en}</p>
        <ul class="hw-facts-s"><li>${ic('check')}<span><b>Word for word</b>never summarised or cleaned up</span></li><li>${ic('check')}<span><b>English meaning</b>for analysts who read English</span></li><li>${ic('check')}<span><b>Best quote marked</b>ready for the client’s report</span></li></ul></div>`,
      (c) => `<div class="hw-v hw-v-read">${c.sarcasm ? `<div class="hw-sar"><div><span>The words say</span><b class="p">Positive</b></div>${ic('arrow')}<div><span>The tone says</span><b>Sarcasm · ${c.sarcasm.toFixed(2)}</b></div>${ic('arrow')}<div><span>Counted as</span><b class="n">Negative</b></div></div>` : ''}
        <ul class="hw-iss">${c.iss.map(([t, v], k) => `<li style="--k:${k}"><span>${t}</span><i class="${v < 0 ? 'n' : 'p'}"><em style="--w:${Math.abs(v) * 50}%"></em></i><b class="${v < 0 ? 'n' : 'p'}">${v < 0 ? 'Negative' : 'Positive'}</b></li>`).join('')}</ul>
        <div class="hw-emo"><span class="hw-lbl">Emotion</span>${c.emo.map((e) => `<span>${e}</span>`).join('')}</div></div>`,
      (c) => {
        const ours = (c.sec / 60) * 0.04, lo = (c.sec / 60) * 0.5, hi = (c.sec / 60) * 2;
        return `<div class="hw-v hw-v-score"><div class="hw-scores">
          <div><span class="hw-lbl">Mood intensity</span><b>${c.mood.toFixed(2)}</b><i class="hw-meter"><em style="--w:${c.mood * 100}%"></em></i></div>
          <div><span class="hw-lbl">Confidence</span><div class="hw-conf hw-conf-l"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" pathLength="100"/><circle class="v" cx="22" cy="22" r="18" pathLength="100" style="--v:${Math.round(c.conf * 100)}"/></svg><b>${c.conf.toFixed(2)}</b></div></div>
          <div><span class="hw-lbl">Human review</span><b class="hw-ok-t">Not needed</b><small>${c.sarcasm ? 'Sarcasm above 0.75 flips on its own' : 'Confident enough for the dashboard'}</small></div>
        </div>
        <div class="hw-cost"><span class="hw-lbl">What it cost to listen to this clip</span><div class="hw-cost-r"><span><b>₹${ours.toFixed(3)}</b>our engine</span><span class="hw-vs">vs</span><span><b>₹${lo.toFixed(2)}–${hi.toFixed(2)}</b>paid speech APIs</span></div></div></div>`;
      },
    ];

    const render = () => {
      clipBtns.forEach((b, i) => { b.setAttribute('aria-checked', i === clip ? 'true' : 'false'); b.tabIndex = i === clip ? 0 : -1; });
      tabs.forEach((b, k) => { b.setAttribute('aria-selected', k === stage ? 'true' : 'false'); b.tabIndex = k === stage ? 0 : -1; b.classList.toggle('is-done', k < stage); });
      panel.setAttribute('aria-labelledby', `hwT${stage}`);
      panel.innerHTML = views[stage](CLIPS[clip]);
      panel.classList.remove('is-in'); void panel.offsetWidth; panel.classList.add('is-in');
      prog.style.transition = 'none'; prog.style.width = `${(stage / STAGES.length) * 100}%`;
      if (auto) { void prog.offsetWidth; prog.style.transition = `width ${DWELL}ms linear`; prog.style.width = `${((stage + 1) / STAGES.length) * 100}%`; }
    };
    const setAuto = (on) => {
      auto = on && !reduced;
      play.setAttribute('aria-pressed', auto ? 'true' : 'false');
      play.innerHTML = auto ? `${ic('pause')}<span>Pause</span>` : `${ic('play')}<span>Play</span>`;
      clearTimeout(timer);
      if (auto) tick();
      else { prog.style.transition = 'none'; prog.style.width = `${((stage + 1) / STAGES.length) * 100}%`; }
    };
    /* one stage every few seconds, then the next clip from the start */
    const tick = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!auto) return;
        if (stage < STAGES.length - 1) stage++; else { stage = 0; clip = (clip + 1) % CLIPS.length; }
        render(); tick();
      }, DWELL);
    };
    tabs.forEach((b, k) => {
      b.addEventListener('click', () => { stage = k; setAuto(false); render(); });
      b.addEventListener('keydown', (e) => {
        let j = null;
        if (e.key === 'ArrowRight') j = (k + 1) % tabs.length; else if (e.key === 'ArrowLeft') j = (k - 1 + tabs.length) % tabs.length;
        if (j != null) { e.preventDefault(); stage = j; setAuto(false); render(); tabs[j].focus(); }
      });
    });
    clipBtns.forEach((b, i) => {
      b.addEventListener('click', () => { clip = i; stage = 0; render(); setAuto(true); });
      b.addEventListener('keydown', (e) => {
        let j = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') j = (i + 1) % clipBtns.length; else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') j = (i - 1 + clipBtns.length) % clipBtns.length;
        if (j != null) { e.preventDefault(); clip = j; stage = 0; render(); setAuto(true); clipBtns[j].focus(); }
      });
    });
    play.addEventListener('click', () => { if (!auto && stage === STAGES.length - 1) stage = 0; setAuto(!auto); if (auto) render(); });
    again.addEventListener('click', () => { stage = 0; render(); setAuto(true); });

    /* the first tap or key press inside the lab counts as starting it, so the auto-start never overrides a choice */
    ['click', 'keydown'].forEach((t) => host.addEventListener(t, () => { started = true; }, true));
    render();
    if (reduced) { setAuto(false); return; }
    /* start running only when the lab is on screen, and pause while it is off screen */
    auto = false; play.setAttribute('aria-pressed', 'false'); play.innerHTML = `${ic('play')}<span>Play</span>`;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting && !started) { started = true; stage = 0; setAuto(true); render(); }
        else if (!e.isIntersecting && auto) { clearTimeout(timer); host.dataset.paused = '1'; }
        else if (e.isIntersecting && auto && host.dataset.paused) { delete host.dataset.paused; render(); tick(); }
      }), { threshold: 0.35 }).observe(host);
    }
  }

  function init() { [Story, Lab].forEach((f) => { try { f(); } catch (e) { console.error('[how]', f.name, e); } }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
