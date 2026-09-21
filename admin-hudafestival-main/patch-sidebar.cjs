const fs = require('fs');

let code = fs.readFileSync('src/components/Sidebar.jsx', 'utf8');

// Remove the Results nav item
code = code.replace(
    "    { key: 'results', label: 'Results', icon: Trophy },\n",
    ""
);

code = code.replace(
    "            results: '/results',\n",
    ""
);

fs.writeFileSync('src/components/Sidebar.jsx', code);
console.log("Patched Sidebar.jsx");
