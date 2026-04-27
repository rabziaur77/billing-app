import { type ReactNode } from "react";
interface PopupViewProps {
    children: ReactNode;
    onClose?: () => void;
}

const PopupView= ({ children, onClose }: PopupViewProps) => {
    return (
        <div className="popup-view" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", zIndex: 1060, overflowY: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
            <div style={{ background: "#fff", margin: "2% auto", borderRadius: 8, width: "90%", maxWidth: 900, maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", position: "sticky", top: 0, background: "#fff", zIndex: 1, padding: "6px 10px", borderBottom: "1px solid #eee" }}><button
                    onClick={onClose}
                    style={{
                        background: "transparent",
                        border: "none",
                        fontSize: 18,
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