'use client';

interface IProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showNumbers?: boolean;
  className?: string;
}

export default function ProgressBar({
  current,
  total,
  label,
  showNumbers = true,
  className = '',
}: IProgressBarProps) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showNumbers && (
            <span className="text-sm font-semibold text-gray-900">
              {current} / {total}
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showNumbers && !label && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-600">{current}</span>
          <span className="text-xs text-gray-600">{total}</span>
        </div>
      )}
    </div>
  );
}
