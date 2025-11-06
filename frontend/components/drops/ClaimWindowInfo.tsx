'use client';

interface IClaimWindowInfoProps {
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

export default function ClaimWindowInfo({ claimWindowStart, claimWindowEnd }: IClaimWindowInfoProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Claim Penceresi
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Başlangıç</p>
          <p className="text-gray-900 font-semibold">{formatDate(claimWindowStart)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Bitiş</p>
          <p className="text-gray-900 font-semibold">{formatDate(claimWindowEnd)}</p>
        </div>
      </div>
    </div>
  );
}