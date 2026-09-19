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
        if (c.includes('window.confirm')) files.push(filePath);
    }
});

files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    
    if (!c.includes("useConfirm")) {
        c = c.replace(
            /(import React.*?;\n)/,
            `$1import { useConfirm } from '../context/ConfirmContext';\n`
        );
    }
    
    const compRegex = /(const \w+\s*=\s*(async\s*)?\([^)]*\)\s*=>\s*\{)/;
    if (!c.includes("const confirmAction = useConfirm();")) {
        c = c.replace(compRegex, `$1\n  const confirmAction = useConfirm();\n`);
    }

    fs.writeFileSync(f, c, 'utf8');
});
console.log(files);