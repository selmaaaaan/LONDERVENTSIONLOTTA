const fs = require('fs');

let p = 'routes/allResultsRoutes.js';
let text = fs.readFileSync(p, 'utf8');

// The route looks like:
// // @desc    Get current judge's submitted results
// // @route   GET /api/results/my-submissions
// // @access  Private/Judge
// router.get('/my-submissions', protect, async (req, res) => {
//     ...
// });

let startStr = "// @desc    Get current judge's submitted results";
let endStr = "});\n\n// @desc    Delete a single result";

let startIndex = text.indexOf(startStr);
let endIndex = text.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
    let toKeep = text.substring(0, startIndex) + text.substring(endIndex + "});\n\n".length);
    fs.writeFileSync(p, toKeep);
}
console.log("Fixed allResultsRoutes");
