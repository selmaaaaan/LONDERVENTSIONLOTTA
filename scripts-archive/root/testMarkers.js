const fs = require('fs');

const file = 'admin-hudafestival-main/src/pages/JurySlipsPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// We need to replace the entire {/* Printable Area */} section.
// Let's find its start and end.
const startMarker = "{/* Printable Area */}";
const startIndex = content.indexOf(startMarker);

// The printable area ends before {/* Warning Popup */}
const endMarker = "{/* Warning Popup */}";
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    console.log('Found markers.');
} else {
    console.log('Markers not found!');
}
