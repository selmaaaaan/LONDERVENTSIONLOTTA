const fs = require('fs');
let fileContent = fs.readFileSync('src/App.jsx', 'utf8');

const lines = fileContent.split('\n');
const seen = new Set();
const newLines = [];

for (const line of lines) {
    if (line.startsWith('import ') && line.includes('/result-entry/')) {
        if (seen.has(line.trim())) {
            continue;
        }
        seen.add(line.trim());
    }
    if (line.startsWith('import ResultEntryLayout')) {
        if (seen.has(line.trim())) {
            continue;
        }
        seen.add(line.trim());
    }
    newLines.push(line);
}

fs.writeFileSync('src/App.jsx', newLines.join('\n'));
console.log('App.jsx duplicates removed');
