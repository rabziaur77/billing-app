import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import {
    FaTachometerAlt,
    FaFileInvoiceDollar,
    FaChevronLeft,
    FaChevronRight,
    FaSignOutAlt,
} from "react-icons/fa";
import "./LayoutStyle.css";

const menuItems = [
    { icon: <FaTachometerAlt />, label: "Dashboard", url: "/dashboard" },
    // { icon: <FaUsers />, label: "Users", url: "/settings" },
    { icon: <FaFileInvoiceDollar />, label: "Invoices", url: "/invoices" },
    { icon: <FaFileInvoiceDollar />, label: "Invoice History", url: "/invoice-history" },
    { icon: <FaFileInvoiceDollar />, label: "Category Master", url: "/category-management" },
    { icon: <FaFileInvoiceDollar />, label: "Product Master", url: "/product-management" },
    { icon: <FaFileInvoiceDollar />, label: "Product List", url: "/product-list" },
];

const Layout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(220);
    const minWidth = 60;
    const maxWidth = 300;
    const handleResize = (e: React.MouseEvent) => {
        const startX = e.clientX;
        const startWidth = sidebarWidth;
        const onMouseMove = (moveEvent: MouseEvent) => {
            const newWidth = Math.min(
                Math.max(startWidth + moveEvent.clientX - startX, minWidth),
                maxWidth
            );
            setSidebarWidth(newWidth);
        };
        const onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    };
    const handleLogout = () => {
        clearStoredToken();
        window.location.href = "/";
    };

    const clearStoredToken = () => {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
    }

    return (
        <div className="layout-container">
            <aside
                className="sidebar"
                style={{ width: collapsed ? minWidth : sidebarWidth }}
            >
                <div className="sidebar-header">
                    {!collapsed && <h2 className="sidebar-title">Admin Panel</h2>}
                    <button
                        onClick={() => setCollapsed((c) => !c)}
                        className="toggle-btn"
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
                    </button>
                </div>
                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link to={item.url || '#'} className="menu-item" key={item.label}>
                            {item.icon}
                            {!collapsed && item.label}
                        </Link>
                    ))}
                </nav>
                {!collapsed && <div onMouseDown={handleResize} className="resizer" />}
            </aside>
            <div className="layout-main">
                <header className="layout-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Welcome, Admin</span>
                    <button
                        className="logout-btn"
                        style={{
                            background: "none",
                            border: "none",
                            color: "inherit",
                            fontSize: "1rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem"
                        }}
                        onClick={handleLogout}
                        title="Logout"
                    >
                        <FaSignOutAlt />
                        <span style={{ display: "inline" }}>Logout</span>
                    </button>
                </header>
                <main className="layout-content">
                    <Outlet />
                </main>
                <footer className="layout-footer">
                    &copy; {new Date().getFullYear()} My Application
                </footer>
            </div>
        </div>
    );
};

export default Layout;