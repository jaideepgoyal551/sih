import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    next();
};

router.get('/', authenticate, async (req, res, next) => {
    try {
        const pilots = await prisma.pilot.findMany({
            include: { proposal: { include: { startup: true, problem: true } }, kpis: true, milestones: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(pilots);
    } catch (error) { next(error); }
});

router.post('/', authenticate, authorize('GOVERNMENT'), [
    body('proposalId').notEmpty(),
    body('scope').notEmpty()
], validate, async (req, res, next) => {
    try {
        const proposal = await prisma.proposal.findUnique({ where: { id: req.body.proposalId } });
        if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

        const pilot = await prisma.pilot.create({
            data: {
                proposalId: req.body.proposalId,
                startDate: req.body.startDate ? new Date(req.body.startDate) : new Date(),
                endDate: req.body.endDate ? new Date(req.body.endDate) : null,
                status: req.body.status || 'PLANNED',
                objectives: req.body.objectives || '',
                scope: req.body.scope,
                budget: req.body.budget ? Number(req.body.budget) : 0,
                overallProgress: req.body.overallProgress || 0,
                milestones: {
                    create: (req.body.milestones || []).map((m) => ({
                        title: m.title,
                        description: m.description || '',
                        dueDate: m.dueDate ? new Date(m.dueDate) : null,
                        status: m.status || 'PENDING'
                    }))
                },
                kpis: {
                    create: (req.body.kpis || []).map((kpi) => ({
                        name: kpi.name,
                        description: kpi.description || '',
                        targetValue: Number(kpi.targetValue || 0),
                        actualValue: Number(kpi.actualValue || 0),
                        unit: kpi.unit || '%',
                        status: kpi.status || 'ON_TRACK'
                    }))
                }
            }
        });

        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'Pilot Approved',
                entityType: 'Pilot',
                entityId: pilot.id,
                metadata: { proposalId: req.body.proposalId }
            }
        });

        res.status(201).json(pilot);
    } catch (error) { next(error); }
});

router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const pilot = await prisma.pilot.findUnique({
            where: { id: req.params.id },
            include: { proposal: true, kpis: true, milestones: true, procurement: true }
        });
        if (!pilot) return res.status(404).json({ message: 'Pilot not found' });
        res.json(pilot);
    } catch (error) { next(error); }
});

router.put('/:id', authenticate, authorize('GOVERNMENT'), async (req, res, next) => {
    try {
        const pilot = await prisma.pilot.update({
            where: { id: req.params.id },
            data: {
                status: req.body.status,
                overallProgress: req.body.overallProgress === undefined ? undefined : Number(req.body.overallProgress),
                scope: req.body.scope,
                objectives: req.body.objectives,
                endDate: req.body.endDate ? new Date(req.body.endDate) : undefined
            }
        });

        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'Pilot Updated',
                entityType: 'Pilot',
                entityId: pilot.id,
                metadata: { status: pilot.status, overallProgress: pilot.overallProgress }
            }
        });

        res.json(pilot);
    } catch (error) { next(error); }
});

router.post('/:id/kpis', authenticate, authorize('GOVERNMENT'), async (req, res, next) => {
    try {
        const kpi = await prisma.kPI.create({
            data: {
                pilotId: req.params.id,
                name: req.body.name,
                description: req.body.description || '',
                targetValue: Number(req.body.targetValue || 0),
                actualValue: Number(req.body.actualValue || 0),
                unit: req.body.unit || '%',
                status: req.body.status || 'ON_TRACK'
            }
        });

        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'KPI Updated',
                entityType: 'KPI',
                entityId: kpi.id,
                metadata: { pilotId: req.params.id, actualValue: kpi.actualValue }
            }
        });

        res.status(201).json(kpi);
    } catch (error) { next(error); }
});

router.put('/kpis/:kpiId', authenticate, authorize('GOVERNMENT'), async (req, res, next) => {
    try {
        const kpi = await prisma.kPI.update({
            where: { id: req.params.kpiId },
            data: {
                actualValue: req.body.actualValue === undefined ? undefined : Number(req.body.actualValue),
                status: req.body.status
            }
        });

        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'KPI Updated',
                entityType: 'KPI',
                entityId: kpi.id,
                metadata: { pilotId: kpi.pilotId, actualValue: kpi.actualValue }
            }
        });

        res.json(kpi);
    } catch (error) { next(error); }
});

router.get('/:id/outcome', authenticate, async (req, res, next) => {
    try {
        const pilot = await prisma.pilot.findUnique({
            where: { id: req.params.id },
            include: { kpis: true }
        });
        if (!pilot) return res.status(404).json({ message: 'Pilot not found' });
        const achievement = pilot.kpis.reduce((sum, item) => sum + Math.min(100, Math.abs(((Number(item.actualValue) - Number(item.targetValue)) / Math.max(Number(item.targetValue), 1)) * 100)), 0);
        const targetAchievement = pilot.kpis.length ? Math.round(achievement / pilot.kpis.length) : 0;
        res.json({
            pilotId: pilot.id,
            targetAchievement: `${targetAchievement}%`,
            technicalResult: targetAchievement >= 80 ? 'Strong' : 'Moderate',
            costResult: 'Moderate',
            scalability: 'High',
            keyFindings: pilot.kpis.map((kpi) => `${kpi.name} ${Number(kpi.actualValue) >= Number(kpi.targetValue) ? 'exceeded target' : 'close to target'}`)
        });
    } catch (error) { next(error); }
});

export default router;
