require('dotenv').config();
const mongoose = require('mongoose');
const Registration = require('./models/Registration');
const Programme = require('./models/Programme');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const p = await Programme.findOne({ code: 'TS22' });
    const regs = await Registration.find({ programme: p._id });
    console.log(`TS22 Max: ${p.maxParticipants}, Format: ${p.format}`);
    regs.forEach(r => {
        console.log(`Reg ${r._id} for Team ${r.team}: ${r.candidates.length} candidates`);
    });
    process.exit(0);
});