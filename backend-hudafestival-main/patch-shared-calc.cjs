const fs = require('fs');
let content = fs.readFileSync('controllers/resultController.js', 'utf8');

const calculatePointsCode = `
const calculatePointsForResult = (result, programme, POSITION_POINTS, GRADE_POINTS) => {
    let tier = 'individual';
    if (programme.category === 'KULLIYYAH') {
        tier = 'kulliyyah';
    } else if (programme.isStarred) {
        tier = 'starred';
    } else if (programme.format === 'Group') {
        tier = 'group';
    }

    let gradeTier = programme.isStarred ? 'starred' : 'standard';

    const pointsFromRank = result.rank ? (POSITION_POINTS[tier]?.[result.rank] || 0) : 0;
    const pointsFromGrade = result.grade ? (GRADE_POINTS[gradeTier]?.[result.grade] || 0) : 0;
    
    return { pointsFromRank, pointsFromGrade, totalPoints: pointsFromRank + pointsFromGrade };
};

const approveForProgramme`;

content = content.replace("const approveForProgramme", calculatePointsCode);

const loopToReplace = `    let tier = 'individual';
    if (programme.category === 'KULLIYYAH') {
        tier = 'kulliyyah';
    } else if (programme.isStarred) {
        tier = 'starred';
    } else if (programme.format === 'Group') {
        tier = 'group';
    }

    let gradeTier = programme.isStarred ? 'starred' : 'standard';

    for (const result of pendingResults) {
        const pointsFromRank = result.rank ? (POSITION_POINTS[tier]?.[result.rank] || 0) : 0;
        const pointsFromGrade = result.grade ? (GRADE_POINTS[gradeTier]?.[result.grade] || 0) : 0;
        const totalPoints = pointsFromRank + pointsFromGrade;`;

const newLoop = `    for (const result of pendingResults) {
        const { pointsFromRank, pointsFromGrade, totalPoints } = calculatePointsForResult(result, programme, POSITION_POINTS, GRADE_POINTS);`;

content = content.replace(loopToReplace, newLoop);

fs.writeFileSync('controllers/resultController.js', content);
