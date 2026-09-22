const mongoose = require('mongoose');
const Batch = require('./models/Batch');
const Result = require('./models/Result');

mongoose.connect('mongodb+srv://admin:hudafestadmin123@cluster0.zb2c00b.mongodb.net/hudafestival?retryWrites=true&w=majority&appName=Cluster0')
  .then(async () => {
    const batches = await Batch.find({}, 'name status');
    console.log('BATCHES:', batches);
    
    // Find SEP20 NIGHT
    const sep20 = await Batch.findOne({ name: /SEP20 NIGHT/i });
    if (sep20) {
      console.log('SEP20 _id:', sep20._id, 'status:', sep20.status);
      const results1 = await Result.find({ batchId: sep20._id }).countDocuments();
      const results2 = await Result.find({ batchId: sep20._id.toString() }).countDocuments();
      console.log('Results with ObjectId:', results1, 'Results with String:', results2);
    }
    
    process.exit(0);
  });
