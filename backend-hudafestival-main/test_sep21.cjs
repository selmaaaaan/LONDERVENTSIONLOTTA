const mongoose = require('mongoose');
const Batch = require('./models/Batch');
const Result = require('./models/Result');

mongoose.connect('mongodb+srv://admin:hudafestadmin123@cluster0.zb2c00b.mongodb.net/hudafestival?retryWrites=true&w=majority&appName=Cluster0')
  .then(async () => {
    const batch = await Batch.findOne({ name: /SEP21 NIGHT/i });
    console.log('SEP21 NIGHT status:', batch.status);
    
    const resultsObjectId = await Result.find({ batchId: batch._id });
    const resultsString = await Result.find({ batchId: batch._id.toString() });
    
    console.log('ObjectId match:', resultsObjectId.length, 'String match:', resultsString.length);
    
    if (resultsString.length > 0) {
      console.log('Sample string match totalPoints:', resultsString[0].totalPoints, resultsString[0].status);
    }
    process.exit(0);
  });
