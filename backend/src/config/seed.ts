/**
 * Seed Configuration
 * Bu dosya projenin seed değerini ve katsayılarını içerir.
 * Seed hesaplama: SHA256(<remote_url>|<first_commit_epoch>|<start_time>)[:12]
 */

import { getSeedConfig } from '../utils/seedGenerator';

const seedConfig = getSeedConfig();

export const SEED = seedConfig.seed;
export const COEFFICIENT_A = seedConfig.A;
export const COEFFICIENT_B = seedConfig.B;
export const COEFFICIENT_C = seedConfig.C;