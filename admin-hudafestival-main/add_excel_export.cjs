const fs = require('fs');
let c = fs.readFileSync('src/pages/result-entry/ResultReportsPage.jsx', 'utf8');

c = c.replace(
    "import { Printer } from 'lucide-react';",
    "import { Printer, FileSpreadsheet } from 'lucide-react';\nimport * as XLSX from 'xlsx';"
);

const exportLogic = `
    const exportToExcel = async () => {
        try {
            const { data: candidates } = await api.get('/candidates');
            const sorted = candidates.sort((a, b) => {
                const classA = a.classLevel || '';
                const classB = b.classLevel || '';
                if (classA !== classB) {
                    return classA.localeCompare(classB, undefined, { numeric: true });
                }
                return (b.totalPoints || 0) - (a.totalPoints || 0);
            });

            const excelData = sorted.map(c => ({
                'Class Level': c.classLevel || 'Unspecified',
                'Admission No': c.admissionNo,
                'Name': c.name,
                'Category': c.category,
                'Team': c.team?.name || 'Unknown',
                'Total Points': c.totalPoints || 0
            }));

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Student Points");
            
            worksheet['!cols'] = [
                {wch: 15}, {wch: 15}, {wch: 30}, {wch: 15}, {wch: 25}, {wch: 15}
            ];

            XLSX.writeFile(workbook, "All_Students_Points_Classwise.xlsx");
        } catch (err) {
            console.error("Export error:", err);
            alert("Failed to export. Check console.");
        }
    };
`;

c = c.replace(
    "const [loading, setLoading] = useState(true);",
    "const [loading, setLoading] = useState(true);\n" + exportLogic
);

const buttons = `
                <div className="flex items-center gap-3">
                    <button 
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg transition-colors shadow-lg"
                    >
                        <FileSpreadsheet size={18} />
                        Export Excel
                    </button>
                    <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-heading)] rounded-lg transition-colors"
                    >
                        <Printer size={18} />
                        Print Report
                    </button>
                </div>
`;

c = c.replace(
    /<button\s+onClick=\{\(\) => window\.print\(\)\}[\s\S]*?<\/button>/,
    buttons.trim()
);

fs.writeFileSync('src/pages/result-entry/ResultReportsPage.jsx', c);
console.log('Added Excel export');
