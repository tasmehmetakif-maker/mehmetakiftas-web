/* yayinlar.html — yayın başlıkları, özetler ve etiketlerin İngilizce karşılıkları.
 * Dil EN iken .pt/.abs/.t ve [data-en] öğeleri İngilizce gösterilir; TR'ye dönünce orijinal
 * (Türkçe) geri gelir (orijinal dataset.tr'de saklanır -> kaybolmaz).
 * Eşleme SIRAYA DEĞİL, her .pub bloğunun data-id özniteliğine bağlıdır: yeni kayıt eklemek
 * mevcut çevirileri kaydırmaz. Anahtarı burada olmayan bloklar Türkçe kalır.
 * t: başlık (yoksa TR başlık kalır), a: özet (yoksa TR özet kalır).
 * İngilizce yayımlanmış kayıtlarda t, resmî (Crossref/DergiPark) başlığın kendisidir;
 * resmî İngilizce başlığı olan Türkçe makalelerde (TJB, Behzat, IGGE, Burdur, LandTrendr, Of) o başlık kullanılır.
 * LandTrendr ve Of başlıklarını yazar bildirdi (2026-11-11); Burdur başlığı DergiPark makale sayfasındaki İngilizce başlıktır.
 */
window.PUBS_EN = {
  /* ===== Makaleler ===== */
  'a-tjb2026': {
    t: "The Importance of the Otlukbeli (Erzincan) Travertines in Terms of Geological and Cultural Heritage (Eastern Anatolia)",
    a: "The Otlukbeli travertines (Erzincan) are evaluated as geological and cultural heritage (a geosite). The area hosts a travertine barrier lake (Otlukbeli Lake) formed by rare mineral-rich waters, together with travertine cones, chimneys, terraces and ridges."
  },
  'a-landtrendr2026': {
    t: "Classification of Forest Disturbance and Recovery Dynamics Using the LandTrendr Algorithm and Machine Learning: A Case Study of Milas-Bodrum",
    a: "Forest dynamics in the Milas-Bodrum area over 2013–2024 are analyzed with remote sensing and machine learning. An NBR time series from 49 Landsat 8 images is processed with LandTrendr and classified into “Healthy / Degradation / Recovery” using Random Forest. “Degradation” fell to 24% over 2014–2021, then jumped to 47% after the major 2021 wildfire; by 2024 “Recovery” reached 29%."
  },
  'a-ege2025': {
    t: "Comparison of Analytical Hierarchy Process (AHP) and Frequency Ratio (FR) Methods in Landslide Susceptibility Assessment: A Case Study in Kemah-Kömür Stream Basin, Erzincan",
    a: "Landslide susceptibility in the Kömür Stream Basin (Kemah, Erzincan) is mapped and compared using the AHP and Frequency Ratio (FR) methods. The FR model (AUC=0.884, F1=0.87) outperformed AHP (AUC=0.699, F1=0.68); 92.7% of existing landslides fell into the “High/Very High” class on the FR map and 73.7% on the AHP map."
  },
  'a-menba2024': {
    t: "Assessment of Potential Flood Magnitude in the Endek Stream Basin (Horasan-Erzurum) Using Unit Hydrographs",
    a: "Flood hazard in the Endek Stream and Kırmızı Stream basins (Horasan-Erzurum) is assessed with unit hydrographs and GIS. Flow direction/accumulation/slope are derived from a 25 m DEM. Peak discharge reaches 14,408 m³/s in ~18.5 h for Endek and 4,251 m³/s in ~2.5 h for Kırmızı; the model was validated by correctly predicting the 2010 Saçlık Village flood (6 fatalities)."
  },
  'a-afet2024': {
    t: "Landslide Risk Susceptibility Analysis in Of District (Trabzon) by Analytical Hierarchy Process (AHS) Method",
    a: "Landslide risk in Of district (Trabzon) is analyzed with the AHP method integrated in GIS. 60 km² (23% of the district) was found to be risky/very risky, 67.7 km² (26%) moderate, and 132.4 km² (51%) low/very low landslide risk."
  },
  'a-flsrt2023': {
    t: "Trends of changing land use dynamics in the Terkos Lake basin between 1980 and 2023 and their impact on natural ecosystems",
    a: "The degradation of natural ecosystems by population, agricultural, industrial and transport pressure in the Terkos (Durusu) Lake basin (Istanbul) over 1980–2023 is examined. Areas affected by airport expansion, the motorway and urbanization are mapped and the decline in vegetation cover is documented."
  },
  'a-behzat2022': {
    t: "Flood Risk Analysis of Behzat River (Tokat) Basin with Analytic Hierarchy Process (AHP) Method",
    a: "The Behzat Stream Basin, repeatedly struck by floods between 1839–1961 south of central Tokat, is examined with AHP. The southwestern and northern parts of the ~25,041 ha basin are highly fragile; ~9,747 ha (38.9%) are moderate and ~1,372 ha (5.4%) high flood-risk areas."
  },
  'a-burdur2021': {
    t: "Detection of Level Changes in Lakes in Burdur Basin with Geographical Information Systems (GIS) and Remote Sensing (RS)",
    a: "Water-level changes in six lakes of the Burdur Basin (Burdur, Acıgöl, Akgöl, Yarışlı, Karataş, Salda) over 1985–2021 are investigated using LANDSAT imagery with RS and GIS. Except for Salda, the lakes have largely receded; Acıgöl shrank by 80% and Akgöl dried up completely."
  },
  'a-jisr2020': {
    t: "Determination of the Effects of the 17-18 July 2019 Flood Disaster in the Melen Stream Basin on the Villages of Uğurlu, Esmahanım, Dilaver and Davutağa (Akçakoca) Using Geographic Information Systems (GIS) Software",
    a: "The impact of the 17–18 July 2019 flood on the villages of Esmahanım, Uğurlu, Davutağa and Dilaver in Akçakoca (Düzce) is mapped with Landsat 8 and Sentinel 2 imagery. About 50% of the studied settlements were damaged and found unprepared for sudden rainfall."
  },
  'a-igge2019': {
    t: "Development and Distribution of Gated Communities and Their Effects on Neighborhood Structure in Üsküdar",
    a: "The spread, floor counts, building types, founding years and market values of 260 gated/secured communities built in Üsküdar between 1980–2017 are mapped with ArcGIS Pro. The communities are not homogeneously distributed across neighborhoods and the trend is rising rapidly; their differences from the traditional neighborhood structure are discussed."
  },
  'a-mcd2015': {
    t: "The Effect of the Structure and Relief of the Coastal Strip Between Kumköy and İğneada on Planning Criteria",
    a: "The physical potential (relief, climate, soil, vegetation, hydrography) of the coastal section between Kumköy and İğneada and its role in regional planning and development are examined; targets and criteria to shape the area’s development are presented."
  },
  /* ===== Bildiriler ===== */
  'p-polat2026': {
    t: "Geological-Geomorphological Significance and Geoheritage Potential of Polat Lake"
  },
  'p-otlukbeli-jeopark2026': {
    t: "Geological-Cultural Heritage of the Otlukbeli Travertines and the Erzincan-Otlukbeli Geopark Potential"
  },
  'p-ergen2026': {
    t: "New Examples of Geological Heritage Sites in Erzincan"
  },
  'p-konarli2026': {
    t: "Konarlı Waterfall Field Study (Tercan, Erzincan): Preliminary Findings and Geotourism Potential"
  },
  'p-tjk-kultur2026': {
    t: "A Study of the Otlukbeli Travertines (Erzincan) from the Perspective of Cultural Geology and Geological Heritage",
    a: "The Otlukbeli travertines are addressed from the perspective of cultural geology and geological heritage (conference presentation of the related Geological Bulletin of Turkey article)."
  },
  'p-tjk-jeomorf2026': {
    t: "Geomorphological and Sedimentological Study of the Otlukbeli Travertines (Erzincan)",
    a: "The geomorphological forms (travertine cone, chimney, terrace) and sedimentological features of the Otlukbeli travertines are examined."
  },
  'p-jeomorf-sem2024': {
    t: "Comparative Landslide Susceptibility Analysis of the Kömür Stream (Kemah-Erzincan) Basin Using the Analytic Hierarchy Process (AHP) and Frequency Ratio (FR) Methods"
  },
  'p-iuck2023': {
    t: "Landslide Risk Analysis of Of District (Trabzon) with the Analytic Hierarchy Process (AHP) Method",
    a: "A landslide risk analysis of Of district with the AHP method is presented (conference version of the related Journal of Disaster and Risk article)."
  },
  'p-ucek2022': {
    t: "Detection of Relocated Settlements in Erzincan Province with Geographic Information Systems (GIS) and Remote Sensing (RS)",
    a: "Detection of settlements relocated for natural and human reasons in Erzincan, using GIS and remote sensing."
  },
  'p-ucek2021': {
    t: "Detection of Level Changes in Lakes in Burdur Basin with Geographical Information Systems (GIS) and Remote Sensing (RS)",
    a: "Detection of water-level changes in the lakes of the Burdur basin with GIS and remote sensing (conference version of the related Eastern Geographical Review article)."
  },
  'p-turkdunya2020': {
    t: "Land-Use Changes in the Erzincan Plain Between 1955 and 2018",
    a: "Land-use changes in the Erzincan Plain over the 1955–2018 period are addressed."
  },
  'p-cudes2017': {
    t: "A Geographical Approach to the Gated-Community Trend in the Residential Areas of Üsküdar",
    a: "A geographical approach to the gated-community trend in the residential areas of Üsküdar (early/conference version of the related IGGE article)."
  },
  /* ===== Kitap (başlık çeviridir; Zenodo kaydında yalnız Türkçe başlık var) ===== */
  'k-melen2026': {
    t: "Melen Stream Basin: Geographical Planning and Integrated Basin Management",
    a: "The physical and human characteristics of the Melen Stream Basin are analyzed and synthesized with a range of methods, chiefly Geographic Information Systems, and projections for the future are made. The findings are evaluated in light of national and international action plans and implementation provisions, setting out holistic goals and strategies centered on protecting people and nature."
  },
  /* ===== Kitap bölümleri ===== */
  'b-rize2023': {
    t: "Change Trend of the Rize Coastal Strip and Shoreline Between 1983 and 2023 Using Multispectral Satellite Imagery",
    a: "Coastal changes in Rize are re-evaluated with multispectral satellite imagery over a 40-year period, with broad geographical coverage and a fresh perspective."
  },
  'b-erzincan2022': {
    t: "Relocated Settlements in Erzincan Province",
    a: "Settlements relocated for natural and human reasons in Erzincan province are examined."
  },
  'b-tokat-afet2022': {
    t: "Natural Disasters in Tokat Province",
    a: "The natural disasters seen in Tokat province (floods, mass movements/landslides, earthquakes) are addressed from a geographical perspective."
  },
  'b-tokat-toprak2022': {
    t: "Soil Properties of Tokat Province",
    a: "The soil types, distribution and geographical characteristics of Tokat province are addressed."
  },
  'b-duzce2022': {
    t: "Main Waterfalls and Tourism Potential in Düzce Province",
    a: "The main waterfalls in Düzce province and their tourism potential are evaluated from a geographical perspective."
  },
  /* ===== Veri seti (İngilizce yayımlandı; başlık aynı kalır) ===== */
  'd-polat2026': {},
  /* ===== Tez ===== */
  't-phd2021': {
    t: "Geographical Planning of the Melen Stream Basin and Integrated Basin Management"
  }
};

/* Tür/indeks etiketleri (.t.ix) — ESCI/Scopus/TR Dizin/CC BY 4.0 aynı kalır */
window.PUBS_EN_LBL = {
  'Özet Bildiri': 'Conference Abstract',
  'Bildiri': 'Conference Paper',
  'Yayımlanmamış Bildiri': 'Unpublished Presentation',
  'Kitap': 'Book',
  'Kitap Bölümü': 'Book Chapter',
  'Doktora Tezi': 'Doctoral Dissertation',
  'Yüksek Lisans Tezi': 'Master’s Thesis',
  'Veri Seti': 'Dataset',
  'Açık Erişim': 'Open Access',
  'Hakemli': 'Peer-reviewed'
};

/* Konu etiketleri (.t.kw) */
window.PUBS_EN_KW = {
  'Traverten': 'Travertine', 'Jeolojik Miras': 'Geological Heritage', 'Jeomorfoloji': 'Geomorphology',
  'Uzaktan Algılama': 'Remote Sensing', 'Orman': 'Forest', 'Makine Öğrenmesi': 'Machine Learning',
  'Heyelan': 'Landslide', 'Frekans Oranı': 'Frequency Ratio', 'CBS': 'GIS', 'AHS': 'AHP',
  'Taşkın': 'Flood', 'Birim Hidrograf': 'Unit Hydrograph', 'Hidroloji': 'Hydrology',
  'Risk Analizi': 'Risk Analysis', 'Arazi Kullanımı': 'Land Use', 'Ekosistem': 'Ecosystem',
  'Göl Seviyesi': 'Lake Level', 'Kuraklık': 'Drought', 'Sel': 'Flash Flood', 'Afet': 'Disaster',
  'Kentleşme': 'Urbanization', 'Kapalı Site': 'Gated Community', 'Şehir Coğrafyası': 'Urban Geography',
  'Kıyı': 'Coast', 'Planlama': 'Planning', 'Kültürel Jeoloji': 'Cultural Geology',
  'Sedimantoloji': 'Sedimentology', 'Yerleşme': 'Settlement', 'Kıyı Çizgisi': 'Shoreline',
  'Doğal Afet': 'Natural Hazards', 'Toprak': 'Soil', 'Şelale': 'Waterfall', 'Turizm': 'Tourism',
  'Havza Yönetimi': 'Basin Management', 'Coğrafi Planlama': 'Geographical Planning',
  'Jeomiras': 'Geoheritage', 'Jeopark': 'Geopark', 'Jeoturizm': 'Geotourism',
  'İHA-SfM': 'UAV-SfM', 'Polat Gölü': 'Polat Lake', 'Jeomorfometri': 'Geomorphometry'
};

/* Dergi/kurum etiketleri (.t.jrnl) — yalnız resmî İngilizce adı doğrulananlar
 * (Crossref container-title veya derginin DergiPark İngilizce sayfası). Öteki özel adlar özgün kalır. */
window.PUBS_EN_JRNL = {
  'Türkiye Jeoloji Bülteni': 'Geological Bulletin of Turkey',
  'Ege Coğrafya Dergisi': 'Aegean Geographical Journal',
  'Menba Kastamonu Ü. Su Ürünleri Fak. Dergisi': 'Menba Kastamonu University Faculty of Fisheries Journal',
  'Afet ve Risk Dergisi': 'Journal of Disaster and Risk',
  'Erzincan Ü. SBE Dergisi': 'Erzincan University Journal of Graduate School of Social Sciences',
  'Doğu Coğrafya Dergisi': 'Eastern Geographical Review',
  'Marmara Üniversitesi': 'Marmara University'
};

(function () {
  var TITLE_EN = 'Publications — Asst. Prof. Dr. Mehmet Akif Taş';
  var GS_TIP = ['Makaleyi aç / ara (Google Scholar)', 'Open / search the article (Google Scholar)'];

  function swapText(el, map, en) {
    if (el.dataset.tr == null) el.dataset.tr = el.textContent.trim();
    el.textContent = (en && map[el.dataset.tr]) ? map[el.dataset.tr] : el.dataset.tr;
  }

  function apply() {
    var en = !!(window.getLang && window.getLang() === 'en');
    var T = window.PUBS_EN || {};

    var de = document.documentElement;
    if (de.dataset.titleTr == null) de.dataset.titleTr = document.title;
    document.title = en ? TITLE_EN : de.dataset.titleTr;

    document.querySelectorAll('.pub').forEach(function (pub) {
      var rec = T[pub.dataset.id] || {};
      var pt = pub.querySelector('.pt'), ab = pub.querySelector('.abs');
      if (pt) {
        var a = pt.querySelector('a');
        var holder = a || pt;
        if (holder.dataset.tr == null) holder.dataset.tr = holder.textContent;
        var title = (en && rec.t) ? rec.t : holder.dataset.tr;
        holder.textContent = title;
        if (a && a.dataset.gs === '1') {
          a.href = 'https://scholar.google.com/scholar?q=' + encodeURIComponent(title);
          a.title = GS_TIP[en ? 1 : 0];
        }
      }
      if (ab) {
        if (ab.dataset.tr == null) ab.dataset.tr = ab.textContent;
        ab.textContent = (en && rec.a) ? rec.a : ab.dataset.tr;
      }
    });

    document.querySelectorAll('.t.ix').forEach(function (s) { swapText(s, window.PUBS_EN_LBL || {}, en); });
    document.querySelectorAll('.t.kw').forEach(function (s) { swapText(s, window.PUBS_EN_KW || {}, en); });
    document.querySelectorAll('.t.jrnl').forEach(function (s) { swapText(s, window.PUBS_EN_JRNL || {}, en); });

    // Düz metinli statik öğeler: data-en="İngilizce" (alt öğesi olmayan düğümler)
    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (el.dataset.tr == null) el.dataset.tr = el.textContent;
      el.textContent = en ? el.getAttribute('data-en') : el.dataset.tr;
    });
  }
  window.applyPubLang = apply;
  window.addEventListener('langchange', apply);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
})();
