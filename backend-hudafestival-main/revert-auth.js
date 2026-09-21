const fs = require('fs');

let content = fs.readFileSync('controllers/authController.js', 'utf8');

const regex = /const user = await User.findOne\(\{ userName \}\); let matchResult = false; if \(user\) \{ matchResult = await user.matchPassword\(password\); \} require\("fs"\).appendFileSync\("debug.log", `DEBUG LOGIN ->.*?\); console.log\(`DEBUG LOGIN ->.*?\); if \(user && matchResult\) \{/s;

content = content.replace(regex, `const user = await User.findOne({ userName });
        if (user && (await user.matchPassword(password))) {`);

fs.writeFileSync('controllers/authController.js', content);
