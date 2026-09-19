const fs = require('fs');
let c = fs.readFileSync('src/pages/ProgrammeParticipantSearchPage.jsx', 'utf8');

c = c.replace(
    /import React, { useState, useEffect } from "react";/,
    "import React, { useState, useEffect } from \"react\";\nimport ProgrammeCodePicker from \"../components/ProgrammeCodePicker\";"
);

fs.writeFileSync('src/pages/ProgrammeParticipantSearchPage.jsx', c);
console.log("Import injected");
