const mongoose = require('mongoose');
const Batch = require('./models/Batch');
const Result = require('./models/Result');
const Candidate = require('./models/Candidate');
const Team = require('./models/Team');

mongoose.connect('mongodb+srv://admin:hudafestadmin123@cluster0.zb2c00b.mongodb.net/hudafestival?retryWrites=true&w=majority&appName=Cluster0')
  .then(async () => {
    const batch = await Batch.findOne({ name: /SEP20 NIGHT/i });
    
    const projectionResults = await Result.find({
        $or: [
            { status: 'approved', batchId: { $ne: batch._id } },
            { batchId: batch._id }
        ]
    });
    
    console.log('Results length:', projectionResults.length);
    if(projectionResults.length > 0) {
       console.log('Sample result:', projectionResults[0]);
    }
    process.exit(0);
  });
