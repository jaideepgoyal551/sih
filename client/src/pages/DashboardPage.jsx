import { useAuth } from '../context/AuthContext';
import GovernmentDashboardPage from './GovernmentDashboardPage.jsx';
import StartupDashboardPage from './StartupDashboardPage.jsx';
import EvaluatorDashboardPage from './EvaluatorDashboardPage.jsx';
import AdminDashboardPage from './AdminDashboardPage.jsx';

export default function DashboardPage() {
    const { user } = useAuth();

    if (user?.role === 'STARTUP') return <StartupDashboardPage />;
    if (user?.role === 'EVALUATOR') return <EvaluatorDashboardPage />;
    if (user?.role === 'ADMIN') return <AdminDashboardPage />;
    return <GovernmentDashboardPage />;
}
