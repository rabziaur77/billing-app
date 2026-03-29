import React from 'react';
import './BlurLoader.css';

interface BlurLoaderProps {
    isLoading: boolean;
    children: React.ReactNode;
    loadingText?: string;
    minHeight?: string;
}

const BlurLoader: React.FC<BlurLoaderProps> = ({ 
    isLoading, 
    children, 
    loadingText = "Loading...", 
    minHeight = "150px" 
}) => {
    return (
        <div className="loading-container-relative" style={{ minHeight: isLoading ? minHeight : 'auto' }}>
            {isLoading && (
                <div className="loading-overlay-container">
                    <div className="loading-spinner-circle"></div>
                    <div className="loading-text-label">{loadingText}</div>
                </div>
            )}
            <div className={isLoading ? "blur-content-active" : ""}>
                {children}
            </div>
        </div>
    );
};

export default BlurLoader;
