const fs = require('fs');
let c = fs.readFileSync('src/services/api.js', 'utf8');

const regex = /const API_URL = import.meta.env.VITE_API_URL;\s*const api = axios.create\(\{\s*baseURL: import.meta.env.VITE_API_URL\s*\}\);/;

const replacement = `let baseURL = import.meta.env.VITE_API_URL || '';
if (baseURL && baseURL.startsWith('http') && !baseURL.endsWith('/api')) {
  baseURL = baseURL.replace(/\\/$/, '') + '/api';
}

const api = axios.create({
  baseURL
});`;

c = c.replace(regex, replacement);

fs.writeFileSync('src/services/api.js', c);
console.log("api.js route matching patched");
