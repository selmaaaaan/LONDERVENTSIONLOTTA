const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('./models/User');

    const newPassword = 'Scorer@883!Secure';

    let user = await User.findOne({ userName: 'scorer1' });
    if (user) {
        user.password = newPassword;
        await user.save();
        
        // Fetch it fresh, excluding the password field for display
        const displayUser = await User.findById(user._id).select('-password').lean();
        console.log("=== SCORER1 DOCUMENT ===");
        console.log(JSON.stringify(displayUser, null, 2));
        console.log("========================");
        console.log(`New Password set to: ${newPassword}`);
    } else {
        console.log("User not found!");
    }

    process.exit(0);
}
run();
