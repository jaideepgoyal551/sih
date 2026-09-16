import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import authRoutes from './routes/authRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import startupRoutes from './routes/startupRoutes.js';
import proposalRoutes from './routes/proposalRoutes.js';
import evaluationRoutes from './routes/evaluationRoutes.js';
import pilotRoutes from './routes/pilotRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import repositoryRoutes from './routes/repositoryRoutes.js';
import procurementRoutes from './routes/procurementRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many auth requests, please try again later' }
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/startups', startupRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/pilots', pilotRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/repository', repositoryRoutes);
app.use('/api/procurement', procurementRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`InnovProcure server running on http://localhost:${config.port}`);
});
