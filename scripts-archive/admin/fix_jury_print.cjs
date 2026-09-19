const fs = require('fs');
let content = fs.readFileSync('src/pages/JurySlipsPage.jsx', 'utf8');
content = content.replace(/print:bg-\[var\(--color-surface\)\]/g, 'print:bg-white');
fs.writeFileSync('src/pages/JurySlipsPage.jsx', content);
console.log('Restored print:bg-white');
