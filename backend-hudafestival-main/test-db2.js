const Team = require('./models/Team');
const Programme = require('./models/Programme');
const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
const Result = require('./models/Result');

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const candidates = await Candidate.find({ totalPoints: { $gt: 0 } }).populate('team');
    console.log("Candidates with points > 0:", candidates.length);
    for (const c of candidates) {
        console.log(`Candidate: ${c.name}, TotalPoints: ${c.totalPoints}`);
        const results = await Result.find({ candidate: c._id }).populate('programme');
        console.log(`  Results count: ${results.length}`);
        let sum = 0;
        for (const r of results) {
            console.log(`    Programme: ${r.programme?.name}, Status: ${r.status}, TotalPoints: ${r.totalPoints}`);
            if (r.status === 'approved') sum += r.totalPoints;
        }
        console.log(`  Sum of approved result points: ${sum}`);
    }
    process.exit(0);
  })
  .catch(err => console.error(err));

