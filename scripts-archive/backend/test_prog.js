require('dotenv').config();
const mongoose = require('mongoose');
const Programme = require('./models/Programme');
const Registration = require('./models/Registration');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const prog = await Programme.findOne({ code: 'TS22' });
    const regs = await Registration.find({ programme: prog._id });
    regs.forEach(r => {
        console.log(`Team ID ${r.team}: ${r.candidates.length} candidates, Registration ID ${r._id}`);
    });
    process.exit(0);
});