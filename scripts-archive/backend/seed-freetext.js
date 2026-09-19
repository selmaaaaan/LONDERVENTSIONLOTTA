const mongoose = require('mongoose');
require('dotenv').config();
const Programme = require('./models/Programme');

const freeTextProgrammes = [
  // BIDĀYAH
  { cat: "BIDĀYAH", name: "GROUP SONG" },
  { cat: "BIDĀYAH", name: "KADHAKADHANAM" },
  { cat: "BIDĀYAH", name: "SONG ARB" },
  { cat: "BIDĀYAH", name: "SONG MLM" },
  { cat: "BIDĀYAH", name: "SONG URD" },
  { cat: "BIDĀYAH", name: "SPEECH & SONG MLM" },

  // ʾŪLĀ
  { cat: "ʾŪLĀ", name: "GROUP SONG" },
  { cat: "ʾŪLĀ", name: "SONG MLM" },
  { cat: "ʾŪLĀ", name: "SONG ENG" },
  { cat: "ʾŪLĀ", name: "SONG URD" },
  { cat: "ʾŪLĀ", name: "SONG ARB" },
  { cat: "ʾŪLĀ", name: "SPEECH & SONG MALAYALAM" },
  { cat: "ʾŪLĀ", name: "PADHYAPARAYANAM" },
  { cat: "ʾŪLĀ", name: "STORY NARRATION ENGLISH" },

  // THĀNIYAH
  { cat: "THĀNIYAH", name: "HISTORY TALK ENGLISH" }, // already fixed-list probably
  { cat: "THĀNIYAH", name: "BHAKTHI GANAM" },
  { cat: "THĀNIYAH", name: "SONG ARB" },
  { cat: "THĀNIYAH", name: "SONG ENG" },
  { cat: "THĀNIYAH", name: "SONG URD" },
  { cat: "THĀNIYAH", name: "SPEECH & SONG MALAYALAM" },
  { cat: "THĀNIYAH", name: "PADHYAPARAYANAM" },
  { cat: "THĀNIYAH", name: "GROUP SONG" },
  { cat: "THĀNIYAH", name: "PADAPATTU" },

  // THĀNAWIYYAH
  { cat: "THĀNAWIYYAH", name: "PADAPPATTU" },
  { cat: "THĀNAWIYYAH", name: "NASHĪD ARB" },
  { cat: "THĀNAWIYYAH", name: "SONG URD" },
  { cat: "THĀNAWIYYAH", name: "INSPIRING TALK ENG" }, // already fixed-list
  { cat: "THĀNAWIYYAH", name: "TADRIS MLM" },

  // ʿĀLIYAH
  { cat: "ʿĀLIYAH", name: "KHUṬBAH" },
  { cat: "ʿĀLIYAH", name: "MAPPILAPPATTU" },
  { cat: "ʿĀLIYAH", name: "NASHĪD ARB" },
  { cat: "ʿĀLIYAH", name: "GAZAL" },
  { cat: "ʿĀLIYAH", name: "LECTURING ENG" },
  { cat: "ʿĀLIYAH", name: "PADAPPATTU" },
  { cat: "ʿĀLIYAH", name: "ACADEMIC TALK ENG" }, // already fixed-list
  { cat: "ʿĀLIYAH", name: "RJ TALKS" },
  { cat: "ʿĀLIYAH", name: "POLITICAL SATIRE MLM" } // already fixed-list
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hudafestival').then(async () => {
    let matchedCount = 0;
    
    // NOTE: We do NOT reset all programmes to 'none' here, because we want to preserve 'fixed-list'

    for (const data of freeTextProgrammes) {
        // Build regexes for typical variations
        // Normalize names: replace "MALAYALAM" with "MLM", remove special chars, etc.
        let namesToTry = [
            data.name,
            data.name.replace('MALAYALAM', 'MLM'),
            data.name.replace('MLM', 'MALAYALAM'),
            data.name.replace('ENGLISH', 'ENG'),
            data.name.replace('ENG', 'ENGLISH'),
            data.name.replace('NASHĪD', 'NASHID').replace('NASHEED', 'NASHID'),
            data.name.replace('KHUṬBAH', 'KHUTBAH'),
            data.name.replace('&', 'AND')
        ];

        let prog = null;
        for (const name of namesToTry) {
            prog = await Programme.findOne({ 
                category: data.cat, 
                name: new RegExp('^' + name.replace(/[.*+?^$\{key\}()|[\\]\\\\]/g, '\\\\$&') + '$', 'i') 
            });
            if (prog) break;
            
            // Try without spaces around '&' if it has one
            if (name.includes('&')) {
                let compactAnd = name.replace(/\s*&\s*/g, ' & ');
                prog = await Programme.findOne({ category: data.cat, name: new RegExp('^' + compactAnd + '$', 'i') });
                if (prog) break;
            }
        }
        
        // Try fallback for KHUTBAH / NASHID etc
        if (!prog) {
            let sanitized = data.name.replace(/[^A-Za-z ]/g, ''); // strip unicode dots
            prog = await Programme.findOne({ category: data.cat, name: new RegExp(sanitized, 'i') });
        }

        if (prog) {
            if (prog.topicMode === 'fixed-list') {
                console.log("SKIPPED (Already fixed-list): " + data.cat + " - " + prog.name);
            } else {
                prog.topicMode = 'free-text';
                await prog.save();
                matchedCount++;
                console.log("UPDATED to free-text: " + data.cat + " - " + prog.name);
            }
        } else {
            console.log("NOT FOUND: " + data.cat + " - " + data.name);
        }
    }
    
    console.log("Done! Updated " + matchedCount + " programmes to free-text.");
    process.exit(0);
});
