import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import dropsRoutes from './routes/dropsRoutes';

// Ortam değişkenlerini yükle
dotenv.config();

const prisma = new PrismaClient();

// Admin kullanıcısını oluştur (eğer yoksa)
async function ensureAdminUser() {
    const ADMIN_EMAIL = 'admin@gmail.com';
    const ADMIN_PASSWORD = 'Admin*123';
    
    try {
        const existingAdmin = await prisma.user.findUnique({
            where: { email: ADMIN_EMAIL }
        });
        
        if (!existingAdmin) {
            const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
            await prisma.user.create({
                data: {
                    email: ADMIN_EMAIL,
                    passwordHash,
                    role: 'ADMIN',
                },
            });
        }
    } catch (error) {
        console.error('Admin kullanıcısı oluşturulurken hata:', error);
    }
}

const app = express();
const port = process.env.PORT || 5000;

// CORS ayarları
app.use(cors({
    origin: 'http://localhost:3000', // Frontend URL
    credentials: true, // Cookie ve authorization headerları için
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/drops', dropsRoutes);


// Genel Hata Yakalama
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Sunucu Tarafında Beklenmeyen Bir Hata Oluştu.',
    });
});

// Sunucuyu başlat ve admin kullanıcısını oluştur
async function startServer() {
    await ensureAdminUser();
    
    app.listen(port, () => {
        console.log(`DropSpot Backend http://localhost:${port} adresinde çalışıyor.`);
    });
}

startServer().catch((error) => {
    console.error('Sunucu başlatılırken hata:', error);
    process.exit(1);
});