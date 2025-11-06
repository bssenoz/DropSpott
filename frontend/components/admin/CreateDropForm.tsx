'use client';

import { DropFormData } from '@/store/adminStore';
import { DropFormFields } from './DropFormFields';

interface ICreateDropFormProps {
    formData: DropFormData;
    updateFormField: <K extends keyof DropFormData>(field: K, value: DropFormData[K]) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export function CreateDropForm({ formData, updateFormField, onSubmit }: ICreateDropFormProps) {
    return (
        <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Yeni Drop Oluştur</h2>
            <form onSubmit={onSubmit} className="space-y-4">
                <DropFormFields formData={formData} updateFormField={updateFormField} />
                <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                >
                    Oluştur
                </button>
            </form>
        </div>
    );
}

