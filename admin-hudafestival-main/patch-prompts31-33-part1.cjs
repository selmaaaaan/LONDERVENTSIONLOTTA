const fs = require('fs');

// Patch ReadyResultsPage.jsx
let readyContent = fs.readFileSync('src/pages/result-entry/ReadyResultsPage.jsx', 'utf8');
readyContent = readyContent.replace(
    'onClick={() => navigate(`/result-entry/enter`)}',
    'onClick={() => navigate(`/result-entry/enter?programmeId=${prog._id}`)}'
);
fs.writeFileSync('src/pages/result-entry/ReadyResultsPage.jsx', readyContent);
console.log('Patched ReadyResultsPage.jsx');

// Patch EnterResultPage.jsx
let enterContent = fs.readFileSync('src/pages/result-entry/EnterResultPage.jsx', 'utf8');

// 1. Add URL param parsing on mount
if (!enterContent.includes('const [searchParams]')) {
    enterContent = enterContent.replace(
        "import { Search, SearchIcon, CheckCircle2 } from 'lucide-react';",
        "import { Search, SearchIcon, CheckCircle2 } from 'lucide-react';\nimport { useSearchParams, useNavigate } from 'react-router-dom';"
    );
    enterContent = enterContent.replace(
        'export default function EnterResultPage() {',
        'export default function EnterResultPage() {\n    const [searchParams] = useSearchParams();\n    const navigate = useNavigate();\n    const editProgId = searchParams.get("programmeId");'
    );
}

// 2. Fetch existing results when selectedProg changes (or on mount if editProgId is provided)
// Wait, EnterResultPage likely searches programmes first. Let's see how it works.
