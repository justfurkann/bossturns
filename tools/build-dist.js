// Masaüstü paketi için: tek kaynak olan index.html'i dist/ klasörüne kopyalar.
// (Tauri'nin repo'nun tamamını değil, yalnızca oyunu paketlemesi için.)
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist);
fs.copyFileSync(path.join(root, 'index.html'), path.join(dist, 'index.html'));
console.log('dist/index.html hazır');
