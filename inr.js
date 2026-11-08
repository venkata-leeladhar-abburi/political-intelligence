/* Political Intelligence Platform · Indian number entry, everywhere.
   Any <input data-inr> (and the running-cost amounts, data-f="amt") is written in the Indian
   system while you type: 1,00,000 · 12,50,000 · 1,20,00,000. Only digits are kept, the caret stays
   after the same digit, and window.PIinr.parse(value) gives the number back.
   <input data-int> keeps whole numbers only, without grouping (rounds, counts under 1,000). */
(function () {
  'use strict';
  const group = (digits) => {
    if (!digits) return '';
    const n = digits.replace(/^0+(?=\d)/, '');
    if (n.length <= 3) return n;
    const last3 = n.slice(-3), rest = n.slice(0, -3);
    return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
  };
  const parse = (v) => { const d = String(v == null ? '' : v).replace(/[^\d]/g, ''); return d ? +d : null; };
  const isInr = (el) => el && el.tagName === 'INPUT' && (el.hasAttribute('data-inr') || el.dataset.f === 'amt');
  const isInt = (el) => el && el.tagName === 'INPUT' && el.hasAttribute('data-int');

  function reformat(el) {
    const raw = el.value, caret = el.selectionStart == null ? raw.length : el.selectionStart;
    const before = raw.slice(0, caret).replace(/[^\d]/g, '').length;
    const out = isInr(el) ? group(raw.replace(/[^\d]/g, '')) : raw.replace(/[^\d]/g, '');
    if (out === raw) return;
    el.value = out;
    /* put the caret back after the same number of digits */
    let pos = 0, seen = 0;
    while (pos < out.length && seen < before) { if (/\d/.test(out[pos])) seen++; pos++; }
    try { el.setSelectionRange(pos, pos); } catch (e) { /* some input types refuse selection */ }
  }
  /* capture phase: the value is tidy before any page script reads it on the same event */
  document.addEventListener('input', (e) => { if (isInr(e.target) || isInt(e.target)) reformat(e.target); }, true);
  document.addEventListener('focusin', (e) => {
    const el = e.target;
    if ((isInr(el) || isInt(el)) && !el.getAttribute('inputmode')) el.setAttribute('inputmode', 'numeric');
  });
  window.PIinr = { group: (n) => group(String(Math.round(+n || 0))), parse };
})();
