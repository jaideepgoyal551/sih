import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', authenticate, authorize('ADMIN'), async (req, res, next) => {
    try {
        const [users, problems, pilots, startups, proposals, auditLogs] = await Promise.all([
            prisma.user.count(),
            prisma.problemStatement.count(),
            prisma.pilot.count(),
            prisma.startup.count(),
            prisma.proposal.count(),
            prisma.auditLog.count()
        ]);

        res.json({ users, problems, pilots, startups, proposals, auditLogs });
    } catch (error) { next(error); }
});

router.get('/users', authenticate, authorize('ADMIN'), async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(users);
    } catch (error) { next(error); }
});

router.get('/audit-logs', authenticate, authorize('ADMIN'), async (req, res, next) => {
    try {
        const logs = await prisma.auditLog.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' } });
        res.json(logs);
    } catch (error) { next(error); }
});

export default router;
