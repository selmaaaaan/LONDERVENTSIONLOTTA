require('dotenv').config();
const mongoose = require('mongoose');

async function getTeamLeader() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const user = await User.findOne({ role: 'team_leader' });
  console.log(user.userName);
  process.exit(0);
}
getTeamLeader().catch(console.error);
