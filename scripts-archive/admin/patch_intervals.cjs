const fs = require('fs');

let tld = fs.readFileSync('src/pages/TeamLeaderDashboard.jsx', 'utf8');
tld = tld.replace('const dataInterval = setInterval(() => { if (teamId) loadData(true); }, 30000);', '');
tld = tld.replace('return () => { clearInterval(dataInterval); clearInterval(timeInterval); };', 'return () => { clearInterval(timeInterval); };');
fs.writeFileSync('src/pages/TeamLeaderDashboard.jsx', tld, 'utf8');

let ttp = fs.readFileSync('src/pages/TeamTopicRegistrationPage.jsx', 'utf8');
ttp = ttp.replace('const dataInterval = setInterval(() => { if (teamId) loadData(true); }, 30000);', '');
ttp = ttp.replace('return () => { clearInterval(dataInterval); clearInterval(timeInterval); };', 'return () => { clearInterval(timeInterval); };');
fs.writeFileSync('src/pages/TeamTopicRegistrationPage.jsx', ttp, 'utf8');
