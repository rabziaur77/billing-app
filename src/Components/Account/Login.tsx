import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        // TODO: Implement actual login logic here
        alert(`Logged in as ${email}`);
    };

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
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                </div>
                <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                    id="password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                </div>
                {error && <div className="alert alert-danger py-2">{error}</div>}
                <button type="submit" className="btn btn-primary w-100">Login</button>
            </form>
            <footer className="mt-4 text-center text-muted" style={{ fontSize: '0.95rem' }}>
                &copy; {new Date().getFullYear()} AccurateAppSolution. All rights reserved.
            </footer>
            </div>
        </div>
    );
};

export default Login;