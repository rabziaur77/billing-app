import React from "react";
import type { LineItem } from "../../InvoiceModel/Models";

interface InvoiceSubtotalProps {
    subtotal: number;
    taxAmount: number;
    total: number;
    lineItems?: LineItem[];
    isInterState?: boolean;
    /** True while the invoice save API call is in-flight. */
    isSubmitting?: boolean;
}

const InvoiceSubtotal: React.FC<InvoiceSubtotalProps> = ({ subtotal, total, lineItems = [], isInterState = false, isSubmitting = false }) => {
    // Aggregate CGST / SGST / IGST totals across all line items
    const totalCgst = lineItems.reduce((s, i) => s + (i.cgst ?? 0), 0);
    const totalSgst = lineItems.reduce((s, i) => s + (i.sgst ?? 0), 0);
    const totalIgst = lineItems.reduce((s, i) => s + (i.igst ?? 0), 0);

    // Build per-rate GST summary rows
    const rateMap: Record<number, { taxable: number; cgst: number; sgst: number; igst: number; name: string }> = {};
    lineItems.forEach(item => {
        item.taxList.forEach(tax => {
            if (!rateMap[tax.rate]) {
                rateMap[tax.rate] = { taxable: 0, cgst: 0, sgst: 0, igst: 0, name: tax.name };
            }
            rateMap[tax.rate].taxable += item.amount;
            if (!isInterState) {
                rateMap[tax.rate].cgst += (item.amount * tax.rate) / 200;
                rateMap[tax.rate].sgst += (item.amount * tax.rate) / 200;
            } else {
                rateMap[tax.rate].igst += (item.amount * tax.rate) / 100;
            }
        });
    });

    const gstRows = Object.entries(rateMap);

    return (
        <>
            {/* GST Summary table */}
            {gstRows.length > 0 && (
                <div className="row mb-3">
                    <div className="col-md-8 offset-md-4">
                        <p className="fw-semibold mb-1 text-secondary" style={{ fontSize: '0.85rem' }}>GST Summary</p>
                        <table className="table table-sm table-bordered text-end" style={{ fontSize: '0.82rem' }}>
                            <thead className="table-light">
                                <tr>
                                    <th className="text-start">Tax</th>
                                    <th>Taxable Amt</th>
                                    {!isInterState && <><th>CGST</th><th>SGST</th></>}
                                    {isInterState  && <th>IGST</th>}
                                    <th>Total Tax</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gstRows.map(([rate, row]) => (
                                    <tr key={rate}>
                                        <td className="text-start">{row.name} ({rate}%)</td>
                                        <td>₹{row.taxable.toFixed(2)}</td>
                                        {!isInterState && <><td>₹{row.cgst.toFixed(2)}</td><td>₹{row.sgst.toFixed(2)}</td></>}
                                        {isInterState  && <td>₹{row.igst.toFixed(2)}</td>}
                                        <td>₹{(row.cgst + row.sgst + row.igst).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Totals */}
            <div className="row mb-4">
                <div className="col-md-5 offset-md-7">
                    <table className="table table-sm">
                        <tbody>
                            <tr>
                                <th>Subtotal (before tax)</th>
                                <td className="text-end">₹{subtotal.toFixed(2)}</td>
                            </tr>
                            {!isInterState && totalCgst > 0 && (
                                <>
                                    <tr>
                                        <td className="text-muted small">CGST</td>
                                        <td className="text-end small">₹{totalCgst.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td className="text-muted small">SGST</td>
                                        <td className="text-end small">₹{totalSgst.toFixed(2)}</td>
                                    </tr>
                                </>
                            )}
                            {isInterState && totalIgst > 0 && (
                                <tr>
                                    <td className="text-muted small">IGST</td>
                                    <td className="text-end small">₹{totalIgst.toFixed(2)}</td>
                                </tr>
                            )}
                            <tr className="table-active fw-bold">
                                <th>Grand Total</th>
                                <td className="text-end">₹{total.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="text-end">
                <button
                    type="submit"
                    className="btn btn-success px-4"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                            />
                            Generating…
                        </>
                    ) : (
                        'Generate Invoice'
                    )}
                </button>
            </div>
        </>
    );
};

export default InvoiceSubtotal;