const fs = require('fs');
let c = fs.readFileSync('src/pages/JurySlipsPage.jsx', 'utf8');

c = c.split('\n').filter(line => !line.includes("'Code Letter'")).join('\n');

fs.writeFileSync('src/pages/JurySlipsPage.jsx', c);
console.log("Export lines deleted");
