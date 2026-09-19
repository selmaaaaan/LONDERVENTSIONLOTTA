const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

content = content.replace(
  "import TeamPortalDashboard from './pages/TeamPortalDashboard';",
  "import TeamPortalDashboard from './pages/TeamPortalDashboard';\nimport TeamParticipantDirectoryPage from './pages/TeamParticipantDirectoryPage';"
);

content = content.replace(
  "<Route path=\"/team-topics\" element={<ProtectedRoute allowedRoles={['team_leader']}><TeamTopicRegistrationPage /></ProtectedRoute>} />",
  "<Route path=\"/team-topics\" element={<ProtectedRoute allowedRoles={['team_leader']}><TeamTopicRegistrationPage /></ProtectedRoute>} />\n                <Route path=\"/team-directory\" element={<ProtectedRoute allowedRoles={['team_leader']}><TeamParticipantDirectoryPage /></ProtectedRoute>} />"
);

fs.writeFileSync('src/App.jsx', content);
console.log("Updated App.jsx");
