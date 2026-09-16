import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const readinessForPilot = (pilot) => {
    const kpiAchievement = pilot.kpis.length
        ? pilot.kpis.reduce((sum, kpi) => sum + Math.min(100, (Number(kpi.actualValue || 0) / Math.max(Number(kpi.targetValue || 1), 1)) * 100), 0) / pilot.kpis.length
        : 0;
    const technicalReadiness = Math.min(100, Math.round(70 + (pilot.overallProgress || 0) * 0.3));
    const financialReadiness = Math.min(100, Math.round(65 + (pilot.budget ? 20 : 0) + (kpiAchievement >= 80 ? 10 : 0)));
    const scalabilityReadiness = Math.min(100, Math.round(60 + kpiAchievement * 0.35));
    const complianceReadiness = Math.min(100, Math.round(75 + (pilot.status === 'COMPLETED' ? 20 : 0)));
    const readinessScore = Math.round((technicalReadiness + financialReadiness + scalabilityReadiness + complianceReadiness + kpiAchievement) / 5);

    return { readinessScore, technicalReadiness, financialReadiness, scalabilityReadiness, complianceReadiness, kpiAchievement: Math.round(kpiAchievement) };
};

router.get('/:pilotId', authenticate, async (req, res, next) => {
    try {
        const pilot = await prisma.pilot.findUnique({ where: { id: req.params.pilotId }, include: { kpis: true, procurement: true } });
        if (!pilot) return res.status(404).json({ message: 'Pilot not found' });
        res.json({ ...readinessForPilot(pilot), procurement: pilot.procurement });
    } catch (error) { next(error); }
});

router.post('/:pilotId/decision', authenticate, authorize('GOVERNMENT'), [
    body('decision').isIn(['SCALE', 'EXTEND_PILOT', 'MODIFY', 'CLOSE'])
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid procurement decision', errors: errors.array() });

        const pilot = await prisma.pilot.findUnique({ where: { id: req.params.pilotId }, include: { kpis: true } });
        if (!pilot) return res.status(404).json({ message: 'Pilot not found' });

        const scores = readinessForPilot(pilot);
        const { kpiAchievement, ...procurementScores } = scores;
        const procurement = await prisma.procurement.upsert({
            where: { pilotId: pilot.id },
            update: { ...procurementScores, decision: req.body.decision, comments: req.body.comments || '' },
            create: { pilotId: pilot.id, ...procurementScores, decision: req.body.decision, comments: req.body.comments || '' }
        });

        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'Procurement Decision Made',
                entityType: 'Procurement',
                entityId: procurement.id,
                metadata: { pilotId: pilot.id, decision: procurement.decision, readinessScore: procurement.readinessScore }
            }
        });

        res.status(201).json({ procurement, scores });
    } catch (error) { next(error); }
});

export default router;