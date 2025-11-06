import { create } from 'zustand';
import axios from 'axios';
import { Drop } from './adminStore';

export interface ActiveDrop extends Drop {
    _count: {
        waitlistEntries: number;
    };
}

export interface IWaitlistEntry {
    id: string;
    userId: string;
    dropId: string;
    position: number;
    createdAt: string;
}

export interface IClaimCode {
    id: string;
    code: string;
    userId: string;
    dropId: string;
    used: boolean;
    createdAt: string;
    usedAt?: string;
}

interface IDropsState {
    activeDrops: ActiveDrop[];
    currentDrop: ActiveDrop | null;
    waitlistEntry: IWaitlistEntry | null;
    claimCode: IClaimCode | null;
    loading: boolean;
    error: string | null;
}

interface IDropsActions {
    fetchActiveDrops: () => Promise<void>;
    fetchDrop: (id: string) => Promise<void>;
    joinWaitlist: (token: string, dropId: string) => Promise<boolean>;
    leaveWaitlist: (token: string, dropId: string) => Promise<boolean>;
    claimDrop: (token: string, dropId: string) => Promise<boolean>;
    checkWaitlistStatus: (token: string, dropId: string) => Promise<void>;
    checkClaimCode: (token: string, dropId: string) => Promise<void>;
    clearError: () => void;
    resetCurrentDrop: () => void;
}

type DropsStore = IDropsState & IDropsActions;

const API_URL = 'http://localhost:5000/drops';

export const useDropsStore = create<DropsStore>((set, get) => ({
    activeDrops: [],
    currentDrop: null,
    waitlistEntry: null,
    claimCode: null,
    loading: false,
    error: null,

    // Actions
    fetchActiveDrops: async () => {
        set({ loading: true, error: null });
        
        try {
            const response = await axios.get(`${API_URL}`);
            set({ 
                activeDrops: response.data.drops || [], 
                loading: false 
            });
        } catch (err) {
            const errorMessage = axios.isAxiosError(err) && err.response 
                ? err.response.data.message || 'Drop\'lar yüklenirken hata oluştu.'
                : 'Bilinmeyen bir hata oluştu.';
            set({ error: errorMessage, loading: false });
        }
    },

    fetchDrop: async (id: string) => {
        set({ loading: true, error: null });
        
        try {
            const response = await axios.get(`${API_URL}`);
            const drops = response.data.drops || [];
            const drop = drops.find((d: ActiveDrop) => d.id === id);
            
            if (!drop) {
                set({ 
                    error: 'Drop bulunamadı.', 
                    loading: false,
                    currentDrop: null
                });
                return;
            }
            
            set({ 
                currentDrop: drop, 
                loading: false 
            });
        } catch (err) {
            const errorMessage = axios.isAxiosError(err) && err.response 
                ? err.response.data.message || 'Drop yüklenirken hata oluştu.'
                : 'Bilinmeyen bir hata oluştu.';
            set({ error: errorMessage, loading: false });
        }
    },

    joinWaitlist: async (token: string, dropId: string): Promise<boolean> => {
        set({ error: null });
        
        try {
            const response = await axios.post(`${API_URL}/${dropId}/join`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            set({ 
                waitlistEntry: response.data.entry,
                currentDrop: get().currentDrop ? {
                    ...get().currentDrop!,
                    _count: {
                        waitlistEntries: get().currentDrop!._count.waitlistEntries + 
                            (get().waitlistEntry ? 0 : 1)
                    }
                } : null
            });
            
            await get().fetchActiveDrops();
            
            return true;
        } catch (err) {
            const errorMessage = axios.isAxiosError(err) && err.response 
                ? err.response.data.message || 'Waitlist\'e katılırken hata oluştu.'
                : 'Bilinmeyen bir hata oluştu.';
            set({ error: errorMessage });
            return false;
        }
    },

    leaveWaitlist: async (token: string, dropId: string): Promise<boolean> => {
        set({ error: null });
        
        try {
            await axios.post(`${API_URL}/${dropId}/leave`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            set({ 
                waitlistEntry: null,
                currentDrop: get().currentDrop ? {
                    ...get().currentDrop!,
                    _count: {
                        waitlistEntries: Math.max(0, get().currentDrop!._count.waitlistEntries - 1)
                    }
                } : null
            });
            
            await get().fetchActiveDrops();
            
            return true;
        } catch (err) {
            const errorMessage = axios.isAxiosError(err) && err.response 
                ? err.response.data.message || 'Waitlist\'ten ayrılırken hata oluştu.'
                : 'Bilinmeyen bir hata oluştu.';
            set({ error: errorMessage });
            return false;
        }
    },

    claimDrop: async (token: string, dropId: string): Promise<boolean> => {
        set({ error: null });
        
        try {
            const response = await axios.post(`${API_URL}/${dropId}/claim`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.claimCode) {
                set({ claimCode: response.data.claimCode });
                return true;
            } else {
                set({ error: 'Claim code alınamadı.' });
                return false;
            }
        } catch (err) {
            const errorMessage = axios.isAxiosError(err) && err.response 
                ? err.response.data.message || 'Claim işlemi sırasında hata oluştu.'
                : 'Bilinmeyen bir hata oluştu.';
            set({ error: errorMessage });
            
            if (axios.isAxiosError(err) && err.response?.status === 200) {

                if (err.response.data?.claimCode) {
                    set({ claimCode: err.response.data.claimCode });
                    return true;
                }
            }
            
            return false;
        }
    },

    checkWaitlistStatus: async (token: string, dropId: string) => {
        try {
            // waitlist durumunu kontrol et
            const response = await axios.get(`${API_URL}/${dropId}/waitlist-status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.entry) {
                set({ waitlistEntry: response.data.entry });
            } else {
                set({ waitlistEntry: null });
            }
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                if (err.response.status === 401) {
                    set({ waitlistEntry: null });
                } else {
                    set({ waitlistEntry: null });
                }
            } else {
                set({ waitlistEntry: null });
            }
        }
    },

    checkClaimCode: async (token: string, dropId: string) => {
        try {
            // Mevcut claim code'u kontrol et 
            const response = await axios.post(`${API_URL}/${dropId}/claim`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ claimCode: response.data.claimCode || null });
        } catch (err) {
            set({ claimCode: null });
        }
    },

    clearError: () => {
        set({ error: null });
    },

    resetCurrentDrop: () => {
        set({ currentDrop: null, waitlistEntry: null, claimCode: null });
    },
}));

// Selectors 
export const useDropsState = () => {
    const activeDrops = useDropsStore((state) => state.activeDrops);
    const currentDrop = useDropsStore((state) => state.currentDrop);
    const waitlistEntry = useDropsStore((state) => state.waitlistEntry);
    const claimCode = useDropsStore((state) => state.claimCode);
    const loading = useDropsStore((state) => state.loading);
    const error = useDropsStore((state) => state.error);
    
    return { activeDrops, currentDrop, waitlistEntry, claimCode, loading, error };
};

export const useDropsActions = () => {
    const fetchActiveDrops = useDropsStore((state) => state.fetchActiveDrops);
    const fetchDrop = useDropsStore((state) => state.fetchDrop);
    const joinWaitlist = useDropsStore((state) => state.joinWaitlist);
    const leaveWaitlist = useDropsStore((state) => state.leaveWaitlist);
    const claimDrop = useDropsStore((state) => state.claimDrop);
    const checkWaitlistStatus = useDropsStore((state) => state.checkWaitlistStatus);
    const checkClaimCode = useDropsStore((state) => state.checkClaimCode);
    const clearError = useDropsStore((state) => state.clearError);
    const resetCurrentDrop = useDropsStore((state) => state.resetCurrentDrop);
    
    return {
        fetchActiveDrops,
        fetchDrop,
        joinWaitlist,
        leaveWaitlist,
        claimDrop,
        checkWaitlistStatus,
        checkClaimCode,
        clearError,
        resetCurrentDrop,
    };
};

