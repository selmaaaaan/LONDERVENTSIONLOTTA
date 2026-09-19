const fs = require('fs');

const alertContextCode = `
import React, { createContext, useContext, useState, useCallback } from 'react';
import BasicToast from '../components/smoothui/basic-toast';
import { AnimatePresence } from 'motion/react';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const alertAction = useCallback((message, type = 'info') => {
        // Just replace the active toast
        setToast({ message, type, id: Date.now() });
    }, []);

    return (
        <AlertContext.Provider value={alertAction}>
            {children}
            <AnimatePresence>
              {toast && (
                  <BasicToast 
                      key={toast.id}
                      message={toast.message}
                      type={toast.type}
                      duration={3000}
                      onClose={() => setToast(null)}
                  />
              )}
            </AnimatePresence>
        </AlertContext.Provider>
    );
};
`;

fs.writeFileSync('src/context/AlertContext.jsx', alertContextCode.trim());
console.log('AlertContext single-toast patched');
