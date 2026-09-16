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
        const proposals = await prisma.proposal.findMany({
            include: { problem: true, startup: true, evaluation: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(proposals);
    } catch (error) { next(error); }
});

router.post('/', authenticate, authorize('STARTUP'), [
    body('problemId').notEmpty(),
    body('title').trim().notEmpty(),
    body('solutionDescription').trim().notEmpty(),
    body('technicalApproach').trim().notEmpty()
], validate, async (req, res, next) => {
    try {
        const startup = await prisma.startup.findUnique({ where: { userId: req.user.id } });
        if (!startup) return res.status(400).json({ message: 'Startup profile not found' });

        const problem = await prisma.problemStatement.findUnique({ where: { id: req.body.problemId } });
        if (!problem) return res.status(404).json({ message: 'Problem not found' });
        if (problem.status !== 'PUBLISHED') return res.status(400).json({ message: 'Proposals are accepted only for published problems' });

        const proposal = await prisma.proposal.create({
            data: {
                problemId: req.body.problemId,
                startupId: startup.id,
                title: req.body.title,
                solutionDescription: req.body.solutionDescription,
                technicalApproach: req.body.technicalApproach,
                technologies: req.body.technologies || '',
                estimatedCost: req.body.estimatedCost ? Number(req.body.estimatedCost) : null,
                timeline: req.body.timeline || '',
                expectedImpact: req.body.expectedImpact || '',
                status: 'SUBMITTED'
            }
        });

        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'Proposal Submitted',
                entityType: 'Proposal',
                entityId: proposal.id,
                metadata: { problemId: problem.id }
            }
        });

        res.status(201).json(proposal);
    } catch (error) { next(error); }
});

router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const proposal = await prisma.proposal.findUnique({
            where: { id: req.params.id },
            include: { problem: true, startup: true, evaluation: true }
        });
        if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
        res.json(proposal);
    } catch (error) { next(error); }
});

router.put('/:id', authenticate, authorize('STARTUP'), async (req, res, next) => {
    try {
        const proposal = await prisma.proposal.findUnique({ where: { id: req.params.id } });
        if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
        const startup = await prisma.startup.findUnique({ where: { userId: req.user.id } });
        if (!startup || proposal.startupId !== startup.id) return res.status(403).json({ message: 'You can only edit your own proposals' });
        if (proposal.status !== 'SUBMITTED' && proposal.status !== 'UNDER_REVIEW') {
            return res.status(400).json({ message: 'Proposal cannot be edited after evaluation begins' });
        }

        const updated = await prisma.proposal.update({
            where: { id: req.params.id },
            data: {
                title: req.body.title || proposal.title,
                solutionDescription: req.body.solutionDescription || proposal.solutionDescription,
                technicalApproach: req.body.technicalApproach || proposal.technicalApproach,
                technologies: req.body.technologies || proposal.technologies,
                estimatedCost: req.body.estimatedCost ? Number(req.body.estimatedCost) : proposal.estimatedCost,
                timeline: req.body.timeline || proposal.timeline,
                expectedImpact: req.body.expectedImpact || proposal.expectedImpact,
                status: req.body.status || proposal.status
            }
        });

        res.json(updated);
    } catch (error) { next(error); }
});

export default router;
