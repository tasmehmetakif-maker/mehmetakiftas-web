// Görüntüleme koruması + güvenli varlık yükleyici. Site yalnız görüntüleme ve ölçüm içindir; indirme, ekran görüntüsü
// ve video kaydı yasaktır.
//
// 1) Güvenli yükleyici (VG): model dosyaları yalnız R2'de, model başına rastgele anahtarla şifreli (scripts/encrypt_v2.js).
//    Anahtar sayfada YOK: Worker /v2/k, ECDH(P-256) ile sarılmış anahtar + kısa ömürlü IP'ye bağlı bilet verir; anahtar
//    tarayıcıda dışa aktarılamayan (non-extractable) CryptoKey olarak açılır. Sayfa API'yi BİR KEZ alır: window.__vgTake().
// 2) Kayıt caydırıcıları: sağ tık/sürükleme/kaydet-yazdır kısayolları kapalı, yazdırma boş, PrintScreen ve odak kaybında
//    karartma, sayfa içinden kanvas/ekran yakalama API'leri kapalı, geliştirici araçları açılınca modeller bellekten silinir.
// 3) Filigran: tüm görüntüyü (ortası dahil) kaplayan, yavaşça kayan, tarih-saat damgalı belirgin döşeme. İşletim sisteminin
//    ekran alıcısı ve telefon kamerası tarayıcıdan durdurulamaz; filigran her kayıtta kaynağı gösterir.
// 4) Yasal uyarı: her model girişinde kabul penceresi + altta sürekli yasal şerit.
// Kullanım: <script src="../view-guard.js"></script> | data-mode="lite": yalnız güvenli yükleyici + görsellerde sağ tık
// engeli (ana sayfa) | data-legal="off": yasal pencere/şerit yok | iframe içinde: filigran/pencere üst sayfada.
(function () {
  'use strict';
  var WORKER = 'https://surek-ultra.tas-mehmet-akif.workers.dev';
  var me = document.currentScript;
  var lite = !!(me && me.dataset.mode === 'lite');
  var legalOn = !lite && !(me && me.dataset.legal === 'off');
  var inFrame = window.top !== window;
  // Yabancı çerçeve koruması: sayfa başka bir sitenin içine (iframe) gömülmüşse içerik HİÇ açılmaz. GitHub Pages
  // X-Frame-Options / frame-ancestors başlığı veremediği için denetim burada yapılır: üstteki HER pencere bizim
  // kökenimizde olmalı (foto-gerçekçi sayfanın kendi model sayfamızın içinde açılması serbest). Kökeni okunamayan
  // (başka siteye ait) bir üst pencere varsa güvenli yükleyici baştan kapalıdır (open -> 'tamper') ve sayfanın
  // üstüne açıklama örtüsü konur. Aksi halde filigran ve yasal uyarı "üst sayfada" sanılıp hiç gösterilmezdi.
  var foreignFrame = (function () {
    try { for (var w = window; w !== w.parent;) { w = w.parent; if (w.location.origin !== window.location.origin) return true; } return false; }
    catch (e) { return true; }
  })();
  var tampered = foreignFrame;
  var isEN = function () { try { return localStorage.getItem('lang') === 'en'; } catch (e) { return false; } };
  var L = function (tr, en) { return isEN() ? en : tr; };
  if (foreignFrame) {
    var blockFrame = function () {
      var d = document.createElement('div');
      d.id = 'vg-frame'; d.setAttribute('role', 'alert');
      d.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;'
        + 'text-align:center;background:#0C0E0D;color:#ECE9E1;font:500 15px/1.6 Archivo,system-ui,-apple-system,"Segoe UI",sans-serif';
      var p = document.createElement('p'); p.style.margin = '0';
      p.textContent = L('Bu içerik başka bir sitenin içinde görüntülenemez. Modeller yalnız mehmetakiftas.com üzerinde açılır.',
        'This content cannot be displayed inside another site. The models open only on mehmetakiftas.com.');
      var a = document.createElement('a'); a.href = location.href; a.target = '_top'; a.rel = 'noopener';
      a.textContent = 'mehmetakiftas.com'; a.style.cssText = 'color:#FF6A3D;text-decoration:underline;text-underline-offset:3px';
      d.appendChild(p); d.appendChild(a);
      (document.body || document.documentElement).appendChild(d);
    };
    if (document.body) blockFrame(); else document.addEventListener('DOMContentLoaded', blockFrame);
  }

  // ===================== 1) Güvenli yükleyici =====================
  var te = new TextEncoder();
  var MAGIC = [77, 65, 84, 50];   // "MAT2"
  var sessions = {};
  function err(kind, extra) { var e = new Error(kind + (extra && extra.status ? ' ' + extra.status : '')); e.kind = kind; if (extra) for (var k in extra) e[k] = extra[k]; return e; }
  function b64u(buf) { var s = '', b = new Uint8Array(buf); for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function unb64u(s) { var t = atob(String(s).replace(/-/g, '+').replace(/_/g, '/')), o = new Uint8Array(t.length); for (var i = 0; i < t.length; i++) o[i] = t.charCodeAt(i); return o; }

  // Cloudflare Turnstile (görünmez bot denetimi): anahtar isteği tek kullanımlık bir bilet taşır. Widget yalnız Cloudflare
  // etkileşim isterse görünür (appearance: interaction-only). TS_KEY boşsa denetim yok (Worker'da TURNSTILE_SECRET de yok).
  var TS_KEY = '0x4AAAAAAF0lSfz0TeHqU9mH';   // Cloudflare Turnstile site anahtarı (herkese açık; widget "mehmetakiftas", Managed)
  var tsReady = null;
  function tsLoad() {
    if (!tsReady) tsReady = new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; s.async = true;
      s.onload = function () { res(); }; s.onerror = function () { tsReady = null; rej(err('net')); };
      document.head.appendChild(s);
    });
    return tsReady;
  }
  async function tsToken() {
    if (!TS_KEY) return '';
    await tsLoad();
    return new Promise(function (res, rej) {
      var box = document.createElement('div');
      // Etkileşim gerekirse kutu yasal pencerenin (2147483646) ÜSTÜNDE görünmeli; aksi hâlde ziyaretçi takılır.
      box.style.cssText = 'position:fixed;left:50%;bottom:40px;transform:translateX(-50%);z-index:2147483647';
      document.body.appendChild(box);
      var id, end = function () { setTimeout(function () { try { window.turnstile.remove(id); } catch (e) {} box.remove(); }, 0); };
      id = window.turnstile.render(box, {
        sitekey: TS_KEY, appearance: 'interaction-only', language: isEN() ? 'en' : 'tr',
        callback: function (t) { end(); res(t); },
        'error-callback': function () { end(); rej(err('bot')); },
        'timeout-callback': function () { end(); rej(err('bot')); },
      });
    });
  }

  async function newSession(slug) {
    if (!(window.isSecureContext !== false && window.crypto && crypto.subtle)) throw err('crypto');
    var pair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveKey']);
    var pub = await crypto.subtle.exportKey('raw', pair.publicKey);
    var c = await tsToken();
    var r;
    try {
      r = await fetch(WORKER + '/v2/k', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: JSON.stringify({ s: slug, p: b64u(pub), c: c }), cache: 'no-store', credentials: 'omit' });
    } catch (e) { throw err('net', { cause: e }); }
    if (!r.ok) throw err('http', { status: r.status });
    var j = await r.json();
    var spub = await crypto.subtle.importKey('raw', unb64u(j.p), { name: 'ECDH', namedCurve: 'P-256' }, false, []);
    var kek = await crypto.subtle.deriveKey({ name: 'ECDH', public: spub }, pair.privateKey, { name: 'AES-GCM', length: 256 }, false, ['unwrapKey']);
    var key = await crypto.subtle.unwrapKey('raw', unb64u(j.w), kek, { name: 'AES-GCM', iv: unb64u(j.i), additionalData: te.encode('wrap/' + slug) },
      { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    return { key: key, tok: j.t, exp: j.e * 1000 };
  }
  function session(slug, fresh) {
    var s = sessions[slug];
    if (!fresh && s && (!s.done || s.val.exp - Date.now() > 90e3)) return s.p;
    var p = newSession(slug);
    var rec = { p: p, done: false, val: null };
    sessions[slug] = rec;
    p.then(function (v) { rec.done = true; rec.val = v; }, function () { if (sessions[slug] === rec) delete sessions[slug]; });
    return p;
  }

  // fetch + akış: onPct(yüzde, inen_bayt, toplam_bayt). Content-Length yoksa yüzde = -1 ve her ~1 MB'ta bildirir.
  // 2026-11-07 kullanıcı: "sitede tüm yüklenmelerde mb ve yüklenme yüzdesi görünmeli" → sayfalar prog() ile yazar.
  async function getBytes(url, onPct) {
    var r;
    try { r = await fetch(url, { credentials: 'omit' }); } catch (e) { throw err('net', { url: url, cause: e }); }
    if (!r.ok) throw err('http', { url: url, status: r.status });
    var total = +(r.headers.get('content-length') || 0);
    if (!r.body || !r.body.getReader) { try { return new Uint8Array(await r.arrayBuffer()); } catch (e) { throw err('net', { url: url, cause: e }); } }
    var rd = r.body.getReader(), buf = total > 0 ? new Uint8Array(total) : null, chunks = buf ? null : [], got = 0, lastP = -1;
    for (;;) {
      var res;
      try { res = await rd.read(); } catch (e) { throw err('net', { url: url, cause: e }); }
      if (res.done) break;
      var c = res.value;
      if (buf && got + c.length <= buf.length) buf.set(c, got);
      else { if (buf) { chunks = [buf.subarray(0, got)]; buf = null; } chunks.push(c); }
      got += c.length;
      if (onPct) {
        if (total > 0) { var pc = Math.min(99, Math.floor(got / total * 100)); if (pc !== lastP) { lastP = pc; onPct(pc, got, total); } }
        else { var mbN = Math.floor(got / 1e6); if (mbN !== lastP) { lastP = mbN; onPct(-1, got, 0); } }
      }
    }
    if (buf) return got === buf.length ? buf : buf.subarray(0, got);
    var out = new Uint8Array(got), o = 0;
    for (var i = 0; i < chunks.length; i++) { out.set(chunks[i], o); o += chunks[i].length; }
    return out;
  }

  // open(slug, ad, {v, onPct, onDecrypt}) -> ArrayBuffer (düz içerik). Bilet süresi geçmiş/IP değişmişse bir kez yeniler.
  async function open(slug, name, o) {
    o = o || {};
    if (tampered) throw err('tamper');
    if (!/^[a-z0-9]+$/.test(slug) || !/^[a-z0-9_]+$/.test(name)) throw err('format');
    var raw, s;
    for (var attempt = 0; ; attempt++) {
      s = await session(slug, attempt > 0);
      var url = WORKER + '/v2/' + slug + '/' + name + '.enc?v=' + encodeURIComponent(o.v || '0') + '&t=' + encodeURIComponent(s.tok);
      try { raw = await getBytes(url, o.onPct); break; }
      catch (e) { if (attempt === 0 && e.kind === 'http' && e.status === 403) continue; throw e; }
    }
    if (tampered) throw err('tamper');
    if (raw.length < 32 || MAGIC.some(function (b, i) { return raw[i] !== b; })) throw err('format');
    if (o.onDecrypt) o.onDecrypt();
    var plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: raw.subarray(4, 16), additionalData: te.encode(slug + '/' + name) }, s.key, raw.subarray(16));
    raw = null;
    return plain;
  }
  // prog(yüzde, inen, toplam, en) → "%37 · 52,1 / 141,2 MB" (TR) | "37% · 52.1 / 141.2 MB" (EN); toplam yoksa "52,1 MB".
  // MB = 10^6 bayt (şifreli dosya boyutu; düz içerikten 32 bayt büyük).
  function prog(p, got, total, en) {
    var loc = en ? 'en-US' : 'tr-TR', f = function (b) { return (b / 1e6).toLocaleString(loc, { minimumFractionDigits: 1, maximumFractionDigits: 1 }); };
    if (!(total > 0) || p < 0) return f(got || 0) + ' MB';
    return (en ? p + '%' : '%' + p) + ' · ' + f(got) + ' / ' + f(total) + ' MB';
  }
  var api = { open: open, prog: prog, tampered: function () { return tampered; } };
  var taken = false;
  window.__vgTake = function () { if (taken) return null; taken = true; try { delete window.__vgTake; } catch (e) { window.__vgTake = undefined; } return api; };

  // Sayfa içinden kanvas/ekran yakalama API'leri (yer imi betikleri, sayfa dünyasındaki eklenti kodu) kapalı.
  (function () {
    var deny = function () { throw new DOMException('Not allowed', 'SecurityError'); };
    try {
      var C = HTMLCanvasElement.prototype;
      ['toDataURL', 'toBlob', 'captureStream'].forEach(function (m) { if (C[m]) Object.defineProperty(C, m, { value: deny, configurable: false, writable: false }); });
      if (window.OffscreenCanvas && OffscreenCanvas.prototype.convertToBlob) Object.defineProperty(OffscreenCanvas.prototype, 'convertToBlob', { value: deny, configurable: false, writable: false });
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) Object.defineProperty(navigator.mediaDevices, 'getDisplayMedia', { value: function () { return Promise.reject(new DOMException('Not allowed', 'NotAllowedError')); }, configurable: false });
    } catch (e) {}
  })();

  // ===================== 2) Kayıt caydırıcıları =====================
  var st = document.createElement('style');
  st.textContent = 'img,canvas,video{-webkit-user-drag:none;-webkit-touch-callout:none;user-select:none;-webkit-user-select:none}'
    + (lite ? '' : 'body{user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}'
      + 'input,textarea{user-select:text;-webkit-user-select:text}'
      + '@media print{html,body{display:none!important}}'
      + '#vg-shield{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;background:#0C0E0D;color:#D9D6CE;'
      + 'font:500 15px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif;text-align:center;padding:24px}#vg-shield.on{display:flex}'
      + '#vg-wm{--vgw:340px;--vgh:190px;position:fixed;inset:0;z-index:9;pointer-events:none;background-repeat:repeat;background-size:var(--vgw) var(--vgh);animation:vgdrift 90s linear infinite}'
      // Haritalarda (ortofoto, DEM, karşılaştırma; sayfa body[data-view]'i yazar) filigran daha küçük ve saydam
      + 'body[data-view="ortho"] #vg-wm,body[data-view="dem2d"] #vg-wm,body[data-view="compare"] #vg-wm{--vgw:255px;--vgh:143px;opacity:.55}'
      + '@keyframes vgdrift{from{background-position:0 0}to{background-position:var(--vgw,340px) var(--vgh,190px)}}'
      + '@media (prefers-reduced-motion:reduce){#vg-wm{animation:none}}'
      + '#vg-legal{position:fixed;left:0;right:0;bottom:0;height:var(--vg-ftr);z-index:31;display:flex;align-items:center;gap:6px;padding:0 10px env(safe-area-inset-bottom,0px);'
      + 'background:rgba(12,14,13,.97);border-top:1px solid rgba(236,233,225,.16);color:#A9ACA5;font:500 11px/1.5 Archivo,system-ui,-apple-system,"Segoe UI",sans-serif;white-space:nowrap;box-sizing:border-box}'
      + '#vg-legal .t{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;line-height:1.5}#vg-legal .t span{display:none}'
      + '#vg-legal .t .l{display:inline}@media (max-width:1179px){#vg-legal .t .l{display:none}#vg-legal .t .m{display:inline}}'
      + '@media (max-width:639px){#vg-legal .t .m{display:none}#vg-legal .t .s{display:inline}}'
      + '#vg-legal button{flex:0 0 auto;background:none;border:0;padding:0;color:#FF6A3D;font:inherit;cursor:pointer;text-decoration:underline;text-underline-offset:2px}'
      + '#vg-terms{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:16px;'
      + 'background:rgba(6,7,7,.9);font-family:Archivo,system-ui,-apple-system,"Segoe UI",sans-serif}'
      + '#vg-terms[hidden]{display:none}'
      + '#vg-terms .card{width:min(620px,100%);max-height:calc(100dvh - 32px);overflow:auto;background:#121413;border:1px solid rgba(236,233,225,.2);border-radius:0;'
      + 'padding:24px 24px 0;color:#D9D6CE}'
      + '#vg-terms h2{margin:0 0 14px;font:400 23px/1.2 Newsreader,Georgia,serif;letter-spacing:-.015em;color:#ECE9E1;display:flex;gap:9px;align-items:center}'
      + '#vg-terms p{margin:0 0 10px;font-size:13.5px;line-height:1.6}#vg-terms p.f{margin-top:14px;color:#FF8A5C;font-weight:600}'
      + '#vg-terms .acts{position:sticky;bottom:0;display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:4px;padding:12px 0 18px;'
      + 'background:linear-gradient(rgba(18,20,19,0),#121413 14px)}'
      + '#vg-terms .acts button{font:500 11.5px/1.2 Archivo,system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.11em;text-transform:uppercase;padding:13px 16px 12px;border-radius:0;cursor:pointer;border:1px solid rgba(236,233,225,.3);background:transparent;color:#ECE9E1}'
      + '#vg-terms .acts button.ok{background:#E8491D;border-color:#E8491D;color:#121413;font-weight:600}'
      + '@media (max-width:520px){#vg-terms{padding:10px}#vg-terms .card{padding:16px 15px 0;max-height:calc(100dvh - 20px)}#vg-terms h2{font-size:16px}'
      + '#vg-terms p{font-size:12.8px;line-height:1.55}#vg-terms .acts{flex-wrap:nowrap}#vg-terms .acts button{flex:1 1 0;padding:12px 8px 11px;font-size:10.5px;letter-spacing:.06em}}');
  document.head.appendChild(st);

  var isMedia = function (t) { return t && t.closest && t.closest('img,canvas,video,svg,.view,#stage'); };
  document.addEventListener('contextmenu', function (e) { if (!lite || isMedia(e.target)) e.preventDefault(); }, true);
  document.addEventListener('dragstart', function (e) { if (!lite || isMedia(e.target)) e.preventDefault(); }, true);

  // Geliştirici araçları: açıkken `debugger` yürütmeyi durdurur; geçen süre ölçülür. Açıldıysa anahtarlar unutulur,
  // sayfalara 'vg:tamper' olayı gider (modelleri bellekten siler) ve görüntü kalıcı olarak kapanır.
  function tamper() {
    if (tampered) return;
    tampered = true; sessions = {};
    try { window.dispatchEvent(new Event('vg:tamper')); } catch (e) {}
    if (!lite) raise(-1);
  }
  setInterval(function () {
    var t = performance.now();
    (new Function('debugger'))();
    if (performance.now() - t > 250) tamper();
  }, 1000);
  if (lite) return;

  var topWin = function () { try { return window.top.document ? window.top : null; } catch (e) { return null; } };
  var shield = null, timer = 0;
  function shieldMsg(perm) {
    if (perm || tampered) return L('Geliştirici araçları açıldığı için görüntü kapatıldı. Araçları kapatıp sayfayı yenileyin.',
      'The view was closed because developer tools were opened. Close them and reload the page.');
    return L('Ekran görüntüsü, video kaydı ve indirme yasaktır. Devam etmek için tıklayın.', 'Screenshots, screen recording and downloads are not permitted. Click to continue.');
  }
  function hide() { if (shield && !tampered) shield.classList.remove('on'); clearTimeout(timer); }
  function show(ms) {
    if (!shield) {
      shield = document.createElement('div'); shield.id = 'vg-shield';
      shield.addEventListener('pointerdown', hide);
      document.body.appendChild(shield);
    }
    shield.textContent = shieldMsg(ms < 0); shield.classList.add('on');
    clearTimeout(timer); if (ms > 0) timer = setTimeout(hide, ms);
  }
  window.__vgShow = show;
  function raise(ms) {                                    // iframe içindeysek karartmayı üst sayfa yapar
    var t = inFrame ? topWin() : window;
    if (t && t.__vgShow) t.__vgShow(ms); else show(ms);
  }
  function wipeClipboard() { try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText('').catch(function () {}); } catch (e) {} }

  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase(), mod = e.ctrlKey || e.metaKey;
    if (k === 'printscreen') { e.preventDefault(); wipeClipboard(); raise(1500); return; }
    if (e.metaKey && e.shiftKey) { raise(1500); }         // Win+Shift+S, Cmd+Shift+3/4/5
    if (e.altKey && e.metaKey && k === 'r') { raise(1500); }   // Win+Alt+R (Xbox Game Bar kaydı)
    if (k === 'f12' || (mod && (k === 's' || k === 'p' || k === 'u')) || (mod && e.shiftKey && (k === 'i' || k === 'j' || k === 'c' || k === 's'))) e.preventDefault();
  }, true);
  document.addEventListener('keyup', function (e) { if ((e.key || '').toLowerCase() === 'printscreen') { wipeClipboard(); raise(1500); } }, true);
  window.addEventListener('beforeprint', function () { raise(0); });
  if (inFrame) return;                                    // filigran, yasal pencere ve şerit üst sayfada

  // Odak sayfadan (iframe'ler dahil) çıkınca karart; ekran alıcıların çoğu önce odağı alır.
  window.addEventListener('blur', function () { setTimeout(function () { if (!document.hasFocus()) show(0); }, 0); });
  window.addEventListener('focus', hide);
  document.addEventListener('visibilitychange', function () { if (document.hidden) show(0); else hide(); });

  // ===================== 3) Filigran =====================
  var code = (function () { var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', r = crypto.getRandomValues(new Uint8Array(5)), s = ''; for (var i = 0; i < 5; i++) s += a[r[i] % a.length]; return s; })();
  var wm = document.createElement('div'); wm.id = 'vg-wm'; wm.setAttribute('aria-hidden', 'true');
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function paintWM() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    var when = p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    var l1 = '© Mehmet Akif Taş · mehmetakiftas.com', l2 = L('İzinsiz kopyalanamaz', 'No copying without permission') + ' · ' + when + ' · #' + code;
    var W = 340, H = 190;
    var txt = function (y, s, sz) {
      return '<text x="0" y="' + y + '" font-family="Segoe UI,system-ui,sans-serif" font-weight="700" font-size="' + sz + '" text-anchor="middle" '
        + 'fill="#fff" fill-opacity=".30" stroke="#000" stroke-opacity=".34" stroke-width=".7" paint-order="stroke">' + esc(s) + '</text>';
    };
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '"><g transform="translate(' + W / 2 + ' ' + H / 2 + ') rotate(-24)">'
      + txt(-3, l1, 13) + txt(14, l2, 10) + '</g></svg>';
    wm.style.backgroundImage = 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")';
  }

  // ===================== 4) Yasal uyarı penceresi + 5) alt şerit =====================
  var T = {
    title: ['Yasal Uyarı ve Kullanım Koşulları', 'Legal Notice and Terms of Use'],
    p1: ['Bu sayfadaki üç boyutlu modeller, ortofotolar, sayısal yükseklik modelleri, türev haritalar ve foto-gerçekçi sahneler Dr. Öğr. Üyesi Mehmet Akif Taş’ın bilimsel çalışmalarının ürünüdür ve 5846 sayılı Fikir ve Sanat Eserleri Kanunu kapsamında korunmaktadır. Tüm hakları saklıdır.',
      'The 3D models, orthophotos, digital elevation models, derived maps and photorealistic scenes on this page are products of the scientific work of Asst. Prof. Dr. Mehmet Akif Taş and are protected under Turkish Law No. 5846 on Intellectual and Artistic Works. All rights reserved.'],
    p2: ['İçerik yalnızca bu sitede, tarayıcı üzerinden görüntüleme ve ölçüm amacıyla sunulur. Yazılı izin olmaksızın indirilmesi, ekran görüntüsü ya da ekran videosu alınması, kopyalanması, çoğaltılması, yeniden yayımlanması, başka bir ortama aktarılması, tersine mühendislikle elde edilmesi ve ticari amaçla kullanılması yasaktır.',
      'The content is provided solely for viewing and measurement in the browser on this site. Without written permission, downloading, taking screenshots or screen recordings, copying, reproducing, republishing, transferring to another medium, extracting by reverse engineering and commercial use are prohibited.'],
    p3: ['Görüntüler, görüntüleme anının tarih ve saatini taşıyan filigranla işaretlenir. İzinsiz kullanım tespit edildiğinde yasal yollara başvurulur.',
      'Images are marked with a watermark showing the date and time of viewing. Unauthorized use will be pursued through legal channels.'],
    p4: ['Ölçüm araçlarıyla elde edilen mesafe, alan, hacim, rakım ve profil değerleri bilgi amaçlıdır; doğrulukları garanti edilmez. Bu değerlerin mühendislik, hukuki, resmî ya da ticari işlemlerde kullanılmasından doğabilecek sonuçlardan yazar sorumlu tutulamaz.',
      'Distance, area, volume, elevation and profile values obtained with the measurement tools are for information only and their accuracy is not guaranteed. The author accepts no liability for consequences arising from their use in engineering, legal, official or commercial matters.'],
    p5: ['Bilimsel atıf ve kullanım izni talepleri için sitedeki iletişim bilgilerini kullanabilirsiniz.', 'For scientific citation and permission requests, please use the contact details on this site.'],
    pf: ['Devam ederek bu koşulları okuduğunuzu ve kabul ettiğinizi beyan edersiniz.', 'By continuing you confirm that you have read and accept these terms.'],
    ok: ['Okudum, kabul ediyorum', 'I have read and accept'],
    no: ['Kabul etmiyorum', 'I do not accept'],
    fl: ['© {y} Mehmet Akif Taş · Tüm hakları saklıdır (5846 sayılı FSEK) · İndirme, ekran görüntüsü ve video kaydı yasaktır · Ölçümler bilgi amaçlıdır, sorumluluk kabul edilmez ·',
      '© {y} Mehmet Akif Taş · All rights reserved (Turkish Law No. 5846) · Downloading, screenshots and screen recording are prohibited · Measurements are for information only; no liability accepted ·'],
    fm: ['© {y} Mehmet Akif Taş · Tüm hakları saklıdır · İndirme, ekran görüntüsü ve video kaydı yasaktır ·',
      '© {y} Mehmet Akif Taş · All rights reserved · Downloading, screenshots and recording prohibited ·'],
    fs: ['© M. A. Taş · İzinsiz kopyalama ve kayıt yasaktır ·', '© M. A. Taş · Copying and recording prohibited ·'],
    fb: ['Yasal uyarı', 'Legal notice'],
  };
  var t = function (k) { return T[k][isEN() ? 1 : 0].split('{y}').join(String(new Date().getFullYear())); };
  var terms = null, bar = null;
  function el(tag, attrs, kids) { var n = document.createElement(tag); for (var a in attrs || {}) n.setAttribute(a, attrs[a]); (kids || []).forEach(function (c) { n.append(c); }); return n; }
  function buildTerms() {
    var card = el('div', { class: 'card' });
    card.append(el('h2', { id: 'vg-terms-h' }, [t('title')]));
    ['p1', 'p2', 'p3', 'p4', 'p5'].forEach(function (k) { card.append(el('p', null, [t(k)])); });
    card.append(el('p', { class: 'f' }, [t('pf')]));
    var no = el('button', { type: 'button' }, [t('no')]), ok = el('button', { type: 'button', class: 'ok' }, [t('ok')]);
    no.onclick = function () { location.href = '/'; };
    ok.onclick = function () { terms.hidden = true; };
    card.append(el('div', { class: 'acts' }, [no, ok]));
    if (!terms) {
      terms = el('div', { id: 'vg-terms', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'vg-terms-h' });
      terms.addEventListener('keydown', function (e) { if (e.key === 'Escape') e.preventDefault(); });
      document.body.appendChild(terms);
    }
    terms.replaceChildren(card);
    return ok;
  }
  function openTerms() { var ok = buildTerms(); terms.hidden = false; try { ok.focus({ preventScroll: true }); } catch (e) {} }
  function buildBar() {
    if (!bar) { bar = el('div', { id: 'vg-legal', role: 'contentinfo' }); document.body.appendChild(bar); }
    var b = el('button', { type: 'button' }, [t('fb')]); b.onclick = openTerms;
    bar.replaceChildren(el('div', { class: 't' }, [el('span', { class: 'l' }, [t('fl')]), el('span', { class: 'm' }, [t('fm')]), el('span', { class: 's' }, [t('fs')])]), b);
  }

  function relabel() {
    paintWM(); if (shield) shield.textContent = shieldMsg(false);
    if (legalOn) { buildBar(); if (terms && !terms.hidden) buildTerms(); }
  }
  function start() {
    paintWM(); document.body.appendChild(wm); setInterval(paintWM, 30000);
    if (legalOn) {
      document.documentElement.style.setProperty('--vg-ftr', 'calc(26px + env(safe-area-inset-bottom, 0px))');
      buildBar(); openTerms();
    }
    window.addEventListener('langchange', relabel);
    window.addEventListener('storage', function (e) { if (e.key === 'lang') relabel(); });
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
