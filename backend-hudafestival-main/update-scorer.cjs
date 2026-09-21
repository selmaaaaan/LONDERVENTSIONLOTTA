const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = require('./models/User');

        console.log("Cleaning up and updating result_entry accounts...");
        const resultUsers = await User.find({ role: 'result_entry' });

        let targetUser = resultUsers.find(u => u.userName === 'scorer1' || u.userName === 'resultmanager');
        
        // If multiple exist, keep targetUser, delete the rest
        for (const u of resultUsers) {
            if (targetUser && u._id.toString() !== targetUser._id.toString()) {
                await User.deleteOne({ _id: u._id });
                console.log(`Deleted extra result_entry user: ${u.userName}`);
            }
        }

        if (!targetUser) {
            console.log("No existing user found. Creating new resultmanager...");
            targetUser = new User({
                userName: 'resultmanager',
                password: 'shiafest@result',
                role: 'result_entry'
            });
        } else {
            console.log(`Found existing user: ${targetUser.userName}. Updating to resultmanager...`);
            targetUser.userName = 'resultmanager';
            targetUser.password = 'shiafest@result'; // pre-save hook will hash this
        }

        await targetUser.save();
        console.log("User updated and saved successfully! Pre-save bcrypt hook triggered.\n");

        // Now test login against the running API
        console.log("Testing POST /api/auth/login...");
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName: 'resultmanager', password: 'shiafest@result' })
        });

        const data = await response.json();
        console.log(`\nHTTP Status Code: ${response.status}`);
        console.log("Response Body:");
        console.log(JSON.stringify(data, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
