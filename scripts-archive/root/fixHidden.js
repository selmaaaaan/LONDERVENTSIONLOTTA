const fs = require('fs');
const file = 'admin-hudafestival-main/src/pages/JurySlipsPage.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  'print:block hidden bg-white',
  'print:block bg-white'
);
fs.writeFileSync(file, content);
console.log("Removed hidden class.");
