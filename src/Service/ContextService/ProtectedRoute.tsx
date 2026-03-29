import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Service/ContextService/AuthContext";

const AuthHOC = <P extends object>(Component: React.ComponentType<P>) => {
    const WrappedComponent = (props: P) => {
        const { isAuthenticated, menuItems, isLoadingMenu } = useAuth();
        const location = useLocation();

        if (isLoadingMenu) {
            return <div className="p-4 text-center">Checking Permissions...</div>;
        }

        if (!isAuthenticated) {
            localStorage.removeItem('token');
            return <Navigate to="/" replace />;
        }

        // Helper to find the first valid menu item
        const getDefaultPath = () => {
            if (menuItems.length > 0) {
                return menuItems[0].url;
            }
            return "/"; // Fallback if no menus are assigned
        };

        // Authorization check: path should be in menuItems
        const currentPath = location.pathname;
        
        const isAllowed = menuItems.some(item => 
                              item.url === currentPath || 
                              currentPath.startsWith(item.url + "/")
                          );

        if (!isAllowed) {
            console.warn(`Access denied for path: ${currentPath}. Redirecting to default.`);
            const fallback = getDefaultPath();
            // If we are already at the fallback, don't redirect to avoid loop
            if (currentPath === fallback) {
                return <div className="p-4 text-center text-danger">Access Denied. No valid menus found. Please contact admin.</div>;
            }
            return <Navigate to={fallback} replace />;
        }

        return <Component {...props} />;
    };
    
    WrappedComponent.displayName = `AuthHOC(${Component.displayName || Component.name || 'Component'})`;
    return WrappedComponent;
}

export const LoginRedirectAuth = <P extends object>(Component: React.ComponentType<P>) => {
    const WrappedComponent = (props: P) => {
        const auth = useAuth();

        if (auth.isAuthenticated) {
            const defaultPath = auth.menuItems.length > 0 ? auth.menuItems[0].url : "/dashboard";
            return <Navigate to={defaultPath} replace />;
        }
        return <Component {...props} />;
    };

    WrappedComponent.displayName = `LoginRedirectAuth(${Component.displayName || Component.name || 'Component'})`;
    return WrappedComponent;
}

export default AuthHOC;