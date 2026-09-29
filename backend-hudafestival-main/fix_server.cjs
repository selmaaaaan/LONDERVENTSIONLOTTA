const fs = require('fs');
const file = 'C:/Users/SSU/Downloads/Huda Festival/backend-hudafestival-main/server.js';
let content = fs.readFileSync(file, 'utf8');

const target1 = `    'https://huda-festival-admin-xczf.onrender.com'`;
const target2 = `if (!origin || allowedOrigins.includes(origin)) {`;

content = content.replace(target1, target1 + `,\n    'https://YOUR-NEW-FRONTEND-DOMAIN',\n    'https://YOUR-AI-STUDIO-PREVIEW-URL'`);
content = content.replace(target2, `if (!origin || allowedOrigins.includes(origin) || (origin && origin.includes('run.app')) || (origin && origin.includes('localhost'))) {`);

fs.writeFileSync(file, content);
console.log("Replaced");
