require('dotenv').config();
const mongoose = require('mongoose');

async function repair() {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    
    console.log("Starting points repair...");

    // 1. Reset all candidate and team points to 0 (ignoring minusPoints for now, we'll subtract them later)
    await db.collection('candidates').updateMany({}, { $set: { totalPoints: 0 } });
    await db.collection('teams').updateMany({}, { $set: { totalPoints: 0 } });

    // 2. Fetch all approved results
    const results = await db.collection('results').find({ status: 'approved' }).toArray();
    console.log(`Found ${results.length} approved results.`);

    // 3. Aggregate points
    const candPoints = {};
    const teamPoints = {};

    for (const r of results) {
        if (!r.candidate) continue;
        
        const pts = r.totalPoints || 0;
        if (pts === 0) continue;

        candPoints[r.candidate.toString()] = (candPoints[r.candidate.toString()] || 0) + pts;

        // get team for this candidate
        const cand = await db.collection('candidates').findOne({ _id: r.candidate });
        if (cand && cand.team) {
            teamPoints[cand.team.toString()] = (teamPoints[cand.team.toString()] || 0) + pts;
        }
    }

    // 4. Update candidates
    for (const [cId, pts] of Object.entries(candPoints)) {
        await db.collection('candidates').updateOne(
            { _id: new mongoose.Types.ObjectId(cId) },
            { $set: { totalPoints: pts } }
        );
    }
    
    // Check minusPoints for candidates
    const candsWithMinus = await db.collection('candidates').find({ minusPoints: { $gt: 0 } }).toArray();
    for (const c of candsWithMinus) {
        await db.collection('candidates').updateOne(
            { _id: c._id },
            { $inc: { totalPoints: -(c.minusPoints) } }
        );
        console.log(`Subtracted ${c.minusPoints} from candidate ${c.name}`);
    }

    // 5. Update teams
    for (const [tId, pts] of Object.entries(teamPoints)) {
        await db.collection('teams').updateOne(
            { _id: new mongoose.Types.ObjectId(tId) },
            { $set: { totalPoints: pts } }
        );
    }

    // Check minusPoints for teams
    const teamsWithMinus = await db.collection('teams').find({ minusPoints: { $gt: 0 } }).toArray();
    for (const t of teamsWithMinus) {
        await db.collection('teams').updateOne(
            { _id: t._id },
            { $inc: { totalPoints: -(t.minusPoints) } }
        );
        console.log(`Subtracted ${t.minusPoints} from team ${t.name}`);
    }

    console.log("Repair complete!");
    process.exit(0);
}

repair().catch(console.error);
