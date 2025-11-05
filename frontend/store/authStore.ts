import { create } from 'zustand';
import axios from 'axios';

interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'USER';
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    
    authenticate: (endpoint: 'signup' | 'login', email: string, password: string) => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const API_URL = 'http://localhost:5000/auth'; 

// localStorage'dan token ve user bilgilerini yükle
const loadAuthFromStorage = () => {
    if (typeof window === 'undefined') {
        return { token: null, user: null };
    }
    
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('authUser');
    
    if (token && userStr) {
        try {
            const user = JSON.parse(userStr);
            return { token, user };
        } catch {
            return { token: null, user: null };
        }
    }
    
    return { token: null, user: null };
};

const { token: initialToken, user: initialUser } = loadAuthFromStorage();

export const useAuthStore = create<AuthState>((set) => ({
    token: initialToken,
    user: initialUser,
    isAuthenticated: !!initialToken && !!initialUser,
    isLoading: false,
    error: null,

    authenticate: async (endpoint: 'signup' | 'login', email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/${endpoint}`, { email, password });
            
            const { token, user } = response.data;

            localStorage.setItem('authToken', token);
            localStorage.setItem('authUser', JSON.stringify(user));
            
            set({
                token,
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });

        } catch (err) {
            const errorMessage = axios.isAxiosError(err) && err.response 
                ? err.response.data.message 
                : 'Bilinmeyen bir hata oluştu.';
                
            set({ 
                error: errorMessage, 
                isLoading: false, 
                token: null, 
                user: null,
                isAuthenticated: false,
            });
            throw new Error(errorMessage);
        }
    },

    // Kayıt Fonksiyonu
    signup: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/signup`, { email, password });

            set({
                isLoading: false,
                error: null,
            });

        } catch (err) {
            const errorMessage = axios.isAxiosError(err) && err.response 
                ? err.response.data.message 
                : 'Bilinmeyen bir hata oluştu.';
                
            set({ 
                error: errorMessage, 
                isLoading: false,
            });
            throw new Error(errorMessage);
        }
    },
    
    // Giriş Fonksiyonu
    login: async (email: string, password: string) => {
        const store = useAuthStore.getState();
        await store.authenticate('login', email, password);
    },

    // Çıkış Fonksiyonu
    logout: async () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        set({ token: null, user: null, isAuthenticated: false, error: null });
    },
}));