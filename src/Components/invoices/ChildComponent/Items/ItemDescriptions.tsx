import React from "react";
import Select from "react-select";
import useItemLogic from "./ItemLogic";

interface Prop{
    ItemData?: (item:any)=> void; 
}

const InvoiceDescription: React.FC<Prop> = ({ItemData}) => {
    const { addLineItem, handleLineItemChange, lineItems, removeLineItem, TaxList } = useItemLogic({ItemData});
    return (
        <>
            <h5>Line Items</h5>
            <div className="table-responsive mb-3">
                <table className="table table-bordered align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Description</th>
                            <th style={{ width: "100px" }}>Quantity</th>
                            <th style={{ width: "120px" }}>Rate</th>
                            <th style={{ width: "120px" }}>Discount</th>
                            <th style={{ width: "220px" }}>Tax</th>
                            <th style={{ width: "120px" }}>Amount</th>
                            <th style={{ width: "50px" }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {lineItems.map((item, idx) => (
                            <tr key={idx}>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={item.description}
                                        onChange={(e) =>
                                            handleLineItemChange(idx, "description", e.target.value)
                                        }
                                        required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min={1}
                                        value={item.quantity}
                                        onChange={(e) =>
                                            handleLineItemChange(idx, "quantity", e.target.value)
                                        }
                                        required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min={0}
                                        step="0.01"
                                        value={item.rate}
                                        onChange={(e) =>
                                            handleLineItemChange(idx, "rate", e.target.value)
                                        }
                                        required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min={0}
                                        step="0.01"
                                        value={item.discount}
                                        onChange={(e) =>
                                            handleLineItemChange(idx, "discount", e.target.value)
                                        }
                                    />
                                </td>
                                <td>
                                    <Select
                                        isMulti
                                        options={TaxList.map(tax => ({
                                            value: tax.name,
                                            label: `${tax.name} (${tax.rate}%)`,
                                        }))}
                                        value={item.taxList.map(tax => ({
                                            value: tax.name,
                                            label: `${tax.name} (${tax.rate}%)`,
                                        }))}
                                        onChange={(selectedOptions) => {
                                            const selectedNames = selectedOptions.map(option => option.value);
                                            handleLineItemChange(idx, "taxList", selectedNames);
                                        }}
                                        menuPortalTarget={document.body}
                                        styles={{
                                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                                        }}
                                    />

                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={item.amount.toFixed(2)}
                                        readOnly
                                    />
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-sm"
                                        onClick={() => removeLineItem(idx)}
                                        disabled={lineItems.length === 1}
                                        title="Remove Item"
                                    >
                                        &times;
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button
                type="button"
                className="btn btn-outline-primary mb-4"
                onClick={addLineItem}
            >
                Add Item
            </button>
        </>
    );
};

export default InvoiceDescription;