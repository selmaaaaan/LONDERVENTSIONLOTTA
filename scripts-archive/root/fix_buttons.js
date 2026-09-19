const fs = require('fs');
const p = 'admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(
  /<Button onClick=\{activeTab === 'topics' \? openTopicForm : openNewRegistration\} variant="primary" className="shadow-md">/g,
  "<Button onClick={activeTab === 'topics' ? openTopicForm : openNewRegistration} variant=\"primary\" className=\"shadow-md\" disabled={isRegistrationOpen === false && userInfo?.role === 'team_leader'} title={(isRegistrationOpen === false && userInfo?.role === 'team_leader') ? 'Registration is closed' : ''}>"
);

code = code.replace(
  /\{isRegistrationOpen !== false && reg\.status !== 'approved' && \(/g,
  "{reg.status !== 'approved' && ("
);

code = code.replace(
  /<button onClick=\{.*?openEditRegistration.*?\} className="(.*?)" title="Edit Registration">/g,
  (match, p1) => {
    return "<button onClick={() => openEditRegistration(reg)} className=\"" + p1 + " disabled:opacity-50 disabled:cursor-not-allowed\" disabled={isRegistrationOpen === false && userInfo?.role === 'team_leader'} title={(isRegistrationOpen === false && userInfo?.role === 'team_leader') ? 'Registration is closed' : 'Edit Registration'}>";
  }
);

code = code.replace(
  /\{isRegistrationOpen !== false && \(/g,
  "{true && ("
);

code = code.replace(
  /<button onClick=\{.*?handleDeleteRegistration.*?\} className="(.*?)" title="Delete Registration">/g,
  (match, p1) => {
    return "<button onClick={() => handleDeleteRegistration(reg._id)} className=\"" + p1 + " disabled:opacity-50 disabled:cursor-not-allowed\" disabled={isRegistrationOpen === false && userInfo?.role === 'team_leader'} title={(isRegistrationOpen === false && userInfo?.role === 'team_leader') ? 'Registration is closed' : 'Delete Registration'}>";
  }
);

fs.writeFileSync(p, code);
console.log('Patched buttons in TeamLeaderDashboard.jsx');
