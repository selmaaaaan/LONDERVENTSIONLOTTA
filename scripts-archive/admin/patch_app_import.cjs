const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

if (!c.includes("import ErrorBoundary")) {
    c = c.replace(
        "import React",
        "import React from 'react';\nimport ErrorBoundary from './components/ErrorBoundary';\n// removed to force replace"
    );
}

fs.writeFileSync('src/App.jsx', c);
console.log("App.jsx import patched");
