const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/CandidateProgrammeStatusPage.jsx', 'utf8');

const targetHeader = `<div className="p-6 w-full max-w-5xl mx-auto space-y-6">`;
const replacementHeader = `<div className="p-6 w-full max-w-5xl mx-auto space-y-6">
            
            {/* STUNNING PRINT HEADER (Only visible in Print) */}
            <div className="hidden print:block text-center border-b-2 border-gray-800 pb-6 mb-8 mt-4">
                <h1 className="text-4xl font-black uppercase tracking-widest text-black mb-2">L'Intervention '24</h1>
                <h2 className="text-xl font-bold text-gray-600 uppercase tracking-wider">Candidate Performance Report</h2>
            </div>
            `;

c = c.replace(targetHeader, replacementHeader);

fs.writeFileSync('admin-hudafestival-main/src/pages/CandidateProgrammeStatusPage.jsx', c);
console.log('Added print header');
