require('dotenv').config();
const mongoose = require('mongoose');
const Programme = require('./models/Programme');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const progs = await Programme.find({ category: 'KULLIYYAH', stageType: 'non-stage' }).lean();
    console.log(`Found ${progs.length} Kulliyyah Non-Stage programmes`);
    for (const p of progs) {
        console.log(`- ${p.name} | requiresRegistration: ${p.requiresRegistration} | format: ${p.format} | topicMode: ${p.topicMode}`);
    }
    process.exit(0);
});