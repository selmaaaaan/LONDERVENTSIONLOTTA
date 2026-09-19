require('dotenv').config();
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

async function getQuota() {
  await mongoose.connect(process.env.MONGO_URI);
  const Registration = mongoose.model('Registration', new mongoose.Schema({}, { strict: false }));
  
  const docs = await Registration.find({ team: new ObjectId("6a9da92608b6dacb8e7f3661"), programme: new ObjectId("6aa53238b505df4ce11fcf57") });
  console.log(docs.length);
  process.exit(0);
}
getQuota().catch(console.error);
