const Candidate = require('../models/Candidate');
const { logAction } = require('../utils/logAction');
const Team = require('../models/Team');
const cloudinary = require('cloudinary').v2;
const Result = require('../models/Result');

// @desc Create a new candidate
// @route POST /api/candidates
// @access Public/Admin
const createCandidate = async (req, res) => {
    const Settings = require('../models/Settings');
    const settings = await Settings.findOne();
    if (settings && settings.isRegistrationOpen === false && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Registration is currently closed by Fest Admins.' });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Request body is missing' });
    }
    const { admissionNo, name, team, category } = req.body;

    try {
        const candidateExists = await Candidate.findOne({ admissionNo });
        if (candidateExists) {
            return res.status(400).json({message: 'Candidate with this admission number already exists'});
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload candidate image'});
        }

        const newCandidate = new Candidate({
            admissionNo,
            name,
            team, 
            category, 
            image: {
                url: req.file.path,
                public_id: req.file.filename,
            }
        });

        const savedCandidate = await newCandidate.save();
        await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'CANDIDATE_CREATED', entityType: 'Candidate', entityId: savedCandidate._id, details: { name: savedCandidate.name, admissionNo: savedCandidate.admissionNo }, req });
        res.status(201).json(savedCandidate);
    }
    catch (error) {
        console.error('Error creating candidate:', error);
        res.status(500).json({ message: 'Failed to createCandidate', error: error.message || 'Unknown error' });
    }
}

// @desc Get all candidates
// @route GET /api/candidates
// @access Public
const getAllCandidates = async (req, res) => {
    try {
        const filter = {};
        if (req.teamScope) {
            filter.team = req.teamScope;
        } else if (req.query.team) {
            filter.team = req.query.team;
        }

        if (req.query.category) {
            filter.category = req.query.category;
        }

        const candidates = await Candidate.find(filter).populate('team', 'name color');
        res.status(200).json(candidates);
    }
    catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ message: 'Failed to getAllCandidates', error: error.message || 'Unknown error' });
    }
}

// @desc    Get a single candidate by ID
// @route   GET /api/candidates/:id
// @access  Public (for now)
const getCandidateById = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id).populate('team', 'name');
        if(candidate) {
            res.status(200).json(candidate);
        }  else {
            res.status(404).json({ message: 'Candidate not found'});
        }
    }
    catch (error) {
        console.error('Error fetching candidate by Id:', error);
        res.status(500).json({ message: 'Failed to getCandidateById', error: error.message || 'Unknown error' });
    }
}

// @desc Update a candidate 
//  @route PUT /api/candidate/:id
// @access Private/Admin
const updateCandidate = async (req, res) => {
    const Settings = require('../models/Settings');
    const settings = await Settings.findOne();
    if (settings && settings.isRegistrationOpen === false && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Registration is currently closed by Fest Admins.' });
    }

    const { admissionNo, name, team, category, isResultPublished} = req.body;
    try {
        const candidate = await Candidate.findById(req.params.id);
        if(!candidate) {
            return res.status(404).json({ message: 'Candidate not found'})
        }

        if (req.user.role === 'team_leader' && candidate.team.toString() !== req.user.team.toString()) {
            return res.status(403).json({ message: 'You can only update your own team\'s candidates' });
        }

        if(req.file) {
            await cloudinary.uploader.destroy(candidate.image.public_id);
            candidate.image.url =  req.file.path
            candidate.image.public_id = req.file.filename;
        }

        candidate.admissionNo = admissionNo || candidate.admissionNo;
        candidate.name = name || candidate.name;
        candidate.team = team || candidate.team;
        candidate.category = category || candidate.category;

        const updateCandidate = await candidate.save();
        res.status(200).json(updateCandidate);
    }
    catch (error) {
        console.error('Error updating candidate:', error);
        res.status(500).json({ message: 'Failed to updateCandidate', error: error.message || 'Unknown error' });
    }
}

// @desc Delete a candidate
// @route DELETE /api/candidates/:id
// @access Private/Admin

const deleteCandidate = async (req, res) => {
    const Settings = require('../models/Settings');
    const settings = await Settings.findOne();
    if (settings && settings.isRegistrationOpen === false && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Registration is currently closed by Fest Admins.' });
    }

    try {
        const candidate = await Candidate.findById(req.params.id);
        if(!candidate) {
            return res.status(404).json({ message: 'Candidate not found'});
        }

        if (req.user.role === 'team_leader' && candidate.team.toString() !== req.user.team.toString()) {
            return res.status(403).json({ message: "You can only delete your own team's candidates" });
        }

        const approvedResults = await Result.find({ candidate: candidate._id, status: 'approved' });
        if (approvedResults.length > 0 && candidate.team) {
            const team = await Team.findById(candidate.team);
            if (team) {
                const pointsToDeduct = approvedResults.reduce((acc, curr) => acc + curr.totalPoints, 0);
                team.totalPoints -= pointsToDeduct;
                await team.save();
            }
        }
        
        await Result.deleteMany({ candidate: candidate._id });

        const Registration = require('../models/Registration');
        const regs = await Registration.find({ candidates: candidate._id });
        for (let reg of regs) {
            reg.candidates = reg.candidates.filter(cId => cId.toString() !== candidate._id.toString());
            if (reg.candidates.length === 0) {
                await reg.deleteOne();
            } else {
                await reg.save();
            }
        }

        const PointAdjustment = require('../models/PointAdjustment');
        await PointAdjustment.deleteMany({ appliesTo: 'candidate', candidate: candidate._id });

        if (candidate.image && candidate.image.public_id) {
            try {
                await cloudinary.uploader.destroy(candidate.image.public_id);
            } catch (err) {
                console.error('Cloudinary delete error:', err);
            }
        }

        await candidate.deleteOne();
        await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'CANDIDATE_DELETED', entityType: 'Candidate', entityId: candidate._id, details: { name: candidate.name }, req });
        
        return res.status(200).json({ message: 'Candidate deleted successfully' });
    }
    catch(error) {
        console.error('Error deleting candidate: ', error);
        res.status(500).json({ message: 'Failed to deleteCandidate', error: error.message || 'Unknown error' });
    }
}

const addMinusPoints = async (req, res) => {
    const { points } = req.body;
    const { id: candidateId } = req.params;

    const pointsToDeduct = Number(points);
    if (!pointsToDeduct || pointsToDeduct <= 0) {
        return res.status(400).json({ message: "Please provide a valid number of point to deduct ! "})
    }
    try {
        const candidate = await Candidate.findById(candidateId);
        if(!candidate) {
            return res.status(404).json({ message: "Candidate not found"})
        }
        
        // Add to the candidate's minusPoints tracker
        candidate.minusPoints += pointsToDeduct;
        // Subtract from the candidate's totalPoints
        candidate.totalPoints -= pointsToDeduct;
        await candidate.save();

        // IMPORTANT: Also subtract the points from their team's total
        const team = await Team.findById(candidate.team)
        if (team) {
            team.totalPoints -= pointsToDeduct;
            await team.save();
        }

        res.status(200).json({ message: `${pointsToDeduct} points deducted successfully.`, candidate})
    }
    catch (error) {
        console.error(`Error while add minus points ${error.message}`);
        res.status(500).json({ message: 'Failed to addMinusPoints', error: error.message || 'Unknown error' });
    }
}

// @desc Search for candidate
// @route GET /api/candidates/search
// @access Public
const searchCandidates = async (req, res) => {
    const searchTerm = req.query.term;
    if (!searchTerm) {
        return res.status(400).json({ message: 'Search term is required' });
    }
    try {
        const candidates = await Candidate.find({
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { admissionNo: { $regex: searchTerm, $options: 'i' } }
            ]
        }).populate('team', 'name');
        res.status(200).json(candidates);
    } catch (error) {
        console.error("Error searching candidates:", error);
        res.status(500).json({ message: 'Failed to searchCandidates', error: error.message || 'Unknown error' });
    }
};

// --- THIS IS THE NEW FUNCTION ---
// @desc    Get all results for a specific candidate
// @route   GET /api/candidates/:id/results
// @access  Public
const getCandidateResults = async (req, res) => {
    try {
        const results = await Result.find({ candidate: req.params.id, status: 'approved' })
            .populate('programme', 'name'); // Get the programme name for each result

        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching candidate results:", error);
        res.status(500).json({ message: 'Failed to getCandidateResults', error: error.message || 'Unknown error' });
    }
};


const lookupCandidates = async (req, res) => {
    try {
        const { search } = req.query;
        if (!search) return res.status(400).json({ message: 'Search query is required' });

        const query = {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { admissionNo: { $regex: search, $options: 'i' } }
            ]
        };

        if (req.user.role === 'team_leader') {
            query.team = req.user.team;
        }

        const candidates = await Candidate.find(query)
            .select('name admissionNo classLevel category team')
            .populate('team', 'name')
            .limit(50);

        res.status(200).json(candidates);
    } catch (error) {
        res.status(500).json({ message: 'Error looking up candidates', error: error.message });
    }
};

const getCandidateRegistrations = async (req, res) => {
    try {
        const Registration = require('../models/Registration');
        const TopicRegistration = require('../models/TopicRegistration');

        const candidateId = req.params.id;
        const candidate = await Candidate.findById(candidateId);
        
        if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

        if (req.user.role === 'team_leader' && candidate.team.toString() !== req.user.team.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this candidate' });
        }

        const registrations = await Registration.find({ candidates: candidateId })
            .populate('programme', 'code name category stageType isResultPublished');

        const programmeIds = registrations.map(r => r.programme._id);
        const teamTopicRegistrations = await TopicRegistration.find({
            programme: { $in: programmeIds },
            team: candidate.team
        });

        const mappedRegistrations = registrations.map(reg => {
            const prog = reg.programme;
            const topicReg = teamTopicRegistrations.find(t => 
                t.programme.toString() === prog._id.toString() && 
                (!t.candidate || t.candidate.toString() === candidateId)
            );

            return {
                _id: reg._id,
                programmeId: prog._id,
                programmeCode: prog.code,
                programmeName: prog.name,
                category: prog.category,
                type: prog.stageType === 'stage' ? 'Stage' : 'Non-Stage',
                isResultPublished: prog.isResultPublished,
                status: reg.status,
                topic: topicReg ? topicReg.topic : null,
                topicStatus: topicReg ? topicReg.status : null
            };
        });

        mappedRegistrations.sort((a, b) => {
            if (a.category !== b.category) return (a.category || '').localeCompare(b.category || '');
            return (a.programmeCode || '').localeCompare(b.programmeCode || '');
        });

        res.status(200).json(mappedRegistrations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching candidate registrations', error: error.message });
    }
};

module.exports = {
    lookupCandidates,
    getCandidateRegistrations,
    createCandidate, 
    getAllCandidates,
    getCandidateById,
    updateCandidate,
    deleteCandidate,
    addMinusPoints,
    searchCandidates,
    getCandidateResults,
}
