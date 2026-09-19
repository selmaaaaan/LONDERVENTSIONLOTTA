import sys

with open('src/pages/TopicManagementPage.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

out = []
i = 0
while i < len(lines):
    line = lines[i]
    if '<span>{prog.category}</span>' in line and 'text-xs text-[var(--color-text-muted)] mt-1 flex justify-between' in lines[i-1]:
        # We are at the right spot
        # Replace lines i-1, i, i+1, i+2
        out.pop() # remove i-1
        new_block = '''                <div className="text-xs text-[var(--color-text-muted)] mt-1 flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <span>{prog.category}</span>
                      {(() => {
                        const progTopics = allTopics.filter(t => t.programme?._id === prog._id);
                        const pending = progTopics.filter(t => t.status === 'pending').length;
                        const approved = progTopics.filter(t => t.status === 'approved').length;
                        return (pending > 0 || approved > 0) ? (
                          <div className="flex gap-1 ml-1">
                            {pending > 0 && <span className="text-[10px] bg-amber-100/60 text-amber-600 px-1.5 py-0.5 rounded font-bold">{pending} PEND</span>}
                            {approved > 0 && <span className="text-[10px] bg-green-100/60 text-green-600 px-1.5 py-0.5 rounded font-bold">{approved} APPR</span>}
                          </div>
                        ) : null;
                      })()}
                    </div>
                    <span className="font-semibold uppercase opacity-60">{prog.topicMode || 'none'}</span>
                  </div>
'''
        out.append(new_block)
        i += 3 # skip the old lines
    else:
        out.append(line)
        i += 1

with open('src/pages/TopicManagementPage.jsx', 'w', encoding='utf-8') as f:
    f.writelines(out)
