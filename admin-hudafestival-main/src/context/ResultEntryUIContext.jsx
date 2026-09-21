import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UIContext = createContext(null);

export function ResultEntryProvider({ children }) {
    const [toast, setToast] = useState(null); // { message, type: 'success'|'error'|'info' }
    const [modal, setModal] = useState(null); // { title, message, onConfirm, confirmText, isDestructive }

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const showModal = useCallback((options) => {
        setModal(options);
    }, []);

    const closeModal = useCallback(() => {
        setModal(null);
    }, []);

    return (
        <UIContext.Provider value={{ showToast, showModal, closeModal }}>
            {children}
            
            {/* Modal */}
            <AnimatePresence>
                {modal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-[var(--color-text-heading)] mb-2">{modal.title}</h3>
                                <p className="text-[var(--color-text-body)] mb-8">{modal.message}</p>
                                
                                <div className="flex justify-end gap-3">
                                    <button 
                                        onClick={closeModal}
                                        className="px-4 py-2 rounded-lg font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-background)] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (modal.onConfirm) modal.onConfirm();
                                            closeModal();
                                        }}
                                        className={`px-4 py-2 rounded-lg font-bold text-white transition-colors ${
                                            modal.isDestructive 
                                                ? 'bg-red-500 hover:bg-red-600' 
                                                : 'bg-[var(--color-primary)] hover:opacity-90'
                                        }`}
                                    >
                                        {modal.confirmText || 'Confirm'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-50"
                    >
                        <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl text-white font-semibold ${
                            toast.type === 'error' ? 'bg-red-500' :
                            toast.type === 'success' ? 'bg-green-500' :
                            'bg-[var(--color-primary)]'
                        }`}>
                            {toast.type === 'success' && <CheckCircle2 size={20} />}
                            {toast.type === 'error' && <AlertCircle size={20} />}
                            {toast.type === 'info' && <Info size={20} />}
                            {toast.message}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </UIContext.Provider>
    );
}

export const useResultUI = () => useContext(UIContext);
