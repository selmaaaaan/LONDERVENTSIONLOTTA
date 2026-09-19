require('dotenv').config();
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

async function findEmpty() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const Programme = mongoose.model('Programme', new mongoose.Schema({}, { strict: false }));
  const Registration = mongoose.model('Registration', new mongoose.Schema({}, { strict: false }));
  const Candidate = mongoose.model('Candidate', new mongoose.Schema({}, { strict: false }));
  
  const progs = await Programme.find({ format: 'Individual' });
  
  for (const p of progs) {
      const cands = await Candidate.find({ category: p.category });
      for (const cand of cands) {
          const count = await Registration.countDocuments({ team: cand.team, programme: p._id });
          if (count < p.maxParticipants) {
              console.log(`Prog: ${p._id}, Team: ${cand.team}, Cand: ${cand._id}`);
              process.exit(0);
          }
      }
  }
}
findEmpty().catch(console.error);
