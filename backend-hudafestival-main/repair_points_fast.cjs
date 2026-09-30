require('dotenv').config();
const mongoose = require('mongoose');

async function repair() {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    
    console.log("Starting points repair (FAST)...");

    await db.collection('candidates').updateMany({}, { $set: { totalPoints: 0 } });
    await db.collection('teams').updateMany({}, { $set: { totalPoints: 0 } });

    const results = await db.collection('results').find({ status: 'approved' }).toArray();
    console.log(`Found ${results.length} approved results.`);

    const candidates = await db.collection('candidates').find({}).toArray();
    const candMap = new Map();
    candidates.forEach(c => candMap.set(c._id.toString(), c));

    const candPoints = {};
    const teamPoints = {};

    for (const r of results) {
        if (!r.candidate) continue;
        
        const pts = r.totalPoints || 0;
        if (pts === 0) continue;

        candPoints[r.candidate.toString()] = (candPoints[r.candidate.toString()] || 0) + pts;

        const cand = candMap.get(r.candidate.toString());
        if (cand && cand.team) {
            teamPoints[cand.team.toString()] = (teamPoints[cand.team.toString()] || 0) + pts;
        }
    }

    // Bulk write for candidates
    const candOps = Object.keys(candPoints).map(cId => ({
        updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(cId) },
            update: { $set: { totalPoints: candPoints[cId] } }
        }
    }));
    if (candOps.length > 0) {
        await db.collection('candidates').bulkWrite(candOps);
        console.log(`Updated ${candOps.length} candidates with positive points.`);
    }

    // Bulk write for teams
    const teamOps = Object.keys(teamPoints).map(tId => ({
        updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(tId) },
            update: { $set: { totalPoints: teamPoints[tId] } }
        }
    }));
    if (teamOps.length > 0) {
        await db.collection('teams').bulkWrite(teamOps);
        console.log(`Updated ${teamOps.length} teams with positive points.`);
    }

    // Check minusPoints
    const candsWithMinus = await db.collection('candidates').find({ minusPoints: { $gt: 0 } }).toArray();
    for (const c of candsWithMinus) {
        await db.collection('candidates').updateOne({ _id: c._id }, { $inc: { totalPoints: -(c.minusPoints) } });
    }

    const teamsWithMinus = await db.collection('teams').find({ minusPoints: { $gt: 0 } }).toArray();
    for (const t of teamsWithMinus) {
        await db.collection('teams').updateOne({ _id: t._id }, { $inc: { totalPoints: -(t.minusPoints) } });
    }

    console.log("Repair complete!");
    process.exit(0);
}

repair().catch(console.error);
