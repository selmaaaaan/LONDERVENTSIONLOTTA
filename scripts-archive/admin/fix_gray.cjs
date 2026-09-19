const fs = require('fs');

function replaceFile(path, regexes) {
    let content = fs.readFileSync(path, 'utf8');
    regexes.forEach(([regex, repl]) => {
        content = content.replace(regex, repl);
    });
    fs.writeFileSync(path, content);
}

replaceFile('src/pages/ResultsPage.jsx', [
    [/bg-gray-100 inline-block px-2 py-1/g, 'bg-[var(--color-surface-elevated)] inline-block px-2 py-1']
]);

replaceFile('src/pages/SchedulePage.jsx', [
    [/bg-gray-100 text-gray-600/g, 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]']
]);

replaceFile('src/pages/VolunteerPortal.jsx', [
    [/bg-gray-200 text-gray-600/g, 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]']
]);

replaceFile('src/components/AddCandidate.jsx', [
    [/bg-gray-100 rounded-xl hover:bg-gray-200/g, 'bg-[var(--color-surface-elevated)] rounded-xl hover:bg-[var(--color-border)]']
]);

replaceFile('src/components/AddProgrammeForm.jsx', [
    [/bg-gray-100 text-gray-500/g, 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]'],
    [/bg-gray-100 rounded-xl hover:bg-gray-200/g, 'bg-[var(--color-surface-elevated)] rounded-xl hover:bg-[var(--color-border)]']
]);

console.log('Fixed un-themed gray backgrounds.');
