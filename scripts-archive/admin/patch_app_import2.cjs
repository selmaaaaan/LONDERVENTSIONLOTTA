const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

if (!c.includes("import ErrorBoundary")) {
    c = "import ErrorBoundary from './components/ErrorBoundary';\n" + c;
    fs.writeFileSync('src/App.jsx', c);
    console.log("App.jsx import prepended");
} else {
    console.log("App.jsx already has it");
}
