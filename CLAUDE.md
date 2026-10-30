# BOSS TURNS — proje notları

## Hedefler (sahibinin kararı, değiştirme)
1. **Asıl hedef: Windows PC için `.exe`.** Kurulumsuz ya da hafif kurulumlu bir masaüstü sürümü.
2. **HTML sürümü her zaman kalacak.** Mobilden ve kurulum yapmadan linkten oynamak için. `index.html` tek başına, tarayıcıda çift tıklayınca çalışmaya devam etmeli.
3. Tek kaynak: exe, aynı `index.html`'i paketlemeli. Oyunun ayrı bir kopyası (fork) olmamalı. Masaüstüne özel davranışlar (global patron tuşu, tepsi vb.) HTML'i bozmayacak şekilde, "masaüstündeysek" kontrolüyle eklenmeli.

## Karakter kuralı (sahibinin kararı, değiştirme)
- **Patron her zaman sarışın, 20'li yaşlarında bir kadındır.** Patron tipleri (davranış/taktik) değişebilir ama patron karakteri bu kalır.
- Yağmur'un görünümü gerçek kişiye göre (`buildYagmur`): ortadan ayrık uzun sarı saç (dipler koyu, yüzü çevreleyen açık tutamlar), mavi gözler, uzun kirpikler, çağrı merkezi kulaklığı, kırmızı boyun askısı, altın bileklik. Günlük kombin `outfitFor`: ceketli günler veya siyah tişört + bol pantolon + beyaz ayakkabı.

## Oyuncular (sahibinin kararı)
- Takımın adı **🐒 Keleşli Maymunlar**: ALP, FURKAN, BARANSEL, BULUT. Misafirler: **KAAN** (namıdiğer Cısdık) ve **GÖKBERK** (sporcu). Sıra: ALP, FURKAN, BARANSEL, BULUT, KAAN, GÖKBERK (`CHARACTERS`, logic bloğu). Silah çizme; sadece isim ve 🐒.
- Levellerde oyuncu karakterini seçer; **günlük görevde herkes "günün karakteri" ile oynar** (tarihe göre sırayla döner, `dailyCharFor`).
- Görünümler `LOOKS` tablosunda (app bloğu); gerçek kişilerin fotoğraflarına göre stilize edildi (ALP: fade + kısa sakal, siyah hırka · FURKAN: kalın siyah gözlük, dağınık kahve saç, yeşil · BARANSEL: ince tel gözlük, geriye taranmış saç, lacivert · BULUT: dolgun yüz, kahverengi polo · KAAN: fönlü kabarık saç, keçi sakal, beyaz · GÖKBERK: dalgalı saç, sakal, ter bandı, kırmızı). Fotoğrafları repoya koyma, yalnızca tablodaki parametreleri güncelle.
- Yetenekler (pasif, çekirdek döngüyü değiştirmez): ALP ⚡ Hızlı El (tolerans 0,15 sn) · FURKAN 👂 Kulağı Delik (blöflerin ~3'te 2'sini sezer, ünlem gri "?") · BARANSEL 🙇 Yalaka (Yağmur %5 daha seyrek döner; bakarken çalışıyorsa "Şefim kombin efsane!" balonu; Baransel herkese "şefim" der) · BULUT ☁️ Soğukkanlı (yakalanınca cebin yarısı kasaya) · KAAN 🖥️ ATS Bozuldu (ATS çökme olasılığı %3 yerine %25) · GÖKBERK 🏋️ Basıyo (cep %12 daha hızlı dolar). Sayılar `CONFIG.abilities`'te; hedef her birinin ortalama oyuncuya ≈ +%5 vermesi (`node tools/sim.js` tablosu; 60 sn'lik levellerde şu an +%3–5). Oyun zamanlamaya çok duyarlı: tolerans/uyarıya 0,03 sn bile ≈ +%5 eder.
- Her karakterin masasında kendine özel bir eşya (`CHAR_DESK_PROPS`, masanın sol ön köşesi: kaşe, modem, ayna, bitki çayı + zen taşı, ATS kutusu, shaker + dambıl) ve kendine özel bekleme animasyonu (`animatePlayer`: Gökberk omuz esnetme, Kaan fön düzeltme, Furkan hızlı klavye, Bulut arkaya yaslanma, Baransel Yağmur'u kesme, Alp sakin yazma) var.
- Ana menüde "KARAKTERLER" sekmesi: seçim kaydedilir, "Mesaiye başla" doğrudan seçili karakterle başlar.
- Ekrandaki GİZLE butonu sahibinin isteğiyle kaldırıldı; patron tuşu yalnızca klavyede (Esc) ve masaüstünde (Ctrl+Shift+Boşluk) duruyor. Butonu geri ekleme.
- **Market (sahibinin kararı): yalnızca görünüm satar** (şapka, laptop çıkartması, masa süsü, sandalye). Oyun avantajı satma; günlük görev adil kalmalı. Para = maaş: her tur sonunda kasanın onda biri (`salaryFor`). Katalog `SHOP_ITEMS` (logic), 3D parçalar `COSMETIC` (app). Kalıcı veriler: `bossturns.wallet`, `bossturns.shop` (localStorage).

## Tema: çağrı merkezi (sahibinin kararı)
- Oyun bir **çağrı merkezi ofisi** simülasyonu. Yağmur = takım lideri. Oyuncular kulaklıklı temsilciler.
- İç şaka: **"HEDEF 10.000"** (poster + duvardaki canlı çağrı ekranı + kariyerin zirvesi). Gerçek şirket adı/logosu kullanma.
- Duvar ekranı (`drawBoard`): bekleyen çağrı oyuncu basılı tuttukça artar, bıraktıkça azalır (yalnızca görsel).
- Esc tablosu çağrı merkezi KPI raporu (AHT, FCR, CSAT).
- İç şakalar: "KAAN ATS BOZULDU" (ATS olayı: Yağmur uzun süre meşgul, `CONFIG.ats`) · "Primler 5'e katlanacak" (tur ortası duyuru, sonda İPTAL EDİLDİ) · "Bi kısa mola" (kahve molası ekranı) · "Bi terasa çıkalım" (kapı tabelası TERAS, son canda banner) · Yağmur ofiste oyun oynayana kızar.
- Replik havuzları (app bloğu, sahibinin listesi): `CHAR_LINES` (karakterin kafasının üstünde, en sık ~15 sn'de bir; Alp kıdem/faks, Furkan teknoloji, Baransel "şefim", Bulut "iletişim uzmanıyım", Kaan prim/75 öğrenci/ATS, Gökberk SKS/"moruk") · `CATCH_LINES` (Yağmur kimi yakalarsa ona laf, %60) · `SCOLD_LINES` · `SHRUG_LINES` (blöf sonrası) · `ATS_LINES` · `GAG_BANNERS` (üst şerit, turda ~1–2 kez). Marka adı yazma (ör. "çikolatalı gofret").
- **LEVELLER (sahibinin kararı, Cut the Rope mantığı):** ana oyun 5 bölüm × 5 level (`CHAPTERS`, `LEVELS`, `LEVEL_QUOTAS`). Her bölüm Yağmur'un bir ruh hali (zorluk sırası simle ölçüldü): Kahvesiz → Sakin → Şüpheci → Hedef Toplantısı Sonrası → Telaşlı (final). Level = ~60 sn'lik kısa mesai (`CONFIG.level`), Yağmur'un ruh hali bölüme sabit, zorluk `d` levelle artar. Kota = 1★, 2★/3★ kotanın 1,15/1,3 katı; kovulursan 0★. Geçince sonraki level açılır; level kutularında kota yazar, bölümün son levelini geçince özet ekranında "BÖLÜM n TAMAM!" kutlaması çıkar. İlerleme `bossturns.levels` (localStorage). Kotalar `node tools/sim.js 400 --levels` tablosuyla ayarlanır: ortalama oyuncu 1. bölümü ~%80–95, son leveli ~%12 geçer (5. bölüm kotaları 680→660).
- Kariyer artık genel ilerleme: terfi, leveller boyunca toplanan **toplam yıldıza** göre (`CAREER_RANKS[].stars`, 75 yıldız üzerinden). Kariyer ekranı "Geçilen Level" ve "3★" sayısını gösterir. Eski anlık görev/laptop projesi sistemleri kodda duruyor ama oyunda sessiz (afişleri kapalı); başarımları levellere uyarlandı.
- Günlük görev ayrı mod olarak kalır (tarihe bağlı seed, günün karakteri), mesaisi kısaltıldı (`CONFIG.shift`, ≤ ~80 sn).

## Kısıtlar
- Tek giriş: basılı tut / bırak. Yeni kontrol ekleme.
- Çekirdek döngüyü (tut/bırak/patron) değiştirmeden önce sahibine sor.
- Arayüz Türkçe. Telifli karakter veya marka yok. `prefers-reduced-motion`'a saygı göster.
- Bir level ~1 dakika, günlük tur ~1,5 dakikayı geçmemeli. Ses varsayılan olarak kapalı. Mesai saati 08:00–17:00 (`CONFIG.startHour/endHour`).
- `index.html` tek dosya ve internetsiz çalışır: CDN yok. Three.js (3D) ve Lilita One yazı tipi dosyanın İÇİNE gömülüdür (`npm install && npm run vendor` yeniden üretir; `/*VENDOR:…*/` işaretleri arasına elle dokunma).

## Yapı
- `index.html` üç script bloğundan oluşur:
  - `<script id="logic">`: CONFIG → RNG → oyun mantığı (DOM'suz, Node'dan yüklenebilir). Yağmur'un ruh halleri (`BOSSES`) ve günlük kombin (`outfitFor`) burada.
  - `<script id="three">`: gömülü Three.js (üretilmiş, düzenleme).
  - `<script id="app">`: 3D sahne, Yağmur/oyuncu modelleri ve animasyonları, Clash tarzı DOM HUD, ses, giriş.
- Yerleşim: geniş ekran (PC, 1920×1080 referans) ve dar ekran (telefon, 1080 genişlik referans). HUD bu referansta tasarlanıp ölçeklenir.
- Görsel stil (sahibinin kararı): 3D sahne **klasik yumuşak görünümde** kalır (`MeshStandardMaterial`, ACES ton eşleme, kontursuz). Çizgi film (toon + kontur) denendi ve sahibi beğenmedi; geri getirme. Arayüz ise sade (aşağıdaki kural). Telifli varlık/logo/karakter kullanma.
- Sadelik kuralı: oyun sırasında ekranda yalnızca skor (+ ince kota çubuğu; 1★/2★ eşikleri `.qTick` çentikleriyle, yıldız kazanınca ses), saat, canlar ve tek durum butonu. Cep, oyuncunun kafasının üstünde yüzer (`#pocketFloat`). Ana menüde kart yok; sahne görünür, tek büyük buton + yuvarlak ikonlar. Yeni HUD öğesi eklemeden önce "oyuncu bunu oyun sırasında okumak zorunda mı?" diye sor.
- `package-lock.json` ve `src-tauri/Cargo.lock` repoda kalmalı (exe derlemesi ve `npm ci` bunlara dayanır); silme.
- Yazı hiyerarşisi (sahibinin kararı): logo = Lilita One + kalın kontur (`.t`, yalnızca logo) · başlık/buton = Fredoka 700 + ince kontur (`.h`) · saat/para/puan = Nunito 800 (`.num`) · açıklama/kural = Nunito 600, kontursuz (`.body`). Küçük metne kalın kontur verme.
- `tools/sim.js`: denge simülasyonu (`node tools/sim.js 2000`).
- `tools/smoke.js`: Playwright testleri (`node tools/smoke.js`, WebGL yazılımla çizilir, birkaç dakika sürer). Değişiklikten sonra ikisini de çalıştır.
- `src-tauri/`: Tauri 2 masaüstü kılıfı. `tools/build-dist.js` index.html'i `dist/` klasörüne kopyalar. `main.rs`'te global patron tuşu (Ctrl+Shift+Boşluk) ve tepsi var; pencere gizlenirken `window.__btDesktopHide()` çağrılır.
- `.github/workflows/desktop.yml`: Windows exe derlemesi. `v*` etiketi atılınca Releases'a yükler.
- Denge sabitleri yalnızca `CONFIG`'te. Hedef: ortalama oyuncu ilk canını medyan ~6. basışta kaybetsin.
