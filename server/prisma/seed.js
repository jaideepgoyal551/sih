import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    await prisma.auditLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.kPI.deleteMany({});
    await prisma.milestone.deleteMany({});
    await prisma.procurement.deleteMany({});
    await prisma.pilot.deleteMany({});
    await prisma.evaluation.deleteMany({});
    await prisma.proposal.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.kPI.deleteMany({});
    await prisma.problemStatement.deleteMany({});
    await prisma.startup.deleteMany({});
    await prisma.governmentDepartment.deleteMany({});
    await prisma.user.deleteMany({});

    const adminPassword = await bcrypt.hash('admin123', 10);
    const govPassword = await bcrypt.hash('officer123', 10);
    const startupPassword = await bcrypt.hash('startup123', 10);
    const evaluatorPassword = await bcrypt.hash('evaluator123', 10);

    const admin = await prisma.user.create({
        data: {
            name: 'System Admin',
            email: 'admin@innovprocure.gov',
            passwordHash: adminPassword,
            role: 'ADMIN'
        }
    });

    const govUser = await prisma.user.create({
        data: {
            name: 'Aditi Rao',
            email: 'officer@urban.gov',
            passwordHash: govPassword,
            role: 'GOVERNMENT',
            governmentDepartment: {
                create: {
                    departmentName: 'Ministry of Urban Development',
                    departmentType: 'Infrastructure',
                    designation: 'Innovation Officer',
                    description: 'Urban innovation and civic technology department.'
                }
            }
        },
        include: { governmentDepartment: true }
    });

    const startupUser = await prisma.user.create({
        data: {
            name: 'Rohit Mehta',
            email: 'founder@smartroute.ai',
            passwordHash: startupPassword,
            role: 'STARTUP',
            startup: {
                create: {
                    startupName: 'SmartRoute AI',
                    industry: 'Urban Mobility',
                    description: 'AI route optimization SaaS for civic operations.',
                    technologies: 'AI/ML,Geospatial,Cloud',
                    website: 'https://smartroute.ai',
                    location: 'Bengaluru',
                    teamSize: 18,
                    foundedYear: 2021,
                    verified: true
                }
            }
        },
        include: { startup: true }
    });

    const evaluatorUser = await prisma.user.create({
        data: {
            name: 'Nisha Verma',
            email: 'eva@innovation.gov',
            passwordHash: evaluatorPassword,
            role: 'EVALUATOR'
        }
    });

    const department = await prisma.governmentDepartment.findUnique({
        where: { userId: govUser.id }
    });

    const problem1 = await prisma.problemStatement.create({
        data: {
            departmentId: department.id,
            title: 'AI-based waste collection route optimization',
            description: 'Optimize waste collection routes using AI-driven predictive routing in urban zones.',
            category: 'Urban Mobility',
            technologyRequirements: 'AI/ML,Computer Vision,Cloud',
            objectives: 'Reduce route length, improve collection frequency, lower fuel usage',
            expectedOutcomes: 'Reduce fleet travel time by 30% and improve collection adherence',
            budget: 2500000,
            duration: '12 weeks',
            eligibilityCriteria: 'Startups with verified delivery track record in AI and logistics',
            status: 'PUBLISHED'
        }
    });

    const problem2 = await prisma.problemStatement.create({
        data: {
            departmentId: department.id,
            title: 'Predictive school transport safety monitoring',
            description: 'Use sensors and analytics to improve school transport route safety.',
            category: 'Education',
            technologyRequirements: 'IoT,AI/ML,Dashboarding',
            objectives: 'Track safety, reduce incidents, improve attendance compliance',
            expectedOutcomes: 'Improve route safety and transparency for parents',
            budget: 1800000,
            duration: '10 weeks',
            eligibilityCriteria: 'Experience in school transport analytics',
            status: 'PUBLISHED'
        }
    });

    const proposal1 = await prisma.proposal.create({
        data: {
            problemId: problem1.id,
            startupId: startupUser.startup.id,
            title: 'SmartRoute Pro',
            solutionDescription: 'Machine learning-based route optimization for waste collection fleets.',
            technicalApproach: 'Predictive demand modeling with geospatial routing and real-time dispatch adjustments.',
            technologies: 'AI/ML,Geospatial,Cloud',
            estimatedCost: 1200000,
            timeline: '10 weeks',
            expectedImpact: 'Cut idle travel by 35% and reduce fuel consumption by 20%',
            status: 'UNDER_REVIEW'
        }
    });

    await prisma.evaluation.create({
        data: {
            proposalId: proposal1.id,
            evaluatorId: evaluatorUser.id,
            innovationScore: 89,
            technicalScore: 91,
            feasibilityScore: 87,
            costScore: 85,
            scalabilityScore: 90,
            complianceScore: 94,
            comments: 'Strong technical fit with clear measurable impact.',
            conflictDeclared: false
        }
    });

    const pilot = await prisma.pilot.create({
        data: {
            proposalId: proposal1.id,
            status: 'ACTIVE',
            objectives: 'Validate route efficiency and waste collection adherence',
            scope: 'Pilot across two municipal zones',
            budget: 1400000,
            startDate: new Date('2026-08-01'),
            endDate: new Date('2026-10-31'),
            overallProgress: 72,
            kpis: {
                create: [
                    {
                        name: 'Processing time reduction',
                        description: 'Average route processing time reduction',
                        targetValue: 30,
                        actualValue: 38,
                        unit: '%',
                        status: 'ACHIEVED'
                    },
                    {
                        name: 'Operational cost reduction',
                        description: 'Reduction in fuel and labor cost',
                        targetValue: 20,
                        actualValue: 17,
                        unit: '%',
                        status: 'ON_TRACK'
                    }
                ]
            },
            milestones: {
                create: [
                    {
                        title: 'Pilot kickoff',
                        description: 'Deployment and integration setup',
                        dueDate: new Date('2026-08-10'),
                        status: 'COMPLETED',
                        completedAt: new Date('2026-08-12')
                    },
                    {
                        title: 'Field validation',
                        description: 'Route optimization benchmark validation',
                        dueDate: new Date('2026-09-20'),
                        status: 'IN_PROGRESS'
                    }
                ]
            }
        }
    });

    await prisma.procurement.create({
        data: {
            pilotId: pilot.id,
            readinessScore: 89,
            technicalReadiness: 91,
            financialReadiness: 82,
            scalabilityReadiness: 88,
            complianceReadiness: 95,
            decision: 'SCALE',
            comments: 'Solution is ready for scale-up with minor procurement support.'
        }
    });

    await prisma.notification.createMany({
        data: [
            {
                userId: govUser.id,
                title: 'New proposal received',
                message: 'SmartRoute AI submitted a proposal for waste optimization.',
                type: 'INFO'
            },
            {
                userId: startupUser.id,
                title: 'Proposal under review',
                message: 'Your proposal is under evaluation by the government panel.',
                type: 'SUCCESS'
            }
        ]
    });

    await prisma.auditLog.createMany({
        data: [
            { userId: govUser.id, action: 'Problem Published', entityType: 'ProblemStatement', entityId: problem1.id, metadata: { title: problem1.title } },
            { userId: startupUser.id, action: 'Proposal Submitted', entityType: 'Proposal', entityId: proposal1.id, metadata: { title: proposal1.title } },
            { userId: evaluatorUser.id, action: 'Evaluation Completed', entityType: 'Evaluation', entityId: proposal1.id, metadata: { score: 89 } },
            { userId: govUser.id, action: 'Pilot Approved', entityType: 'Pilot', entityId: pilot.id, metadata: { status: pilot.status } }
        ]
    });

    console.log('Seed complete');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
