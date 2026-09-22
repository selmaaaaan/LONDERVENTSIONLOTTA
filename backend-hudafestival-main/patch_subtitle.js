const fs = require('fs');
const p = '../admin-hudafestival-main/src/pages/result-entry/BatchWorkspace.jsx';
let content = fs.readFileSync(p, 'utf8');
content = content.replace('Includes all previously published results + the unsubmitted results currently in this batch.', "Includes all other batches' results + this batch's results.");
fs.writeFileSync(p, content);
console.log('Subtitle patched');
