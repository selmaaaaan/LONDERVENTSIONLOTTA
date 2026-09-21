const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Add import
code = code.replace(
    "import BatchWorkspace from './pages/result-entry/BatchWorkspace';",
    "import BatchWorkspace from './pages/result-entry/BatchWorkspace';\nimport AllResultsPage from './pages/result-entry/AllResultsPage';"
);

// Add route
code = code.replace(
    "<Route path=\"/result-entry/batches\" element={<BatchDashboard />} />",
    "<Route path=\"/result-entry/batches\" element={<BatchDashboard />} />\n              <Route path=\"/result-entry/all\" element={<AllResultsPage />} />"
);

fs.writeFileSync('src/App.jsx', code);
console.log("Patched App.jsx");
