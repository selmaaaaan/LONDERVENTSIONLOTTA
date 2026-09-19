require('dotenv').config();
const mongoose = require('mongoose');
const Registration = require('./models/Registration');
const Programme = require('./models/Programme');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const regs = await Registration.find().populate('programme');
    const grouped = {};
    
    // Group by team_id + programme_id
    regs.forEach(r => {
        if (!r.programme) return;
        const key = `${r.team.toString()}_${r.programme._id.toString()}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(r);
    });

    let deletedCount = 0;
    
    for (const key in grouped) {
        const teamRegs = grouped[key];
        if (teamRegs.length > 1) {
            const prog = teamRegs[0].programme;
            if (prog.format === 'Group' || prog.type === 'Group') {
                // Keep the one with the MOST candidates. Or the newest one.
                // Actually, for a group programme, there should only be ONE registration per team.
                teamRegs.sort((a, b) => b.candidates.length - a.candidates.length);
                const keep = teamRegs[0];
                const toDelete = teamRegs.slice(1);
                for (const reg of toDelete) {
                    // But wait, what if the user intentionally created a second registration because they wanted to add more people?
                    // Group programmes should only have ONE group. I will merge the candidates.
                    const newCandidates = new Set(keep.candidates.map(id => id.toString()));
                    reg.candidates.forEach(id => newCandidates.add(id.toString()));
                    
                    keep.candidates = Array.from(newCandidates);
                    await keep.save();
                    
                    console.log(`Deleting duplicate registration ${reg._id} for Team ${reg.team}, merged into ${keep._id}`);
                    await Registration.deleteOne({ _id: reg._id });
                    deletedCount++;
                }
            } else {
                // For Individual programmes, a team CAN have multiple registrations IF they are separate candidates!
                // Wait, our new database schema (`candidates: [ObjectId]`) means one registration per programme per team!!
                // Yes, the new model uses `candidates: [ObjectId]` instead of one candidate per registration.
                // So ANY programme should only have ONE registration per team.
                
                teamRegs.sort((a, b) => b.candidates.length - a.candidates.length);
                const keep = teamRegs[0];
                const toDelete = teamRegs.slice(1);
                for (const reg of toDelete) {
                    const newCandidates = new Set(keep.candidates.map(id => id.toString()));
                    reg.candidates.forEach(id => newCandidates.add(id.toString()));
                    
                    keep.candidates = Array.from(newCandidates);
                    await keep.save();
                    
                    console.log(`Deleting duplicate registration ${reg._id} for Team ${reg.team}, merged into ${keep._id}`);
                    await Registration.deleteOne({ _id: reg._id });
                    deletedCount++;
                }
            }
        }
    }
    
    console.log(`Deleted ${deletedCount} duplicate registrations and merged their candidates.`);
    process.exit(0);
});