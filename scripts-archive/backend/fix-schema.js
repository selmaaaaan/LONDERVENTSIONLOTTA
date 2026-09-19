const fs = require('fs');
const file = 'models/Registration.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  "registrationSchema.index({ team: 1, programme: 1, candidates: 1 });",
  "registrationSchema.index({ team: 1, programme: 1, candidates: 1 }, { unique: true });"
);
fs.writeFileSync(file, content);
console.log("Updated schema");
