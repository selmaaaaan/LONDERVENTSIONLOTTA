const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src/pages').concat(walk('src/components'));

let linesWithTextWhite = [];
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let lines = content.split('\\n');
    lines.forEach((line, i) => {
        if (line.includes('text-white')) {
            linesWithTextWhite.push(file + ':' + (i+1) + ' -> ' + line.trim());
        }
    });
});
fs.writeFileSync('text-white-lines.txt', linesWithTextWhite.join('\\n'));
console.log('Done');
