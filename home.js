/* Political Intelligence Platform · Home page (index.html), prefix hm-.
   Two investor sections drawn with the shared garden kit (garden.js):
   - #hmPitch: the whole case in four cards, each with its own small garden
     (problem: voices nobody can check · product: the verified voice · who pays: four buyers · economics: one tall bloom)
   - #hmGrow: the roadmap as a garden that grows taller from today to India, one plant per milestone. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const G = window.PIGarden;
  const near = (el, fn) => { if (!el) return; if (window.PI && typeof window.PI.near === 'function') window.PI.near(el, fn); else fn(); };

  /* each card's garden on a 400 × 240 ground */
  const ARTS = [
    { /* the problem: voices still typing, nobody can check them; no ring, no glow of proof */
      plants: [
        { k: 'pod', x: 92, t: [70, 150], b: -16, f: 0, g: 'dots', w: 92, h: 58, lv: [[0.22, 1, 0.5, 58]] },
        { k: 'pod', x: 214, t: [206, 108], b: 14, f: 0, g: 'dots', w: 100, h: 62, lv: [[0.16, -1, 0.6, 62], [0.5, 1, 0.36, 52]] },
        { k: 'orb', x: 336, t: [340, 170], b: 16, s: 0.9, ring: false, lv: [[0.3, -1, 0.42, 54]] },
      ], dust: [[40, 70, 5, 2], [330, 60, 4, 3]] },
    { /* the product: a voice, verified */
      plants: [
        { k: 'pod', x: 112, t: [86, 134], b: -18, f: 1, g: 'wave', w: 104, h: 64, lv: [[0.18, 1, 0.56, 60], [0.52, -1, 0.34, 50]] },
        { k: 'orb', x: 286, t: [284, 150], b: 14, s: 1.45, g: 'check', lv: [[0.18, -1, 0.6, 62], [0.5, 1, 0.36, 52]] },
      ], sprigs: [{ x: 210, t: [206, 110], b: 12 }], dust: [[40, 60, 5, 0], [370, 70, 6, 3], [200, 40, 3, 1]] },
    { /* who pays: four buyers, four plants */
      plants: [
        { k: 'bloom', x: 70, t: [66, 140], b: -10, s: 0.56, rot: 4, lv: [[0.2, 1, 0.42, 58]] },
        { k: 'pod', x: 160, t: [140, 116], b: -12, f: 0, g: 'check', w: 74, h: 50, gk: 0.8, lv: [[0.2, -1, 0.46, 58]] },
        { k: 'pod', x: 262, t: [244, 104], b: 12, f: 1, g: 'chart', w: 96, h: 62, gk: 0.72, lv: [[0.18, 1, 0.5, 60]] },
        { k: 'orb', x: 352, t: [354, 150], b: 12, s: 0.95, g: 'spark', lv: [[0.3, -1, 0.4, 54]] },
      ], dust: [[30, 60, 4, 3], [380, 60, 5, 2]] },
    { /* the economics: one tall bloom over a rupee orb */
      plants: [
        { k: 'orb', x: 110, t: [104, 170], b: -12, s: 1.2, g: 'rupee', lv: [[0.3, 1, 0.48, 56]] },
        { k: 'bloom', x: 250, t: [244, 104], b: 16, s: 0.82, rot: 8, sw: 3.2, lv: [[0.12, -1, 0.66, 64], [0.4, 1, 0.48, 56], [0.66, -1, 0.3, 50]] },
      ], sprigs: [{ x: 340, t: [346, 120], b: 16 }], dust: [[40, 70, 5, 0], [180, 40, 4, 3], [380, 90, 6, 2]] },
  ];

  function Pitch() {
    const host = $('#hmPitch');
    if (!host || !G) return;
    near(host, () => {
      $$('.hm-art', host).forEach((el) => {
        const i = +el.dataset.art;
        el.innerHTML = G.scene(`hmp${i}`, 400, 240, ARTS[i]);
        G.grow(el);
      });
    });
  }

  /* the roadmap: six plants, each taller than the last; today is a seedling, India a full bloom */
  function Grow() {
    const host = $('#hmGrow');
    if (!host || !G) return;
    near(host, () => {
      const art = $('.hm-grow-art', host);
      const spec = {
        root: [40, 1160],
        plants: [
          { k: 'orb', x: 100, t: [100, 330], b: -6, s: 0.7, ring: 30, lv: [[0.4, 1, 0.42, 58], [0.4, -1, 0.36, 58]] },
          { k: 'pod', x: 300, t: [276, 286], b: -14, f: 0, g: 'dots', w: 96, h: 60, lv: [[0.3, 1, 0.56, 60]] },
          { k: 'pod', x: 500, t: [478, 236], b: 12, f: 1, g: 'check', w: 104, h: 64, lv: [[0.2, -1, 0.66, 62], [0.5, 1, 0.42, 54]] },
          { k: 'bloom', x: 700, t: [698, 214], b: -14, s: 0.8, rot: 4, lv: [[0.16, 1, 0.76, 62], [0.46, -1, 0.5, 54]] },
          { k: 'bloom', x: 900, t: [902, 170], b: 14, s: 0.95, rot: -8, lv: [[0.14, -1, 0.84, 64], [0.42, 1, 0.56, 56], [0.66, -1, 0.34, 50]] },
          { k: 'bloom', x: 1100, t: [1082, 150], b: -12, s: 1.12, rot: 10, sw: 3.4, lv: [[0.1, 1, 0.98, 66], [0.34, -1, 0.7, 58], [0.58, 1, 0.46, 52]] },
        ],
        sprigs: [{ x: 1010, t: [1018, 150], b: 16 }, { x: 600, t: [596, 250], b: -14 }],
        dust: [[200, 160, 6, 2], [420, 110, 5, 3], [640, 90, 7, 0], [830, 70, 5, 1], [1000, 50, 8, 3], [1160, 220, 6, 0], [60, 220, 4, 3]],
      };
      art.innerHTML = G.scene('hmg', 1200, 400, spec);
      G.grow(art);
    });
  }

  /* Reading floor: the sections kept from the earlier home page (proof ribbon, live map, speech-cost
     calculator) were sized to fit one screen and set captions at 11–13px. No text on this page renders
     under 14px; the calculator simply grows a little taller. Runs once each section is built. */
  const FLOOR = 14;
  function floor(sec) {
    $$('*', sec).forEach((el) => {
      if (el.closest('svg') || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
      if (parseFloat(getComputedStyle(el).fontSize) < FLOOR) el.style.fontSize = `${FLOOR}px`;
    });
  }
  function Floor() {
    ['teaser-how', 'teaser-demo', 'savings'].forEach((id) => {
      const sec = document.getElementById(id);
      if (!sec) return;
      /* the map and the calculator are filled by other scripts near the viewport: run after they have */
      near(sec, () => setTimeout(() => floor(sec), 60));
      if ('MutationObserver' in window) {
        let t = 0;
        new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => floor(sec), 80); }).observe(sec, { childList: true, subtree: true });
      }
    });
  }

  function init() {
    [Pitch, Grow, Floor].forEach((f) => { try { f(); } catch (e) { console.error('[home]', f.name, e); } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
