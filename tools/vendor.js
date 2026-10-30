// Three.js'i ve Lilita One yazı tipini index.html'in İÇİNE gömer (CDN yok, internetsiz çalışır).
// Kullanım: npm install && npm run vendor
// index.html'deki işaretler arasını yeniden yazar:
//   /*VENDOR:THREE*/ ... /*END:THREE*/      ve     /*VENDOR:FONT*/ ... /*END:FONT*/
'use strict';
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'index.html');

const three = esbuild.buildSync({
  entryPoints: [path.join(__dirname, 'three-entry.js')],
  bundle: true, minify: true, format: 'iife', globalName: 'THREE', write: false,
  legalComments: 'none', target: ['es2020'],
}).outputFiles[0].text.trim();

const fontDir = path.join(root, 'node_modules/@fontsource/lilita-one/files');
const b64 = f => fs.readFileSync(path.join(fontDir, f)).toString('base64');
const font =
  `@font-face{font-family:'Lilita';font-display:block;src:url(data:font/woff2;base64,${b64('lilita-one-latin-400-normal.woff2')}) format('woff2');` +
  `unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2212;}` +
  `@font-face{font-family:'Lilita';font-display:block;src:url(data:font/woff2;base64,${b64('lilita-one-latin-ext-400-normal.woff2')}) format('woff2');` +
  `unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+20A0-20C0;}`;

let html = fs.readFileSync(htmlPath, 'utf8');
const put = (tag, body) => {
  const re = new RegExp(`/\\*VENDOR:${tag}\\*/[\\s\\S]*?/\\*END:${tag}\\*/`);
  if (!re.test(html)) throw new Error(`index.html içinde /*VENDOR:${tag}*/ işareti yok`);
  html = html.replace(re, () => `/*VENDOR:${tag}*/${body}/*END:${tag}*/`);
};
put('THREE', `/* three.js r186 (MIT) — tools/vendor.js ile üretildi, elle düzenleme */\n${three}\n`);
put('FONT', `/* Lilita One (SIL OFL 1.1) */${font}`);
fs.writeFileSync(htmlPath, html);
console.log(`gömüldü: three ${(three.length / 1024).toFixed(0)} KB, yazı tipi ${(font.length / 1024).toFixed(0)} KB → index.html ${(html.length / 1024).toFixed(0)} KB`);
