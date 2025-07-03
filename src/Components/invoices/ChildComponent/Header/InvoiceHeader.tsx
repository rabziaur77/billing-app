import React from "react";
import useInvoiceHeader from "./InvoiceHeaderLogic";
import type { CustomerInvoice } from "../../InvoiceModel/Models";

interface Prop {
    SetCustomer: (customer: CustomerInvoice) => void;
}

const InvoiceHeader: React.FC<Prop> = ({ SetCustomer }) => {
    const { customer, handleInputChange } = useInvoiceHeader({ SetCustomer });
    return (
        <>
        <div className="row mb-3">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Customer Name</label>
                        <input
                            type="text"
                            className="form-control"
                            name="Name"
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
                            name="InvoiceDate"
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
                            name="DueDate"
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
                            value={customer.InvoiceNumber}
                            readOnly
                        />
                    </div>
                </div>
        </>
    );
};

export default InvoiceHeader;