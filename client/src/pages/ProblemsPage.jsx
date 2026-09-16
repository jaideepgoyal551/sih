import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProblemsPage() {
    const [problems, setProblems] = useState([]);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        api.get('/problems').then((res) => setProblems(res.data)).catch((err) => setError(err.response?.data?.message || 'Unable to load problems'));
    }, []);

    const visibleProblems = user?.role === 'STARTUP' ? problems.filter((problem) => problem.status === 'PUBLISHED') : problems;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Government module</p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-900">{user?.role === 'STARTUP' ? 'Available government problems' : 'Problem statements'}</h1>
                </div>
                {user?.role === 'GOVERNMENT' && <Link to="/government/problems/create" className="btn-primary">Create problem</Link>}
            </div>

            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
            <div className="grid gap-5">
                {visibleProblems.length === 0 && !error && <div className="card p-8 text-center text-slate-600">No published problems are available.</div>}
                {visibleProblems.map((problem) => (
                    <div key={problem.id} className="card p-6">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">{problem.title}</h2>
                                <p className="mt-1 text-sm text-slate-600">{problem.category} • {problem.status}</p>
                            </div>
                            <Link to={`/government/problems/${problem.id}`} className="btn-secondary">View details</Link>
                        </div>
                        <p className="mt-4 text-slate-600">{problem.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
