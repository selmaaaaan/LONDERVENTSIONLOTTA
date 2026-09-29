const fs = require('fs');
let c = fs.readFileSync('src/pages/result-entry/ResultReportsPage.jsx', 'utf8');

// We are looking for the exact bad string:
// key={\`cell-\${index}\`}
const badString = "key={\\`cell-\\${index}\\`}";
const goodString = "key={`cell-${index}`}";

if (c.includes(badString)) {
    c = c.replace(badString, goodString);
    fs.writeFileSync('src/pages/result-entry/ResultReportsPage.jsx', c);
    console.log("Fixed!");
} else {
    console.log("Could not find the bad string!");
}
