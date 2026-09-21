const fs = require('fs');

let pageCode = fs.readFileSync('src/pages/PendingResultPage.jsx', 'utf8');

// Fix api.get('/results?page=${currentPage}') to api.get('/results')
// Also we'll use resultsRes.data.data if it's paginated, but since we remove ?page it'll be an array.
// Wait, if we use api.get('/results'), it will return an array.

pageCode = pageCode.replace(
    "api.get(`/results?page=${currentPage}`)",
    "api.get('/results')"
);

pageCode = pageCode.replace(
    "const pendingResults = resultsRes.data.filter(r => r.status === 'pending');",
    `const resultsArray = Array.isArray(resultsRes.data) ? resultsRes.data : (resultsRes.data.data || []);
      const pendingResults = resultsArray.filter(r => r.status === 'pending');`
);

fs.writeFileSync('src/pages/PendingResultPage.jsx', pageCode);
console.log("Patched PendingResultPage.jsx");
