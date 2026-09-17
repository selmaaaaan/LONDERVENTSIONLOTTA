const fs = require('fs');
let c = fs.readFileSync('src/pages/JurySlipsPage.jsx', 'utf8');

c = c.replace(/          'Code Letter': reg\.codeLetter \|\| '',\n/g, "");

fs.writeFileSync('src/pages/JurySlipsPage.jsx', c);
console.log('JurySlipsPage export patched');
