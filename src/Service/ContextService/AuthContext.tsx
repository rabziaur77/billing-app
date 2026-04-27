import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyMenus, type MenuItemDTO } from "../../Components/MainLayout/MenuService";

export interface UserInfo {
    role: string;
    tenant: string;
    tenantName: string;
}

export interface AuthToken {
    role?: string;
    tenant?: string;
    tenantName?: string;
    response?: {
        role?: string;
        tenant?: string;
        tenantName?: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

export interface AuthContextType {
    isAuthenticated: boolean;
    userInfo: UserInfo;
    menuItems: MenuItemDTO[];
    isLoadingMenu: boolean;
    login: (token: AuthToken) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [userInfo, setUserInfo] = useState<UserInfo>({ role: '', tenant: '', tenantName: '' });
    const [menuItems, setMenuItems] = useState<MenuItemDTO[]>([]);
    const [isLoadingMenu, setIsLoadingMenu] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const tokenStr = localStorage.getItem('token');
        if (tokenStr) {
            setTimeout(() => {
                try {
                    // Simulate an API call to validate the parsedToken 
                    const parsedToken = JSON.parse(tokenStr) as AuthToken;
                    setIsAuthenticated(true);
                    const role = parsedToken.role || parsedToken.response?.role || '';
                    const tenant = parsedToken.tenant || parsedToken.response?.tenant || '';
                    const tenantName = parsedToken.tenantName || parsedToken.response?.tenantName || '';
                    setUserInfo({ role: role, tenant: tenant, tenantName: tenantName });
                } catch (error) {
                    setIsAuthenticated(false);
                } finally {
                    setIsReady(true);
                }
            }, 1000);
        }
        else {
            setIsAuthenticated(false);
            setUserInfo({ role: '', tenant: '', tenantName: '' });
            setIsReady(true);
        }
    }, []);

    useEffect(() => {
        const loadMenu = async () => {
            if (isAuthenticated) {
                setIsLoadingMenu(true);
                try {
                    const items = await fetchMyMenus();
                    setMenuItems(items);
                } catch (error) {
                    console.error("Failed to fetch menu", error);
                } finally {
                    setIsLoadingMenu(false);
                }
            } else {
                setMenuItems([]);
            }
        };

        loadMenu();
    }, [isAuthenticated]);

    const login = (token: AuthToken) => {
        localStorage.setItem('token', JSON.stringify(token));
        setIsAuthenticated(true);
        const role = token.role || token.response?.role || '';
        const tenant = token.tenant || token.response?.tenant || '';
        const tenantName = token.tenantName || token.response?.tenantName || '';
        setUserInfo({ role: role, tenant: tenant, tenantName: tenantName });
        navigate('/dashboard');
    }

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserInfo({ role: '', tenant: '', tenantName: '' });
        setMenuItems([]);
        navigate('/');
    };


    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, userInfo, menuItems, isLoadingMenu }}>
            {isReady ? children : <div>Loading...</div>}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}