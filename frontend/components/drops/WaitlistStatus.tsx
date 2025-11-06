'use client';

interface IWaitlistStatusProps {
  position: number;
  stock: number;
}

export default function WaitlistStatus({ position, stock }: IWaitlistStatusProps) {
  const isEligible = position <= stock;

  return (
    <div className={`rounded-lg p-6 border shadow-sm ${
      isEligible
        ? 'bg-green-50 border-green-200'
        : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
          isEligible
            ? 'bg-green-100'
            : 'bg-yellow-100'
        }`}>
          {isEligible ? (
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Waitlist Pozisyonunuz: <span className="text-xl text-blue-600">#{position}</span>
          </h3>
          <p className={`text-sm ${
            isEligible
              ? 'text-green-700'
              : 'text-yellow-700'
          }`}>
            {isEligible
              ? 'Tebrikler! Claim penceresi açıldığında hak kazanabilirsiniz.'
              : 'Mevcut stoktan daha fazla pozisyondasınız. Stok artarsa hak kazanabilirsiniz.'}
          </p>
        </div>
      </div>
    </div>
  );
}

