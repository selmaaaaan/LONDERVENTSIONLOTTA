const fs = require('fs');
const p = 'admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(
  /const toSubmit = candIds\.filter\(id => topicForm\.candidates\[id\]\?\.topic\?\.trim\(\)\);/g,
  \const toSubmit = candIds.filter(id => {
    const data = topicForm.candidates[id];
    return data?.topic?.trim() || (selectedTopicProg?.topicMode === "free-text" && data?.attachment);
  });\
);

code = code.replace(
  /topic: candData\.topic,/g,
  \	opic: candData.topic || (selectedTopicProg?.topicMode === "free-text" && candData.attachment ? "Attachment Provided" : ""), \
);

code = code.replace(
  /if \(\!topicForm\.groupTopic\) \{\s*setError\('Please enter a topic'\); setSubmitting\(false\); return;\s*\}/g,
  \if (!topicForm.groupTopic && selectedTopicProg?.topicMode !== "free-text") {
    setError('Please enter a topic'); setSubmitting(false); return;
  }
  if (!topicForm.groupTopic && selectedTopicProg?.topicMode === "free-text" && !topicForm.groupAttachment) {
    setError('Please provide a topic or an attachment'); setSubmitting(false); return;
  }\
);

fs.writeFileSync(p, code);
