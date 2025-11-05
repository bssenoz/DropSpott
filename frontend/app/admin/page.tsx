'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/store/authStore';
import { useAdminState, useAdminActions } from '@/store/adminStore';
import { ErrorAlert } from '@/components/ErrorAlert';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CreateDropModal } from '@/components/admin/CreateDropModal';
import { EditDropModal } from '@/components/admin/EditDropModal';
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal';
import { DropsTable } from '@/components/admin/DropsTable';
import { Toast } from '@/components/Toast';

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
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [deleteDropId, setDeleteDropId] = useState<string | null>(null);

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
            setToast({ message: 'Drop başarıyla oluşturuldu!', type: 'success' });
        } else {
            setToast({ message: 'Drop oluşturulurken bir hata oluştu.', type: 'error' });
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !editingDrop) return;
        
        const result = await updateDrop(token, editingDrop.id, formData);
        if (result) {
            resetForm();
            cancelEdit();
            setToast({ message: 'Drop başarıyla güncellendi!', type: 'success' });
        } else {
            setToast({ message: 'Drop güncellenirken bir hata oluştu.', type: 'error' });
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeleteDropId(id);
    };

    const handleDeleteConfirm = async () => {
        if (!token || !deleteDropId) return;
        
        const result = await deleteDrop(token, deleteDropId);
        if (result) {
            setToast({ message: 'Drop başarıyla silindi!', type: 'success' });
        } else {
            setToast({ message: 'Drop silinirken bir hata oluştu.', type: 'error' });
        }
        setDeleteDropId(null);
    };

    const handleCloseDeleteModal = () => {
        setDeleteDropId(null);
    };

    const handleCloseCreateModal = () => {
        resetForm();
        toggleCreateForm();
    };

    const handleCloseEditModal = () => {
        resetForm();
        cancelEdit();
    };

    const dropToDelete = deleteDropId ? drops.find(d => d.id === deleteDropId) || null : null;

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

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    isVisible={!!toast}
                    onClose={() => setToast(null)}
                />
            )}

            <CreateDropModal
                isOpen={showCreateForm}
                onClose={handleCloseCreateModal}
                formData={formData}
                updateFormField={updateFormField}
                onSubmit={handleCreate}
            />

            <EditDropModal
                isOpen={!!editingDrop}
                onClose={handleCloseEditModal}
                formData={formData}
                updateFormField={updateFormField}
                onSubmit={handleUpdate}
            />

            <DeleteConfirmModal
                isOpen={!!deleteDropId}
                onClose={handleCloseDeleteModal}
                drop={dropToDelete}
                onConfirm={handleDeleteConfirm}
            />

            <DropsTable
                drops={drops}
                loading={loading}
                onEdit={startEdit}
                onDelete={handleDeleteClick}
            />
        </div>
    );
}