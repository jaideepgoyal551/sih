import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function StartupDetailPage() {
    const { id } = useParams();
    const [startup, setStartup] = useState(null);

    useEffect(() => {
        api.get(`/startups/${id}`).then((res) => setStartup(res.data));
    }, [id]);

    if (!startup) return <div className="card p-8 text-slate-600">Loading startup profile...</div>;

    return (
        <div className="space-y-6">
            <div className="card p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Startup profile</p>
                        <h1 className="mt-2 text-3xl font-bold text-slate-900">{startup.startupName}</h1>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${startup.verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {startup.verified ? 'Verified' : 'Unverified'}
                    </span>
                </div>
                <p className="mt-4 text-slate-600">{startup.description}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Company details</h2>
                    <ul className="mt-4 space-y-2 text-sm text-slate-700">
                        <li>Industry: {startup.industry}</li>
                        <li>Location: {startup.location}</li>
                        <li>Technologies: {startup.technologies}</li>
                        <li>Website: {startup.website}</li>
                    </ul>
                </div>
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Government pilots</h2>
                    <div className="mt-4 space-y-2">
                        {startup.proposals?.length ? startup.proposals.map((proposal) => (
                            <div key={proposal.id} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{proposal.title} • {proposal.status}</div>
                        )) : <p className="text-slate-500">No prior public sector pilots recorded yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
