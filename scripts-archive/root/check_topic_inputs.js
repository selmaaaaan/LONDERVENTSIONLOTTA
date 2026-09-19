const fs = require('fs');
const lines = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes("placeholder=\"Enter"));
if (idx !== -1) {
    console.log(lines.slice(Math.max(0, idx - 20), idx + 40).join('\n'));
} else {
    console.log("Could not find placeholder");
}