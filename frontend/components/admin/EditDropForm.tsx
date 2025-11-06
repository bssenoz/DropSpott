'use client';

import { DropFormData } from '@/store/adminStore';
import { DropFormFields } from './DropFormFields';

interface IEditDropFormProps {
    formData: DropFormData;
    updateFormField: <K extends keyof DropFormData>(field: K, value: DropFormData[K]) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
}

export function EditDropForm({ formData, updateFormField, onSubmit, onCancel }: IEditDropFormProps) {
    return (
        <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Drop Düzenle</h2>
            <form onSubmit={onSubmit} className="space-y-4">
                <DropFormFields formData={formData} updateFormField={updateFormField} />
                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Güncelle
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
                    >
                        İptal
                    </button>
                </div>
            </form>
        </div>
    );
}
