const fs = require('fs');
let c = fs.readFileSync('src/pages/UsersPage.jsx', 'utf8');

c = c.replace(/<div className="flex items-center justify-between mb-2">/,
`<div className="flex items-center justify-between mb-2">
        <div className="flex justify-between w-full items-center">`);

c = c.replace(/<h1 className="text-2xl font-bold text-\[var\(--color-text-heading\)\]">Users & Teams<\/h1>/,
`<h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Users & Teams</h1>
          <Button onClick={() => setResetModalOpen(true)} variant="secondary">
            Reset User Password
          </Button>
        </div>`);

fs.writeFileSync('src/pages/UsersPage.jsx', c);
console.log("Added button");
