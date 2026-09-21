const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('./models/User');

    console.log("--- 1. FETCHING CURRENT SCORER1 ---");
    // Find regardless of exact case
    let user = await User.findOne({ userName: { $regex: new RegExp("^scorer1$", "i") } });
    if (!user) {
        console.log("Could not find any user matching scorer1");
        process.exit(1);
    }
    
    console.log("User Document Found:");
    console.log(`userName exact case: "${user.userName}"`);
    console.log(`role: "${user.role}"`);
    console.log(`team: ${user.team}`);
    console.log(`Current password hash: ${user.password}`);

    console.log("\n--- 2. RESETTING PASSWORD ---");
    const plainTextPassword = "Scorer1#SecurePass";
    
    // The previous script used user.save(). Let's force it again.
    user.password = plainTextPassword;
    await user.save();
    console.log("Saved user with new password using Mongoose pre-save hook.");

    // Fetch again to confirm
    const updatedUser = await User.findById(user._id);
    console.log(`New password hash: ${updatedUser.password}`);

    console.log("\n--- 3 & 4. DIRECT API TEST ---");
    try {
        const response = await fetch('http://localhost:5000/api/result-entry/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName: updatedUser.userName, password: plainTextPassword })
        });
        
        const data = await response.json();
        console.log(`HTTP Status: ${response.status}`);
        console.log(`API Response:`, data);
    } catch (error) {
        console.error("API Call Failed:", error);
    }

    process.exit(0);
}
run();
