import { useContext } from 'react';
// Use the frontend AuthContext to ensure a single provider instance across app and shared components
import { AuthContext } from '../frontend/src/context/AuthContext';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
