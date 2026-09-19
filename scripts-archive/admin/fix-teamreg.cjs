const fs = require('fs');

function replaceInFile(file, search, replace) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(file, content);
}

replaceInFile(
  'src/pages/TeamRegistrationListPage.jsx',
  "const handleSave = async () => {\r\n        setSaving(true);",
  "const handleSave = async () => {\r\n        if (saving) return;\r\n        setSaving(true);"
);

replaceInFile(
  'src/pages/TeamRegistrationListPage.jsx',
  "const handleGroupSave = async (e) => {\r\n        e.preventDefault();\r\n        const { prog, selectedIds } = groupModal;",
  "const handleGroupSave = async (e) => {\r\n        e.preventDefault();\r\n        if (groupSaving) return;\r\n        const { prog, selectedIds } = groupModal;"
);

console.log("Updated TeamRegistrationListPage");
