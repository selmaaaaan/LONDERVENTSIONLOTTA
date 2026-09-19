const fs = require('fs');

const alertContextCode = `
import React, { createContext, useContext, useState, useCallback } from 'react';
import BasicToast from '../components/smoothui/basic-toast';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const alertAction = useCallback((message, explicitType) => {
        let type = explicitType;
        if (!type) {
            const msg = message.toLowerCase();
            if (msg.includes('success') || msg.includes('saved')) {
                type = 'success';
            } else if (msg.includes('fail') || msg.includes('error') || msg.includes('required') || msg.includes('invalid')) {
                type = 'error';
            } else {
                type = 'info';
            }
        }
        
        setToast({ message, type, id: Date.now() });
    }, []);

    return (
        <AlertContext.Provider value={alertAction}>
            {children}
            {toast && (
                <BasicToast 
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={3500}
                    onClose={() => setToast(null)}
                />
            )}
        </AlertContext.Provider>
    );
};
`;

fs.writeFileSync('src/context/AlertContext.jsx', alertContextCode.trim());
console.log('AlertContext smart toast patched');
