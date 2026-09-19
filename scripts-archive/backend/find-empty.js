require('dotenv').config();
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

async function findEmpty() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const Programme = mongoose.model('Programme', new mongoose.Schema({}, { strict: false }));
  const Registration = mongoose.model('Registration', new mongoose.Schema({}, { strict: false }));
  const Candidate = mongoose.model('Candidate', new mongoose.Schema({}, { strict: false }));
  
  const progs = await Programme.find({ format: 'Individual' });
  const teamId = new ObjectId("6a9da92608b6dacb8e7f3661");
  
  for (const p of progs) {
      const count = await Registration.countDocuments({ team: teamId, programme: p._id });
      if (count === 0 && p.maxParticipants > 0) {
          const cand = await Candidate.findOne({ team: teamId, category: p.category });
          if (cand) {
              console.log(`Found empty! Prog: ${p._id}, Cand: ${cand._id}`);
              process.exit(0);
          }
      }
  }
}
findEmpty().catch(console.error);
