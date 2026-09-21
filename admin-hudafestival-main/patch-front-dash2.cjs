const fs = require('fs');
let code = fs.readFileSync('src/pages/result-entry/BatchDashboard.jsx', 'utf8');

code = code.replace(
    /message:\s*`Delete batch '\$\{batch\.name\}'\?\s*This will not delete the saved results.*they'll return to Ready Results\.`,/,
    `message: batch.status === 'submitted' 
        ? "Delete this batch? It is currently awaiting admin approval — deleting it will remove it from Admin's queue and its results will return to Ready Results."
        : \`Delete batch '\${batch.name}'? This will not delete the saved results — they'll return to Ready Results.\`,`
);

fs.writeFileSync('src/pages/result-entry/BatchDashboard.jsx', code);
console.log("Patched BatchDashboard delete string with regex");
