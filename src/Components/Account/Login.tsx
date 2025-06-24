import React from 'react';
import useLoginLogic from './LoginLogic';

const Login: React.FC = () => {
    const { loginModel, error, handleSubmit, inputhandler, isLoading } = useLoginLogic();

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow-sm p-4" style={{ maxWidth: 400, width: '100%' }}>
            <h2 className="mb-1 text-center fw-bold" style={{ color: '#2c3e50', letterSpacing: '1px' }}>
                Login
            </h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                    id="email"
                    name='email'
                    type="email"
                    className="form-control"
                    value={loginModel.email}
                    onChange={inputhandler}
                    required
                />
                </div>
                <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                    id="password"
                    name='password'
                    type="password"
                    className="form-control"
                    value={loginModel.password}
                    onChange={inputhandler}
                    required
                />
                </div>
                {error && <div className="alert alert-danger py-2">{error}</div>}
                <button type="submit" disabled={isLoading} 
                className="btn btn-primary w-100">
                    {
                        isLoading ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : null
                    }
                    Login
                </button>
            </form>
            <footer className="mt-4 text-center text-muted" style={{ fontSize: '0.95rem' }}>
                &copy; {new Date().getFullYear()} AccurateAppSolution. All rights reserved.
            </footer>
            </div>
        </div>
    );
};

export default Login;