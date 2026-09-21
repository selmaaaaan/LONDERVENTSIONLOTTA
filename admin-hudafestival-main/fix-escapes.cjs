const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const targetFiles = [];

walkDir('src', function(filePath) {
    if (filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('\\`') || content.includes('\\${')) {
            targetFiles.push(filePath);
            content = content.replace(/\\`/g, '`').replace(/\\\${/g, '${');
            fs.writeFileSync(filePath, content);
        }
    }
});

console.log("Fixed files: ", targetFiles);
