const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const Batch = require('./models/Batch');
    const User = require('./models/User');
    const Registration = require('./models/Registration');
    const Programme = require('./models/Programme');

    // 1. Get scorer
    const scorer = await User.findOne({ userName: 'scorer1' });
    const token = require('./utils/generateToken')(scorer._id, scorer.role);

    // 2. Get QIRA'ATH programme
    const regs = await Registration.find({ status: 'approved' }).populate('programme');
    const prog = regs[0].programme;
    const candidateId = regs[0].candidates[0];

    // 3. Create batch
    const batchRes = await fetch('http://localhost:5000/api/result-entry/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: 'Integration Test Batch', programmes: [prog._id] })
    });
    const batch = await batchRes.json();
    console.log('Batch created:', batch._id);

    // 4. Save draft results
    const draftRes = await fetch(`http://localhost:5000/api/result-entry/batches/${batch._id}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            programmeId: prog._id,
            results: [{ candidateId, rank: 1, grade: 'A', remarks: 'Excellent' }]
        })
    });
    const draftData = await draftRes.json();
    console.log(`Draft save status: ${draftRes.status}`);
    console.log('Draft data:', draftData);

    process.exit(0);
}
run();
