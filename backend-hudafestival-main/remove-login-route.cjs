const fs = require('fs');

let content = fs.readFileSync('routes/resultEntryRoutes.js', 'utf8');

const target = `// @desc    Result Entry Portal Login
// @route   POST /api/result-entry/login
router.post('/login', async (req, res) => {
    const { userName, password } = req.body;
    try {
        const user = await User.findOne({ userName });
        
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        
        if (user.role !== 'result_entry') {
            return res.status(403).json({ message: 'Access denied. You are not a result-entry user.' });
        }

        res.json({
            _id: user._id,
            userName: user.userName,
            role: user.role,
            team: user.team,
            token: generateToken(user._id, user.role),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});`;

content = content.replace(target, '');
fs.writeFileSync('routes/resultEntryRoutes.js', content);
