const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.jsx', 'utf8');

content = content.replace(
  "{ key: 'team_topics', label: 'Topic Management', icon: FileText },",
  "{ key: 'team_topics', label: 'Topic Management', icon: FileText },\n    { key: 'team_directory', label: 'My Team Directory', icon: Users },"
);

content = content.replace(
  "team_topics: '/team-topics',",
  "team_topics: '/team-topics',\n            team_directory: '/team-directory',"
);

fs.writeFileSync('src/components/Sidebar.jsx', content);
console.log("Updated Sidebar.jsx");
