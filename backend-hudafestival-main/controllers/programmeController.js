const Programme = require('../models/Programme');
const { logAction } = require('../utils/logAction');
const Result = require('../models/Result');
const Team = require('../models/Team');
const Candidate = require('../models/Candidate');

// @desc Create a new programme
// @route POST /api/programmes
// @access Private/Admin
const createProgramme = async (req, res) => {
    const { name, type, date, category, code, stageType, participantsRaw, format, isStarred } = req.body;
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Request body is missing' });
    }
    
    // Check specific fields and return explicit error messages
    if (!name) return res.status(400).json({ message: 'Please provide programme name' });
    if (!type) return res.status(400).json({ message: 'Please provide programme type' });
    if (!category) return res.status(400).json({ message: 'Please provide programme category' });
    if (!code) return res.status(400).json({ message: 'Please provide programme code' });
    if (!stageType) return res.status(400).json({ message: 'Please provide programme stageType' });
    if (!participantsRaw) return res.status(400).json({ message: 'Please provide programme participantsRaw' });

    try {
        const newProgramme = new Programme({
            name,
            type,
            date,
            category,
            code,
            stageType,
            participantsRaw,
            format,
            isStarred
        });
       
        const savedProgramme = await newProgramme.save();
        await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'PROGRAMME_CREATED', entityType: 'Programme', entityId: savedProgramme._id, details: { name: savedProgramme.name }, req });
        res.status(201).json(savedProgramme);
    }
    catch (error) {
        console.error(`Error while creating programme: ${error.message}`);
        if (error.code === 11000) {
            return res.status(400).json({ message: `The programme code "${code}" already exists. Please use a unique code.` });
        }
        res.status(500).json({ message: error.message || 'Unknown error', error: error.message || 'Unknown error' })
    }
}

// @desc Get all programmes
// @route GET /api/programmes
// @access Public
const getAllProgrammes = async (req, res) => {
    try {
        let filter = {};
        if (req.query.search) {
            const regex = new RegExp(req.query.search, 'i');
            filter = {
                $or: [
                    { name: regex },
                    { code: regex },
                    { category: regex }
                ]
            };
        }
        
        let isPaginated = req.query.page || req.query.limit;
        let totalCount = 0;
        let currentPage = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 25;
        let totalPages = 1;
        
        let programmes;
        if (isPaginated) {
            const skip = (currentPage - 1) * limit;
            const [data, count] = await Promise.all([
                Programme.find(filter).skip(skip).limit(limit).lean(),
                Programme.countDocuments(filter)
            ]);
            programmes = data;
            totalCount = count;
            totalPages = Math.ceil(count / limit);
        } else {
            programmes = await Programme.find(filter).lean();
        }
        
        // Fetch all registrations to calculate participant count
        const registrations = await Registration.find({}, 'programme candidates');
        
        // Group candidate counts by programme
        const countMap = {};
        for (const reg of registrations) {
            if (reg.programme) {
                const progId = reg.programme.toString();
                countMap[progId] = (countMap[progId] || 0) + (reg.candidates ? reg.candidates.length : 0);
            }
        }

        const enrichedProgrammes = programmes.map(prog => ({
            ...prog,
            participantCount: countMap[prog._id.toString()] || 0
        }));

        if (isPaginated) {
            return res.status(200).json({ data: enrichedProgrammes, totalCount, totalPages, currentPage });
        }
        res.status(200).json(enrichedProgrammes);
    }
    catch (error) {
        console.error(`Error while fetching programmes: ${error.message}`);
        res.status(500).json({ message: 'Failed to getAllProgrammes', error: error.message || 'Unknown error' });
    }
}

// @desc Get programme by ID 
// @route GET /api/programmes
// @access Public 
const getProgrammeById = async (req, res) => {
    try {
        const programme = await Programme.findById(req.params.id);
        if(programme) {
            res.status(200).json(programme);
        } else {
            res.status(404).json({ message: 'Programme not found'});
        }
    }
    catch (error) {
        console.error(`Error while fetching programme by ID: ${error.message}`);
        res.status(500).json({ message: 'Failed to getProgrammeById', error: error.message || 'Unknown error' });
    }
}

// @desc Update a programme
// @route PUT /api/programmes/:id
// @access Private/Admin
const updateProgramme = async (req,res) => {
    const { name, type, category, code, stageType, participantsRaw, format, isStarred } = req.body;
    try {
        const programme = await Programme.findById(req.params.id);
        if(!programme) {
            return res.status(404).json({ message: 'Programme not found'});
        }

        if (name !== undefined) programme.name = name;
        if (type !== undefined) programme.type = type;
        if (category !== undefined) programme.category = category;
        if (code !== undefined) programme.code = code;
        if (stageType !== undefined) programme.stageType = stageType;
        if (participantsRaw !== undefined) programme.participantsRaw = participantsRaw;
        if (format !== undefined) programme.format = format;
        if (isStarred !== undefined) programme.isStarred = isStarred;

        const updatedProgramme = await programme.save();
        res.status(200).json(updatedProgramme);

    }
    catch (error) {
        console.error(`Error while updating programme: ${error.message}`);
        res.status(500).json({ message: 'Failed to updateProgramme', error: error.message || 'Unknown error' });
    }
}

// @desc Delete a programme 
// @route DELETE /api/programmes/:id
// @access Private/Admin
const deleteProgramme = async (req, res) => {
    try {
        const programme = await Programme.findById(req.params.id);
        if(!programme) {
            return res.status(404).json({ message: 'Programme not found'});
        }

        const approvedResults = await Result.find({ programme: programme._id, status: 'approved' }).populate('candidate');

        for (const result of approvedResults) {
            if (result.candidate) {
                const candidate = result.candidate;
                candidate.totalPoints -= result.totalPoints;
                await candidate.save();

                if (candidate.team) {
                    const team = await Team.findById(candidate.team);
                    if (team) {
                        team.totalPoints -= result.totalPoints;
                        await team.save();
                    }
                }
            }
        }
        
        await Result.deleteMany({ programme: programme._id });

        await programme.deleteOne();
        await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'PROGRAMME_DELETED', entityType: 'Programme', entityId: programme._id, details: { name: programme.name }, req });
        res.status(200).json({ message: 'Programme removed successfully'});
    }
    catch (error) {
        console.error(`Error while deleting programme: ${error.message}`);
        res.status(500).json({ message: 'Failed to deleteProgramme', error: error.message || 'Unknown error' });
    }
}


const Registration = require('../models/Registration');

const updateTopicSettings = async (req, res) => {
    try {
        const { topicMode, topicList } = req.body;
        const programme = await Programme.findById(req.params.id);
        if (!programme) {
            return res.status(404).json({ message: 'Programme not found' });
        }
        
        if (topicMode !== undefined) programme.topicMode = topicMode;
        if (topicList !== undefined) programme.topicList = topicList;

        const updatedProgramme = await programme.save();
        res.status(200).json(updatedProgramme);
    } catch (error) {
        console.error(`Error while updating topic settings: ${error.message}`);
        res.status(500).json({ message: 'Failed to updateTopicSettings', error: error.message || 'Unknown error' });
    }
}

const updateProgrammeSchedule = async (req, res) => {
    try {
        const { date, startTime, venue } = req.body;
        const programme = await Programme.findById(req.params.id);
        if (!programme) {
            return res.status(404).json({ message: 'Programme not found' });
        }
        
        if (date !== undefined) programme.date = date;
        if (startTime !== undefined) programme.startTime = startTime;
        if (venue !== undefined) programme.venue = venue;

        const updatedProgramme = await programme.save();
        res.status(200).json(updatedProgramme);
    } catch (error) {
        console.error(`Error while updating programme schedule: ${error.message}`);
        res.status(500).json({ message: 'Failed to update schedule', error: error.message || 'Unknown error' });
    }
}

const updateProgrammeStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const allowedStatuses = ['upcoming', 'live', 'completed', 'postponed'];
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({ message: `status must be one of: ${allowedStatuses.join(', ')}` });
        }
        const programme = await Programme.findById(req.params.id);
        if (!programme) {
            return res.status(404).json({ message: 'Programme not found' });
        }
        programme.status = status;
        const updatedProgramme = await programme.save();
        res.status(200).json(updatedProgramme);
    } catch (error) {
        console.error(`Error while updating programme status: ${error.message}`);
        res.status(500).json({ message: 'Failed to update status', error: error.message || 'Unknown error' });
    }
}

// @desc  Get programme candidates identified only by code letter (blind judging)
// @route GET /api/programmes/:id/candidates-for-judging
// @access Private (judge | admin)
const CodeLetter = require('../models/CodeLetter');

module.exports = {
    createProgramme,
    getAllProgrammes,
    getProgrammeById,
    updateProgramme,
    deleteProgramme,
    updateTopicSettings,
    updateProgrammeSchedule,
    updateProgrammeStatus
}
