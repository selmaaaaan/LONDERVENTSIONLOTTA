const fs = require('fs');
let fileContent = fs.readFileSync('src/pages/result-entry/BatchDashboard.jsx', 'utf8');

if (!fileContent.includes("import { useNavigate, useSearchParams }")) {
    fileContent = fileContent.replace(
        "import { useNavigate } from 'react-router-dom';",
        "import { useNavigate, useSearchParams } from 'react-router-dom';"
    );
}

if (!fileContent.includes("const [searchParams] = useSearchParams();")) {
    fileContent = fileContent.replace(
        "const navigate = useNavigate();",
        "const navigate = useNavigate();\n    const [searchParams] = useSearchParams();\n    const filter = searchParams.get('filter') || 'all';"
    );
}

if (!fileContent.includes("const filteredBatches = batches.filter(")) {
    fileContent = fileContent.replace(
        "return (",
        `const filteredBatches = batches.filter(b => filter === 'all' || b.status === filter);
    
    return (`
    );
    
    fileContent = fileContent.replace(
        "batches.length === 0",
        "filteredBatches.length === 0"
    );
    
    fileContent = fileContent.replace(
        "batches.map((batch)",
        "filteredBatches.map((batch)"
    );
}

fs.writeFileSync('src/pages/result-entry/BatchDashboard.jsx', fileContent);
console.log('BatchDashboard.jsx patched successfully');
