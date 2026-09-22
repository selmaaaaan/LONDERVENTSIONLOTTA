const mongoose = require('mongoose');
const Result = require('./models/Result');
const Programme = require('./models/Programme');
const { POSITION_POINTS, GRADE_POINTS } = require('./config/bylawRules');

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

mongoose.connect('mongodb+srv://admin:hudafestadmin123@cluster0.zb2c00b.mongodb.net/hudafestival?retryWrites=true&w=majority&appName=Cluster0')
  .then(async () => {
    const results = await Result.find({ status: { $in: ['draft', 'pending'] } }).populate('programme');
    let updated = 0;
    for (const res of results) {
       if (res.programme && (res.totalPoints === 0 || !res.totalPoints)) {
           const { pointsFromRank, pointsFromGrade, totalPoints } = calculatePointsForResult(res, res.programme, POSITION_POINTS, GRADE_POINTS);
           if (totalPoints > 0) {
               res.pointsFromRank = pointsFromRank;
               res.pointsFromGrade = pointsFromGrade;
               res.totalPoints = totalPoints;
               await res.save();
               updated++;
           }
       }
    }
    console.log('Updated ' + updated + ' results with missing points.');
    process.exit(0);
  });
