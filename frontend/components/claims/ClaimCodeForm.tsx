'use client';

interface IClaimCodeFormProps {
  position: number;
  stock: number;
  isClaiming: boolean;
  onClaim: () => void;
}

export default function ClaimCodeForm({ position, stock, isClaiming, onClaim }: IClaimCodeFormProps) {
  return (
    <div className="bg-blue-50 rounded-lg p-8 border border-blue-200">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-blue-900 mb-2">
          Claim Code Almaya Hazır mısınız?
        </h2>
        <p className="text-blue-700 text-sm">
          Waitlist pozisyonunuz <span className="font-bold text-blue-900">#{position}</span> stok içinde.
          Claim code'unuzu oluşturabilirsiniz.
        </p>
      </div>
      <button
        onClick={onClaim}
        disabled={isClaiming}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
      >
        {isClaiming ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Claim Code Oluşturuluyor...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Claim Code Oluştur
          </>
        )}
      </button>
    </div>
  );
}

