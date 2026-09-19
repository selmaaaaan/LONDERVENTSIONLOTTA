const fs = require('fs');

const lines = fs.readFileSync('src/pages/TopicManagementPage.jsx', 'utf8').split('\n');
const out = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('<span>{prog.category}</span>') && out[out.length - 1].includes('text-[var(--color-text-muted)] mt-1 flex justify-between')) {
        out.pop();
        
        const newBlock = `                <div className="text-xs text-[var(--color-text-muted)] mt-1 flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <span>{prog.category}</span>
                      {(() => {
                        const progTopics = allTopics.filter(t => t.programme?._id === prog._id);
                        const pending = progTopics.filter(t => t.status === 'pending').length;
                        const approved = progTopics.filter(t => t.status === 'approved').length;
                        return (pending > 0 || approved > 0) ? (
                          <div className="flex gap-1 ml-1">
                            {pending > 0 && <span className="text-[9px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded font-bold">{pending} PEND</span>}
                            {approved > 0 && <span className="text-[9px] bg-green-100 text-green-700 px-1 py-0.5 rounded font-bold">{approved} APPR</span>}
                          </div>
                        ) : null;
                      })()}
                    </div>
                    <span className="font-semibold uppercase opacity-60">{prog.topicMode || 'none'}</span>
                  </div>`;
        
        out.push(...newBlock.split('\n').map(l => l.replace(/\r/g, '') + (line.endsWith('\r') ? '\r' : '')));
        
        i += 2; 
    } else {
        out.push(line);
    }
}

fs.writeFileSync('src/pages/TopicManagementPage.jsx', out.join('\n'), 'utf8');
