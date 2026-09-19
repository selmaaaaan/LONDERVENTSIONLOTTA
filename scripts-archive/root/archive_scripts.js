const fs = require('fs');
const path = require('path');

const excludeFiles = new Set([
  'vite.config.js', 'postcss.config.js', 'tailwind.config.js', 'eslint.config.js', 
  'playwright.config.js', 'jest.config.js', 'next.config.js', 'craco.config.js', 
  'vue.config.js', 'svelte.config.js', 'server.js', 'archive_scripts.js', 'current_reg.js'
]);

// Wait, the prompt specifically included `current_reg.js`. Let's not exclude it.
excludeFiles.delete('current_reg.js');

const archiveDir = path.join(__dirname, 'scripts-archive');
if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir);
}

const dirsToScan = [
  { p: __dirname, prefix: 'root' },
  { p: path.join(__dirname, 'admin-hudafestival-main'), prefix: 'admin' },
  { p: path.join(__dirname, 'backend-hudafestival-main'), prefix: 'backend' }
];

const extensions = ['.js', '.cjs', '.mjs', '.py', '.txt'];
const movedFiles = [];

dirsToScan.forEach(({ p, prefix }) => {
  if (!fs.existsSync(p)) return;
  const files = fs.readdirSync(p);
  
  files.forEach(f => {
    if (excludeFiles.has(f)) return;
    const ext = path.extname(f);
    if (extensions.includes(ext)) {
      const fullPath = path.join(p, f);
      if (fs.statSync(fullPath).isFile()) {
        const destName = `${prefix}_${f}`;
        const destPath = path.join(archiveDir, destName);
        try {
          fs.renameSync(fullPath, destPath);
          movedFiles.push(`${prefix}/${f}`);
        } catch (e) {
          console.error(`Failed to move ${f}: ${e.message}`);
        }
      }
    }
  });
});

console.log('Moved files:', movedFiles.join(', '));
console.log(`Total moved: ${movedFiles.length}`);