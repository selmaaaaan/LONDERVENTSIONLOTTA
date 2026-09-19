const fs = require('fs');
const p = 'admin-hudafestival-main/src/pages/TopicManagementPage.jsx';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(
  /\{isRegisterModalOpen && \(\s*<div className="fixed inset-0 bg-black\/50 flex items-center justify-center z-\[99\]">\s*<div className="bg-\[var\(--color-surface\)\] p-6 rounded-xl shadow-xl w-full max-w-md max-h-\[90vh\] overflow-y-auto">\s*<div className="flex justify-between items-center mb-4">\s*<h3 className="text-lg font-bold">Register Topic for \{selectedProgramme\?\.name\}<\/h3>\s*<button onClick=\{\(\) => setIsRegisterModalOpen\(false\)\}>\s*<X size=\{20\}\/>\s*<\/button>\s*<\/div>/,
  '<Modal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} title={Register Topic for \}>'
);

code = code.replace(
  /<Button onClick=\{handleRegisterTopic\} className="w-full justify-center">Submit Topic<\/Button>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}\s*<\/div>/,
  '<Button variant="primary" onClick={handleRegisterTopic} className="w-full justify-center">Submit Topic</Button>\n            </div>\n      </Modal>\n    </div>'
);

code = code.replace(
  /import StatusBadge from '\.\.\/components\/StatusBadge';/,
  "import StatusBadge from '../components/StatusBadge';\nimport Modal from '../components/Modal';"
);

fs.writeFileSync(p, code);
