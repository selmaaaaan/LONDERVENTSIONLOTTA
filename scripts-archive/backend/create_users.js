const mongoose = require('mongoose');
const User = require('./models/User');

const uri = "mongodb+srv://admin:hudafestadmin123@cluster0.zb2c00b.mongodb.net/hudafestival?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  
  // Create or Update judge_admin
  const judge = await User.findOneAndUpdate(
    { userName: 'judge_admin' },
    { userName: 'judge_admin', password: 'password123', role: 'judge' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  
  // Since we have a pre('save') hook for hashing, findOneAndUpdate won't trigger it by default unless configured,
  // or it's better to use document.save(). Let's do that properly.
  
  let j = await User.findOne({ userName: 'judge_admin' });
  if (!j) j = new User({ userName: 'judge_admin', role: 'judge' });
  j.password = 'password123';
  await j.save();
  
  let v = await User.findOne({ userName: 'volunteer_admin' });
  if (!v) v = new User({ userName: 'volunteer_admin', role: 'volunteer' });
  v.password = 'password123';
  await v.save();
  
  console.log("Created/Updated:");
  console.log("Judge:", j.userName, "password123");
  console.log("Volunteer:", v.userName, "password123");
  
  process.exit(0);
}
run();
