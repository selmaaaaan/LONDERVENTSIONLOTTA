const fs = require('fs');

function updatePagePadding(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/py-24/g, 'pt-32 pb-16 md:pt-40 md:pb-24');
    fs.writeFileSync(file, content);
    console.log('Updated padding in ' + file);
}

updatePagePadding('frontend-hudafestival-main/src/pages/ProgrammeListPage.jsx');
updatePagePadding('frontend-hudafestival-main/src/pages/SchedulePage.jsx');
updatePagePadding('frontend-hudafestival-main/src/pages/ResultPage.jsx');
updatePagePadding('frontend-hudafestival-main/src/pages/GalleryPage.jsx');
updatePagePadding('frontend-hudafestival-main/src/pages/LeaderboardsPage.jsx');
