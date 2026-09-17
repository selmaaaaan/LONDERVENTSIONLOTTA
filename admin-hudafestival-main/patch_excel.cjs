const fs = require('fs');
let c = fs.readFileSync('src/pages/JurySlipsPage.jsx', 'utf8');

c = c.replace(/[\t ]*'Code Letter': [^,]+,\n/g, "");

fs.writeFileSync('src/pages/JurySlipsPage.jsx', c);
console.log("Excel export patched");
