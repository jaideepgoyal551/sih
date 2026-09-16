import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export const createToken = (user) => jwt.sign({ userId: user.id, role: user.role }, config.jwtSecret, { expiresIn: '7d' });
