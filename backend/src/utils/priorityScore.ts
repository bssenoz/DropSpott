import { PrismaClient } from '@prisma/client';
import { COEFFICIENT_A, COEFFICIENT_B, COEFFICIENT_C } from '../config/seed';

const prisma = new PrismaClient();

/**
 * Priority score hesaplama
 * Formül: base + (signupLatencyMs % A) + (accountAgeDays % B) - (rapidActions % C)
 */
export async function calculatePriorityScore(
    userId: string,
    dropId: string,
    joinTime: Date
): Promise<number> {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new Error('User not found');
    }

    const drop = await prisma.drop.findUnique({
        where: { id: dropId }
    });

    if (!drop) {
        throw new Error('Drop not found');
    }

    const base = 1000;
    const signupLatencyMs = joinTime.getTime() - drop.createdAt.getTime();

    const accountAgeMs = joinTime.getTime() - user.createdAt.getTime();
    const accountAgeDays = Math.floor(accountAgeMs / (1000 * 60 * 60 * 24));

    // Son 5 dakikadaki aksiyon sayısı (spam koruması)
    const fiveMinutesAgo = new Date(joinTime.getTime() - 5 * 60 * 1000);
    
    const recentJoins = await prisma.waitlistEntry.count({
        where: {
            userId,
            createdAt: {
                gte: fiveMinutesAgo
            }
        }
    });

    const recentClaims = await prisma.claimCode.count({
        where: {
            userId,
            createdAt: {
                gte: fiveMinutesAgo
            }
        }
    });

    const rapidActions = recentJoins + recentClaims;

    // Formül açıklaması:
    // + (signupLatencyMs % COEFFICIENT_A) : Erken katılanlar avantajlı (pozitif)
    // + (accountAgeDays % COEFFICIENT_B)  : Eski hesaplar avantajlı (pozitif)
    // - (rapidActions % COEFFICIENT_C)    : Hızlı aksiyon yapanlar puan düşüşü (negatif)
    //
    // rapidActions düşüşü:
    // - rapidActions = 0 ise: - (0 % 4 = 0)
    // - rapidActions = 1 ise: düşüş var (1 % 4 = 1)
    // - rapidActions = 2 ise: düşüş var (2 % 4 = 2)
    // - rapidActions = 4 ise: - (4 % 4 = 0)
    const priorityScore = base 
        + (signupLatencyMs % COEFFICIENT_A)
        + (accountAgeDays % COEFFICIENT_B)
        - (rapidActions % COEFFICIENT_C);

    return priorityScore;
}

