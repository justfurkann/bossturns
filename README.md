# BOSS TURNS — Patron Dönüyor!

Ofiste sıkılanlar için 1–3 dakikalık, tek tuşlu bir "şansını zorla" oyunu.
Laptopta gizlice oyun oynuyorsun, patronun **Yağmur** arkandaki koridorda geziyor.

3D sahne, Clash tarzı arayüz. PC'de yatay (1920×1080), telefonda dikey yerleşim.

## Nasıl açılır

**Tarayıcı / telefon:** `index.html` dosyasını çift tıklayıp tarayıcıda açman yeterli. Kurulum yok, internet de gerekmiyor.
Dosyayı herhangi bir statik sunucuya (GitHub Pages vb.) koyarsan linkten de oynanır.

**Windows (exe):** Repodaki **Releases** sayfasından iki dosya indirilebilir:
- `BOSS-TURNS-tasinabilir.exe`: kurulumsuz, çift tıkla ve oyna (~4 MB).
- `…-setup.exe`: kurulumlu sürüm, Başlat menüsüne ekler.

Masaüstü sürümüne özel özellikler:
- **Global patron tuşu: Ctrl+Shift+Boşluk.** Oyun penceresi odakta olmasa bile anında kaybolur, oyun duraklar. Tekrar basınca geri gelir.
- **Sistem tepsisi simgesi:** tıklayınca göster/gizle, sağ tıkla çıkış.

Exe imzasız olduğu için Windows ilk açılışta "Bilgisayarınız korundu" diyebilir: **Ek bilgi → Yine de çalıştır**.
Şirket bilgisayarlarında BT politikası imzasız programları tamamen engelleyebilir; o durumda tarayıcı sürümü her zaman çalışır.

## Nasıl oynanır

| Hareket | Ne olur |
|---|---|
| **Basılı tut** (dokun / fare / Boşluk) | Gizlice oynarsın, **cep** dolar. Ne kadar uzun tutarsan o kadar hızlı dolar. |
| **Bırak** | Cep **kasaya** girer, artık güvende. |
| Patronun üstünde **❗** | Kafasını çeviriyor, hemen bırak! Bazen blöftür. |
| Patron **bakarken** basılıysan | Yakalanırsın: cepteki puan gider, bir can gider. Tekrar oynamak için önce bırakman gerekir. |
| Saat **18:00** | Mesai biter, kalan her can +100 puan. |

- **4 oyuncu: ALP, FURKAN, BARANSEL, BULUT.** "Mesaiye başla" deyince karakterini seçersin. Her gün sırayla biri **günün karakteri** olur; günlük görevde herkes onunla oynar, böylece skorlar adil karşılaştırılır.
- **3 can** var. Her tur sıfırdan başlar. Kalıcı olarak saklanan tek şey en iyi skor.
- Puan arttıkça **Yağmur'un ruh hali değişir**: 🙂 Sakin, 😴 Kahvesiz (yavaş döner, uzun bakar), 📱 Telaşlı (hızlı döner, kısa bakar), 🤨 Şüpheci (blöf ustası, bazen çifte döner), 😎 Patron Modu (her seferinde başka taktik).
- **Yağmur'un kombini her gün değişir** (ceket, alt parça, saç, aksesuar). Aynı gün herkes aynı kombini görür.
- **Kahve molası:** 250, 800 ve 1600 puanda 3 avantajdan birini seçersin. Seçim yalnızca o tur için geçerli. Parlayan kart sırayla değişir: basınca parlayan seçilir ya da istediğin karta doğrudan dokunabilirsin.
- **📅 Günlük görev:** Seçenekler tarihe bağlı. Aynı gün oynayan herkes aynı patron sırasını ve aynı rastgele diziyi görür. Tur sonunda Wordle tarzı emoji özetini **Kopyala** ile paylaşabilirsin
  (🟩 kasaya attın · 🟨 kıl payı · 🟥 yakalandın · 🟦 kalkan kurtardı).
- **🫣 / Esc = patron tuşu:** Ekranı sahte bir tabloyla kaplar ve oyunu durdurur. Tekrar Esc'e ya da ↩'ye basınca geri dönersin.
- **Ses varsayılan olarak kapalı** (sağ üstteki 🔇). Sayfa her açıldığında yine kapalı başlar.
- Sistemde "hareketi azalt" ayarı açıksa sarsıntı, parçacıklar ve yanıp sönmeler kapanır.

## Geliştirici notları

- Tek dosya: `index.html` (~790 KB). Üç bölüm: oyun mantığı (`<script id="logic">`, DOM'suz), gömülü Three.js (`<script id="three">`) ve 3D sahne + arayüz (`<script id="app">`).
- Three.js ve yazı tipleri (Lilita One, Fredoka, Nunito — hepsi OFL) dosyanın içine gömülüdür; internet ya da CDN gerekmez. Güncellemek için: `npm install && npm run vendor`.
- Tarayıcının WebGL desteklemesi gerekir (bütün güncel tarayıcılar destekler).
- Denge sabitlerinin hepsi `CONFIG` nesnesinde.
- `node tools/sim.js 2000` komutu, oyun mantığını tarayıcı olmadan 3 farklı oyuncu modeliyle oynatıp ilk canın kaçıncı basışta gittiğini, tur süresini ve skoru raporlar.
  Bir sabiti denemek için: `node tools/sim.js 2000 '{"warn":[0.85,0.38]}'`
- `node tools/smoke.js` komutu Playwright ile masaüstü, mobil dokunmatik ve hareket azaltma testlerini koşturur (WebGL yazılımla çizildiği için birkaç dakika sürer). Playwright kurulu olmalı.
- **Masaüstü sürümü (Tauri 2):** `src-tauri/` klasöründe. Aynı `index.html`'i paketler; oyunun ayrı bir kopyası yok.
  - **Sürüm çıkarma:** GitHub'da Actions → "Masaüstü (Windows exe)" → **Run workflow** → sürüm kutusuna ör. `v0.2.0` yaz. Exe'ler derlenip Releases sayfasına konur. `git tag v0.2.0 && git push origin v0.2.0` de aynı işi yapar. `main`'e oyunla ilgili her push'ta da exe, Actions sekmesinde "Artifacts" olarak oluşur.
  - **Kendi makinende derlemek istersen:** Rust ve Node gerekir, sonra `npx @tauri-apps/cli@2 build`.
