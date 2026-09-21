const User = require('../models/User');
const { logAction } = require('../utils/logAction');
const generateToken = require('../utils/generateToken')

// @desc Setup admin
// @route POST /api/auth/signup
// @access Private/Admin 
const registerAdmin = async (req, res) => {
    const { userName, password, role, team } = req.body;
    if (!userName || !password) {
        return res.status(400).json({ message: 'Please provide every details'})
    }
    try {
        const userExist = await User.findOne({ userName })
        if (userExist) {
            return res.status(400).json({ message: 'User already exist'})
        }

        const user = await User.create({
            userName,
            password,
            role: role || 'admin',
            team: team || undefined
        })
        if (user) {
            res.status(201).json({
                _id: user._id,
                userName: user.userName,
                role: user.role,
                token: generateToken(user._id, user.role),
            })
        } else {
            res.status(400).json({ message: 'Invalid user data'});
        }
    }
    catch (error) {
        console.error(`Error while registering admin ${error.message}`);
        res.status(500).json({ message: 'Failed to registerAdmin', error: error.message || 'Unknown error' })
    }
}

// @desc Create team leader
// @route POST /api/auth/create-team-leader
// @access Private/Admin
const createTeamLeader = async (req, res) => {
    const { userName, password, team } = req.body;
    if (!userName || !password || !team) {
        return res.status(400).json({ message: 'Please provide userName, password, and team' });
    }
    try {
        const userExist = await User.findOne({ userName });
        if (userExist) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            userName,
            password,
            role: 'team_leader',
            team
        });

        res.status(201).json({
            _id: user._id,
            userName: user.userName,
            role: user.role,
            team: user.team
        });
    } catch (error) {
        console.error(`Error while creating team leader: ${error.message}`);
        res.status(500).json({ message: 'Failed to createTeamLeader', error: error.message || 'Unknown error' });
    }
}

// @desc Auth user & get token
// @route POST /api/auth/login
// @access Public
const loginAdmin = async (req, res) => {
    const { userName, password } = req.body;
    try {
        const user = await User.findOne({ userName });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                userName: user.userName,
                role: user.role,
                team: user.team,
                token: generateToken(user._id, user.role),
            })
            await logAction({ actor: user._id, actorRole: user.role, action: 'LOGIN', entityType: 'User', entityId: user._id, details: { userName: user.userName }, req });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    }
    catch (error) {
        console.error(`Error while login in admin ${error.message}`);
        res.status(500).json({ message: 'Failed to loginAdmin', error: error.message || 'Unknown error' })
    }
}

const teamLeaderLogin = async (req, res) => {
    const { userName, password } = req.body;
    try {
        const user = await User.findOne({ userName });
        if (user && user.role === 'team_leader' && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                userName: user.userName,
                role: user.role,
                team: user.team,
                token: generateToken(user._id, user.role),
            });
            await logAction({ actor: user._id, actorRole: user.role, action: 'LOGIN', entityType: 'User', entityId: user._id, details: { userName: user.userName }, req });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    }
    catch (error) {
        console.error('Error while login in team leader ' + error.message);
        res.status(500).json({ message: 'Failed to teamLeaderLogin', error: error.message || 'Unknown error' })
    }
}

const getAllTeamLeaders = async (req, res) => {
    try {
        const teamLeaders = await User.find({ role: 'team_leader' })
            .populate('team', 'name color')
            .select('-password');
        res.status(200).json(teamLeaders);
    } catch (error) {
        console.error('Error fetching team leaders: ' + error.message);
        res.status(500).json({ message: 'Failed to getAllTeamLeaders', error: error.message || 'Unknown error' });
    }
}

const updateUser = async (req, res) => {
    try {
        const { userName, password, team, role } = req.body;
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (userName) user.userName = userName;
        if (team !== undefined) user.team = team || null;
        if (role) user.role = role;
        if (password) user.password = password;

        await user.save();
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: 'Username already exists' });
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await User.deleteOne({ _id: user._id });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};




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

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password').populate('team', 'name');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error: error.message || 'Unknown error' });
    }
};
module.exports = { getAllUsers, 
    resetPassword,
    updateUser,
    deleteUser,
    loginAdmin,
    registerAdmin,
    teamLeaderLogin,
    createTeamLeader,
    getAllTeamLeaders,
}






