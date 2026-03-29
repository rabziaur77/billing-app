import React, { useState } from "react";
import useUserLogics from "./UserLogics";
import MessageView from "../../CommonComp/MessageVIew";
import PopupView from "../../CommonComp/PopupView";
import BlurLoader from "../../CommonComp/BlurLoader";
import CsvUpload from "../../CommonComp/CsvUpload";

const UserManage: React.FC = () => {
    const {
        users,
        roles,
        userForm,
        isLoading,
        submitUserForm,
        handleInputChange,
        popupVisible,
        popupMessage,
        closePopup,
        onBulkUploadUsers,
        isBulkLoading,
        uploadProgress
    } = useUserLogics();

    const [showCsvUpload, setShowCsvUpload] = useState(false);

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">User Management</h2>
                <button 
                    className={`btn ${showCsvUpload ? 'btn-secondary' : 'btn-outline-primary'}`}
                    onClick={() => setShowCsvUpload(!showCsvUpload)}
                >
                    <i className={`bi ${showCsvUpload ? 'bi-x-circle' : 'bi-upload'} me-1`}></i>
                    {showCsvUpload ? 'Close Bulk Upload' : 'Bulk Upload via CSV'}
                </button>
            </div>

            {showCsvUpload && (
                <CsvUpload 
                    onUpload={onBulkUploadUsers} 
                    columns={["email", "password", "roleID"]}
                    fileName="users_template.csv"
                    isLoading={isBulkLoading}
                    progress={uploadProgress}
                />
            )}

            {/* Form Section */}
            <div className="card mb-4 shadow-sm">
                <div className="card-body">
                    <form onSubmit={submitUserForm}>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    name="Email"
                                    value={userForm.Email}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="user@example.com"
                                    required
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    name="PasswordHash"
                                    value={userForm.PasswordHash}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Role</label>
                                <select
                                    name="RoleID"
                                    value={userForm.RoleID}
                                    onChange={handleInputChange}
                                    className="form-select"
                                    required
                                >
                                    <option value={0}>Select Role</option>
                                    {roles.map(role => (
                                        <option key={role.roleID} value={role.roleID}>
                                            {role.roleName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4 d-flex align-items-end">
                                <button type="submit" className="btn btn-primary w-100">
                                    <i className="bi bi-person-plus me-1"></i> Add User
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Table Section */}
            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <BlurLoader isLoading={isLoading} minHeight="300px" loadingText="Loading Users...">
                        <table className="table table-bordered table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>User ID</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 && !isLoading ? (
                                    <tr>
                                        <td colSpan={3} className="text-center py-4">No Users Found</td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.userID}>
                                            <td>{user.userID}</td>
                                            <td>{user.email}</td>
                                            <td>{user.roleName || user.roleID}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </BlurLoader>
                </div>
            </div>

            {popupVisible && (
                <PopupView onClose={closePopup}>
                    <MessageView message={popupMessage} />
                </PopupView>
            )}
        </div>
    );
};

export default UserManage;
