'use client';

import { DropFormData } from '@/store/adminStore';
import { useState, useEffect } from 'react';
import { useAuth } from '@/store/authStore';
import { useAdminActions } from '@/store/adminStore';

interface IDropFormFieldsProps {
    formData: DropFormData;
    updateFormField: <K extends keyof DropFormData>(field: K, value: DropFormData[K]) => void;
    disableStock?: boolean; // Stok alanını devre dışı bırakmak için
}

export function DropFormFields({ formData, updateFormField, disableStock = false }: IDropFormFieldsProps) {
    const [errors, setErrors] = useState<Partial<Record<keyof DropFormData, string>>>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const { token } = useAuth();
    const { suggestDescription } = useAdminActions();

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

    const handleAISuggestion = async () => {
        if (!token || !formData.title.trim()) {
            return;
        }

        setIsGenerating(true);
        try {
            const suggestedDescription = await suggestDescription(
                token,
                formData.title,
                formData.description || undefined
            );
            
            if (suggestedDescription) {
                updateFormField('description', suggestedDescription);
            }
        } catch (error) {
            console.error('AI önerisi alınırken hata:', error);
        } finally {
            setIsGenerating(false);
        }
    };

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
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                        Açıklama
                    </label>
                    <button
                        type="button"
                        onClick={handleAISuggestion}
                        disabled={isGenerating || !formData.title.trim() || !token}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-50 disabled:hover:border-blue-200"
                        title={!formData.title.trim() ? 'Önce bir başlık girin' : 'AI ile açıklama önerisi al'}
                    >
                        {isGenerating ? (
                            <>
                                <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Oluşturuluyor...</span>
                            </>
                        ) : (
                            <>
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <span>AI ile Öner</span>
                            </>
                        )}
                    </button>
                </div>
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
                    value={formData.stock === 0 ? '' : formData.stock}
                    onChange={(e) => {
                        const value = e.target.value;
                        // Boş string ise 0 olarak ayarla
                        if (value === '') {
                            updateFormField('stock', 0);
                        } else {
                            // Sayısal değeri parse et
                            const numValue = parseInt(value, 10);
                            // Geçerli bir sayı ise güncelle
                            if (!isNaN(numValue) && numValue >= 0) {
                                updateFormField('stock', numValue);
                            }
                        }
                    }}
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
