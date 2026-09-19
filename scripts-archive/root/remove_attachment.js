const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

const search = `                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                  {selectedTopicProg?.topicMode === 'free-text' && (
                        <div className="mt-4">
                          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                            Attachment (YouTube Link / Image URL)
                          </label>
                          <input
                            type="text"
                            value={topicForm.attachment || ''}
                            onChange={e => setTopicForm(f => ({ ...f, attachment: e.target.value }))}
                            placeholder="Optional: https://youtube.com/..."
                            className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>
                      )}
                  <Button variant="ghost" type="button" onClick={() => setShowTopicForm(false)}>Cancel</Button>
                  <Button variant="primary" type="submit" loading={submitting}>Submit Topic</Button>
                </div>`;

const replace = `                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                  <Button variant="ghost" type="button" onClick={() => setShowTopicForm(false)}>Cancel</Button>
                  <Button variant="primary" type="submit" loading={submitting}>Submit Topic</Button>
                </div>`;

c = c.replace(search, replace);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', c, 'utf8');
console.log("Removed bottom attachment field");