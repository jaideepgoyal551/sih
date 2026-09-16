import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProblemDetailsPage() {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [matches, setMatches] = useState([]);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        Promise.all([
            api.get(`/problems/${id}`),
            api.get(`/problems/${id}/matches`)
        ]).then(([problemRes, matchRes]) => {
            setProblem(problemRes.data);
            setMatches(matchRes.data);
        }).catch((err) => setError(err.response?.data?.message || 'Unable to load problem details'));
    }, [id]);

    if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>;
    if (!problem) return <div className="card animate-pulse p-8 text-slate-600">Loading problem details...</div>;

    return (
        <div className="space-y-8">
            <div className="card p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Problem statement</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900">{problem.title}</h1>
                <p className="mt-4 text-slate-600">{problem.description}</p>
                {user?.role === 'STARTUP' && problem.status === 'PUBLISHED' && <Link to={`/proposals/new/${problem.id}`} className="mt-5 btn-primary">Submit a proposal</Link>}
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">Category</p><p className="mt-2 font-semibold">{problem.category}</p></div>
                    <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">Budget</p><p className="mt-2 font-semibold">₹{problem.budget || 0}</p></div>
                    <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">Duration</p><p className="mt-2 font-semibold">{problem.duration}</p></div>
                </div>
            </div>

            <div className="card p-8">
                <h2 className="text-xl font-semibold text-slate-900">Matching startups</h2>
                <div className="mt-6 space-y-4">
                    {matches.length === 0 && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">No matching startups are available yet.</p>}
                    {matches.map((match) => (
                        <div key={match.id} className="rounded-xl border border-slate-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">{match.startupName}</h3>
                                    <p className="text-sm text-slate-600">{match.industry}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs uppercase text-slate-500">Match Score</p>
                                    <p className="text-2xl font-bold text-blue-700">{match.overall}%</p>
                                </div>
                            </div>
                            <div className="mt-4 grid gap-2 md:grid-cols-2">
                                {match.reasons.map((reason) => <p key={reason} className="text-sm text-slate-700">{reason}</p>)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
