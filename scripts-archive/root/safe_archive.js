const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const archiveDir = path.join(__dirname, 'scripts-archive');
if (!fs.existsSync(archiveDir)) { fs.mkdirSync(archiveDir); }

// Fetch the list of tracked patch/fix files from git
const gitOutput = execSync('git ls-files | findstr /R "^.*patch.* ^.*fix.*\\.js ^.*\\.bak ^.*\\.cjs"').toString();
const files = gitOutput.split('\n').map(f => f.trim()).filter(Boolean);

let movedList = [];

files.forEach(f => {
    // Exclude anything that might actually be legitimate source code or inside node_modules
    if (f.includes('node_modules') || f.includes('src/components') || f.includes('src/context') || f.startsWith('scripts-archive/')) return;
    // We only want patch, fix, test, strip, etc. 
    // And NOT regular files like prefix-something.js
    
    const srcPath = path.join(__dirname, f);
    if (!fs.existsSync(srcPath)) return;
    
    // Create subdirectories in archive to match original path
    const destPath = path.join(archiveDir, f);
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) { fs.mkdirSync(destDir, { recursive: true }); }
    
    fs.renameSync(srcPath, destPath);
    movedList.push(f);
});

fs.writeFileSync(path.join(archiveDir, 'moved_log.txt'), movedList.join('\n'));
console.log('Safely archived ' + movedList.length + ' files.');
