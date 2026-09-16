import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProblemsPage from './pages/ProblemsPage.jsx';
import StartupsPage from './pages/StartupsPage.jsx';
import RepositoryPage from './pages/RepositoryPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import ProblemCreatePage from './pages/ProblemCreatePage.jsx';
import ProposalCreatePage from './pages/ProposalCreatePage.jsx';
import ProblemDetailsPage from './pages/ProblemDetailsPage.jsx';
import StartupDetailPage from './pages/StartupDetailPage.jsx';
import ProposalPage from './pages/ProposalPage.jsx';
import PilotPage from './pages/PilotPage.jsx';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="government/problems" element={<ProtectedRoute allowedRoles={['GOVERNMENT', 'ADMIN']}><ProblemsPage /></ProtectedRoute>} />
                <Route path="startup/problems" element={<ProtectedRoute allowedRoles={['STARTUP']}><ProblemsPage /></ProtectedRoute>} />
                <Route path="government/problems/create" element={<ProtectedRoute allowedRoles={['GOVERNMENT']}><ProblemCreatePage /></ProtectedRoute>} />
                <Route path="government/problems/:id" element={<ProtectedRoute allowedRoles={['GOVERNMENT', 'ADMIN', 'STARTUP']}><ProblemDetailsPage /></ProtectedRoute>} />
                <Route path="startups" element={<ProtectedRoute allowedRoles={['GOVERNMENT', 'ADMIN', 'STARTUP']}><StartupsPage /></ProtectedRoute>} />
                <Route path="startups/:id" element={<ProtectedRoute allowedRoles={['GOVERNMENT', 'ADMIN', 'STARTUP']}><StartupDetailPage /></ProtectedRoute>} />
                <Route path="proposals/:id" element={<ProtectedRoute allowedRoles={['STARTUP', 'GOVERNMENT', 'EVALUATOR']}><ProposalPage /></ProtectedRoute>} />
                <Route path="proposals/new/:problemId" element={<ProtectedRoute allowedRoles={['STARTUP']}><ProposalCreatePage /></ProtectedRoute>} />
                <Route path="pilots/:id" element={<ProtectedRoute allowedRoles={['GOVERNMENT', 'STARTUP', 'ADMIN']}><PilotPage /></ProtectedRoute>} />
                <Route path="repository" element={<ProtectedRoute allowedRoles={['GOVERNMENT', 'ADMIN', 'STARTUP']}><RepositoryPage /></ProtectedRoute>} />
                <Route path="admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminPage /></ProtectedRoute>} />
            </Route>
        </Routes>
    );
}
