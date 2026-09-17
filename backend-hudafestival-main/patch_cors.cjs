const fs = require('fs');
let c = fs.readFileSync('server.js', 'utf8');

c = c.replace(/'http:\/\/localhost:5173',/, "'http://localhost:5173',\n    'http://localhost:4173',\n    'http://127.0.0.1:4173',");

fs.writeFileSync('server.js', c);
console.log('server.js patched');
