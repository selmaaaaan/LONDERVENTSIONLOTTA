const mongoose = require('mongoose');
require('dotenv').config();
const Programme = require('./models/Programme');

const topicsData = [
  // Bidāyah
  { cat: "BIDĀYAH", name: "SPEECH ENG", topics: ["Prophet Muhammad: the ideal leader"] },
  { cat: "BIDĀYAH", name: "SPEECH URD", topics: ["اسلام اور ماحولیات"] },
  { cat: "BIDĀYAH", name: "SPEECH ARB", topics: ["بِرُّ الْوَالِدَيْنِ"] },
  { cat: "BIDĀYAH", name: "SPEECH MLM", topics: ["യുവത്വവും മതനിഷ്ഠയും"] },
  { cat: "BIDĀYAH", name: "CONVERSATION MLM", topics: ["AI കാലത്തെ വിശേഷങ്ങൾ"] },
  { cat: "BIDĀYAH", name: "WA'Z", topics: ["നല്ല അയൽക്കാർ"] },

  // Ūlā
  { cat: "ʾŪLĀ", name: "SPEECH ENG", topics: ["The significance of propagation", "Quran as the character of Mumin"] },
  { cat: "ʾŪLĀ", name: "CONVERSATION ENG", topics: ["Meeting a Friend After a Trip"] },
  { cat: "ʾŪLĀ", name: "CONVERSATION URD", topics: ["ہمارے کیمپس میں پہلا دن"] },
  { cat: "ʾŪLĀ", name: "SPEECH MLM", topics: ["സമൂഹ നിർമ്മിതിയിൽ ഹാദിയയുടെ ദൗത്യം", "മതസൗഹാർദ്ദത്തിന്റെ ഇസ്ലാമിക മാതൃകകൾ"] },
  { cat: "ʾŪLĀ", name: "WA'Z", topics: ["ധൂർത്ത് പൈശാചികമാണ്", "ലഹരിയിൽ തകരുന്ന തലമുറ"] },
  { cat: "ʾŪLĀ", name: "SPEECH ARB", topics: ["نماذج حب الصحابة للنبي ﷺ", "الإسلام دين التسامح"] },
  { cat: "ʾŪLĀ", name: "CONVERSATION ARB", topics: ["لقاء المتنافسين في المسابقة"] },
  { cat: "ʾŪLĀ", name: "SPEECH URD", topics: ["زبان کی حفاظت", "والدین کی خدمت کی اہمیت"] },

  // Thāniyah
  { cat: "THĀNIYAH", name: "SPEECH ENG", topics: ["Islamic teachings for poverty eradication", "Art and Islam"] },
  { cat: "THĀNIYAH", name: "HISTORY TALK ENG", topics: [
    "The Hijrah to Madinah",
    "The Conquest of Makkah (Fath Makkah)",
    "The Battle of Badr",
    "The Battle of Yarmouk (636 CE)",
    "The Conquest of Al-Andalus",
    "The Battle of Mu'tah (629 CE)",
    "The Battle of Nihavand (642 CE)",
    "The Ottoman Conquest of Constantinople (1453 CE)"
  ] },
  { cat: "THĀNIYAH", name: "WA'Z", topics: ["ഇബിലീസ് മനുഷ്യവംശത്തിന്റെ ശത്രു", "മഹത്തുക്കളുടെ രാത്രികൾ"] },
  { cat: "THĀNIYAH", name: "SPEECH MLM", topics: ["അമേരിക്കയുടെ അഭിനവ അധിനിവേശങ്ങൾ", "ഇസ്ലാമോഫോബിയ: നിർമ്മിത നുണകളും യാഥാർത്ഥ്യങ്ങളും"] },
  { cat: "THĀNIYAH", name: "SPEECH ARB", topics: ["الفتن الرقمية وكيف نحمي أنفسنا", "دور الصوفية في نشر الإسلام"] },
  { cat: "THĀNIYAH", name: "SPEECH URD", topics: ["وقت کی قدر کرو", "غصہ تباہ کن ہے"] },

  // Thanawiyyah
  { cat: "THĀNAWIYYAH", name: "INSPIRING TALK ENG", topics: [
    "The wonderful effect of gratitude",
    "The extraordinary strength of teamwork",
    "Stay focussed in distracted world",
    "Readers of today, leaders of tomorrow",
    "The art of productive failure",
    "The art of offline happiness",
    "The 'what will people say' trap",
    "The power of staying calm under pressure"
  ] },
  { cat: "THĀNAWIYYAH", name: "SPEECH ARB", topics: ["إسهامات علماء كيرلا للأدب العربي", "إسهامات الصوفيين في نشر الإسلام في الهند"] },
  { cat: "THĀNAWIYYAH", name: "SPEECH URD", topics: ["تعلیم کے باوجود بے سکونی کیوں", "دین سے دوری اور ذہنی پریشانیاں"] },
  { cat: "THĀNAWIYYAH", name: "WA'Z", topics: ["മക്കൾ നന്മയുടെ പൂക്കൾ", "സ്ത്രീ കുടുംബത്തിന്റെ വിളക്ക്"] },

  // Aliyah
  { cat: "ʿĀLIYAH", name: "WA'Z", topics: ["വിരൽ തുമ്പിലെ ലോകം", "ആരോഗ്യം, അമൂല്യമാണ് അനുഗ്രഹം"] },
  { cat: "ʿĀLIYAH", name: "ACADEMIC TALK ENGLISH", topics: [
    "Have 20th century reformist movements within islam been more useful or harmful to islam?",
    "Is the contemporary islamic banking actually islamic?",
    "Is islamic khilafat going to come back in near future?",
    "Was islamisation of knowledge a successful project?",
    "Was arab nationalism mostly helpful to islam or harmful?",
    "Is an islamic communism/socialism possible?",
    "Was/is islamic republic of Iran saviour of muslim umma?",
    "Is \"islamic philosophy\" possible? Has there ever been an \"Islamic philosophy\""
  ] },
  { cat: "ʿĀLIYAH", name: "POLITICAL SATIRE MLM", topics: [
    "മുഖ്യമന്ത്രിയുടെ കസേരക്കളി: ഓടുന്നവർ വീഴും നില്ക്കുന്നവർ ഭരിക്കും",
    "നീറ്റ് അത്ര 'നീറ്റല്ല': ചോർന്ന പേപ്പറും തകർന്ന സ്വപ്നങ്ങളും.",
    "മാസ് എൻട്രിയും ഫ്ലോപ്പ് പോളിസിയും: സോഷ്യൽ മീഡിയ മുഖ്യമന്ത്രിമാർ.",
    "പാറ്റാ റിപ്പബ്ലിക്കിന്റെ ഉദയം.",
    "പ്രിയദർശിനി യാത്ര തുടരുന്നു",
    "ജോസഫ് വിജയ് എന്ന ഞാൻ: കഥ, തിരക്കഥ, ഭരണമാറ്റം.",
    "പിണറായി 2.0: മുന്നറിയിപ്പുകൾ പലതാണ്, മാറ്റം എവിടെ?",
    "ദീദിയുടെ ഡബിൾ സ്പീഡ്: കേട്ടാൽ വിറയ്ക്കും, കണ്ടാൽ ചിരിക്കും.",
    "വിലക്കയറ്റം ഫെസ്റ്റിവൽ: ജനങ്ങൾക്ക് 'സൗജന്യ' പട്ടിണി.",
    "കൂറുമാറ്റം പ്രൈവറ്റ് ലിമിറ്റഡ്: രാവിലത്തെ ചമയൻ, വൈകുന്നേരത്തെ കാവി."
  ] }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hudafestival').then(async () => {
    let matchedCount = 0;
    
    // First, reset all programmes topicMode to 'none' just in case
    await Programme.updateMany({}, { $set: { topicMode: 'none', topicList: [] } });

    for (const data of topicsData) {
        // Try exact match first
        let prog = await Programme.findOne({ category: data.cat, name: data.name });
        
        // If exact match fails, try case-insensitive regex
        if (!prog) {
            prog = await Programme.findOne({ 
                category: data.cat, 
                name: new RegExp('^' + data.name + '$', 'i') 
            });
        }
        
        // If still fails, maybe some parts are slightly different, like "ENG" vs "ENGLISH"
        if (!prog) {
            let altName = data.name.replace('ENG', 'ENGLISH');
            if (altName !== data.name) {
                prog = await Programme.findOne({ category: data.cat, name: new RegExp('^' + altName + '$', 'i') });
            }
        }
        if (!prog) {
            let altName = data.name.replace('ENGLISH', 'ENG');
            if (altName !== data.name) {
                prog = await Programme.findOne({ category: data.cat, name: new RegExp('^' + altName + '$', 'i') });
            }
        }
        // Try replacing MLM with MALAYALAM or vice versa
        if (!prog) {
            let altName = data.name.replace('MLM', 'MALAYALAM');
            if (altName !== data.name) {
                prog = await Programme.findOne({ category: data.cat, name: new RegExp('^' + altName + '$', 'i') });
            }
        }

        if (prog) {
            prog.topicMode = 'fixed-list';
            prog.topicList = data.topics;
            await prog.save();
            matchedCount++;
            console.log("Updated: " + data.cat + " - " + data.name);
        } else {
            console.log("NOT FOUND: " + data.cat + " - " + data.name);
        }
    }
    
    console.log("Done! Matched " + matchedCount + " out of " + topicsData.length + " programmes.");
    process.exit(0);
});
