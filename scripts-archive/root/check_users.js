const mongoose = require('mongoose');
const User = require('./backend-hudafestival-main/models/User');

const uri = "mongodb+srv://admin:hudafestadmin123@cluster0.zb2c00b.mongodb.net/hudafestival?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  const judges = await User.find({ role: 'judge' }, 'userName role');
  const volunteers = await User.find({ role: 'volunteer' }, 'userName role');
  console.log("Judges:", judges);
  console.log("Volunteers:", volunteers);
  process.exit(0);
}
run();
