'use client';

interface IErrorAlertProps {
    error: string | null;
    onClose: () => void;
}

export function ErrorAlert({ error, onClose }: IErrorAlertProps) {
    if (!error) return null;

    return (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="shrink-0">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-red-800 mb-1">Bir hata oluştu</h3>
                    <p className="text-sm text-red-700 break-words">{error}</p>
                </div>
                <button
                    onClick={onClose}
                    className="shrink-0 text-red-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-100"
                    aria-label="Hata mesajını kapat"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
