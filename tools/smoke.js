// Tarayıcı duman testi (Playwright + Chromium). Kullanım: node tools/smoke.js [çıktı klasörü]
'use strict';
const { chromium, devices } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = process.argv[2] || path.join(__dirname, '..', 'shots');
const URL = 'file://' + path.join(__dirname, '..', 'index.html');
fs.mkdirSync(OUT, { recursive: true });
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`); };
const wait = ms => new Promise(r => setTimeout(r, ms));

async function errorsOf(page) {
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  return errs;
}
// patronu sırtı dönük "dondur"
const freezeAway = page => page.evaluate(() => { const b = __bt.run.boss; b.phase = 'away'; b.t = 0; b.dur = 999; b.swap = 0; });

(async () => {
  const browser = await chromium.launch();

  /* ---------------- MASAÜSTÜ ---------------- */
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errs = await errorsOf(page);
    await page.goto(URL);
    await wait(300);
    await page.screenshot({ path: `${OUT}/01-menu.png` });
    await page.click('#btnFree');
    await wait(200);
    await freezeAway(page);
    const box = await page.locator('#game').boundingBox();
    const cx = box.x + box.width / 2, cy = box.y + box.height * 0.6;
    await page.mouse.move(cx, cy); await page.mouse.down();
    await wait(1500);
    const mid = await page.evaluate(() => ({ holding: __bt.run.holding, pocket: __bt.run.pocket }));
    check('fare: basılı tutunca cep dolar', mid.holding && mid.pocket > 15, `cep=${mid.pocket.toFixed(1)}`);
    await page.screenshot({ path: `${OUT}/02-holding.png` });
    await page.mouse.up(); await wait(100);
    const after = await page.evaluate(() => ({ score: __bt.run.score, pocket: __bt.run.pocket, holding: __bt.run.holding }));
    check('fare: bırakınca kasaya girer', after.score > 15 && after.pocket === 0 && !after.holding, `kasa=${after.score}`);

    // boşluk tuşu
    await freezeAway(page);
    await page.keyboard.down('Space'); await wait(600);
    const sp = await page.evaluate(() => __bt.run.holding);
    await page.keyboard.up('Space'); await wait(80);
    check('klavye: boşluk basılı tut/bırak', sp && !(await page.evaluate(() => __bt.run.holding)));

    // uyarı (warn) görünümü
    await page.evaluate(() => { const b = __bt.run.boss; b.phase = 'warn'; b.t = 0; b.dur = 999; b.next.fake = false; });
    await page.mouse.down(); await wait(400);
    await page.screenshot({ path: `${OUT}/03-warn.png` });
    // bakış + yakalanma
    await page.evaluate(() => { const b = __bt.run.boss; b.phase = 'look'; b.t = 0; b.dur = 5; });
    await wait(300);
    const caught = await page.evaluate(() => ({ phase: __bt.run.boss.phase, lives: __bt.run.lives, locked: __bt.run.locked }));
    check('bakarken basılı → yakalanır, can gider, kilitlenir', caught.phase === 'scold' && caught.lives === 2 && caught.locked, JSON.stringify(caught));
    await page.screenshot({ path: `${OUT}/04-caught.png` });
    // kilit: bırakmadan tutmaya devam → cep dolmamalı
    await page.evaluate(() => { const b = __bt.run.boss; b.phase = 'away'; b.t = 0; b.dur = 999; });
    await wait(400);
    const lockHold = await page.evaluate(() => ({ holding: __bt.run.holding, pocket: __bt.run.pocket }));
    check('yakalandıktan sonra bırakana kadar giriş kilitli', !lockHold.holding && lockHold.pocket === 0);
    await page.mouse.up(); await wait(80);
    await page.mouse.down(); await wait(300);
    check('bırakıp tekrar basınca giriş açılır', await page.evaluate(() => __bt.run.holding));
    await page.mouse.up(); await wait(80);

    // tolerans: bakış başında 0.12 sn içinde bırakan yakalanmaz
    await page.evaluate(() => { const b = __bt.run.boss; b.phase = 'away'; b.t = 0; b.dur = 999; });
    await page.mouse.down(); await wait(300);
    await page.evaluate(() => { const b = __bt.run.boss; b.phase = 'look'; b.t = 0; b.dur = 5; });
    await page.mouse.up(); await wait(200);
    check('tolerans içinde bırakan yakalanmaz', await page.evaluate(() => __bt.run.boss.phase === 'look' && __bt.run.lives === 2));

    // patron tuşu
    await page.keyboard.press('Escape'); await wait(150);
    const sheetVis = await page.isVisible('#sheet');
    const title = await page.title();
    await page.screenshot({ path: `${OUT}/05-panic.png` });
    const frozenT = await page.evaluate(() => __bt.run.t); await wait(300);
    const frozenT2 = await page.evaluate(() => __bt.run.t);
    check('Esc: sahte tablo açılır, oyun durur, sekme başlığı değişir', sheetVis && frozenT === frozenT2 && title.includes('xlsx'));
    await page.keyboard.press('Escape'); await wait(100);
    check('Esc: tablo kapanır', !(await page.isVisible('#sheet')) && !(await page.title()).includes('xlsx'));
    await page.click('#btnPanic'); await wait(80);
    const viaBtn = await page.isVisible('#sheet');
    await page.click('#sheetBack'); await wait(80);
    check('🫣 butonu ve ↩ çalışır', viaBtn && !(await page.isVisible('#sheet')));
    await page.mouse.move(cx, cy);

    // seçim ekranı
    await page.evaluate(() => { const r = __bt.run; r.score = 260; r.pendingPick = true; r.boss.phase = 'away'; r.boss.t = 0; r.boss.dur = 999; });
    await page.mouse.down(); await wait(200); await page.mouse.up(); await wait(150);
    const pickState = await page.evaluate(() => __bt.run.state);
    check('kasa eşiğinde seçim ekranı açılır', pickState === 'pick');
    await wait(600);
    await page.screenshot({ path: `${OUT}/06-pick.png` });
    // ilk karta tıkla
    await page.mouse.click(box.x + box.width / 2, box.y + box.height * (168 + 40) / 600); await wait(900);
    const picked = await page.evaluate(() => ({ state: __bt.run.state, mods: __bt.run.mods.slice() }));
    check('karta dokununca o kart seçilir, oyun devam eder', picked.state === 'play' && picked.mods.length === 1, JSON.stringify(picked));

    // yeni patron
    await page.evaluate(() => { const r = __bt.run; r.score = 440; r.nextBossAt = 450; r.boss.phase = 'away'; r.boss.t = 0; r.boss.dur = 999; });
    await page.mouse.down(); await wait(700); await page.mouse.up(); await wait(1200);
    const boss = await page.evaluate(() => __bt.run.boss.typeId);
    check('450 puanda patron değişir', boss !== 'lead', boss);
    await page.screenshot({ path: `${OUT}/07-newboss.png` });

    // her patron tipi bakarken
    for (const id of ['turtle', 'flash', 'sly', 'gm']) {
      await page.evaluate(id => { const r = __bt.run; r.boss.typeId = id; r.boss.phase = 'look'; r.boss.t = 0; r.boss.dur = 99; __bt.view.swap = null; __bt.view.banner = null; }, id);
      await wait(250);
      await page.screenshot({ path: `${OUT}/08-boss-${id}.png`, clip: { x: box.x, y: box.y + box.height * 44 / 600, width: box.width, height: box.height * 270 / 600 } });
    }

    // akşam saati + tur sonu
    await page.evaluate(() => { const r = __bt.run; r.boss.phase = 'away'; r.boss.t = 0; r.boss.dur = 999; r.t = 160; });
    await wait(300);
    await page.screenshot({ path: `${OUT}/09-evening.png` });
    await page.evaluate(() => { __bt.run.t = 400; });
    await wait(2200);
    const sumVis = await page.isVisible('#summary');
    check('18:00 → mesai biter, özet ekranı', sumVis && (await page.evaluate(() => __bt.run.endReason)) === 'shift');
    await page.screenshot({ path: `${OUT}/10-summary.png` });
    const share = await page.textContent('#sumEmoji');
    check('özet: emoji paylaşım metni', /BOSS TURNS/.test(share) && /[🟩🟨🟥🟦]/u.test(share), share.split('\n')[2] || '');

    // en iyi skor kalıcı
    const best = await page.evaluate(() => localStorage.getItem('bossturns.best'));
    check('en iyi skor localStorage\'a yazılır', Number(best) > 0, best);

    // can bitince
    await page.click('#btnAgain'); await wait(200);
    await page.mouse.move(cx, cy);
    await page.evaluate(() => { const r = __bt.run; r.lives = 1; r.boss.phase = 'look'; r.boss.t = 0.5; r.boss.dur = 5; });
    await page.mouse.down(); await wait(200); await page.mouse.up();
    await wait(2800);
    check('son can gidince "Eve gönderildin" özeti', (await page.isVisible('#summary')) && (await page.evaluate(() => __bt.run.endReason)) === 'fired');

    // günlük mod
    await page.click('#btnMenu'); await wait(100);
    await page.click('#btnDaily'); await wait(100);
    const d1 = await page.evaluate(() => ({ mode: __bt.run.mode, seed: __bt.run.seed }));
    check('günlük mod tarih seed\'i ile başlar', d1.mode === 'daily' && d1.seed.startsWith('bossturns:20'), d1.seed);
    await page.screenshot({ path: `${OUT}/11-daily.png` });

    check('masaüstü: konsol/JS hatası yok', errs.length === 0, errs.join(' | '));
    await page.close();
  }

  /* ---------------- MOBİL (dokunmatik) ---------------- */
  {
    const ctxM = await browser.newContext({ ...devices['Pixel 7'] });
    const page = await ctxM.newPage();
    const errs = await errorsOf(page);
    await page.goto(URL); await wait(200);
    await page.screenshot({ path: `${OUT}/20-mobile-menu.png` });
    await page.tap('#btnFree'); await wait(200);
    await freezeAway(page);
    const cdp = await ctxM.newCDPSession(page);
    const box = await page.locator('#game').boundingBox();
    const pt = { x: box.x + box.width / 2, y: box.y + box.height * 0.55 };
    const touch = (type, pts = [pt]) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' || type === 'touchCancel' ? [] : pts.map((p, i) => ({ ...p, id: i })) });

    await touch('touchStart'); await wait(1200);
    const h = await page.evaluate(() => ({ holding: __bt.run.holding, pocket: __bt.run.pocket }));
    check('dokunmatik: uzun basma tutuş sayılır (iptal edilmez)', h.holding && h.pocket > 10, `cep=${h.pocket.toFixed(1)}`);
    await page.screenshot({ path: `${OUT}/21-mobile-hold.png` });
    // uzun basmada bağlam menüsü / metin seçimi yok
    const sel = await page.evaluate(() => String(window.getSelection()));
    check('dokunmatik: uzun basma seçim/menü açmaz', sel === '');
    await touch('touchEnd'); await wait(100);
    const s1 = await page.evaluate(() => ({ score: __bt.run.score, holding: __bt.run.holding }));
    check('dokunmatik: parmağı kaldırınca kasaya girer', s1.score > 10 && !s1.holding, `kasa=${s1.score}`);

    // pointercancel: sistem dokunuşu iptal ederse takılı kalmamalı
    await freezeAway(page);
    await touch('touchStart'); await wait(500);
    await touch('touchCancel'); await wait(100);
    check('pointercancel: tutuş biter, takılı kalmaz', !(await page.evaluate(() => __bt.run.holding)));

    // çift dokunma zoom yapmaz
    const scale0 = await page.evaluate(() => window.visualViewport.scale);
    await touch('touchStart'); await touch('touchEnd'); await wait(60); await touch('touchStart'); await touch('touchEnd'); await wait(400);
    const scale1 = await page.evaluate(() => window.visualViewport.scale);
    check('çift dokunma zoom yapmaz', scale0 === scale1, `${scale0} → ${scale1}`);

    // iki parmak: biri kalkınca diğeri hâlâ basılı
    await freezeAway(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...pt, id: 1 }, { x: pt.x + 40, y: pt.y, id: 2 }] });
    await wait(200);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x: pt.x + 40, y: pt.y, id: 2 }] });
    await wait(150);
    const two = await page.evaluate(() => __bt.run.holding);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await wait(100);
    check('iki parmak: biri kalkınca tutuş sürer, ikisi kalkınca biter', two && !(await page.evaluate(() => __bt.run.holding)));

    // dikey ölçek
    const fitP = await page.evaluate(() => { const r = document.getElementById('game').getBoundingClientRect(); return { w: r.width, h: r.height, vw: innerWidth, vh: innerHeight, sx: scrollX, sy: scrollY, cw: document.getElementById('game').width }; });
    check('dikey: tuval ekrana sığar, kaydırma yok, retina çözünürlük', fitP.w <= fitP.vw + 0.5 && fitP.h <= fitP.vh + 0.5 && fitP.sx === 0 && fitP.sy === 0 && fitP.cw > 360, JSON.stringify(fitP));
    // döndür
    const vp = page.viewportSize();
    await page.setViewportSize({ width: vp.height, height: vp.width }); await wait(400);
    const fitL = await page.evaluate(() => { const r = document.getElementById('game').getBoundingClientRect(); return { w: r.width, h: r.height, vw: innerWidth, vh: innerHeight, left: r.left }; });
    check('yatay: döndürünce yeniden ölçeklenir ve ortalanır', fitL.h <= fitL.vh + 0.5 && Math.abs(fitL.left - (fitL.vw - fitL.w) / 2) < 1.5, JSON.stringify(fitL));
    await page.screenshot({ path: `${OUT}/22-mobile-landscape.png` });
    await page.setViewportSize(vp); await wait(200);

    // sekme gizlenince duraklar
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
    await wait(100);
    const paused = await page.evaluate(() => __bt.view.hiddenPause);
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
    await page.screenshot({ path: `${OUT}/23-mobile-paused.png` });
    await touch('touchStart'); await wait(100);
    const resumed = await page.evaluate(() => ({ p: __bt.view.hiddenPause, holding: __bt.run.holding }));
    await touch('touchEnd');
    check('sekme gizlenince duraklar; dokununca devam eder (o dokunuş oynamaz)', paused && !resumed.p && !resumed.holding);

    check('mobil: konsol/JS hatası yok', errs.length === 0, errs.join(' | '));
    await ctxM.close();
  }

  /* ---------------- reduced motion ---------------- */
  {
    const ctxR = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 400, height: 700 } });
    const page = await ctxR.newPage();
    const errs = await errorsOf(page);
    await page.goto(URL);
    await page.click('#btnFree'); await wait(100);
    await freezeAway(page);
    await page.mouse.move(200, 400); await page.mouse.down(); await wait(800); await page.mouse.up(); await wait(100);
    const parts = await page.evaluate(() => __bt.view.particles.filter(p => p.kind !== 'text').length);
    check('reduced-motion: parçacık patlaması yok', parts === 0);
    check('reduced-motion: hata yok', errs.length === 0, errs.join(' | '));
    await ctxR.close();
  }

  await browser.close();
  const fail = results.filter(r => !r.ok).length;
  console.log(`\n${results.length - fail}/${results.length} geçti`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
