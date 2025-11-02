
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// FIX: Corrected PrismaClient import path for ESM compatibility
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

interface JwtPayload {
    userId: string;
    email: string;
}

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                permissions: string[];
            }
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { role: true },
        });

        if (!user || !user.role) {
            return res.status(401).json({ message: 'Invalid token: user not found' });
        }
        
        const permissions = user.role.permissions;

        // Check for admin permissions. Permissions must be a non-empty array.
        if (!Array.isArray(permissions) || permissions.length === 0) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }
        
        req.user = {
            id: user.id,
            email: user.email,
            permissions: permissions as string[],
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
