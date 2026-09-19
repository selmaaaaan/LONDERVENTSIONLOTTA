const fs = require('fs');
const c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

const groupMatch = c.match(/<input\s+type="text"\s+value=\{topicForm\.groupTopic \|\| ''\}[\s\S]*?\{selectedTopicProg\?\.topicMode === 'free-text' && \([\s\S]*?<\/div>\s*\)\}\s*<\/div>/);
if (groupMatch) {
    console.log("FOUND GROUP BLOCK", groupMatch[0].length);
} else {
    console.log("NOT FOUND GROUP BLOCK");
}

const candMatch = c.match(/<input\s+type="text"\s+value=\{candData\.topic \|\| ''\}[\s\S]*?\{selectedTopicProg\?\.topicMode === 'free-text' && \([\s\S]*?<\/div>\s*\)\}\s*<\/div>/);
if (candMatch) {
    console.log("FOUND CAND BLOCK", candMatch[0].length);
} else {
    console.log("NOT FOUND CAND BLOCK");
}