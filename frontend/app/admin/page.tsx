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
    const { isAuthenticated, token, user } = useAuth();
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
        // Sadece admin kullanıcıları için drop'ları yükle
        if (mounted && isAuthenticated && token && user?.role === 'ADMIN') {
            fetchDrops(token);
        }
    }, [mounted, isAuthenticated, token, user?.role, fetchDrops]);

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
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse"></div>
                    <div>
                        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="p-12 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-600 font-medium">Yükleniyor...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">Admin paneline erişmek için giriş yapmanız gerekiyor.</p>
                </div>
            </div>
        );
    }

    // Admin olmayan kullanıcılar için erişim engelleme
    if (user?.role !== 'ADMIN') {
        return (
            <div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-red-800 mb-2">
                                Erişim Reddedildi
                            </h2>
                            <p className="text-red-700">
                                Bu sayfaya erişmek için admin yetkisine sahip olmanız gerekiyor. 
                                Mevcut rolünüz: <span className="font-semibold">{user?.role === 'USER' ? 'Kullanıcı' : 'Bilinmeyen'}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
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