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
let count = 0;
files.forEach(file => {
    let lines = fs.readFileSync(file, 'utf8').split(/\r?\n|\r/);
    lines.forEach((line, i) => {
        if (line.includes('text-white')) {
            count++;
            const hasBg = /bg-(?:red|green|emerald|blue|indigo|orange|amber|black|slate-900|#|\[)/.test(line);
            if (!hasBg) {
                output.push(file + ':' + (i+1) + ' -> ' + line.trim());
            }
        }
    });
});
console.log('Total text-white lines:', count);
console.log(output.join('\\n'));
