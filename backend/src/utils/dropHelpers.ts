import { PrismaClient, Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

/**
 * Prisma transaction client tipi
 */
type PrismaTransaction = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

/**
 * Drop'u kontrol eder ve döndürür
 */
export async function findDropById(
    dropId: string,
    tx?: PrismaTransaction
): Promise<Prisma.DropGetPayload<{}>> {
    const client = tx || prisma;
    const drop = await client.drop.findUnique({
        where: { id: dropId }
    });

    if (!drop) {
        throw new Error('NOT_FOUND');
    }

    return drop;
}

/**
 * Waitlist entry'yi kontrol eder ve döndürür
 */
export async function findWaitlistEntry(
    userId: string,
    dropId: string,
    tx?: PrismaTransaction
) {
    const client = tx || prisma;
    return await client.waitlistEntry.findUnique({
        where: {
            userId_dropId: {
                userId,
                dropId
            }
        }
    });
}

/**
 * Claim window'ın açık olup olmadığını kontrol eder
 */
export function isClaimWindowOpen(
    drop: { claimWindowStart: Date; claimWindowEnd: Date },
    now: Date = new Date()
): boolean {
    return now >= drop.claimWindowStart && now <= drop.claimWindowEnd;
}

/**
 * Claim window'ın bitip bitmediğini kontrol eder
 */
export function isClaimWindowClosed(
    drop: { claimWindowEnd: Date },
    now: Date = new Date()
): boolean {
    return drop.claimWindowEnd < now;
}

/**
 * Benzersiz claim code oluşturur
 */
export async function generateUniqueClaimCode(
    tx?: PrismaTransaction
): Promise<string> {
    const client = tx || prisma;
    let code: string = '';
    let codeExists = true;
    
    while (codeExists) {
        code = randomBytes(8).toString('hex').toUpperCase();
        const existing = await client.claimCode.findUnique({
            where: { code }
        });
        codeExists = !!existing;
    }
    
    return code;
}

/**
 * Waitlist position'larını yeniden hesaplar ve günceller
 */
export async function recalculateWaitlistPositions(
    dropId: string,
    tx: PrismaTransaction
): Promise<void> {
    const allEntries = await tx.waitlistEntry.findMany({
        where: { dropId },
        orderBy: [
            { priorityScore: 'desc' },
            { createdAt: 'asc' }
        ]
    });

    // Position'ları güncelle
    for (let i = 0; i < allEntries.length; i++) {
        await tx.waitlistEntry.update({
            where: { id: allEntries[i].id },
            data: { position: i + 1 }
        });
    }
}

/**
 * Kullanıcının authenticated olup olmadığını kontrol eder
 */
export function requireAuth(userId: string | undefined): asserts userId is string {
    if (!userId) {
        throw new Error('UNAUTHORIZED');
    }
}

