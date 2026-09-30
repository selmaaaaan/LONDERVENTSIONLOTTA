require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    
    const b = await db.collection('batches').find({ status: { $ne: 'published' } }).toArray();
    console.log('Pending batches:', b.map(x=>x.name));
    process.exit(0);
}
run();
