import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, PenTool, CheckSquare, Layers, LayoutDashboard, Sun, Moon, Database } from 'lucide-react';
import Logo from '../components/Logo';
import { ResultEntryProvider } from '../context/ResultEntryUIContext';

export default function ResultEntryLayout() {
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const savedMode = localStorage.getItem('huda-admin-theme');
        if (savedMode === 'dark' || (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.setAttribute('data-theme', 'dark');
            setIsDark(true);
        } else {
            document.documentElement.removeAttribute('data-theme');
            setIsDark(false);
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('huda-admin-theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('huda-admin-theme', 'dark');
            setIsDark(true);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        window.location.href = '/';
    };

    const navLinkClass = ({ isActive }) => 
        `flex items-center px-4 py-3 rounded-lg font-semibold transition-all ${
            isActive 
            ? 'bg-[var(--color-primary)] text-white shadow-lg' 
            : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-heading)]'
        }`;

    return (
        <ResultEntryProvider>
            <div className="min-h-screen bg-[var(--color-bg)] flex">
                {/* Sidebar */}
                <aside className="w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col hidden md:flex shrink-0">
                    <div className="p-6 border-b border-[var(--color-border)]">
                        <Logo className="w-32" />
                        <div className="mt-4 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Result Portal</div>
                    </div>
                    
                    <nav className="flex-1 p-4 space-y-2">
                        <NavLink to="/result-entry/dashboard" className={navLinkClass}>
                            <LayoutDashboard size={18} className="mr-3" />
                            Dashboard
                        </NavLink>
                        <NavLink to="/result-entry/enter" className={navLinkClass}>
                            <PenTool size={18} className="mr-3" />
                            Enter Results
                        </NavLink>
                        <NavLink to="/result-entry/ready" className={navLinkClass}>
                            <CheckSquare size={18} className="mr-3" />
                            Ready Results
                        </NavLink>

                        <NavLink to="/result-entry/batches" className={navLinkClass}>
                            <Layers size={18} className="mr-3" />
                            Batches
                        </NavLink>
                        <NavLink to="/result-entry/all" className={navLinkClass}>
                            <Database size={18} className="mr-3" />
                            All Results
                        </NavLink>

                    </nav>

                    <div className="p-4 border-t border-[var(--color-border)] space-y-2">
                        <button 
                            onClick={toggleTheme}
                            className="flex items-center w-full px-4 py-3 text-[var(--color-text-muted)] font-semibold hover:bg-[var(--color-background)] rounded-lg transition-colors"
                        >
                            {isDark ? (
                                <>
                                    <Sun size={18} className="mr-3" /> Light Mode
                                </>
                            ) : (
                                <>
                                    <Moon size={18} className="mr-3" /> Dark Mode
                                </>
                            )}
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-red-500 font-semibold hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <LogOut size={18} className="mr-3" />
                            Log Out
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col h-screen overflow-hidden">
                    {/* Mobile Header (optional if we want responsive, skipping for now to focus on logic) */}
                    <header className="md:hidden bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4 flex justify-between items-center">
                        <Logo className="w-24" />
                        <button onClick={toggleTheme} className="text-[var(--color-text-muted)] mr-4">
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button onClick={handleLogout} className="text-red-500"><LogOut size={20} /></button>
                    </header>
                    
                    <div className="flex-1 overflow-auto bg-[var(--color-bg)]">
                        <Outlet />
                    </div>
                </main>
            </div>
        </ResultEntryProvider>
    );
}
