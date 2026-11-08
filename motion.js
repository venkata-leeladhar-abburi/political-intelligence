/* ==========================================================================
   Motion layer · shared by every marketing page (MOTION.md)
   Loads right after core.js and before the section scripts.
   - PI.near(el, fn): build a heavy section once it comes within ~2 viewports,
     or while the browser is idle after load, whichever comes first
   - PI.chunks(steps, done): run work in slices that yield to the browser
   - PI.scrolling(): true while the page is being scrolled (ambient loops rest)
   - PI.scan(root): reveal .rv elements once as they arrive
   - sections that are far off screen pause their CSS animations
   A link to a #section (or a URL with a hash) builds everything at once, so the
   page settles before the browser scrolls to the target.
   ========================================================================== */
(() => {
  'use strict';
  const P = window.PI || (window.PI = {});
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IO = 'IntersectionObserver' in window;
  const idle = (fn, timeout) => ('requestIdleCallback' in window ? window.requestIdleCallback(fn, { timeout }) : setTimeout(fn, 120));

  /* ---------------- slices of work that yield to the browser ---------------- */
  P.task = () => (window.scheduler && window.scheduler.yield ? window.scheduler.yield() : new Promise((r) => setTimeout(r, 0)));
  const flushers = new Set();
  P.eager = location.hash.length > 1;
  P.chunks = (steps, done) => {
    let i = 0, finished = false;
    const finish = () => { if (finished) return; finished = true; flushers.delete(now); if (done) done(); };
    const now = () => { while (i < steps.length) steps[i++](); finish(); };
    if (P.eager) { now(); return; }
    flushers.add(now);
    (async () => {
      while (i < steps.length && !finished) { steps[i++](); if (i < steps.length) await P.task(); }
      finish();
    })();
  };

  /* ---------------- build when near, or when idle ---------------- */
  /* two tiers: within ~2 screens the build waits for an idle moment (so it never lands in the
     middle of a scroll frame); within half a screen it runs at once */
  const pending = new Set();
  P.near = (el, fn, margin = '300% 0px') => {
    if (!el) return;
    const ios = [];
    const job = { el, ran: false, run() { if (job.ran) return; job.ran = true; pending.delete(job); ios.forEach((o) => o.disconnect()); fn(); P.scan(el); } };
    if (P.eager || !IO) { job.run(); return; }
    pending.add(job);
    const watchAt = (m, act) => { const o = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) act(); }, { rootMargin: m }); o.observe(el); ios.push(o); };
    watchAt(margin, () => idle(() => job.run(), 400));
    /* within a screen and a bit: build now, so a section is finished before it scrolls in */
    watchAt('120% 0px', () => job.run());
  };
  const flush = () => { [...pending].forEach((j) => j.run()); [...flushers].forEach((f) => f()); };
  P.flush = flush;
  /* after load, build what is left top to bottom, one piece per idle period */
  const drain = () => {
    const next = [...pending].sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))[0];
    if (next) idle(() => { next.run(); drain(); }, 1200);
  };
  const afterLoad = (fn) => (document.readyState === 'complete' ? setTimeout(fn, 300) : window.addEventListener('load', () => setTimeout(fn, 300), { once: true }));
  afterLoad(drain);
  /* an in-page link needs final positions before the browser scrolls */
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href*="#"]');
    if (a && a.hash.length > 1 && a.pathname === location.pathname) flush();
  }, true);

  /* ---------------- is the page being scrolled right now? ---------------- */
  let scrollT = 0, moving = false;
  window.addEventListener('scroll', () => { moving = true; clearTimeout(scrollT); scrollT = setTimeout(() => { moving = false; passed(); }, 160); }, { passive: true });
  P.scrolling = () => moving;
  /* anything a jump or a fling skipped is shown already, so scrolling back up never waits for it */
  function passed() {
    if (!rio) return;
    document.querySelectorAll('.rv:not(.in)').forEach((el) => {
      if (seen.has(el) && el.getBoundingClientRect().bottom < 0) { el.classList.add('in'); rio.unobserve(el); }
    });
  }

  /* ---------------- reveals: one observer for the whole page ---------------- */
  const rio = IO && !reduced ? new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); rio.unobserve(e.target);
  }), { rootMargin: '0px 0px -2% 0px', threshold: 0 }) : null;
  const seen = new WeakSet();
  P.scan = (root = document) => {
    const fresh = [...root.querySelectorAll('.rv:not(.in)')].filter((el) => !seen.has(el));
    /* read every size first, then write: one layout pass */
    const big = fresh.map((el) => !el.classList.contains('rv-t') && el.offsetHeight > 460);
    fresh.forEach((el, k) => {
      seen.add(el);
      if (big[k]) el.classList.add('rv-m');
      if (rio) rio.observe(el); else el.classList.add('in');
    });
  };
  /* section heads rise line by line: headline, then lead */
  const tagHeads = () => {
    document.querySelectorAll('main section .head, main section .per-head, main section .dsx-head, main section .ribbons-head').forEach((h) => {
      [...h.children].forEach((c, k) => {
        if (c.classList.contains('rv')) return;
        c.classList.add('rv', 'rv-t');
        if (!c.style.getPropertyValue('--d')) c.style.setProperty('--d', `${k * 90}ms`);
      });
    });
  };

  /* the main blocks of a section rise after its head. Skipped: blocks that already reveal
     themselves or their children, anything with its own transform or positioning, the page
     heroes (they open with their own CSS intro) and the sections GSAP owns (journey, apps) */
  const tagBlocks = () => {
    const blocks = [];
    document.querySelectorAll('main > section:not(.hero):not(.ph):not(#how):not(#apps)').forEach((s) => {
      s.querySelectorAll(':scope > .wrap, :scope > .sheet > .wrap').forEach((w) => {
        [...w.children].forEach((c) => {
          if (c.matches('.head, .per-head, .dsx-head, .rv, .sr, script, style') || c.querySelector('.rv')) return;
          blocks.push(c);
        });
      });
    });
    const ok = blocks.map((c) => { const cs = getComputedStyle(c); return cs.transform === 'none' && cs.position !== 'absolute' && cs.position !== 'fixed' && cs.display !== 'contents' && cs.display !== 'none'; });
    let k = 0, last = null;
    blocks.forEach((c, i) => {
      if (!ok[i]) return;
      if (c.parentElement !== last) { last = c.parentElement; k = 0; }
      c.classList.add('rv');
      if (!c.style.getPropertyValue('--d')) c.style.setProperty('--d', `${Math.min(k++, 3) * 80}ms`);
    });
  };

  /* ---------------- far-off sections rest ---------------- */
  const rest = () => {
    if (!IO) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) e.target.removeAttribute('data-off'); else e.target.setAttribute('data-off', '');
    }), { rootMargin: '40% 0px' });
    document.querySelectorAll('main > section, body > footer').forEach((s) => io.observe(s));
  };

  const ready = () => {
    tagHeads();
    tagBlocks();
    rest();
    /* embedded figures (iframe data-src) load in an idle moment before they arrive */
    document.querySelectorAll('iframe[data-src]').forEach((f) => P.near(f, () => { f.src = f.dataset.src; }));
    /* after every section script has built its markup */
    setTimeout(() => P.scan(), 0);
    afterLoad(() => P.scan());
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
