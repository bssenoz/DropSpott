'use client';

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
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Drop Düzenle">
            <form onSubmit={onSubmit} className="space-y-4">
                <DropFormFields formData={formData} updateFormField={updateFormField} />
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                        İptal
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Güncelle
                    </button>
                </div>
            </form>
        </Modal>
    );
}

