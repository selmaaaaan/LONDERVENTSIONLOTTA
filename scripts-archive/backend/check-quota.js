require('dotenv').config();
const mongoose = require('mongoose');

async function checkQuota() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const teamId = "6a9da92608b6dacb8e7f3661";
  const progId = "6aa53238b505df4ce11fcf57";
  
  const Programme = mongoose.model('Programme', new mongoose.Schema({}, { strict: false }));
  const Registration = mongoose.model('Registration', new mongoose.Schema({}, { strict: false }));
  
  const prog = await Programme.findById(progId);
  const count = await Registration.countDocuments({ team: teamId, programme: progId, status: { $in: ['pending', 'approved'] } });
  
  console.log(`Max: ${prog.maxParticipants}, Current: ${count}`);
  
  if (count >= prog.maxParticipants) {
      // Find a programme with space!
      const allProgs = await Programme.find();
      for (const p of allProgs) {
          const c = await Registration.countDocuments({ team: teamId, programme: p._id, status: { $in: ['pending', 'approved'] } });
          if (c < p.maxParticipants) {
              console.log(`Found space in Prog ${p._id}. Max: ${p.maxParticipants}, Current: ${c}, Category: ${p.category}`);
              break;
          }
      }
  }
  
  process.exit(0);
}
checkQuota().catch(console.error);
