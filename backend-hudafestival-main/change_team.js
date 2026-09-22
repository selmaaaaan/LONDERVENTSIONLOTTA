require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);
const Candidate = require('./models/Candidate');
const Team = require('./models/Team');
const Registration = require('./models/Registration');
const Programme = require('./models/Programme');

async function run() {
    try {
        const cand = await Candidate.findOne({ name: /MUHAMMED ABDUL SALEEM K/i });
        const newTeam = await Team.findOne({ name: /TIANANMEN/i });
        
        if (!cand || !newTeam) {
            console.log('Candidate or Team not found');
            return;
        }
        
        // 1. Update Candidate
        await Candidate.updateOne({ _id: cand._id }, { team: newTeam._id });
        console.log('Updated Candidate Team to', newTeam.name);
        
        // 2. Update Registrations
        const regs = await Registration.find({ candidates: cand._id }).populate('programme');
        for (const r of regs) {
            if (r.programme.format === 'Individual') {
                await Registration.updateOne({ _id: r._id }, { team: newTeam._id });
                console.log('Updated Team for Individual Reg:', r.programme.name);
            } else {
                // Group item
                await Registration.updateOne({ _id: r._id }, { $pull: { candidates: cand._id } });
                console.log('Removed from Group Reg:', r.programme.name);
            }
        }
        
        console.log('Done!');
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
run();
