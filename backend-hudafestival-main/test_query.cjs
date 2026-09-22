const mongoose = require('mongoose');
const Batch = require('./models/Batch');
const Result = require('./models/Result');

mongoose.connect('mongodb+srv://admin:hudafestadmin123@cluster0.zb2c00b.mongodb.net/hudafestival?retryWrites=true&w=majority&appName=Cluster0')
  .then(async () => {
    const batch = await Batch.findOne({ name: /SEP20 NIGHT/i });
    console.log('Batch found:', batch._id);
    
    const projectionResults = await Result.find({
        $or: [
            { status: 'approved', batchId: { $ne: batch._id } },
            { batchId: batch._id }
        ]
    });
    
    console.log('Found projection results:', projectionResults.length);
    
    const draftResults = await Result.find({ batchId: batch._id, status: 'draft' });
    console.log('Draft results:', draftResults.length);
    const pendingResults = await Result.find({ batchId: batch._id, status: 'pending' });
    console.log('Pending results:', pendingResults.length);
    
    process.exit(0);
  });
