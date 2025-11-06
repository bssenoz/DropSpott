'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDropsState, useDropsActions } from '@/store/dropsStore';
import { useAuth } from '@/store/authStore';
import { Toast } from '@/components/Toast';
import ProgressBar from '@/components/ProgressBar';
import DropHeader from '@/components/drops/DropHeader';
import DropStats from '@/components/drops/DropStats';
import ClaimWindowInfo from '@/components/drops/ClaimWindowInfo';
import WaitlistStatus from '@/components/drops/WaitlistStatus';
import WaitlistActions from '@/components/drops/WaitlistActions';
import StatusCountdown from '@/components/drops/StatusCountdown';

export default function DropDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dropId = params.id as string;
  
  const { currentDrop, waitlistEntry, claimCode, loading, error } = useDropsState();
  const { fetchDrop, joinWaitlist, leaveWaitlist, checkWaitlistStatus } = useDropsActions();
  const { token, isAuthenticated, user } = useAuth();
  
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
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
      router.push('/auth/login');
    }
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      fetchDrop(dropId);
      
      if (token && user?.role !== 'ADMIN') {
        // waitlist-status endpoint'i artık claim code bilgisini de döndürüyor
        checkWaitlistStatus(token, dropId);
      }
    }
  }, [mounted, dropId, fetchDrop, isAuthenticated, token, user?.role, checkWaitlistStatus]);

  const getDropStatus = (): 'upcoming' | 'active' | 'ended' | null => {
    if (!currentDrop) return null;
    
    const now = new Date();
    const claimStart = new Date(currentDrop.claimWindowStart);
    const claimEnd = new Date(currentDrop.claimWindowEnd);

    if (now < claimStart) {
      return 'upcoming';
    } else if (now >= claimStart && now <= claimEnd) {
      return 'active';
    } else {
      return 'ended';
    }
  };

  const isClaimWindowOpen = () => {
    if (!currentDrop) return false;
    const now = new Date();
    const claimStart = new Date(currentDrop.claimWindowStart);
    const claimEnd = new Date(currentDrop.claimWindowEnd);
    return now >= claimStart && now <= claimEnd;
  };

  const handleJoinWaitlist = async () => {
    if (!isAuthenticated || !token) {
      router.push('/auth/login');
      return;
    }

    setIsJoining(true);
    const success = await joinWaitlist(token, dropId);
    setIsJoining(false);

    if (success) {
      setToast({
        message: 'Waitlist\'e başarıyla katıldınız!',
        type: 'success',
        isVisible: true,
      });
    } else {
      setToast({
        message: 'Waitlist\'e katılırken bir hata oluştu.',
        type: 'error',
        isVisible: true,
      });
    }
  };

  const handleLeaveWaitlist = async () => {
    if (!isAuthenticated || !token) {
      return;
    }

    setIsLeaving(true);
    const success = await leaveWaitlist(token, dropId);
    setIsLeaving(false);

    if (success) {
      setToast({
        message: 'Waitlist\'ten başarıyla ayrıldınız.',
        type: 'success',
        isVisible: true,
      });
    } else {
      setToast({
        message: 'Waitlist\'ten ayrılırken bir hata oluştu.',
        type: 'error',
        isVisible: true,
      });
    }
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

  const status = getDropStatus();

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
          href="/drops"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Drop Listesine Dön
        </Link>
      </div>

      {/* Header Section */}
      <div className="mb-8">
        <DropHeader
          title={currentDrop.title}
          description={currentDrop.description}
          status={status}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column - Main Info (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Status Countdown - Full Width */}
          <StatusCountdown
            status={status}
            claimWindowStart={currentDrop.claimWindowStart}
            claimWindowEnd={currentDrop.claimWindowEnd}
          />

          {/* Progress and Stats Row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Progress Bar */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <ProgressBar
                current={currentDrop._count.waitlistEntries}
                total={currentDrop.stock}
                label="Waitlist Doluluk Oranı"
                showNumbers={true}
              />
            </div>

            {/* Stats */}
            <DropStats
              stock={currentDrop.stock}
              waitlistCount={currentDrop._count.waitlistEntries}
            />
          </div>

          {/* Claim Window Info */}
          <ClaimWindowInfo
            claimWindowStart={currentDrop.claimWindowStart}
            claimWindowEnd={currentDrop.claimWindowEnd}
          />

          {/* Waitlist Status */}
          {waitlistEntry && user?.role !== 'ADMIN' && (
            <WaitlistStatus
              position={waitlistEntry.position}
              stock={currentDrop.stock}
            />
          )}
        </div>

        {/* Right Column - Actions (4 columns) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksiyonlar</h3>
            <WaitlistActions
              hasWaitlistEntry={!!waitlistEntry}
              isClaimWindowOpen={isClaimWindowOpen()}
              dropId={dropId}
              isJoining={isJoining}
              isLeaving={isLeaving}
              onJoin={handleJoinWaitlist}
              onLeave={handleLeaveWaitlist}
              isAdmin={user?.role === 'ADMIN'}
              hasClaimCode={!!claimCode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}