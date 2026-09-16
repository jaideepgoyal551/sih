import { ArrowRight, BriefcaseBusiness, Building2, CheckCircle2, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import governmentImage from '../components/360_F_939155887_1EWCj9sIFnFwNylFrepNOnxxLg8YrQOv.jpg';

const stats = [
    { label: 'Active pilots', value: '24' },
    { label: 'Departments onboarded', value: '16' },
    { label: 'Solutions scaled', value: '31' },
    { label: 'Average readiness', value: '89%' }
];

export default function HomePage() {
    return (
        <div className="space-y-16 pb-20">
            <section className="relative isolate flex min-h-[520px] items-end overflow-hidden rounded-3xl bg-slate-900 px-8 py-12 shadow-sm lg:min-h-[580px] lg:px-12 lg:py-16" style={{ backgroundImage: `url(${governmentImage})`, backgroundPosition: 'center', backgroundSize: 'cover' }}>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-slate-950/15" />
                <div className="max-w-2xl text-white">
                    <div className="mb-4 inline-flex items-center rounded-full border border-white/30 bg-slate-950/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm">
                        Government innovation procurement
                    </div>
                    <h1 className="max-w-xl text-4xl font-bold tracking-tight lg:text-6xl">
                        From Government Problems<br />to Proven Innovation.
                    </h1>
                    <p className="mt-5 max-w-xl text-lg text-white/85">
                        Discover, pilot, and scale startup solutions with transparent scoring, measurable KPIs, and procurement-ready workflows.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <Link to="/register" className="btn-primary">Register <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        <Link to="/dashboard" className="inline-flex items-center justify-center rounded-lg border border-white/60 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/20">Explore Platform</Link>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.label} className="card p-6">
                        <p className="text-sm text-slate-500">{item.label}</p>
                        <p className="mt-3 text-3xl font-bold text-slate-900">{item.value}</p>
                    </div>
                ))}
            </section>

            <section className="space-y-8">
                <div className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">How it works</p>
                    <h2 className="mt-2 text-3xl font-bold text-slate-900">A complete innovation lifecycle</h2>
                </div>
                <div className="grid gap-6 md:grid-cols-4">
                    {[
                        { icon: BriefcaseBusiness, title: '1. Problem analysis', text: 'Government teams define needs and AI-assisted analysis clarifies requirements.' },
                        { icon: Rocket, title: '2. Startup matching', text: 'Match relevant startups using transparent scoring and domain fit.' },
                        { icon: CheckCircle2, title: '3. Pilot & measure', text: 'Track milestones, KPIs, and outcome metrics with real-time reporting.' },
                        { icon: Building2, title: '4. Scale-up', text: 'Move viable solutions to procurement readiness and reuse across departments.' }
                    ].map(({ icon: Icon, title, text }) => (
                        <div key={title} className="card p-6">
                            <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-3 text-blue-700">
                                <Icon className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
                <div className="card p-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">Government benefits</p>
                    <ul className="mt-6 space-y-3 text-slate-700">
                        <li>✓ Structured challenge publication and evaluation</li>
                        <li>✓ Transparent matching across startup capability and budget</li>
                        <li>✓ Measurable KPI tracking and pilot governance</li>
                        <li>✓ Reusable innovation repository across agencies</li>
                    </ul>
                </div>
                <div className="card p-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">Startup benefits</p>
                    <ul className="mt-6 space-y-3 text-slate-700">
                        <li>✓ Discover relevant public sector problem statements</li>
                        <li>✓ Submit high-quality proposals with compliance support</li>
                        <li>✓ Build credibility through pilots and KPI proof</li>
                        <li>✓ Access procurement readiness pathways</li>
                    </ul>
                </div>
            </section>
        </div>
    );
}
