import React from 'react';
import usePaymentLogic from './PaymentLogic';
import type { PaymentMode } from './PaymentModel';

const PAYMENT_MODES: PaymentMode[] = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card'];

const statusBadge = (p: { amountPaid: number; invoiceTotal: number; balanceDue: number }) => {
    if (p.balanceDue <= 0) return <span className="badge bg-success">Paid</span>;
    if (p.amountPaid > 0) return <span className="badge bg-warning text-dark">Partial</span>;
    return <span className="badge bg-danger">Unpaid</span>;
};

const modeBadgeColor: Record<PaymentMode, string> = {
    Cash: 'bg-success',
    UPI: 'bg-primary',
    'Bank Transfer': 'bg-info text-dark',
    Cheque: 'bg-secondary',
    Card: 'bg-dark',
};

const Payments: React.FC<{ initialInvoiceNumber?: string }> = ({ initialInvoiceNumber }) => {
    const {
        payments, loading, saving, showModal, setShowModal,
        form, formError, searchTerm, setSearchTerm, filterMode, setFilterMode,
        openRecordPayment, handleFormChange, handleSave, totalCollected, currentBalanceDue,
    } = usePaymentLogic(initialInvoiceNumber);

    return (
        <div className="container-fluid py-3">
            {/* ── Summary Cards ── */}
            <div className="row g-3 mb-4">
                <div className="col-sm-4">
                    <div className="card border-0 shadow-sm text-center py-3">
                        <div className="text-muted small mb-1">Total Payments (filtered)</div>
                        <div className="fw-bold fs-5">{payments.length}</div>
                    </div>
                </div>
                <div className="col-sm-4">
                    <div className="card border-0 shadow-sm text-center py-3">
                        <div className="text-muted small mb-1">Amount Collected</div>
                        <div className="fw-bold fs-5 text-success">₹{totalCollected.toFixed(2)}</div>
                    </div>
                </div>
                <div className="col-sm-4 d-flex align-items-center justify-content-center">
                    <button className="btn btn-primary px-4" onClick={() => openRecordPayment()}>
                        + Record Payment
                    </button>
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                <input
                    type="text"
                    className="form-control"
                    style={{ maxWidth: 280 }}
                    placeholder="Search invoice / customer / reference…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <select
                    className="form-select"
                    style={{ maxWidth: 170 }}
                    value={filterMode}
                    onChange={e => setFilterMode(e.target.value as any)}
                >
                    <option value="All">All Modes</option>
                    {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>

            {/* ── Table ── */}
            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover table-bordered align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Invoice No</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th className="text-end">Invoice Total</th>
                                <th className="text-end">Amount Paid</th>
                                <th className="text-end">Balance Due</th>
                                <th>Mode</th>
                                <th>Reference</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length === 0 ? (
                                <tr><td colSpan={11} className="text-center text-muted py-4">No payment records found.</td></tr>
                            ) : payments.map((p, i) => (
                                <tr key={p.paymentId}>
                                    <td>{i + 1}</td>
                                    <td><code>{p.invoiceNumber}</code></td>
                                    <td>{p.customerName}</td>
                                    <td>{p.paymentDate}</td>
                                    <td className="text-end">₹{p.invoiceTotal.toFixed(2)}</td>
                                    <td className="text-end text-success fw-semibold">₹{p.amountPaid.toFixed(2)}</td>
                                    <td className="text-end text-danger fw-semibold">₹{p.balanceDue.toFixed(2)}</td>
                                    <td>
                                        <span className={`badge ${modeBadgeColor[p.paymentMode]}`}>{p.paymentMode}</span>
                                    </td>
                                    <td>{p.referenceNumber || '—'}</td>
                                    <td>{statusBadge(p)}</td>
                                    <td>
                                        {p.balanceDue > 0 && (
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => openRecordPayment(p.invoiceNumber, p.balanceDue)}
                                                title="Record another payment"
                                            >
                                                + Pay
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Record Payment Modal ── */}
            {showModal && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Record Payment</h5>
                                <button className="btn-close" onClick={() => setShowModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label fw-bold">Invoice Number <span className="text-danger">*</span></label>
                                        <input
                                            className="form-control"
                                            value={form.invoiceNumber}
                                            onChange={e => handleFormChange('invoiceNumber', e.target.value)}
                                            placeholder="e.g. INV-2024-001"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Amount Paid (₹) <span className="text-danger">*</span></label>
                                        <input
                                            type="number" className={`form-control ${formError ? 'is-invalid' : ''}`} min={0} step="0.01"
                                            value={form.amountPaid}
                                            onChange={e => handleFormChange('amountPaid', Number(e.target.value))}
                                        />
                                        {currentBalanceDue !== null && (
                                            <small className="text-muted">Balance due: ₹{currentBalanceDue.toFixed(2)}</small>
                                        )}
                                        {formError && <div className="invalid-feedback d-block">{formError}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Payment Date</label>
                                        <input
                                            type="date" className="form-control"
                                            value={form.paymentDate}
                                            onChange={e => handleFormChange('paymentDate', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Payment Mode</label>
                                        <select
                                            className="form-select"
                                            value={form.paymentMode}
                                            onChange={e => handleFormChange('paymentMode', e.target.value)}
                                        >
                                            {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Reference / UTR / Cheque No</label>
                                        <input
                                            className="form-control"
                                            value={form.referenceNumber || ''}
                                            onChange={e => handleFormChange('referenceNumber', e.target.value)}
                                            placeholder="Optional"
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Remarks</label>
                                        <input
                                            className="form-control"
                                            value={form.remarks || ''}
                                            onChange={e => handleFormChange('remarks', e.target.value)}
                                            placeholder="Optional notes"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                    {saving ? <><span className="spinner-border spinner-border-sm me-1" />Saving…</> : 'Record Payment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payments;
