const fs = require('fs');
let content = fs.readFileSync('src/pages/result-entry/BatchPrintView.jsx', 'utf8');

content = content.replace(/className="/g, 'className="!text-black ');
content = content.replace(/!text-black bg-blue-600/g, 'bg-blue-600 text-white'); // fix the button

fs.writeFileSync('src/pages/result-entry/BatchPrintView.jsx', content);
console.log('Fixed text colors');
