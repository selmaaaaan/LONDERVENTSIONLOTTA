const fs = require('fs');
let c = fs.readFileSync('server.js', 'utf8');

c = c.replace(
    /'https:\/\/admin\.hudafestival\.online'/g,
    "'https://admin.hudafestival.online',\n    'https://huda-festival-admin-xczf.onrender.com'"
);

c = c.replace(
    /credentials: true\s*\}\)\);/g,
    "credentials: true,\n    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],\n    allowedHeaders: ['Content-Type', 'Authorization']\n}));"
);

fs.writeFileSync('server.js', c);
console.log("CORS patched");
