const fs = require('fs');

let code = fs.readFileSync('src/components/Sidebar.jsx', 'utf8');

// 1. Remove useState for collapsed
code = code.replace(/const \[collapsed, setCollapsed\] = useState\(false\);\n?/, '');

// 2. Fix the aside className
code = code.replace(
    /<aside className=\{`\$\{collapsed \? 'w-20' : 'w-64'\} flex flex-col bg-\[var\(--color-surface\)\] border-r border-\[var\(--color-border\)\] transition-all duration-300`\}>/,
    '<aside className="w-64 flex flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)]">'
);

// 3. Fix Logo
code = code.replace(
    /\{collapsed \? <Logo short \/> : <Logo size="default" \/>\}/,
    '<Logo size="default" />'
);

// 4. Fix Nav link title
code = code.replace(
    /title=\{collapsed \? label : undefined\}/g,
    ''
);

// 5. Fix Nav link className
code = code.replace(
    /`w-full flex items-center \$\{collapsed \? 'justify-center' : 'gap-3 px-4'\} /g,
    '`w-full flex items-center gap-3 px-4 '
);

// 6. Fix Nav link label
code = code.replace(
    /\{!collapsed && <span className="truncate">\{label\}<\/span>\}/g,
    '<span className="truncate">{label}</span>'
);

// 7. Fix User Profile link
code = code.replace(
    /`w-full flex items-center \$\{collapsed \? 'justify-center' : 'gap-3 px-3'\} /g,
    '`w-full flex items-center gap-3 px-3 '
);

// 8. Fix User Profile text wrapper
code = code.replace(
    /\{!collapsed && \(\s*<div className="flex-1 overflow-hidden text-left">\s*<div className="font-semibold text-\[var\(--color-text-heading\)\] truncate leading-tight">\{userInfo\?.userName \|\| 'User'\}<\/div>\s*<div className="text-\[10px\] text-\[var\(--color-text-muted\)\] capitalize truncate mt-0.5">\{userInfo\?.role\?.replace\('_', ' '\) \|\| 'Admin'\}<\/div>\s*<\/div>\s*\)\}/,
    `<div className="flex-1 overflow-hidden text-left">
              <div className="font-semibold text-[var(--color-text-heading)] truncate leading-tight">{userInfo?.userName || 'User'}</div>
              <div className="text-[10px] text-[var(--color-text-muted)] capitalize truncate mt-0.5">{userInfo?.role?.replace('_', ' ') || 'Admin'}</div>
            </div>`
);

// 9. Remove collapse button
code = code.replace(
    /<button\s*onClick=\{.*?\}\s*title=\{.*?\}\s*className=\{.*?\}\s*>\s*\{collapsed \? <ChevronRight size=\{18\} \/> : <ChevronLeft size=\{18\} \/>\}\s*<\/button>/s,
    ''
);

fs.writeFileSync('src/components/Sidebar.jsx', code);
console.log('Sidebar.jsx simplified.');
