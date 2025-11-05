'use client';

import { DropFormData } from '@/store/adminStore';

interface IDropFormFieldsProps {
    formData: DropFormData;
    updateFormField: <K extends keyof DropFormData>(field: K, value: DropFormData[K]) => void;
}

export function DropFormFields({ formData, updateFormField }: IDropFormFieldsProps) {
    return (
        <>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlık *
                </label>
                <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => updateFormField('title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => updateFormField('description', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stok *
                </label>
                <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => updateFormField('stock', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Başlangıç Tarihi *
                    </label>
                    <input
                        type="datetime-local"
                        required
                        value={formData.claimWindowStart}
                        onChange={(e) => updateFormField('claimWindowStart', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bitiş Tarihi *
                    </label>
                    <input
                        type="datetime-local"
                        required
                        value={formData.claimWindowEnd}
                        onChange={(e) => updateFormField('claimWindowEnd', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </>
    );
}
