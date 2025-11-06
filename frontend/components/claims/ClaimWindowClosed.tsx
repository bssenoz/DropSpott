'use client';

interface IClaimWindowClosedProps {
  claimWindowStart: string;
  claimWindowEnd: string;
}

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

export default function ClaimWindowClosed({ claimWindowStart, claimWindowEnd }: IClaimWindowClosedProps) {
  return (
    <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center shrink-0">
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
              <p className="text-yellow-900 font-semibold">{formatDate(claimWindowStart)}</p>
            </div>
            <div className="bg-white rounded p-3 border border-yellow-200">
              <span className="text-yellow-700 text-xs font-medium block mb-1">Bitiş</span>
              <p className="text-yellow-900 font-semibold">{formatDate(claimWindowEnd)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

