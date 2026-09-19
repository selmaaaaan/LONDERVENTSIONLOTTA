const fs = require('fs');

const file = 'admin-hudafestival-main/src/pages/JurySlipsPage.jsx';
let content = fs.readFileSync(file, 'utf8');

const startMarker = "{/* Building Illustration Placeholder */}";
const endMarker = "</div>\n                      </div>\n              \n                      {/* Info Grid */}";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.log("Markers not found");
    process.exit(1);
}

const replacement = `{/* Building Illustration Placeholder */}
                        <div className="w-64 h-24 -mt-2 -mr-2 relative flex justify-end shrink-0 overflow-hidden">
                          <img src="/academy-building.jpg" alt="Academy Building" className="w-full h-full object-cover object-center mix-blend-multiply" style={{ filter: 'grayscale(100%)' }} />
                        `;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(file, newContent);
console.log("Image updated");
