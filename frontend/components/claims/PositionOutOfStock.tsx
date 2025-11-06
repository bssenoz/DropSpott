'use client';

interface IPositionOutOfStockProps {
  position: number;
  stock: number;
}

export default function PositionOutOfStock({ position, stock }: IPositionOutOfStockProps) {
  return (
    <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Pozisyonunuz Stok Dışında</h3>
          <p className="text-yellow-800 text-sm">
            Pozisyonunuz <span className="font-semibold">#{position}</span> mevcut stoktan (<span className="font-semibold">{stock}</span>) daha yüksek.
            Stok artarsa hak kazanabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}

