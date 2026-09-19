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
const files = walk('admin-hudafestival-main/src/pages').concat(walk('admin-hudafestival-main/src/components'));
let output = [];
let textSlateCount = 0;
let bgSlateCount = 0;

files.forEach(file => {
    let lines = fs.readFileSync(file, 'utf8').split(/\r?\n|\r/);
    lines.forEach((line, i) => {
        if (line.match(/text-(?:slate|gray|zinc|neutral|stone)-(?:[4-9]00|950)/)) {
            if (!line.includes('dark:text-') && !line.includes('print:')) {
                textSlateCount++;
            }
        }
        if (line.match(/bg-(?:slate|gray|zinc|neutral|stone)-(?:[5-9]0|100|200)/)) {
            if (!line.includes('dark:bg-') && !line.includes('print:')) {
                bgSlateCount++;
            }
        }
    });
});
console.log('Un-dark-themed text-slate count:', textSlateCount);
console.log('Un-dark-themed bg-slate count:', bgSlateCount);
