require('dotenv').config();
const mongoose = require('mongoose');
const Programme = require('./backend-hudafestival-main/models/Programme');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const progs = await Programme.find({ category: 'THANIYYAH' });
    progs.forEach(p => {
        console.log(`[${p.code}] ${p.name} - Format: ${p.format}, Type: ${p.type}, maxPart: ${p.maxParticipants}, groupSize: ${p.groupSize}`);
    });
    process.exit(0);
});