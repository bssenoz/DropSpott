import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';

// Ortam değişkenlerini yükle
dotenv.config();

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


// Genel Hata Yakalama
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Sunucu Tarafında Beklenmeyen Bir Hata Oluştu.',
    });
});

app.listen(port, () => {
    console.log(`DropSpot Backend http://localhost:${port} adresinde çalışıyor.`);
});