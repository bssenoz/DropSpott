'use client';

interface IAdminHeaderProps {
    showCreateForm: boolean;
    onToggleCreateForm: () => void;
}

export function AdminHeader({ showCreateForm, onToggleCreateForm }: IAdminHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Admin Paneli</h1>
            <button
                onClick={onToggleCreateForm}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
                {showCreateForm ? 'İptal' : 'Yeni Drop Ekle'}
            </button>
        </div>
    );
}

