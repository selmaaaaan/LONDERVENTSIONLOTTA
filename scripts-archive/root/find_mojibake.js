const fs = require('fs');
const lines = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8').split('\n');
lines.forEach((l, i) => {
    if (l.includes('3 ?"') || l.includes('?\"') || l.includes('group topic?') || l.includes('Select a topic?') || l.includes('Enter topic?')) {
        console.log(i + ': ' + l.trim());
    }
});