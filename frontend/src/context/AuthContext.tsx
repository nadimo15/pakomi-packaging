import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { User, Role } from '../types.ts';
import * as api from '../api.ts';

const TOKEN_KEY = 'pakomi_token';
const USER_KEY = 'pakomi_user'; // Key to store user object

interface AuthContextType {
    currentUser: User | null;
    currentUserRole: Role | null;
    token: string | null;
    login: (email: string, password: string) => Promise<any>;
    logout: () => void;
    register: (name: string, email: string, password: string) => Promise<any>;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<Role | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const updateUserState = useCallback((apiResponse: { user: User & { role: Role }, token: string } | null) => {
        if (apiResponse && apiResponse.user && apiResponse.token) {
            const { user, token } = apiResponse;
            localStorage.setItem(TOKEN_KEY, token);
            // Store the user object as well for session persistence on refresh
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            setToken(token);
            setCurrentUser(user);
            setCurrentUserRole(user.role);
        } else {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setToken(null);
            setCurrentUser(null);
            setCurrentUserRole(null);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const initializeUser = () => {
            const storedToken = localStorage.getItem(TOKEN_KEY);
            const storedUser = localStorage.getItem(USER_KEY);
            if (storedToken && storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    setToken(storedToken);
                    setCurrentUser(user);
                    setCurrentUserRole(user.role);
                } catch (e) {
                    console.error("Failed to parse user data from storage", e);
                    // Clear corrupted data
                    localStorage.removeItem(TOKEN_KEY);
                    localStorage.removeItem(USER_KEY);
                }
            }
            setIsLoading(false);
        };
        initializeUser();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await api.login(email, password);
        updateUserState(response);
        return response.user;
    };

    const register = async (name: string, email: string, password: string) => {
        const response = await api.register(name, email, password);
        updateUserState(response);
        return response.user;
    };

    const logout = () => {
        updateUserState(null);
        window.dispatchEvent(new Event('storage')); // Notify other components
    };
    
    // Listen to storage events to sync logout across tabs
    useEffect(() => {
        const syncLogout = (event: StorageEvent) => {
            if (event.key === TOKEN_KEY && event.newValue === null) {
                logout();
            }
        };
        window.addEventListener('storage', syncLogout);
        return () => window.removeEventListener('storage', syncLogout);
    }, []);

    const value = {
        currentUser,
        currentUserRole,
        token,
        login,
        logout,
        register,
        isLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
