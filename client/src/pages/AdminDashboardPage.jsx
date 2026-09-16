import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.get('/admin/stats'), api.get('/admin/audit-logs')]).then(([statsResponse, logsResponse]) => { setStats(statsResponse.data); setLogs(logsResponse.data); }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="card p-8 text-slate-600">Loading admin workspace...</div>;
    const cards = [['Users', stats.users], ['Departments & problems', stats.problems], ['Pilots', stats.pilots], ['Audit events', stats.auditLogs]];
    return <div className="space-y-8"><header><p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-700">Admin workspace</p><h1 className="mt-2 text-3xl font-bold text-slate-900">System control center</h1><p className="mt-2 text-slate-600">Monitor platform activity, users, and governance records.</p></header><div className="grid gap-4 md:grid-cols-4">{cards.map(([label, value]) => <div className="card p-5" key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-4 text-3xl font-bold">{value}</p></div>)}</div><section className="card p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Recent audit activity</h2><Link to="/admin" className="text-sm font-semibold text-blue-700">Open console</Link></div><div className="mt-5 space-y-3">{logs.slice(0, 8).map((log) => <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4" key={log.id}><span className="font-medium">{log.action}</span><span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</span></div>)}</div></section></div>;
}
