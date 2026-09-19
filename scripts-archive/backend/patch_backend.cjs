const fs = require('fs');
let code = fs.readFileSync('controllers/candidateController.js', 'utf8');

const newFunctions = `
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
            .populate('programme', 'code name category stageType');

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
`;

code = code.replace('module.exports = {', newFunctions + '\nmodule.exports = {\n    lookupCandidates,\n    getCandidateRegistrations,');
fs.writeFileSync('controllers/candidateController.js', code);
