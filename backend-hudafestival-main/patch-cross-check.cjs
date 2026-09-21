const fs = require('fs');

let r = fs.readFileSync('routes/resultEntryRoutes.js', 'utf8');

const target = `const programme = await Programme.findById(programmeId);

        const bulkOps = results.map(resultData => {`;

const replacement = `const programme = await Programme.findById(programmeId);
        
        // --- ADDED CROSS-CHECK ---
        const approvedRegs = await Registration.find({ programme: programmeId, status: 'approved' });
        const validCandidateIds = new Set();
        approvedRegs.forEach(reg => {
            reg.candidates.forEach(c => validCandidateIds.add(c.toString()));
        });

        for (const rData of results) {
            if (!validCandidateIds.has(rData.candidateId.toString())) {
                return res.status(400).json({ message: \`Candidate \${rData.candidateId} is not an approved participant for this programme.\` });
            }
        }
        // -------------------------

        const bulkOps = results.map(resultData => {`;

r = r.replace(target, replacement);

fs.writeFileSync('routes/resultEntryRoutes.js', r);
