'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDropsState, useDropsActions, useDropsStore } from '@/store/dropsStore';
import { useAuth } from '@/store/authStore';
import { Toast } from '@/components/Toast';
import ClaimCodeDisplay from '@/components/claims/ClaimCodeDisplay';

export default function ClaimPage() {
  const params = useParams();
  const router = useRouter();
  const dropId = params.id as string;
  
  const { currentDrop, claimCode, waitlistEntry, loading, error } = useDropsState();
  const { fetchDrop, claimDrop, checkWaitlistStatus } = useDropsActions();
  const { token, isAuthenticated } = useAuth();
  
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

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
    }
  }, [mounted, dropId, fetchDrop, isAuthenticated, token, checkWaitlistStatus, claimDrop]);


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast({
      message: 'Claim code kopyalandı!',
      type: 'success',
      isVisible: true,
    });
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

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !currentDrop) {
    return (
      <div>
        <div className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 text-sm">{error || 'Drop bulunamadı.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
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
      <div className="space-y-6">
        {/* Status Countdown */}


        {/* Claim Code Display */}
        {claimCode && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <ClaimCodeDisplay
              code={claimCode.code}
              createdAt={claimCode.createdAt}
              used={claimCode.used}
              usedAt={claimCode.usedAt}
              onCopy={copyToClipboard}
            />
          </div>
        )}
      </div>
    </div>
  );
}