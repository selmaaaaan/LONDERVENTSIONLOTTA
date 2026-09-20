const Team = require('./models/Team');
const Programme = require('./models/Programme');
const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
const Result = require('./models/Result');

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const candidates = await Candidate.find({ name: /RAZAN/i }).populate('team');
    console.log("Candidates found:", candidates.length);
    for (const c of candidates) {
        console.log(`Candidate: ${c.name}, Category: ${c.category}, Team: ${c.team?.name}, TotalPoints: ${c.totalPoints}`);
        const results = await Result.find({ candidate: c._id }).populate('programme');
        console.log(`  Results count: ${results.length}`);
        for (const r of results) {
            console.log(`    Programme: ${r.programme?.name}, Status: ${r.status}, Rank: ${r.rank}, Grade: ${r.grade}, TotalPoints: ${r.totalPoints}`);
        }
    }
    process.exit(0);
  })
  .catch(err => console.error(err));

