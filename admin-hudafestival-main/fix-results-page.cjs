const fs = require('fs');
let p = 'src/pages/ResultsPage.jsx';
let text = fs.readFileSync(p, 'utf8');

text = text.replace(/api\.get\(\`\/registrations\?programme=\$\{prog\._id\}\`\)/, "api.get(`/registrations?programme=${prog._id}&status=approved`)");

fs.writeFileSync(p, text);
