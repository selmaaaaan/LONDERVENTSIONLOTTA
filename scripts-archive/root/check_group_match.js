const fs = require('fs');
const c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

const groupMatch = c.match(/<input\s+type="text"\s+value=\{topicForm\.groupTopic \|\| ''\}[\s\S]*?\{selectedTopicProg\?\.topicMode === 'free-text' && \([\s\S]*?<\/div>\s*\)\}\s*<\/div>/);
if (groupMatch) {
    console.log("GROUPMATCH ENDS WITH:", JSON.stringify(groupMatch[0].slice(-50)));
}