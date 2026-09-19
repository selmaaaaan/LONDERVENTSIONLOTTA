const fs = require('fs');
const file = 'frontend-hudafestival-main/src/components/layout/Navbar.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldMobileMenu = `<div className="flex-1 flex flex-col justify-center gap-6">
                            <Link to="/" onClick={() => setMobileOpen(false)} className="text-4xl font-black font-display uppercase hover:text-[var(--festival-red)] transition-colors">Home</Link>
                            {LINKS.map(link => (
                                <Link 
                                    key={link.to} 
                                    to={link.to} 
                                    onClick={() => setMobileOpen(false)}
                                    className="text-4xl font-black font-display uppercase hover:text-[var(--festival-teal)] transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link to="/search" onClick={() => setMobileOpen(false)} className="text-4xl font-black font-display uppercase hover:text-[var(--festival-orange)] transition-colors">Search</Link>
                        </div>`;

const newMobileMenu = `<div className="flex-1 flex flex-col justify-center gap-4 mt-8">
                            {[
                                { to: '/', label: 'Home', color: 'var(--festival-red)' },
                                ...LINKS.map((l, i) => ({ ...l, color: ['var(--festival-teal)', 'var(--festival-purple)', 'var(--festival-orange)'][i % 3] })),
                                { to: '/search', label: 'Search', color: 'var(--festival-yellow)' }
                            ].map((link, i) => (
                                <Link 
                                    key={link.to} 
                                    to={link.to} 
                                    onClick={() => setMobileOpen(false)}
                                    className="group relative flex items-center justify-between p-4 border-2 border-[var(--border)] shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] bg-[var(--festival-cream)] active:translate-y-1 active:shadow-none transition-all overflow-hidden"
                                >
                                    <div className="absolute inset-0 w-3 h-full transition-all group-active:w-full group-hover:w-full" style={{ backgroundColor: link.color }} />
                                    <span className="text-3xl font-black font-display uppercase pl-6 z-10 group-active:text-[var(--festival-cream)] group-hover:text-[var(--festival-cream)] transition-colors">{link.label}</span>
                                    <span className="text-2xl font-black z-10 group-active:text-[var(--festival-cream)] group-hover:text-[var(--festival-cream)] transition-colors">&rarr;</span>
                                </Link>
                            ))}
                        </div>`;

if (content.includes('gap-6">')) {
    content = content.replace(oldMobileMenu, newMobileMenu);
    fs.writeFileSync(file, content);
    console.log('Mobile menu updated.');
} else {
    console.log('Mobile menu old content not found.');
}
