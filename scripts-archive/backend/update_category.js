require('dotenv').config();
const mongoose = require('mongoose');
const Programme = require('./models/Programme');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const progs = await Programme.find({ category: 'KULLIYYAH', stageType: 'non-stage' });
    for (const p of progs) {
        if (p.requiresRegistration === false && p.format === 'Group') {
            p.category = 'GENERAL';
            await p.save();
            console.log(`Updated ${p.name} to GENERAL`);
        }
    }
    process.exit(0);
});