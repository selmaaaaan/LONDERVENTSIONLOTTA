const fs = require('fs');
const c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8').replace(/\r\n/g, '\n');

const groupStart = c.indexOf(`                              <div className="space-y-3">\n                                <input\n                                  type="text"\n                                  value={topicForm.groupTopic || ''}`);
const groupEnd = c.indexOf(`                                     )}\n                                   </div>\n                                )}\n                              </div>`, groupStart);

console.log("Group Start Index:", groupStart);
if (groupStart > -1 && groupEnd > -1) {
    console.log("Group Block:", c.substring(groupStart, groupEnd + 167));
}

const candStart = c.indexOf(`                                    <div className="space-y-3">\n                                      <input\n                                        type="text"\n                                        value={candData.topic || ''}`);
const candEnd = c.indexOf(`                                           )}\n                                         </div>\n                                      )}\n                                    </div>`, candStart);

console.log("Cand Start Index:", candStart);
if (candStart > -1 && candEnd > -1) {
    console.log("Cand Block:", c.substring(candStart, candEnd + 184));
}