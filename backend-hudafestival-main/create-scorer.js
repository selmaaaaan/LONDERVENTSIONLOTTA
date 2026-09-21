const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('./models/User');

    // Create a generic result_entry user
    let user = await User.findOne({ userName: 'scorer1' });
    if (!user) {
        user = await User.create({
            userName: 'scorer1',
            name: 'Result Scorer (Test)',
            password: 'password123',
            role: 'result_entry',
            team: null // No team
        });
        console.log("Created new user: scorer1");
    } else {
        user.password = 'password123'; // Make sure the hash matches what we promise
        await user.save();
        console.log("Updated existing user: scorer1");
    }

    process.exit(0);
}
run();
