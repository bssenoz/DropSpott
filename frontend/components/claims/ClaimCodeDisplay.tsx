'use client';

interface IClaimCodeDisplayProps {
  code: string;
  createdAt: string;
  used: boolean;
  usedAt?: string | null;
  onCopy: (code: string) => void;
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

export default function ClaimCodeDisplay({ code, createdAt, used, usedAt, onCopy }: IClaimCodeDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-lg p-8 border-2 border-green-300">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">Claim Code'unuz Hazır!</h2>
          <p className="text-green-700 text-sm">Bu kodu güvenli bir yerde saklayın</p>
        </div>
        
        <div className="bg-white border-2 border-green-300 rounded-lg p-6 mb-6">
          <p className="text-2xl sm:text-3xl font-mono font-bold text-center text-green-900 tracking-wider break-all">
            {code}
          </p>
        </div>

        <button
          onClick={() => onCopy(code)}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Kodu Kopyala
        </button>

        <div className="mt-6 pt-6 border-t border-green-300">
          <div className="flex items-center justify-center gap-2 text-green-700 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Oluşturulma: {formatDate(createdAt)}</span>
          </div>
        </div>
      </div>

      {used && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-900 font-semibold">Bu claim code kullanılmış</p>
              {usedAt && (
                <p className="text-gray-600 text-sm mt-1">
                  Kullanım tarihi: {formatDate(usedAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

