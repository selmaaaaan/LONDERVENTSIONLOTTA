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
    let lines = fs.readFileSync(file, 'utf8').split('\\n');
    lines.forEach((line, i) => {
        if (line.includes('text-white')) {
            output.push(file + ':' + (i+1));
        }
    });
});
console.log(output.join('\\n'));
