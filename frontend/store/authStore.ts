import { create } from 'zustand';
import axios from 'axios';

interface IUser {
    id: string;
    email: string;
    role: 'ADMIN' | 'USER';
}

interface IAuthState {
    token: string | null;
    user: IUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface IAuthActions {
    authenticate: (endpoint: 'signup' | 'login', email: string, password: string) => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

type AuthStore = IAuthState & IAuthActions;

const API_URL = 'http://localhost:5000/auth';

const loadAuthFromStorage = (): { token: string | null; user: IUser | null } => {
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

export const useAuthStore = create<AuthStore>((set) => ({
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

    signup: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
            await axios.post(`${API_URL}/signup`, { email, password });
            set({ isLoading: false, error: null });
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
    
    login: async (email: string, password: string) => {
        const store = useAuthStore.getState();
        await store.authenticate('login', email, password);
    },

    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        set({ 
            token: null, 
            user: null, 
            isAuthenticated: false, 
            error: null 
        });
    },

    clearError: () => {
        set({ error: null });
    },
}));

export const useAuth = () => {
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);
    
    return { token, user, isAuthenticated, isLoading, error };
};

export const useAuthActions = () => {
    const login = useAuthStore((state) => state.login);
    const signup = useAuthStore((state) => state.signup);
    const logout = useAuthStore((state) => state.logout);
    const clearError = useAuthStore((state) => state.clearError);
    
    return { login, signup, logout, clearError };
};