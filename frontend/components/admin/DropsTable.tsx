'use client';

import { Drop } from '@/store/adminStore';

interface IDropsTableProps {
    drops: Drop[];
    loading: boolean;
    onEdit: (drop: Drop) => void;
    onDelete: (id: string) => void;
}

export function DropsTable({ drops, loading, onEdit, onDelete }: IDropsTableProps) {
    if (loading) {
        return (
            <div className="bg-white border rounded-lg shadow-sm">
                <div className="p-6 border-b">
                    <h2 className="text-xl text-gray-700 font-semibold">Drop Listesi</h2>
                </div>
                <div className="p-6 text-center text-gray-500">
                    Yükleniyor...
                </div>
            </div>
        );
    }

    if (drops.length === 0) {
        return (
            <div className="bg-white border rounded-lg shadow-sm">
                <div className="p-6 border-b">
                    <h2 className="text-xl text-gray-700 font-semibold">Drop Listesi</h2>
                </div>
                <div className="p-6 text-center text-gray-500">
                    Henüz drop bulunmamaktadır.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border rounded-lg shadow-sm">
            <div className="p-6 border-b">
                <h2 className="text-xl text-gray-700 font-semibold">Drop Listesi</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Başlık
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Açıklama
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stok
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Başlangıç
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Bitiş
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                İşlemler
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {drops.map((drop) => (
                            <tr key={drop.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {drop.title}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {drop.description || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {drop.stock}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(drop.claimWindowStart).toLocaleString('tr-TR')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(drop.claimWindowEnd).toLocaleString('tr-TR')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onEdit(drop)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Düzenle
                                        </button>
                                        <button
                                            onClick={() => onDelete(drop.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}