const fs = require('fs');
const file = 'controllers/registrationController.js';
let content = fs.readFileSync(file, 'utf8');

const target = `        const saved = await newRegistration.save();`;
const replacement = `        const saved = await newRegistration.save();

        // Post-insert anti-race-condition quota check
        const postInsertCount = await Registration.countDocuments({
            programme: programmeId,
            team: teamId,
            status: { $in: ['pending', 'approved'] }
        });

        if (postInsertCount > programme.maxParticipants) {
            // Rollback this specific concurrent insert
            await Registration.findByIdAndDelete(saved._id);
            return res.status(400).json({ message: 'Team has reached maximum participants for this programme (concurrent request blocked)' });
        }`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log("Updated controller");
