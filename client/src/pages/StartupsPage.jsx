import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function StartupsPage() {
    const [startups, setStartups] = useState([]);

    useEffect(() => {
        api.get('/startups').then((res) => setStartups(res.data));
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Startup marketplace</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900">Discovery portal</h1>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                {startups.map((startup) => (
                    <div key={startup.id} className="card p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-slate-900">{startup.startupName}</h2>
                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${startup.verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                {startup.verified ? 'Verified' : 'Pending'}
                            </span>
                        </div>
                        <p className="mt-3 text-sm text-slate-600">{startup.industry}</p>
                        <p className="mt-3 text-slate-600">{startup.description}</p>
                        <div className="mt-4 flex justify-between text-sm text-slate-500">
                            <span>{startup.location}</span>
                            <span>{startup.teamSize || 0} team</span>
                        </div>
                        <Link to={`/startups/${startup.id}`} className="mt-5 inline-flex rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">View profile</Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
