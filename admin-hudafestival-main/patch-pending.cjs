const fs = require('fs');

let code = fs.readFileSync('src/pages/PendingResultPage.jsx', 'utf8');

const oldApprove = `await api.post('/results/batch-publish', { batchId: batch.batchId });`;
const newApprove = `await api.post('/results/batch-publish', { batchId: batch.batchId, programmeIds: batch.programmeIds });`;

const oldDeny = `await api.delete(\`/results/batch/\${batch.batchId}\`);`;
const newDeny = `await api.delete(\`/results/batch/\${batch.batchId}\`, { data: { programmeIds: batch.programmeIds } });`;

code = code.replace(oldApprove, newApprove);
code = code.replace(oldDeny, newDeny);

fs.writeFileSync('src/pages/PendingResultPage.jsx', code);
console.log("Patched PendingResultPage");
