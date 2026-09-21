const express = require('express');
const router = express.Router();
const {
    submitTopic,
    getTopicsForProgramme,
    getMyTopicSubmissions,
    getPendingTopics,
    getAllTopics,
    reviewTopic,
    updateTopic,
    deleteTopic,
    getTopicEnabledProgrammes
} = require('../controllers/topicRegistrationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/enabled-programmes', protect, getTopicEnabledProgrammes);
router.get('/my-submissions', protect, getMyTopicSubmissions);
router.get('/pending', protect, authorize('admin'), getPendingTopics);
router.get('/programme/:programmeId', protect, getTopicsForProgramme);
router.get('/', protect, authorize('admin'), getAllTopics);

const attachmentUpload = require('../config/attachmentCloudinary');
router.post('/upload', protect, attachmentUpload.single('file'), (req, res) => { if(!req.file) return res.status(400).json({message: 'No file'}); res.json({url: req.file.path}); });
router.post('/', protect, submitTopic);
router.patch('/:id/review', protect, authorize('admin'), reviewTopic);
router.patch('/:id', protect, authorize('admin', 'team_leader'), updateTopic);
router.delete('/:id', protect, authorize('admin', 'team_leader'), deleteTopic);

module.exports = router;

