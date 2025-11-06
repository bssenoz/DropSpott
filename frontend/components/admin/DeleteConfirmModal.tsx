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
                <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="shrink-0">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-red-800 font-semibold text-sm mb-1">
                                Bu drop'u silmek istediğinizden emin misiniz?
                            </h3>
                            <p className="text-red-600 text-xs">
                                Bu işlem geri alınamaz ve tüm drop verileri kalıcı olarak silinecektir.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-200">
                        <div className="flex items-start gap-2">
                            <span className="text-xs font-semibold text-gray-700 min-w-[80px]">Başlık:</span>
                            <span className="text-xs text-gray-900 font-medium">{drop.title}</span>
                        </div>
                        {drop.description && (
                            <div className="flex items-start gap-2">
                                <span className="text-xs font-semibold text-gray-700 min-w-[80px]">Açıklama:</span>
                                <span className="text-xs text-gray-900 line-clamp-2">{drop.description}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-700 min-w-[80px]">Stok:</span>
                            <span className="text-xs text-gray-900 font-medium">{drop.stock} adet</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                        >
                            İptal
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className="px-5 py-2 text-sm bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Sil
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}

