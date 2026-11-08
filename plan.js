/* Political Intelligence Platform · Pricing (plan.html), prefix pl-.
   - Charges + first-year estimate (#engage): development, support per round × rounds (editable),
     interviews per round (editable) × rounds × rate. The right side shows year one, its split as one
     three-part bar, and what recurs every year after. Amounts are typed in the Indian system (inr.js).
   - The market opening up (#plStairs): a staircase of seats, state by state.
   The old sections.js Engage() no longer runs here (its #inc host is gone). */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const ic = (n) => `<svg aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const N = (v) => { const d = String(v == null ? '' : v).replace(/[^\d]/g, ''); return d ? +d : null; };
  const IN = (n) => Math.round(n).toLocaleString('en-IN');
  const RS = (n) => `₹${IN(n)}`;

  const INC = ['Field App for Android, works offline', 'Command Center for admins and supervisors', 'Client Portal on laptop and phone', 'Our own Telugu speech engine', 'Issue-level sentiment AI', 'Ask the Data AI analyst', 'Live district and seat map', 'Analytics and round comparison', 'Fraud Shield and quality checks', 'Reports in Telugu and English', 'Sampling plan and questionnaire', 'Consent and data-law compliance', 'Security and India hosting', 'A field pilot in two or three seats', 'Training for agents and admins', 'Launch and handover support'];

  function Engage() {
    const host = $('#engage');
    if (!host || !$('#plInc')) return;
    $('#plInc').innerHTML = INC.map((t) => `<li>${ic('check')}<span>${t}</span></li>`).join('');
    const dev = $('#fDev'), sup = $('#fSup'), rIn = $('#eRounds'), ivIn = $('#eIvR');
    let ppi = 8;
    const rounds = () => Math.max(1, Math.min(24, N(rIn.value) || 1));
    function update() {
      const d = N(dev.value), s = N(sup.value), r = rounds(), per = N(ivIn.value) || 0;
      const ivN = per * r, ivTot = ivN * ppi, supTot = (s || 0) * r;
      $('#eRn').textContent = r;
      $('#eIvN').textContent = IN(ivN);
      $('#eDev').textContent = d != null ? RS(d) : 'Not entered';
      $('#eSup').textContent = s != null ? RS(supTot) : 'Not entered';
      $('#eIv').textContent = RS(ivTot);
      const total = (d || 0) + supTot + ivTot;
      $('#eTot').textContent = RS(total);
      const left = (d == null ? 1 : 0) + (s == null ? 1 : 0);
      $('#eLeft').textContent = left ? `So far: ${left === 1 ? 'one amount' : 'two amounts'} still to enter` : 'All three charges included';
      $('#eRec').textContent = RS(supTot + ivTot);
      /* the split of year one, as one bar in three parts */
      const parts = [d || 0, supTot, ivTot];
      $$('.pl-split i', host).forEach((el, k) => { el.style.flexGrow = total ? parts[k] / total : (k === 2 ? 1 : 0); el.title = ['Development', 'Support', 'Interviews'][k]; });
    }
    [dev, sup, ivIn, rIn].forEach((el) => el.addEventListener('input', update));
    rIn.addEventListener('blur', () => { rIn.value = rounds(); update(); });
    ivIn.addEventListener('blur', () => { if (!N(ivIn.value)) ivIn.value = '35,000'; update(); });
    $$('[data-step]', host).forEach((b) => b.addEventListener('click', () => { rIn.value = Math.max(1, Math.min(24, rounds() + +b.dataset.step)); update(); }));
    $('#ppi').addEventListener('click', (e) => {
      const b = e.target.closest('[data-v]'); if (!b) return;
      ppi = +b.dataset.v;
      $$('#ppi [data-v]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      update();
    });
    update();
  }

  /* the market, one step at a time: seats added and the running total */
  const STEPS = [
    ['Launch', 'Andhra Pradesh', 'Telugu', 175],
    ['2028', 'Telangana', 'Telugu', 119],
    ['2028', 'Karnataka', 'Kannada', 224],
    ['2028', 'Madhya Pradesh, Rajasthan, Chhattisgarh', 'Hindi', 520],
    ['2029', 'Lok Sabha', 'Every language', 543],
  ];
  function Stairs() {
    const el = $('#plStairs');
    if (!el) return;
    let sum = 0;
    const rows = STEPS.map(([when, name, lang, add]) => { sum += add; return { when, name, lang, add, sum }; });
    const max = sum;
    el.innerHTML = `<ol>${rows.map((r, k) => `<li style="--h:${(r.sum / max).toFixed(4)};--k:${k}"${k === 0 ? ' class="is-now"' : ''}>
      <div class="pl-col"><div class="pl-num"><b>${IN(r.sum)}</b><span>seats</span></div><div class="pl-bar"></div></div>
      <div class="pl-meta"><span class="pl-sw">${r.when}</span><h3>${r.name}</h3><p><span class="pl-lang">${r.lang}</span><span>+${IN(r.add)} seats</span></p></div>
    </li>`).join('')}</ol>`;
  }

  function init() { [Engage, Stairs].forEach((f) => { try { f(); } catch (e) { console.error('[plan]', f.name, e); } }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
