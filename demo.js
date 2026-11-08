/* Political Intelligence Platform · Live demo page: the full-screen demo viewer.
   Anything with data-demo-open="command|portal|field" (and an optional
   data-demo-path, a page inside that app such as "map") opens #ldm.
   Each app gets one iframe, built the first time it is opened and then kept,
   so switching demos is instant and every app remembers where you were.
   The address bar follows the viewer (#demo-command …), so a link can open a
   demo directly and the browser's Back button closes it. */
(function () {
  'use strict';

  const DEMOS = {
    command: { name: 'Command Center', src: 'app.html?role=command' },
    portal: { name: 'Client Portal', src: 'portal.html' },
    field: { name: 'Field App', src: 'app.html?role=field', path: 'fieldapp' },
  };

  const dv = document.getElementById('ldm');
  if (!dv) return;
  const box = document.getElementById('ldmFrame');
  const tabs = Array.from(dv.querySelectorAll('[data-ldm-tab]'));
  const loadName = dv.querySelector('.ldm-load b');
  const newTab = document.getElementById('ldmNew');
  const closeBtn = document.getElementById('ldmClose');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const frames = {};
  let cur = 'command', opener = null, pushed = false, hideT = 0;

  const isOpen = () => dv.classList.contains('is-open');
  const outside = () => ['main', 'nav', 'footer'].map((id) => document.getElementById(id)).concat(document.querySelector('.skip')).filter(Boolean);
  const url = (k, path) => DEMOS[k].src + ((path || DEMOS[k].path) ? '#' + (path || DEMOS[k].path) : '');

  function frame(k, path) {
    let f = frames[k];
    if (!f) {
      f = document.createElement('iframe');
      f.className = 'ldm-if';
      f.title = DEMOS[k].name + ', running live';
      f.addEventListener('load', () => { f.dataset.ready = '1'; if (cur === k) dv.classList.remove('is-loading'); });
      f.src = url(k, path);
      box.appendChild(f);
      frames[k] = f;
    } else if (path) {
      try { f.contentWindow.location.hash = path; } catch (e) { f.src = url(k, path); }
    }
    return f;
  }

  function show(k, path) {
    cur = DEMOS[k] ? k : 'command';
    const f = frame(cur, path);
    Object.keys(frames).forEach((n) => {
      const on = n === cur;
      frames[n].classList.toggle('is-on', on);
      frames[n].tabIndex = on ? 0 : -1;
      if (on) frames[n].removeAttribute('aria-hidden'); else frames[n].setAttribute('aria-hidden', 'true');
    });
    tabs.forEach((t) => {
      const on = t.dataset.ldmTab === cur;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    dv.classList.toggle('is-loading', !f.dataset.ready);
    loadName.textContent = DEMOS[cur].name;
    dv.setAttribute('aria-label', 'Live demo: ' + DEMOS[cur].name);
    newTab.href = url(cur);
  }

  /* the address bar: one history entry for the whole visit to the viewer,
     so Back closes it however many times the visitor switched demos */
  const fromHash = () => { const m = /^#demo-(\w+)$/.exec(location.hash); return m && DEMOS[m[1]] ? m[1] : null; };
  function syncHash(first) {
    const h = '#demo-' + cur;
    if (location.hash === h) return;
    if (first && !fromHash()) { history.pushState(null, '', h); pushed = true; }
    else history.replaceState(null, '', h);
  }

  function open(k, path, from) {
    if (isOpen()) { show(k, path); syncHash(false); return; }
    opener = from || document.activeElement;
    show(k, path);
    clearTimeout(hideT);
    dv.hidden = false;
    document.documentElement.classList.add('ldm-lock');
    outside().forEach((el) => { el.inert = true; });
    void dv.offsetWidth; // start the entrance from its first frame
    dv.classList.add('is-open');
    syncHash(true);
    const t = tabs.find((x) => x.dataset.ldmTab === cur) || closeBtn;
    t.focus({ preventScroll: true });
  }

  function close(viaHistory) {
    if (!isOpen()) return;
    dv.classList.remove('is-open');
    document.documentElement.classList.remove('ldm-lock');
    outside().forEach((el) => { el.inert = false; });
    hideT = setTimeout(() => { if (!isOpen()) dv.hidden = true; }, reduced.matches ? 0 : 220);
    if (!viaHistory) {
      if (pushed) { pushed = false; history.back(); }
      else history.replaceState(null, '', location.pathname + location.search + '#demos');
    } else pushed = false;
    if (opener && typeof opener.focus === 'function' && document.contains(opener)) opener.focus({ preventScroll: true });
  }

  /* launchers anywhere on the page */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-demo-open]');
    if (!b || dv.contains(b)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey) return; // let a modified click on a link open its own tab
    e.preventDefault();
    open(b.dataset.demoOpen, b.dataset.demoPath, b.closest('article') ? b.closest('article').querySelector('.ldm-go') : b);
  });

  /* the switcher: click, or arrow keys along the tabs */
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => { show(t.dataset.ldmTab); syncHash(false); });
    t.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1, Home: -99, End: 99 }[e.key];
      if (!d) return;
      e.preventDefault();
      const n = Math.max(0, Math.min(tabs.length - 1, Math.abs(d) === 99 ? (d > 0 ? tabs.length - 1 : 0) : (i + d + tabs.length) % tabs.length));
      tabs[n].focus(); show(tabs[n].dataset.ldmTab); syncHash(false);
    });
  });

  /* "New tab" opens the app exactly where the visitor is inside it */
  newTab.addEventListener('click', () => {
    try { const f = frames[cur]; if (f && f.contentWindow) newTab.href = f.contentWindow.location.href; } catch (e) { /* keep the default */ }
  });
  closeBtn.addEventListener('click', () => close(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) { e.preventDefault(); close(false); } });

  window.addEventListener('popstate', () => {
    const k = fromHash();
    if (k) { if (isOpen()) show(k); else { pushed = false; open(k); } }
    else close(true);
  });

  /* a link straight to a demo (demo.html#demo-portal) opens it over the launcher */
  const first = fromHash();
  if (first) {
    open(first);
    window.addEventListener('load', () => { const s = document.getElementById('demos'); if (s) s.scrollIntoView({ block: 'start' }); }, { once: true });
  }
})();
