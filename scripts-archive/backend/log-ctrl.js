const fs = require('fs');
let content = fs.readFileSync('controllers/registrationController.js', 'utf8');

content = content.replace(
  "if (existingCount >= programme.maxParticipants) {",
  "console.log(`Checking existingCount=${existingCount} vs max=${programme.maxParticipants}`);\n        if (existingCount >= programme.maxParticipants) {"
);
fs.writeFileSync('controllers/registrationController.js', content);
