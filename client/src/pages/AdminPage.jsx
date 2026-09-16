import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminPage() {
    const [stats, setStats] = useState(null);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        Promise.all([
            api.get('/admin/stats'),
            api.get('/admin/audit-logs')
        ]).then(([statsRes, logRes]) => {
            setStats(statsRes.data);
            setLogs(logRes.data);
        });
    }, []);

    if (!stats) return <div className="card p-8 text-slate-600">Loading admin overview...</div>;

    return (
        <div className="space-y-8">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Admin console</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900">System overview</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="card p-5"><p className="text-sm text-slate-500">Users</p><p className="mt-3 text-3xl font-bold">{stats.users}</p></div>
                <div className="card p-5"><p className="text-sm text-slate-500">Problems</p><p className="mt-3 text-3xl font-bold">{stats.problems}</p></div>
                <div className="card p-5"><p className="text-sm text-slate-500">Audit logs</p><p className="mt-3 text-3xl font-bold">{stats.auditLogs}</p></div>
            </div>

            <div className="card p-6">
                <h2 className="text-lg font-semibold text-slate-900">Audit trail</h2>
                <div className="mt-4 space-y-3">
                    {logs.slice(0, 8).map((log) => (
                        <div key={log.id} className="rounded-xl border border-slate-200 p-3">
                            <p className="font-medium text-slate-900">{log.action}</p>
                            <p className="text-sm text-slate-600">{new Date(log.createdAt).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
