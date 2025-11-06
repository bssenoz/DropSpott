import crypto from 'crypto';

/**
 * Seed değerini hesaplar
 * Format: <remote_url>|<first_commit_epoch>|<start_time>
 *
 * Amaç:
 * - Deterministik (tekrar üretilebilir) bir seed oluşturmak
 * - Ortamlar arası tutarlılık sağlamak (dev/stage/prod aynı seed)
 * - Priority score hesaplamasında kullanılan katsayıları (A, B, C) sabitlemek
 *
 * Kullanım Akışı:
 * 1. generateSeed() → Seed değeri üretilir
 * 2. calculateCoefficients() → Seed'den A, B, C katsayıları hesaplanır
 * 3. getSeedConfig() → Seed ve katsayılar birlikte döndürülür
 * 4. config/seed.ts → Katsayılar export edilir (COEFFICIENT_A, B, C)
 * 5. utils/priorityScore.ts → Katsayılar import edilip priority score hesaplamasında kullanılır
 *
 * Örnek Kullanım:
 * - Priority Score = 1000 + (signup_latency_ms % A) + (account_age_days % B) - (rapid_actions % C)
 * - A, B, C katsayıları seed'den türetilir ve tüm ortamlarda aynıdır
 */
export function generateSeed(): string {
    const remote = 'https://github.com/bssenoz/DropSpott.git'; // Proje remote URL'i
    const epoch = '1762355373'; // İlk commit zaman damgası (epoch)
    const start = '202511040900'; // Proje başlangıç zamanı (YYYYMMDDHHmm)
    
    const raw = `${remote}|${epoch}|${start}`;
    // SHA256 ile hash'leyip ilk 12 hex karakteri alıyoruz
    const seed = crypto.createHash('sha256').update(raw).digest('hex').substring(0, 12);
    
    return seed;
}

/**
 * Seed'den katsayıları hesaplar
 *
 * Amaç:
 * - A, B, C katsayılarının rastgele ama deterministik olması
 * - Modül değerlerinin anlamlı aralıklarda kalması (alt/üst sınırlar)
 *
 * Kullanım:
 * - Bu katsayılar priorityScore.ts'de import edilir
 * - Priority score hesaplamasında modül operatörü (%) ile kullanılır
 * - Örnek: signupLatencyMs % COEFFICIENT_A
 */
export function calculateCoefficients(seed: string): { A: number; B: number; C: number } {
    const A = 7 + (parseInt(seed.substring(0, 2), 16) % 5);
    const B = 13 + (parseInt(seed.substring(2, 4), 16) % 7);
    const C = 3 + (parseInt(seed.substring(4, 6), 16) % 3);
    
    return { A, B, C };
}

/**
 * Seed ve katsayıları döndürür
 */
export function getSeedConfig() {
    const seed = generateSeed();
    const coefficients = calculateCoefficients(seed);
    
    return {
        seed,
        ...coefficients
    };
}
