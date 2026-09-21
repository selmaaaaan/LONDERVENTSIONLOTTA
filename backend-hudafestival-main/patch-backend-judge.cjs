const fs = require('fs');
const path = require('path');

function stripJudgeFromRoute(filePath) {
    if (!fs.existsSync(filePath)) return;
    let text = fs.readFileSync(filePath, 'utf8');
    text = text.replace(/'judge',\s*/g, '');
    text = text.replace(/'judge']/g, "']");
    fs.writeFileSync(filePath, text);
}

function patchBackend() {
    let userModelPath = 'models/User.js';
    if (fs.existsSync(userModelPath)) {
        let text = fs.readFileSync(userModelPath, 'utf8');
        text = text.replace(/'judge',\s*/, '');
        fs.writeFileSync(userModelPath, text);
    }
    
    ['auditLogRoutes.js', 'candidateRoutes.js', 'programmeRoutes.js', 'registrationRoutes.js', 'resultRoutes.js', 'topicRegistrationRoutes.js'].forEach(file => {
        stripJudgeFromRoute(path.join('routes', file));
    });
    
    let allResultsRoutes = 'routes/allResultsRoutes.js';
    if (fs.existsSync(allResultsRoutes)) {
        let text = fs.readFileSync(allResultsRoutes, 'utf8');
        text = text.replace(/\/\/ @desc    Get current judge's submitted results[\s\S]*?router\.get\('\/my-submissions', protect, async \(req, res\) => \{[\s\S]*?\}\);\s*/, '');
        fs.writeFileSync(allResultsRoutes, text);
    }
    
    let programmeRoutes = 'routes/programmeRoutes.js';
    if (fs.existsSync(programmeRoutes)) {
        let text = fs.readFileSync(programmeRoutes, 'utf8');
        text = text.replace(/\/\/ --- Blind Judging Route.*?router\.get\('\/:id\/candidates-for-judging'.*?\);\s*/s, '');
        text = text.replace(/router\.get\('\/code\/:code\/judging'.*?\);\s*/s, '');
        fs.writeFileSync(programmeRoutes, text);
    }
    
    let programmeController = 'controllers/programmeController.js';
    if (fs.existsSync(programmeController)) {
        let text = fs.readFileSync(programmeController, 'utf8');
        text = text.replace(/const getProgrammeByCodeForJudging = async \(req, res\) => \{[\s\S]*?\}\s*};\s*/s, '');
        text = text.replace(/\/\/ @desc GET Candidates for blind judging[\s\S]*?const getCandidatesForBlindJudging = async \(req, res\) => \{[\s\S]*?\}\s*};\s*/s, '');
        text = text.replace(/getProgrammeByCodeForJudging,?\s*/g, '');
        text = text.replace(/getCandidatesForBlindJudging,?\s*/g, '');
        fs.writeFileSync(programmeController, text);
    }
}

patchBackend();
console.log("Patched backend for judge removal");
