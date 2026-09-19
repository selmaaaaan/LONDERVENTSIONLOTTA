require('dotenv').config();
const mongoose = require('mongoose');

async function fixDuplicates() {
  await mongoose.connect(process.env.MONGO_URI);
  const Registration = mongoose.model('Registration', new mongoose.Schema({}, { strict: false }));
  
  const duplicates = await Registration.aggregate([
    {
      $group: {
        _id: { team: "$team", programme: "$programme", candidates: "$candidates" },
        count: { $sum: 1 },
        ids: { $push: "$_id" }
      }
    },
    {
      $match: {
        count: { $gt: 1 }
      }
    }
  ]);

  for (const dup of duplicates) {
    // Keep the first one, delete the rest
    const idsToDelete = dup.ids.slice(1);
    for (const id of idsToDelete) {
      await Registration.findByIdAndDelete(id);
      console.log("Deleted duplicate:", id);
    }
  }
  
  console.log("Done.");
  process.exit(0);
}

fixDuplicates().catch(console.error);
