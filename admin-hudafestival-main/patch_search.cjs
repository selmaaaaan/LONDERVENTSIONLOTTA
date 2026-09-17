const fs = require('fs');
let c = fs.readFileSync('src/pages/ProgrammeParticipantSearchPage.jsx', 'utf8');

// Ensure import exists
if (!c.includes("import ProgrammeCodePicker")) {
    c = c.replace(
        "import { Search, Info, CheckCircle2, ChevronRight, Download } from 'lucide-react';",
        "import { Search, Info, CheckCircle2, ChevronRight, Download } from 'lucide-react';\nimport ProgrammeCodePicker from '../components/ProgrammeCodePicker';"
    );
}

// Replace select block
const selectRegex = /<select[\s\S]*?<\/select>/;
const newPicker = `<div className="w-full max-w-md">
                            <ProgrammeCodePicker 
                                programmes={programmes} 
                                value={selectedProgramme} 
                                onSelect={(p) => handleProgrammeSearch(p ? p._id : "")} 
                            />
                        </div>`;
                        
c = c.replace(selectRegex, newPicker);

fs.writeFileSync('src/pages/ProgrammeParticipantSearchPage.jsx', c);
console.log("Patched");
