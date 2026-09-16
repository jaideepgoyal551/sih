import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
    try {
        const startups = await prisma.startup.findMany({
            include: { user: true, proposals: true },
            orderBy: { verified: 'desc' }
        });
        res.json(startups);
    } catch (error) { next(error); }
});

router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const startup = await prisma.startup.findUnique({
            where: { id: req.params.id },
            include: { user: true, proposals: { include: { problem: true } } }
        });
        if (!startup) return res.status(404).json({ message: 'Startup not found' });
        res.json(startup);
    } catch (error) { next(error); }
});

export default router;
