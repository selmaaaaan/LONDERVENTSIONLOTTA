const fs = require('fs');
const lines = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes("activeTab === 'topics'"));
console.log(lines.slice(idx, idx + 100).join('\n'));