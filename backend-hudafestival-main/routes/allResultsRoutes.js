const express = require('express');
const router = express.Router();
const Result = require('../models/Result.js'); // Import the Result model
const { protect } = require('../middlewares/authMiddleware.js');

// @desc    Get all result documents
// @route   GET /api/results
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
    try {
        if (req.query.page || req.query.limit) {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 25;
            const skip = (page - 1) * limit;
            const [data, totalCount] = await Promise.all([
                Result.find({}).skip(skip).limit(limit),
                Result.countDocuments({})
            ]);
            return res.json({ data, totalCount, totalPages: Math.ceil(totalCount / limit), currentPage: page });
        }
        const results = await Result.find({});
        res.json(results);
    } catch (error) {
        console.error("Error fetching all results:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

const { publishBatch, revertBatch, getJudgmentFeedback } = require('../controllers/resultController');

// @desc    Get all results including remarks
// @route   GET /api/results/judgment-feedback
// @access  Private/Admin
const { authorize } = require('../middlewares/authMiddleware.js');
router.get('/judgment-feedback', protect, authorize('admin'), getJudgmentFeedback);

// @desc    Get all published results
// @route   GET /api/results/published
// @access  Public
router.get('/published', async (req, res) => {
    try {
        if (req.query.page || req.query.limit) {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 25;
            const skip = (page - 1) * limit;
            const [data, totalCount] = await Promise.all([
                Result.find({ status: 'approved' }).populate('programme').populate({ path: 'candidate', populate: { path: 'team' } }).skip(skip).limit(limit),
                Result.countDocuments({ status: 'approved' })
            ]);
            return res.json({ data, totalCount, totalPages: Math.ceil(totalCount / limit), currentPage: page });
        }
        const results = await Result.find({ status: 'approved' })
            .populate('programme')
            .populate({
                path: 'candidate',
                populate: { path: 'team' }
            });
        res.json(results);
    } catch (error) {
        console.error("Error fetching published results:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Publish a batch of results
// @route   POST /api/results/batch-publish
// @access  Private/Admin
router.post('/batch-publish', protect, authorize('admin'), publishBatch);
// @desc    Revert a published batch of results
// @route   POST /api/results/batch-revert
// @access  Private/Admin
router.post('/batch-revert', protect, authorize('admin'), revertBatch);


// @desc    Get current judge's submitted results
// @route   GET /api/results/my-submissions
// @access  Private/Judge
router.get('/my-submissions', protect, async (req, res) => {
    try {
        if (req.query.page || req.query.limit) {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 25;
            const skip = (page - 1) * limit;
            const [data, totalCount] = await Promise.all([
                Result.find({ submittedBy: req.user._id }).populate('programme', 'name code').populate({ path: 'candidate', populate: { path: 'team', select: 'name' } }).sort({ updatedAt: -1 }).skip(skip).limit(limit),
                Result.countDocuments({ submittedBy: req.user._id })
            ]);
            return res.json({ data, totalCount, totalPages: Math.ceil(totalCount / limit), currentPage: page });
        }
        const results = await Result.find({ submittedBy: req.user._id })
            .populate('programme', 'name code')
            .populate({
                path: 'candidate',
                populate: { path: 'team', select: 'name' }
            })
            .sort({ updatedAt: -1 });
        res.json(results);
    } catch (error) {
        console.error("Error fetching my submissions:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Delete a batch of pending results
// @route   DELETE /api/results/batch/:batchId
// @access  Private/Admin
router.delete('/batch/:batchId', protect, authorize('admin'), async (req, res) => {
    try {
        await Result.updateMany({ batchId: req.params.batchId, status: 'pending' }, { $set: { status: 'draft' } });
        try {
            const mongoose = require('mongoose');
            if (mongoose.models.Batch) {
                await mongoose.models.Batch.updateOne({ _id: req.params.batchId }, { $set: { status: 'draft' } });
            }
        } catch (err) {}
        res.json({ message: 'Batch rejected and returned to draft status' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Delete a single result
// @route   DELETE /api/results/:id
// @access  Private/Admin
const { deleteResult } = require('../controllers/resultController.js');
router.delete('/:id', protect, authorize('admin'), deleteResult);

module.exports = router;

