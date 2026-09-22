const fs = require('fs');
const p = '../admin-hudafestival-main/src/pages/result-entry/BatchPrintView.jsx';
let content = fs.readFileSync(p, 'utf8');

const target = `                const res = await api.get(\`/result-entry/batches/\${id}\`);
                setBatch(res.data.batch);
                setLeaderboard(res.data.leaderboard || []);
                setOverallToppers(res.data.overallToppers || []);
                setCategoryToppers(res.data.categoryToppers || {});
                setBatchResults(res.data.batchResults || []);`;

const replacement = `                const [batchRes, projRes] = await Promise.all([
                    api.get(\`/result-entry/batches/\${id}\`),
                    api.get(\`/result-entry/batches/\${id}/projection\`)
                ]);
                
                setBatch(batchRes.data.batch);
                setBatchResults(batchRes.data.batchResults || []);
                
                setLeaderboard(projRes.data.leaderboard || []);
                setOverallToppers(projRes.data.overallToppers || []);
                setCategoryToppers(projRes.data.categoryToppers || {});`;

content = content.replace(target, replacement);
fs.writeFileSync(p, content);
console.log("Patched BatchPrintView.jsx fetch");
