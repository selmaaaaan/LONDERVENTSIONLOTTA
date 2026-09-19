const fs = require('fs');
const c = fs.readFileSync('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', 'utf8');
const uiRegex = /<input[\s\S]*?editTopicText[\s\S]*?\/>/;
const m = c.match(uiRegex);
console.log(m ? m[0] : 'no match');