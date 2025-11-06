'use client';

import { DropFormData } from '@/store/adminStore';
import { useState, useEffect } from 'react';

interface IDropFormFieldsProps {
    formData: DropFormData;
    updateFormField: <K extends keyof DropFormData>(field: K, value: DropFormData[K]) => void;
    disableStock?: boolean; // Stok alanını devre dışı bırakmak için
}

export function DropFormFields({ formData, updateFormField, disableStock = false }: IDropFormFieldsProps) {
    const [errors, setErrors] = useState<Partial<Record<keyof DropFormData, string>>>({});

    useEffect(() => {
        const newErrors: Partial<Record<keyof DropFormData, string>> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Başlık gereklidir';
        } else if (formData.title.length < 3) {
            newErrors.title = 'Başlık en az 3 karakter olmalıdır';
        }

        if (formData.stock < 0) {
            newErrors.stock = 'Stok negatif olamaz';
        }

        if (formData.claimWindowStart && formData.claimWindowEnd) {
            const start = new Date(formData.claimWindowStart);
            const end = new Date(formData.claimWindowEnd);
            
            if (end <= start) {
                newErrors.claimWindowEnd = 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır';
            }
        }

        setErrors(newErrors);
    }, [formData]);

    return (
        <div className="space-y-5">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Başlık <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => updateFormField('title', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.title
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white'
                    } text-gray-900 placeholder-gray-400`}
                    placeholder="Örn: Özel NFT Koleksiyonu"
                />
                {errors.title && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.title}
                    </p>
                )}
                <p className="mt-1.5 text-xs text-gray-500">Drop'unuzun başlığını belirleyin</p>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Açıklama
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 500) {
                            updateFormField('description', value);
                        }
                    }}
                    maxLength={500}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-white resize-none transition-colors"
                    rows={4}
                    placeholder="Drop hakkında detaylı bilgi verin..."
                />
                <p className={`mt-1.5 text-xs ${formData.description.length >= 450 ? 'text-yellow-600' : 'text-gray-500'}`}>
                    {formData.description.length}/500 karakter
                </p>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stok Miktarı <span className="text-red-500">*</span>
                    {disableStock && (
                        <span className="ml-2 text-xs text-gray-500 font-normal">(Oluşturulduktan sonra değiştirilemez)</span>
                    )}
                </label>
                <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => updateFormField('stock', parseInt(e.target.value) || 0)}
                    disabled={disableStock}
                    className={`w-full px-4 py-2.5 pr-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        disableStock
                            ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                            : errors.stock
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white'
                    } text-gray-900 placeholder-gray-400`}
                    placeholder="0"
                />
                <div className="mt-1.5 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        {disableStock 
                            ? 'Stok miktarı drop oluşturulduktan sonra değiştirilemez'
                            : 'Toplam kaç adet drop oluşturulacak?'
                        }
                    </p>
                    <span className="text-xs text-gray-400">adet</span>
                </div>
                {errors.stock && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.stock}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Başlangıç Tarihi ve Saati <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        required
                        value={formData.claimWindowStart}
                        onChange={(e) => updateFormField('claimWindowStart', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-colors"
                    />
                    <p className="mt-1.5 text-xs text-gray-500">Drop'un başlayacağı tarih ve saat</p>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bitiş Tarihi ve Saati <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        required
                        value={formData.claimWindowEnd}
                        onChange={(e) => updateFormField('claimWindowEnd', e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                            errors.claimWindowEnd
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white'
                        } text-gray-900`}
                    />
                    {errors.claimWindowEnd && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.claimWindowEnd}
                        </p>
                    )}
                    <p className="mt-1.5 text-xs text-gray-500">Drop'un biteceği tarih ve saat</p>
                </div>
            </div>
        </div>
    );
}
