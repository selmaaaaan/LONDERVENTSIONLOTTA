require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

async function checkUsers() {
    await connectDB();
    const users = await User.find({}, 'userName role');
    console.log("Existing Users:", users);
    
    // Let's force-create or update a known judge and volunteer
    const defaultJudge = await User.findOneAndUpdate(
        { userName: 'judge1' },
        { role: 'judge', password: 'password123', name: 'Main Judge' },
        { upsert: true, new: true }
    );
    console.log("Reset/Created Judge: judge1 / password123");

    const defaultVolunteer = await User.findOneAndUpdate(
        { userName: 'volunteer1' },
        { role: 'volunteer', password: 'password123', name: 'Main Volunteer' },
        { upsert: true, new: true }
    );
    console.log("Reset/Created Volunteer: volunteer1 / password123");
    
    // We also must make sure they are properly saved so the pre-save hook hashes the password!
    // findOneAndUpdate bypasses pre-save hooks! Let's do a proper save.
    
    const j = await User.findOne({ userName: 'judge1' });
    j.password = 'password123';
    await j.save();
    
    const v = await User.findOne({ userName: 'volunteer1' });
    v.password = 'password123';
    await v.save();
    
    process.exit();
}
checkUsers();
