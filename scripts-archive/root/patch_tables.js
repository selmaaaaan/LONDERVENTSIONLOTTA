const fs = require('fs');

const pages = [
  'admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx',
  'admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx'
];

for (let p of pages) {
  let code = fs.readFileSync(p, 'utf8');
  const target = "<td className=\"px-6 py-4 text-xs text-[var(--color-text-muted)]\">{t.createdAt ? new Date(t.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}</td>";
  
  const repl = "<td className=\"px-6 py-4 text-xs text-[var(--color-text-muted)]\">\n" +
               "                            {t.createdAt ? new Date(t.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}\n" +
               "                            {t.updatedAt && new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime() > 2000 && (\n" +
               "                              <div className=\"text-[var(--color-primary)] mt-1\">\n" +
               "                                Edited: {new Date(t.updatedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}\n" +
               "                              </div>\n" +
               "                            )}\n" +
               "                          </td>";
  
  code = code.replace(target, repl);
  fs.writeFileSync(p, code);
}
