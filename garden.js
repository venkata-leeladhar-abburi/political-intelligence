/* Political Intelligence Platform · the garden kit, shared by every page that draws an illustration.
   The footer garden's own forms: hairline stems in blue → violet → pink, split-gradient leaves with a
   gold vein, speech-bubble pods carrying a small white glyph, blooms whose petals are speech bubbles
   round a gold voice core, gold orbs with the brand ring, sprigs with gold and pink buds, soft dust.
   window.PIGarden.scene(id, W, H, spec) returns an <svg class="iv-art">; grow(el) adds .is-grown once
   it is seen and .is-live while it is on screen (garden.css runs the motion). */
(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const n1 = (v) => Math.round(v * 10) / 10;
  const lin = (id, x2, y2, stops) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
  const POD = [['#1b4dfe', '#8130ff', '#e58cff'], ['#8130ff', '#ca45ff', '#fe881b'], ['#fe881b', '#ffb340', '#ffd600']];
  const DUST = ['#ffd600', '#fe881b', '#8130ff', '#f79fff'];
  function defs(id, H) {
    return `<defs>`
      + `<linearGradient id="${id}st" gradientUnits="userSpaceOnUse" x1="0" y1="${H}" x2="0" y2="${H * 0.15}"><stop offset="0" stop-color="#1b4dfe"/><stop offset=".55" stop-color="#8130ff"/><stop offset="1" stop-color="#d77bff"/></linearGradient>`
      + `<linearGradient id="${id}hr" gradientUnits="userSpaceOnUse" x1="0" y1="${H}" x2="0" y2="${H * 0.25}"><stop offset="0" stop-color="#8130ff" stop-opacity=".3"/><stop offset=".55" stop-color="#ca45ff"/><stop offset="1" stop-color="#ffd600"/></linearGradient>`
      + lin(`${id}la`, 1, 0, [[0, '#1b4dfe'], [0.62, '#4f3bff'], [1, '#b26bff']])
      + lin(`${id}lb`, 1, 0.3, [[0, '#2f2bff'], [0.36, '#8a2cff'], [0.66, '#ee86ff'], [0.9, '#ffc46a'], [1, '#ffd600']])
      + lin(`${id}pt`, 0, 1, [[0, '#ffb8f4'], [0.42, '#c04bff'], [1, '#3b2bff']])
      + lin(`${id}au`, 0, 1, [[0, '#ffd0f6'], [0.42, '#ffd600'], [1, '#ffa31a']])
      + lin(`${id}sh`, 1, 1, [[0.5, '#fff', 0.16], [0.5, '#fff', 0]])
      + lin(`${id}rg`, 1, 1, [[0, '#1b4dfe'], [0.45, '#ac24ff'], [0.75, '#fe881b'], [1, '#ffd600']])
      + POD.map((c, i) => lin(`${id}p${i}`, 1, 1, c.map((col, j) => [j / (c.length - 1), col]))).join('')
      + DUST.map((c, i) => `<radialGradient id="${id}d${i}"><stop offset="0" stop-color="${c}" stop-opacity=".8"/><stop offset=".55" stop-color="${c}" stop-opacity=".4"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('')
      + `<radialGradient id="${id}gl"><stop offset="0" stop-color="#8130ff" stop-opacity=".55"/><stop offset=".5" stop-color="#ac24ff" stop-opacity=".16"/><stop offset="1" stop-color="#ac24ff" stop-opacity="0"/></radialGradient>`
      + `</defs>`;
  }
  const bubble = (x0, y0, w, h, r, a, b, tx, ty) => `M${x0 + r} ${y0}H${x0 + w - r}A${r} ${r} 0 0 1 ${x0 + w} ${y0 + r}V${y0 + h - r}A${r} ${r} 0 0 1 ${x0 + w - r} ${y0 + h}H${a}L${tx} ${ty}L${b} ${y0 + h}H${x0 + r}A${r} ${r} 0 0 1 ${x0} ${y0 + h - r}V${y0 + r}A${r} ${r} 0 0 1 ${x0 + r} ${y0}Z`;
  const PETAL = bubble(-18, -72, 36, 44, 14, 3, -5, -3, -14);
  const LEAF_A = 'M0 0C8 -48 86 -80 160 -20Z';
  const LEAF_B = 'M0 0C28 28 122 32 160 -20Z';
  const bars = (cx, cy, hs, gap, w) => hs.map((v, i) => `<rect x="${n1(cx - ((hs.length - 1) * gap) / 2 + i * gap - w / 2)}" y="${n1(cy - v / 2)}" width="${w}" height="${v}" rx="${w / 2}" style="--i:${i}"/>`).join('');

  /* the small white glyph a pod carries, centred on (cx, cy) */
  function glyph(kind, cx, cy, k = 1) {
    const s = (d) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="${n1(3.2 * k)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const t = (x, y) => `${n1(cx + x * k)} ${n1(cy + y * k)}`;
    switch (kind) {
      case 'check': return s(`M${t(-12, 0)}L${t(-3, 9)}L${t(14, -9)}`);
      case 'wave': return `<g class="ivw" fill="#fff">${bars(cx, cy, [8, 16, 26, 14, 22, 11, 6].map((v) => v * k), 7.2 * k, 3.8 * k)}</g>`;
      case 'dots': return `<g class="ivd" fill="#fff">${[-13, 0, 13].map((x, i) => `<circle cx="${n1(cx + x * k)}" cy="${n1(cy)}" r="${n1(4.4 * k)}" style="--i:${i}"/>`).join('')}</g>`;
      case 'pin': return s(`M${t(0, 15)}C${t(-12, 2)} ${t(-12, -4)} ${t(-12, -6)}A${n1(12 * k)} ${n1(12 * k)} 0 0 1 ${t(12, -6)}C${t(12, -4)} ${t(12, 2)} ${t(0, 15)}Z`) + `<circle cx="${n1(cx)}" cy="${n1(cy - 6 * k)}" r="${n1(3.6 * k)}" fill="#fff"/>`;
      case 'trend': return s(`M${t(-17, 10)}L${t(-5, -2)}L${t(3, 5)}L${t(17, -10)}M${t(8, -10)}L${t(17, -10)}L${t(17, -1)}`);
      case 'cycle': return s(`M${t(12, -5)}A${n1(13 * k)} ${n1(13 * k)} 0 1 0 ${t(10, 8)}M${t(13, -15)}L${t(13, -5)}L${t(3, -5)}`);
      case 'spark': return `<path d="M${t(0, -15)}L${t(4, -4)}L${t(15, 0)}L${t(4, 4)}L${t(0, 15)}L${t(-4, 4)}L${t(-15, 0)}L${t(-4, -4)}Z" fill="#fff"/>`;
      case 'rupee': return s(`M${t(-9, -13)}L${t(10, -13)}M${t(-9, -5)}L${t(10, -5)}M${t(-6, -13)}C${t(9, -13)} ${t(9, 3)} ${t(-7, 3)}L${t(8, 15)}`);
      case 'grid': return `<g fill="#fff">${[-1, 0, 1].map((r) => [-1, 0, 1].map((c) => `<rect x="${n1(cx + c * 11 * k - 3.5 * k)}" y="${n1(cy + r * 9 * k - 3 * k)}" width="${n1(7 * k)}" height="${n1(6 * k)}" rx="${n1(1.6 * k)}" opacity="${(r + c + 3) % 3 ? 0.5 : 1}"/>`).join('')).join('')}</g>`;
      case 'chart': return `<g fill="#fff">${[[-24, 10], [-12, 18], [0, 26], [12, 15], [24, 21]].map(([x, h]) => `<rect x="${n1(cx + x * k - 3.6 * k)}" y="${n1(cy + 14 * k - h * k)}" width="${n1(7.2 * k)}" height="${n1(h * k)}" rx="${n1(2 * k)}"/>`).join('')}</g><circle class="ivlive" cx="${n1(cx - 30 * k)}" cy="${n1(cy - 18 * k)}" r="${n1(4 * k)}" fill="#ff5a6e"/>`;
      case 'phone': return s(`M${t(-8, -15)}L${t(8, -15)}Q${t(11, -15)} ${t(11, -12)}L${t(11, 12)}Q${t(11, 15)} ${t(8, 15)}L${t(-8, 15)}Q${t(-11, 15)} ${t(-11, 12)}L${t(-11, -12)}Q${t(-11, -15)} ${t(-8, -15)}ZM${t(-3, 10)}L${t(3, 10)}`);
      case 'screen': return s(`M${t(-17, -12)}L${t(17, -12)}L${t(17, 8)}L${t(-17, 8)}ZM${t(-8, 15)}L${t(8, 15)}`);
      case 'chat': return `<path d="M${t(0, -12)}L${t(3, -3)}L${t(12, 0)}L${t(3, 3)}L${t(0, 12)}L${t(-3, 3)}L${t(-12, 0)}L${t(-3, -3)}Z" fill="#fff"/>`;
      default: return '';
    }
  }

  /* one plant: a quadratic stem from (x, H) to its head, leaves riding the curve, a head */
  function plant(id, H, p, i) {
    const x0 = p.x, [tx, ty] = p.t, cx = (x0 + tx) / 2 + (p.b || 0), cy = H - (H - ty) * 0.55;
    const at = (t) => { const u = 1 - t; return [u * u * x0 + 2 * u * t * cx + t * t * tx, u * u * H + 2 * u * t * cy + t * t * ty]; };
    const ang = (t) => { const u = 1 - t; return Math.atan2(2 * u * (cy - H) + 2 * t * (ty - cy), 2 * u * (cx - x0) + 2 * t * (tx - cx)) * 180 / Math.PI; };
    const sw = p.sw || (p.k === 'bloom' ? 3 : p.k === 'pod' ? 2.6 : 2.1);
    const d = `M${x0} ${H}Q${n1(cx)} ${n1(cy)} ${tx} ${ty}`;
    const dl = n1(0.1 + (i || 0) * 0.14);
    const leaves = (p.lv || []).map(([t, side, size, spread], j) => {
      const [lx, ly] = at(t), a = ang(t) + side * spread;
      return `<g transform="translate(${n1(lx)} ${n1(ly)}) rotate(${n1(a)}) scale(${size} ${side < 0 ? -size : size})"><g class="iv-lf" style="--d:${n1(dl + 0.4 + t * 0.6 + j * 0.05)}s"><path d="${LEAF_A}" fill="url(#${id}la)"/><path d="${LEAF_B}" fill="url(#${id}lb)"/><path d="M3 -.4L152 -19" stroke="#ffd600" stroke-opacity=".34" stroke-width=".8" fill="none"/></g></g>`;
    }).join('');
    const s = p.s || 1;
    let head = '';
    if (p.k === 'bloom') {
      const rot0 = p.rot || 0;
      head = `<g class="iv-bl" transform="translate(0 -40)">`
        + Array.from({ length: 5 }, (_, k) => `<g transform="rotate(${rot0 + k * 72})"><path d="${PETAL}" fill="url(#${id}pt)"/><path d="${PETAL}" fill="url(#${id}sh)"/></g>`).join('')
        + `<circle r="15" fill="url(#${id}au)"/><g class="ivw" fill="#fff">${bars(0, 0, [5, 10, 14, 9, 5], 4.4, 2.4)}</g></g>`;
    } else if (p.k === 'pod') {
      const w = p.w || 96, h = p.h || 62, rr = Math.min(22, h / 2 - 4), px = p.flip ? -(w - 24) : -24, py = -(h + 14);
      const dd = bubble(px, py, w, h, rr, p.flip ? 2 : 12, p.flip ? -12 : -2, 0, 0);
      head = `<path d="${dd}" fill="url(#${id}p${p.f || 0})"/><path d="${dd}" fill="url(#${id}sh)"/>${glyph(p.g || 'dots', px + w / 2, py + h / 2, p.gk || 1)}`;
    } else {
      const r = 20;
      head = `<circle class="iv-ping" cy="-${r}" r="${r}" fill="none" stroke="#ffd600" stroke-width="1.4"/><circle cy="-${r}" r="${r}" fill="url(#${id}au)"/><path d="M0 -${2 * r}A${r} ${r} 0 0 0 0 0Z" fill="#fff" opacity=".12"/>`
        + (p.ring === false ? '' : `<circle cy="-${r}" r="${r + 9}" fill="none" stroke="url(#${id}rg)" stroke-width="3.4" stroke-linecap="round" pathLength="100" stroke-dasharray="${p.ring || 78} 100" transform="rotate(-90 0 -${r})"/>`)
        + (p.g ? glyph(p.g, 0, -r, 0.62) : '');
    }
    return `<g class="iv-pl${p.cls ? ' ' + p.cls : ''}"${p.key != null ? ` data-key="${p.key}"` : ''} style="transform-origin:${x0}px ${H}px;--sw:${n1(5.5 + ((i || 0) % 3) * 1.3)}s;--sd:${n1(-(i || 0) * 1.7)}s">`
      + `<path class="iv-st" d="${d}" pathLength="100" fill="none" stroke="url(#${id}st)" stroke-width="${sw}" stroke-linecap="round" style="--d:${dl}s"/>`
      + leaves
      + `<g transform="translate(${tx} ${ty}) scale(${s})"><g class="iv-hd" style="--d:${n1(dl + 0.8)}s">${head}</g></g></g>`;
  }
  function sprig(id, H, sp, i) {
    const [tx, ty] = sp.t, cx = (sp.x + tx) / 2 + (sp.b || 0), cy = H - (H - ty) * 0.55;
    const dl = n1(0.3 + i * 0.2);
    return `<g class="iv-sp" style="transform-origin:${sp.x}px ${H}px;--sd:${n1(-i * 2.3)}s"><path class="iv-st" pathLength="100" d="M${sp.x} ${H}Q${n1(cx)} ${n1(cy)} ${tx} ${ty}" fill="none" stroke="url(#${id}hr)" stroke-width="1.3" stroke-linecap="round" style="--d:${dl}s"/>`
      + `<path class="iv-st" pathLength="100" d="M${tx} ${ty}q-4 -16 -14 -22M${tx} ${ty}q6 -14 16 -18" fill="none" stroke="url(#${id}hr)" stroke-width="1" stroke-linecap="round" style="--d:${n1(dl + 0.6)}s"/>`
      + `<circle class="iv-nd" cx="${tx - 14}" cy="${ty - 22}" r="3.2" fill="#ffd600" style="--d:${n1(dl + 1)}s"/><circle class="iv-nd" cx="${tx + 16}" cy="${ty - 18}" r="3" fill="#f79fff" style="--d:${n1(dl + 1.1)}s"/></g>`;
  }
  function scene(id, W, H, sc) {
    const dust = (sc.dust || []).map(([x, y, r, c], i) => `<circle class="iv-du" cx="${x}" cy="${y}" r="${r}" fill="url(#${id}d${c})" style="--dd:${n1(-i * 1.3)}s"/>`).join('');
    return `<svg class="iv-art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">${defs(id, H)}`
      + `<ellipse cx="${W / 2}" cy="${H}" rx="${W * 0.46}" ry="${H * 0.16}" fill="url(#${id}gl)"/>`
      + `<g>${dust}</g>${(sc.sprigs || []).map((s, i) => sprig(id, H, s, i)).join('')}${sc.plants.map((p, i) => plant(id, H, p, i)).join('')}`
      + (sc.root ? `<path class="iv-root" d="M${sc.root[0]} ${H - 1}H${sc.root[1]}" stroke="url(#${id}rg)" stroke-width="2" stroke-linecap="round" pathLength="100"/>` : '')
      + `</svg>`;
  }
  /* grow once on arrival; loops only while on screen */
  function grow(el) {
    if (!('IntersectionObserver' in window)) { el.classList.add('is-grown', 'is-live'); return; }
    new IntersectionObserver((es, o) => { if (es.some((e) => e.isIntersecting)) { o.disconnect(); requestAnimationFrame(() => el.classList.add('is-grown')); } }, { threshold: 0, rootMargin: '0px 0px -4% 0px' }).observe(el);
    new IntersectionObserver((es) => es.forEach((e) => el.classList.toggle('is-live', e.isIntersecting && !reduced))).observe(el);
  }

  window.PIGarden = { scene, plant, sprig, defs, glyph, grow, bubble, bars, PETAL, LEAF_A, LEAF_B };
})();
