const fs = require('fs');

let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(
    "import ResultsPage from './pages/ResultsPage';",
    "// import ResultsPage from './pages/ResultsPage';"
);

code = code.replace(
    "<Route path=\"/results\" element={<ProtectedRoute allowedRoles={['admin']}><ResultsPage /></ProtectedRoute>} />",
    "{/* <Route path=\"/results\" element={<ProtectedRoute allowedRoles={['admin']}><ResultsPage /></ProtectedRoute>} /> */}"
);

// Also remove from global search mapping
code = code.replace(
    "results: '/results', ",
    ""
);

fs.writeFileSync('src/App.jsx', code);
console.log("Patched App.jsx");
