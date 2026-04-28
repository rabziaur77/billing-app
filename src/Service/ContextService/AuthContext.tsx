import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyMenus, type MenuItemDTO } from "../../Components/MainLayout/MenuService";
import {
    clearStoredToken,
    extractUserId,
    getStoredToken,
    setStoredToken,
    type StoredAuthToken,
} from "../API/AuthService";

export interface UserInfo {
    userId: number | null;
    role: string;
    tenant: string;
    tenantName: string;
}

export type AuthToken = StoredAuthToken;

export interface AuthContextType {
    isAuthenticated: boolean;
    userInfo: UserInfo;
    menuItems: MenuItemDTO[];
    isLoadingMenu: boolean;
    login: (token: AuthToken) => void;
    logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const EMPTY_USER_INFO: UserInfo = {
    userId: null,
    role: '',
    tenant: '',
    tenantName: '',
};

const buildUserInfo = (token: AuthToken): UserInfo => ({
    userId: extractUserId(token),
    role: token.role || token.response?.role || '',
    tenant: token.tenant || token.response?.tenant || '',
    tenantName: token.tenantName || token.response?.tenantName || '',
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [userInfo, setUserInfo] = useState<UserInfo>(EMPTY_USER_INFO);
    const [menuItems, setMenuItems] = useState<MenuItemDTO[]>([]);
    const [isLoadingMenu, setIsLoadingMenu] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = getStoredToken();
        if (storedToken) {
            setIsAuthenticated(true);
            setUserInfo(buildUserInfo(storedToken));
        } else {
            setIsAuthenticated(false);
            setUserInfo(EMPTY_USER_INFO);
        }
        setIsReady(true);
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

        void loadMenu();
    }, [isAuthenticated]);

    const login = (token: AuthToken) => {
        setStoredToken(token);
        setIsAuthenticated(true);
        setUserInfo(buildUserInfo(token));
        navigate('/dashboard');
    };

    const logout = () => {
        clearStoredToken();
        setIsAuthenticated(false);
        setUserInfo(EMPTY_USER_INFO);
        setMenuItems([]);
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, userInfo, menuItems, isLoadingMenu }}>
            {isReady ? children : <div>Loading...</div>}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
