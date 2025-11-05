'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/store/authStore';
import { useAdminState, useAdminActions } from '@/store/adminStore';
import { ErrorAlert } from '@/components/admin/ErrorAlert';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CreateDropForm } from '@/components/admin/CreateDropForm';
import { EditDropForm } from '@/components/admin/EditDropForm';
import { DropsTable } from '@/components/admin/DropsTable';

export default function AdminPage() {
    const { isAuthenticated, token } = useAuth();
    const { drops, loading, error, formData, editingDrop, showCreateForm } = useAdminState();
    const {
        fetchDrops,
        createDrop,
        updateDrop,
        deleteDrop,
        updateFormField,
        resetForm,
        startEdit,
        cancelEdit,
        toggleCreateForm,
        clearError,
    } = useAdminActions();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && isAuthenticated && token) {
            fetchDrops(token);
        }
    }, [mounted, isAuthenticated, token, fetchDrops]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        
        const result = await createDrop(token, formData);
        if (result) {
            resetForm();
            toggleCreateForm();
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !editingDrop) return;
        
        const result = await updateDrop(token, editingDrop.id, formData);
        if (result) {
            resetForm();
            cancelEdit();
        }
    };

    const handleDelete = async (id: string) => {
        if (!token) return;
        await deleteDrop(token, id);
    };

    // Hydration hatasını önlemek için client-side mounting'i bekle
    if (!mounted) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Admin Paneli</h1>
                </div>
                <div className="bg-white border rounded-lg shadow-sm">
                    <div className="p-6 text-center text-gray-500">
                        Yükleniyor...
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">Admin paneline erişmek için giriş yapmanız gerekiyor.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <AdminHeader 
                showCreateForm={showCreateForm} 
                onToggleCreateForm={toggleCreateForm} 
            />

            <ErrorAlert error={error} onClose={clearError} />

            {showCreateForm && (
                <CreateDropForm
                    formData={formData}
                    updateFormField={updateFormField}
                    onSubmit={handleCreate}
                />
            )}

            {editingDrop && (
                <EditDropForm
                    formData={formData}
                    updateFormField={updateFormField}
                    onSubmit={handleUpdate}
                    onCancel={cancelEdit}
                />
            )}

            <DropsTable
                drops={drops}
                loading={loading}
                onEdit={startEdit}
                onDelete={handleDelete}
            />
        </div>
    );
}