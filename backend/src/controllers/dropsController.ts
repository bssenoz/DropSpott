import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { calculatePriorityScore } from '../utils/priorityScore';
import { claimDropErrorHandler, apiErrorHandler } from '../utils/apiErrorHandler';
import {
    findDropById,
    findWaitlistEntry,
    isClaimWindowOpen,
    isClaimWindowClosed,
    generateUniqueClaimCode,
    recalculateWaitlistPositions,
    requireAuth
} from '../utils/dropHelpers';

const prisma = new PrismaClient();

/**
 * GET /drops - Aktif drop listesi (pagination destekli)
 */
export const getActiveDrops = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.userId;
    
    try {
        requireAuth(userId);
        
        const now = new Date();
        
        // Pagination parametreleri
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // Toplam kayıt sayısını al
        const total = await prisma.drop.count({
            where: {
                claimWindowEnd: {
                    gt: now
                }
            }
        });

        // Pagination ile drop'ları getir
        const drops = await prisma.drop.findMany({
            where: {
                claimWindowEnd: {
                    gt: now
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                _count: {
                    select: {
                        waitlistEntries: true
                    }
                }
            },
            skip,
            take: limit
        });

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            message: 'Aktif drop\'lar başarıyla getirildi.',
            drops,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error: any) {
        await apiErrorHandler(error, req, res, next, {
            context: 'Get Active Drops',
            defaultMessage: 'Drop\'lar listelenirken bir hata oluştu.',
            customMessages: {
                'UNAUTHORIZED': 'Yetkilendirme gereklidir.'
            }
        });
    }
};

/**
 * POST /drops/:id/join - Waitlist'e katılma
 */
export const joinWaitlist = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    const { id: dropId } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    try {
        requireAuth(userId);

        // Admin kullanıcıları waitlist'e katılamaz
        if (userRole === 'ADMIN') {
            return res.status(403).json({
                message: 'Admin kullanıcıları waitlist\'e katılamaz.'
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            const drop = await findDropById(dropId, tx);

            const now = new Date();
            if (isClaimWindowClosed(drop, now)) {
                throw new Error('CLAIM_WINDOW_CLOSED');
            }

            const existingEntry = await findWaitlistEntry(userId, dropId, tx);

            if (existingEntry) {
                return {
                    entry: existingEntry,
                    message: 'Zaten waitlist\'tesiniz.'
                };
            }

            const priorityScore = await calculatePriorityScore(userId, dropId, now);

            const newEntry = await tx.waitlistEntry.create({
                data: {
                    userId,
                    dropId,
                    position: 0,
                    priorityScore
                }
            });

            // Pozisyonları güncelle
            await recalculateWaitlistPositions(dropId, tx);

            const entry = await tx.waitlistEntry.findUnique({
                where: { id: newEntry.id }
            });

            return {
                entry: entry!,
                message: 'Waitlist\'e başarıyla katıldınız.'
            };
        });

        res.status(200).json({
            message: result.message,
            entry: result.entry
        });
    } catch (error: any) {
        // Idempotent handler: mevcut entry varsa döndür
        const idempotentHandler = async (userId: string | undefined, resourceId: string) => {
            const entry = await findWaitlistEntry(userId!, resourceId);
            return entry ? { entry } : null;
        };

        await apiErrorHandler(error, req, res, next, {
            context: 'Join Waitlist',
            defaultMessage: 'Waitlist\'e katılırken bir hata oluştu.',
            idempotentHandler,
            customMessages: {
                'NOT_FOUND': 'Drop bulunamadı.',
                'UNAUTHORIZED': 'Yetkilendirme gereklidir.'
            }
        });
    }
};

/**
 * GET /drops/:id/waitlist-status - Waitlist durumu
 */
export const getWaitlistStatus = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    const { id: dropId } = req.params;
    const userId = req.userId;

    try {
        requireAuth(userId);

        const entry = await findWaitlistEntry(userId, dropId);

        // Claim code kontrolü
        const claimCode = await prisma.claimCode.findFirst({
            where: {
                userId,
                dropId
            }
        });

        res.status(200).json({
            isOnWaitlist: !!entry,
            entry: entry || null,
            claimCode: claimCode || null
        });
    } catch (error: any) {
        await apiErrorHandler(error, req, res, next, {
            context: 'Get Waitlist Status',
            defaultMessage: 'Waitlist durumu kontrol edilirken bir hata oluştu.',
            customMessages: {
                'UNAUTHORIZED': 'Yetkilendirme gereklidir.'
            }
        });
    }
};

/**
 * POST /drops/:id/leave - Waitlist'ten ayrılma
 */
export const leaveWaitlist = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    const { id: dropId } = req.params;
    const userId = req.userId;

    try {
        requireAuth(userId);

        const result = await prisma.$transaction(async (tx) => {
            const entry = await findWaitlistEntry(userId, dropId, tx);

            if (!entry) {
                return {
                    message: 'Zaten waitlist\'te değilsiniz.'
                };
            }

            // Claim code kontrolü - claim code varsa waitlist'ten ayrılamaz
            const existingClaimCode = await tx.claimCode.findFirst({
                where: {
                    userId,
                    dropId
                }
            });

            if (existingClaimCode) {
                throw new Error('HAS_CLAIM_CODE');
            }

            const position = entry.position;

            await tx.waitlistEntry.delete({
                where: {
                    userId_dropId: {
                        userId,
                        dropId
                    }
                }
            });

            // Pozisyonları güncelle
            await tx.$executeRaw`
                UPDATE WaitlistEntry 
                SET position = position - 1 
                WHERE dropId = ${dropId} AND position > ${position}
            `;

            return {
                message: 'Waitlist\'ten başarıyla ayrıldınız.'
            };
        });

        res.status(200).json({
            message: result.message
        });
    } catch (error: any) {
        await apiErrorHandler(error, req, res, next, {
            context: 'Leave Waitlist',
            defaultMessage: 'Waitlist\'ten ayrılırken bir hata oluştu.',
            customMessages: {
                'UNAUTHORIZED': 'Yetkilendirme gereklidir.',
                'HAS_CLAIM_CODE': 'Claim kodunuz olduğu için waitlist\'ten ayrılamazsınız.'
            }
        });
    }
};

/**
 * POST /drops/:id/claim - Claim code alma
 */
export const claimDrop = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    const { id: dropId } = req.params;
    const userId = req.userId;

    try {
        requireAuth(userId);

        // Transaction ile race condition önleme ve idempotency
        const result = await prisma.$transaction(async (tx) => {
            const drop = await findDropById(dropId, tx);

            const now = new Date();
            if (!isClaimWindowOpen(drop, now)) {
                throw new Error('CLAIM_WINDOW_NOT_OPEN');
            }

            // Mevcut claim code kontrolü (idempotency)
            const existingClaimCode = await tx.claimCode.findFirst({
                where: {
                    userId,
                    dropId
                }
            });

            if (existingClaimCode) {
                return {
                    claimCode: existingClaimCode,
                    message: 'Zaten claim code\'unuz mevcut.'
                };
            }

            // Waitlist kontrolü
            const waitlistEntry = await findWaitlistEntry(userId, dropId, tx);

            if (!waitlistEntry) {
                throw new Error('NOT_ON_WAITLIST');
            }

            // Claim sayısı kontrolü (transaction içinde race condition önlenir)
            const claimedCount = await tx.claimCode.count({
                where: { dropId }
            });

            // Stock kontrolü
            if (claimedCount >= drop.stock) {
                throw new Error('STOCK_EXHAUSTED');
            }

            // Pozisyon kontrolü
            if (waitlistEntry.position > drop.stock) {
                throw new Error('POSITION_TOO_HIGH');
            }

            // Sıralı claim kontrolü: pozisyon = claimedCount + 1 olmalı
            if (waitlistEntry.position !== claimedCount + 1) {
                throw new Error('NOT_YOUR_TURN');
            }

            // Benzersiz claim code oluştur ve kaydet
            const code = await generateUniqueClaimCode(tx);
            const claimCode = await tx.claimCode.create({
                data: {
                    code,
                    userId,
                    dropId
                }
            });

            return {
                claimCode,
                message: 'Claim code başarıyla oluşturuldu.'
            };
        });

        res.status(200).json({
            message: result.message,
            claimCode: result.claimCode
        });
    } catch (error: any) {
        // Transaction conflict durumu
        if (error.code === 'P2034') {
            return res.status(409).json({
                message: 'Başka bir işlem devam ediyor. Lütfen tekrar deneyin.',
                code: 'TRANSACTION_CONFLICT'
            });
        }

        await claimDropErrorHandler(error, userId, dropId, req, res, next);
    }
};

