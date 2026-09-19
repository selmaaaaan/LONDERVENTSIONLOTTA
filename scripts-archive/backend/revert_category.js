require('dotenv').config();
const mongoose = require('mongoose');
const Programme = require('./models/Programme');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const progs = await Programme.find({ category: 'GENERAL', stageType: 'non-stage' });
    for (const p of progs) {
        if (p.requiresRegistration === false && p.format === 'Group') {
            p.category = 'KULLIYYAH';
            await p.save();
            console.log(`Reverted ${p.name} to KULLIYYAH`);
        }
    }
    process.exit(0);
});