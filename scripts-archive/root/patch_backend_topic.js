const fs = require('fs');
const p = 'backend-hudafestival-main/controllers/topicRegistrationController.js';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(
  /const existingTeamTopic = await TopicRegistration\.findOne\(\{ programme: programmeId, team: teamId, topic: topic \}\);\s*if \(existingTeamTopic\) \{\s*return res\.status\(400\)\.json\(\{ message: 'Your team has already selected this topic for another candidate in this programme' \}\);\s*\}/,
  "// Ensure the team doesn't select the same topic for two different candidates (except free-text where topics can naturally overlap)\n        if (programme.topicMode !== 'free-text') {\n            const existingTeamTopic = await TopicRegistration.findOne({ programme: programmeId, team: teamId, topic: topic });\n            if (existingTeamTopic) {\n                return res.status(400).json({ message: 'Your team has already selected this topic for another candidate in this programme' });\n            }\n        }"
);

// Do the same for updateTopic
code = code.replace(
  /const existingTeamTopic = await TopicRegistration\.findOne\(\{ programme: registration\.programme, team: registration\.team, topic: topic \}\);\s*if \(existingTeamTopic\) \{\s*return res\.status\(400\)\.json\(\{ message: 'Your team has already selected this topic for another candidate in this programme' \}\);\s*\}/,
  "if (registration.programme.topicMode !== 'free-text') {\n                const existingTeamTopic = await TopicRegistration.findOne({ programme: registration.programme, team: registration.team, topic: topic });\n                if (existingTeamTopic) {\n                    return res.status(400).json({ message: 'Your team has already selected this topic for another candidate in this programme' });\n                }\n            }"
);

fs.writeFileSync(p, code);
