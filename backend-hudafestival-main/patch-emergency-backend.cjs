const fs = require('fs');

// 1. Patch resultController.js
let rc = fs.readFileSync('controllers/resultController.js', 'utf8');

const s1 = `const savePendingResultsBulk = async (req, res) => {
    const { results, batchId } = req.body;`;
const s2 = `const savePendingResultsBulk = async (req, res) => {
    const { results, batchId, isEmergencyOverride } = req.body;
    
    if (req.user.role === 'admin' && isEmergencyOverride !== true) {
        return res.status(403).json({ message: 'Admin score editing requires explicit emergency override flag.' });
    }`;

rc = rc.replace(s1, s2);

const s3 = `await Result.bulkWrite(bulkOps);
        }
        await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'RESULT_SAVED', entityType: 'Result', details: { programmeId, count: results.length, batchId }, req });`;

const s4 = `await Result.bulkWrite(bulkOps);
        }
        
        if (req.user.role === 'admin' && isEmergencyOverride === true) {
            await logAction({ 
                actor: req.user._id, actorRole: req.user.role, 
                action: 'EMERGENCY_SCORE_OVERRIDE', 
                entityType: 'Programme', entityId: programmeId, 
                details: { programme: programme.name, count: results.length, batchId, payload: results }, 
                req 
            });
        } else {
            await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'RESULT_SAVED', entityType: 'Result', details: { programmeId, count: results.length, batchId }, req });
        }`;

rc = rc.replace(s3, s4);

fs.writeFileSync('controllers/resultController.js', rc);
