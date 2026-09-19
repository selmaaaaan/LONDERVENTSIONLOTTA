const fs = require('fs');

function cleanPage(file, wrapperStart, wrapperEnd, innerStart, innerEnd) {
    if (!fs.existsSync(file)) {
        console.log('Skipping ' + file);
        return;
    }
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(wrapperStart) || content.includes(innerStart)) {
        content = content.replace(wrapperStart, wrapperEnd);
        content = content.replace(innerStart, innerEnd);
        fs.writeFileSync(file, content);
        console.log('Cleaned ' + file);
    } else {
        console.log('Could not find wrapper in ' + file);
    }
}

cleanPage(
    'admin-hudafestival-main/src/pages/TeamPortalDashboard.jsx',
    '<div className="w-full flex flex-col h-full bg-[var(--color-bg)]">',
    '<div className="w-full flex flex-col bg-[var(--color-bg)]">',
    '<div className="flex-1 overflow-y-auto p-8 max-w-[1600px] mx-auto w-full space-y-8">',
    '<div className="p-8 max-w-[1600px] mx-auto w-full space-y-8">'
);

cleanPage(
    'admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx',
    '<div className="w-full flex flex-col h-full bg-[var(--color-bg)]">',
    '<div className="w-full flex flex-col bg-[var(--color-bg)]">',
    '<div className="flex-1 overflow-y-auto p-8 max-w-[1600px] mx-auto w-full space-y-8">',
    '<div className="p-8 max-w-[1600px] mx-auto w-full space-y-8">'
);

cleanPage(
    'admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx',
    '<div className="w-full flex flex-col h-full bg-[var(--color-bg)]">',
    '<div className="w-full flex flex-col bg-[var(--color-bg)]">',
    '<div className="flex-1 overflow-y-auto p-8 max-w-[1600px] mx-auto w-full space-y-8">',
    '<div className="p-8 max-w-[1600px] mx-auto w-full space-y-8">'
);

cleanPage(
    'admin-hudafestival-main/src/pages/DashboardPage.jsx',
    '<div className="p-8 h-full flex flex-col gap-6 w-full max-w-[1600px] mx-auto">',
    '<div className="p-8 flex flex-col gap-6 w-full max-w-[1600px] mx-auto">',
    '<div className="space-y-3 flex-1 overflow-auto pr-2">',
    '<div className="space-y-3 pr-2">'
);
