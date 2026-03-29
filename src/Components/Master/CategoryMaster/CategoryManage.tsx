import React, { useState } from "react";
import useCategoryLogics from "./CategoryLogics";
import MessageView from "../../CommonComp/MessageVIew";
import PopupView from "../../CommonComp/PopupView";
import CsvUpload from "../../CommonComp/CsvUpload";
import BlurLoader from "../../CommonComp/BlurLoader";


const CategoryManage: React.FC = () => {
    const { categories, editCategory, activateOrDeactivateCategory, popupVisible, popupMessage, 
            closePopup, categoryModel, submitCategoryForm, changeEvent, cancelEdit, isEditing, 
            isLoading, onBulkUploadCategories, isBulkLoading, uploadProgress } = useCategoryLogics();

    const [showCsvUpload, setShowCsvUpload] = useState(false);

    return (
        <div className="container py-4">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Categories</h2>
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
                    onUpload={onBulkUploadCategories} 
                    columns={["name", "description", "isActive"]}
                    fileName="categories_template.csv"
                    isLoading={isBulkLoading}
                    progress={uploadProgress}
                />
            )}

            {/* Form Section */}
            <div className="card mb-4">
                <div className="card-body">
                    <form onSubmit={submitCategoryForm}>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label htmlFor="categoryName" className="form-label">Category Name</label>
                                <input
                                    type="text"
                                    id="categoryName"
                                    name="name"
                                    value={categoryModel?.name || ''}
                                    onChange={changeEvent}
                                    className="form-control"
                                    placeholder="Enter category name"
                                />
                            </div>

                            <div className="col-md-4">
                                <label htmlFor="description" className="form-label">Description</label>
                                <input
                                    type="text"
                                    id="description"
                                    name="description"
                                    value={categoryModel?.description || ''}
                                    onChange={changeEvent}
                                    className="form-control"
                                    placeholder="Enter description"
                                />
                            </div>

                            <div className="col-md-4">
                                <label htmlFor="status" className="form-label">Status</label>
                                <select id="status" name="isActive" value={String(categoryModel?.isActive)} onChange={changeEvent}
                                    className="form-select">
                                    <option value={"true"}>Active</option>
                                    <option value={"false"}>Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-3 text-end">
                            <button type="submit" className="btn btn-primary">
                                <i className="bi bi-plus-circle me-1"></i>
                                {isEditing ? "Update Category" : "Add Category"}
                            </button>
                            {isEditing && (
                                <button type="button" className="btn btn-secondary ms-2" onClick={cancelEdit}>
                                    <i className="bi bi-x-circle me-1"></i> Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Table Section */}
            <div className="card">
                <div className="card-body p-0">
                    <BlurLoader isLoading={isLoading} minHeight="200px" loadingText="Loading Categories...">
                        <table className="table table-bordered table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Category ID</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Is Active</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr key={category.categoryId}>
                                        <td>{category.categoryId}</td>
                                        <td>{category.name}</td>
                                        <td>{category.description}</td>
                                        <td>{category.isActive ? "Yes" : "No"}</td>
                                        <td className="text-center">
                                            <button onClick={() => editCategory(category)} className="btn btn-sm btn-warning me-2">
                                                Edit
                                            </button>
                                            <button onClick={() => activateOrDeactivateCategory(category)} className="btn btn-sm btn-danger">
                                                {category.isActive ? "Deactivate" : "Activate"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </BlurLoader>
                </div>
            </div>
            {
                popupVisible && (
                    <PopupView onClose={closePopup}>
                        <MessageView message={popupMessage} />
                    </PopupView>

                )
            }
        </div>
    );
}

export default CategoryManage;