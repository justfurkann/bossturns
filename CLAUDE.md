# BOSS TURNS — proje notları

## Hedefler (sahibinin kararı, değiştirme)
1. **Asıl hedef: Windows PC için `.exe`.** Kurulumsuz ya da hafif kurulumlu bir masaüstü sürümü.
2. **HTML sürümü her zaman kalacak.** Mobilden ve kurulum yapmadan linkten oynamak için. `index.html` tek başına, tarayıcıda çift tıklayınca çalışmaya devam etmeli.
3. Tek kaynak: exe, aynı `index.html`'i paketlemeli. Oyunun ayrı bir kopyası (fork) olmamalı. Masaüstüne özel davranışlar (global patron tuşu, tepsi vb.) HTML'i bozmayacak şekilde, "masaüstündeysek" kontrolüyle eklenmeli.

## Kısıtlar
- Tek giriş: basılı tut / bırak. Yeni kontrol ekleme.
- Çekirdek döngüyü (tut/bırak/patron) değiştirmeden önce sahibine sor.
- Arayüz Türkçe. Telifli karakter veya marka yok. `prefers-reduced-motion`'a saygı göster.
- Bir tur 1–3 dakikayı geçmemeli. Ses varsayılan olarak kapalı.
- `index.html`'de dış bağımlılık ve CDN yok.

## Yapı
- `index.html`: CONFIG → RNG → oyun mantığı (DOM'suz, `module.exports` ile Node'dan yüklenebilir) → tarayıcı katmanı.
- `tools/sim.js`: denge simülasyonu (`node tools/sim.js 2000`).
- `tools/smoke.js`: Playwright testleri (`node tools/smoke.js`). Değişiklikten sonra ikisini de çalıştır.
- `src-tauri/`: Tauri 2 masaüstü kılıfı. `tools/build-dist.js` index.html'i `dist/` klasörüne kopyalar. `main.rs`'te global patron tuşu (Ctrl+Shift+Boşluk) ve tepsi var; pencere gizlenirken `window.__btDesktopHide()` çağrılır.
- `.github/workflows/desktop.yml`: Windows exe derlemesi. `v*` etiketi atılınca Releases'a yükler.
- Denge sabitleri yalnızca `CONFIG`'te. Hedef: ortalama oyuncu ilk canını medyan ~6. basışta kaybetsin.
