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

files.forEach(file => {
    let lines = fs.readFileSync(file, 'utf8').split(/\r?\n|\r/);
    lines.forEach((line, i) => {
        if (line.match(/text-(?:slate|gray|zinc|neutral|stone)-(?:[4-9]00|950)/) && !line.includes('dark:text-') && !line.includes('print:')) {
            output.push(file + ':' + (i+1) + ' (TEXT) -> ' + line.trim());
        }
        if (line.match(/bg-(?:slate|gray|zinc|neutral|stone)-(?:[5-9]0|100|200)/) && !line.includes('dark:bg-') && !line.includes('print:')) {
            output.push(file + ':' + (i+1) + ' (BG) -> ' + line.trim());
        }
    });
});
console.log(output.join('\\n'));
