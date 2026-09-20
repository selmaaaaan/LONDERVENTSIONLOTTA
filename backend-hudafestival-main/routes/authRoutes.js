const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    loginAdmin,
    registerAdmin,
    teamLeaderLogin,
    createTeamLeader,
    getAllTeamLeaders,
    updateUser,
    deleteUser,
    resetPassword
} = require('../controllers/authController')

const { protect, authorize } = require('../middlewares/authMiddleware');

const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
});

router.post('/login', loginLimiter, loginAdmin);
router.post('/team-leader/login', loginLimiter, teamLeaderLogin);
router.post('/signup', protect, authorize('admin'), registerAdmin);
router.post('/register', protect, authorize('admin'), registerAdmin);
router.post('/create-team-leader', protect, authorize('admin'), createTeamLeader);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/team-leaders', protect, authorize('admin'), getAllTeamLeaders);
router.route('/users/:id')
    .put(protect, authorize('admin'), updateUser)
    .delete(protect, authorize('admin'), deleteUser);

module.exports = router;
router.patch('/reset-password', protect, authorize('admin'), resetPassword);




