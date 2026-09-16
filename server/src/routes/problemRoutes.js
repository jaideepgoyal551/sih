import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { analyzeProblem } from '../services/aiService.js';
import { computeMatchScore } from '../services/matchingService.js';

const router = express.Router();

const validateProblem = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    next();
};

router.get('/', authenticate, async (req, res, next) => {
    try {
        const problems = await prisma.problemStatement.findMany({
            include: { department: true, proposals: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(problems);
    } catch (error) { next(error); }
});

router.post('/analyze', authenticate, authorize('GOVERNMENT'), async (req, res, next) => {
    try {
        res.json({ aiAnalysis: await analyzeProblem(req.body) });
    } catch (error) { res.status(503).json({ message: error.message || 'AI analysis service unavailable', provider: process.env.AI_PROVIDER || 'configured provider' }); }
});

router.post('/', authenticate, authorize('GOVERNMENT'), [
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('category').trim().notEmpty()
], validateProblem, async (req, res, next) => {
    try {
        const department = await prisma.governmentDepartment.findUnique({ where: { userId: req.user.id } });
        if (!department) return res.status(400).json({ message: 'Government department profile not found' });

        const ai = await analyzeProblem(req.body);
        const problem = await prisma.problemStatement.create({
            data: {
                departmentId: department.id,
                title: req.body.title,
                description: req.body.description,
                category: req.body.category || ai.category,
                technologyRequirements: Array.isArray(req.body.technologyRequirements) ? req.body.technologyRequirements.join(',') : (req.body.technologyRequirements || ai.technologies.join(',')),
                objectives: req.body.objectives || '',
                expectedOutcomes: req.body.expectedOutcomes || '',
                budget: req.body.budget ? Number(req.body.budget) : 0,
                duration: req.body.duration || ai.pilotDuration,
                eligibilityCriteria: req.body.eligibilityCriteria || '',
                status: req.body.status || 'DRAFT'
            }
        });

        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'Problem Created',
                entityType: 'ProblemStatement',
                entityId: problem.id,
                metadata: { aiAnalysis: ai }
            }
        });

        res.status(201).json({ problem, aiAnalysis: ai });
    } catch (error) { next(error); }
});

router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const problem = await prisma.problemStatement.findUnique({
            where: { id: req.params.id },
            include: { department: true, proposals: { include: { startup: true } } }
        });
        if (!problem) return res.status(404).json({ message: 'Problem not found' });
        res.json(problem);
    } catch (error) { next(error); }
});

router.put('/:id', authenticate, authorize('GOVERNMENT'), async (req, res, next) => {
    try {
        const existing = await prisma.problemStatement.findUnique({ where: { id: req.params.id } });
        if (!existing) return res.status(404).json({ message: 'Problem not found' });

        const department = await prisma.governmentDepartment.findUnique({ where: { userId: req.user.id } });
        if (existing.departmentId !== department.id) return res.status(403).json({ message: 'Not allowed' });

        const problem = await prisma.problemStatement.update({
            where: { id: req.params.id },
            data: {
                title: req.body.title || existing.title,
                description: req.body.description || existing.description,
                category: req.body.category || existing.category,
                technologyRequirements: req.body.technologyRequirements || existing.technologyRequirements,
                objectives: req.body.objectives || existing.objectives,
                expectedOutcomes: req.body.expectedOutcomes || existing.expectedOutcomes,
                budget: req.body.budget ? Number(req.body.budget) : existing.budget,
                duration: req.body.duration || existing.duration,
                eligibilityCriteria: req.body.eligibilityCriteria || existing.eligibilityCriteria,
                status: req.body.status || existing.status
            }
        });

        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'Problem Updated',
                entityType: 'ProblemStatement',
                entityId: problem.id,
                metadata: { updates: req.body }
            }
        });

        res.json(problem);
    } catch (error) { next(error); }
});

router.post('/:id/publish', authenticate, authorize('GOVERNMENT'), async (req, res, next) => {
    try {
        const problem = await prisma.problemStatement.update({
            where: { id: req.params.id },
            data: { status: 'PUBLISHED' }
        });

        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'Problem Published',
                entityType: 'ProblemStatement',
                entityId: problem.id,
                metadata: { title: problem.title }
            }
        });

        res.json(problem);
    } catch (error) { next(error); }
});

router.get('/:id/matches', authenticate, async (req, res, next) => {
    try {
        const problem = await prisma.problemStatement.findUnique({ where: { id: req.params.id } });
        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        const startups = await prisma.startup.findMany({
            include: { user: true }
        });

        const matches = startups
            .map((startup) => ({ startup, score: computeMatchScore(problem, startup) }))
            .filter((result) => result.score.overall >= 60)
            .sort((a, b) => b.score.overall - a.score.overall)
            .map(({ startup, score }) => ({
                id: startup.id,
                startupName: startup.startupName,
                industry: startup.industry,
                location: startup.location,
                verified: startup.verified,
                ...score
            }));

        res.json(matches);
    } catch (error) { next(error); }
});

export default router;
