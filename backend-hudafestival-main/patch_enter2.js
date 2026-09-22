const fs = require('fs');
const p = '../admin-hudafestival-main/src/pages/result-entry/EnterResultPage.jsx';
let content = fs.readFileSync(p, 'utf8');

const target = `            // Flatten candidates
            let allCands = [];
            regs.forEach(r => {
                if(r.candidates) allCands = allCands.concat(r.candidates);
            });`;

const replacement = `            // Flatten or Group candidates
            let allCands = [];
            if (prog.format === 'Group' || prog.category === 'KULLIYYAH') {
                regs.forEach(r => {
                    if (r.candidates && r.candidates.length > 0) {
                        const rep = r.candidates[0];
                        allCands.push({
                            ...rep,
                            name: \`\${rep.name} and team (\${r.team?.name || 'Unknown'})\`,
                            _originalCandidates: r.candidates,
                            isGroupRow: true
                        });
                    }
                });
            } else {
                regs.forEach(r => {
                    if(r.candidates) allCands = allCands.concat(r.candidates);
                });
            }`;

if(content.includes(target)){
    content = content.replace(target, replacement);
    fs.writeFileSync(p, content);
    console.log('Patched EnterResultPage.jsx successfully');
} else {
    // Try to match with different whitespace
    const targetRegex = /\/\/ Flatten candidates\s*let allCands = \[\];\s*regs\.forEach\(r => \{\s*if\(r\.candidates\) allCands = allCands\.concat\(r\.candidates\);\s*\}\);/;
    if(targetRegex.test(content)){
        content = content.replace(targetRegex, replacement);
        fs.writeFileSync(p, content);
        console.log('Patched EnterResultPage.jsx successfully using regex');
    } else {
        console.log('Target not found in EnterResultPage.jsx');
    }
}
