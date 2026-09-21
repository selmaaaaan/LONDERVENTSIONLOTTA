const fs = require('fs');
let content = fs.readFileSync('controllers/resultController.js', 'utf8');

const regex = /let tier = 'individual';\s+if \(programme\.category === 'KULLIYYAH'\) \{\s+tier = 'kulliyyah';\s+\} else if \(programme\.isStarred\) \{\s+tier = 'starred';\s+\} else if \(programme\.format === 'Group'\) \{\s+tier = 'group';\s+\}\s+let gradeTier = programme\.isStarred \? 'starred' : 'standard';\s+for \(const result of pendingResults\) \{\s+const pointsFromRank = result\.rank \? \(POSITION_POINTS\[tier\]\?\.\[result\.rank\] \|\| 0\) : 0;\s+const pointsFromGrade = result\.grade \? \(GRADE_POINTS\[gradeTier\]\?\.\[result\.grade\] \|\| 0\) : 0;\s+const totalPoints = pointsFromRank \+ pointsFromGrade;/m;

const newLoop = `    for (const result of pendingResults) {
        const { pointsFromRank, pointsFromGrade, totalPoints } = calculatePointsForResult(result, programme, POSITION_POINTS, GRADE_POINTS);`;

content = content.replace(regex, newLoop);

fs.writeFileSync('controllers/resultController.js', content);
