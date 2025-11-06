// Seed hesaplama ve test scripti
// Bu script, sistemde deterministik (tüm ortamlarda aynı) bir seed değeri
// üretildiğini ve buradan türetilen A, B, C katsayılarının doğru hesaplandığını
// hızlıca görselleştirmek için kullanılır.
//
// Notlar:
// - Seed değeri, proje kimliğini temsil eden sabitlerden türetilir
//   (remote repo URL, ilk commit epoch, proje başlangıç zamanı)
// - Bu yaklaşım, rastgeleliğin ortamdan bağımsız ve tekrarlanabilir olmasını sağlar.
// - Priority score formülünde kullanılan A, B, C katsayıları bu seed'den türetilir.
//   Böylece üretim, staging ve lokal ortamlarda aynı hesaplamalar yapılır.
import { getSeedConfig } from '../src/utils/seedGenerator';

const config = getSeedConfig();

console.log('=== Seed Configuration ===');
console.log(`Remote: https://github.com/bssenoz/DropSpott.git`); // Projenin referans remote URL'i
console.log(`First Commit Epoch: 1762355373`); // İlk commit zaman damgası
console.log(`Start Time: 202511040900 (4 Kasım 2025, 09:00)`); // Proje başlangıç zamanı
console.log('');
console.log(`Seed: ${config.seed}`); // SHA256 ile üretilen 12 hanelik seed
console.log('');
console.log(`Coefficient A: ${config.A}`); // signup_latency_ms modülü için katsayı
console.log(`Coefficient B: ${config.B}`); // account_age_days modülü için katsayı
console.log(`Coefficient C: ${config.C}`); // rapid_actions modülü için katsayı
console.log('=========================');