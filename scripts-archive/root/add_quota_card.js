const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', 'utf8');

c = c.replace(
    'return { total, compliant, pending };',
    `const openQuotas = programmes.filter(p => p.quotaInfo?.status === 'OPEN').length;\n        return { total, compliant, pending, openQuotas };`
);

c = c.replace(
    '}, [candidates]);',
    '}, [candidates, programmes]);'
);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', c, 'utf8');
console.log("Done");