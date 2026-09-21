const fs = require('fs');

let content = fs.readFileSync('controllers/authController.js', 'utf8');

const oldBlock = `    try {
        const user = await User.findOne({ userName });
        if (user && (await user.matchPassword(password))) {`;

const newBlock = `    try {
        const user = await User.findOne({ userName });
        
        let matchResult = false;
        if (user) {
            matchResult = await user.matchPassword(password);
        }
        
        console.log(\`DEBUG LOGIN -> req.userName: \${userName}, userFound: \${!!user}, dbRole: \${user ? user.role : 'N/A'}, dbUserName: \${user ? user.userName : 'N/A'}, matchPassword: \${matchResult}\`);
        
        if (user && matchResult) {`;

content = content.replace(oldBlock, newBlock);

fs.writeFileSync('controllers/authController.js', content);
console.log("Patched authController.js with debug logs");
