'use client';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    onPageChange
}: PaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            // Tüm sayfaları göster
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // İlk sayfa
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            // Mevcut sayfanın etrafındaki sayfalar
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('...');
            }

            // Son sayfa
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            {/* Önceki Sayfa */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPrevPage}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                    hasPrevPage
                        ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Sayfa Numaraları */}
            <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => {
                    if (page === '...') {
                        return (
                            <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                                ...
                            </span>
                        );
                    }

                    const pageNum = page as number;
                    const isActive = pageNum === currentPage;

                    return (
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`px-4 py-2 rounded-lg border transition-colors ${
                                isActive
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {pageNum}
                        </button>
                    );
                })}
            </div>

            {/* Sonraki Sayfa */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                    hasNextPage
                        ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}
