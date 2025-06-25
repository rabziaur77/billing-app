import { Navigate } from "react-router-dom";
import { useAuth } from "../../Service/ContextService/AuthContext";

const AuthHOC = (Component: React.ComponentType) => {
    return (props: React.ComponentProps<typeof Component>) => {
        const auth = useAuth();

        if (!auth) return null;

        if (!auth.isAuthenticated) {
            localStorage.removeItem('token');
            return <Navigate to="/" replace />;
        }
        return <Component {...props} />;
    };
}

export const LoginRedirectAuth = (Component: React.ComponentType) => {
    return (props: React.ComponentProps<typeof Component>) => {
        const auth = useAuth();

        if (auth.isAuthenticated) {
            return <Navigate to="/dashboard" replace />;
        }
        return <Component {...props} />;
    };
}

export default AuthHOC;