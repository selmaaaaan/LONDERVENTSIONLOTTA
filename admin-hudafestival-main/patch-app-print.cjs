const fs = require('fs');
let fileContent = fs.readFileSync('src/App.jsx', 'utf8');

if (!fileContent.includes("import BatchPrintView")) {
    fileContent = fileContent.replace(
        "import BatchWorkspace from './pages/result-entry/BatchWorkspace';",
        "import BatchWorkspace from './pages/result-entry/BatchWorkspace';\nimport BatchPrintView from './pages/result-entry/BatchPrintView';"
    );
}

if (!fileContent.includes('<Route path="/result-entry/batches/:id/print"')) {
    fileContent = fileContent.replace(
        "<Route element={<ResultEntryLayout />}>",
        "<Route path=\"/result-entry/batches/:id/print\" element={<BatchPrintView />} />\n            <Route element={<ResultEntryLayout />}>"
    );
}

fs.writeFileSync('src/App.jsx', fileContent);
console.log('App.jsx updated with BatchPrintView route');
