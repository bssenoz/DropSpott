import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'FALLBACK_SECRET';

interface JwtPayload {
    userId: string;
    role: string;
}

// Request tipini genişlet
declare global {
    namespace Express {
        interface Request {
            userId?: string;
            userRole?: string;
        }
    }
}

// Genel authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Yetkilendirme token\'ı bulunamadı.' });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        // Kullanıcıyı veritabanından kontrol et
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, role: true }
        });

        if (!user) {
            return res.status(401).json({ message: 'Geçersiz token.' });
        }

        req.userId = user.id;
        req.userRole = user.role;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token.' });
    }
};

// Admin-only middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.userRole !== 'ADMIN') {
        return res.status(403).json({ message: 'Bu işlem için admin yetkisi gereklidir.' });
    }
    next();
};

