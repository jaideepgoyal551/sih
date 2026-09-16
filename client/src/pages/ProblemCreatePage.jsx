import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const initialForm = {
    title: '',
    description: '',
    category: 'Public Sector Innovation',
    technologyRequirements: '',
    objectives: '',
    expectedOutcomes: '',
    budget: '',
    duration: '',
    eligibilityCriteria: ''
};

export default function ProblemCreatePage() {
    const [form, setForm] = useState(initialForm);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const navigate = useNavigate();

    const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

    const analyze = async () => {
        setError('');
        setAnalyzing(true);
        try {
            const response = await api.post('/problems/analyze', form);
            setAnalysis(response.data.aiAnalysis);
            setForm((current) => ({ ...current, category: response.data.aiAnalysis.category, technologyRequirements: response.data.aiAnalysis.technologies.join(','), duration: response.data.aiAnalysis.pilotDuration }));
        } catch (err) {
            setError(err.response?.data?.message || 'AI provider unavailable. Check the API key and retry.');
        } finally {
            setAnalyzing(false);
        }
    };

    const submit = async (event) => {
        event.preventDefault();
        try {
            const response = await api.post('/problems', { ...form, status: 'PUBLISHED' });
            navigate(`/government/problems/${response.data.problem.id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not create problem');
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Government module</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900">Create problem statement</h1>
            </div>
            <form onSubmit={submit} className="card grid gap-4 p-8 md:grid-cols-2">
                {[
                    ['title', 'Title'], ['category', 'Category'], ['technologyRequirements', 'Required technologies'],
                    ['budget', 'Budget'], ['duration', 'Timeline'], ['eligibilityCriteria', 'Eligibility criteria']
                ].map(([field, label]) => (
                    <div key={field}>
                        <label className="label">{label}</label>
                        <input className="input" value={form[field]} onChange={(event) => update(field, event.target.value)} required={['title', 'category'].includes(field)} />
                    </div>
                ))}
                {[
                    ['description', 'Description'], ['objectives', 'Objectives'], ['expectedOutcomes', 'Expected outcomes']
                ].map(([field, label]) => (
                    <div key={field} className="md:col-span-2">
                        <label className="label">{label}</label>
                        <textarea className="input" rows="3" value={form[field]} onChange={(event) => update(field, event.target.value)} required={field === 'description'} />
                    </div>
                ))}
                {error && <div className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
                <div className="flex flex-wrap gap-3 md:col-span-2">
                    <button type="button" className="btn-secondary" onClick={analyze} disabled={analyzing}>{analyzing ? 'Analyzing...' : 'Analyze with AI'}</button>
                    <button type="submit" className="btn-primary">Publish problem</button>
                </div>
            </form>
            {analysis && <div className="card p-6"><h2 className="text-lg font-semibold">AI analysis</h2><p className="mt-3 text-sm text-slate-700">Innovation potential: {analysis.innovationPotential} • Complexity: {analysis.complexity} • Pilot: {analysis.pilotDuration}</p><p className="mt-2 text-sm text-slate-600">Suggested KPIs: {analysis.suggestedKpis.join(', ')}</p></div>}
        </div>
    );
}