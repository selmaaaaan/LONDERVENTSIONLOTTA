const fs = require('fs');
let c = fs.readFileSync('src/pages/result-entry/AllResultsPrintView.jsx', 'utf8');

const target = 'const sortedCategories = Object.keys(grouped).sort();';
const replace = `const order = ['BIDAYA', 'ULA', 'THANIYYAH', 'THANIYAH', 'THANAWIYYAH', 'ALIYA', 'ALIYAH', 'KULLIYYAH', 'GENERAL'];
    const sortedCategories = Object.keys(grouped).sort((a, b) => {
        let ia = order.findIndex(x => a.toUpperCase().includes(x));
        let ib = order.findIndex(x => b.toUpperCase().includes(x));
        if (ia === -1) ia = 999;
        if (ib === -1) ib = 999;
        if (ia !== ib) return ia - ib;
        return a.localeCompare(b);
    });`;

if(c.includes(target)){
    c = c.replace(target, replace);
    fs.writeFileSync('src/pages/result-entry/AllResultsPrintView.jsx', c);
    console.log("Replaced sorting logic!");
}else{
    console.log("Could not find target");
}
