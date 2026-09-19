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

let count = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Look for bg-white
    const original = content;
    
    // Replace bg-white with bg-[var(--color-surface)] ONLY IF it doesn't have dark:bg- or it's not print:bg-white
    // Wait, simple replace first, then we can review diff
    content = content.replace(/(?<!print:)bg-white(?!\/)/g, 'bg-[var(--color-surface)]');
    
    if (content !== original) {
        fs.writeFileSync(file, content);
        count++;
    }
});

console.log('Replaced bg-white in ' + count + ' files.');
