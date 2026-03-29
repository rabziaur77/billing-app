import React from "react";
import BlurLoader from "../../CommonComp/BlurLoader";
import PopupView from "../../CommonComp/PopupView";
import MessageView from "../../CommonComp/MessageVIew";
import CsvUpload from "../../CommonComp/CsvUpload";
import useRoleLogics from "./RoleLogics";

const RoleManage: React.FC = () => {
    const { roles, roleName, setRoleName, isLoading, submitRoleForm, popupVisible, 
            popupMessage, closePopup, onBulkUploadRoles, isBulkLoading, uploadProgress } = useRoleLogics();

    const [showCsvUpload, setShowCsvUpload] = React.useState(false);

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Role Management</h2>
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
                    onUpload={onBulkUploadRoles} 
                    columns={["roleName"]}
                    fileName="roles_template.csv"
                    isLoading={isBulkLoading}
                    progress={uploadProgress}
                />
            )}

            {/* Form Section */}
            <div className="card mb-4">
                <div className="card-body">
                    <form onSubmit={submitRoleForm}>
                        <div className="row g-3 align-items-end">
                            <div className="col-md-8">
                                <label htmlFor="roleName" className="form-label">Role Name</label>
                                <input
                                    type="text"
                                    id="roleName"
                                    value={roleName}
                                    onChange={(e) => setRoleName(e.target.value)}
                                    className="form-control"
                                    placeholder="Enter role name (e.g., Admin, Manager)"
                                />
                            </div>
                            <div className="col-md-4 text-end">
                                <button type="submit" className="btn btn-primary w-100">
                                    <i className="bi bi-plus-circle me-1"></i> Add Role
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Table Section */}
            <div className="card">
                <div className="card-body p-0">
                    <BlurLoader isLoading={isLoading} minHeight="200px" loadingText="Loading Roles...">
                        <table className="table table-bordered table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Role ID</th>
                                    <th>Role Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.length === 0 && !isLoading ? (
                                    <tr>
                                        <td colSpan={2} className="text-center">No Roles Found</td>
                                    </tr>
                                ) : (
                                    roles.map((role) => (
                                        <tr key={role.roleID}>
                                            <td>{role.roleID}</td>
                                            <td>{role.roleName}</td>
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

export default RoleManage;
