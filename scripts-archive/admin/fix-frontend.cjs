const fs = require('fs');

function replaceInFile(file, search, replace) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(file, content);
}

replaceInFile(
  'src/pages/RegistrationReviewPage.jsx',
  "const handleAssignSubmit = async (e) => {\r\n    e.preventDefault();\r\n    setAssignError('');",
  "const handleAssignSubmit = async (e) => {\r\n    e.preventDefault();\r\n    if (assignSubmitting) return;\r\n    setAssignError('');"
);

replaceInFile(
  'src/pages/TeamLeaderDashboard.jsx',
  "const handleSubmit = async (e) => {\r\n    e.preventDefault();\r\n    setError('');",
  "const handleSubmit = async (e) => {\r\n    e.preventDefault();\r\n    if (submitting) return;\r\n    setError('');"
);

console.log("Updated frontend components");
