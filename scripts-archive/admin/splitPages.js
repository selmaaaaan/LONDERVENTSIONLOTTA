const fs = require('fs');

let orig = fs.readFileSync('src/pages/TeamLeaderDashboard_BACKUP.jsx', 'utf8');

// CREATE TeamLeaderDashboard.jsx (Without Topics)
let dash = orig;
dash = dash.replace(/\{ key: 'topics',[\s\S]*?\},/, '');
// Remove the Topic table rendering
dash = dash.replace(/\{activeTab === 'topics' && \([\s\S]*?\}\)/, '');
// Remove the topic modal
dash = dash.replace(/\{[ \t]*\/\* -----------------------------------------------------------------------\s*Submit Topic Modal[\s\S]*?<\/Modal>/, '');

fs.writeFileSync('src/pages/TeamLeaderDashboard.jsx', dash);

// CREATE TeamTopicRegistrationPage.jsx (Without Normal Registrations)
let topic = orig;
topic = topic.replace(/TeamLeaderDashboard/g, 'TeamTopicRegistrationPage');
// Change activeTab to just not exist or default to topics
topic = topic.replace(/const \[activeTab, setActiveTab\] = useState\('registrations'\);/, "const [activeTab, setActiveTab] = useState('topics');");
// Remove normal tab rendering
topic = topic.replace(/\{ key: 'registrations',[\s\S]*?\},/, '');
// Remove normal table rendering
topic = topic.replace(/\{activeTab === 'registrations' && \([\s\S]*?\}\)/, '');
// Remove normal modal
topic = topic.replace(/\{[ \t]*\/\* -----------------------------------------------------------------------\s*Registration Modal[\s\S]*?<\/Modal>/, '');

fs.writeFileSync('src/pages/TeamTopicRegistrationPage.jsx', topic);

