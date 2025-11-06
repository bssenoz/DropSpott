import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs'; 
import * as jwt from 'jsonwebtoken';
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'FALLBACK_SECRET'; 

interface AuthBody {
    email?: string;
    password?: string;
}

// POST /auth/signup
export const signup = async (req: Request<{}, {}, AuthBody>, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next({ status: 400, message: 'E-posta ve şifre zorunludur.' });
    }
    
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Belirli email adresine sahip kullanıcıyı ADMIN yap
        const ADMIN_EMAIL = 'admin@gmail.com';
        const role: Role = email === ADMIN_EMAIL ? 'ADMIN' : 'USER'; 

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                role,
            },
        });

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        
        res.status(201).json({ 
            message: `Kullanıcı başarıyla kaydedildi. Rol: ${role}`,
            token,
            user: { id: user.id, email: user.email, role: user.role }
        });
    } catch (error) {
        if ((error as any).code === 'P2002') { 
            return next({ status: 409, message: 'Bu e-posta adresi zaten kullanılıyor.' });
        }
        next({ status: 500, message: 'Kayıt işlemi başarısız.', stack: (error as Error).stack });
    }
};

// POST /auth/login
export const login = async (req: Request<{}, {}, AuthBody>, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next({ status: 400, message: 'E-posta ve şifre zorunludur.' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return next({ status: 401, message: 'E-posta veya şifre hatalı.' });
        }

        const isValid = await bcrypt.compare(password as string, user.passwordHash);
        if (!isValid) {
            return next({ status: 401, message: 'E-posta veya şifre hatalı.' });
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        
        res.json({ 
            token, 
            user: { id: user.id, email: user.email, role: user.role } 
        });

    } catch (error) {
        next({ status: 500, message: 'Giriş hatası.', stack: (error as Error).stack });
    }
};