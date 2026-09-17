import { useAlert } from '../context/AlertContext';
import React, { useState, useEffect } from 'react';
import { Printer, RefreshCw, AlertCircle, Search, Users, FileText, BarChart2, Info, Activity, Hash, Layers } from 'lucide-react';
import api from '../services/api';
import ProgrammeCodePicker from '../components/ProgrammeCodePicker';
import Button from '../components/Button';
import * as XLSX from 'xlsx';

const JurySlipsPage = () => {
  const alertAction = useAlert();

  const [programmes, setProgrammes] = useState([]);
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [shuffledList, setShuffledList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  const [mode, setMode] = useState('programme');
  const [candidateQuery, setCandidateQuery] = useState('');
  const [candidateSuggestions, setCandidateSuggestions] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateRegistrations, setCandidateRegistrations] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (mode !== 'participant') return;
    const delayDebounceFn = setTimeout(async () => {
      if (candidateQuery.length >= 2) {
        setSearchLoading(true);
        try {
          const res = await api.get(`/candidates/lookup?search=${encodeURIComponent(candidateQuery)}`);
          setCandidateSuggestions(res.data);
        } catch (e) {
          console.error(e);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setCandidateSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [candidateQuery, mode]);

  const selectCandidate = async (candidate) => {
    setSelectedCandidate(candidate);
    setCandidateQuery('');
    setCandidateSuggestions([]);
    setLoading(true);
    try {
      const res = await api.get(`/candidates/${candidate._id}/registrations`);
      setCandidateRegistrations(res.data);
    } catch (e) {
      alertAction('Failed to fetch candidate registrations');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProgrammes();
  }, []);

  const fetchProgrammes = async () => {
    try {
      const res = await api.get('/programmes');
      setProgrammes(res.data || []);
    } catch (err) {
      setError('Failed to fetch programmes');
    }
  };

  const handleLoadRegistrations = async () => {
    if (!selectedProgramme) return;
    setLoading(true);
    setError('');
    setShuffledList([]);
    try {
      // Fetch only approved registrations
      const res = await api.get(`/registrations?programme=${selectedProgramme._id}&status=approved&limit=1000`);
      if (res.data && (res.data.registrations?.length > 0 || res.data.data?.length > 0)) {
        setRegistrations(res.data.registrations || res.data.data || []);
      } else {
        setRegistrations([]);
        setShowWarning(true);
      }
    } catch (err) {
      setError('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const generateCodeLetter = (index) => {
    let letter = '';
    let temp = index;
    while (temp >= 0) {
      letter = String.fromCharCode(65 + (temp % 26)) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  };

    const handleExportCurrent = () => {
    if (shuffledList.length === 0 && registrations.length === 0) return;
    const listToExport = shuffledList.length > 0 ? shuffledList : registrations;

    // Flatten: one row per candidate
    let slNo = 0;
    const data = listToExport.flatMap((reg) =>
      (reg.candidates?.length ? reg.candidates : [{}]).map((c) => ({
        'SL.No': ++slNo,
          'Code Letter': reg.codeLetter || '',
        'Ad No': c.admissionNo || '-',
        'Name': c.name || '-',
        'Team': reg.team?.name || '-',
        'Position': '',
        'Grade': '',
        'Remarks': ''
      }))
    );

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Participants");
    XLSX.writeFile(wb, `${selectedProgramme?.name || 'Programme'}_Participants.xlsx`);
  };

  const handleExportAll = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/registrations?status=approved&limit=100000`);
      const allRegs = res.data.registrations || res.data.data || [];
      if (allRegs.length === 0) { alertAction('No approved registrations found.'); return; }

      const wb = XLSX.utils.book_new();
      const grouped = {};
      allRegs.forEach(reg => {
        if (!reg.programme) return;
        const progName = reg.programme.name;
        if (!grouped[progName]) grouped[progName] = [];
        grouped[progName].push(reg);
      });

      Object.keys(grouped).forEach(progName => {
        let progRegs = grouped[progName];
        progRegs.sort((a, b) => {
          const teamA = a.team?.name || '';
          const teamB = b.team?.name || '';
          return teamA.localeCompare(teamB);
        });

        progRegs = progRegs.map((reg, index) => {
           let letter = '';
           let temp = index;
           while (temp >= 0) {
             letter = String.fromCharCode(65 + (temp % 26)) + letter;
             temp = Math.floor(temp / 26) - 1;
           }
           return { ...reg, codeLetter: letter };
        });

        let slNoAll = 0;
        const data = progRegs.flatMap((reg) =>
          (reg.candidates?.length ? reg.candidates : [{}]).map((c) => ({
            'SL.No': ++slNoAll,
              'Code Letter': reg.codeLetter || '',
            'Ad No': c.admissionNo || '-',
            'Name': c.name || '-',
            'Team': reg.team?.name || '-',
            'Position': '',
            'Grade': '',
            'Remarks': ''
          }))
        );

        const ws = XLSX.utils.json_to_sheet(data);
        let safeSheetName = progName.substring(0, 31).replace(/[\\/?*\[\]]/g, '');
        let uniqueName = safeSheetName;
        let counter = 1;
        while(wb.SheetNames.includes(uniqueName)) {
            uniqueName = safeSheetName.substring(0, 28) + '(' + counter + ')';
            counter++;
        }
        XLSX.utils.book_append_sheet(wb, ws, uniqueName);
      });
      XLSX.writeFile(wb, "All_Programmes_Participants.xlsx");
    } catch (err) {
      console.error(err);
      alertAction('Failed to export all programmes');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    if (registrations.length === 0) return;
    // Shuffle the registrations
    const shuffled = [...registrations].sort((a, b) => {
      const teamA = a.team?.name || '';
      const teamB = b.team?.name || '';
      return teamA.localeCompare(teamB);
    });

    // Assign code letters
    const assigned = shuffled.map((reg, index) => ({
      ...reg,
      codeLetter: generateCodeLetter(index)
    }));

    // Sort alphabetically by code letter so the printed list is in order A, B, C...
    assigned.sort((a, b) => a.codeLetter.localeCompare(b.codeLetter));
    
    setShuffledList(assigned);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 w-full space-y-8">
      {/* Controls (Hidden on Print) */}
      <div className="print:hidden space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Participant Directory</h1>
          </div>

          <div className="flex bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-1 w-fit">
            <button
              onClick={() => setMode('programme')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'programme' ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
            >
              Search by Programme
            </button>
            <button
              onClick={() => setMode('participant')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'participant' ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
            >
              Search by Participant
            </button>
          </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {mode === 'programme' ? (
<>
<div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--color-text-heading)]">1. Select Programme</h2>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full max-w-md">
              <ProgrammeCodePicker 
                programmes={programmes}
                value={selectedProgramme?._id}
                onSelect={setSelectedProgramme}
              />
            </div>
            <Button onClick={handleLoadRegistrations} variant="primary" loading={loading}>
              <Search size={16} className="mr-2" /> Load Candidates
            </Button>
          </div>
        </div>

        {registrations.length > 0 && shuffledList.length === 0 && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-2">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text-heading)]">{registrations.reduce((s, r) => s + (r.candidates?.length || 1), 0)} Candidates Found ({registrations.length} registrations)</h3>
            <p className="text-[var(--color-text-muted)] max-w-md mx-auto">
              Click the button below to generate the participant list grouped by team.
            </p>
            <Button onClick={handleGenerate} variant="primary" className="mx-auto">
              <RefreshCw size={18} className="mr-2" /> Generate List
            </Button>
          </div>
        )}

        {shuffledList.length > 0 && (
          <div className="flex justify-end gap-3 mt-4">
             <Button onClick={handleGenerate} variant="outline">
               <RefreshCw size={16} className="mr-2" /> Refresh
             </Button>
             <Button onClick={handlePrint} variant="primary">
               <Printer size={16} className="mr-2" /> Print Participant List
             </Button>
          </div>
        )}
</>

          ) : (
             <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4 relative">
               <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">Search Participant</h2>
               <div className="relative">
                 <Search className="absolute left-3 top-2.5 text-[var(--color-text-muted)]" size={20} />
                 <input
                   type="text"
                   placeholder="Type name or admission number..."
                   className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                   value={candidateQuery}
                   onChange={e => setCandidateQuery(e.target.value)}
                 />
                 {searchLoading && <RefreshCw size={16} className="absolute right-3 top-2.5 animate-spin text-[var(--color-text-muted)]" />}
                 
                 {candidateSuggestions.length > 0 && candidateQuery.length >= 2 && (
                   <div className="absolute top-full mt-1 left-0 right-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                     {candidateSuggestions.map(cand => (
                       <button
                         key={cand._id}
                         onClick={() => selectCandidate(cand)}
                         className="w-full text-left px-4 py-3 hover:bg-[var(--color-surface-elevated)] border-b border-[var(--color-border-subtle)] last:border-0 flex justify-between items-center"
                       >
                         <div>
                           <div className="font-bold text-[var(--color-text-heading)]">{cand.name}</div>
                           <div className="text-xs text-[var(--color-text-muted)]">Ad No: {cand.admissionNo} &bull; {cand.category} &bull; Class: {cand.classLevel}</div>
                         </div>
                         <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                           {cand.team?.name}
                         </div>
                       </button>
                     ))}
                   </div>
                 )}
               </div>
             </div>
          )}

        </div>

{/* Printable Area */}
      {mode === 'programme' && shuffledList.length > 0 && selectedProgramme && (
        <div className="print:absolute print:inset-0 print:z-[9999] print:block hidden-on-screen print:bg-white text-black font-sans mx-auto print:m-0 print:p-0 w-full max-w-[297mm] print:w-auto overflow-visible space-y-8 print:space-y-0" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
          
          {(() => {
            const rows = [];
            shuffledList.forEach((reg) => {
              const cands = reg.candidates?.length ? reg.candidates : [{}];
              cands.forEach((c) => rows.push({ c, reg }));
            });
            
            const ROWS_PER_PAGE = 8;
            const pages = [];
            const totalPages = Math.max(1, Math.ceil(rows.length / ROWS_PER_PAGE));
            
            for (let p = 0; p < totalPages; p++) {
              const pageRows = rows.slice(p * ROWS_PER_PAGE, (p + 1) * ROWS_PER_PAGE);
              const paddedRows = [];
              for (let i = 0; i < ROWS_PER_PAGE; i++) {
                paddedRows.push(pageRows[i] || null);
              }
              
              pages.push(
                <div key={p} className="w-full h-[210mm] print:w-[297mm] print:h-[210mm] print:break-after-page box-border p-[10mm] bg-white relative shadow-lg print:shadow-none mb-8 print:mb-0">
                  <div className="w-full h-full border-[2px] border-black p-[2mm] rounded-[4mm] box-border flex flex-col relative bg-white">
                    <div className="w-full h-full border-[1.5px] border-black rounded-[2mm] box-border p-2 flex flex-col">
                      
                      {/* Header */}
                      <div className="flex justify-between items-start mb-2 px-2 pt-1">
                        {/* Logo */}
                        <div className="w-48 h-20 flex items-center justify-start shrink-0">
                          <img src="https://i.ibb.co/HTNc8VJN/lintervention-logo-badge-1.png" alt="L'intervention" className="w-full h-full object-contain mix-blend-multiply" style={{ filter: 'grayscale(100%) brightness(0.7) contrast(1.5)' }} />
                        </div>
                        
                        {/* Title */}
                        <div className="flex flex-col items-center justify-center mt-3 flex-1 px-4">
                          <h1 className="text-2xl font-black uppercase tracking-tight text-black border-b-[2px] border-black pb-1 mb-1 px-8 text-center leading-none whitespace-nowrap">Shamsul Huda Arts Fest 2026</h1>
                          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-black whitespace-nowrap">Art Builds A Better Tomorrow</h2>
                        </div>
                        
                        {/* Building Illustration Placeholder */}
                        <div className="w-64 h-24 -mt-2 -mr-2 relative flex justify-end shrink-0 overflow-hidden">
                          <img src="/academy-building.jpg" alt="Academy Building" className="w-full h-full object-cover object-center mix-blend-multiply" style={{ filter: 'grayscale(100%)' }} />
                        </div>
                      </div>
              
                      {/* Info Grid */}
                      <div className="px-2 mb-2 mt-1">
                        <div className="flex gap-2 mb-3">
                          <div className="flex-[2] relative border-[1.5px] border-black h-8 px-2 flex items-center">
                            <div className="absolute -top-[6px] left-2 bg-white px-1 text-[9px] font-black uppercase leading-none tracking-tight">PROGRAMME</div>
                            <div className="text-[11px] font-bold uppercase truncate w-full pt-1">{selectedProgramme.name}</div>
                          </div>
                          <div className="flex-[1] relative border-[1.5px] border-black h-8 px-2 flex items-center">
                            <div className="absolute -top-[6px] left-2 bg-white px-1 text-[9px] font-black uppercase leading-none tracking-tight">PROGRAMME CODE</div>
                            <div className="text-[11px] font-bold uppercase truncate w-full pt-1">{selectedProgramme.code}</div>
                          </div>
                          <div className="flex-[1] relative border-[1.5px] border-black h-8 px-2 flex items-center">
                            <div className="absolute -top-[6px] left-2 bg-white px-1 text-[9px] font-black uppercase leading-none tracking-tight">CATEGORY</div>
                            <div className="text-[11px] font-bold uppercase truncate w-full pt-1">{selectedProgramme.category}</div>
                          </div>
                          <div className="flex-[1.2] relative border-[1.5px] border-black h-8 px-2 flex items-center">
                            <div className="absolute -top-[6px] left-2 bg-white px-1 text-[9px] font-black uppercase leading-none tracking-tight">JUDGE NAME</div>
                            <div className="text-[11px] font-bold uppercase truncate w-full pt-1"></div>
                          </div>
                          <div className="flex-[0.8] relative border-[1.5px] border-black h-8 px-2 flex items-center">
                            <div className="absolute -top-[6px] left-2 bg-white px-1 text-[9px] font-black uppercase leading-none tracking-tight">DATE</div>
                            <div className="text-[11px] font-bold uppercase truncate w-full pt-1"></div>
                          </div>
                        </div>
                        
                        <div className="flex h-8">
                          <div className="bg-[#e5e7eb] border-[1.5px] border-black border-r-0 w-28 flex items-center justify-center font-black text-sm tracking-widest uppercase">TOPIC</div>
                          <div className="flex-1 border-[1.5px] border-black px-2 flex items-center text-xs font-bold bg-white"></div>
                        </div>
                      </div>
              
                      {/* Table */}
                      <div className="px-2 mt-2 flex-1 flex flex-col min-h-0">
                        <table className="w-full border-collapse border-[1.5px] border-black h-full bg-white table-fixed">
                          <thead>
                            <tr className="bg-[#e5e7eb] border-b-[1.5px] border-black h-10">
                              <th className="border-r-[1.5px] border-black px-1 text-[11px] font-black text-center w-14 leading-tight">SL.<br/>NO.</th>
                                <th className="border-r-[1.5px] border-black px-1 text-[11px] font-black text-center w-16 leading-tight">CODE<br/>LETTER</th>
                              
                              <th className="border-r-[1.5px] border-black px-1 text-[11px] font-black text-center w-28">AD No.</th>
                              <th className="border-r-[1.5px] border-black px-2 text-[11px] font-black text-center">NAME</th>
                              <th className="border-r-[1.5px] border-black px-2 text-[11px] font-black text-center w-36">TEAM</th>
                              <th className="border-r-[1.5px] border-black px-2 text-[11px] font-black text-center w-32">POSITION</th>
                              <th className="border-r-[1.5px] border-black px-2 text-[11px] font-black text-center w-24">GRADE</th>
                              <th className="px-2 text-[11px] font-black text-center w-40">REMARKS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paddedRows.map((data, i) => (
                              <tr key={i} className="border-b-[1.5px] border-black last:border-b-0 h-[12.5%]">
                                <td className="border-r-[1.5px] border-black text-center font-black text-[16px]">{p * ROWS_PER_PAGE + i + 1}</td>
                                  <td className="border-r-[1.5px] border-black text-center font-bold text-[14px] leading-tight px-1">{data?.reg?.codeLetter || ''}</td>
                                
                                  <td className="border-r-[1.5px] border-black text-center font-bold text-[10px] leading-tight px-1 break-all">{data?.c?.admissionNo || ''}</td>
                                    <td className="border-r-[1.5px] border-black px-3 font-bold text-[10px] uppercase truncate overflow-hidden max-w-[200px] leading-tight whitespace-pre-wrap">{data?.c?.name || ''}</td>
                                  <td className="border-r-[1.5px] border-black px-2 font-bold text-[11px] text-center uppercase truncate overflow-hidden max-w-[100px]">{data?.reg?.team?.name || ''}</td>
                                <td className="border-r-[1.5px] border-black"></td>
                                <td className="border-r-[1.5px] border-black"></td>
                                <td className=""></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
              
                    </div>
                  </div>
                </div>
              );
            }
            return pages;
          })()}
        </div>
      )}
      {/* Warning Popup */}
      {showWarning && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-xl border border-[var(--color-border-subtle)] w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-100 shadow-sm">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text-heading)] mb-2">Registration Incomplete</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">
                Registration is not complete yet for this programme. No candidates found.
              </p>
              <Button onClick={() => setShowWarning(false)} variant="primary" className="w-full bg-slate-800 hover:bg-slate-700">
                Okay
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JurySlipsPage;
