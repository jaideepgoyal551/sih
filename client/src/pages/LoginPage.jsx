import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [form, setForm] = useState({ email: 'officer@urban.gov', password: 'officer123' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const demoAccounts = [
        { label: 'Government', email: 'officer@urban.gov', password: 'officer123' },
        { label: 'Startup', email: 'founder@smartroute.ai', password: 'startup123' },
        { label: 'Evaluator', email: 'eva@innovation.gov', password: 'evaluator123' },
        { label: 'Admin', email: 'admin@innovprocure.gov', password: 'admin123' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(form);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="mx-auto max-w-md py-10">
            <div className="card p-8">
                <h1 className="text-2xl font-bold text-slate-900">Sign in to InnovProcure</h1>
                <p className="mt-2 text-sm text-slate-600">Use your government, startup, or evaluator account.</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                    {demoAccounts.map((account) => (
                        <button key={account.label} type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50" onClick={() => setForm({ email: account.email, password: account.password })}>
                            <span className="block font-semibold">{account.label} demo</span>
                            <span className="text-slate-500">Use credentials</span>
                        </button>
                    ))}
                </div>
                {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="label">Email</label>
                        <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div>
                        <label className="label">Password</label>
                        <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    </div>
                    <button className="btn-primary w-full" type="submit">Login</button>
                </form>

                <p className="mt-4 text-sm text-slate-600">
                    Need an account? <Link to="/register" className="font-semibold text-blue-700">Register</Link>
                </p>
            </div>
        </div>
    );
}
