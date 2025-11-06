'use client';

import StatusBadge from '@/components/StatusBadge';

interface IDropHeaderProps {
  title: string;
  description?: string | null;
  status: 'upcoming' | 'active' | 'ended' | null;
}

export default function DropHeader({ title, description, status }: IDropHeaderProps) {
  return (
    <div className="bg-blue-600 px-6 py-8 border-b border-blue-700">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-white mb-3">
          {title}
        </h1>
        {status && <StatusBadge status={status} />}
      </div>
      
      {description && (
        <p className="text-blue-50 text-base leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
