const fs = require('fs');
const p = '../admin-hudafestival-main/src/pages/result-entry/BatchPrintView.jsx';
let content = fs.readFileSync(p, 'utf8');

// Add state
content = content.replace('const [categoryToppers, setCategoryToppers] = useState({});', 'const [categoryToppers, setCategoryToppers] = useState({});\n    const [categoryTeamToppers, setCategoryTeamToppers] = useState({});');

// Set it
content = content.replace('setCategoryToppers(projRes.data.categoryToppers || {});', 'setCategoryToppers(projRes.data.categoryToppers || {});\n                setCategoryTeamToppers(projRes.data.categoryTeamToppers || {});');

// Render it
const target = `                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="break-before-page pt-12 pb-8 px-8 w-[210mm] mx-auto bg-white min-h-[297mm]">`;

const replacement = `                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 border-t-2 border-gray-100 pt-8">
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <h3 className="text-xl font-black uppercase !text-black">Category Team Leaders</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(categoryTeamToppers).map(([category, leader]) => (
                                <div key={category} className="flex items-center p-4 border-2 border-green-100 bg-green-50 rounded-xl gap-4" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', backgroundColor: '#f0fdf4', borderColor: '#dcfce7' }}>
                                    <div className="w-24 font-black uppercase text-xs tracking-wider !text-black leading-tight">{category}</div>
                                    <div className="flex-grow border-l-2 pl-4 border-green-200" style={{ borderColor: '#bbf7d0' }}>
                                        <div className="font-black !text-black text-lg uppercase">{leader.teamName}</div>
                                    </div>
                                    <div className="text-right font-black !text-black text-xl whitespace-nowrap">
                                        {leader.points} <span className="text-[10px] text-gray-500">PTS</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="break-before-page pt-12 pb-8 px-8 w-[210mm] mx-auto bg-white min-h-[297mm]">`;

content = content.replace(target, replacement);
fs.writeFileSync(p, content);
console.log('BatchPrintView patched for categoryTeamToppers');
