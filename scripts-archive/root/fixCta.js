const fs = require('fs');
const file = 'frontend-hudafestival-main/src/pages/HomePage.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /className="flex flex-col sm:flex-row gap-4"\s*>\s*<Link to="\/programmes" className="([^"]+)">\s*([^<]+)\s*<\/Link>\s*<Link to="\/schedule" className="([^"]+)">\s*([^<]+)\s*<\/Link>\s*<\/motion.div>/,
  `className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0"
            >
              <Link to="/programmes" className="$1 w-full sm:w-auto text-center">
                $2
              </Link>
              <Link to="/schedule" className="$3 w-full sm:w-auto text-center">
                $4
              </Link>
            </motion.div>`
);

fs.writeFileSync(file, content);
console.log('Fixed CTA');
