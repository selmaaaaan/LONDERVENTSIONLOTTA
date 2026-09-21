const fs = require('fs');

let code = fs.readFileSync('src/components/Sidebar.jsx', 'utf8');

// Remove the Results nav item with regex to handle spaces
code = code.replace(
    /^\s*\{\s*key:\s*'results',\s*label:\s*'Results',\s*icon:\s*Trophy\s*\},\s*\n/m,
    ""
);

fs.writeFileSync('src/components/Sidebar.jsx', code);
console.log("Patched Sidebar.jsx");
