import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const defaultForm = {
    name: '',
    email: '',
    password: '',
    role: 'GOVERNMENT',
    departmentName: '',
    departmentType: '',
    designation: '',
    startupName: '',
    industry: '',
    technologies: '',
    description: '',
    website: '',
    location: ''
};

export default function RegisterPage() {
    const [form, setForm] = useState(defaultForm);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(form);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="mx-auto max-w-3xl py-10">
            <div className="card p-8">
                <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
                <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="label">Full name</label>
                        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="label">Role</label>
                        <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                            <option value="GOVERNMENT">Government Department</option>
                            <option value="STARTUP">Startup</option>
                            <option value="EVALUATOR">Evaluator</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Email</label>
                        <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div>
                        <label className="label">Password</label>
                        <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    </div>

                    {form.role === 'GOVERNMENT' && (
                        <>
                            <div><label className="label">Department name</label><input className="input" value={form.departmentName} onChange={(e) => setForm({ ...form, departmentName: e.target.value })} /></div>
                            <div><label className="label">Department type</label><input className="input" value={form.departmentType} onChange={(e) => setForm({ ...form, departmentType: e.target.value })} /></div>
                            <div className="md:col-span-2"><label className="label">Designation</label><input className="input" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></div>
                        </>
                    )}

                    {form.role === 'STARTUP' && (
                        <>
                            <div><label className="label">Startup name</label><input className="input" value={form.startupName} onChange={(e) => setForm({ ...form, startupName: e.target.value })} /></div>
                            <div><label className="label">Industry</label><input className="input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></div>
                            <div><label className="label">Technologies</label><input className="input" value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} /></div>
                            <div><label className="label">Location</label><input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                            <div className="md:col-span-2"><label className="label">Description</label><textarea className="input" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                            <div className="md:col-span-2"><label className="label">Website</label><input className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
                        </>
                    )}

                    {error && <div className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

                    <button type="submit" className="btn-primary md:col-span-2">Create account</button>
                </form>

                <p className="mt-4 text-sm text-slate-600">Already have an account? <Link to="/login" className="font-semibold text-blue-700">Login</Link></p>
            </div>
        </div>
    );
}
