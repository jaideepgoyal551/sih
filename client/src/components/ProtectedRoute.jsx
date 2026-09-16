import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="p-8 text-center text-slate-600">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles.length && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;

    return children;
}
