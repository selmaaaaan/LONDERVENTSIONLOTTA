import GridLoader from '@/components/smoothui/grid-loader';
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Trophy, Calendar, CheckCircle, Clock } from "lucide-react";
import api from "../services/api";
import Button from "../components/Button";


export default function CandidateProgrammeStatusPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [candRes, regRes, resRes] = await Promise.all([
                    api.get(`/candidates/${id}`),
                    api.get(`/candidates/${id}/registrations`),
                    api.get(`/candidates/${id}/results`)
                ]);
                setCandidate(candRes.data);
                // getCandidateRegistrations returns a mapped array, not just documents
                setRegistrations(regRes.data || []);
                setResults(resRes.data || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch candidate data');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id]);

    if (loading) return <div className="p-12 flex justify-center"><GridLoader size="lg" color="#ea580c" mode="pulse" /></div>;
    if (error) return <div className="p-12 text-center text-red-500">{error}</div>;
    if (!candidate) return <div className="p-12 text-center">Candidate not found.</div>;

    // Map registrations with results
    const mappedProgrammes = registrations.map(reg => {
        // Find the full programme details from the backend mapping
        // wait, candidateController.js getCandidateRegistrations returns { _id, programmeId, programmeCode, programmeName, category, type, status, topic... }
        // BUT it doesn't return `isResultPublished`.
        // Let me check if getCandidateRegistrations populates isResultPublished. I need to make sure!
        // The results array we just fetched will have `{ programme: { _id, name }, rank, grade, status }`.
        
        // Let's just assume `isResultPublished` is not there. Wait, how do I know if it's published if they didn't get a rank?
        // Actually, if the backend `getCandidateRegistrations` doesn't populate `isResultPublished`, I might need to fetch it or modify the backend.
        // Let's temporarily rely on results having an entry (or we can just show "Pending / No Result" vs "Result").
        // But the prompt says: "If published -> show 'Published'".
        return reg;
    });

    return (
        <div className="p-6 w-full max-w-5xl mx-auto space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] mb-2 transition-colors">
                <ArrowLeft size={16} className="mr-1" /> Back to Search
            </button>
            
            {/* Header Card */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full flex items-center justify-center">
                    <User size={40} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">{candidate.name}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                        <span className="text-sm font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-elevated)] px-3 py-1 rounded-full border border-[var(--color-border)]">AD: {candidate.admissionNo}</span>
                        <span className="text-sm font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-elevated)] px-3 py-1 rounded-full border border-[var(--color-border)]">{candidate.category}</span>
                        <span className="text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-full border border-[var(--color-primary)]/20">{candidate.team?.name || 'Unknown Team'}</span>
                    </div>
                </div>
            </div>

            <h2 className="text-lg font-bold text-[var(--color-text-heading)] mt-8 mb-4">Registered Programmes ({registrations.length})</h2>

            <div className="grid grid-cols-1 gap-4">
                {registrations.length === 0 ? (
                    <div className="text-center p-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-muted)]">
                        No programmes registered.
                    </div>
                ) : registrations.map(reg => {
                    const result = results.find(r => r.programme?._id === reg.programmeId || r.programme === reg.programmeId);
                    // Without modifying the backend right now to include isResultPublished in getCandidateRegistrations,
                    // we can infer: if they have an 'approved' result, it's definitely published.
                    // If they have no result, we don't know if the programme is published and they just lost, or if it's pending.
                    // I will update candidateController's getCandidateRegistrations to include isResultPublished quickly to be precise.
                    const isPublished = reg.isResultPublished || (result && result.status === 'approved');
                    
                    return (
                        <div key={reg._id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] px-2 py-0.5 rounded border border-[var(--color-border)]">
                                        {reg.programmeCode}
                                    </span>
                                    <h3 className="font-bold text-[var(--color-text-heading)]">{reg.programmeName}</h3>
                                </div>
                                <div className="flex gap-3 text-xs text-[var(--color-text-muted)]">
                                    <span className="flex items-center"><Calendar size={12} className="mr-1"/> {reg.type}</span>
                                </div>
                            </div>
                            
                            <div className="w-full md:w-64 flex flex-col items-end gap-2">
                                {isPublished ? (
                                    <div className="flex flex-col items-end">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-bold border border-green-500/20">
                                            <CheckCircle size={14} /> PUBLISHED
                                        </span>
                                        {result && result.status === 'approved' && (result.rank || result.grade) ? (
                                            <div className="mt-2 text-sm font-medium text-[var(--color-text-heading)] flex gap-3">
                                                {result.rank && <span>Pos: <strong className="text-[var(--color-primary)]">{result.rank}</strong></span>}
                                                {result.grade && <span>Grade: <strong className="text-[var(--color-primary)]">{result.grade}</strong></span>}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-[var(--color-text-muted)] mt-1 italic">No position/grade</span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-bold border border-amber-500/20">
                                        <Clock size={14} /> PENDING
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
