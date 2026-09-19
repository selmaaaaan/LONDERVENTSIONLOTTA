require('dotenv').config();
const mongoose = require('mongoose');
const Programme = require('./models/Programme');

const data = `
Ūlā
Speech Eng
•	The significance of propagation
•	Quran as the character of Mumin
Conversation Eng
•	Meeting a Friend After a Trip
Conversation URD
•	ہمارے کیمپس میں پہلا دن
Speech MLM
•	സമൂഹ നിർമ്മിതിയിൽ ഹാദിയയുടെ ദൗത്യം
•	മതസൗഹാർദ്ദത്തിന്റെ ഇസ്ലാമിക മാതൃകകൾ
Wa'z
•	ധൂർത്ത് പൈശാചികമാണ്
•	ലഹരിയിൽ തകരുന്ന തലമുറ
Speech Arb
•	نماذج حب الصحابة للنبي ﷺ
•	الإسلام دين التسامح
Conversation Arb
•	لقاء المتنافسين في المسابقة
Speech Urd
•	زبان کی حفاظت
•	والدین کی خدمت کی اہمیت
Aliyah
Wa'z
•	വിരൽ തുമ്പിലെ ലോകം
•	ആരോഗ്യം, അമൂല്യമാണ് അനുഗ്രഹം
Academic Talk English
•	Have 20th century reformist movements within islam been more useful or harmful to islam?
•	Is the contemporary islamic banking actually islamic?
•	Is islamic khilafat going to come back in near future?
•	Was islamisation of knowledge a successful project?
•	Was arab nationalism mostly helpful to islam or harmful?
•	Is an islamic communism/socialism possible?
•	Was/is islamic republic of Iran saviour of muslim umma? 
•	Is "islamic philosophy" possible? Has there ever been an "Islamic philosophy"
Political Satire (Malayalam)
•	 മുഖ്യമന്ത്രിയുടെ കസേരക്കളി: ഓടുന്നവർ വീഴും         നില്ക്കുന്നവർ ഭരിക്കും
•	നീറ്റ് അത്ര 'നീറ്റല്ല': ചോർന്ന പേപ്പറും തകർന്ന സ്വപ്നങ്ങളും.
•	 മാസ് എൻട്രിയും ഫ്ലോപ്പ് പോളിസിയും: സോഷ്യൽ മീഡിയ മുഖ്യമന്ത്രിമാർ.
•	പാറ്റാ റിപ്പബ്ലിക്കിന്റെ ഉദയം.
•	പ്രിയദർശിനി യാത്ര തുടരുന്നു
•	ജോസഫ് വിജയ് എന്ന ഞാൻ: കഥ, തിരക്കഥ, ഭരണമാറ്റം.
•	പിണറായി 2.0: മുന്നറിയിപ്പുകൾ പലതാണ്, മാറ്റം എവിടെ?
•	 ദീദിയുടെ ഡബിൾ സ്പീഡ്: കേട്ടാൽ വിറയ്ക്കും, കണ്ടാൽ ചിരിക്കും.
•	വിലക്കയറ്റം ഫെസ്റ്റിവൽ: ജനങ്ങൾക്ക് 'സൗജന്യ' പട്ടിണി.
•	കൂറുമാറ്റം പ്രൈവറ്റ് ലിമിറ്റഡ്: രാവിലത്തെ ചമയൻ, വൈകുന്നേരത്തെ കാവി.
`;

const categoryMap = {
    'Ūlā': 'ʾŪLĀ',
    'Aliyah': 'ʿĀLIYAH'
};

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    
    let currentCategory = '';
    let currentProgramme = '';
    let topics = [];

    const lines = data.split('\n').map(l => l.trim()).filter(l => l);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (categoryMap[line]) {
            await saveCurrent(currentCategory, currentProgramme, topics);
            currentCategory = categoryMap[line];
            currentProgramme = '';
            topics = [];
        } else if (line.startsWith('•')) {
            topics.push(line.replace('•', '').trim());
        } else {
            await saveCurrent(currentCategory, currentProgramme, topics);
            currentProgramme = line;
            topics = [];
        }
    }
    await saveCurrent(currentCategory, currentProgramme, topics);

    console.log('Done!');
    process.exit(0);
}

async function saveCurrent(cat, prog, tps) {
    if (!cat || !prog || tps.length === 0) return;
    
    const filter = { category: cat };
    const dbProgs = await Programme.find(filter);
    
    let p = dbProgs.find(p => p.name.toLowerCase() === prog.toLowerCase());
    if (!p) {
        p = dbProgs.find(p => p.name.toLowerCase().includes(prog.toLowerCase()) || prog.toLowerCase().includes(p.name.toLowerCase()));
    }
    if (!p) {
        // try without spaces
        const norm = (s) => s.toLowerCase().replace(/[^a-z]/g, '');
        p = dbProgs.find(p => norm(p.name) === norm(prog) || norm(p.name).includes(norm(prog)));
    }
    if (!p) {
        const norm2 = (s) => s.toLowerCase().replace(/[^a-z]/g, '').replace('malayalam', 'mlm');
        p = dbProgs.find(p => norm2(p.name) === norm2(prog) || norm2(p.name).includes(norm2(prog)));
    }
    
    if (p) {
        const isExclusive = ['history talk eng', 'inspiring talk eng', 'academic talk english', 'political satire (malayalam)'].includes(prog.toLowerCase());
        p.topicMode = isExclusive ? 'exclusive' : 'fixed';
        p.topicList = tps;
        await p.save();
        console.log(`Updated ${cat} - ${p.name} (${p.topicMode}) with ${tps.length} topics.`);
    } else {
        console.log(`COULD NOT FIND Programme: ${prog} in ${cat}`);
    }
}

run();