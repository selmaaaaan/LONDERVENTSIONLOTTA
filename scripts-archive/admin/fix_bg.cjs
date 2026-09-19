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
    
    // Look for text-white
    const original = content;
    
    // We want to replace text-white with text-[var(--color-surface)] OR text-[var(--color-text-heading)]
    // Actually, usually text-white in dark mode was meant to be the opposite of bg-white. So text-white -> text-[var(--color-text-heading)] is WRONG if it was white in light mode too.
    // Wait, if it was text-white in light mode, then it's probably on a dark background. So it should stay text-white!
    // The prompt says: "Where the element already sits on a colored background that doesn't change between light/dark... text-white is usually correct... leave those alone. Where the element's background itself is theme-dependent... replace the hardcoded white with the existing CSS custom properties".
    
    // Let's find all text-white occurrences. 
    // Is there any text-white that sits on a theme-dependent background?
    // In light mode, theme-dependent backgrounds are usually white or light gray. text-white would be INVISIBLE in light mode!
    // Why would there be text-white?
    // Ah, maybe they added 	ext-white specifically to fix dark mode, but it broke light mode? 
    // Or maybe they mean: the text is white in dark mode, but in light mode it should be black.
    // Wait, if it's 	ext-white WITHOUT a dark: prefix, it means it's ALWAYS white. If it's on a light background, it's invisible in light mode!
    // Let's grep for text-white to see the lines.
    
    // Let's revert the g-white on UsersPage.jsx and AddProgrammeForm.jsx toggle knobs.
    if (file.endsWith('UsersPage.jsx') || file.endsWith('AddProgrammeForm.jsx') || file.endsWith('TeamLeaderDashboard.jsx') || file.endsWith('TeamTopicRegistrationPage.jsx') || file.endsWith('DashboardHero.jsx')) {
        content = content.replace(/bg-\[var\(--color-surface\)\].*?transition-transform/g, 'bg-white transition-transform');
        content = content.replace(/bg-white\/60/g, 'bg-white/60');
        // Actually DashboardHero used g-[var(--color-surface)]/60, let's leave it or revert.
    }
    
    fs.writeFileSync(file, content);
});

console.log('Reverted some bad bg-white replacements');
