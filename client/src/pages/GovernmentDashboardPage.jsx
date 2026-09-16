import { useEffect, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function GovernmentDashboardPage() {
    const [problems, setProblems] = useState([]);
    const [pilots, setPilots] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.get('/problems'), api.get('/pilots')]).then(([problemRes, pilotRes]) => {
            setProblems(problemRes.data);
            setPilots(pilotRes.data);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="card p-8 text-slate-600">Loading government workspace...</div>;
    const proposals = problems.reduce((sum, problem) => sum + (problem.proposals?.length || 0), 0);
    const recentProposals = problems.flatMap((problem) => (problem.proposals || []).map((proposal) => ({ ...proposal, problemTitle: problem.title }))).slice(0, 8);
    const stats = [
        ['Active Problems', problems.filter((item) => item.status === 'PUBLISHED').length],
        ['Proposals Received', proposals],
        ['Active Pilots', pilots.filter((item) => item.status === 'ACTIVE').length],
        ['Procurement Ready', pilots.filter((item) => item.procurement).length]
    ];

    return <div className="space-y-8">
        <header><p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Government workspace</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Innovation portfolio</h1><p className="mt-2 text-slate-600">Publish challenges, evaluate solutions, and govern pilots from one workspace.</p></header>
        <div className="grid gap-4 md:grid-cols-4">{stats.map(([label, value]) => <div className="card p-5" key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-4 text-3xl font-bold text-slate-900">{value}</p></div>)}</div>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="card overflow-hidden"><div className="border-b border-slate-200 px-6 py-5"><h2 className="text-lg font-semibold">Recent proposals</h2><p className="mt-1 text-sm text-slate-500">Live records from published problem statements.</p></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-3">Proposal</th><th className="px-6 py-3">Problem</th><th className="px-6 py-3">Status</th></tr></thead><tbody>{recentProposals.map((proposal) => <tr className="border-b border-slate-100 last:border-0" key={proposal.id}><td className="px-6 py-4 font-medium text-slate-800">{proposal.title}</td><td className="px-6 py-4 text-slate-600">{proposal.problemTitle}</td><td className="px-6 py-4"><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">{proposal.status}</span></td></tr>)}</tbody></table>{recentProposals.length === 0 && <p className="p-6 text-sm text-slate-500">No proposals received yet.</p>}</div></div>
            <div className="card p-6"><h2 className="text-lg font-semibold">Next actions</h2><div className="mt-5 space-y-3"><Link className="block rounded-lg bg-slate-50 p-4 text-sm font-medium hover:bg-slate-100" to="/government/problems/create">Create a problem statement</Link><Link className="block rounded-lg bg-slate-50 p-4 text-sm font-medium hover:bg-slate-100" to="/government/problems">Review submitted proposals</Link><div className="flex items-center gap-2 rounded-lg bg-slate-50 p-4 text-sm"><ClipboardCheck className="h-4 w-4 text-blue-700" /> {pilots.filter((item) => item.status === 'ACTIVE').length} pilots need attention</div></div></div>
        </div>
    </div>;
}
