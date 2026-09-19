const fs = require('fs');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = dir + '/' + f;
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

const files = [];
walkDir('admin-hudafestival-main/src/pages', (filePath) => {
    if (filePath.endsWith('.jsx')) {
        let c = fs.readFileSync(filePath, 'utf8');
        if (/\balert\(/.test(c)) files.push(filePath);
    }
});

files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    
    // Add import
    if (!c.includes("useAlert")) {
        c = c.replace(
            /(import React.*?;\n)/,
            `$1import { useAlert } from '../context/AlertContext';\n`
        );
    }
    
    // Add hook
    const compRegex = /(const \w+\s*=\s*(async\s*)?\([^)]*\)\s*=>\s*\{)/;
    if (!c.includes("const alertAction = useAlert();")) {
        c = c.replace(compRegex, `$1\n  const alertAction = useAlert();\n`);
    }

    // Replace window.alert and alert
    c = c.replace(/window\.alert\(/g, 'alertAction(');
    // Replace standalone alert( but be careful not to match alertAction(
    c = c.replace(/(?<!\w)alert\(/g, 'alertAction(');

    fs.writeFileSync(f, c, 'utf8');
});

console.log(files);