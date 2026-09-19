const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const uri = "mongodb+srv://admin:hudafestadmin123@cluster0.zb2c00b.mongodb.net/hudafestival?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  await User.updateOne({ userName: 'judge_admin' }, { $set: { password: hashedPassword, role: 'judge' }});
  await User.updateOne({ userName: 'volunteer_admin' }, { $set: { password: hashedPassword, role: 'volunteer' }});
  
  console.log("Passwords hashed properly.");
  process.exit(0);
}
run();
