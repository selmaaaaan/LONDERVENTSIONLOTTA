const fs = require('fs');
try {
  require('@babel/parser').parse(fs.readFileSync('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', 'utf8'), {
    sourceType: 'module',
    plugins: ['jsx']
  });
  console.log("Syntax OK");
} catch(e) {
  console.log("Syntax Error:", e.loc, e.message);
}