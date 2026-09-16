import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function EvaluatorDashboardPage() {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/proposals').then((response) => setProposals(response.data)).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="card p-8 text-slate-600">Loading evaluator workspace...</div>;
    const pending = proposals.filter((proposal) => !proposal.evaluation);
    const reviewed = proposals.filter((proposal) => proposal.evaluation);
    const stats = [['Review queue', pending.length], ['Reviewed', reviewed.length], ['Shortlisted', proposals.filter((proposal) => proposal.status === 'SHORTLISTED').length], ['Total proposals', proposals.length]];

    return <div className="space-y-8"><header><p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">Evaluator workspace</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Proposal review desk</h1><p className="mt-2 text-slate-600">Open a proposal, declare conflicts, and submit weighted scores.</p></header><div className="grid gap-4 md:grid-cols-4">{stats.map(([label, value]) => <div className="card p-5" key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-4 text-3xl font-bold">{value}</p></div>)}</div><section className="card p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Assigned proposals</h2><span className="text-sm text-slate-500">{pending.length} awaiting review</span></div><div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 text-slate-500"><tr><th className="px-3 py-3">Proposal</th><th className="px-3 py-3">Startup</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Action</th></tr></thead><tbody>{proposals.map((proposal) => <tr className="border-b border-slate-100" key={proposal.id}><td className="px-3 py-4 font-medium">{proposal.title}</td><td className="px-3 py-4">{proposal.startup?.startupName}</td><td className="px-3 py-4">{proposal.evaluation ? 'Reviewed' : 'Pending'}</td><td className="px-3 py-4"><Link className="font-semibold text-blue-700" to={`/proposals/${proposal.id}`}>{proposal.evaluation ? 'View score' : 'Evaluate'}</Link></td></tr>)}</tbody></table></div></section></div>;
}
