const fs = require('fs');
const p = 'admin-hudafestival-main/src/pages/TopicManagementPage.jsx';
let code = fs.readFileSync(p, 'utf8');

const target = "{topic.createdAt && <div className=\"text-xs text-[var(--color-text-muted)] mt-0.5\">Submitted: {new Date(topic.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</div>}";
const repl = target + "\n                            {topic.updatedAt && new Date(topic.updatedAt).getTime() - new Date(topic.createdAt).getTime() > 2000 && <div className=\"text-xs text-[var(--color-primary)] mt-0.5\">Edited: {new Date(topic.updatedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</div>}";

code = code.replace(target, repl);
fs.writeFileSync(p, code);
