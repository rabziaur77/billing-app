import React, { type ReactNode } from "react";
interface PopupViewProps {
    children: ReactNode;
    onClose?: () => void;
}

const PopupView: React.FC<PopupViewProps> = ({ children, onClose }) => {
    return (
        <div className="popup-view" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", zIndex: 1000 }}>
            <div style={{ background: "#fff", margin: "5% auto",borderRadius: 8, width: "80%", maxWidth: 600 }}>
                <div style={{ display: "flex", justifyContent: "flex-end" }}><button
                    onClick={onClose}
                    style={{
                        background: "transparent",
                        border: "none",
                        fontSize: 15,
                        cursor: "pointer",
                        color: "rgb(255 0 0)",
                        fontWeight: 900,
                    }}
                >
                    ×
                </button></div>
                <div style={{ padding: 20 }}>{children}</div>
            </div>
        </div>
    );
};

export default PopupView;