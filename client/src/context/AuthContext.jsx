import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('innovprocure_token');
        if (!token) {
            setLoading(false);
            return;
        }

        api.get('/auth/me')
            .then((response) => setUser(response.data.user))
            .catch(() => {
                localStorage.removeItem('innovprocure_token');
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const login = async (payload) => {
        const response = await api.post('/auth/login', payload);
        localStorage.setItem('innovprocure_token', response.data.token);
        setUser(response.data.user);
        return response.data;
    };

    const register = async (payload) => {
        const response = await api.post('/auth/register', payload);
        localStorage.setItem('innovprocure_token', response.data.token);
        setUser(response.data.user);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('innovprocure_token');
        setUser(null);
    };

    const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
