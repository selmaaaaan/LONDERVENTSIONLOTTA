require('dotenv').config();
const mongoose = require('mongoose');
const Registration = require('./models/Registration');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const regs = await Registration.find().lean();
    console.log(`Found ${regs.length} registrations total.`);
    const grouped = {};
    regs.forEach(r => {
        if (!r.programme) return;
        const key = r.team.toString() + '_' + r.programme.toString();
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(r);
    });

    const toDeleteIds = [];
    const updates = [];
    
    for (const key in grouped) {
        const list = grouped[key];
        if (list.length > 1) {
            // Sort by number of candidates (descending)
            list.sort((a, b) => (b.candidates?.length || 0) - (a.candidates?.length || 0));
            const keep = list[0];
            const toDel = list.slice(1);
            
            // Merge candidate sets
            const cSet = new Set(keep.candidates.map(c => c.toString()));
            toDel.forEach(reg => {
                if(reg.candidates) reg.candidates.forEach(c => cSet.add(c.toString()));
                toDeleteIds.push(reg._id);
            });
            
            updates.push({
                updateOne: {
                    filter: { _id: keep._id },
                    update: { $set: { candidates: Array.from(cSet) } }
                }
            });
        }
    }
    
    console.log(`Found ${toDeleteIds.length} duplicate registrations to delete.`);
    if (toDeleteIds.length > 0) {
        await Registration.deleteMany({ _id: { $in: toDeleteIds } });
        console.log(`Deleted ${toDeleteIds.length} duplicate registrations.`);
    }
    if (updates.length > 0) {
        await Registration.bulkWrite(updates);
        console.log(`Merged candidates for ${updates.length} kept registrations.`);
    }
    
    // Now enforce maxParticipants
    const allRegs = await Registration.find().populate('programme');
    let trimmed = 0;
    for (const r of allRegs) {
        if (!r.programme) continue;
        const max = r.programme.maxParticipants || Infinity;
        if (r.candidates && r.candidates.length > max) {
            r.candidates = r.candidates.slice(0, max);
            await r.save();
            trimmed++;
        }
    }
    console.log(`Trimmed candidates arrays for ${trimmed} registrations that exceeded maxParticipants.`);
    
    process.exit(0);
});