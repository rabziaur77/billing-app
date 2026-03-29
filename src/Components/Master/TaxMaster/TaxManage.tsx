import React from "react";
import MessageView from "../../CommonComp/MessageVIew";
import PopupView from "../../CommonComp/PopupView";
import BlurLoader from "../../CommonComp/BlurLoader";
import CsvUpload from "../../CommonComp/CsvUpload";
import useTaxLogics from "./TaxLogics";


const TaxManage: React.FC = () => {
    const { taxes, editTax, popupVisible, popupMessage, closePopup, taxModel, 
            submitTaxForm, cancelEdit, isEditing, changeEvent, isLoading, 
            onBulkUploadTaxes, isBulkLoading, uploadProgress } = useTaxLogics();

    const [showCsvUpload, setShowCsvUpload] = React.useState(false);

    return (
        <div className="container py-4">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Tax Management</h2>
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
                    onUpload={onBulkUploadTaxes} 
                    columns={["name", "rate"]}
                    fileName="taxes_template.csv"
                    isLoading={isBulkLoading}
                    progress={uploadProgress}
                />
            )}

            {/* Form Section */}
            <div className="card mb-4">
                <div className="card-body">
                    <form onSubmit={submitTaxForm}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label htmlFor="taxName" className="form-label">Tax Name</label>
                                <input
                                    type="text"
                                    id="taxName"
                                    name="name"
                                    value={taxModel?.name || ''}
                                    onChange={changeEvent}
                                    className="form-control"
                                    placeholder="Enter tax name"
                                />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="rate" className="form-label">Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    id="rate"
                                    name="rate"
                                    value={taxModel?.rate ?? ''}
                                    onChange={changeEvent}
                                    className="form-control"
                                    placeholder="Enter tax rate"
                                />
                            </div>
                        </div>

                        <div className="mt-3 text-end">
                            <button type="submit" className="btn btn-primary">
                                <i className="bi bi-plus-circle me-1"></i>
                                {isEditing ? "Update Tax" : "Add Tax"}
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
                    <BlurLoader isLoading={isLoading} minHeight="200px" loadingText="Loading Taxes...">
                        <table className="table table-bordered table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Tax ID</th>
                                    <th>Name</th>
                                    <th>Rate (%)</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {taxes.map((tax) => (
                                    <tr key={tax.id}>
                                        <td>{tax.id}</td>
                                        <td>{tax.name}</td>
                                        <td>{tax.rate}</td>
                                        <td className="text-center">
                                            <button onClick={() => editTax(tax)} className="btn btn-sm btn-warning me-2">
                                                Edit
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

export default TaxManage;