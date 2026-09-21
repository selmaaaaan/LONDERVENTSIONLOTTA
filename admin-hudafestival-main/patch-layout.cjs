const fs = require('fs');
let code = fs.readFileSync('src/components/ResultEntryLayout.jsx', 'utf8');

// Add icon
code = code.replace(
    "import { LogOut, PenTool, CheckSquare, Layers, LayoutDashboard, Sun, Moon } from 'lucide-react';",
    "import { LogOut, PenTool, CheckSquare, Layers, LayoutDashboard, Sun, Moon, Database } from 'lucide-react';"
);

// Add sidebar link
const newLink = `
                        <NavLink to="/result-entry/batches" className={navLinkClass}>
                            <Layers size={18} className="mr-3" />
                            Batches
                        </NavLink>
                        <NavLink to="/result-entry/all" className={navLinkClass}>
                            <Database size={18} className="mr-3" />
                            All Results
                        </NavLink>
`;

code = code.replace(
    `                        <NavLink to="/result-entry/batches" className={navLinkClass}>
                            <Layers size={18} className="mr-3" />
                            Batches
                        </NavLink>`,
    newLink
);

fs.writeFileSync('src/components/ResultEntryLayout.jsx', code);
console.log("Patched ResultEntryLayout.jsx");
