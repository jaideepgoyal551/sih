import { Link, NavLink } from 'react-router-dom';
import { Bell, LogOut, Moon, ShieldCheck, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navStyles = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`;

export default function Navbar() {
    const { user, logout } = useAuth();
    const { dark, toggleTheme } = useTheme();

    return (
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-20">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
                    <ShieldCheck className="h-5 w-5 text-blue-700" />
                    InnovProcure
                </Link>

                <nav className="hidden items-center gap-2 md:flex">
                    <NavLink to="/dashboard" className={navStyles}>Dashboard</NavLink>
                    {user?.role === 'GOVERNMENT' || user?.role === 'ADMIN' ? <NavLink to="/government/problems" className={navStyles}>Problems</NavLink> : null}
                    {user?.role === 'STARTUP' ? <NavLink to="/startup/problems" className={navStyles}>Find Problems</NavLink> : null}
                    {user?.role !== 'EVALUATOR' ? <NavLink to="/startups" className={navStyles}>Startups</NavLink> : null}
                    {user?.role !== 'EVALUATOR' ? <NavLink to="/repository" className={navStyles}>Repository</NavLink> : null}
                    {user?.role === 'ADMIN' ? <NavLink to="/admin" className={navStyles}>Admin</NavLink> : null}
                </nav>

                <div className="flex items-center gap-3">
                    <button aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} title={dark ? 'Light mode' : 'Dark mode'} onClick={toggleTheme} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>
                    <button aria-label="Notifications" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                        <Bell className="h-4 w-4" />
                    </button>
                    {user ? (
                        <>
                            <span className="hidden text-sm font-medium text-slate-700 md:inline">{user.name}</span>
                            <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                <LogOut className="h-4 w-4" /> Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="btn-primary">Login</Link>
                    )}
                </div>
            </div>
        </header>
    );
}
