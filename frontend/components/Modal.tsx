'use client';

import { useEffect } from 'react';

interface IModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    compact?: boolean;
}

export function Modal({ isOpen, onClose, title, children, size = 'md', compact = false }: IModalProps) {

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl'
    }[size];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >

            <div className="absolute inset-0  animate-fade-in" />

            {/* Modal */}
            <div
                className={`relative bg-white rounded-xl shadow-2xl w-full ${sizeClasses} max-h-[90vh] flex flex-col border-2 border-gray-300 animate-slide-up`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Sticky */}
                <div className={`sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-t-xl ${compact ? 'p-4' : 'p-6'}`}>
                    <h2 className={`font-semibold text-gray-900 ${compact ? 'text-lg' : 'text-xl'}`}>{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-all duration-200"
                        aria-label="Kapat"
                    >
                        <svg
                            className={`${compact ? 'w-5 h-5' : 'w-6 h-6'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className={`flex-1 overflow-y-auto ${compact ? 'p-4' : 'p-6'}`}>
                    {children}
                </div>
            </div>
        </div>
    );
}