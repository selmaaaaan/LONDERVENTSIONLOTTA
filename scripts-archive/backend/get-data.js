require('dotenv').config();
const mongoose = require('mongoose');

async function getData() {
  await mongoose.connect(process.env.MONGO_URI);
  const Team = mongoose.model('Team', new mongoose.Schema({}, { strict: false }));
  const Candidate = mongoose.model('Candidate', new mongoose.Schema({}, { strict: false }));
  const Programme = mongoose.model('Programme', new mongoose.Schema({}, { strict: false }));
  
  const team = await Team.findOne();
  const cand = await Candidate.findOne({ team: team._id });
  // Find a programme that cand is eligible for
  const prog = await Programme.findOne({ category: cand.category, format: 'Individual' });
  
  console.log(JSON.stringify({ teamId: team._id, candId: cand._id, progId: prog._id }));
  process.exit(0);
}
getData().catch(console.error);
