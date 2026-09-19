require('dotenv').config();
const mongoose = require('mongoose');
const Registration = require('./models/Registration');
const Programme = require('./models/Programme');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const regs = await Registration.find().populate('programme').limit(5).lean();
    console.log(JSON.stringify(regs, null, 2));
    process.exit(0);
});