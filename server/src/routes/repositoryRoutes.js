import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
    try {
        const pilots = await prisma.pilot.findMany({
            include: {
                proposal: { include: { problem: true, startup: true } },
                procurement: true,
                kpis: true
            },
            where: { status: 'COMPLETED' }
        });

        const repository = pilots.map((pilot) => ({
            id: pilot.id,
            problem: pilot.proposal.problem.title,
            startup: pilot.proposal.startup.startupName,
            solution: pilot.proposal.title,
            pilotDuration: '12 weeks',
            kpis: pilot.kpis,
            outcome: pilot.procurement?.decision || 'SCALE',
            readiness: pilot.procurement?.readinessScore || 0
        }));

        res.json(repository);
    } catch (error) { next(error); }
});

export default router;
