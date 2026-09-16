import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function PilotPage() {
    const { id } = useParams();
    const [pilot, setPilot] = useState(null);

    useEffect(() => {
        api.get(`/pilots/${id}`).then((res) => setPilot(res.data));
    }, [id]);

    if (!pilot) return <div className="card p-8 text-slate-600">Loading pilot information...</div>;

    return (
        <div className="card p-8">
            <h1 className="text-3xl font-bold text-slate-900">Pilot overview</h1>
            <p className="mt-3 text-slate-600">Status: {pilot.status}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">Scope</p><p className="mt-2 font-semibold">{pilot.scope}</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">Budget</p><p className="mt-2 font-semibold">₹{pilot.budget || 0}</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">Progress</p><p className="mt-2 font-semibold">{pilot.overallProgress || 0}%</p></div>
            </div>
        </div>
    );
}
