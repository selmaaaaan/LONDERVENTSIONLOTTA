const fs = require('fs');

let rc = fs.readFileSync('controllers/resultController.js', 'utf8');

rc = rc.replace(/const savePendingResultsBulk = async \(req, res\) => \{\s+const \{ results, batchId \} = req\.body;/, `const savePendingResultsBulk = async (req, res) => {
    const { results, batchId, isEmergencyOverride } = req.body;
    
    if (req.user.role === 'admin' && isEmergencyOverride !== true) {
        return res.status(403).json({ message: 'Admin score editing requires explicit emergency override flag.' });
    }`);

rc = rc.replace(/await Result\.bulkWrite\(bulkOps\);\s+\}\s+await logAction\(\{ actor: req\.user\._id, actorRole: req\.user\.role, action: 'RESULT_SAVED', entityType: 'Result', details: \{ programmeId, count: results\.length, batchId \}, req \}\);/, `await Result.bulkWrite(bulkOps);
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
        }`);

fs.writeFileSync('controllers/resultController.js', rc);
