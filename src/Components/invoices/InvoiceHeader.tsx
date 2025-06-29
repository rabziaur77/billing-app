import React from "react";
import useInvoiceHeader from "./InvoiceHeaderLogic";

const InvoiceHeader: React.FC = () => {
    const {customer, handleInputChange,invoiceNumber} = useInvoiceHeader();
    return (
        <>
        <div className="row mb-3">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Customer Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={customer.Name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="col-md-3 mb-3">
                        <label className="form-label">Invoice Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={customer.InvoiceDate}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="col-md-3 mb-3">
                        <label className="form-label">Due Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={customer.DueDate}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>
                <div className="row mb-4">
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Invoice Number</label>
                        <input
                            type="text"
                            className="form-control"
                            value={invoiceNumber}
                            readOnly
                        />
                    </div>
                </div>
        </>
    );
};

export default InvoiceHeader;