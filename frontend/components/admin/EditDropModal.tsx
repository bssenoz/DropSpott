'use client';

import { useState } from 'react';
import { DropFormData } from '@/store/adminStore';
import { DropFormFields } from './DropFormFields';
import { Modal } from '@/components/Modal';

interface IEditDropModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: DropFormData;
    updateFormField: <K extends keyof DropFormData>(field: K, value: DropFormData[K]) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export function EditDropModal({ isOpen, onClose, formData, updateFormField, onSubmit }: IEditDropModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = formData.title.trim().length >= 3 && 
                       formData.stock >= 0 && 
                       formData.claimWindowStart && 
                       formData.claimWindowEnd &&
                       new Date(formData.claimWindowEnd) > new Date(formData.claimWindowStart);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Drop Düzenle" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <DropFormFields formData={formData} updateFormField={updateFormField} disableStock={true} />
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        İptal
                    </button>
                    <button
                        type="submit"
                        disabled={!isFormValid || isSubmitting}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Güncelleniyor...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Güncelle
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

