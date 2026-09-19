const fs = require("fs");
const p = "backend-hudafestival-main/controllers/topicRegistrationController.js";
let code = fs.readFileSync(p, "utf8");

code = code.replace(
  /const existingTeamTopic = await TopicRegistration\.findOne\(\{ programme: programmeId, team: teamId, topic: topic \}\);\s*if \(existingTeamTopic\) \{\s*return res\.status\(400\)\.json\(\{ message: .Your team has already selected this topic for another candidate in this programme. \}\);\s*\}/g,
  `if (programme.topicMode !== "free-text") {\n  const existingTeamTopic = await TopicRegistration.findOne({ programme: programmeId, team: teamId, topic: topic });\n  if (existingTeamTopic) {\n    return res.status(400).json({ message: "Your team has already selected this topic for another candidate in this programme" });\n  }\n}`
);

code = code.replace(
  /const existingTeamTopic = await TopicRegistration\.findOne\(\{[\s\S]*?Your team has already selected this topic for another candidate in this programme[\s\S]*?\}/g,
  (match) => {
    if (match.includes("registration.programme._id")) {
      return `if (registration.programme.topicMode !== "free-text") {\n  ${match}\n}`;
    }
    return match;
  }
);

fs.writeFileSync(p, code);
