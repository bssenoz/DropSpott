import { create } from 'zustand';
import axios from 'axios';

// ==================== Types ====================
export interface Drop {
    id: string;
    title: string;
    description?: string;
    stock: number;
    claimWindowStart: string;
    claimWindowEnd: string;
    createdAt: string;
    updatedAt: string;
}

export interface DropFormData {
    title: string;
    description: string;
    stock: number;
    claimWindowStart: string;
    claimWindowEnd: string;
}

interface AdminState {
    // State
    formData: DropFormData;
    editingDrop: Drop | null;
    showCreateForm: boolean;
}

interface AdminActions {
    // Actions
    createDrop: (token: string, formData: DropFormData) => Promise<Drop | null>;
    updateDrop: (token: string, id: string, formData: Partial<DropFormData>) => Promise<Drop | null>;
    deleteDrop: (token: string, id: string) => Promise<boolean>;
    setFormData: (formData: DropFormData) => void;
    updateFormField: <K extends keyof DropFormData>(field: K, value: DropFormData[K]) => void;
    resetForm: () => void;
    startEdit: (drop: Drop) => void;
    cancelEdit: () => void;
    toggleCreateForm: () => void;
    clearError: () => void;
}

type AdminStore = AdminState & AdminActions;

// ==================== Constants ====================
const API_URL = 'http://localhost:5000/admin';

const initialFormData: DropFormData = {
    title: '',
    description: '',
    stock: 0,
    claimWindowStart: '',
    claimWindowEnd: ''
};

// ==================== Store ====================
export const useAdminStore = create<AdminStore>((set, get) => ({
    // State
    formData: initialFormData,
    editingDrop: null,
    showCreateForm: false,

    // Actions
    createDrop: async (token: string, formData: DropFormData): Promise<Drop | null> => {
        try {
            const response = await axios.post(`${API_URL}/drops`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.drop;
        } catch (err) {
            return null;
        }
    },

    updateDrop: async (token: string, id: string, formData: Partial<DropFormData>): Promise<Drop | null> => {
        try {
            const response = await axios.put(`${API_URL}/drops/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.drop;
        } catch (err) {
            return null;
        }
    },

    deleteDrop: async (token: string, id: string): Promise<boolean> => {
        try {
            await axios.delete(`${API_URL}/drops/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return true;
        } catch (err) {
            return false;
        }
    },

    setFormData: (formData: DropFormData) => {
        set({ formData });
    },

    updateFormField: <K extends keyof DropFormData>(field: K, value: DropFormData[K]) => {
        set(state => ({
            formData: { ...state.formData, [field]: value }
        }));
    },

    resetForm: () => {
        set({ formData: initialFormData });
    },

    startEdit: (drop: Drop) => {
        set({
            editingDrop: drop,
            formData: {
                title: drop.title,
                description: drop.description || '',
                stock: drop.stock,
                claimWindowStart: new Date(drop.claimWindowStart).toISOString().slice(0, 16),
                claimWindowEnd: new Date(drop.claimWindowEnd).toISOString().slice(0, 16)
            },
            showCreateForm: false
        });
    },

    cancelEdit: () => {
        set({
            editingDrop: null,
            formData: initialFormData
        });
    },

    toggleCreateForm: () => {
        set(state => {
            if (state.showCreateForm) {
                return { showCreateForm: false, editingDrop: null, formData: initialFormData };
            } else {
                return { showCreateForm: true, editingDrop: null };
            }
        });
    },

    clearError: () => {
        // Artık error state'i yok, bu fonksiyon boş kalabilir
    },
}));

// ==================== Selectors ====================
export const useAdminState = () => {
    const formData = useAdminStore((state) => state.formData);
    const editingDrop = useAdminStore((state) => state.editingDrop);
    const showCreateForm = useAdminStore((state) => state.showCreateForm);
    
    return { formData, editingDrop, showCreateForm };
};

export const useAdminActions = () => {
    const createDrop = useAdminStore((state) => state.createDrop);
    const updateDrop = useAdminStore((state) => state.updateDrop);
    const deleteDrop = useAdminStore((state) => state.deleteDrop);
    const setFormData = useAdminStore((state) => state.setFormData);
    const updateFormField = useAdminStore((state) => state.updateFormField);
    const resetForm = useAdminStore((state) => state.resetForm);
    const startEdit = useAdminStore((state) => state.startEdit);
    const cancelEdit = useAdminStore((state) => state.cancelEdit);
    const toggleCreateForm = useAdminStore((state) => state.toggleCreateForm);
    const clearError = useAdminStore((state) => state.clearError);
    
    return {
        createDrop,
        updateDrop,
        deleteDrop,
        setFormData,
        updateFormField,
        resetForm,
        startEdit,
        cancelEdit,
        toggleCreateForm,
        clearError,
    };
};

