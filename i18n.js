/* Basit istemci-tarafı TR/EN dil katmanı (build gerektirmez).
 * - Statik metinler: HTML'de data-i18n="anahtar" (textContent), data-i18n-title (title attr),
 *   data-i18n-ph (placeholder), data-i18n-aria (aria-label), data-i18n-alt (alt).
 *   DİKKAT: data-i18n öğenin textContent'ini değiştirir; alt öğesi olan düğümlerde metni ayrı bir
 *   <span data-i18n> içine al (aksi halde alt öğeler silinir).
 * - Yeni eklenen data-i18n'leri URL'yi değiştirmeden uygulamak için: window.applyI18n(kök?).
 * - Dinamik JS metinleri: window.T('anahtar', {..}) ile çevrilir.
 * - Dil sırası: ?lang=en  ->  localStorage('lang')  ->  varsayılan 'tr'.
 * - Üstte TR/EN düğmesi #lang-switch içine basılır; yoksa sağ-üste sabitlenir.
 * - Sözlük tek kaynaktır (TR ve EN birlikte) -> diller birbirinden sapmaz.
 */
(function () {
  const DICT = {
    // ---- Sekmeler / üst ----
    'tab.model': ['3B Model', '3D Model'],
    'tab.ortho': ['Ortofoto', 'Orthophoto'],
    'tab.dem2d': ['DEM (2B)', 'DEM (2D)'],
    'tab.compare': ['⇋ Karşılaştır', '⇋ Compare'],
    'tab.splat': ['✨ Foto-gerçekçi', '✨ Photorealistic'],
    'nav.portfolio': ['🏛 Portföy', '🏛 Portfolio'],
    // ---- Ziyaret sayacı ----
    'vc.total': ['Toplam ziyaret', 'Total visits'],
    'vc.today': ['Bugün', 'Today'],
    // ---- Yakında (coming soon) ----
    'cs.back': ['← Tüm modeller', '← All models'],
    'cs.admin': ['🔒 Yönetici Girişi', '🔒 Admin Access'],
    'info.paper': ['İlgili yayın', 'Related publication'],
    'ak.card.paper': ['📄 İlgili yayın ↗', '📄 Related publication ↗'],
    'ak.hero.cta': ['3B Modelleri Keşfet', 'Explore 3D Models'],
    'ak.hero.tag': ['Saha verilerini İHA fotogrametrisiyle yüksek çözünürlüklü, ölçülebilir 3B arazi modellerine dönüştürüyorum.', 'I turn field data into high-resolution, measurable 3D terrain models using UAV photogrammetry.'],
    'ak.m.models': ['3B Model', '3D Models'],
    'ak.b.about': ['Hakkında', 'About'],
    'ak.b.research': ['Araştırma Alanları', 'Research Areas'],
    'ak.b.links': ['Bağlantılar', 'Links'],
    'ak.hero.live2': ['Canlı 3B model', 'Live 3D model'],
    'ak.cite.eyebrow': ['Akademik Etki', 'Academic Impact'],
    'ak.cite.h2': ['Atıf Metrikleri', 'Citation Metrics'],
    'ak.cite.sub': ['Google Scholar atıf metrikleri (elle güncellenir); OpenAlex verisi canlı olarak çekilir.', 'Google Scholar citation metrics (updated manually); OpenAlex data is fetched live.'],
    'ak.cite.total': ['Toplam Atıf', 'Total Citations'],
    'ak.cite.works': ['Yayın', 'Publications'],
    'ak.cite.src': ['Kaynak: Google Scholar (son güncelleme: 28.10.2026)', 'Source: Google Scholar (last updated: 28 Oct 2026)'],
    'ak.cite.oa': ['OpenAlex (canlı)', 'OpenAlex (live)'],
    'ak.cite.oacit': ['atıf', 'citations'],
    'ak.proj.eyebrow': ['Araştırma', 'Research'],
    'ak.proj.h2': ['Projeler', 'Projects'],
    'ak.proj.sub': ['Katkı sunduğum bilimsel araştırma projeleri (kaynak: AVESİS).', 'Research projects I have contributed to (source: AVESİS).'],
    'ak.role.res': ['Araştırmacı', 'Researcher'],
    'ak.teach.eyebrow': ['Eğitim', 'Teaching'],
    'ak.teach.h2': ['Dersler & Danışmanlık', 'Courses & Supervision'],
    'ak.teach.courses': ['Verdiği Dersler', 'Courses Taught'],
    'ak.teach.theses': ['Tez Danışmanlıkları', 'Thesis Supervision'],
    'ak.teach.note': ['Yeni danışmanlıklar tamamlandıkça eklenecek.', 'New supervisions will be added as they are completed.'],
    'ak.con.eyebrow': ['İletişim', 'Contact'],
    'ak.con.h2': ['İletişim', 'Contact'],
    'ak.con.office': ['Ofis', 'Office'],
    'ak.con.phone': ['Telefon', 'Phone'],
    'ak.con.email': ['E-posta', 'Email'],
    'ak.nav.projects': ['Projeler', 'Projects'],
    'ak.nav.contact2': ['İletişim', 'Contact'],
    'ak.cv': ['Özgeçmiş (CV)', 'CV'],
    'ak.cv2': ['📄 Özgeçmiş (CV)', '📄 CV'],
    // ---- Kalite ----
    'q.label': ['Model kalitesi', 'Model quality'],
    'q.low': ['Düşük', 'Low'],
    'q.medium': ['Orta', 'Medium'],
    'q.high': ['Yüksek', 'High'],
    'q.ultra': ['En Yüksek', 'Highest'],
    'q.low.t': ['Düşük detay — en hızlı açılır, zayıf cihazlar için', 'Low detail — opens fastest, for weak devices'],
    'q.medium.t': ['Dengeli detay/hız (önerilen)', 'Balanced detail/speed (recommended)'],
    'q.high.t': ['Yüksek detay — güçlü bilgisayar ister', 'High detail — needs a powerful computer'],
    'q.ultra.t': ['Tam (10M üçgen) detay — en yavaş, en güçlü cihaz', 'Full (10M triangles) detail — slowest, most powerful device'],
    'q.ultra2': ['En Yüksek ⚡', 'Highest ⚡'],
    'warn.perf': ['⚠️ "Yüksek" ve "En Yüksek" güçlü bir bilgisayar ister. Model açılmazsa veya takılırsa daha düşük bir kalite seçin.',
                  '⚠️ "High" and "Highest" need a powerful computer. If the model fails to open or stutters, choose a lower quality.'],
    'hint.controls': ['Sürükle: döndür · Sağ tık: kaydır · Tekerlek: yakınlaş',
                      'Drag: rotate · Right-click: pan · Wheel: zoom'],
    // ---- Araç grupları + yardım ----
    'grp.measure': ['Ölçüm', 'Measure'],
    'grp.view': ['Görünüm', 'View'],
    'grp.share': ['Paylaşım & Bilgi', 'Share & Info'],
    'tool.help': ['❔ Yardım', '❔ Help'],
    'tool.help.t': ['Tüm araçların ne işe yaradığı ve nasıl kullanılacağı', 'What every tool does and how to use it'],
    'help.title': ['Araçlar — Ne işe yarar, nasıl kullanılır', 'Tools — what they do, how to use them'],
    'help.intro': ['Her araç bir kez açılır/kapanır. Ölçüm araçları için modele tıklayarak nokta seç.', 'Each tool toggles on/off. For measurement tools, click the model to place points.'],
    // ---- Araç butonları (metin + başlık) ----
    'tool.measure': ['📏 Mesafe', '📏 Distance'],
    'tool.measure.t': ['İki noktaya tıkla: mesafe ve yükseklik farkı', 'Click two points: distance and height difference'],
    'tool.vol': ['📦 Hacim', '📦 Volume'],
    'tool.vol.t': ['Alanı çevrele: taban (seçilen noktaların en alçağı) üstü hacim (m³)', 'Enclose an area: volume above the base (lowest selected point) in m³'],
    'tool.area': ['📐 Alan', '📐 Area'],
    'tool.area.t': ['Alanı çevrele: düzlemsel + gerçek 3B yüzey alanı (m²)', 'Enclose an area: planar + true 3D surface area (m²)'],
    'tool.elev': ['📍 Rakım', '📍 Elevation'],
    'tool.elev.t': ['Bir noktaya tıkla: o noktanın rakımı (m)', 'Click a point: its elevation (m)'],
    'tool.profile': ['📈 Profil', '📈 Profile'],
    'tool.profile.t': ['İki nokta seç: aradaki topografik yükseklik profili', 'Pick two points: topographic elevation profile between them'],
    'tool.clear': ['🗑 Temizle', '🗑 Clear'],
    'tool.clear.t': ['Tüm ölçüm/işaretleri temizle', 'Clear all measurements/markers'],
    'tool.wire': ['△ Üçgenler', '△ Wireframe'],
    'tool.wire.t': ['Modeli üçgen ağ (wireframe) olarak göster', 'Show the model as a triangle mesh (wireframe)'],
    'tool.rotate': ['🔄 Döndür', '🔄 Spin'],
    'tool.rotate.t': ['Otomatik döndür (sunum)', 'Auto-rotate (presentation)'],
    'tool.tour': ['🎬 Tur', '🎬 Tour'],
    'tool.tour.t': ['Sinematik tur: rota noktası yoksa 360° döner, varsa rotayı izler.', 'Cinematic tour: no route points → 360° orbit; otherwise follows your route.'],
    'tool.wp': ['📍 Rota +', '📍 Route +'],
    'tool.wp.t': ['Şu anki kamera açısını tur rotasına nokta olarak ekle (Tur bu noktalardan geçer)', 'Add the current camera view as a route point (Tour passes through these)'],
    'wp.added': ['📍 Rota noktası: {n} · “Tur”a bas (rotayı izler) ', '📍 Route points: {n} · press “Tour” (follows route) '],
    'wp.clear': ['Temizle', 'Clear'],
    'tool.sun': ['☀️ Güneş', '☀️ Sun'],
    'tool.sun.t': ['Güneş/gölge: tarih-saate göre gerçek güneş konumu ve gölgeler', 'Sun/shadow: real sun position and shadows by date and time'],
    'tool.share': ['🔗 Bağlantı', '🔗 Link'],
    'tool.share.t': ['Bu kamera görünümünün bağlantısını kopyala', 'Copy a link to this camera view'],
    'tool.info': ['ℹ️ Künye', 'ℹ️ Info'],
    'tool.info.t': ['Künye / teknik bilgi', 'Credits / technical info'],
    // ---- Profil paneli ----
    'profile.title': ['📈 Yükseklik Profili', '📈 Elevation Profile'],
    'common.close.t': ['Kapat', 'Close'],
    'profile.len': ['Uzunluk:', 'Length:'],
    'profile.elevrange': ['Rakım:', 'Elevation:'],
    'profile.delta': ['Δ:', 'Δ:'],
    // ---- Künye paneli ----
    'info.title': ['Künye', 'Credits'],
    'info.whatis': ['Bu nedir?', 'What is this?'],
    'info.location': ['Konum', 'Location'],
    'info.crs': ['Koordinat sistemi', 'Coordinate system'],
    'info.area': ['Kapsanan alan', 'Covered area'],
    'info.elevrange': ['Yükseklik aralığı', 'Elevation range'],
    'info.relief': ['Rölyef (fark)', 'Relief (range)'],
    'info.gsd': ['Çözünürlük (GSD)', 'Resolution (GSD)'],
    'info.camera': ['Kamera', 'Camera'],
    'info.modeltype': ['Model türü', 'Model type'],
    'info.modeltype.v': ['Dokulu 3B mesh', 'Textured 3D mesh'],
    'info.tris': ['Üçgen sayısı', 'Triangle count'],
    'info.source': ['Kaynak', 'Source'],
    'info.date': ['Çekim tarihi', 'Capture date'],
    'info.photos': ['Fotoğraf sayısı', 'Photo count'],
    'info.license': ['Lisans', 'License'],
    'cite.bib': ['⧉ BibTeX kopyala', '⧉ Copy BibTeX'],
    'cite.ris': ['⧉ RIS kopyala', '⧉ Copy RIS'],
    'cite.copied': ['✓ kopyalandı', '✓ copied'],
    // ---- DEM katman + lejant ----
    'dem.relief': ['Renkli DEM', 'Color DEM'],
    'dem.slope': ['Eğim', 'Slope'],
    'dem.aspect': ['Bakı', 'Aspect'],
    'dem.contour': ['Eşyükselti', 'Contours'],
    'dem.contourtgl': ['⛰ Eşyükselti', '⛰ Contours'],
    'dem.contourtgl.t': ['Eşyükselti eğrilerini aç/kapa (üstüne bindir)', 'Toggle contour lines (overlay)'],
    'leg.elev': ['Yükseklik (m)', 'Elevation (m)'],
    'leg.contour': ['Eşyükselti', 'Contours'],
    'leg.contour.major': ['Ana çizgi', 'Index line'],
    'leg.contour.minor': ['Ara çizgi', 'Intermediate'],
    'leg.slope': ['Eğim (°)', 'Slope (°)'],
    'leg.aspect': ['Bakı (yön)', 'Aspect (direction)'],
    'dir.flat': ['Düz alan', 'Flat'],
    'dir.N': ['K — Kuzey', 'N — North'], 'dir.NE': ['KD — Kuzeydoğu', 'NE — Northeast'],
    'dir.E': ['D — Doğu', 'E — East'], 'dir.SE': ['GD — Güneydoğu', 'SE — Southeast'],
    'dir.S': ['G — Güney', 'S — South'], 'dir.SW': ['GB — Güneybatı', 'SW — Southwest'],
    'dir.W': ['B — Batı', 'W — West'], 'dir.NW': ['KB — Kuzeybatı', 'NW — Northwest'],
    // ---- AR overlay ----
    // ---- Güneş paneli ----
    'sun.title': ['☀️ Güneş / Gölge', '☀️ Sun / Shadow'],
    'sun.date': ['Tarih', 'Date'],
    'sun.time': ['Saat', 'Time'],
    'sun.note': ['Gölgeler, modelin konumundan (enlem/boylam) ve seçilen tarih-saatten hesaplanan gerçek güneş açısıyla çizilir.',
                 'Shadows are drawn from the real sun angle computed from the model location (lat/lon) and the selected date-time.'],
    // ---- Karşılaştır ----
    'cmp.ortho': ['📷 Ortofoto', '📷 Orthophoto'],
    'cmp.hint': ['Bölücüyü sürükle: solda ortofoto, sağda seçilen DEM katmanı',
                 'Drag the divider: orthophoto on the left, selected DEM layer on the right'],
    // ---- Dinamik durum / okumalar (T() ile) ----
    'st.prefix': ['Durum: ', 'Status: '],
    'hud.tris': ['üçgen', 'triangles'],
    'st.fallback': ['"En Yüksek" yükleniyor…', 'Loading "Highest"…'],
    'st.init': ['başlatılıyor…', 'starting…'],
    'st.loadingq': ['yükleniyor… ({u})', 'loading… ({u})'],
    'st.loadingpct': ['yükleniyor… %{p}', 'loading… {p}%'],
    'st.loaded': ['✓ {u} yüklendi', '✓ {u} loaded'],
    'st.fail': ['✗ "{u}" açılamadı — daha DÜŞÜK kalite seçin', '✗ Could not open "{u}" — choose a LOWER quality'],
    'st.ctxlost': ['✗ Cihaz bu kaliteyi kaldıramadı — daha DÜŞÜK kalite seçin', '✗ Your device can’t handle this quality — choose a LOWER one'],
    'st.bvh': ['ölçüm dizini hazırlanıyor… (büyük modelde birkaç saniye)', 'preparing measurement index… (a few seconds on big models)'],
    'st.bvhok': ['✓ ölçüm hazır', '✓ measurement ready'],
    'st.bvhfail': ['✗ ölçüm dizini kurulamadı — araçlar yavaş çalışabilir', '✗ measurement index failed — tools may be slow'],
    'm.pick2': ['İki noktaya tıkla — örn. zeminin iki ucu', 'Click two points — e.g. two ends of the ground'],
    'm.dist3d': ['3B mesafe', '3D distance'],
    'm.vert': ['Düşey (yükseklik)', 'Vertical (height)'],
    'm.horiz': ['Yatay', 'Horizontal'],
    'el.pick': ['Bir noktaya tıkla — o noktanın rakımı görünür', 'Click a point — its elevation is shown'],
    'el.elev': ['📍 Rakım: ', '📍 Elevation: '],
    'el.relh': ['📍 Bağıl yükseklik: ', '📍 Relative height: '],
    'pr.pick2': ['İki nokta seç — aradaki yükseklik profili çıkar', 'Pick two points — the elevation profile between them is drawn'],
    'vol.prompt': ['Hacim — alanı çevrele: yüzeye tıkla ({n}/3+ nokta)', 'Volume — enclose an area: click the surface ({n}/3+ points)'],
    'vol.calc': ['Hacmi hesapla', 'Compute volume'],
    'vol.calcing': ['hesaplanıyor…', 'computing…'],
    'vol.vol': ['Hacim: ', 'Volume: '],
    'vol.area': ['  ·  Alan: ', '  ·  Area: '],
    'vol.maxh': ['  ·  Maks yük.: ', '  ·  Max height: '],
    'common.clearbtn': ['Temizle', 'Clear'],
    'common.points': ['nokta', 'points'],
    'ar.prompt': ['Alan — yüzeyi çevrele: yüzeye tıkla ({n}/3+ nokta)', 'Area — enclose the surface: click it ({n}/3+ points)'],
    'ar.calc': ['Alanı hesapla', 'Compute area'],
    'ar.planar': ['Düzlemsel: ', 'Planar: '],
    'ar.surf': ['  ·  Yüzey (3B): ', '  ·  Surface (3D): '],
    'ar.rough': ['  ·  Pürüzlülük: ', '  ·  Roughness: '],
    'tour.run': ['🎬 sinematik tur… %{p}', '🎬 cinematic tour… {p}%'],
    'tour.done': ['✓ tur tamamlandı', '✓ tour finished'],
    'sun.below': ['🌙 Güneş ufkun altında — gölge yok', '🌙 Sun below the horizon — no shadows'],
    'sun.info': ['Güneş yüksekliği: {el}° · Azimut: {az}° ({d})', 'Sun altitude: {el}° · Azimuth: {az}° ({d})'],

    // ===== AKADEMİK LANDING (akademik.html) =====
    'ak.nav.about': ['Hakkında', 'About'],
    'ak.nav.models': ['3B Modeller', '3D Models'],
    'ak.nav.map': ['Harita', 'Map'],
    'ak.nav.pubs': ['Yayınlar', 'Publications'],
    'ak.hero.eyebrow': ['Akademik Portföy', 'Academic Portfolio'],
    'ak.hero.role': ['Erzincan Binali Yıldırım Üniversitesi · Fen-Edebiyat Fakültesi · Coğrafya Bölümü (CBS)',
                     'Erzincan Binali Yıldırım University · Faculty of Arts & Sciences · Department of Geography (GIS)'],
    'ak.hero.bio': ['Coğrafi Bilgi Sistemleri (CBS) ve uzaktan algılama tabanlı fiziki ve beşeri coğrafya araştırmaları yürütüyorum. Başlıca çalışma konularım: doğal afet duyarlılık analizleri (heyelan ve taşkın; AHP / Frekans Oranı yöntemleri), arazi kullanımı ve ekosistem değişimi, göl seviyesi ile orman örtüsü değişimlerinin uydu görüntüleriyle (Landsat, Sentinel) izlenmesi, jeomorfoloji ve jeolojik–kültürel miras (travertenler). Saha verilerini drone fotogrametrisi (Agisoft Metashape) ile yüksek çözünürlüklü 3B model, ortofoto ve sayısal yükseklik modeline (DEM) dönüştürüyorum.',
                    'I conduct physical and human geography research based on Geographic Information Systems (GIS) and remote sensing. My main topics: natural-hazard susceptibility analysis (landslides and floods; AHP / Frequency Ratio methods), land use and ecosystem change, monitoring of lake-level and forest-cover change with satellite imagery (Landsat, Sentinel), geomorphology, and geological–cultural heritage (travertines). I turn field data into high-resolution 3D models, orthophotos and digital elevation models (DEM) via drone photogrammetry (Agisoft Metashape).'],
    'ak.edu.l1': ['Doktora:', 'PhD:'], 'ak.edu.v1': ['Marmara Üniversitesi, Coğrafya (2021)', 'Marmara University, Geography (2021)'],
    'ak.edu.l2': ['Kurum:', 'Institution:'], 'ak.edu.v2': ['EBYÜ, Coğrafya Bölümü — CBS Anabilim Dalı', 'EBYU, Dept. of Geography — GIS Division'],
    'ak.m.pubs': ['Yayın', 'Publications'],
    'ak.m.proj': ['Proje', 'Projects'],
    'ak.tag.gis': ['CBS', 'GIS'], 'ak.tag.rs': ['Uzaktan Algılama', 'Remote Sensing'],
    'ak.tag.haz': ['Doğal Afetler', 'Natural Hazards'], 'ak.tag.land': ['Heyelan', 'Landslides'],
    'ak.tag.flood': ['Taşkın', 'Floods'], 'ak.tag.geom': ['Jeomorfoloji', 'Geomorphology'],
    'ak.tag.photo': ['Fotogrametri', 'Photogrammetry'], 'ak.tag.tr': ['Türkiye Coğrafyası', 'Geography of Türkiye'],
    'ak.c.email': ['✉️ E-posta', '✉️ Email'],
    'ak.qr.t': ['📱 Telefonla aç', '📱 Open on phone'],
    'ak.qr.d': ['Poster/sunumda okut, site açılsın.', 'Scan from a poster or slide to open the site.'],
    'ak.hero.src': ['Bilgiler ve fotoğraf AVESİS profilinden alındı.', 'Information and photo from the AVESİS profile.'],
    'ak.ev.eyebrow': ['Düzenlenen Çalıştay', 'Organized Workshop'],
    'ak.ev.sub': ['Erzincan’ın jeolojik ve kültürel mirası üzerine uluslararası çalıştay — düzenleme kurulunda görevli.',
                  'International workshop on Erzincan’s geological and cultural heritage — member of the organizing committee.'],
    'ak.ev.badge': ['18–20 Haziran 2026 · Erzincan', '18–20 June 2026 · Erzincan'],
    'ak.ev.h3': ['ERJEOKUM 2026 — Erzincan’ın Jeolojik ve Kültürel Mirası Çalıştayı',
                 'ERJEOKUM 2026 — Workshop on the Geological and Cultural Heritage of Erzincan'],
    'ak.ev.meta': ['Erzincan Binali Yıldırım Üniversitesi · “Milyonlarca yıllık jeolojik mirası keşfet”',
                   'Erzincan Binali Yıldırım University · “Discover millions of years of geological heritage”'],
    'ak.ev.body': ['Erzincan bölgesinin jeolojik ve kültürel mirası: travertenler, volkanik yapılar, jeomorfoloji, tarihi mimari ve kültürel koruma. EBYÜ ev sahipliğinde; MTA, UNESCO Türkiye Millî Komisyonu ve jeoloji/coğrafya derneklerinin desteğiyle, dört oturum ve teknik arazi gezileriyle uluslararası katılımlı çalıştay.',
                   'The geological and cultural heritage of the Erzincan region: travertines, volcanic formations, geomorphology, historical architecture and cultural preservation. Hosted by EBYU, with support from MTA, the UNESCO Türkiye National Commission and geology/geography societies; an international workshop with four sessions and technical field trips.'],
    'ak.ev.rolel': ['Görev:', 'Role:'], 'ak.ev.rolev': ['Ulusal Sekreterya', 'National Secretariat'], 'ak.ev.rolep': ['(Düzenleme Kurulu)', '(Organizing Committee)'],
    'ak.ev.btn': ['Çalıştay sitesi →', 'Workshop site →'],
    'ak.md.eyebrow': ['İnteraktif Vitrin', 'Interactive Showcase'],
    'ak.md.sub': ['Fotogrametri (Agisoft Metashape) ile üretilmiş, web’de interaktif arazi modelleri. Döndür, yakınlaş, gerçek metre ile ölç.',
                  'Interactive terrain models produced with photogrammetry (Agisoft Metashape), in the browser. Rotate, zoom, measure in real metres.'],
    'ak.card.view': ['3B Görüntüle →', 'View in 3D →'],
    'ak.meta.surek': ["Fotogrametri · 629 foto · 1199–1420 m", "Photogrammetry · 629 photos · 1199–1420 m"],
    'ak.meta.stadyum': ["Fotogrametri · 555 foto · dokulu 3B mesh", "Photogrammetry · 555 photos · textured 3D mesh"],
    'ak.meta.buzul': ["Fotogrametri · 2710 foto · 2291–2937 m", "Photogrammetry · 2710 photos · 2291–2937 m"],
    'ak.meta.mezra': ["Fotogrametri · 2379 foto · 1181–1760 m", "Photogrammetry · 2379 photos · 1181–1760 m"],
    'ak.meta.kemah': ["Fotogrametri · 1449 foto · 912–1123 m", "Photogrammetry · 1449 photos · 912–1123 m"],
    'ak.meta.otlukbeli': ["Fotogrametri · 1983 foto · 1729–1893 m", "Photogrammetry · 1983 photos · 1729–1893 m"],
    'ak.meta.polat': ["Fotogrametri · 2533 foto · 1324–1533 m", "Photogrammetry · 2533 photos · 1324–1533 m"],
    'ak.meta.tomara': ["Fotogrametri · 3370 foto · 1194–1551 m", "Photogrammetry · 3370 photos · 1194–1551 m"],
    'ak.meta.konarli': ["Fotogrametri · 3169 foto · 1915–2200 m", "Photogrammetry · 3169 photos · 1915–2200 m"],
    'ak.meta.okul': ["Fotogrametri · 639 foto · 1452–1514 m", "Photogrammetry · 639 photos · 1452–1514 m"],
    'ak.lv.ms': ['Yüksek Lisans', 'MSc'], 'ak.lv.bs': ['Lisans', 'BSc'],
    'ak.card.surek': ['Şelale ve çevresinin yüksek çözünürlüklü 3B modeli. Kalite seçici, ölçüm aracı, ortofoto ve renkli DEM içerir.',
                      'High-resolution 3D model of the waterfall and its surroundings. Includes quality selector, measurement tools, orthophoto and color DEM.'],
    'ak.card.stadyum': ['Erzincan Stadyumu ve çevre mahallenin yüksek çözünürlüklü 3B modeli. Kalite seçici; ölçüm, hacim ve wireframe araçları; foto-gerçekçi (Gaussian Splatting) görünüm.',
                        'High-resolution 3D model of Erzincan Stadium and the surrounding neighborhood. Quality selector; measurement, volume and wireframe tools; photorealistic (Gaussian Splatting) view.'],
    'ak.card.buzul': ['Yüksek irtifa buzul (sirk) gölleri ve çevresinin 3B modeli. Kalite seçici; ölçüm, hacim ve wireframe araçları; ortofoto ve renkli DEM (eğim/bakı).',
                      'High-altitude glacial (cirque) lakes and their surroundings in 3D. Quality selector; measurement, volume and wireframe tools; orthophoto and color DEM (slope/aspect).'],
    'ak.card.mezra': ['Mezra arazi modeli — yüksek çözünürlüklü 3B mesh + DEM (yükseklik/eğim/bakı). Ölçüm ve hacim araçlarıyla.',
                      'Mezra terrain model — high-resolution 3D mesh + DEM (elevation/slope/aspect). With measurement and volume tools.'],
    'ak.card.kemah': ['Kemah peribacaları ve çevresinin 3B modeli — mesh + ortofoto + DEM. Kalite seçici; ölçüm, hacim ve wireframe araçları.',
                      '3D model of the Kemah fairy chimneys and surroundings — mesh + orthophoto + DEM. Quality selector; measurement, volume and wireframe tools.'],
    'ak.card.otlukbeli': ['Otlukbeli (Erzincan) gölü ve traverten çevresinin yüksek çözünürlüklü 3B modeli — mesh + ortofoto + DEM (yükseklik/eğim/bakı). Ölçüm, hacim ve wireframe araçlarıyla.',
                          'High-resolution 3D model of Otlukbeli (Erzincan) lake and its travertine surroundings — mesh + orthophoto + DEM (elevation/slope/aspect). With measurement, volume and wireframe tools.'],
    'ak.card.polat': ['Polat Gölü (jips karstı / dolin gölü) ve çevresinin 3B modeli — mesh + ortofoto + DEM (yükseklik/eğim/bakı). Ölçüm, hacim ve wireframe araçlarıyla.',
                      '3D model of Polat Lake (gypsum karst / doline lake) and surroundings — mesh + orthophoto + DEM (elevation/slope/aspect). With measurement, volume and wireframe tools.'],
    'ak.card.tomara': ['Tomara Şelalesi ve çevresinin yüksek çözünürlüklü 3B modeli — mesh + ortofoto + DEM (yükseklik/eğim/bakı). Ölçüm, hacim ve wireframe araçlarıyla.',
                       'High-resolution 3D model of Tomara Waterfall and surroundings — mesh + orthophoto + DEM (elevation/slope/aspect). With measurement, volume and wireframe tools.'],
    'ak.card.konarli': ['Konarlı Şelalesi (Tercan, Erzincan; ~2000 m) ve çevresinin yüksek çözünürlüklü 3B modeli — mesh + ortofoto + DEM (yükseklik/eğim/bakı). Ölçüm, hacim ve wireframe araçlarıyla.',
                        'High-resolution 3D model of Konarlı Waterfall (Tercan, Erzincan; ~2000 m) and surroundings — mesh + orthophoto + DEM (elevation/slope/aspect). With measurement, volume and wireframe tools.'],
    'ak.card.okul': ['Erzincan Binali Yıldırım Üniversitesi Fen-Edebiyat Fakültesi ve çevresinin yüksek çözünürlüklü 3B modeli — mesh + ortofoto + DEM (yükseklik/eğim/bakı). Ölçüm, hacim ve wireframe araçlarıyla.',
                     'High-resolution 3D model of the Faculty of Arts and Sciences of Erzincan Binali Yıldırım University and its surroundings — mesh + orthophoto + DEM (elevation/slope/aspect). With measurement, volume and wireframe tools.'],
    'ak.map.eyebrow': ['Mekânsal', 'Spatial'],
    'ak.map.h2': ['Model Konumları', 'Model Locations'],
    'ak.map.sub': ['Her modelin kapsadığı alan (çerçeve) ve konumu (Erzincan ve Gümüşhane). Sağ üstten uydu (etiketli) / yol / sokak altlığını seçebilirsin; çerçeveye veya pin’e tıkla → 3B modele git.',
                   'Each model’s footprint (frame) and location (Erzincan and Gümüşhane). Pick a satellite (labeled) / road / street basemap at top-right; click a footprint or pin → open the 3D model.'],
    'ak.pub.eyebrow': ['Bilimsel Üretim', 'Scientific Output'],
    'ak.pub.h2': ['Yayınlar', 'Publications'],
    'ak.pub.sub': ['Seçili makaleler. Başlığa tıklayınca makale DOI bağlantısıyla açılır.', 'Selected articles. Click a title to open the article via its DOI. Titles in [brackets] are English translations of Turkish originals.'],
    'ak.pub.all': ['Tüm yayınlar (28) — özet, DOI, bildiriler & kitap bölümleri →', 'All publications (28) — abstracts, DOI, proceedings & book chapters →'],

    // ===== ANA SAYFA (index.html) — ek anahtarlar =====
    'ak.doc.title': ['Dr. Öğr. Üyesi Mehmet Akif Taş — 3B Modeller ve Yayınlar', 'Assist. Prof. Dr. Mehmet Akif Taş — 3D Models and Publications'],
    'ak.title': ['Dr. Öğr. Üyesi', 'Assist. Prof. Dr.'],
    'ak.pl.aria': ['Site yükleniyor', 'Loading site'],
    'ak.pl.eyebrow': ['Akademik Portföy · 3B Arazi Modelleri', 'Academic Portfolio · 3D Terrain Models'],
    'ak.pl.tag': ['Saha modelleri ve yayınlar hazırlanıyor…', 'Preparing field models and publications…'],
    'ak.menu': ['Menü', 'Menu'],
    'ak.scroll': ['Aşağı kaydır', 'Scroll down'],
    'ak.qr.alt': ['Site karekodu', 'Site QR code'],
    'ak.map.aria': ['Model konum haritası', 'Model location map'],
    'ak.map.sat': ['Uydu (etiketli)', 'Satellite (labeled)'],
    'ak.map.road': ['Yol', 'Road'],
    'ak.map.street': ['Sokak', 'Street'],
    // Model adları (kart, yan menü, harita)
    'ak.mn.surek': ['Sürek Şelalesi-Kemah (Erzincan)', 'Sürek Waterfall, Kemah (Erzincan)'],
    'ak.mn.stadyum': ['Erzincan Stadyumu', 'Erzincan Stadium'],
    'ak.mn.buzul': ['Katır Buzul Gölleri-Kemah (Erzincan)', 'Katır Glacial Lakes, Kemah (Erzincan)'],
    'ak.mn.mezra': ['Mezra-Kemah (Erzincan)', 'Mezra, Kemah (Erzincan)'],
    'ak.mn.kemah': ['Peribacaları-Kemah (Erzincan)', 'Fairy Chimneys, Kemah (Erzincan)'],
    'ak.mn.otlukbeli': ['Otlukbeli Gölü-Otlukbeli (Erzincan)', 'Otlukbeli Lake, Otlukbeli (Erzincan)'],
    'ak.mn.polat': ['Polat Gölü-İliç (Erzincan)', 'Polat Lake, İliç (Erzincan)'],
    'ak.mn.tomara': ['Tomara Şelalesi-Şiran (Gümüşhane)', 'Tomara Waterfall, Şiran (Gümüşhane)'],
    'ak.mn.konarli': ['Konarlı Şelalesi-Tercan (Erzincan)', 'Konarlı Waterfall, Tercan (Erzincan)'],
    'ak.mn.okul': ['Fen-Edebiyat Fakültesi – EBYÜ (Erzincan)', 'Faculty of Arts and Sciences – EBYÜ (Erzincan)'],
    'ak.hc.otlukbeli': ['Otlukbeli Gölü', 'Otlukbeli Lake'],
    'ak.hc.stadyum': ['Erzincan Stadyumu', 'Erzincan Stadium'],
    // Yayın başlıkları: resmî başlıklar (Crossref/DergiPark/AVESİS). EN: resmî İngilizce başlık varsa o;
    // yoksa köşeli parantez içinde çeviri (APA usulü). Türkçe büyük harf için toUpperCase kullanılmaz.
    'ak.pub.open': ['Makaleyi aç (DOI)', 'Open the article (DOI)'],
    'ak.pub.t1': ['Otlukbeli (Erzincan) Travertenlerinin Jeolojik-Kültürel Miras Açısından Önemi (Doğu Anadolu)',
                  'The Importance of the Otlukbeli (Erzincan) Travertines in Terms of Geological and Cultural Heritage (Eastern Anatolia)'],
    'ak.pub.t2': ['LandTrendr Algoritması ve Makine Öğrenme Kullanılarak Orman Tahribatı ve İyileşme Süreçlerinin Sınıflandırılması: Milas-Bodrum Örneği',
                  '[Classification of Forest Degradation and Recovery Processes Using the LandTrendr Algorithm and Machine Learning: The Case of Milas-Bodrum]'],
    'ak.pub.t3': ['Comparison of Analytical Hierarchy Process (AHP) and Frequency Ratio (FR) Methods in Landslide Susceptibility Assessment: A Case Study in Kemah-Kömür Stream Basin, Erzincan',
                  'Comparison of Analytical Hierarchy Process (AHP) and Frequency Ratio (FR) Methods in Landslide Susceptibility Assessment: A Case Study in Kemah-Kömür Stream Basin, Erzincan'],
    'ak.pub.t4': ['Assessment of Potential Flood Magnitude in the Endek Stream Basin (Horasan-Erzurum) Using Unit Hydrographs',
                  'Assessment of Potential Flood Magnitude in the Endek Stream Basin (Horasan-Erzurum) Using Unit Hydrographs'],
    'ak.pub.t5': ['Analitik Hiyerarşi Süreci (AHS) Metodu İle Of İlçesi\'nde (Trabzon) Heyelan Risk Duyarlılığı Analizi',
                  '[Landslide Risk Susceptibility Analysis in Of District (Trabzon) Using the Analytic Hierarchy Process (AHP) Method]'],
    'ak.pub.t6': ['Trends of changing land use dynamics in the Terkos Lake basin between 1980 and 2023 and their impact on natural ecosystems',
                  'Trends of changing land use dynamics in the Terkos Lake basin between 1980 and 2023 and their impact on natural ecosystems'],
    'ak.pub.t7': ['Analitik Hiyerarşi Süreci (AHS) Metodu İle Behzat Deresi (Tokat) Havzası Taşkın Risk Analizi',
                  'Flood Risk Analysis of Behzat River (Tokat) Basin with Analytic Hierarchy Process (AHP) Method'],
    'ak.pub.t8': ['Burdur Havzası\'ndaki Göllerde Yaşanan Seviye Değişikliklerinin Coğrafi Bilgi Sistemleri (CBS) ve Uzaktan Algılama (UA) ile Tespiti',
                  '[Detection of Level Changes in the Lakes of the Burdur Basin Using Geographic Information Systems (GIS) and Remote Sensing (RS)]'],
    // Projeler (ad: AVESİS; EN: cv.html ile uyumlu çeviri)
    'ak.proj.t1': ['Marmara Denizinin Güneyinde Bulunan Göl ve Sulak Alanlarda Mekansal Değişimin Coğrafi Bilgi Sistemleriyle Haritalandırılması ve Göllerdeki Ağır Metal Birikim Düzeylerinin Su ve Sediment Örneklerinde İncelenmesi',
                   'Mapping Spatial Change in Lakes and Wetlands South of the Sea of Marmara with Geographic Information Systems and Investigating Heavy-Metal Accumulation Levels in Water and Sediment Samples of the Lakes'],
    'ak.proj.m1': ['BAP Araştırma Projesi · Yürütücü: Şenol C.', 'BAP Research Project · PI: Şenol C.'],
    'ak.proj.t2': ['Konya-Beyşehir Yol Güzergahı Miryokefalon Savaş Yerinin Tespiti', 'Determination of the Myriokephalon Battle Site on the Konya–Beyşehir Route'],
    'ak.proj.m2': ['CB Strateji ve Bütçe Başkanlığı · Yürütücü: Çaycı A.', 'Presidency of Strategy and Budget · PI: Çaycı A.'],
    'ak.proj.t3': ['Erzincan Coğrafya Atlası', 'Erzincan Geography Atlas'],
    'ak.proj.m3': ['BAP Araştırma Projesi · Yürütücü: Akpınar E.', 'BAP Research Project · PI: Akpınar E.'],
    // Dersler (EN: cv.html)
    'ak.crs.1': ['Uzaktan Algılama ve Coğrafi Bilgi Sistemleri', 'Remote Sensing and Geographic Information Systems'],
    'ak.crs.2': ['Havza Bazında Analizler ve Coğrafi Bilgi Sistemleri', 'Basin-Scale Analyses and Geographic Information Systems'],
    'ak.crs.3': ['Coğrafi Bilgi Sistemlerinde İleri Seviye Analizler', 'Advanced Analyses in Geographic Information Systems'],
    'ak.crs.4': ['Coğrafi Bilgi Sisteminde Analizler', 'Analyses in Geographic Information Systems'],
    'ak.crs.5': ['Coğrafi Bilgi Sistemleri 1', 'Geographic Information Systems 1'],
    'ak.crs.6': ['Coğrafi Bilgi Sistemleri 2', 'Geographic Information Systems 2'],
    'ak.crs.7': ['Arazi Uygulamaları', 'Field Applications'],
    'ak.crs.8': ['Mesleki Fotoğrafçılık', 'Professional Photography'],
    'ak.crs.9': ['Mesleki Bilgisayar', 'Professional Computing'],
    'ak.crs.10': ['Mesleki Yabancı Dil', 'Professional Foreign Language'],
    // Tez danışmanlığı (EN: cv.html)
    'ak.th.t1': ['Analitik Hiyerarşi Süreci (AHS) Metodu ile Terme Havzası (Samsun) Taşkın Risk Analizi', 'Flood Risk Analysis of the Terme Basin (Samsun) with the AHP Method'],
    'ak.th.m1': ['Y. Ayvaz · 2023 · Yüksek Lisans', 'Y. Ayvaz · 2023 · MSc'],
    // İletişim + altbilgi
    'ak.con.officev': ['Erzincan Binali Yıldırım Üniversitesi · Fen-Edebiyat Fakültesi · Coğrafya Bölümü — CBS Anabilim Dalı · Erzincan, Türkiye',
                       'Erzincan Binali Yıldırım University · Faculty of Arts and Sciences · Department of Geography — Division of GIS · Erzincan, Türkiye'],
    'ak.con.ext': ['Dahili', 'ext.'],
    'ak.footer.tag': ['Akademik Portföy · Fotogrametri & 3B Modelleme', 'Academic Portfolio · Photogrammetry & 3D Modeling'],
    'ak.footer.legal': ['Tüm modeller ve görüntüler 5846 sayılı FSEK kapsamında korunur; indirme, ekran görüntüsü ve video kaydı yasaktır.', 'All models and images are protected under Turkish Law No. 5846; downloading, screenshots and screen recording are prohibited.'],
    // ===== YAYINLAR (yayinlar.html) =====
    'ya.back': ['← Portföy', '← Portfolio'],
    'ya.h1': ['Yayınlar', 'Publications'],
    'ya.lead': ['Coğrafi Bilgi Sistemleri, uzaktan algılama, doğal afet duyarlılığı ve jeomorfoloji. Her kayıtta özet, DOI, konu etiketleri ve kopyalanabilir APA atıfı.',
                'Geographic Information Systems, remote sensing, natural-hazard susceptibility and geomorphology. Each entry has an abstract, DOI, topic tags and a copyable APA citation.'],
    'ya.s.art': ['Makale', 'Articles'], 'ya.s.proc': ['Bildiri', 'Proceedings'], 'ya.s.book': ['Kitap Bölümü', 'Book Chapters'], 'ya.s.total': ['Toplam', 'Total'],
    'ya.h.art': ['Makaleler', 'Journal Articles'], 'ya.h.proc': ['Bildiriler', 'Conference Proceedings'], 'ya.h.book': ['Kitap Bölümleri', 'Book Chapters'], 'ya.h.phd': ['Doktora Tezi', 'Doctoral Dissertation'],
  };

  function pickLang() {
    const u = new URLSearchParams(location.search).get('lang');
    if (u === 'en' || u === 'tr') { try { localStorage.setItem('lang', u); } catch (e) {} return u; }
    try { const s = localStorage.getItem('lang'); if (s === 'en' || s === 'tr') return s; } catch (e) {}
    return 'tr';
  }
  let lang = pickLang();
  const idx = () => (lang === 'en' ? 1 : 0);
  function tr(key, vars) {
    const e = DICT[key]; let s = e ? (e[idx()] ?? e[0]) : key;
    if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
    return s;
  }
  window.T = tr;
  window.getLang = () => lang;

  function applyStatic(root) {
    const r = root || document;
    r.querySelectorAll('[data-i18n]').forEach(el => { const v = DICT[el.getAttribute('data-i18n')]; if (v) el.textContent = v[idx()] ?? v[0]; });
    r.querySelectorAll('[data-i18n-title]').forEach(el => { const v = DICT[el.getAttribute('data-i18n-title')]; if (v) el.title = v[idx()] ?? v[0]; });
    r.querySelectorAll('[data-i18n-ph]').forEach(el => { const v = DICT[el.getAttribute('data-i18n-ph')]; if (v) el.placeholder = v[idx()] ?? v[0]; });
    r.querySelectorAll('[data-i18n-aria]').forEach(el => { const v = DICT[el.getAttribute('data-i18n-aria')]; if (v) el.setAttribute('aria-label', v[idx()] ?? v[0]); });
    r.querySelectorAll('[data-i18n-alt]').forEach(el => { const v = DICT[el.getAttribute('data-i18n-alt')]; if (v) el.setAttribute('alt', v[idx()] ?? v[0]); });
  }
  // Yeni eklenen data-i18n'leri, URL'ye ?lang eklemeden ve langchange tetiklemeden uygular.
  window.applyI18n = applyStatic;

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function buildSwitch() {
    let host = document.getElementById('lang-switch');
    if (!host) { host = document.createElement('div'); host.id = 'lang-switch'; host.style.cssText = 'position:fixed;top:8px;right:10px;z-index:9999'; document.body.appendChild(host); }
    clear(host);
    host.style.display = 'inline-flex'; host.style.borderRadius = '8px'; host.style.overflow = 'hidden'; host.style.border = '1px solid rgba(255,255,255,.18)';
    ['tr', 'en'].forEach(L => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = L.toUpperCase();
      b.style.cssText = 'background:' + (L === lang ? '#2f6df0' : 'rgba(30,35,44,.85)') + ';color:' + (L === lang ? '#fff' : '#9aa3af') + ';border:0;padding:5px 11px;font-size:12.5px;font-weight:600;cursor:pointer';
      b.onclick = () => setLang(L);
      host.appendChild(b);
    });
  }

  function setLang(L) {
    if (L !== 'tr' && L !== 'en') return;
    lang = L; try { localStorage.setItem('lang', L); } catch (e) {}
    document.documentElement.lang = L;
    // Varsayılan dil (tr) için adres temiz kalır (?lang=tr eklenmez); EN paylaşılabilir olsun diye ?lang=en.
    try {
      const url = new URL(location.href);
      if (L === 'en') url.searchParams.set('lang', 'en'); else url.searchParams.delete('lang');
      if (url.href !== location.href) history.replaceState(history.state, '', url);
    } catch (e) {}
    applyStatic(); buildSwitch();
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: L } }));
  }
  window.setLang = setLang;

  function init() { document.documentElement.lang = lang; applyStatic(); buildSwitch(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
