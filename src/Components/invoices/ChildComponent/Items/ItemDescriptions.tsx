import React from "react";
import Select from "react-select";
import useItemLogic from "./ItemLogic";
import type { LineItem } from "../../InvoiceModel/Models";
import './itemStyle.css'

interface Prop {
    ItemData?: (item: any) => void;
    items: LineItem[];
}

const InvoiceDescription: React.FC<Prop> = ({ ItemData, items }) => {
    const { addLineItem, handleLineItemChange, lineItems, removeLineItem, 
        TaxList, ProductsList, itemTaxesManage } = useItemLogic({ ItemData, items });
    return (
        <>
            <h5>Line Items</h5>
            <div className="mb-3">
                <table className="table table-bordered align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Description</th>
                            <th style={{ width: "100px" }}>Quantity</th>
                            <th style={{ width: "120px" }}>Rate</th>
                            <th style={{ width: "120px" }}>Discount</th>
                            <th style={{ width: "220px" }}>Tax</th>
                            <th style={{ width: "120px" }}>Amount</th>
                            <th style={{ width: "120px" }}>Gross Amount</th>
                            <th style={{ width: "50px" }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {lineItems.map((item, idx) => (
                            <tr key={idx}>
                                <td>
                                    <Select
                                        isSearchable={true}
                                        options={ProductsList.map(product => ({
                                            value: product.productId,
                                            label: product.name
                                        }))}
                                        onChange={(selected) =>
                                            handleLineItemChange(idx, "productName", selected ? selected.value : "")
                                        }

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
                                        disabled={true}
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
                                        disabled={true}
                                    />
                                </td>
                                <td>
                                    {item.taxList.length > 0 && (
                                        <div className="box-select-multi">
                                            {
                                                item.taxList.map(tax => 
                                                    <div className="item-tax" key={tax.id}>
                                                        {`${tax.name} (${tax.rate}%)`}
                                                    </div>
                                                )
                                            }
                                        </div>
                                    )}
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
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={item.grossAmount.toFixed(2)}
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