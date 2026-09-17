const fs = require('fs');
let html = fs.readFileSync('stitch_homepage.html', 'utf8');

let styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
let styles = styleMatch ? styleMatch[1] : '';

let bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
let body = bodyMatch ? bodyMatch[1] : '';
body = body.replace(/<script[\s\S]*?<\/script>/g, '');

body = body.replace(/class="/g, 'className="');
body = body.replace(/viewbox="/g, 'viewBox="');
body = body.replace(/stroke-width="/g, 'strokeWidth="');
body = body.replace(/stroke-linecap="/g, 'strokeLinecap="');
body = body.replace(/stroke-linejoin="/g, 'strokeLinejoin="');
body = body.replace(/fill-rule="/g, 'fillRule="');
body = body.replace(/clip-rule="/g, 'clipRule="');
body = body.replace(/stroke-dasharray="/g, 'strokeDasharray="');
body = body.replace(/textpath/g, 'textPath');
body = body.replace(/startoffset/g, 'startOffset');
body = body.replace(/style="(.*?)"/g, (match, p1) => {
    let styleObj = {};
    p1.split(';').forEach(s => {
        let parts = s.split(':');
        if(parts.length === 2) {
            let key = parts[0].trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
            styleObj[key] = parts[1].trim();
        }
    });
    return 'style={' + JSON.stringify(styleObj) + '}';
});

body = body.replace(/<!--[\s\S]*?-->/g, ''); // remove comments
body = body.replace(/<img(.*?)>/g, (match, p1) => {
    if(p1.trim().endsWith('/')) return match;
    return '<img' + p1 + ' />';
});
body = body.replace(/<input(.*?)>/g, (match, p1) => {
    if(p1.trim().endsWith('/')) return match;
    return '<input' + p1 + ' />';
});
body = body.replace(/<br(.*?)>/g, (match, p1) => {
    if(p1.trim().endsWith('/')) return match;
    return '<br' + p1 + ' />';
});
body = body.replace(/<hr(.*?)>/g, (match, p1) => {
    if(p1.trim().endsWith('/')) return match;
    return '<hr' + p1 + ' />';
});

let scriptsMatch = html.match(/<script>([\s\S]*?)<\/script>/g);
let scripts = scriptsMatch ? scriptsMatch.map(s => s.replace(/<script>/g, '').replace(/<\/script>/g, '')).join('\n') : '';

fs.writeFileSync('extracted_styles.css', styles);
fs.writeFileSync('extracted_body.jsx', body);
fs.writeFileSync('extracted_scripts.js', scripts);

