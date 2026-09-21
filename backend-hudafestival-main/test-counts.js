const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const Result = require('./models/Result');
    
    const allCount = await Result.countDocuments();
    const approvedCount = await Result.countDocuments({ status: 'approved' });
    const pendingCount = await Result.countDocuments({ status: 'pending' });
    const draftCount = await Result.countDocuments({ status: 'draft' });
    
    console.log(`Before Fix (All Results): ${allCount}`);
    console.log(`After Fix (Approved Only): ${approvedCount}`);
    console.log(`Pending: ${pendingCount}`);
    console.log(`Draft: ${draftCount}`);
    
    process.exit(0);
}
run();
