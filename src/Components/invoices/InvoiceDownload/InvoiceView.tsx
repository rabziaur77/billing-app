import { useRef } from "react";
import type { InvoiceReceipt } from "../InvoiceModel/Models";
import { useAuth } from "../../../Service/ContextService/AuthContext";
import "./printStyle.css";

interface Props {
    invoiceData: InvoiceReceipt;
    /** Seller's registered state – used to determine CGST/SGST vs IGST */
    sellerState?: string;
}

const InvoiceView = ({ invoiceData, sellerState = "" }: Props) => {
    const printRef = useRef<HTMLDivElement>(null);
    const { userInfo } = useAuth();

    // Format tenantSlug (e.g. "my-pharmacy") into a display name ("My Pharmacy")
    const tenantDisplayName = userInfo.tenantName
        ? userInfo.tenantName
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase())
        : '';

    const { customer, invoiceList: rawList, subtotal, total } = invoiceData;

    // Defensive: ensure invoiceList is always an array and items have required fields
    const invoiceList = (Array.isArray(rawList) ? rawList : []).map(item => ({
        ...item,
        taxList: Array.isArray(item.taxList) ? item.taxList : [],
        amount: item.amount ?? 0,
        grossAmount: item.grossAmount ?? 0,
        rate: item.rate ?? 0,
        discount: item.discount ?? 0,
        quantity: item.quantity ?? 0,
    }));

    const placeOfSupply = customer.PlaceOfSupply || "";
    const isInterState =
        !!placeOfSupply && !!sellerState &&
        sellerState.toLowerCase().trim() !== placeOfSupply.toLowerCase().trim();

    // Build per-rate GST summary
    const rateMap: Record<number, { name: string; taxable: number; cgst: number; sgst: number; igst: number }> = {};
    invoiceList.forEach(item => {
        item.taxList.forEach(tax => {
            if (!rateMap[tax.rate]) rateMap[tax.rate] = { name: tax.name, taxable: 0, cgst: 0, sgst: 0, igst: 0 };
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
    const totalCgst = gstRows.reduce((s, [, r]) => s + r.cgst, 0);
    const totalSgst = gstRows.reduce((s, [, r]) => s + r.sgst, 0);
    const totalIgst = gstRows.reduce((s, [, r]) => s + r.igst, 0);

    // Payment status
    const paymentStatus = invoiceData.paymentStatus;
    const totalPaid = invoiceData.totalPaid ?? 0;
    const balanceDue = invoiceData.balanceDue ?? total;
    const statusColor = paymentStatus === 'Paid' ? '#198754' : paymentStatus === 'Partial' ? '#fd7e14' : '#dc3545';

    return (
        <>
            {/* ════════════ Printable area ════════════ */}
            <div ref={printRef} className="print-area">
                <div className="container">

                    {/* ── Header ── */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            {tenantDisplayName
                                ? <h2 className="mb-0" style={{ textTransform: 'uppercase' }}>{tenantDisplayName}</h2>
                                : <h2 className="mb-0">TAX INVOICE</h2>
                            }
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6c757d', letterSpacing: '0.05em' }}>TAX INVOICE</div>
                            {customer.InvoiceType && (
                                <span style={{ fontSize: '0.78rem', color: '#6c757d' }}>({customer.InvoiceType})</span>
                            )}
                        </div>
                        {paymentStatus && (
                            <span style={{
                                padding: '4px 14px', borderRadius: 20, fontWeight: 700,
                                fontSize: '0.85rem', border: `2px solid ${statusColor}`, color: statusColor
                            }}>
                                {paymentStatus}
                            </span>
                        )}
                    </div>

                    {/* ── Customer + Invoice Meta ── */}
                    <div className="row mb-3" style={{ fontSize: '0.9rem' }}>
                        <div className="col-6">
                            <p className="mb-1 fw-semibold text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Bill To</p>
                            <p className="mb-0 fw-bold">{customer.Name}</p>
                            {customer.CustomerMobile && <p className="mb-0">📞 {customer.CustomerMobile}</p>}
                            {customer.CustomerGSTIN && (
                                <p className="mb-0">GSTIN: <strong>{customer.CustomerGSTIN}</strong></p>
                            )}
                            {placeOfSupply && <p className="mb-0">Place of Supply: {placeOfSupply}</p>}
                        </div>
                        <div className="col-6 text-end">
                            <p className="mb-0"><strong>Invoice No:</strong> {customer.InvoiceNumber}</p>
                            <p className="mb-0"><strong>Date:</strong> {customer.InvoiceDate}</p>
                            <p className="mb-0"><strong>Due Date:</strong> {customer.DueDate}</p>
                        </div>
                    </div>

                    {/* ── Line items table ── */}
                    <table className="table table-bordered mt-2" style={{ fontSize: '0.85rem' }}>
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Description</th>
                                <th>HSN/SAC</th>
                                <th className="text-end">Qty</th>
                                <th className="text-end">Rate</th>
                                <th className="text-end">Discount</th>
                                <th className="text-end">Taxable Amt</th>
                                {!isInterState && <th className="text-end">CGST</th>}
                                {!isInterState && <th className="text-end">SGST</th>}
                                {isInterState && <th className="text-end">IGST</th>}
                                <th className="text-end">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceList.length === 0 ? (
                                <tr><td colSpan={9} className="text-center text-muted py-3">No line items found</td></tr>
                            ) : invoiceList.map((item, index: number) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.productName}</td>
                                    <td>{item.hsnCode || '—'}</td>
                                    <td className="text-end">{item.quantity}</td>
                                    <td className="text-end">₹{item.rate.toFixed(2)}</td>
                                    <td className="text-end">{(item.discount ?? 0).toFixed(2)}</td>
                                    <td className="text-end">₹{item.amount.toFixed(2)}</td>
                                    {!isInterState && <td className="text-end">₹{(item.cgst ?? 0).toFixed(2)}</td>}
                                    {!isInterState && <td className="text-end">₹{(item.sgst ?? 0).toFixed(2)}</td>}
                                    {isInterState && <td className="text-end">₹{(item.igst ?? 0).toFixed(2)}</td>}
                                    <td className="text-end fw-semibold">₹{item.grossAmount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* ── GST Summary ── */}
                    {gstRows.length > 0 && (
                        <div className="row mb-3">
                            <div className="col-md-7">
                                <p className="fw-semibold mb-1" style={{ fontSize: '0.82rem', color: '#6c757d' }}>GST Summary</p>
                                <table className="table table-sm table-bordered" style={{ fontSize: '0.8rem' }}>
                                    <thead className="table-light">
                                        <tr>
                                            <th>Tax</th>
                                            <th className="text-end">Taxable</th>
                                            {!isInterState && <><th className="text-end">CGST</th><th className="text-end">SGST</th></>}
                                            {isInterState && <th className="text-end">IGST</th>}
                                            <th className="text-end">Tax Amt</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gstRows.map(([rate, row]) => (
                                            <tr key={rate}>
                                                <td>{row.name} ({rate}%)</td>
                                                <td className="text-end">₹{row.taxable.toFixed(2)}</td>
                                                {!isInterState && <><td className="text-end">₹{row.cgst.toFixed(2)}</td><td className="text-end">₹{row.sgst.toFixed(2)}</td></>}
                                                {isInterState && <td className="text-end">₹{row.igst.toFixed(2)}</td>}
                                                <td className="text-end fw-semibold">₹{(row.cgst + row.sgst + row.igst).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Totals ── */}
                            <div className="col-md-5">
                                <table className="table table-sm" style={{ fontSize: '0.85rem' }}>
                                    <tbody>
                                        <tr><th>Subtotal</th><td className="text-end">₹{subtotal.toFixed(2)}</td></tr>
                                        {!isInterState && totalCgst > 0 && <>
                                            <tr><td className="text-muted">CGST</td><td className="text-end">₹{totalCgst.toFixed(2)}</td></tr>
                                            <tr><td className="text-muted">SGST</td><td className="text-end">₹{totalSgst.toFixed(2)}</td></tr>
                                        </>}
                                        {isInterState && totalIgst > 0 &&
                                            <tr><td className="text-muted">IGST</td><td className="text-end">₹{totalIgst.toFixed(2)}</td></tr>
                                        }
                                        <tr className="table-active">
                                            <th>Grand Total</th>
                                            <td className="text-end fw-bold">₹{total.toFixed(2)}</td>
                                        </tr>
                                        {paymentStatus && paymentStatus !== 'Unpaid' && (
                                            <>
                                                <tr><td className="text-success">Amount Paid</td><td className="text-end text-success">₹{totalPaid.toFixed(2)}</td></tr>
                                                <tr><td className="text-danger fw-semibold">Balance Due</td><td className="text-end text-danger fw-bold">₹{balanceDue.toFixed(2)}</td></tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Simple totals when no GST rows */}
                    {gstRows.length === 0 && (
                        <div className="text-end mb-3">
                            <p><strong>Subtotal:</strong> ₹{subtotal.toFixed(2)}</p>
                            <p className="fw-bold"><strong>Grand Total:</strong> ₹{total.toFixed(2)}</p>
                            {paymentStatus && paymentStatus !== 'Unpaid' && (
                                <>
                                    <p className="text-success"><strong>Amount Paid:</strong> ₹{totalPaid.toFixed(2)}</p>
                                    <p className="text-danger fw-bold"><strong>Balance Due:</strong> ₹{balanceDue.toFixed(2)}</p>
                                </>
                            )}
                        </div>
                    )}

                    <p className="text-center text-muted mt-4" style={{ fontSize: '0.78rem' }}>
                        Thank you for your business!
                    </p>
                </div>
            </div>

            {/* ════════════ Action buttons (no-print) ════════════ */}
            <div className="container no-print d-flex gap-2 mt-3">
                <button className="btn btn-primary" onClick={() => window.print()}>
                    🖨️ Print Invoice
                </button>
                <button
                    className="btn btn-success"
                    onClick={() => {
                        const msg =
                            `*Invoice: ${customer.InvoiceNumber}*\n` +
                            `Hello ${customer.Name},\n\n` +
                            `Your invoice for *₹${total.toFixed(2)}* is ready.\n` +
                            `Date: ${customer.InvoiceDate}\n` +
                            `Due Date: ${customer.DueDate}\n\n` +
                            `Thank you for your business!`;
                        window.open(`https://wa.me/${customer.CustomerMobile}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                >
                    💬 Send via WhatsApp
                </button>
            </div>
        </>
    );
};

export default InvoiceView;
