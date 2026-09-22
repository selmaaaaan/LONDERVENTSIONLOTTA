const fs = require('fs');
const p = '../admin-hudafestival-main/src/pages/result-entry/BatchPrintView.jsx';
let content = fs.readFileSync(p, 'utf8');

const target = `                        </div>
                    </div>
                </div>
            </div>
            
            <div className="!text-black fixed bottom-4 right-4 print:hidden">`;

const replacement = `                        </div>
                    </div>
                </div>
            </div>

            <div className="break-before-page pt-12 pb-8 px-8 w-[210mm] mx-auto bg-white min-h-[297mm]">
                <div className="border-b-4 border-black pb-4 mb-8">
                    <h2 className="text-3xl font-black uppercase tracking-tight !text-black text-center">FESTIVAL STANDINGS AFTER THIS BATCH</h2>
                    <p className="text-center font-bold text-gray-500 mt-2 uppercase tracking-widest">Cumulative Grand Total</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    {leaderboard.map((team, idx) => (
                        <div key={team.teamId} className="flex items-center p-6 border-2 border-gray-200 bg-gray-50 rounded-2xl gap-6" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', backgroundColor: '#f9fafb' }}>
                            <div className="flex-shrink-0 text-4xl font-black text-gray-300 w-16 text-center">#{idx + 1}</div>
                            <div className="flex-grow">
                                <div className="font-black uppercase !text-black text-2xl tracking-tight">{team.teamName}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-black !text-black text-4xl">{team.points}</div>
                                <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Total Points</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="!text-black fixed bottom-4 right-4 print:hidden">`;

content = content.replace(target, replacement);
fs.writeFileSync(p, content);
console.log("Patched BatchPrintView.jsx with Grand Total");
