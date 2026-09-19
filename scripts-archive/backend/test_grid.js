require('dotenv').config();
const mongoose = require('mongoose');
const Programme = require('./models/Programme');
const Registration = require('./models/Registration');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const teamId = '6a9da92608b6dacb8e7f3661'; // Tahrir
    const programmes = await Programme.find().lean();
    const registrations = await Registration.find({ team: teamId }).lean();
    
    programmes.forEach(prog => {
        const progRegs = registrations.filter(r => r.programme && r.programme.toString() === prog._id.toString());
        const registeredCount = progRegs.reduce((sum, r) => sum + (r.candidates ? r.candidates.length : 0), 0);
        const maxAllowed = prog.maxParticipants || Infinity;
        if (prog.name.includes('SPEECH & SONG')) {
            console.log(`[${prog.code}] ${prog.name}: ${registeredCount}/${maxAllowed}`);
        }
    });

    process.exit(0);
});