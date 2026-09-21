const fs = require('fs');
let fileContent = fs.readFileSync('src/App.jsx', 'utf8');

if (!fileContent.includes("import ResultDashboard")) {
    fileContent = fileContent.replace(
        "import ResultEntryLayout from './components/ResultEntryLayout';",
        "import ResultEntryLayout from './components/ResultEntryLayout';\nimport ResultDashboard from './pages/result-entry/ResultDashboard';"
    );
}

if (!fileContent.includes('<Route path="/result-entry/dashboard"')) {
    fileContent = fileContent.replace(
        '<Route path="/result-entry/enter"',
        '<Route path="/result-entry/dashboard" element={<ResultDashboard />} />\n              <Route path="/result-entry/enter"'
    );
}

fileContent = fileContent.replace(
    '<Route path="*" element={<Navigate to="/result-entry/enter" replace />} />',
    '<Route path="*" element={<Navigate to="/result-entry/dashboard" replace />} />'
);

fs.writeFileSync('src/App.jsx', fileContent);
console.log('App.jsx patched successfully');
