require('dotenv').config();
const mongoose = require('mongoose');
const Programme = require('./models/Programme');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const progs = await Programme.find({ category: 'KULLIYYAH', stageType: 'non-stage' });
    for (const p of progs) {
        p.requiresRegistration = true;
        p.maxParticipants = 1;
        await p.save();
        console.log(`Updated ${p.name}: maxParticipants=1, requiresRegistration=true`);
    }
    process.exit(0);
});