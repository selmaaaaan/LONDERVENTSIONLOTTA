const fs = require('fs');
let c = fs.readFileSync('src/services/api.js', 'utf8');

c = c.replace(
    /headers: \{\s*'Bypass-Tunnel-Reminder': 'true'\s*\}/,
    ""
);

c = c.replace(/,\s*\}\)/, '})');

fs.writeFileSync('src/services/api.js', c);
console.log("api.js patched");
