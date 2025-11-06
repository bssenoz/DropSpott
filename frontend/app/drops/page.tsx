'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDropsState, useDropsActions } from '@/store/dropsStore';
import { useAuthStore } from '@/store/authStore';
import StatusBadge from '@/components/StatusBadge';
import CountdownTimer from '@/components/CountdownTimer';
import ProgressBar from '@/components/ProgressBar';
import Pagination from '@/components/Pagination';

export default function DropsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { activeDrops, loading, error, pagination } = useDropsState();
  const { fetchActiveDrops } = useDropsActions();
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/');
    }
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      fetchActiveDrops(currentPage, 9); // 3x3 grid için 9 item
    }
  }, [mounted, isAuthenticated, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Sayfanın üstüne kaydır
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hydration ve authentication kontrolü için bekle
  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const getDropStatus = (drop: typeof activeDrops[0]): 'upcoming' | 'active' | 'ended' => {
    const now = new Date();
    const claimStart = new Date(drop.claimWindowStart);
    const claimEnd = new Date(drop.claimWindowEnd);

    if (now < claimStart) {
      return 'upcoming';
    } else if (now >= claimStart && now <= claimEnd) {
      return 'active';
    } else {
      return 'ended';
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DropSpot</h1>
          <p className="text-gray-600">Özel ürünler ve etkinlikler için sınırlı stok fırsatları</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DropSpot</h1>
          <p className="text-gray-600">Özel ürünler ve etkinlikler için sınırlı stok fırsatları</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">DropSpot</h1>
        <p className="text-gray-600 leading-relaxed">
          Özel ürünler ve etkinlikler için sınırlı stok fırsatları. Waitlist'e katılın, claim window'da hak kazanın.
        </p>
      </div>

      {/* Drops Grid */}
      {activeDrops.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-lg p-12 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz aktif drop yok</h3>
          <p className="text-gray-600 text-sm">Yeni drop'lar yayınlandığında burada görünecek.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeDrops.map((drop) => {
            const status = getDropStatus(drop);

            return (
              <Link
                key={drop.id}
                href={`/drops/${drop.id}`}
                className="group bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-sm transition-all flex flex-col"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex-1 pr-2">
                    {drop.title}
                  </h2>
                  <StatusBadge status={status} />
                </div>

                {/* Description */}
                {drop.description && (
                  <div className="mb-3 w-full h-5 overflow-hidden">
                    <p className="text-gray-600 text-sm overflow-hidden text-ellipsis whitespace-nowrap block">
                      {drop.description}
                    </p>
                  </div>
                )}

                {/* Countdown Timer */}
                {status === 'upcoming' && (
                  <div className="mb-5 w-full">
                    <CountdownTimer
                      targetDate={drop.claimWindowStart}
                      label="Claim Window Başlıyor"
                      className="text-sm w-full"
                    />
                  </div>
                )}
                {status === 'active' && (
                  <div className="mb-5 w-full bg-green-50 rounded-lg p-4 border border-green-200">
                    <CountdownTimer
                      targetDate={drop.claimWindowEnd}
                      label="Claim Window Kapanıyor"
                      className="text-sm w-full"
                      variant="active"
                    />
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mb-5">
                  <ProgressBar
                    current={drop._count.waitlistEntries}
                    total={drop.stock}
                    label={`${drop._count.waitlistEntries} kişi waitlist'te`}
                    showNumbers={false}
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-5 pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Stok</div>
                    <div className="text-lg font-semibold text-gray-900">{drop.stock}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Waitlist</div>
                    <div className="text-lg font-semibold text-blue-600">{drop._count.waitlistEntries}</div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm font-medium text-blue-600 group-hover:text-blue-700">
                    <span>Detayları Gör</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

