const fs = require('fs');
const lines = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes("Assign Topics to Candidates"));
if (idx !== -1) {
    console.log(lines.slice(Math.max(0, idx - 10), idx + 50).join('\n'));
} else {
    console.log("Could not find Assign Topics to Candidates");
}