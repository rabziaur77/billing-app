import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

interface UserInfo{
    role: string;
    tenant: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    userInfo: UserInfo;
    login: (token: object) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
    const [userInfo, setUserInfo] = useState<UserInfo>({role:'', tenant: ''});
    const navigate = useNavigate();
    

    const login = (token: any) => {
        localStorage.setItem('token', JSON.stringify(token));
        setIsAuthenticated(true);
        setUserInfo({role: token.role, tenant: token.tenantSlug});
        navigate('/dashboard');
    }

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, userInfo }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = ()=> {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}