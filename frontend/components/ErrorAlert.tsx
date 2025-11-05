'use client';

interface IErrorAlertProps {
    error: string | null;
    onClose: () => void;
}

export function ErrorAlert({ error, onClose }: IErrorAlertProps) {
    if (!error) return null;

    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex justify-between items-center">
            <p className="text-red-800">{error}</p>
            <button
                onClick={onClose}
                className="text-red-800 hover:text-red-900 font-medium"
            >
                ×
            </button>
        </div>
    );
}
