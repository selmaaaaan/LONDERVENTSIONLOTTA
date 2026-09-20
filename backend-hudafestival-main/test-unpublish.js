const mongoose = require('mongoose');
const Programme = require('./models/Programme');
const Candidate = require('./models/Candidate');
const Team = require('./models/Team');
const Result = require('./models/Result');

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const p = await Programme.findOne();
    const c = await Candidate.findOne();
    const t = await Team.findOne();
    
    // Create a result and approve it
    let result = new Result({
        programme: p._id,
        candidate: c._id,
        rank: 1,
        grade: 'A',
        status: 'approved',
        pointsFromRank: 5,
        pointsFromGrade: 5,
        totalPoints: 10
    });
    await result.save();
    
    // Add points to candidate and team
    c.totalPoints = 10;
    c.team = t._id;
    await c.save();
    
    t.totalPoints = 10;
    await t.save();
    
    console.log("Mock data created. Now unpublishing...");
    
    // Simulate unpublish
    const { unpublishResults } = require('./controllers/resultController');
    const req = { params: { id: p._id.toString() }, user: { _id: c._id, role: 'admin' } };
    const res = {
        status: (s) => ({
            json: (msg) => console.log(`Unpublish response: ${s}`, msg)
        })
    };
    
    p.isResultPublished = true;
    await p.save();
    
    await unpublishResults(req, res);
    
    const cAfter = await Candidate.findById(c._id);
    console.log("Candidate points after unpublish:", cAfter.totalPoints);
    
    process.exit(0);
  })
  .catch(err => console.error(err));
