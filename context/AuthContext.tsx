import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { User, Role } from '../types';
import { getCurrentUser, login as dbLogin, logout as dbLogout, registerUser as dbRegisterUser, getRoles } from '../db';

interface AuthContextType {
    currentUser: User | null;
    currentUserRole: Role | null;
    login: (email: string, password: string) => Promise<User>;
    logout: () => void;
    register: (name: string, email: string, password: string) => Promise<User>;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<Role | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const updateUserAndRole = useCallback(() => {
        const user = getCurrentUser();
        if (user) {
            const roles = getRoles();
            const role = roles.find(r => r.id === user.roleId);
            setCurrentUser(user);
            setCurrentUserRole(role || null);
        } else {
            setCurrentUser(null);
            setCurrentUserRole(null);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        updateUserAndRole();
        // The custom 'storage' event is dispatched from db.ts on login/logout
        window.addEventListener('storage', updateUserAndRole);
        return () => {
            window.removeEventListener('storage', updateUserAndRole);
        };
    }, [updateUserAndRole]);

    const login = async (email: string, password: string) => {
        const user = dbLogin(email, password);
        // updateUserAndRole will be triggered by the storage event dispatched by dbLogin
        return user;
    };

    const register = async (name: string, email: string, password: string) => {
        const user = dbRegisterUser(name, email, password);
        // auto-login after registration
        dbLogin(email, password);
        // updateUserAndRole will be triggered by the storage event
        return user;
    };

    const logout = () => {
        dbLogout();
        // updateUserAndRole will be triggered by the storage event
    };

    const value = {
        currentUser,
        currentUserRole,
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