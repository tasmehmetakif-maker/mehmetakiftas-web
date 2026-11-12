/* surek-3d ziyaret sayacı (istemci tarafı).
   KIRILMAZ: her şey try/catch + fetch().catch() ile sarılı; sayaç sunucusu
   dur/hata verse bile sayfa asla bloklanmaz/kırılmaz (ateşle-unut beacon).

   1) Vuruş: oturumda sayfa başına BİR kez gönderilir (yenilemede şişmez).
   2) Gösterim: sayfada #visitor-counter varsa /stats'tan toplam + bugünü doldurur. */
(function () {
  "use strict";
  var EP = "https://surek-counter.tas-mehmet-akif.workers.dev";

  // Yerel geliştirme/test adreslerinden (file://, localhost, 127.x, [::1], *.localhost, *.test,
  // özel ağ IP'leri) halka açık sayaca vuruş GÖNDERİLMEZ; gösterim (/stats) yine çalışır.
  function isLocalHost() {
    try {
      if (location.protocol === "file:") return true;
      var h = (location.hostname || "").toLowerCase().replace(/^\[|\]$/g, "");
      if (!h) return true;
      return h === "localhost" || h === "::1" || h === "0.0.0.0" ||
        /^127\./.test(h) || /\.localhost$/.test(h) || /\.test$/.test(h) ||
        /^10\./.test(h) || /^192\.168\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h);
    } catch (e) { return true; }
  }

  // 1) Vuruş (beacon) — oturumda sayfa başına bir kez
  try {
    var p = (location.pathname || "/").replace(/index\.html$/, "") || "/";
    var key = "vc_hit:" + p;
    if (!isLocalHost() && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      fetch(EP + "/hit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: p }),
        keepalive: true,
        priority: "low",        // analitik: sayfanın kendi isteklerinin önüne geçmesin
      }).catch(function () {});
    }
  } catch (e) { /* sessizce yut — sayaç hiçbir zaman sayfayı bozmaz */ }

  // 2) Gösterim — yalnız bu sayfada #visitor-counter varsa
  function fillCounter() {
    try {
      var box = document.getElementById("visitor-counter");
      if (!box) return;
      fetch(EP + "/stats", { priority: "low" })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d) return;
          var lang = (window.getLang && window.getLang()) || "tr";
          var loc = lang === "en" ? "en-US" : "tr-TR";
          var t = document.getElementById("vc-total");
          var y = document.getElementById("vc-today");
          if (t) t.textContent = Number(d.total || 0).toLocaleString(loc);
          if (y) y.textContent = Number(d.today || 0).toLocaleString(loc);
          box.removeAttribute("hidden");
        })
        .catch(function () { /* sunucu yoksa gösterimi gizli bırak */ });
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fillCounter);
  } else {
    fillCounter();
  }
  // Dil değişince sayıları yeni yerel biçimle güncelle (TR/EN ayracı)
  try { window.addEventListener("langchange", fillCounter); } catch (e) {}
})();
