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
    drops: Drop[];
    loading: boolean;
    error: string | null;
    formData: DropFormData;
    editingDrop: Drop | null;
    showCreateForm: boolean;
}

interface AdminActions {
    // Actions
    fetchDrops: (token: string) => Promise<void>;
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
    drops: [],
    loading: false,
    error: null,
    formData: initialFormData,
    editingDrop: null,
    showCreateForm: false,

    // Actions
    fetchDrops: async (token: string) => {
        set({ loading: true, error: null });
        
        try {
            const response = await axios.get(`${API_URL}/drops`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ drops: response.data.drops || [], loading: false });
        } catch (err) {
            const errorMessage = axios.isAxiosError(err) && err.response 
                ? err.response.data.message || 'Drop\'lar yüklenirken hata oluştu.'
                : 'Bilinmeyen bir hata oluştu.';
            set({ error: errorMessage, loading: false });
        }
    },

    createDrop: async (token: string, formData: DropFormData): Promise<Drop | null> => {
        set({ error: null });
        
        try {
            const response = await axios.post(`${API_URL}/drops`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const newDrop = response.data.drop;
            set(state => ({ drops: [newDrop, ...state.drops] }));
            return newDrop;
        } catch (err) {
            const errorMessage = axios.isAxiosError(err) && err.response 
                ? err.response.data.message || 'Drop oluşturulurken hata oluştu.'
                : 'Bilinmeyen bir hata oluştu.';
            set({ error: errorMessage });
            return null;
        }
    },

    updateDrop: async (token: string, id: string, formData: Partial<DropFormData>): Promise<Drop | null> => {
        set({ error: null });
        
        try {
            const response = await axios.put(`${API_URL}/drops/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updatedDrop = response.data.drop;
            set(state => ({
                drops: state.drops.map(drop => drop.id === id ? updatedDrop : drop)
            }));
            return updatedDrop;
        } catch (err) {
            const errorMessage = axios.isAxiosError(err) && err.response 
                ? err.response.data.message || 'Drop güncellenirken hata oluştu.'
                : 'Bilinmeyen bir hata oluştu.';
            set({ error: errorMessage });
            return null;
        }
    },

    deleteDrop: async (token: string, id: string): Promise<boolean> => {
        if (!confirm('Bu drop\'u silmek istediğinizden emin misiniz?')) return false;

        set({ error: null });
        
        try {
            await axios.delete(`${API_URL}/drops/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set(state => ({
                drops: state.drops.filter(drop => drop.id !== id)
            }));
            return true;
        } catch (err) {
            const errorMessage = axios.isAxiosError(err) && err.response 
                ? err.response.data.message || 'Drop silinirken hata oluştu.'
                : 'Bilinmeyen bir hata oluştu.';
            set({ error: errorMessage });
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
        set({ error: null });
    },
}));

// ==================== Selectors ====================
export const useAdminState = () => {
    const drops = useAdminStore((state) => state.drops);
    const loading = useAdminStore((state) => state.loading);
    const error = useAdminStore((state) => state.error);
    const formData = useAdminStore((state) => state.formData);
    const editingDrop = useAdminStore((state) => state.editingDrop);
    const showCreateForm = useAdminStore((state) => state.showCreateForm);
    
    return { drops, loading, error, formData, editingDrop, showCreateForm };
};

export const useAdminActions = () => {
    const fetchDrops = useAdminStore((state) => state.fetchDrops);
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
        fetchDrops,
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

