require('dotenv').config();
const mongoose = require('mongoose');
const Programme = require('./models/Programme');
const Registration = require('./models/Registration');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    // Manually fetch programmes
    const progs = await Programme.find().lean();
    const progMap = {};
    progs.forEach(p => progMap[p._id.toString()] = p.maxParticipants || Infinity);

    const allRegs = await Registration.find();
    let trimmed = 0;
    for (const r of allRegs) {
        if (!r.programme) continue;
        const max = progMap[r.programme.toString()] || Infinity;
        if (r.candidates && r.candidates.length > max) {
            console.log(`Trimming ${r._id} from ${r.candidates.length} to ${max}`);
            r.candidates = r.candidates.slice(0, max);
            await r.save();
            trimmed++;
        }
    }
    console.log(`Trimmed candidates arrays for ${trimmed} registrations that exceeded maxParticipants.`);
    
    process.exit(0);
});