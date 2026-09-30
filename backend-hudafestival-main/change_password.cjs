require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function changePassword() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ role: 'result_entry' });
        
        if (!user) {
            console.log("Result Entry user not found!");
            // Try to create it if it doesn't exist
            const newUser = new User({
                userName: 'resultentry',
                password: 'hudafest123',
                role: 'result_entry'
            });
            await newUser.save();
            console.log("Created result_entry user with new password.");
        } else {
            user.password = 'hudafest123';
            await user.save();
            console.log("Successfully updated password for: " + user.userName);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

changePassword();
