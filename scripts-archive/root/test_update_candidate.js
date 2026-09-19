const mongoose = require('mongoose');
const Candidate = require('./backend-hudafestival-main/models/Candidate');
require('dotenv').config({ path: './backend-hudafestival-main/.env' });

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    try {
        const c = await Candidate.findOne();
        if(!c) { console.log("No candidates found"); return; }
        console.log("Candidate found:", c.name, "ID:", c._id);
        
        c.name = c.name + " Test";
        await c.save();
        console.log("Saved successfully!");
        
        // revert
        c.name = c.name.replace(" Test", "");
        await c.save();
    } catch(err) {
        console.error("Save error:", err);
    }
    mongoose.disconnect();
}
run();