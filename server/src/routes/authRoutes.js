import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { createToken } from '../utils/auth.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    next();
};

router.post('/register', [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['GOVERNMENT', 'STARTUP', 'EVALUATOR', 'ADMIN'])
], handleValidation, async (req, res, next) => {
    try {
        const { name, email, password, role, departmentName, departmentType, designation, startupName, industry, technologies, description, website, location, organization, projectType } = req.body;

        const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (existing) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        let userData = {
            name,
            email: email.toLowerCase(),
            passwordHash,
            role
        };

        if (role === 'GOVERNMENT') {
            userData = {
                ...userData,
                governmentDepartment: {
                    create: {
                        departmentName: departmentName || name,
                        departmentType: departmentType || 'General',
                        designation: designation || 'Officer',
                        description: ''
                    }
                }
            };
        }

        if (role === 'STARTUP') {
            userData = {
                ...userData,
                startup: {
                    create: {
                        startupName: startupName || name,
                        industry: industry || 'Technology',
                        technologies: technologies || '',
                        description: description || '',
                        website: website || '',
                        location: location || '',
                        verified: false
                    }
                }
            };
        }

        if (role === 'ADMIN' && email.toLowerCase() !== 'admin@innovprocure.gov') {
            return res.status(403).json({ message: 'Admin registration is restricted' });
        }

        const user = await prisma.user.create({
            data: userData,
            include: { governmentDepartment: true, startup: true }
        });

        const token = createToken(user);
        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        next(error);
    }
});

router.post('/login', [
    body('email').isEmail(),
    body('password').notEmpty()
], handleValidation, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: { governmentDepartment: true, startup: true }
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = createToken(user);
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        next(error);
    }
});

router.get('/me', authenticate, async (req, res) => {
    res.json({ user: req.user });
});

export default router;
