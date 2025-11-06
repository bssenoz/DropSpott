import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Hata kodları ve HTTP status kodları mapping
 */
const ERROR_STATUS_MAP: Record<string, number> = {
    'NOT_FOUND': 404,
    'UNAUTHORIZED': 401,
    'FORBIDDEN': 403,
    'BAD_REQUEST': 400,
    'CONFLICT': 409,
    'CLAIM_WINDOW_CLOSED': 400,
    'CLAIM_WINDOW_NOT_OPEN': 400,
    'NOT_ON_WAITLIST': 400,
    'POSITION_TOO_HIGH': 400,
    'NOT_YOUR_TURN': 400,
    'STOCK_EXHAUSTED': 400,
};

/**
 * Hata mesajları mapping
 */
const ERROR_MESSAGE_MAP: Record<string, string> = {
    'NOT_FOUND': 'Kaynak bulunamadı.',
    'UNAUTHORIZED': 'Yetkilendirme gereklidir.',
    'FORBIDDEN': 'Bu işlem için yetkiniz yok.',
    'BAD_REQUEST': 'Geçersiz istek.',
    'CONFLICT': 'Kaynak çakışması.',
    'CLAIM_WINDOW_CLOSED': 'Bu drop için claim window kapanmıştır.',
    'CLAIM_WINDOW_NOT_OPEN': 'Claim penceresi şu anda açık değil.',
    'NOT_ON_WAITLIST': 'Bu drop için waitlist\'te değilsiniz.',
    'POSITION_TOO_HIGH': 'Pozisyonunuz stock miktarını aşıyor.',
    'NOT_YOUR_TURN': 'Sıranız henüz gelmedi. Claim code\'lar sırayla verilmektedir.',
    'STOCK_EXHAUSTED': 'Drop stoku tükenmiştir.',
};

/**
 * Idempotent error handler callback tipi
 * P2002 hatası durumunda mevcut kaydı döndürmek için kullanılır
 */
export type IdempotentHandler<T = any> = (
    userId: string | undefined,
    resourceId: string,
    tx?: any
) => Promise<T | null>;


export interface IApiErrorHandlerOptions {
    customMessages?: Record<string, string>;
    idempotentHandler?: IdempotentHandler; //Idempotent handler callback (P2002 hatası için)
    logError?: (error: any, context?: any) => void;
    defaultMessage?: string;
    context?: string; //Context bilgisi (loglama için)
}

/**
 * Genel API Error Handler
 * Tüm API endpoint'lerinde kullanılabilecek ortak error handler
 * 
 * @param error - Yakalanan hata
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next
 * @param options - Handler seçenekleri
 */
export const apiErrorHandler = async (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction,
    options: IApiErrorHandlerOptions = {}
) => {
    const {
        customMessages = {},
        idempotentHandler,
        logError,
        defaultMessage = 'İşlem sırasında bir hata oluştu.',
        context = 'API'
    } = options;

    const messages = { ...ERROR_MESSAGE_MAP, ...customMessages };

    const errorMessage = error.message || 'UNKNOWN_ERROR';
    const statusCode = ERROR_STATUS_MAP[errorMessage] || error.status || 500;
    const message = messages[errorMessage] || error.message || defaultMessage;

    // Prisma unique constraint hatası (race condition durumunda)
    if (error.code === 'P2002' && idempotentHandler) {
        try {
            const userId = (req as any).userId;
            const resourceId = req.params?.id || req.params?.dropId || '';
            
            const existingResource = await idempotentHandler(userId, resourceId);
            
            if (existingResource) {
                return res.status(200).json({
                    message: 'Kaynak zaten mevcut.',
                    code: 'ALREADY_EXISTS',
                    ...existingResource
                });
            }
        } catch (prismaError) {
            if (logError) {
                logError(prismaError, { context: `${context} - Idempotent Handler` });
            } else {
                console.error(`Prisma error in ${context} idempotent handler:`, prismaError);
            }
        }
    }
    const errorResponse: any = {
        message,
        code: errorMessage
    };

    if (process.env.NODE_ENV === 'development' && error.stack) {
        errorResponse.stack = error.stack;
    }

    if (logError) {
        logError(error, { context, statusCode, errorMessage });
    } else {
        console.error(`${context} hatası:`, {
            message: errorMessage,
            status: statusCode,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }

    res.status(statusCode).json(errorResponse);
};

/**
 * Claim Drop için özel error handler
 * apiErrorHandler'ı claim drop'a özel seçeneklerle kullanır
 */
export const claimDropErrorHandler = async (
    error: any,
    userId: string | undefined,
    dropId: string,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const idempotentHandler: IdempotentHandler = async (userId, resourceId) => {
        const existingClaimCode = await prisma.claimCode.findFirst({
            where: {
                userId: userId!,
                dropId: resourceId
            }
        });

        if (existingClaimCode) {
            return {
                claimCode: existingClaimCode
            };
        }
        return null;
    };

    const customMessages: Record<string, string> = {
        'NOT_FOUND': 'Drop bulunamadı.',
        'ALREADY_EXISTS': 'Zaten claim code\'unuz mevcut.'
    };

    await apiErrorHandler(error, req, res, next, {
        customMessages,
        idempotentHandler,
        context: 'Claim Drop',
        defaultMessage: 'Claim işlemi sırasında bir hata oluştu.'
    });
};
