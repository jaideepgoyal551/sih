import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function StartupDashboardPage() {
    const [problems, setProblems] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [pilots, setPilots] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.get('/problems'), api.get('/proposals'), api.get('/pilots')]).then(([problemRes, proposalRes, pilotRes]) => {
            setProblems(problemRes.data.filter((problem) => problem.status === 'PUBLISHED'));
            setProposals(proposalRes.data);
            setPilots(pilotRes.data);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="card p-8 text-slate-600">Loading startup workspace...</div>;
    const stats = [['Available Problems', problems.length], ['Submitted Proposals', proposals.length], ['Active Pilots', pilots.filter((item) => item.status === 'ACTIVE').length], ['Completed Pilots', pilots.filter((item) => item.status === 'COMPLETED').length]];

    return <div className="space-y-8"><header><p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Startup workspace</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Find your next public-sector opportunity</h1><p className="mt-2 text-slate-600">Discover published challenges and track every submitted proposal.</p></header><div className="grid gap-4 md:grid-cols-4">{stats.map(([label, value]) => <div className="card p-5" key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-4 text-3xl font-bold">{value}</p></div>)}</div><div className="grid gap-6 lg:grid-cols-2"><section className="card p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Published challenges</h2><Link to="/startup/problems" className="text-sm font-semibold text-blue-700">View all</Link></div><div className="mt-5 space-y-3">{problems.slice(0, 4).map((problem) => <Link key={problem.id} to={`/government/problems/${problem.id}`} className="block rounded-xl border border-slate-200 p-4 hover:border-blue-300"><p className="font-semibold">{problem.title}</p><p className="mt-1 text-sm text-slate-500">{problem.category} • {problem.duration || 'Timeline to be confirmed'}</p></Link>)}</div></section><section className="card p-6"><h2 className="text-lg font-semibold">My proposals</h2><div className="mt-5 space-y-3">{proposals.slice(0, 4).map((proposal) => <Link key={proposal.id} to={`/proposals/${proposal.id}`} className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><span className="text-sm font-medium">{proposal.title}</span><span className="text-xs font-semibold text-blue-700">{proposal.status}</span></Link>)}</div></section></div></div>;
}
