const fs = require('fs');
let c = fs.readFileSync('src/pages/TeamRegistrationListPage.jsx', 'utf8');

c = c.replace(/next\[cellId\] = !isCurrentlySaved;/g, 'next[cellId] = !isCurrentlySavedLocal;');

fs.writeFileSync('src/pages/TeamRegistrationListPage.jsx', c);
console.log("Patched");
