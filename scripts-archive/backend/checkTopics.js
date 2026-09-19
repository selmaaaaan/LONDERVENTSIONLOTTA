const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hudafestival');
  const programmes = await mongoose.connection.db.collection('programmes').find({ 
    topicMode: { $ne: 'none' } 
  }).toArray();
  console.log(programmes.map(p => ({ category: p.category, code: p.code, name: p.name, topicMode: p.topicMode })));
  process.exit(0);
}

run();
