const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(
    "import { Sun, Moon, LogOut, Bell } from 'lucide-react';",
    "import { Sun, Moon, LogOut, Bell } from 'lucide-react';\nimport ErrorBoundary from './components/ErrorBoundary';"
);

c = c.replace(
    /<AnimatePresence mode="wait">\s*<Routes location=\{location\} key=\{location\.pathname\}>/,
    `<AnimatePresence mode="wait">\n              <ErrorBoundary key={location.pathname}>\n                <Routes location={location}>`
);

c = c.replace(
    /<\/Routes>\s*<\/AnimatePresence>/,
    `</Routes>\n              </ErrorBoundary>\n            </AnimatePresence>`
);

fs.writeFileSync('src/App.jsx', c);
console.log("App.jsx patched");
