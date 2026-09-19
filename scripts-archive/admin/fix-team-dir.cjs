const fs = require('fs');
let content = fs.readFileSync('src/pages/TeamParticipantDirectoryPage.jsx', 'utf8');

content = content.replace(/JurySlipsPage/g, 'TeamParticipantDirectoryPage');
content = content.replace(/Participant Directory/g, 'My Team Directory');

fs.writeFileSync('src/pages/TeamParticipantDirectoryPage.jsx', content);
