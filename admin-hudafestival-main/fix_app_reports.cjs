const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const t1 = "import AllResultsPage from './pages/result-entry/AllResultsPage';";
const r1 = "import AllResultsPage from './pages/result-entry/AllResultsPage';\nimport ResultReportsPage from './pages/result-entry/ResultReportsPage';";

const t2 = `<Route path="/result-entry/all" element={<AllResultsPage />} />`;
const r2 = `<Route path="/result-entry/all" element={<AllResultsPage />} />\n            <Route path="/result-entry/reports" element={<ResultReportsPage />} />`;

if (c.includes(t1) && c.includes(t2)) {
    c = c.replace(t1, r1);
    c = c.replace(t2, r2);
    fs.writeFileSync('src/App.jsx', c);
    console.log("Updated App.jsx successfully!");
} else {
    console.log("Could not find targets in App.jsx");
}
