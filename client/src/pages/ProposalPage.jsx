import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProposalPage() {
    const { id } = useParams();
    const [proposal, setProposal] = useState(null);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const { user } = useAuth();
    const [scores, setScores] = useState({ innovationScore: 80, technicalScore: 80, feasibilityScore: 80, costScore: 80, scalabilityScore: 80, complianceScore: 80, comments: '', conflictDeclared: false });

    useEffect(() => {
        api.get(`/proposals/${id}`).then((res) => setProposal(res.data));
    }, [id]);

    const updateScore = (field, value) => setScores((current) => ({ ...current, [field]: value }));
    const submitEvaluation = async (event) => {
        event.preventDefault();
        setError('');
        try {
            const response = await api.post('/evaluations', { proposalId: id, ...scores });
            setProposal((current) => ({ ...current, status: response.data.finalScore >= 75 ? 'SHORTLISTED' : 'REJECTED', evaluation: response.data.evaluation }));
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Evaluation could not be submitted');
        }
    };

    if (!proposal) return <div className="card p-8 text-slate-600">Loading proposal...</div>;

    return (
        <div className="space-y-6">
            <div className="card p-8">
                <h1 className="text-3xl font-bold text-slate-900">{proposal.title}</h1>
                <p className="mt-2 text-sm text-slate-600">Status: {proposal.status}</p>
                <div className="mt-6 space-y-4 text-slate-700">
                    <p><strong>Solution:</strong> {proposal.solutionDescription}</p>
                    <p><strong>Technical approach:</strong> {proposal.technicalApproach}</p>
                    <p><strong>Expected impact:</strong> {proposal.expectedImpact}</p>
                    <p><strong>Estimated cost:</strong> ₹{proposal.estimatedCost || 0}</p>
                </div>
            </div>
            {user?.role === 'EVALUATOR' && !proposal.evaluation && !submitted && <form onSubmit={submitEvaluation} className="card space-y-5 p-8"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">Evaluator action</p><h2 className="mt-2 text-xl font-semibold">Score this proposal</h2><p className="mt-2 text-sm text-slate-500">Weights: innovation 20%, technical 25%, feasibility 15%, cost 15%, scalability 15%, compliance 10%.</p></div><div className="grid gap-4 md:grid-cols-2">{[['innovationScore', 'Innovation'], ['technicalScore', 'Technical feasibility'], ['feasibilityScore', 'Implementation feasibility'], ['costScore', 'Cost effectiveness'], ['scalabilityScore', 'Scalability'], ['complianceScore', 'Compliance']].map(([field, label]) => <label className="text-sm font-medium text-slate-700" key={field}>{label}<input className="input" type="number" min="0" max="100" value={scores[field]} onChange={(event) => updateScore(field, Number(event.target.value))} /></label>)}</div><textarea className="input" rows="3" placeholder="Evaluation comments" value={scores.comments} onChange={(event) => updateScore('comments', event.target.value)} /><label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={scores.conflictDeclared} onChange={(event) => updateScore('conflictDeclared', event.target.checked)} /> I declare a conflict of interest</label>{error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}<button className="btn-primary" type="submit">Submit evaluation</button></form>}
            {submitted && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">Evaluation submitted successfully. Proposal status: {proposal.status}.</div>}
        </div>
    );
}
