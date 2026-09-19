const fs = require('fs');
let content = fs.readFileSync('controllers/registrationController.js', 'utf8');

content = content.replace(
  "console.log(`Checking existingCount=${existingCount} vs max=${programme.maxParticipants}`);",
  "console.log(`Checking existingCount=${existingCount} vs max=${programme.maxParticipants} for prog=${programmeId} and team=${teamId}`);"
);
fs.writeFileSync('controllers/registrationController.js', content);
