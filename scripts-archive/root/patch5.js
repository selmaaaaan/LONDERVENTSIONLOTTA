const fs = require('fs');
let content = fs.readFileSync('admin-hudafestival-main/src/App.jsx', 'utf8');

content = content.replace(
  "    setShowPreloader(true);\r\n    setTimeout(() => setShowPreloader(false), 2000);",
  "    setBootComplete(false);\n    setSettingsLoaded(false);\n    setTimeout(() => setSettingsLoaded(true), 10);"
);

content = content.replace(
  "    setShowPreloader(true);\n    setTimeout(() => setShowPreloader(false), 2000);",
  "    setBootComplete(false);\n    setSettingsLoaded(false);\n    setTimeout(() => setSettingsLoaded(true), 10);"
);

fs.writeFileSync('admin-hudafestival-main/src/App.jsx', content, 'utf8');
