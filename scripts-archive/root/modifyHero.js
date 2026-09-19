const fs = require('fs');

const file = 'frontend-hudafestival-main/src/pages/HomePage.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Shapes
content = content.replace(
  'className="absolute top-10 left-10 w-32 h-32 bg-[var(--festival-yellow)] rounded-full mix-blend-multiply filter blur-2xl opacity-40"',
  'className="absolute -top-10 -left-10 w-48 h-48 md:top-10 md:left-10 md:w-32 md:h-32 bg-[var(--festival-yellow)] rounded-full mix-blend-multiply filter blur-2xl opacity-60 md:opacity-40"'
);

content = content.replace(
  'className="absolute top-40 right-10 w-48 h-48 bg-[var(--festival-teal)] rounded-full mix-blend-multiply filter blur-2xl opacity-30"',
  'className="absolute top-1/3 -right-20 w-64 h-64 md:top-40 md:right-10 md:w-48 md:h-48 bg-[var(--festival-teal)] rounded-full mix-blend-multiply filter blur-2xl opacity-50 md:opacity-30"'
);

content = content.replace(
  'className="absolute bottom-10 left-1/4 w-40 h-40 bg-[var(--festival-purple)] rounded-full mix-blend-multiply filter blur-2xl opacity-20"',
  'className="absolute -bottom-10 -left-10 w-56 h-56 md:bottom-10 md:left-1/4 md:w-40 md:h-40 bg-[var(--festival-purple)] rounded-full mix-blend-multiply filter blur-2xl opacity-40 md:opacity-20"'
);

// 2. Huge Title Stacking and size
const oldTitle = `<motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl md:text-8xl lg:text-[10rem] leading-none mb-6 relative"
            >
              <span style={{ fontFamily: 'Georgia, serif' }}>L'in</span>
              <motion.span 
                display="inline-block"
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{ fontFamily: '"Brush Script MT", "Pacifico", cursive' }} 
                className="text-[var(--festival-orange)] px-1 inline-block"
              >
                t
              </motion.span>
              <span style={{ fontFamily: 'Georgia, serif' }}>erv</span>
              <motion.span 
                display="inline-block"
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ fontFamily: '"Brush Script MT", "Pacifico", cursive' }} 
                className="text-[var(--festival-purple)] px-1 inline-block"
              >
                e
              </motion.span>
              <span style={{ fontFamily: 'Georgia, serif' }}>ntion</span>
            </motion.h1>`;

const newTitle = `<motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[5.5rem] leading-[0.85] md:text-8xl lg:text-[10rem] md:leading-none mb-6 relative flex flex-col md:block items-center"
            >
              <span className="block md:inline">
                <span style={{ fontFamily: 'Georgia, serif' }}>L'in</span>
                <motion.span 
                  display="inline-block"
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  style={{ fontFamily: '"Brush Script MT", "Pacifico", cursive' }} 
                  className="text-[var(--festival-orange)] px-1 inline-block"
                >
                  t
                </motion.span>
                <span style={{ fontFamily: 'Georgia, serif' }}>er</span>
                <span className="md:hidden">-</span>
              </span>
              <span className="block md:inline">
                <span style={{ fontFamily: 'Georgia, serif' }}>v</span>
                <motion.span 
                  display="inline-block"
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ fontFamily: '"Brush Script MT", "Pacifico", cursive' }} 
                  className="text-[var(--festival-purple)] px-1 inline-block"
                >
                  e
                </motion.span>
                <span style={{ fontFamily: 'Georgia, serif' }}>ntion</span>
              </span>
            </motion.h1>`;

content = content.replace(oldTitle, newTitle);

// 3. CTA Buttons
const oldBtns = `className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/programmes" className="px-8 py-4 bg-[var(--festival-red)] text-[var(--festival-cream)] font-bold uppercase tracking-wider text-lg hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] transition-all border-2 border-[var(--border)]">
                Explore Programmes ?
              </Link>
              <Link to="/schedule" className="px-8 py-4 bg-[var(--festival-cream)] text-[var(--festival-black)] font-bold uppercase tracking-wider text-lg hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] transition-all border-2 border-[var(--border)]">
                View Schedule
              </Link>
            </motion.div>`;

const newBtns = `className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0"
            >
              <Link to="/programmes" className="w-full sm:w-auto px-8 py-4 bg-[var(--festival-red)] text-[var(--festival-cream)] font-bold uppercase tracking-wider text-lg hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] transition-all border-2 border-[var(--border)] text-center">
                Explore Programmes ?
              </Link>
              <Link to="/schedule" className="w-full sm:w-auto px-8 py-4 bg-[var(--festival-cream)] text-[var(--festival-black)] font-bold uppercase tracking-wider text-lg hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] transition-all border-2 border-[var(--border)] text-center">
                View Schedule
              </Link>
            </motion.div>`;

content = content.replace(oldBtns, newBtns);

fs.writeFileSync(file, content);
console.log('Hero modified.');
