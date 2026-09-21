const fs = require('fs');
const path = require('path');

// 1. Patch App.jsx
let appJsxPath = 'src/App.jsx';
if (fs.existsSync(appJsxPath)) {
    let appJsx = fs.readFileSync(appJsxPath, 'utf8');
    appJsx = appJsx.replace(/import VolunteerPortal from '\.\/pages\/VolunteerPortal';\r?\n/, '');
    appJsx = appJsx.replace(/if \(info\.role === 'volunteer'\) return 'volunteer_portal';\r?\n\s*/, '');
    appJsx = appJsx.replace(/volunteer_portal: '\/volunteer-portal'/g, '');
    appJsx = appJsx.replace(/<Route path="\/volunteer-portal".*?\/>\r?\n\s*/, '');
    appJsx = appJsx.replace(/'volunteer'/g, ''); // Removes it from allowedRoles in SettingsPage
    appJsx = appJsx.replace(/userInfo\?\.role === 'volunteer' \? '\/volunteer-portal' : /g, '');
    // clean up empty array commas
    appJsx = appJsx.replace(/allowedRoles=\{\['admin', 'team_leader', 'judge', \]\}/g, "allowedRoles={['admin', 'team_leader', 'judge']}");
    appJsx = appJsx.replace(/allowedRoles=\{\['admin', \]\}/g, "allowedRoles={['admin']}");

    fs.writeFileSync(appJsxPath, appJsx);
    console.log("Patched App.jsx");
}

// 2. Patch Sidebar.jsx
let sidebarJsxPath = 'src/components/Sidebar.jsx';
if (fs.existsSync(sidebarJsxPath)) {
    let sidebarJsx = fs.readFileSync(sidebarJsxPath, 'utf8');
    
    // We can just regex replace the volunteer check
    const volunteerNavRegex = /if\s*\(user\?\.role === 'volunteer'\)\s*\{\s*return\s*\(\s*<div.*?Volunteer Portal.*?<\/div>\s*\);\s*\}/s;
    sidebarJsx = sidebarJsx.replace(volunteerNavRegex, '');
    fs.writeFileSync(sidebarJsxPath, sidebarJsx);
    console.log("Patched Sidebar.jsx");
}

// 3. Patch UsersPage.jsx
let usersPagePath = 'src/pages/UsersPage.jsx';
if (fs.existsSync(usersPagePath)) {
    let usersPage = fs.readFileSync(usersPagePath, 'utf8');
    usersPage = usersPage.replace(/<option value="volunteer">Volunteer<\/option>\r?\n\s*/, '');
    fs.writeFileSync(usersPagePath, usersPage);
    console.log("Patched UsersPage.jsx");
}
