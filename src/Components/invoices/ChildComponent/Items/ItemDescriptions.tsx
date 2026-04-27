import React from "react";
import Select from "react-select";
import useItemLogic, { formatProductOptionLabel, getRowMeta } from "./ItemLogic";
import type { LineItem } from "../../InvoiceModel/Models";
import './itemStyle.css';

interface Prop {
    ItemData?: (item: LineItem[]) => void;
    items: LineItem[];
    placeOfSupply?: string;
    sellerState?: string;
    /** Incremented after each invoice save; triggers a product list reload. */
    reloadTrigger?: number;
}

const InvoiceDescription: React.FC<Prop> = ({ ItemData, items, placeOfSupply, sellerState, reloadTrigger }) => {
    const {
        addLineItem, handleLineItemChange, lineItems, removeLineItem,
        ProductsList, stockWarnings, isInterState,
    } = useItemLogic({ ItemData, items, placeOfSupply, sellerState, reloadTrigger });

    const interState = isInterState();

    return (
        <>
            <h5>Line Items</h5>
            <div className="mb-3 table-responsive">
                <table className="table table-bordered align-middle" style={{ minWidth: 900 }}>
                    <thead className="table-light">
                        <tr>
                            <th>Product</th>
                            <th style={{ width: 80 }}>HSN/SAC</th>
                            <th style={{ width: 90 }}>Qty</th>
                            <th style={{ width: 110 }}>Rate (₹)</th>
                            <th style={{ width: 110 }}>Discount</th>
                            <th style={{ width: 200 }}>Tax</th>
                            {!interState && <th style={{ width: 90 }}>CGST</th>}
                            {!interState && <th style={{ width: 90 }}>SGST</th>}
                            {interState && <th style={{ width: 90 }}>IGST</th>}
                            <th style={{ width: 110 }}>Taxable Amt</th>
                            <th style={{ width: 120 }}>Gross Amt</th>
                            <th style={{ width: 44 }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {lineItems.map((item, idx) => {
                            const { prod, stockQty, isLowStock, isOutOfStock } = getRowMeta(item.productId, ProductsList);
                            const hasWarning = !!stockWarnings[idx];

                            return (
                                <tr key={idx} className={hasWarning ? 'table-danger' : ''}>
                                    <td>
                                        <Select
                                            isSearchable
                                            options={ProductsList.map(p => ({
                                                value: p.productId,
                                                label: p.name,
                                            }))}
                                            value={
                                                item.productId
                                                    ? { value: item.productId, label: item.productName }
                                                    : null
                                            }
                                            menuPortalTarget={document.body}
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                            formatOptionLabel={(opt: any) =>
                                                formatProductOptionLabel(opt, ProductsList)
                                            }
                                            onChange={selected =>
                                                handleLineItemChange(idx, "productName", selected ? selected.value : "")
                                            }
                                            placeholder="Select product…"
                                        />
                                        {/* Stock badge below selector */}
                                        {prod && (
                                            <div className="mt-1">
                                                {isOutOfStock
                                                    ? <span className="badge bg-danger">Out of Stock</span>
                                                    : isLowStock
                                                        ? <span className="badge bg-warning text-dark">Low Stock: {stockQty}</span>
                                                        : <span className="badge bg-success">In Stock: {stockQty}</span>
                                                }
                                            </div>
                                        )}
                                        {hasWarning && (
                                            <div className="text-danger" style={{ fontSize: '0.78rem', marginTop: 2 }}>
                                                ⚠️ {stockWarnings[idx]}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            value={item.hsnCode || ''}
                                            onChange={e => handleLineItemChange(idx, 'hsnCode', e.target.value)}
                                            placeholder="HSN/SAC"
                                            maxLength={8}
                                            title="HSN (goods) or SAC (services) code. Auto-filled from product; you may override."
                                            style={{ minWidth: 80 }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number" className="form-control form-control-sm"
                                            min={1} value={item.quantity}
                                            onChange={e => handleLineItemChange(idx, "quantity", e.target.value)}
                                            required
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number" className="form-control form-control-sm"
                                            value={item.rate} readOnly disabled
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number" className="form-control form-control-sm"
                                            value={item.discount ?? 0} readOnly disabled
                                        />
                                    </td>
                                    <td>
                                        {item.taxList.length > 0 ? (
                                            <div className="box-select-multi">
                                                {item.taxList.map(tax => (
                                                    <div className="item-tax" key={tax.id}>
                                                        {`${tax.name} (${tax.rate}%)`}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <span className="text-muted small">—</span>}
                                    </td>
                                    {/* CGST / SGST columns */}
                                    {!interState && (
                                        <>
                                            <td className="text-end">
                                                <small>{(item.cgst ?? 0).toFixed(2)}</small>
                                            </td>
                                            <td className="text-end">
                                                <small>{(item.sgst ?? 0).toFixed(2)}</small>
                                            </td>
                                        </>
                                    )}
                                    {/* IGST column */}
                                    {interState && (
                                        <td className="text-end">
                                            <small>{(item.igst ?? 0).toFixed(2)}</small>
                                        </td>
                                    )}
                                    <td className="text-end">
                                        <small>{item.amount.toFixed(2)}</small>
                                    </td>
                                    <td className="text-end fw-semibold">
                                        <small>{item.grossAmount.toFixed(2)}</small>
                                    </td>
                                    <td>
                                        <button
                                            type="button" className="btn btn-danger btn-sm"
                                            onClick={() => removeLineItem(idx)}
                                            disabled={lineItems.length === 1}
                                            title="Remove"
                                        >×</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <button type="button" className="btn btn-outline-primary mb-4" onClick={addLineItem}>
                + Add Item
            </button>
        </>
    );
};

export default InvoiceDescription;