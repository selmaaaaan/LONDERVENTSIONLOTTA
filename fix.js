
const fs = require("fs");
let c = fs.readFileSync("backend-hudafestival-main/controllers/resultController.js", "utf8");
c = c.split("Candidate.updateOne({ _id: result.candidate }, { $inc: { totalPoints: totalPoints } })").join("Candidate.updateOne({ _id: result.candidate }, { $inc: { totalPoints: totalPoints } }, { isSystemScoreUpdate: true })");
c = c.split("Team.updateOne({ _id: candidate.team }, { $inc: { totalPoints: totalPoints } })").join("Team.updateOne({ _id: candidate.team }, { $inc: { totalPoints: totalPoints } }, { isSystemScoreUpdate: true })");
c = c.split("Candidate.updateOne({ _id: result.candidate }, { $inc: { totalPoints: -pointsToRevert } })").join("Candidate.updateOne({ _id: result.candidate }, { $inc: { totalPoints: -pointsToRevert } }, { isSystemScoreUpdate: true })");
c = c.split("Team.updateOne({ _id: candidate.team }, { $inc: { totalPoints: -pointsToRevert } })").join("Team.updateOne({ _id: candidate.team }, { $inc: { totalPoints: -pointsToRevert } }, { isSystemScoreUpdate: true })");
fs.writeFileSync("backend-hudafestival-main/controllers/resultController.js", c);

