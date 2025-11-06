'use client';

import CountdownTimer from '@/components/CountdownTimer';

interface IStatusCountdownProps {
  status: 'upcoming' | 'active' | 'ended' | null;
  claimWindowStart: string;
  claimWindowEnd: string;
}

export default function StatusCountdown({ status, claimWindowStart, claimWindowEnd }: IStatusCountdownProps) {
  const config = {
    upcoming: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      targetDate: claimWindowStart,
      label: 'Claim Window Başlıyor',
      variant: 'default' as const,
    },
    active: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      targetDate: claimWindowEnd,
      label: 'Claim Window Kapanıyor',
      variant: 'active' as const,
    },
  };

  const currentConfig = status && status !== 'ended' ? config[status] : null;
  if (!currentConfig) return null;

  return (
    <div className={`${currentConfig.bgColor} rounded-lg p-6 border ${currentConfig.borderColor} shadow-sm`}>
      <CountdownTimer 
        targetDate={currentConfig.targetDate} 
        label={currentConfig.label}
        variant={currentConfig.variant}
      />
    </div>
  );
}