import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
    FaChevronLeft,
    FaChevronRight,
    FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../../Service/ContextService/AuthContext";
import { IconMapper } from "./IconMapper";
import "./LayoutStyle.css";

const Layout: React.FC = () => {
    const location = useLocation();
    const { menuItems, isLoadingMenu } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(220);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        "General": true,
    });

    const toggleGroup = (category: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

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
        window.location.href = "/billing-app/";
    };

    const clearStoredToken = () => {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
    }

    const isActive = (url: string) => {
        // simple check so nested paths still highlight parent
        return location.pathname === url || location.pathname.startsWith(url + "/");
    };

    const currentItem = menuItems.find((item) => isActive(item.url));

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
                    {isLoadingMenu ? (
                        <div style={{ padding: '1rem', color: '#fff', textAlign: 'center' }}>Loading...</div>
                    ) : (
                        Object.entries(
                            menuItems.reduce((acc: any, item) => {
                                const label = (item.label || "").toLowerCase();
                                let cat = "General";
                                if (label.includes("management") || label.includes("master") || label.includes("user") || label.includes("role") || label.includes("permission") || label.includes("product") || label.includes("category") || label.includes("tax")) {
                                    cat = "Master Data";
                                } else if (label.includes("invoice") || label.includes("history")) {
                                    cat = "Transactions";
                                }
                                if (!acc[cat]) acc[cat] = [];
                                acc[cat].push(item);
                                return acc;
                            }, {})
                        ).map(([category, items]: [string, any]) => (
                            <React.Fragment key={category}>
                                <div
                                    className="sidebar-group-header"
                                    onClick={() => toggleGroup(category)}
                                >
                                    <span>{category}</span>
                                    <FaChevronRight className={`group-chevron ${expandedGroups[category] === true ? 'expanded' : ''}`} />
                                </div>
                                {expandedGroups[category] === true && items.map((item: any) => (
                                    <Link
                                        to={item.url || '#'}
                                        className={"menu-item" + (isActive(item.url) ? " active" : "")}
                                        key={item.label}
                                        title={collapsed ? item.label : ""}
                                    >
                                        <span className="menu-icon">
                                            {IconMapper(item.iconName)}
                                        </span>
                                        {!collapsed && <span className="menu-label">{item.label}</span>}
                                    </Link>
                                ))}
                            </React.Fragment>
                        ))
                    )}
                </nav>
                {!collapsed && <div onMouseDown={handleResize} className="resizer" />}
            </aside>
            <div className="layout-main">
                <header className="layout-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {currentItem ? (
                            <>
                                {IconMapper(currentItem.iconName)}
                                <span>{currentItem.label}</span>
                            </>
                        ) : (
                            <span>Welcome, Admin</span>
                        )}
                    </span>
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