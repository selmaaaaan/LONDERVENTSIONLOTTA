const mongoose = require('mongoose');
const Result = require('./models/Result');
const Team = require('./models/Team');
const Candidate = require('./models/Candidate');

mongoose.connect('mongodb+srv://admin:hudafestadmin123@cluster0.zb2c00b.mongodb.net/hudafestival?retryWrites=true&w=majority&appName=Cluster0')
  .then(async () => {
    const approvedCount = await Result.countDocuments({ status: 'approved' });
    console.log('Total approved results: ' + approvedCount);
    
    const teams = await Team.find();
    let teamsReset = 0;
    for(let t of teams) {
       console.log('Team: ' + t.name + ', current points: ' + t.totalPoints);
       if (approvedCount === 0 && t.totalPoints !== 0) {
           t.totalPoints = 0;
           await t.save();
           teamsReset++;
       }
    }
    console.log('Teams reset: ' + teamsReset);
    
    const candidates = await Candidate.find({ totalPoints: { $ne: 0 } });
    let candidatesReset = 0;
    if (approvedCount === 0) {
        for(let c of candidates) {
           c.totalPoints = 0;
           await c.save();
           candidatesReset++;
        }
    }
    console.log('Candidates reset: ' + candidatesReset);
    process.exit(0);
  });
