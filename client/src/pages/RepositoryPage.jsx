import { useEffect, useState } from 'react';
import api from '../services/api';

export default function RepositoryPage() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        api.get('/repository').then((res) => setItems(res.data));
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Innovation repository</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900">Completed solutions</h1>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                {items.map((item) => (
                    <div key={item.id} className="card p-6">
                        <h2 className="text-xl font-semibold text-slate-900">{item.problem}</h2>
                        <p className="mt-2 text-sm text-slate-600">Startup: {item.startup}</p>
                        <p className="mt-3 text-slate-600">Solution: {item.solution}</p>
                        <div className="mt-4 inline-flex rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">Readiness: {item.readiness}%</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
