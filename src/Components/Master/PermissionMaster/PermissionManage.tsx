import React from "react";
import PopupView from "../../CommonComp/PopupView";
import MessageView from "../../CommonComp/MessageVIew";
import usePermissionLogics from "./PermissionLogics";

const PermissionManage: React.FC = () => {
    const {
        roles,
        selectedRoleID,
        handleRoleChange,
        menuAssignments,
        toggleMenuAssignment,
        saveRoleMenus,
        popupVisible,
        popupMessage,
        closePopup,
    } = usePermissionLogics();

    return (
        <div className="container py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Role Menu Assignment</h2>
            </div>

            {/* Role Selector Card */}
            <div className="card mb-4 shadow-sm">
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-6">
                            <label htmlFor="roleSelect" className="form-label fw-semibold">
                                Select Role
                            </label>
                            <select
                                id="roleSelect"
                                className="form-select"
                                value={selectedRoleID}
                                onChange={(e) => handleRoleChange(parseInt(e.target.value))}
                            >
                                <option value={0}>-- Select a Role --</option>
                                {roles.map((role: any) => (
                                    <option key={role.roleID} value={role.roleID}>
                                        {role.roleName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6 text-end">
                            {selectedRoleID > 0 && menuAssignments.length > 0 && (
                                <button
                                    className="btn btn-primary px-4"
                                    onClick={saveRoleMenus}
                                >
                                    <i className="bi bi-floppy me-1"></i>
                                    Save Assignments
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Grid - Always Visible */}
            <div className="card shadow-sm mb-4">
                <div className="card-header d-flex align-items-center gap-2">
                    <i className="bi bi-list-check"></i>
                    <span className="fw-semibold">
                        {selectedRoleID > 0 ? (
                            <>
                                Assign Menus for: <span className="text-primary">
                                    {roles.find((r: any) => r.roleID === selectedRoleID)?.roleName}
                                </span>
                            </>
                        ) : (
                            "Menu List"
                        )}
                    </span>
                </div>
                <div className="card-body p-0">
                    <table className="table table-bordered table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: "70%" }}>Menu Name</th>
                                <th className="text-center" style={{ width: "30%" }}>
                                    Assign
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {menuAssignments.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="text-center p-4 text-muted">
                                        <i className="bi bi-info-circle me-2"></i>
                                        No menus available.
                                    </td>
                                </tr>
                            ) : (
                                // Group by category
                                Object.entries(
                                    menuAssignments.reduce((acc: any, menu) => {
                                        if (!acc[menu.category]) acc[menu.category] = [];
                                        acc[menu.category].push(menu);
                                        return acc;
                                    }, {})
                                ).map(([category, items]: [string, any]) => (
                                    <React.Fragment key={category}>
                                        <tr className="table-secondary">
                                            <td colSpan={2} className="fw-bold text-uppercase small px-3 py-2">
                                                {category}
                                            </td>
                                        </tr>
                                        {items.map((menu: any) => (
                                            <tr key={menu.menuID}>
                                                <td className="fw-medium ps-4">{menu.menuName}</td>
                                                <td className="text-center">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        style={{
                                                            width: "1.4em",
                                                            height: "1.4em",
                                                            cursor: selectedRoleID > 0 ? "pointer" : "not-allowed",
                                                        }}
                                                        checked={menu.isChecked}
                                                        disabled={selectedRoleID === 0}
                                                        onChange={() => toggleMenuAssignment(menu.menuID)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {menuAssignments.length > 0 && selectedRoleID > 0 && (
                    <div className="card-footer text-muted small">
                        <i className="bi bi-info-circle me-1"></i>
                        Check the menus you want to grant to this role and click Save.
                    </div>
                )}
            </div>

            {popupVisible && (
                <PopupView onClose={closePopup}>
                    <MessageView message={popupMessage} />
                </PopupView>
            )}
        </div>
    );
};

export default PermissionManage;
