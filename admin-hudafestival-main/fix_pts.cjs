const fs = require('fs');
let c = fs.readFileSync('src/pages/result-entry/AllResultsPrintView.jsx', 'utf8');
const target = `<span className="font-black text-lg">{res.totalPoints} <span className="text-[10px] text-gray-500 font-bold">PTS</span></span>`;
if(c.includes(target)){
    c = c.replace(target, '');
    fs.writeFileSync('src/pages/result-entry/AllResultsPrintView.jsx', c);
    console.log("Points removed from AllResultsPrintView");
} else {
    console.log("Could not find points in AllResultsPrintView");
}
