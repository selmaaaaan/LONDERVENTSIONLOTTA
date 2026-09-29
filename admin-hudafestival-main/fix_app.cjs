const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const t1 = "import BatchPrintView from './pages/result-entry/BatchPrintView';";
const r1 = "import BatchPrintView from './pages/result-entry/BatchPrintView';\nimport AllResultsPrintView from './pages/result-entry/AllResultsPrintView';";

const t2 = `<Route path="/result-entry/batches/:id/print" element={<BatchPrintView />} />`;
const r2 = `<Route path="/result-entry/batches/:id/print" element={<BatchPrintView />} />\n          <Route path="/result-entry/all/print" element={<AllResultsPrintView />} />`;

if (c.includes(t1) && c.includes(t2)) {
    c = c.replace(t1, r1);
    c = c.replace(t2, r2);
    fs.writeFileSync('src/App.jsx', c);
    console.log("Updated App.jsx successfully!");
} else {
    console.log("Could not find targets in App.jsx");
}
