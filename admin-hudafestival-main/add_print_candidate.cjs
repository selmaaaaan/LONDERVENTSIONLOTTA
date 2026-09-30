const fs = require('fs');
let c = fs.readFileSync('src/pages/CandidateProgrammeStatusPage.jsx', 'utf8');

c = c.replace(
    "import { ArrowLeft, User, Trophy, Calendar, CheckCircle, Clock } from \"lucide-react\";",
    "import { ArrowLeft, User, Trophy, Calendar, CheckCircle, Clock, Printer } from \"lucide-react\";"
);

const backButtonArea = `
            <div className="flex items-center gap-4 mb-6 print:hidden">
                <Button variant="ghost" onClick={() => navigate(-1)} className="!px-2">
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="text-xl font-bold text-[var(--color-text-heading)]">Candidate Profile</h1>
            </div>
`;

const newHeaderArea = `
            <div className="flex items-center justify-between mb-6 print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="!px-2">
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="text-xl font-bold text-[var(--color-text-heading)]">Candidate Profile</h1>
                </div>
                <Button variant="secondary" onClick={() => window.print()}>
                    <Printer size={16} /> Print Status
                </Button>
            </div>
`;

if (c.includes(backButtonArea.trim())) {
    c = c.replace(backButtonArea.trim(), newHeaderArea.trim());
} else {
    // maybe slightly different spacing
    c = c.replace(
        '<Button variant="ghost" onClick={() => navigate(-1)} className="!px-2">',
        '<div className="flex justify-between w-full"><Button variant="ghost" onClick={() => navigate(-1)} className="!px-2">'
    );
    c = c.replace(
        '<h1 className="text-xl font-bold text-[var(--color-text-heading)]">Candidate Profile</h1>',
        '<h1 className="text-xl font-bold text-[var(--color-text-heading)]">Candidate Profile</h1><Button variant="secondary" onClick={() => window.print()}><Printer size={16} /> Print</Button></div>'
    );
}

fs.writeFileSync('src/pages/CandidateProgrammeStatusPage.jsx', c);
console.log('Added print button');
