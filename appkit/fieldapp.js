/* Political Intelligence Platform · Field App (Field Surveyor role)
   A working phone prototype: day screen, consent, respondent details filled by AI from the voter's
   spoken answer (the agent corrects), questions, a recorded open answer, secret ballot, submit.
   Beside it: what the Command Center sees at each step. */
(function () {
  'use strict';
  const M = window.M, U = window.U, V = window.V;
  const { $, $$, ic, esc } = U;

  const STEPS = [
    ['Start the day', 'Target, booth, sync and location sharing'],
    ['Consent', 'Read out, voter agrees on the recording'],
    ['Respondent details', 'Voter answers once, AI fills the form, agent checks'],
    ['Questions', 'Big tap answers, Telugu first'],
    ['Voice answer', 'Open question recorded in the voter’s words'],
    ['Secret ballot', 'Phone handed over; the agent cannot see'],
    ['Submit', 'Checks run on the phone, saved encrypted, synced'],
  ];
  const FIELDS = [
    ['name', 'పేరు · Name (optional)', 'Lakshmi', 0.97], ['age', 'వయసు · Age', '46', 0.95], ['gender', 'లింగం · Gender', 'Female', 0.62],
    ['job', 'వృత్తి · Occupation', 'Tailoring (self-employed)', 0.91], ['edu', 'చదువు · Education', 'Class 10', 0.88], ['area', 'ప్రాంతం · Ward or village', 'Brodipet, Ward 9', 0.93],
    ['hh', 'ఇంట్లో ఎంతమంది · Household size', '5', 0.71], ['scheme', 'పథకం · Scheme received', 'Pension (mother-in-law)', 0.84],
  ];

  V.fieldapp = function (el) {
    const st = { step: 0, rec: 0, filled: false, edits: {}, ans: {}, voice: 0, vote: null, done: 18 };
    el.innerHTML = `${V.head('Field App', 'What a Field Surveyor uses all day: offline, Telugu first, one thumb, in the sun. Try it; every step works.', '<span class="badge">Android · works offline</span>')}
      <div class="fa"><div class="phone" aria-label="Field App on an Android phone"><div class="screen" id="faScr"></div></div>
      <div class="fa-side"><div class="card"><div class="card-h"><h3>One interview</h3><span class="badge accent" id="faCt">Step 1 of 7</span></div><div class="fa-steps" id="faSteps"></div></div><div class="card" id="faCC"></div></div></div>`;
    const scr = $('#faScr', el);
    const bar = () => `<div class="sb"><span>11:42</span><span>${st.step === 6 ? ic('upload') : ''}<span class="achip ok" style="height:20px;padding:0 7px;font-size:11px">${ic('locate')}Sharing</span>${ic('signal')}${ic('battery')}</span></div>`;
    const head = (t, s, back = true) => `<div class="ap-h">${back ? `<button type="button" data-a="back" aria-label="Back">${ic('back')}</button>` : `<span class="av warm" style="width:36px;height:36px">RK</span>`}<div><b>${t}</b><small>${s}</small></div></div>`;
    const screens = [
      () => `${bar()}${head('నమస్తే, రవి', 'Ravi K. · FA-2400', false)}<div class="ap-b">
          <div class="acard dark"><div class="row"><small>ఈ రోజు · Today</small><small>Round 3</small></div><b style="font-size:30px">${st.done} <span style="font-size:16px;opacity:.7">/ 25</span></b><div class="aprog"><i style="width:${(st.done / 25) * 100}%"></i></div><small>${25 - st.done} more to reach today’s target · ₹${st.done * 40} earned</small></div>
          <div class="acard"><div class="row"><b>Booth 112 · Brodipet</b><span class="achip ok">${ic('check')}Inside fence</span></div><small>Guntur West · Govt High School, Room 2 · 40 m away</small><div class="row"><span class="achip">${ic('user')}Quota left: women 41–60 · 3</span></div></div>
          <div class="acard"><div class="row"><b>Waiting to sync</b><span class="achip">0</span></div><small>All 18 interviews are on the server. Works offline if the network drops.</small></div>
          <div class="acard"><div class="row"><b>Location sharing</b><span class="achip ok">On · duty hours</span></div><small>Your supervisor sees where you are until 7 pm. It switches off by itself.</small></div></div>
        <div class="ap-f"><button type="button" class="abtn warm" data-a="next">${ic('plus')}కొత్త ఇంటర్వ్యూ · New interview</button></div>`,
      () => `${bar()}${head('అనుమతి · Consent', 'Read this aloud')}<div class="ap-b"><div class="acard"><p class="te" lang="te" style="margin:0;font-size:16px;line-height:1.7">నమస్తే. మేము మీ ప్రాంతంలోని సమస్యల గురించి ఒక సర్వే చేస్తున్నాము. సుమారు 10 నిమిషాలు పడుతుంది. మీ మాటలు రికార్డ్ అవుతాయి కానీ మీ పేరు ఎవరికీ చూపించము. మీరు ఎప్పుడైనా ఆపవచ్చు. కొనసాగించమంటారా?</p><small>Survey on local issues, about 10 minutes. The voice is recorded but the name is never shown. The voter can stop at any time.</small></div>
          <div class="acard"><div class="row"><b>Voter said “సరే” (yes)</b><span class="achip ok">${ic('mic')}0:03 recorded</span></div><small>Consent is part of the clip. No consent, no interview.</small></div>
          <div class="acard"><div class="row"><span class="achip ok">${ic('pin')}Booth 112 · 40 m</span><span class="achip ok">${ic('clock')}11:42</span><span class="achip ok">${ic('shield')}Real GPS</span></div></div></div>
        <div class="ap-f"><button type="button" class="abtn" data-a="next">${ic('check')}అంగీకరించారు · Voter agreed</button><button type="button" class="abtn line" data-a="home">Voter declined</button></div>`,
      () => {
        const recBtn = `<div class="rec"><button type="button" class="mic${st.rec === 1 ? ' on' : ''}" data-a="rec" aria-label="${st.rec === 1 ? 'Recording' : 'Record the voter'}">${ic('mic')}</button><div class="wave" aria-hidden="true">${U.waves(30, 5).replace(/<i /g, st.rec === 1 ? '<i class="p" ' : '<i ')}</div><small style="text-align:center;opacity:.8" class="te" lang="te">${st.rec === 1 ? 'వింటోంది… · Listening' : '“మీ పేరు, వయసు, పని, ఊరు, ఇంట్లో ఎంతమంది?”'}</small></div>`;
        const form = st.filled ? FIELDS.map(([k, l, v, c]) => { const val = st.edits[k] != null ? st.edits[k] : v; const ed = st.edits[k] != null && st.edits[k] !== v; const low = c < 0.8 && !ed; return `<div class="af${low ? ' low' : ''}"><label for="af-${k}"><span>${l}</span><span class="achip ${ed ? 'ed' : 'ai'}" style="height:20px;font-size:10.5px">${ed ? 'Edited' : low ? 'Check · AI ' + Math.round(c * 100) + '%' : 'AI ' + Math.round(c * 100) + '%'}</span></label>${k === 'gender' ? `<select id="af-${k}" data-f="${k}">${['Female', 'Male', 'Other', 'Prefer not to say'].map((o) => `<option${o === val ? ' selected' : ''}>${o}</option>`).join('')}</select>` : `<input id="af-${k}" data-f="${k}" value="${esc(val)}"${k === 'age' || k === 'hh' ? ' inputmode="numeric"' : ''}>`}</div>`; }).join('') : '';
        return `${bar()}${head('వివరాలు · Details', st.filled ? 'AI filled this. Fix anything wrong.' : 'Ask once, AI fills the form')}<div class="ap-b">${st.filled ? `<div class="acard" style="background:#f4f1f8;box-shadow:none"><small class="te" lang="te">“నా పేరు లక్ష్మి, నలభై ఆరు ఏళ్ళు, టైలరింగ్ చేస్తాను, బ్రోడిపేట లో ఉంటాం, ఇంట్లో ఐదుగురు.”</small></div>${form}` : recBtn}</div>
          <div class="ap-f">${st.filled ? `<button type="button" class="abtn" data-a="next">${ic('check')}వివరాలు సరైనవి · Details are right</button>` : `<button type="button" class="abtn line" data-a="manual">Type instead</button>`}</div>`;
      },
      () => {
        const Q = [['q3', 'ప్రభుత్వ పనితీరు పై మీకు ఎంత సంతృప్తి?', 'How satisfied are you with the state government?'], ['q6', 'మీ MLA పని ఎలా ఉంది?', 'How is your MLA doing?']];
        const opts = [['5', 'చాలా బాగుంది · Very good'], ['4', 'బాగుంది · Good'], ['3', 'పర్వాలేదు · Okay'], ['2', 'బాగాలేదు · Poor'], ['1', 'అస్సలు బాగాలేదు · Very poor']];
        return `${bar()}${head('ప్రశ్నలు · Questions', '4 of 24 · tap the voter’s answer')}<div class="ap-b">${Q.map(([k, te, en]) => `<div class="acard" style="box-shadow:none;padding:0;background:none"><b class="te" lang="te" style="font-size:17px">${te}</b><small>${en}</small></div><div class="ans" role="group" aria-label="${esc(en)}">${opts.map(([v, l]) => `<button type="button" data-q="${k}" data-v="${v}" aria-pressed="${st.ans[k] === v}"><span>${l}</span>${st.ans[k] === v ? ic('check') : ''}</button>`).join('')}</div>`).join('')}</div>
          <div class="ap-f"><button type="button" class="abtn" data-a="next"${Object.keys(st.ans).length < 2 ? ' disabled style="opacity:.4"' : ''}>${ic('arrow')}తర్వాత · Next</button></div>`;
      },
      () => `${bar()}${head('మీ మాటల్లో · In their words', 'Open question 1 of 3')}<div class="ap-b"><div class="acard" style="box-shadow:none;padding:0;background:none"><b class="te" lang="te" style="font-size:17px">మీ ప్రాంతంలో ఇప్పుడు అతిపెద్ద సమస్య ఏమిటి?</b><small>What is the biggest problem in your area right now?</small></div>
          <div class="rec"><button type="button" class="mic${st.voice === 1 ? ' on' : ''}" data-a="voice" aria-label="${st.voice === 1 ? 'Recording' : 'Record the answer'}">${ic(st.voice === 2 ? 'check' : 'mic')}</button><div class="wave" aria-hidden="true">${U.waves(30, 9).replace(/<i /g, st.voice ? '<i class="p" ' : '<i ')}</div><small style="opacity:.8">${st.voice === 0 ? 'Tap and let the voter speak' : st.voice === 1 ? 'Recording… 0:09' : 'Saved · 0:14 · clear audio'}</small></div>
          ${st.voice === 2 ? `<div class="acard"><small>What the phone heard</small><p class="te" lang="te" style="margin:0;font-size:15.5px;line-height:1.6">${esc(M.SAYINGS[0].te)}</p><span class="achip ok">${ic('check')}Clip clear enough to transcribe</span></div>` : ''}</div>
        <div class="ap-f"><button type="button" class="abtn" data-a="next"${st.voice < 2 ? ' disabled style="opacity:.4"' : ''}>${ic('arrow')}తర్వాత · Next</button></div>`,
      () => `${bar()}${head('రహస్య ఓటు · Secret ballot', 'Give the phone to the voter')}<div class="ap-b"><div class="acard dark"><b class="te" lang="te" style="font-size:17px">ఈ రోజు ఎన్నికలు జరిగితే మీరు ఎవరికి ఓటు వేస్తారు?</b><small>If the election were held today, whom would you vote for? The agent cannot see this screen.</small></div>
          <div class="ballot" role="group" aria-label="Vote">${['Party A', 'Party B', 'Party C', 'Others', 'Not decided', 'Won’t say'].map((p) => `<button type="button" data-vote="${p}" aria-pressed="${st.vote === p}">${st.vote && st.vote !== p ? '•••' : p}</button>`).join('')}</div>${st.vote ? `<div class="acard"><span class="achip ok">${ic('lock')}Locked and encrypted</span><small>Hand the phone back. The choice is hidden on this device.</small></div>` : ''}</div>
        <div class="ap-f"><button type="button" class="abtn" data-a="next"${st.vote ? '' : ' disabled style="opacity:.4"'}>${ic('check')}Done · ఫోన్ తిరిగి ఇవ్వండి</button></div>`,
      () => `${bar()}${head('సమర్పించండి · Submit', 'IV-481239 · 9 min 41 s')}<div class="ap-b"><div class="acard">${[['Inside the booth fence (40 m)', 1], ['Long enough (9 min 41 s)', 1], ['Consent in the recording', 1], ['Real GPS, no mock apps', 1], ['Answers not rushed', 1]].map(([t]) => `<div class="row"><span>${t}</span><span class="achip ok" style="height:24px">${ic('check')}</span></div>`).join('')}<small>Voice, same-voice and tone checks run on the server after sync.</small></div>
          <div class="acard dark"><div class="row"><b>Saved and encrypted</b>${ic('lock')}</div><small>Syncing now. If there is no network it waits and retries.</small><div class="aprog"><i style="width:100%"></i></div></div></div>
        <div class="ap-f"><button type="button" class="abtn warm" data-a="finish">${ic('plus')}Next voter · ${st.done + 1}/25</button></div>`,
    ];
    const cc = [
      () => ['Supervisor’s live map', `Ravi is a white dot inside Booth 112’s 250 m fence in Brodipet. If he leaves it or a mock-location app appears, the dot turns red and the supervisor is alerted.`, ['Location only 8 am – 7 pm', 'Battery 64%', 'Last ping now']],
      () => ['Consent stored with the clip', 'The 3-second “yes” is kept with the interview. A reviewer can play it; an interview without it fails the consent check.', ['Consent check', 'Booth fence 40 m', 'Time 11:42']],
      () => ['Respondent profile', `The voter answers once in Telugu. The speech engine pulls name, age, work, area and household size into the form. Fields under 80% confidence are marked for the agent to check, and every edit is logged. Names and phones are stored apart and masked for analysts.`, ['AI filled 8 fields', `${Object.keys(st.edits).length} edited by agent`, 'PII stored separately']],
      () => ['Answers arrive as tapped', 'Scales and choices sync as numbers. Taps faster than a person can read are flagged as rushed.', ['Answer-pattern check', 'Question v3.0', 'Telugu wording tested']],
      () => ['Tone and sarcasm, on the server', `This clip says “Oh wow, our roads are wonderful! When it rains we can go by boat.” The words are positive; the engine hears the flat tone, the laugh and the flood image, checks the voter’s 1/5 road rating, and scores it <b>negative about Roads</b> at 91% confidence. Between 40% and 75% it would go to a person.`, ['Sarcasm 91%', 'Scored negative', 'Kept with evidence']],
      () => ['Secret ballot', 'The vote is encrypted on the phone and never shown to the agent or the supervisor. Only weighted totals of 100 or more interviews ever appear on a dashboard.', ['Encrypted on device', 'Agent can’t see', 'Minimum n = 100']],
      () => ['Verification queue', 'On arrival it runs the last four checks (same voice, transcript confidence, tone, travel speed). Clean interviews go straight to dashboards; anything unsure waits for a reviewer.', ['5 checks on phone', '4 on server', 'Back-check call 10%']],
    ];
    const draw = () => {
      scr.innerHTML = screens[st.step]();
      $('#faCt', el).textContent = `Step ${st.step + 1} of 7`;
      $('#faSteps', el).innerHTML = STEPS.map(([t, s], i) => `<button type="button" class="fa-step${i < st.step ? ' done' : ''}" data-s="${i}"${i === st.step ? ' aria-current="step"' : ''}><i>${i < st.step ? '✓' : i + 1}</i><span><b>${t}</b><small>${s}</small></span></button>`).join('');
      const [t, b, chips] = cc[st.step]();
      $('#faCC', el).innerHTML = `<div class="card-h"><div><h3>${t}</h3><p>What the Command Center sees</p></div><span class="badge ai">Command Center</span></div><p style="margin:0 0 14px;color:var(--ink-2);line-height:1.6">${b}</p><div class="acts">${chips.map((c) => `<span class="badge">${c}</span>`).join('')}</div>`;
      $$('[data-s]', el).forEach((x) => x.addEventListener('click', () => { st.step = +x.dataset.s; if (st.step >= 2) st.filled = true; if (st.step >= 3 && Object.keys(st.ans).length < 2) st.ans = { q3: '2', q6: '3' }; if (st.step >= 5) st.voice = 2; draw(); }));
      wire();
    };
    function wire() {
      const on = (a, fn) => { const b = $(`[data-a="${a}"]`, scr); if (b) b.addEventListener('click', fn); };
      on('next', () => { if (st.step < 6) { st.step++; draw(); } });
      on('back', () => { if (st.step > 0) { st.step--; draw(); } });
      on('home', () => { st.step = 0; draw(); U.toast('Logged as declined. It counts toward the response rate, not the target.'); });
      on('finish', () => { st.done++; Object.assign(st, { step: 0, rec: 0, filled: false, edits: {}, ans: {}, voice: 0, vote: null }); draw(); U.toast('Interview synced. 9 checks queued on the server.'); });
      on('rec', () => { if (st.rec) return; st.rec = 1; draw(); setTimeout(() => { st.rec = 2; st.filled = true; if (st.step === 2) draw(); }, U.reduced ? 50 : 1600); });
      on('manual', () => { st.filled = true; draw(); });
      on('voice', () => { if (st.voice) return; st.voice = 1; draw(); setTimeout(() => { st.voice = 2; if (st.step === 4) draw(); }, U.reduced ? 50 : 1500); });
      $$('[data-q]', scr).forEach((b) => b.addEventListener('click', () => { st.ans[b.dataset.q] = b.dataset.v; const keep = scr.querySelector('.ap-b').scrollTop; draw(); scr.querySelector('.ap-b').scrollTop = keep; }));
      $$('[data-vote]', scr).forEach((b) => b.addEventListener('click', () => { if (!st.vote) { st.vote = b.dataset.vote; draw(); } }));
      $$('[data-f]', scr).forEach((f) => f.addEventListener('change', () => { st.edits[f.dataset.f] = f.value; const keep = scr.querySelector('.ap-b').scrollTop; draw(); scr.querySelector('.ap-b').scrollTop = keep; }));
    }
    draw();
  };
})();
