const fs = require('fs');

const alertContextCode = `
import React, { createContext, useContext, useState, useCallback } from 'react';
import BasicToast from '../components/smoothui/basic-toast';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const alertAction = useCallback((message, type = 'info') => {
        // We can just set a new toast, overriding the previous one or appending.
        // For simplicity, let's keep one toast at a time since the old system had one alert state.
        // Or generate a unique ID.
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        
        // Auto-remove after 3.5 seconds to clean up state
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    return (
        <AlertContext.Provider value={alertAction}>
            {children}
            {toasts.map(toast => (
                <BasicToast 
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={3000}
                    onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                />
            ))}
        </AlertContext.Provider>
    );
};
`;

fs.writeFileSync('src/context/AlertContext.jsx', alertContextCode.trim());
console.log('AlertContext patched to use BasicToast');
