import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ICreateDropBody {
    title: string;
    description?: string;
    stock: number;
    claimWindowStart: string; // ISO date string
    claimWindowEnd: string; // ISO date string
}

interface IUpdateDropBody {
    title?: string;
    description?: string;
    stock?: number;
    claimWindowStart?: string;
    claimWindowEnd?: string;
}

// POST /admin/drops - Yeni drop oluştur (idempotent)
export const createDrop = async (
    req: Request<{}, {}, ICreateDropBody>,
    res: Response,
    next: NextFunction
) => {
    const { title, description, stock, claimWindowStart, claimWindowEnd } = req.body;

    if (!title || stock === undefined || !claimWindowStart || !claimWindowEnd) {
        return res.status(400).json({
            message: 'title, stock, claimWindowStart ve claimWindowEnd alanları zorunludur.'
        });
    }

    if (stock < 0) {
        return res.status(400).json({
            message: 'Stock değeri 0 veya pozitif olmalıdır.'
        });
    }

    const startDate = new Date(claimWindowStart);
    const endDate = new Date(claimWindowEnd);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
            message: 'Geçersiz tarih formatı. ISO 8601 formatı kullanın.'
        });
    }

    if (startDate >= endDate) {
        return res.status(400).json({
            message: 'claimWindowStart, claimWindowEnd\'den önce olmalıdır.'
        });
    }

    try {
        // Transaction kullanarak idempotent işlem
        // Aynı title ve tarihlerle drop var mı kontrol et
        const existingDrop = await prisma.drop.findFirst({
            where: {
                title,
                claimWindowStart: startDate,
                claimWindowEnd: endDate
            }
        });

        if (existingDrop) {
            // Idempotent: Aynı drop zaten varsa, mevcut drop'u döndür
            return res.status(200).json({
                message: 'Bu drop zaten mevcut.',
                drop: existingDrop
            });
        }

        // Transaction içinde yeni drop oluştur
        const drop = await prisma.$transaction(async (tx) => {
            // Double-check pattern: Transaction içinde tekrar kontrol et
            const checkDrop = await tx.drop.findFirst({
                where: {
                    title,
                    claimWindowStart: startDate,
                    claimWindowEnd: endDate
                }
            });

            if (checkDrop) {
                return checkDrop;
            }

            return await tx.drop.create({
                data: {
                    title,
                    description,
                    stock,
                    claimWindowStart: startDate,
                    claimWindowEnd: endDate
                }
            });
        });

        res.status(201).json({
            message: 'Drop başarıyla oluşturuldu.',
            drop
        });
    } catch (error) {
        console.error('Drop oluşturma hatası:', error);
        next({
            status: 500,
            message: 'Drop oluşturulurken bir hata oluştu.',
            stack: (error as Error).stack
        });
    }
};

// PUT /admin/drops/:id - Drop güncelle (idempotent)
export const updateDrop = async (
    req: Request<{ id: string }, {}, IUpdateDropBody>,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    const { title, description, stock, claimWindowStart, claimWindowEnd } = req.body;

    // Validasyon
    if (stock !== undefined && stock < 0) {
        return res.status(400).json({
            message: 'Stock değeri 0 veya pozitif olmalıdır.'
        });
    }

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (claimWindowStart) {
        startDate = new Date(claimWindowStart);
        if (isNaN(startDate.getTime())) {
            return res.status(400).json({
                message: 'Geçersiz claimWindowStart tarih formatı.'
            });
        }
    }

    if (claimWindowEnd) {
        endDate = new Date(claimWindowEnd);
        if (isNaN(endDate.getTime())) {
            return res.status(400).json({
                message: 'Geçersiz claimWindowEnd tarih formatı.'
            });
        }
    }

    if (startDate && endDate && startDate >= endDate) {
        return res.status(400).json({
            message: 'claimWindowStart, claimWindowEnd\'den önce olmalıdır.'
        });
    }

    try {
        // Transaction kullanarak idempotent güncelleme
        const drop = await prisma.$transaction(async (tx) => {
            // Drop'u kontrol et
            const existingDrop = await tx.drop.findUnique({
                where: { id }
            });

            if (!existingDrop) {
                return null;
            }

            // Güncelleme verilerini hazırla
            const updateData: any = {};
            if (title !== undefined) updateData.title = title;
            if (description !== undefined) updateData.description = description;
            if (stock !== undefined) updateData.stock = stock;
            if (startDate) updateData.claimWindowStart = startDate;
            if (endDate) updateData.claimWindowEnd = endDate;

            // Eğer hiçbir değişiklik yoksa (idempotent), mevcut drop'u döndür
            const hasChanges = 
                (title !== undefined && title !== existingDrop.title) ||
                (description !== undefined && description !== existingDrop.description) ||
                (stock !== undefined && stock !== existingDrop.stock) ||
                (startDate && startDate.getTime() !== existingDrop.claimWindowStart.getTime()) ||
                (endDate && endDate.getTime() !== existingDrop.claimWindowEnd.getTime());

            if (!hasChanges) {
                return existingDrop;
            }

            // Drop'u güncelle
            return await tx.drop.update({
                where: { id },
                data: updateData
            });
        });

        if (!drop) {
            return res.status(404).json({
                message: 'Drop bulunamadı.'
            });
        }

        res.status(200).json({
            message: 'Drop başarıyla güncellendi.',
            drop
        });
    } catch (error) {
        console.error('Drop güncelleme hatası:', error);
        next({
            status: 500,
            message: 'Drop güncellenirken bir hata oluştu.',
            stack: (error as Error).stack
        });
    }
};

// DELETE /admin/drops/:id - Drop sil (idempotent)
export const deleteDrop = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;

    try {
        // Transaction kullanarak idempotent silme
        const result = await prisma.$transaction(async (tx) => {
            // Drop'u kontrol et
            const existingDrop = await tx.drop.findUnique({
                where: { id }
            });

            if (!existingDrop) {
                // Idempotent: Drop zaten yoksa, başarılı döndür
                return null;
            }

            // Drop'u sil (cascade ile waitlist entries ve claim codes da silinir)
            await tx.drop.delete({
                where: { id }
            });

            return existingDrop;
        });

        // Drop zaten yoksa veya silindi
        if (result === null) {
            return res.status(200).json({
                message: 'Drop zaten mevcut değil veya silindi.'
            });
        }

        res.status(200).json({
            message: 'Drop başarıyla silindi.',
            drop: result
        });
    } catch (error) {
        console.error('Drop silme hatası:', error);
        next({
            status: 500,
            message: 'Drop silinirken bir hata oluştu.',
            stack: (error as Error).stack
        });
    }
};
