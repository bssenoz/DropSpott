'use client';

import { Drop } from '@/store/adminStore';

interface IDropsTableProps {
    drops: Drop[];
    loading: boolean;
    onEdit: (drop: Drop) => void;
    onDelete: (id: string) => void;
}

function SkeletonRow() {
    return (
        <tr className="animate-pulse">
            <td className="px-4 sm:px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </td>
            <td className="px-4 sm:px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
            <td className="px-4 sm:px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </td>
            <td className="px-4 sm:px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </td>
            <td className="px-4 sm:px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </td>
            <td className="px-4 sm:px-6 py-4">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
            </td>
        </tr>
    );
}

function getDropStatus(drop: Drop) {
    const now = new Date();
    const start = new Date(drop.claimWindowStart);
    const end = new Date(drop.claimWindowEnd);

    if (now < start) {
        return { label: 'Yakında', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    } else if (now >= start && now <= end) {
        return { label: 'Aktif', color: 'bg-green-100 text-green-800 border-green-200' };
    } else {
        return { label: 'Bitti', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
}

export function DropsTable({ drops, loading, onEdit, onDelete }: IDropsTableProps) {
    if (loading) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                        <h2 className="text-lg sm:text-xl text-gray-700 font-semibold">Drop Listesi</h2>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Başlık</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Açıklama</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stok</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Başlangıç</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bitiş</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[...Array(3)].map((_, i) => (
                                <SkeletonRow key={i} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (drops.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <h2 className="text-lg sm:text-xl text-gray-700 font-semibold">Drop Listesi</h2>
                </div>
                <div className="p-12 sm:p-16 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz drop bulunmuyor</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            İlk drop'unuzu oluşturmak için "Yeni Drop Ekle" butonuna tıklayın.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h2 className="text-lg sm:text-xl text-gray-700 font-semibold">Drop Listesi</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Toplam {drops.length} drop</span>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Başlık</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Açıklama</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stok</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Başlangıç</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Bitiş</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Durum</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {drops.map((drop) => {
                            const status = getDropStatus(drop);
                            return (
                                <tr key={drop.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="text-sm font-semibold text-gray-900">{drop.title}</div>
                                        <div className="text-xs text-gray-500 mt-1 md:hidden">{drop.description || 'Açıklama yok'}</div>
                                        <div className="text-xs text-gray-500 mt-1 lg:hidden">
                                            {new Date(drop.claimWindowStart).toLocaleDateString('tr-TR')} - {new Date(drop.claimWindowEnd).toLocaleDateString('tr-TR')}
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                                        <div className="text-sm text-gray-600 max-w-xs truncate">
                                            {drop.description || <span className="text-gray-400">-</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900">{drop.stock}</span>
                                            {drop.stock === 0 && (
                                                <span className="text-xs text-red-600 font-medium">Tükendi</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                                        <div className="text-sm text-gray-600">
                                            {new Date(drop.claimWindowStart).toLocaleString('tr-TR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                                        <div className="text-sm text-gray-600">
                                            {new Date(drop.claimWindowEnd).toLocaleString('tr-TR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onEdit(drop)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                title="Düzenle"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                <span className="hidden sm:inline">Düzenle</span>
                                            </button>
                                            <button
                                                onClick={() => onDelete(drop.id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                title="Sil"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                <span className="hidden sm:inline">Sil</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}