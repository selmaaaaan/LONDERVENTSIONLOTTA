const express = require('express');
const router = express.Router({ mergeParams: true });
const { 
    savePendingResults, 
    savePendingResultsBulk,
    getProgrammeResults,
    approvePendingResults,
    updateResult
} = require('../controllers/resultController.js');
const { protect } = require('../middlewares/authMiddleware.js');
const { authorize } = require('../middlewares/authMiddleware.js');

const certificateRouter = require('./certificateRoutes.js');

// This route now correctly handles GET, POST, and DELETE for a programme's results
router.route('/')
    .get(protect, getProgrammeResults)
    .post(protect, authorize('admin', 'judge'), savePendingResults)

router.post('/bulk', protect, authorize('admin', 'judge'), savePendingResultsBulk);

router.patch('/:resultId', protect, authorize('admin', 'judge'), updateResult);

// Nested route for certificates remains the same
router.use('/:id/certificate', certificateRouter);

module.exports = router;


