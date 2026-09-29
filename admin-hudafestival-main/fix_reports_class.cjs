const fs = require('fs');
let c = fs.readFileSync('src/pages/result-entry/ResultReportsPage.jsx', 'utf8');

// Replace the category data with class data
const t1 = `// 1. Calculate Category-wise scores
    const catScores = {};
    results.forEach(r => {
        if (!r.programme) return;
        const cat = r.programme.category || 'Uncategorized';
        if (!catScores[cat]) catScores[cat] = 0;
        catScores[cat] += (r.totalPoints || 0);
    });
    const categoryData = Object.keys(catScores).map(c => ({
        name: c,
        points: catScores[c]
    })).sort((a, b) => b.points - a.points);`;

const r1 = `// 1. Calculate Class-wise scores
    const classScores = {};
    results.forEach(r => {
        if (!r.candidates) return;
        r.candidates.forEach(cItem => {
            if (cItem.candidate && cItem.candidate.classLevel) {
                const cls = \`Class \${cItem.candidate.classLevel}\`;
                if (!classScores[cls]) classScores[cls] = 0;
                // Add the result points to this class tally
                classScores[cls] += (r.totalPoints || 0);
            }
        });
    });
    const categoryData = Object.keys(classScores).map(c => ({
        name: c,
        points: classScores[c]
    })).sort((a, b) => b.points - a.points);`;

c = c.replace(t1, r1);
fs.writeFileSync('src/pages/result-entry/ResultReportsPage.jsx', c);
console.log('Updated to use classLevel');
