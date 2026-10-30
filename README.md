# BOSS TURNS — Patron Dönüyor!

Ofiste sıkılanlar için 1–3 dakikalık, tek tuşlu bir "şansını zorla" oyunu.
Laptopta gizlice oyun oynuyorsun, patron arkandaki koridorda geziyor.

## Nasıl açılır

`index.html` dosyasını çift tıklayıp tarayıcıda açman yeterli. Kurulum yok, internet de gerekmiyor.
Telefonda da çalışıyor: dosyayı herhangi bir statik sunucuya (GitHub Pages vb.) koyup bağlantıyı açabilirsin.

## Nasıl oynanır

| Hareket | Ne olur |
|---|---|
| **Basılı tut** (dokun / fare / Boşluk) | Gizlice oynarsın, **cep** dolar. Ne kadar uzun tutarsan o kadar hızlı dolar. |
| **Bırak** | Cep **kasaya** girer, artık güvende. |
| Patronun üstünde **❗** | Kafasını çeviriyor, hemen bırak! Bazen blöftür. |
| Patron **bakarken** basılıysan | Yakalanırsın: cepteki puan gider, bir can gider. Tekrar oynamak için önce bırakman gerekir. |
| Saat **18:00** | Mesai biter, kalan her can +100 puan. |

- **3 can** var. Her tur sıfırdan başlar. Kalıcı olarak saklanan tek şey en iyi skor.
- Puan arttıkça **patron değişir**: Takım Lideri, Kaplumbağa Müdür (yavaş döner, uzun bakar), Şimşek Koordinatör (hızlı döner, kısa bakar), Kurnaz Direktör (blöf ustası, bazen çifte döner), Genel Müdür (her seferinde başka taktik).
- **Kahve molası:** 250, 800 ve 1600 puanda 3 avantajdan birini seçersin. Seçim yalnızca o tur için geçerli. Parlayan kart sırayla değişir: basınca parlayan seçilir ya da istediğin karta doğrudan dokunabilirsin.
- **📅 Günlük görev:** Seçenekler tarihe bağlı. Aynı gün oynayan herkes aynı patron sırasını ve aynı rastgele diziyi görür. Tur sonunda Wordle tarzı emoji özetini **Kopyala** ile paylaşabilirsin
  (🟩 kasaya attın · 🟨 kıl payı · 🟥 yakalandın · 🟦 kalkan kurtardı).
- **🫣 / Esc = patron tuşu:** Ekranı sahte bir tabloyla kaplar ve oyunu durdurur. Tekrar Esc'e ya da ↩'ye basınca geri dönersin.
- **Ses varsayılan olarak kapalı** (sağ üstteki 🔇). Sayfa her açıldığında yine kapalı başlar.
- Sistemde "hareketi azalt" ayarı açıksa sarsıntı, parçacıklar ve yanıp sönmeler kapanır.

## Geliştirici notları

- Tek dosya: `index.html`. Kod sırasıyla şu bölümlerden oluşuyor: CONFIG, RNG, oyun mantığı (DOM kullanmayan state machine), ses, çizim, giriş ve arayüz.
- Denge sabitlerinin hepsi `CONFIG` nesnesinde.
- `node tools/sim.js 2000` komutu, oyun mantığını tarayıcı olmadan 3 farklı oyuncu modeliyle oynatıp ilk canın kaçıncı basışta gittiğini, tur süresini ve skoru raporlar.
  Bir sabiti denemek için: `node tools/sim.js 2000 '{"warn":[0.85,0.38]}'`
- `node tools/smoke.js` komutu Playwright ile masaüstü, mobil dokunmatik ve hareket azaltma testlerini koşturur ve `shots/` klasörüne ekran görüntüsü kaydeder. Playwright kurulu olmalı.
