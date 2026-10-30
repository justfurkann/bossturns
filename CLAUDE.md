# BOSS TURNS — proje notları

## Hedefler (sahibinin kararı, değiştirme)
1. **Asıl hedef: Windows PC için `.exe`.** Kurulumsuz ya da hafif kurulumlu bir masaüstü sürümü.
2. **HTML sürümü her zaman kalacak.** Mobilden ve kurulum yapmadan linkten oynamak için. `index.html` tek başına, tarayıcıda çift tıklayınca çalışmaya devam etmeli.
3. Tek kaynak: exe, aynı `index.html`'i paketlemeli. Oyunun ayrı bir kopyası (fork) olmamalı. Masaüstüne özel davranışlar (global patron tuşu, tepsi vb.) HTML'i bozmayacak şekilde, "masaüstündeysek" kontrolüyle eklenmeli.

## Karakter kuralı (sahibinin kararı, değiştirme)
- **Patron her zaman sarışın, 20'li yaşlarında bir kadındır.** Patron tipleri (davranış/taktik) değişebilir ama patron karakteri bu kalır.

## Kısıtlar
- Tek giriş: basılı tut / bırak. Yeni kontrol ekleme.
- Çekirdek döngüyü (tut/bırak/patron) değiştirmeden önce sahibine sor.
- Arayüz Türkçe. Telifli karakter veya marka yok. `prefers-reduced-motion`'a saygı göster.
- Bir tur 1–3 dakikayı geçmemeli. Ses varsayılan olarak kapalı.
- `index.html` tek dosya ve internetsiz çalışır: CDN yok. Three.js (3D) ve Lilita One yazı tipi dosyanın İÇİNE gömülüdür (`npm install && npm run vendor` yeniden üretir; `/*VENDOR:…*/` işaretleri arasına elle dokunma).

## Yapı
- `index.html` üç script bloğundan oluşur:
  - `<script id="logic">`: CONFIG → RNG → oyun mantığı (DOM'suz, Node'dan yüklenebilir). Yağmur'un ruh halleri (`BOSSES`) ve günlük kombin (`outfitFor`) burada.
  - `<script id="three">`: gömülü Three.js (üretilmiş, düzenleme).
  - `<script id="app">`: 3D sahne, Yağmur/oyuncu modelleri ve animasyonları, Clash tarzı DOM HUD, ses, giriş.
- Yerleşim: geniş ekran (PC, 1920×1080 referans) ve dar ekran (telefon, 1080 genişlik referans). HUD bu referansta tasarlanıp ölçeklenir.
- Görsel stil: Clash Royale'den esinlenen kalın konturlu, parlak arayüz (Lilita One). Telifli varlık/logo/karakter kullanma.
- `tools/sim.js`: denge simülasyonu (`node tools/sim.js 2000`).
- `tools/smoke.js`: Playwright testleri (`node tools/smoke.js`, WebGL yazılımla çizilir, birkaç dakika sürer). Değişiklikten sonra ikisini de çalıştır.
- `src-tauri/`: Tauri 2 masaüstü kılıfı. `tools/build-dist.js` index.html'i `dist/` klasörüne kopyalar. `main.rs`'te global patron tuşu (Ctrl+Shift+Boşluk) ve tepsi var; pencere gizlenirken `window.__btDesktopHide()` çağrılır.
- `.github/workflows/desktop.yml`: Windows exe derlemesi. `v*` etiketi atılınca Releases'a yükler.
- Denge sabitleri yalnızca `CONFIG`'te. Hedef: ortalama oyuncu ilk canını medyan ~6. basışta kaybetsin.
