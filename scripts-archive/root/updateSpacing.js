const fs = require('fs');
const file = 'frontend-hudafestival-main/src/pages/HomePage.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/py-24/g, 'py-16 md:py-24');
fs.writeFileSync(file, content);
console.log('Updated py-24 spacing');
