const fs = require('fs');
let content = fs.readFileSync('src/pages/TopicManagementPage.jsx', 'utf8');

const regex = /<div className="text-xs text-\\[var\(--color-text-muted\)\\] mt-1 flex justify-between">\s*<span>\{prog.category\}<\/span>\s*<span className="font-semibold uppercase">\{prog.topicMode \|\| 'none'\}<\/span>\s*<\/div>/g;

const uiReplacement = \                  <div className="text-xs text-[var(--color-text-muted)] mt-1 flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <span>{prog.category}</span>
                      {(() => {
                        const progTopics = allTopics.filter(t => t.programme?._id === prog._id);
                        const pending = progTopics.filter(t => t.status === 'pending').length;
                        const approved = progTopics.filter(t => t.status === 'approved').length;
                        return (pending > 0 || approved > 0) ? (
                          <div className="flex gap-1 ml-1">
                            {pending > 0 && <span className="text-[10px] bg-orange-100/50 text-orange-600 px-1 py-0.5 rounded font-bold">{pending} PEND</span>}
                            {approved > 0 && <span className="text-[10px] bg-green-100/50 text-green-600 px-1 py-0.5 rounded font-bold">{approved} APPR</span>}
                          </div>
                        ) : null;
                      })()}
                    </div>
                    <span className="font-semibold uppercase opacity-60">{prog.topicMode || 'none'}</span>
                  </div>\;

content = content.replace(regex, uiReplacement);
fs.writeFileSync('src/pages/TopicManagementPage.jsx', content, 'utf8');
