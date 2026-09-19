const mongoose = require('mongoose');
const User = require('./models/User');

const uri = "mongodb+srv://admin:hudafestadmin123@cluster0.zb2c00b.mongodb.net/hudafestival?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  const user = await User.findOne({ userName: 'judge_admin' });
  console.log(user);
  process.exit(0);
}
run();
