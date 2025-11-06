'use client';

interface IClaimHeaderProps {
  title: string;
}

export default function ClaimHeader({ title }: IClaimHeaderProps) {
  return (
    <div className="bg-green-600 px-6 py-8 border-b border-green-700">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="text-green-50 text-sm mt-1">Claim Code</p>
        </div>
      </div>
    </div>
  );
}

