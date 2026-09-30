require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    
    // Check for candidates with team names
    const cands = await db.collection('candidates').find({
        name: { $in: ['Tahrir', 'Bastille', 'Tiananmen', 'Syntagma', 'TAHRIR', 'BASTILLE', 'TIANANMEN', 'SYNTAGMA', 'tahrir', 'bastille'] }
    }).toArray();
    console.log("Dummy Candidates:", cands);

    // Also let's check a few top candidates to see their points
    const topCands = await db.collection('candidates').find({}).sort({ totalPoints: -1 }).limit(5).toArray();
    console.log("Top Candidates:", topCands.map(c => ({ name: c.name, points: c.totalPoints, class: c.classLevel })));

    // Let's check team points
    const teams = await db.collection('teams').find({}).toArray();
    console.log("Teams:", teams.map(t => ({ name: t.name, points: t.totalPoints })));

    process.exit(0);
}
run();
