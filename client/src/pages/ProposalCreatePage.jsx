import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

export default function ProposalCreatePage() {
    const { problemId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ title: '', solutionDescription: '', technicalApproach: '', technologies: '', estimatedCost: '', timeline: '', expectedImpact: '' });
    const [error, setError] = useState('');
    const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

    const submit = async (event) => {
        event.preventDefault();
        try {
            const response = await api.post('/proposals', { problemId, ...form });
            navigate(`/proposals/${response.data.id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not submit proposal');
        }
    };

    return (
        <div className="mx-auto max-w-3xl">
            <div className="card p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Startup portal</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900">Submit proposal</h1>
                <form onSubmit={submit} className="mt-6 space-y-4">
                    {[
                        ['title', 'Proposal title'], ['technologies', 'Technologies'], ['estimatedCost', 'Estimated cost'], ['timeline', 'Timeline']
                    ].map(([field, label]) => <div key={field}><label className="label">{label}</label><input className="input" value={form[field]} onChange={(event) => update(field, event.target.value)} required={field === 'title'} /></div>)}
                    {[
                        ['solutionDescription', 'Solution description'], ['technicalApproach', 'Technical approach'], ['expectedImpact', 'Expected impact']
                    ].map(([field, label]) => <div key={field}><label className="label">{label}</label><textarea className="input" rows="3" value={form[field]} onChange={(event) => update(field, event.target.value)} required={['solutionDescription', 'technicalApproach'].includes(field)} /></div>)}
                    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
                    <button className="btn-primary w-full" type="submit">Submit proposal</button>
                </form>
            </div>
        </div>
    );
}