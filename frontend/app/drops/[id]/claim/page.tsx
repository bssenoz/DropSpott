'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDropsState, useDropsActions, useDropsStore } from '@/store/dropsStore';
import { useAuth } from '@/store/authStore';
import { Toast } from '@/components/Toast';
import CountdownTimer from '@/components/CountdownTimer';
import ClaimHeader from '@/components/claims/ClaimHeader';
import ClaimWindowClosed from '@/components/claims/ClaimWindowClosed';
import NotInWaitlist from '@/components/claims/NotInWaitlist';
import ClaimCodeDisplay from '@/components/claims/ClaimCodeDisplay';
import PositionOutOfStock from '@/components/claims/PositionOutOfStock';
import ClaimCodeForm from '@/components/claims/ClaimCodeForm';

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
        
        // Claim penceresi açıksa mevcut claim code'u kontrol et
        const drop = useDropsStore.getState().currentDrop;
        const waitlistEntry = useDropsStore.getState().waitlistEntry;
        
        if (drop && waitlistEntry) {
          const now = new Date();
          const claimStart = new Date(drop.claimWindowStart);
          const claimEnd = new Date(drop.claimWindowEnd);
          
          // Claim penceresi açık ve pozisyon stok içindeyse claim code'u getir
          if (now >= claimStart && now <= claimEnd && waitlistEntry.position <= drop.stock) {
            const success = await claimDrop(token, dropId);
            if (!success) {
              useDropsStore.getState().clearError();
            }
         }
        }
      }
    };

    loadData();
  }, [dropId, fetchDrop, isAuthenticated, token, checkWaitlistStatus, claimDrop, router]);

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

    // Claim işlemi sonucunu kontrol et
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      {/* Geri butonu */}
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

      {/* Ana içerik */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <ClaimHeader title={currentDrop.title} />

        <div className="p-6 space-y-6">
          {claimWindowOpen && (
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <CountdownTimer
                targetDate={currentDrop.claimWindowEnd}
                label="Claim Window Kapanıyor"
              />
            </div>
          )}

          {!claimWindowOpen && (
            <ClaimWindowClosed
              claimWindowStart={currentDrop.claimWindowStart}
              claimWindowEnd={currentDrop.claimWindowEnd}
            />
          )}

          {!waitlistEntry && <NotInWaitlist dropId={dropId} />}

          {claimCode ? (
            <ClaimCodeDisplay
              code={claimCode.code}
              createdAt={claimCode.createdAt}
              used={claimCode.used}
              usedAt={claimCode.usedAt}
              onCopy={copyToClipboard}
            />
          ) : (
            waitlistEntry && claimWindowOpen && (
              <div className="space-y-6">
                {waitlistEntry.position > currentDrop.stock && (
                  <PositionOutOfStock
                    position={waitlistEntry.position}
                    stock={currentDrop.stock}
                  />
                )}

                {waitlistEntry.position <= currentDrop.stock && (
                  <ClaimCodeForm
                    position={waitlistEntry.position}
                    stock={currentDrop.stock}
                    isClaiming={isClaiming}
                    onClaim={handleClaim}
                  />
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}