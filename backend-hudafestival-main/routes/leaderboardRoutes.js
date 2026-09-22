const express = require('express');
const router = express.Router();
const { getLeaderboards, getTeamBreakdown, getCandidateBreakdown } = require('../controllers/leaderboardController');

router.route('/').get(getLeaderboards);
router.route('/breakdown/team/:teamId').get(getTeamBreakdown);
router.route('/breakdown/candidate/:candidateId').get(getCandidateBreakdown);

module.exports = router;
