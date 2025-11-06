'use client';

import StatusBadge from '@/components/StatusBadge';

interface IDropHeaderProps {
  title: string;
  description?: string | null;
  status: 'upcoming' | 'active' | 'ended' | null;
}

export default function DropHeader({ title, description, status }: IDropHeaderProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {title}
            </h1>
          </div>
          {status && (
            <div className="shrink-0">
              <StatusBadge status={status} />
            </div>
          )}
        </div>
        
        {/* Description */}
        {description && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-gray-700 text-base leading-relaxed">
              {description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
