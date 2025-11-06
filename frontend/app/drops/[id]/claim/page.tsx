'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDropsState, useDropsActions, useDropsStore } from '@/store/dropsStore';
import { useAuth } from '@/store/authStore';
import { Toast } from '@/components/Toast';
import StatusBadge from '@/components/StatusBadge';
import CountdownTimer from '@/components/CountdownTimer';

export default function ClaimPage() {
  const params = useParams();
  const router = useRouter();
  const dropId = params.id as string;
  
  const { currentDrop, claimCode, waitlistEntry, loading, error } = useDropsState();
  const { fetchDrop, claimDrop, checkWaitlistStatus } = useDropsActions();
  const { token, isAuthenticated } = useAuth();
  
  const [isClaiming, setIsClaiming] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const loadData = async () => {
      await fetchDrop(dropId);
      
      if (token) {
        await checkWaitlistStatus(token, dropId);
        
        // Check for existing claim code if claim window is open
        // This way users can see their existing code when they revisit the page
        // The backend claim endpoint is idempotent - if code exists, it returns it
        // If it doesn't exist but user is eligible, it creates one (okay when claim window is open)
        const drop = useDropsStore.getState().currentDrop;
        const waitlistEntry = useDropsStore.getState().waitlistEntry;
        
        if (drop && waitlistEntry) {
          const now = new Date();
          const claimStart = new Date(drop.claimWindowStart);
          const claimEnd = new Date(drop.claimWindowEnd);
          
          // Only check if claim window is open and user position is within stock
          if (now >= claimStart && now <= claimEnd && waitlistEntry.position <= drop.stock) {
            // Try to get existing claim code (or create if eligible)
            // This is safe because claim window is open, so user can claim anyway
            const success = await claimDrop(token, dropId);
            // If successful, claimCode will be set in store
            // If not successful, clear error since this is just a check
            if (!success) {
              useDropsStore.getState().clearError();
            }
          }
        }
      }
    };

    loadData();
  }, [dropId, fetchDrop, isAuthenticated, token, checkWaitlistStatus, claimDrop, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isClaimWindowOpen = () => {
    if (!currentDrop) return false;
    const now = new Date();
    const claimStart = new Date(currentDrop.claimWindowStart);
    const claimEnd = new Date(currentDrop.claimWindowEnd);
    return now >= claimStart && now <= claimEnd;
  };

  const handleClaim = async () => {
    if (!isAuthenticated || !token) {
      router.push('/auth/login');
      return;
    }

    setIsClaiming(true);
    const success = await claimDrop(token, dropId);
    setIsClaiming(false);

    // Check if claim code was set after claim attempt
    const updatedClaimCode = useDropsStore.getState().claimCode;
    const errorMessage = useDropsStore.getState().error;

    if (success && updatedClaimCode) {
      setToast({
        message: updatedClaimCode.code ? 'Claim code başarıyla oluşturuldu!' : 'Claim code zaten mevcut!',
        type: 'success',
        isVisible: true,
      });
    } else {
      setToast({
        message: errorMessage || 'Claim işlemi sırasında bir hata oluştu.',
        type: 'error',
        isVisible: true,
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast({
      message: 'Claim code kopyalandı!',
      type: 'success',
      isVisible: true,
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !currentDrop) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Drop bulunamadı.'}</p>
        </div>
      </div>
    );
  }

  const claimWindowOpen = isClaimWindowOpen();

  const getDropStatus = (): 'upcoming' | 'active' | 'ended' => {
    if (!currentDrop) return 'ended';
    const now = new Date();
    const claimStart = new Date(currentDrop.claimWindowStart);
    const claimEnd = new Date(currentDrop.claimWindowEnd);
    if (now < claimStart) return 'upcoming';
    if (now >= claimStart && now <= claimEnd) return 'active';
    return 'ended';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      {/* Back Button */}
      <div className="mb-6">
        <Link
          href={`/drops/${dropId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Drop Detayına Dön
        </Link>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="bg-green-600 px-6 py-8 border-b border-green-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{currentDrop.title}</h1>
              <p className="text-green-50 text-sm mt-1">Claim Code</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Countdown Timer */}
          {claimWindowOpen && (
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <CountdownTimer
                targetDate={currentDrop.claimWindowEnd}
                label="Claim Window Kapanıyor"
              />
            </div>
          )}

          {/* Status Messages */}
          {!claimWindowOpen && (
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">Claim Penceresi Kapalı</h3>
                  <p className="text-yellow-800 mb-4 text-sm">
                    Claim penceresi henüz açılmadı veya kapandı.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded p-3 border border-yellow-200">
                      <span className="text-yellow-700 text-xs font-medium block mb-1">Başlangıç</span>
                      <p className="text-yellow-900 font-semibold">{formatDate(currentDrop.claimWindowStart)}</p>
                    </div>
                    <div className="bg-white rounded p-3 border border-yellow-200">
                      <span className="text-yellow-700 text-xs font-medium block mb-1">Bitiş</span>
                      <p className="text-yellow-900 font-semibold">{formatDate(currentDrop.claimWindowEnd)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!waitlistEntry && (
            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Waitlist'te Değilsiniz</h3>
                  <p className="text-red-800 mb-4 text-sm">
                    Bu drop için waitlist'te değilsiniz. Önce waitlist'e katılmanız gerekiyor.
                  </p>
                  <Link
                    href={`/drops/${dropId}`}
                    className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                  >
                    Drop Sayfasına Dön
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Claim Code Display */}
          {claimCode ? (
            <div className="space-y-6">
              <div className="bg-green-50 rounded-lg p-8 border-2 border-green-300">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-green-900 mb-2">Claim Code'unuz Hazır!</h2>
                  <p className="text-green-700 text-sm">Bu kodu güvenli bir yerde saklayın</p>
                </div>
                
                {/* Code Display */}
                <div className="bg-white border-2 border-green-300 rounded-lg p-6 mb-6">
                  <p className="text-2xl sm:text-3xl font-mono font-bold text-center text-green-900 tracking-wider break-all">
                    {claimCode.code}
                  </p>
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => copyToClipboard(claimCode.code)}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Kodu Kopyala
                </button>

                {/* Info */}
                <div className="mt-6 pt-6 border-t border-green-300">
                  <div className="flex items-center justify-center gap-2 text-green-700 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Oluşturulma: {formatDate(claimCode.createdAt)}</span>
                  </div>
                </div>
              </div>

              {claimCode.used && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold">Bu claim code kullanılmış</p>
                      {claimCode.usedAt && (
                        <p className="text-gray-600 text-sm mt-1">
                          Kullanım tarihi: {formatDate(claimCode.usedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            waitlistEntry && claimWindowOpen && (
              <div className="space-y-6">
                {waitlistEntry.position > currentDrop.stock && (
                  <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-900 mb-2">Pozisyonunuz Stok Dışında</h3>
                        <p className="text-yellow-800 text-sm">
                          Pozisyonunuz <span className="font-semibold">#{waitlistEntry.position}</span> mevcut stoktan (<span className="font-semibold">{currentDrop.stock}</span>) daha yüksek.
                          Stok artarsa hak kazanabilirsiniz.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {waitlistEntry.position <= currentDrop.stock && (
                  <div className="bg-blue-50 rounded-lg p-8 border border-blue-200">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-blue-900 mb-2">
                        Claim Code Almaya Hazır mısınız?
                      </h2>
                      <p className="text-blue-700 text-sm">
                        Waitlist pozisyonunuz <span className="font-bold text-blue-900">#{waitlistEntry.position}</span> stok içinde.
                        Claim code'unuzu oluşturabilirsiniz.
                      </p>
                    </div>
                    <button
                      onClick={handleClaim}
                      disabled={isClaiming}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                    >
                      {isClaiming ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Claim Code Oluşturuluyor...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Claim Code Oluştur
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
  