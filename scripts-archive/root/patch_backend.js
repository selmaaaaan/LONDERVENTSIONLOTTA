const fs = require('fs');

// 1. Add resetPassword to authController.js
let authC = fs.readFileSync('backend-hudafestival-main/controllers/authController.js', 'utf8');

const resetPasswordFn = `
const resetPassword = async (req, res) => {
    try {
        const { userName, newPassword } = req.body;
        if (!userName || !newPassword) return res.status(400).json({ message: 'Username and new password required' });
        
        const user = await User.findOne({ userName });
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.password = newPassword;
        await user.save();
        
        await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'UPDATE', entityType: 'User', entityId: user._id, details: { action: 'password_reset', targetUser: userName }, req });
        
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password: ' + error.message);
        res.status(500).json({ message: 'Failed to reset password', error: error.message });
    }
};
`;

authC = authC.replace('module.exports = {', resetPasswordFn + '\nmodule.exports = {\n    resetPassword,');
fs.writeFileSync('backend-hudafestival-main/controllers/authController.js', authC);

// 2. Add route to authRoutes.js
let authR = fs.readFileSync('backend-hudafestival-main/routes/authRoutes.js', 'utf8');
authR = authR.replace('deleteTeamLeader\n} = require(', 'deleteTeamLeader,\n    resetPassword\n} = require(');
authR = authR + "\nrouter.patch('/reset-password', protect, authorize('admin'), resetPassword);\n";
fs.writeFileSync('backend-hudafestival-main/routes/authRoutes.js', authR);

console.log("Backend reset-password route added.");
