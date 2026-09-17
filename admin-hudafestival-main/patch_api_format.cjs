const fs = require('fs');
let c = fs.readFileSync('src/services/api.js', 'utf8');

c = c.replace(
    "baseURL: import.meta.env.VITE_API_URL})",
    "baseURL: import.meta.env.VITE_API_URL\n});"
);

fs.writeFileSync('src/services/api.js', c);
console.log("api.js formatting fixed");
