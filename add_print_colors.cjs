const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/index.css', 'utf8');

c = c.replace(
    '@media print {',
    `@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }`
);

c = c.replace(
    'background-color: white !important;',
    'background-color: white !important;\n    box-shadow: none !important;'
);

fs.writeFileSync('admin-hudafestival-main/src/index.css', c);
console.log('Added precise print colors');
