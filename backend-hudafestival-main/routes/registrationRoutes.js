const express = require('express');
const router = express.Router();
const {
  protect, authorize } = require('../middlewares/authMiddleware');
const {
  getParticipantReport, createRegistration, getRegistrations, approveRegistration,
  rejectRegistration, updateRegistration, deleteRegistration
} = require('../controllers/registrationController');

router.get('/report/participant-list', protect, authorize('admin'), getParticipantReport);

router.route('/')
  .post(protect, createRegistration)
  .get(protect, getRegistrations);

router.route('/:id')
  .patch(protect, authorize('admin', 'team_leader'), updateRegistration)
  .delete(protect, authorize('admin', 'team_leader'), deleteRegistration);

router.patch('/:id/approve', protect, authorize('admin', 'judge'), approveRegistration);
router.patch('/:id/reject', protect, authorize('admin', 'judge'), rejectRegistration);

module.exports = router;
