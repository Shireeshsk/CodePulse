import { createContext, useContext, useState, useEffect, useRef } from 'react';
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
    const refreshTimerRef = useRef(null);

    // Check if user is logged in on mount
    useEffect(() => {
        checkAuth();
    }, []);

    // Setup token refresh interval when user is logged in
    useEffect(() => {
        if (user) {
            // Refresh token every 12 minutes (access token expires in 15 minutes)
            refreshTimerRef.current = setInterval(async () => {
                try {
                    await authAPI.refresh();
                    console.log('Token refreshed automatically');
                } catch (error) {
                    console.error('Auto refresh failed:', error);
                    // If refresh fails, log out the user
                    setUser(null);
                    clearInterval(refreshTimerRef.current);
                }
            }, 12 * 60 * 1000); // 12 minutes
        } else {
            // Clear interval when user logs out
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
        }

        // Cleanup on unmount
        return () => {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
        };
    }, [user]);

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
        if (refreshTimerRef.current) {
            clearInterval(refreshTimerRef.current);
        }
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
