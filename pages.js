/* Political Intelligence Platform · the site's page list, in reading order.
   One source for three things, so the seven pages cannot drift apart:
     1. the current page in the top nav and in the footer's page links,
     2. the "Where to next" block above every footer,
     3. the reading order itself.
   No new look: the block is built from .sec/.wrap/.head, .rl-card and .ct-tile. */
(function () {
  'use strict';

  /* file, label, icon, one line, the words on the big card's link */
  const PAGES = [
    ['/', 'Home', 'home', 'The whole case in short: four cards, the product working, the cost advantage and how the business grows.', 'Back to the home page'],
    ['/product', 'Product', 'layers', 'What we sell: three apps and an AI analyst, the five people who use them, the paid rounds of an election, and the competition.', 'See the product'],
    ['/how', 'How it works', 'route', 'One interview from a doorstep in Guntur West to a number on a dashboard, and the speech engine behind it.', 'See how it works'],
    ['/demo', 'Live demo', 'play', 'The living map, the AI analyst, and three live demos of the product that open full screen in the page.', 'Open the live demo'],
    ['/trust', 'Trust', 'shield', 'Why it is worth backing: who pays, what each interview earns and costs, the build, the proof and the risks.', 'See why it can be trusted'],
    ['/plan', 'Pricing', 'coins', 'How a client pays, what repeats every year, what it costs to run, the twelve-week build and the market state by state.', 'See the pricing'],
    ['/design-system', 'Design system', 'pen', 'The colours, type, components and motion rules every screen on this site is built from.', 'Open the design system'],
  ];

  const file = (() => {
    /* clean addresses: "/", "/product"… (also accepts an old "/product.html" or "/index.html") */
    const p = location.pathname.replace(/\.html$/, '').replace(/\/+$/, '');
    const n = p.slice(p.lastIndexOf('/') + 1);
    return n === '' || n === 'index' ? '/' : '/' + n;
  })();
  const here = PAGES.findIndex((p) => p[0] === file);
  const ic = (n) => `<svg aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------------- current page, from the list ---------------- */
  function current() {
    if (here < 0) return;
    const mine = PAGES[here][0];
    document.querySelectorAll('#navLinks a, .fg-pages a').forEach((a) => {
      const href = (a.getAttribute('href') || '').split('#')[0];
      if (href === mine) a.setAttribute('aria-current', 'page');
      else if (a.getAttribute('aria-current') === 'page') a.removeAttribute('aria-current');
    });
  }

  /* ---------------- where to next ---------------- */
  function next() {
    const host = document.querySelector('[data-next]');
    if (!host || here < 0) return;
    const nx = PAGES[(here + 1) % PAGES.length];
    const rest = PAGES.filter((p) => p !== nx && p[0] !== PAGES[here][0]);
    const last = here === PAGES.length - 1;

    host.innerHTML = `<div class="wrap">
    <div class="head">
      <h2 class="h2" id="wn-h">Where to next</h2>
      <p class="lead">${last ? 'That is the whole site. Start the argument again from the top, or jump to any page.' : 'The pages read in order, but every one stands on its own.'}</p>
    </div>
    <a class="rl-card wn-big rv" href="${nx[0]}">
      <div class="rl-top">
        <span class="rl-ic">${ic(nx[2])}</span>
        <div><h3>${esc(nx[1])}</h3><p class="who">${last ? 'Back to the beginning' : 'Next in the reading order'}</p></div>
      </div>
      <p class="wn-line">${esc(nx[3])}</p>
      <span class="link-arrow">${esc(nx[4])} ${ic('arrow')}</span>
    </a>
    <div class="ct-grid wn-rest">${rest.map((p) => `<a class="ct-tile" href="${p[0]}"><span class="ring">${ic(p[2])}</span>${esc(p[1])}</a>`).join('')}</div>
  </div>`;
  }

  const go = () => { try { current(); next(); } catch (e) { console.error('[pages]', e); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
