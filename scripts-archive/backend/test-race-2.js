require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

async function testRace() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const admin = await User.findOne({ role: 'admin' });
  
  const token = jwt.sign({ id: admin._id, role: admin.role, team: admin.team }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  const teamId = "6a9da92608b6dacb8e7f3673";
  const candId = "6aa67123201564b524946358";
  const progId = "6aa53238b505df4ce11fcf54";
  
  const Registration = mongoose.model('Registration', new mongoose.Schema({}, { strict: false }));

  console.log("Simulating concurrent registration (double click)...");
  
  const reqData = {
    programmeId: progId,
    teamId: teamId,
    candidateIds: [candId]
  };
  
  const headers = { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  const results = await Promise.allSettled([
    fetch('http://localhost:5000/api/registrations', { method: 'POST', headers, body: JSON.stringify(reqData) }).then(r => r.json().then(d => ({ status: r.status, data: d }))),
    fetch('http://localhost:5000/api/registrations', { method: 'POST', headers, body: JSON.stringify(reqData) }).then(r => r.json().then(d => ({ status: r.status, data: d })))
  ]);
  
  results.forEach((res, i) => {
    if (res.status === 'fulfilled' && res.value.status === 201) {
      console.log(`Req ${i+1}: Success, Status ${res.value.status}`);
    } else if (res.status === 'fulfilled') {
      console.log(`Req ${i+1}: Failed, Status ${res.value.status}, Error: ${res.value.data.message || JSON.stringify(res.value.data)}`);
    } else {
      console.log(`Req ${i+1}: Failed unexpectedly, Error: ${res.reason}`);
    }
  });
  
  const count = await Registration.countDocuments({ candidates: new mongoose.Types.ObjectId(candId), programme: new mongoose.Types.ObjectId(progId) });
  console.log(`Final Database Registration Count for cand: ${count}`);
  
  process.exit(0);
}
testRace().catch(console.error);
