const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
const Team = require('./models/Team');
const Result = require('./models/Result');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
      console.log('Recalculating points for all candidates and teams...');
      
      const candidates = await Candidate.find({});
      const teams = await Team.find({});
      
      // Reset all to 0
      for (const c of candidates) {
          c.totalPoints = 0;
          await c.save();
      }
      for (const t of teams) {
          t.totalPoints = 0;
          await t.save();
      }
      
      // Calculate from approved results
      const approvedResults = await Result.find({ status: 'approved' });
      for (const r of approvedResults) {
          const pts = r.totalPoints || 0;
          if (pts > 0) {
              await Candidate.updateOne({ _id: r.candidate }, { $inc: { totalPoints: pts } });
              const c = await Candidate.findById(r.candidate);
              if (c && c.team) {
                  await Team.updateOne({ _id: c.team }, { $inc: { totalPoints: pts } });
              }
          }
      }
      
      console.log('Recalculation complete!');
      process.exit(0);
  })
  .catch(err => console.error(err));
