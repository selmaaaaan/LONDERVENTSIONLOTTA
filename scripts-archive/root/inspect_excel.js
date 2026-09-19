const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'SHIA ARTS FEST 2026.xlsx');
const workbook = XLSX.readFile(filePath);
let output = '';

function log(s) { output += s + '\n'; }

// ============ PROGRAM_DIRECTORY deep dive ============
const pd = workbook.Sheets['PROGRAM_DIRECTORY'];
const pdData = XLSX.utils.sheet_to_json(pd);

log('========== PROGRAM_DIRECTORY ==========');
log(`Total programs: ${pdData.length}`);

// Count by category
const catCount = {};
const typeCount = {};
const formatCount = {};
const eligibleCats = new Set();

for (const p of pdData) {
  catCount[p.Category] = (catCount[p.Category] || 0) + 1;
  typeCount[p.Type] = (typeCount[p.Type] || 0) + 1;
  formatCount[p.Format] = (formatCount[p.Format] || 0) + 1;
  if (p['Eligible Category']) eligibleCats.add(p['Eligible Category']);
}

log('\nPrograms by Category:');
log(JSON.stringify(catCount, null, 2));
log('\nPrograms by Type:');
log(JSON.stringify(typeCount, null, 2));
log('\nPrograms by Format:');
log(JSON.stringify(formatCount, null, 2));
log('\nUnique Eligible Categories:');
log(JSON.stringify([...eligibleCats].sort(), null, 2));

// Show all unique quotas
const quotas = new Set();
for (const p of pdData) { quotas.add(String(p.Quota)); }
log('\nUnique Quota values:');
log(JSON.stringify([...quotas].sort(), null, 2));

// Group sizes
const groupSizes = new Set();
for (const p of pdData) { groupSizes.add(String(p['Group Size'])); }
log('\nUnique Group Size values:');
log(JSON.stringify([...groupSizes].sort(), null, 2));

// Sample program entries from each category
log('\n--- Sample programs per category ---');
for (const cat of Object.keys(catCount)) {
  const samples = pdData.filter(p => p.Category === cat).slice(0, 3);
  log(`\n${cat}:`);
  for (const s of samples) {
    log(JSON.stringify(s));
  }
}

// ============ TEAM sheet deep dive ============
const teamSheet = workbook.Sheets['TEAM'];
const teamData = XLSX.utils.sheet_to_json(teamSheet);

log('\n\n========== TEAM DATA ==========');
log(`Total students: ${teamData.length}`);

const teamCount = {};
const catByTeam = {};
const classByTeam = {};

for (const s of teamData) {
  const team = s.TEAM;
  const cat = s.CATEGARY;
  teamCount[team] = (teamCount[team] || 0) + 1;
  
  if (!catByTeam[team]) catByTeam[team] = {};
  catByTeam[team][cat] = (catByTeam[team][cat] || 0) + 1;
}

log('\nStudents per team:');
log(JSON.stringify(teamCount, null, 2));

log('\nStudents per team per category:');
log(JSON.stringify(catByTeam, null, 2));

// ============ MASTER LIST deep dive ============
const mlSheet = workbook.Sheets['MASTER LIST'];
const mlData = XLSX.utils.sheet_to_json(mlSheet, { header: 1 });

log('\n\n========== MASTER LIST ==========');
log(`Total rows (incl header): ${mlData.length}`);
log('Headers: ' + JSON.stringify(mlData[0]));

// Check if any student has actual registrations
let studentsWithRegs = 0;
for (let i = 1; i < mlData.length; i++) {
  const row = mlData[i];
  // REG columns start at index 13
  let hasReg = false;
  for (let j = 13; j < 28; j++) {
    if (row[j] && row[j] !== '') hasReg = true;
  }
  if (hasReg) studentsWithRegs++;
}
log(`Students with registrations: ${studentsWithRegs}`);

// Unique bylaw statuses
const bylawStatuses = new Set();
for (let i = 1; i < mlData.length; i++) {
  const row = mlData[i];
  if (row[12]) bylawStatuses.add(row[12]);
}
log('\nUnique Bylaw Statuses:');
log(JSON.stringify([...bylawStatuses], null, 2));

// ============ REGISTRATION_DESK deep dive ============
const rdSheet = workbook.Sheets['REGISTRATION_DESK'];
const rdData = XLSX.utils.sheet_to_json(rdSheet, { header: 1 });

log('\n\n========== REGISTRATION_DESK ==========');
log(`Total rows: ${rdData.length}`);

// Row 1: Category selector
log('\nRow 1 (Category): ' + JSON.stringify(rdData[0].filter(x => x !== '')));
// Row 2: Program Type selector
log('Row 2 (Program Type): ' + JSON.stringify(rdData[1].filter(x => x !== '')));
// Row 3: Team selector
log('Row 3 (Team): ' + JSON.stringify(rdData[2].filter(x => x !== '')));
// Row 4: Active count
log('Row 4 (Active Count): ' + JSON.stringify(rdData[3].filter(x => x !== '')));

// Row 5: Program codes row
const progCodes = rdData[4] ? rdData[4].filter(x => x !== '') : [];
log('\nProgram codes in desk: ' + progCodes.length);
log('First 20: ' + JSON.stringify(progCodes.slice(0, 20)));
log('Last 10: ' + JSON.stringify(progCodes.slice(-10)));

// Row 6: Headers with program names
const progNames = rdData[5] ? rdData[5].slice(6).filter(x => x !== '') : [];
log('\nProgram name headers count: ' + progNames.length);

// Data rows (students)
log('\nStudent rows:');
for (let i = 6; i < Math.min(rdData.length, 10); i++) {
  const row = rdData[i];
  const studentInfo = row ? row.slice(0, 6) : [];
  log(`Row ${i+1}: ${JSON.stringify(studentInfo)}`);
}

// Check registrations in desk
let deskRegs = 0;
for (let i = 6; i < rdData.length; i++) {
  const row = rdData[i];
  if (!row) continue;
  for (let j = 6; j < row.length; j++) {
    if (row[j] && row[j] !== '' && row[j] !== 0) deskRegs++;
  }
}
log(`\nTotal non-empty registration cells in desk: ${deskRegs}`);

// ============ UNIQUE CATEGORIES ============
const allCategories = new Set();
for (const s of teamData) { allCategories.add(s.CATEGARY); }
log('\n\n========== ALL CATEGORIES ==========');
log(JSON.stringify([...allCategories].sort(), null, 2));

fs.writeFileSync(path.join(__dirname, 'excel_deep_inspection.txt'), output);
console.log('Done. See excel_deep_inspection.txt');
