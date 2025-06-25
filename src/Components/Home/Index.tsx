import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    return (
        <div>
            <h1>Welcome to the Billing App</h1>
            <p>This is the home page.</p>
            <Link to="/settings">Go to Setting</Link>
        </div>
    );
};

export default Home;