'use client';

import { Drop } from '@/store/adminStore';
import { Modal } from '@/components/Modal';

interface IDeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    drop: Drop | null;
    onConfirm: () => void;
}

export function DeleteConfirmModal({ isOpen, onClose, drop, onConfirm }: IDeleteConfirmModalProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Drop'u Sil" size="sm" compact>
            {drop && (
                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="shrink-0">
                            <svg className="w-6 h-6 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-red-800 font-medium text-sm">
                                Bu drop'u silmek istediğinizden emin misiniz?
                            </p>
                            <p className="text-red-600 text-xs mt-1">
                                Bu işlem geri alınamaz.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg space-y-1.5">
                        <div>
                            <span className="text-xs font-medium text-gray-700">Başlık:</span>
                            <span className="text-xs text-gray-900 ml-2">{drop.title}</span>
                        </div>
                        {drop.description && (
                            <div>
                                <span className="text-xs font-medium text-gray-700">Açıklama:</span>
                                <span className="text-xs text-gray-900 ml-2">{drop.description}</span>
                            </div>
                        )}
                        <div>
                            <span className="text-xs font-medium text-gray-700">Stok:</span>
                            <span className="text-xs text-gray-900 ml-2">{drop.stock}</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                            İptal
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Sil
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}

