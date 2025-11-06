'use client';

interface IStatusBadgeProps {
  status: 'upcoming' | 'active' | 'ended';
  className?: string;
}

export default function StatusBadge({ status, className = '' }: IStatusBadgeProps) {
  const config = {
    upcoming: {
      text: 'Yakında',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    active: {
      text: 'Claim Açık',
      className: 'bg-green-100 text-green-800 border-green-200',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    ended: {
      text: 'Bitti',
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
  };

  const currentConfig = config[status];

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${currentConfig.className} ${className}`}
    >
      {currentConfig.icon}
      {currentConfig.text}
    </span>
  );
}

