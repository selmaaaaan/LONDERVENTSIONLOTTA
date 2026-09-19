const mongoose = require('mongoose');
const Result = require('./models/Result');
const Programme = require('./models/Programme');
const { POSITION_POINTS, GRADE_POINTS } = require('./config/bylawRules');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        const approvedResults = await Result.find({ status: 'approved' }).populate('programme');
        let flagged = 0;
        for (const result of approvedResults) {
            const programme = result.programme;
            if (!programme) continue;
            
            let tier = 'individual';
            if (programme.category === 'KULLIYYAH') tier = 'kulliyyah';
            else if (programme.isStarred) tier = 'starred';
            else if (programme.format === 'Group') tier = 'group';

            let gradeTier = (programme.isStarred || programme.format === 'Group' || programme.category === 'KULLIYYAH') ? 'starred' : 'standard';

            const expectedRankPoints = result.rank ? (POSITION_POINTS[tier]?.[result.rank] || 0) : 0;
            const expectedGradePoints = result.grade ? (GRADE_POINTS[gradeTier]?.[result.grade] || 0) : 0;

            if (result.pointsFromRank !== expectedRankPoints || result.pointsFromGrade !== expectedGradePoints) {
                console.log('Flagging result', result._id, 'for candidate', result.candidate);
                const totalPoints = result.totalPoints;
                
                await mongoose.model('Candidate').updateOne({ _id: result.candidate }, { $inc: { totalPoints: -totalPoints } });
                const candidate = await mongoose.model('Candidate').findById(result.candidate);
                if (candidate && candidate.team) {
                    await mongoose.model('Team').updateOne({ _id: candidate.team }, { $inc: { totalPoints: -totalPoints } });
                }
                
                result.status = 'pending';
                result.pointsFromRank = 0;
                result.pointsFromGrade = 0;
                result.totalPoints = 0;
                await result.save();
                flagged++;
            }
        }
        console.log('Done. Flagged ' + flagged + ' results.');
        process.exit(0);
    });
