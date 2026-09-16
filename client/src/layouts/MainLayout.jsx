import Navbar from '../components/Navbar.jsx';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <Navbar />
            <main className="page-enter mx-auto max-w-7xl px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
}
