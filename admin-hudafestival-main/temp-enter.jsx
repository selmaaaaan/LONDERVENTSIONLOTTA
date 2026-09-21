import React, { useState, useEffect } from 'react';
import { Search, Save, AlertCircle } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function EnterResultPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [programmes, setProgrammes] = useState([]);
    const [selectedProg, setSelectedProg] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [resultsMap, setResultsMap] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState(null);

    // Initial mount check for edit mode
    useEffect(() => {
        const progId = searchParams.get('programmeId');
        if (progId) {
            // Need to fetch programme details first to pass to selectProgramme
            const fetchAndSelectProg = async () => {
                try {
                    // Quickest way is to search it by id. Or we can just build a mock prog object 
                    // if selectProgramme only needs _id, code, and name. Let's just fetch it.
                    // Wait, /result-entry/programmes/search might not find by ID.
                    // We can use a direct fetch, or use the admin programmes endpoint
                    // Let's create a minimal object and pass it. selectProgramme only uses _id for the API call, 
                    // and rendering uses .name, .code. Let's fetch it from search?
                    const res = await api.get(`/result-entry/programmes/search?q=`);
                    // The above might not work if empty search isn't allowed, let's just do a specific fetch.
                } catch (e) {
                    console.error(e);
                }
            };
            // actually let's implement a better fetch inside the effect
        }
    }, []);
