const fs = require('fs');

function removeJudgeFromApp() {
    let p = 'src/App.jsx';
    if (!fs.existsSync(p)) return;
    let text = fs.readFileSync(p, 'utf8');
    text = text.replace(/import JudgePanel from '\.\/pages\/JudgePanel';\r?\n/, '');
    text = text.replace(/import JudgmentFeedbackPage from '\.\/pages\/JudgmentFeedbackPage';\r?\n/, '');
    text = text.replace(/if \(info\.role === 'judge'\) return 'judge_panel';\r?\n\s*/, '');
    text = text.replace(/judge_panel: '\/judge-panel',?\s*/, '');
    text = text.replace(/<Route path="\/judge-panel".*?\/>\r?\n\s*/, '');
    text = text.replace(/<Route path="\/judgment-feedback".*?\/>\r?\n\s*/, '');
    text = text.replace(/'judge',\s*/g, ''); 
    text = text.replace(/'judge']/g, "']");
    text = text.replace(/userInfo\?\.role === 'judge' \? '\/judge-panel' : /g, '');
    fs.writeFileSync(p, text);
}

function removeJudgeFromSidebar() {
    let p = 'src/components/Sidebar.jsx';
    if (!fs.existsSync(p)) return;
    let text = fs.readFileSync(p, 'utf8');
    text = text.replace(/const isJudge = userInfo\?\.role === 'judge';\r?\n\s*/, '');
    text = text.replace(/const visibleNavItems = isJudge\r?\n\s*\? \[.*?\]\r?\n\s*: /s, 'const visibleNavItems = ');
    fs.writeFileSync(p, text);
}

function removeJudgeFromUsersPage() {
    let p = 'src/pages/UsersPage.jsx';
    if (!fs.existsSync(p)) return;
    let text = fs.readFileSync(p, 'utf8');
    text = text.replace(/<option value="judge">Judge<\/option>\r?\n\s*/, '');
    fs.writeFileSync(p, text);
}

removeJudgeFromApp();
removeJudgeFromSidebar();
removeJudgeFromUsersPage();
console.log("Patched frontend files for judge");
