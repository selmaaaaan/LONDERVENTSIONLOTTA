const fs = require('fs');
const p = 'admin-hudafestival-main/src/pages/TopicManagementPage.jsx';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(
  /topic: newTopicForm\.topic,/,
  "topic: newTopicForm.topic || (topicMode === 'free-text' ? 'Attachment Provided' : ''),"
);

fs.writeFileSync(p, code);
