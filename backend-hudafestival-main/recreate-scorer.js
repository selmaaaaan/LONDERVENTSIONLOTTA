const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('./models/User');

    console.log("--- 1. DELETING USER ---");
    await User.deleteMany({ userName: /scorer1/i });
    console.log("Deleted old scorer1 user");

    console.log("\n--- 2. RECREATING USER VIA User.create() ---");
    // This is the exact code path used by registerAdmin in authController.js
    const user = await User.create({
        userName: 'scorer1',
        password: 'Scorer1#SecurePass',
        role: 'result_entry'
    });
    console.log(`Created user ${user.userName} with ID ${user._id}`);

    console.log("\n--- 3. TESTING API DIRECTLY ---");
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName: 'scorer1', password: 'Scorer1#SecurePass' })
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
