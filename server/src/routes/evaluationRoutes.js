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

router.post('/', authenticate, authorize('EVALUATOR'), [
    body('proposalId').notEmpty(),
    body('innovationScore').isFloat({ min: 0, max: 100 }),
    body('technicalScore').isFloat({ min: 0, max: 100 }),
    body('feasibilityScore').isFloat({ min: 0, max: 100 }),
    body('costScore').isFloat({ min: 0, max: 100 }),
    body('scalabilityScore').isFloat({ min: 0, max: 100 }),
    body('complianceScore').isFloat({ min: 0, max: 100 })
], validate, async (req, res, next) => {
    try {
        if (req.body.conflictDeclared) {
            return res.status(400).json({ message: 'Evaluation cannot proceed when conflict is declared' });
        }

        const proposal = await prisma.proposal.findUnique({ where: { id: req.body.proposalId } });
        if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

        const evaluation = await prisma.evaluation.upsert({
            where: { proposalId: req.body.proposalId },
            update: {
                evaluatorId: req.user.id,
                innovationScore: Number(req.body.innovationScore),
                technicalScore: Number(req.body.technicalScore),
                feasibilityScore: Number(req.body.feasibilityScore),
                costScore: Number(req.body.costScore),
                scalabilityScore: Number(req.body.scalabilityScore),
                complianceScore: Number(req.body.complianceScore),
                comments: req.body.comments || '',
                conflictDeclared: Boolean(req.body.conflictDeclared)
            },
            create: {
                proposalId: req.body.proposalId,
                evaluatorId: req.user.id,
                innovationScore: Number(req.body.innovationScore),
                technicalScore: Number(req.body.technicalScore),
                feasibilityScore: Number(req.body.feasibilityScore),
                costScore: Number(req.body.costScore),
                scalabilityScore: Number(req.body.scalabilityScore),
                complianceScore: Number(req.body.complianceScore),
                comments: req.body.comments || '',
                conflictDeclared: Boolean(req.body.conflictDeclared)
            }
        });

        const total = (Number(req.body.innovationScore) * 0.2) +
            (Number(req.body.technicalScore) * 0.25) +
            (Number(req.body.costScore) * 0.15) +
            (Number(req.body.scalabilityScore) * 0.15) +
            (Number(req.body.complianceScore) * 0.1) +
            (Number(req.body.feasibilityScore) * 0.15);

        await prisma.proposal.update({
            where: { id: req.body.proposalId },
            data: { status: total >= 75 ? 'SHORTLISTED' : 'REJECTED' }
        });

        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'Evaluation Completed',
                entityType: 'Evaluation',
                entityId: evaluation.id,
                metadata: { proposalId: req.body.proposalId, finalScore: total }
            }
        });

        res.status(201).json({ evaluation, finalScore: total });
    } catch (error) { next(error); }
});

router.get('/:proposalId', authenticate, async (req, res, next) => {
    try {
        const evaluation = await prisma.evaluation.findUnique({
            where: { proposalId: req.params.proposalId },
            include: { evaluator: true, proposal: true }
        });
        if (!evaluation) return res.status(404).json({ message: 'Evaluation not found' });
        res.json(evaluation);
    } catch (error) { next(error); }
});

export default router;
