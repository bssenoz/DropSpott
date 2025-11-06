'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydration hatasını önlemek için client-side mounting'i bekle
  const showAuthenticated = mounted && isAuthenticated;

  const handleViewDrops = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else {
      router.push('/drops');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          {showAuthenticated ? `Hoş Geldiniz, ${user?.email?.split('@')[0]}!` : "DropSpot'a Hoş Geldiniz"}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {showAuthenticated 
            ? "Aktif drop'ları keşfedin ve waitlist'e katılarak sınırlı stok fırsatlarından yararlanın."
            : "Özel ürünler ve etkinlikler için sınırlı stok fırsatları. Waitlist'e katılın, claim window'da hak kazanın."
          }
        </p>
        {showAuthenticated ? (
          <div className="flex gap-4 justify-center">
            <Link
              href="/drops"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md"
            >
              Drop'ları Görüntüle
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/login"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md"
            >
              Giriş Yap
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Kayıt Ol
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Waitlist Sistemi</h3>
          <p className="text-gray-600 text-sm">
            İstediğiniz drop için waitlist'e katılın ve sıranızı alın. Stok sınırlı olduğu için erken katılım önemlidir.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Claim Window</h3>
          <p className="text-gray-600 text-sm">
            Belirlenen tarih aralığında claim window açılır. Waitlist sıranız stok içindeyse ürünü claim edebilirsiniz.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sınırlı Stok</h3>
          <p className="text-gray-600 text-sm">
            Her drop için belirli bir stok miktarı vardır. Waitlist'teki sıranız stok içindeyse claim hakkı kazanırsınız.
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Nasıl Çalışır?</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
              1
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Kayıt Ol</h4>
            <p className="text-sm text-gray-600">
              Hesap oluşturun ve sisteme giriş yapın
            </p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
              2
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Waitlist'e Katıl</h4>
            <p className="text-sm text-gray-600">
              İstediğiniz drop için waitlist'e katılın ve sıranızı alın
            </p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
              3
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Claim Window'u Bekle</h4>
            <p className="text-sm text-gray-600">
              Belirlenen tarihte claim window açılır
            </p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
              4
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Claim Et</h4>
            <p className="text-sm text-gray-600">
              Sıranız stok içindeyse ürünü claim edin
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-white border border-gray-200 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {showAuthenticated ? "Drop'ları Keşfedin" : "Hemen Başlayın"}
        </h2>
        <p className="text-gray-600 mb-6">
          {showAuthenticated 
            ? "Aktif drop'ları görüntüleyin ve waitlist'e katılarak sınırlı stok fırsatlarından yararlanın."
            : "Aktif drop'ları görmek ve waitlist'e katılmak için giriş yapın veya kayıt olun."
          }
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleViewDrops}
            className="px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold rounded-lg hover:from-gray-800 hover:to-gray-700 transition-all shadow-sm hover:shadow-md"
          >
            Drop'ları Görüntüle
          </button>
        </div>
      </div>
    </div>
  );
}
