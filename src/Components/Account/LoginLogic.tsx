import { useState } from 'react';
import { API_SERVICE } from '../../Service/API/API_Service';
import { useAuth } from '../../Service/ContextService/AuthContext';
import { resolveTenantSlug } from '../../config/appConfig';

const useLoginLogic = () => {
    const auth = useAuth();
    const [loginModel, setLoginModel] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        if (!loginModel.email || !loginModel.password) {
            setError('Please enter both email and password.');
            setIsLoading(false);
            return;
        }

        const body = {
            email: loginModel.email,
            password: loginModel.password,
            tenantSlug: resolveTenantSlug(window.location.hostname)
        };

        try {
            const response = await API_SERVICE.post('auth-api/Account/loginUser', body);
            setIsLoading(false);

            if (response.status === 200) {
                const result = response.data;
                auth.login(result);
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } catch (err: unknown) {
            setIsLoading(false);
            const errorObj = err as { response?: { data?: { status?: string } }, message?: string };
            setError(
                errorObj?.response?.data?.status ||
                errorObj?.message ||
                'An unexpected error occurred. Please try again.'
            );
        }
    }

    const inputhandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginModel((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    return {
        loginModel,
        error,
        handleSubmit,
        isLoading,
        inputhandler
    }
}

export default useLoginLogic;
