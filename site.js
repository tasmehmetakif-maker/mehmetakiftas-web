/* ==========================================================================================
   PAFTA — ana sayfa etkileşimleri (2026-11). Kütüphane yok; her blok bağımsız ve try/catch'siz
   çalışacak kadar savunmacı: bir öğe sayfada yoksa o blok sessizce atlanır.
   Sıra önemli: i18n.js DOMContentLoaded'da metinleri basar; bu dosya gövdenin sonunda yüklendiği
   için buradaki DOMContentLoaded dinleyicileri ONDAN SONRA çalışır (sözcük bölme vb. ezilmez).
   ========================================================================================== */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, win = window;
  var RM = !!(win.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches);
  var FINE = !!(win.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches);
  var EASE_IO = 'cubic-bezier(.65,0,.35,1)';
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function T(k) { return win.T ? win.T(k) : k; }
  function isEN() { return !!(win.getLang && win.getLang() === 'en'); }
  function nf(n, d) { return Number(n).toLocaleString(isEN() ? 'en-US' : 'tr-TR', d != null ? { minimumFractionDigits: d, maximumFractionDigits: d } : undefined); }
  function onReady(fn) { if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', fn); else fn(); }
  function svg(tag, attrs) { var n = doc.createElementNS('http://www.w3.org/2000/svg', tag); for (var a in attrs) n.setAttribute(a, attrs[a]); return n; }

  var top = $('#top'), menu = $('#menu'), menuBtn = $('#menu-btn'), sheet = $('#sheet');
  var progress = $('#progress');
  var themed = $$('[data-theme]');

  /* ---------- Kaydırma: kâğıt/gece geçişi, üst bar, ilerleme çizgisi ---------- */
  var lastY = win.scrollY || 0, ticking = false;
  function onScroll() {
    var y = win.scrollY || 0, vh = win.innerHeight, mid = vh * 0.5, i, r, mode = null;
    for (i = 0; i < themed.length; i++) {
      r = themed[i].getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) { mode = themed[i].getAttribute('data-theme'); break; }
    }
    if (mode && root.getAttribute('data-mode') !== mode) root.setAttribute('data-mode', mode);
    if (top) {
      top.classList.toggle('is-solid', y > 24);
      var down = y > lastY + 4, up = y < lastY - 4, open = menu && menu.classList.contains('open');
      if (open || y < vh * 0.5) top.classList.remove('is-hidden');
      else if (down) top.classList.add('is-hidden');
      else if (up) top.classList.remove('is-hidden');
    }
    if (progress) {
      var max = Math.max(1, doc.documentElement.scrollHeight - vh);
      progress.style.transform = 'scaleX(' + Math.min(1, y / max).toFixed(4) + ')';
    }
    lead();
    lastY = y; ticking = false;
  }
  function reqScroll() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
  win.addEventListener('scroll', reqScroll, { passive: true });
  win.addEventListener('resize', reqScroll);

  /* ---------- Giriş paragrafı: sözcükler kaydırdıkça belirir ---------- */
  var leadEl = $('#lead'), words = [];
  function splitLead() {
    if (!leadEl || RM) return;
    var txt = leadEl.textContent.replace(/\s+/g, ' ').trim();
    while (leadEl.firstChild) leadEl.removeChild(leadEl.firstChild);
    words = txt.split(' ').map(function (w, i, a) {
      var s = doc.createElement('span'); s.className = 'wd'; s.textContent = w;
      leadEl.appendChild(s); if (i < a.length - 1) leadEl.appendChild(doc.createTextNode(' '));
      return s;
    });
    lead();
  }
  function lead() {
    if (!words.length) return;
    var r = leadEl.getBoundingClientRect(), vh = win.innerHeight;
    var p = (vh * 0.86 - r.top) / (r.height + vh * 0.36);          // 0: alttan girerken · 1: ekran ortasını geçince
    var n = Math.round(Math.max(0, Math.min(1, p)) * words.length);
    for (var i = 0; i < words.length; i++) words[i].classList.toggle('on', i < n);
  }

  /* ---------- Açılma (reveal) ---------- */
  function initReveal() {
    var els = $$('[data-reveal], .plate, .elev');
    if (!('IntersectionObserver' in win) || RM) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (ents) {
      var hit = ents.filter(function (e) { return e.isIntersecting; });
      // aynı anda görünen paftalar soldan sağa sırayla açılır
      var plates = hit.filter(function (e) { return e.target.classList.contains('plate'); })
        .sort(function (a, b) { return a.boundingClientRect.left - b.boundingClientRect.left; });
      plates.forEach(function (e, i) { e.target.style.setProperty('--d', (i * 120) + 'ms'); });
      hit.forEach(function (e) { e.target.classList.add('in'); io.unobserve(e.target); });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Sayaçlar ---------- */
  function countUp(el) {
    var t = +el.getAttribute('data-count') || 0, d = 1300, s = null;
    if (RM) { el.textContent = nf(t); return; }
    function f(ts) { if (!s) s = ts; var p = Math.min((ts - s) / d, 1); el.textContent = nf(Math.round(t * (1 - Math.pow(1 - p, 4)))); if (p < 1) requestAnimationFrame(f); }
    el.textContent = '0'; requestAnimationFrame(f);
  }
  function initCounts() {
    var els = $$('[data-count]');
    if (!els.length || !('IntersectionObserver' in win)) return;
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Menü (tam ekran) ---------- */
  var others = function () { return [$('#main'), $('.foot')].filter(Boolean); };
  function lock(on) { root.classList.toggle('is-locked', on); }
  function setMenu(o) {
    if (!menu || !menuBtn) return;
    menu.classList.toggle('open', o);
    menuBtn.setAttribute('aria-expanded', o ? 'true' : 'false');
    var lblEl = $('.mt', menuBtn); if (lblEl) { lblEl.setAttribute('data-i18n', o ? 'common.close.t' : 'ak.menu'); lblEl.textContent = T(o ? 'common.close.t' : 'ak.menu'); }
    if (o) { menu.removeAttribute('inert'); if (top) top.classList.remove('is-hidden'); } else menu.setAttribute('inert', '');
    others().forEach(function (n) { if (o) n.setAttribute('inert', ''); else n.removeAttribute('inert'); });
    root.classList.toggle('is-menu', o);
    lock(o);
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  }

  /* ---------- İmleç rozeti (yalnız fare) ---------- */
  var cur = $('#cursor'), cx = 0, cy = 0, tx = 0, ty = 0, curOn = false, curRaf = null;
  function curLoop() {
    cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
    cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
    if (curOn || Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) curRaf = requestAnimationFrame(curLoop); else curRaf = null;
  }
  function curShow(o) { if (!cur) return; curOn = o; cur.classList.toggle('on', o); if (o && !curRaf) curRaf = requestAnimationFrame(curLoop); }

  /* ---------- Paftalar + yükselti cetveli + ön izleme sayfası ---------- */
  var DATA = win.PAFTA || {};
  var plates = $$('#plates .plate');
  var order = plates.map(function (p) { return p.getAttribute('data-slug'); });
  var bySlug = {}; plates.forEach(function (p) { bySlug[p.getAttribute('data-slug')] = p; });
  var elev = $('#elev'), elevSvg = $('#elev-svg'), cols = {};
  var Z0 = 800, Z1 = 3000;

  function hl(slug, on) {
    var p = bySlug[slug], c = cols[slug];
    if (p) p.classList.toggle('hl', on);
    if (c) c.classList.toggle('on', on);
    if (elev) elev.classList.toggle('dim', on && !!c);
  }

  function drawElev() {
    if (!elevSvg || !elev) return;
    var list = order.filter(function (s) { return DATA[s] && DATA[s].zmin != null; })
      .sort(function (a, b) { return DATA[a].zmin - DATA[b].zmin; });
    var W = Math.max(280, Math.round(elev.getBoundingClientRect().width));
    var ml = 46, mr = 6, mt = 22, n = list.length, colW = (W - ml - mr) / n;
    var rot = colW < 104;                                           // dar ekranda adlar dik yazılır
    var mb = rot ? 112 : 34, plotH = rot ? 190 : 220, H = mt + plotH + mb;
    function y(z) { return mt + plotH * (1 - (z - Z0) / (Z1 - Z0)); }
    while (elevSvg.firstChild) elevSvg.removeChild(elevSvg.firstChild);
    elevSvg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    elev.classList.toggle('wide', !rot);
    var defs = svg('defs', {}), gr = svg('linearGradient', { id: 'hyp', gradientUnits: 'userSpaceOnUse', x1: 0, y1: y(Z1), x2: 0, y2: y(Z0) });
    // hipsometrik renk: yükselti arttıkça yeşil -> sarı -> kahve -> gri -> kar
    [[0, '#F2F1EC'], [.22, '#8D8983'], [.45, '#A8744C'], [.72, '#C4B378'], [1, '#6F8F62']].forEach(function (s) {
      gr.appendChild(svg('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gr); elevSvg.appendChild(defs);
    [1000, 1500, 2000, 2500, 3000].forEach(function (z) {
      elevSvg.appendChild(svg('line', { 'class': 'gl', x1: ml, x2: W - mr, y1: y(z), y2: y(z) }));
      var t = svg('text', { 'class': 'ax', x: ml - 10, y: y(z) + 3.5, 'text-anchor': 'end' }); t.textContent = z; elevSvg.appendChild(t);
    });
    cols = {};
    list.forEach(function (s, i) {
      var d = DATA[s], x = ml + colW * (i + 0.5), bw = Math.max(7, Math.min(16, colW * 0.2));
      var name = T('ak.sn.' + s);
      var g = svg('g', { 'class': 'col', tabindex: '0', role: 'button', 'aria-label': name + ': ' + d.zmin + '–' + d.zmax + ' m' });
      g.appendChild(svg('rect', { 'class': 'hit', x: x - colW / 2 + 1, y: 2, width: colW - 2, height: H - 4 }));
      var bar = svg('rect', { 'class': 'bar', x: x - bw / 2, y: y(d.zmax), width: bw, height: Math.max(3, y(d.zmin) - y(d.zmax)), fill: 'url(#hyp)', style: '--i:' + i });
      g.appendChild(bar);
      var v1 = svg('text', { 'class': 'vl', x: x, y: y(d.zmax) - 7, 'text-anchor': 'middle' }); v1.textContent = d.zmax; g.appendChild(v1);
      var v0 = svg('text', { 'class': 'vl', x: x, y: y(d.zmin) + 15, 'text-anchor': 'middle' }); v0.textContent = d.zmin; g.appendChild(v0);
      var nm = rot
        ? svg('text', { 'class': 'nm', x: x, y: mt + plotH + 34, 'text-anchor': 'end', transform: 'rotate(-90 ' + x + ' ' + (mt + plotH + 34) + ')', dy: '.35em' })
        : svg('text', { 'class': 'nm', x: x, y: H - 6, 'text-anchor': 'middle' });
      nm.textContent = name; g.appendChild(nm);
      g.addEventListener('pointerenter', function () { hl(s, true); });
      g.addEventListener('pointerleave', function () { hl(s, false); });
      g.addEventListener('focus', function () { hl(s, true); });
      g.addEventListener('blur', function () { hl(s, false); });
      g.addEventListener('click', function () { openSheet(order.indexOf(s), bySlug[s]); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSheet(order.indexOf(s), bySlug[s]); } });
      elevSvg.appendChild(g); cols[s] = g;
    });
  }

  /* --- ön izleme sayfası --- */
  var sh = sheet ? {
    img: $('#sh-img'), no: $('#sh-no'), ttl: $('#sh-ttl'), desc: $('#sh-desc'), dl: $('#sh-dl'), elev: $('#sh-elev'), band: $('#sh-band'),
    go: $('#sh-go'), paper: $('#sh-paper'), x: $('#sh-x'), prev: $('#sh-prev'), next: $('#sh-next'), media: $('#sheet-media'), bg: $('#sheet-bg')
  } : null;
  var curIdx = -1, lastFocus = null, fly = null;
  function row(k, v) {
    var w = doc.createElement('div'), dt = doc.createElement('dt'), dd = doc.createElement('dd');
    dt.textContent = T(k); dd.textContent = v; w.appendChild(dt); w.appendChild(dd); return w;
  }
  function fill(i) {
    var s = order[i], d = DATA[s] || {}, p = bySlug[s];
    curIdx = i;
    sh.no.textContent = ('0' + (i + 1)).slice(-2) + ' / ' + ('0' + order.length).slice(-2);
    sh.ttl.textContent = T('ak.mn.' + s);
    sh.desc.textContent = T('ak.card.' + s);
    while (sh.dl.firstChild) sh.dl.removeChild(sh.dl.firstChild);
    if (d.photos != null) sh.dl.appendChild(row('info.photos', nf(d.photos)));
    if (d.w != null) sh.dl.appendChild(row('info.area', d.w + ' × ' + d.h + ' m'));
    if (d.zmin != null) sh.dl.appendChild(row('info.elevrange', d.zmin + '–' + d.zmax + ' m'));
    if (d.gsd != null) sh.dl.appendChild(row('info.gsd', '≈ ' + nf(d.gsd, 1) + (isEN() ? ' cm/px' : ' cm/piksel')));
    if (d.cam) sh.dl.appendChild(row('info.camera', d.cam));
    if (d.zmin != null) {
      sh.elev.hidden = false;
      var l = (d.zmin - Z0) / (Z1 - Z0) * 100, r = 100 - (d.zmax - Z0) / (Z1 - Z0) * 100;
      sh.band.style.clipPath = 'inset(0 ' + r.toFixed(2) + '% 0 ' + l.toFixed(2) + '%)';
    } else sh.elev.hidden = true;
    sh.img.style.objectFit = d.fit || 'cover';
    sh.img.src = d.img || '';
    sh.go.href = p ? p.getAttribute('href') : '#';
    if (d.paper) { sh.paper.hidden = false; sh.paper.href = d.paper; } else sh.paper.hidden = true;
  }
  function openSheet(i, fromPlate) {
    if (!sh || i < 0) return;
    lastFocus = doc.activeElement;
    curShow(false);
    fill(i);
    sheet.classList.remove('out');
    sheet.classList.add('open');
    sheet.removeAttribute('inert');
    others().concat(top ? [top] : []).forEach(function (n) { n.setAttribute('inert', ''); });
    lock(true);
    var src = fromPlate && $('img', fromPlate), fig = fromPlate && $('.plate-fig', fromPlate);
    function shown() { sheet.classList.add('shown'); if (fly) { var f = fly; fly = null; setTimeout(function () { if (f.parentNode) f.parentNode.removeChild(f); }, 320); } try { sh.x.focus({ preventScroll: true }); } catch (e) { sh.x.focus(); } }
    if (!src || !fig || RM || !src.animate) { shown(); return; }
    // FLIP: karttaki görsel, yerinden kalkıp ön izleme çerçevesine büyür
    var a = fig.getBoundingClientRect(), b = sh.media.getBoundingClientRect();
    fly = doc.createElement('img'); fly.className = 'sheet-fly'; fly.alt = ''; fly.src = src.currentSrc || src.src;
    fly.style.objectFit = getComputedStyle(src).objectFit;
    fly.style.left = a.left + 'px'; fly.style.top = a.top + 'px'; fly.style.width = a.width + 'px'; fly.style.height = a.height + 'px';
    doc.body.appendChild(fly);
    var an = fly.animate([
      { left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px' },
      { left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px' }
    ], { duration: 900, easing: EASE_IO, fill: 'forwards' });
    an.onfinish = shown; an.oncancel = shown;
  }
  function closeSheet() {
    if (!sh || !sheet.classList.contains('open')) return;
    if (fly && fly.parentNode) fly.parentNode.removeChild(fly); fly = null;
    sheet.classList.add('out');
    sheet.setAttribute('inert', '');
    others().concat(top ? [top] : []).forEach(function (n) { n.removeAttribute('inert'); });
    lock(false);
    setTimeout(function () { sheet.classList.remove('open', 'shown', 'out'); }, RM ? 0 : 420);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) { lastFocus.focus(); } }
  }
  function step(dir) {
    if (curIdx < 0) return;
    var n = (curIdx + dir + order.length) % order.length;
    if (RM) { fill(n); return; }
    sheet.classList.add('swap');
    setTimeout(function () { fill(n); requestAnimationFrame(function () { sheet.classList.remove('swap'); }); }, 230);
  }
  if (sh) {
    sh.x.addEventListener('click', closeSheet);
    sh.bg.addEventListener('click', closeSheet);
    sh.prev.addEventListener('click', function () { step(-1); });
    sh.next.addEventListener('click', function () { step(1); });
  }
  plates.forEach(function (p, i) {
    var s = p.getAttribute('data-slug');
    p.addEventListener('click', function (e) {
      // Ctrl/Shift/orta tık: bağlantı olağan şekilde (yeni sekmede) açılır
      if (!sh || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault(); openSheet(i, p);
    });
    p.addEventListener('pointerenter', function (e) { hl(s, true); if (FINE && cur && e.pointerType === 'mouse') { tx = e.clientX; ty = e.clientY; if (!curOn) { cx = tx; cy = ty; } curShow(true); } });
    p.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; });
    p.addEventListener('pointerleave', function () { hl(s, false); curShow(false); });
    p.addEventListener('focus', function () { hl(s, true); });
    p.addEventListener('blur', function () { hl(s, false); });
  });

  /* ---------- Klavye ---------- */
  doc.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'Escape' || k === 'Esc') {
      if (sheet && sheet.classList.contains('open')) closeSheet();
      else if (menu && menu.classList.contains('open')) { setMenu(false); if (menuBtn) menuBtn.focus(); }
    } else if (sheet && sheet.classList.contains('open')) {
      if (k === 'ArrowRight') step(1); else if (k === 'ArrowLeft') step(-1);
    }
  });

  /* ---------- Dil değişimi: JS'in ürettiği metinleri yenile ---------- */
  win.addEventListener('langchange', function () {
    splitLead(); drawElev();
    if (elev && elev.classList.contains('in')) elev.classList.add('in');
    if (sheet && sheet.classList.contains('open') && curIdx >= 0) fill(curIdx);
    $$('[data-count]').forEach(function (el) { if (/\d/.test(el.textContent)) el.textContent = nf(+el.getAttribute('data-count') || 0); });
  });

  /* ---------- Başlat ---------- */
  var rz = null;
  win.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(drawElev, 180); });
  onReady(function () {
    if (win.applyI18n) win.applyI18n();          // açılış şeridindeki etiketler betikle değişmiş olabilir
    splitLead(); drawElev(); initReveal(); initCounts(); onScroll();
  });
})();
