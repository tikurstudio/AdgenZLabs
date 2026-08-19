const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('Pictura.dc.html', 'utf8');

// Check USER_IMAGES and SMALL_POOL
const userImgsMatch = html.match(/const USER_IMAGES = \[([\s\S]*?)\];/);
const smallPoolMatch = html.match(/const SMALL_POOL = \[([\s\S]*?)\];/);

console.log('--- USER_IMAGES CHECK ---');
if (userImgsMatch) {
  const list = eval('[' + userImgsMatch[1] + ']');
  list.forEach((img, i) => {
    if (!img) {
      console.log(`USER_IMAGES[${i}]: EMPTY/NULL!`);
    } else if (img.startsWith('http')) {
      console.log(`USER_IMAGES[${i}]: Remote ${img}`);
    } else {
      const exists = fs.existsSync(img);
      console.log(`USER_IMAGES[${i}]: ${img} -> ${exists ? 'EXISTS' : 'MISSING!'}`);
    }
  });
}

console.log('\n--- SMALL_POOL CHECK ---');
if (smallPoolMatch) {
  const list = eval('[' + smallPoolMatch[1] + ']');
  list.forEach((img, i) => {
    if (!img) {
      console.log(`SMALL_POOL[${i}]: EMPTY/NULL!`);
    } else if (img.startsWith('http')) {
      console.log(`SMALL_POOL[${i}]: Remote ${img}`);
    } else {
      const exists = fs.existsSync(img);
      console.log(`SMALL_POOL[${i}]: ${img} -> ${exists ? 'EXISTS' : 'MISSING!'}`);
    }
  });
}

// Check buildCells images (e.g. opt/green-ad.png, personX.png)
const cellImgMatches = html.match(/img:\s*["']([^"']+)["']/g) || [];
console.log('\n--- CELL IMAGES CHECK ---');
cellImgMatches.forEach(m => {
  const src = m.replace(/^img:\s*["']|["']$/g, '');
  const exists = src.startsWith('http') || fs.existsSync(src);
  console.log(`Cell image: ${src} -> ${exists ? 'OK' : 'MISSING LOCAL FILE!'}`);
});

// Check files inside opt/ directory
if (fs.existsSync('opt')) {
  console.log('\n--- FILES IN opt/ ---');
  const files = fs.readdirSync('opt');
  console.log(`Found ${files.length} files in opt/`);
  console.log(files.slice(0, 15));
} else {
  console.log('\nWARNING: opt/ directory does not exist!');
}
