import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const data = await authAPI.getMe();
            setUser(data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        const data = await authAPI.login(credentials);
        setUser(data.user);
        return data;
    };

    const register = async (userData) => {
        const data = await authAPI.register(userData);
        setUser(data.user);
        return data;
    };

    const logout = async () => {
        await authAPI.logout();
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
