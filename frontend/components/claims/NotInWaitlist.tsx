'use client';

import Link from 'next/link';

interface INotInWaitlistProps {
  dropId: string;
}

export default function NotInWaitlist({ dropId }: INotInWaitlistProps) {
  return (
    <div className="bg-red-50 rounded-lg p-6 border border-red-200">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
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
  );
}

