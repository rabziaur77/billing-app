import React, { useState } from 'react';
import { useSalesReturnLogic } from './SalesReturnLogic';
import type { SalesReturn } from './SalesReturnModel';

const SalesReturnPage: React.FC = () => {
    const {
        returns, loading, saving, error, success,
        originalInvoiceNo, setOriginalInvoiceNo,
        reason, setReason,
        items, addItem, removeItem, updateItem,
        totalRefund, submit,
    } = useSalesReturnLogic();

    const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">
                    <span className="text-danger me-2">↩</span>Sales Return / Credit Note
                </h4>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'create' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create')}>
                        Create Return
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}>
                        Return History
                        {returns.length > 0 && (
                            <span className="badge bg-secondary ms-2">{returns.length}</span>
                        )}
                    </button>
                </li>
            </ul>

            {/* ── CREATE RETURN FORM ───────────────────────────────────────────── */}
            {activeTab === 'create' && (
                <div className="card shadow-sm border-0">
                    <div className="card-body">
                        {error   && <div className="alert alert-danger py-2">{error}</div>}
                        {success && <div className="alert alert-success py-2">{success}</div>}

                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <label className="form-label fw-semibold">
                                    Original Invoice No <span className="text-danger">*</span>
                                </label>
                                <input
                                    className="form-control"
                                    placeholder="e.g. INV-000042"
                                    value={originalInvoiceNo}
                                    onChange={e => setOriginalInvoiceNo(e.target.value)}
                                />
                            </div>
                            <div className="col-md-8">
                                <label className="form-label fw-semibold">Reason</label>
                                <input
                                    className="form-control"
                                    placeholder="e.g. Damaged goods, Wrong item…"
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    maxLength={300}
                                />
                            </div>
                        </div>

                        <h6 className="fw-semibold mb-3">Return Items</h6>
                        <div className="table-responsive mb-3">
                            <table className="table table-bordered align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Product Name</th>
                                        <th style={{ width: 90 }}>HSN/SAC</th>
                                        <th style={{ width: 90 }}>Qty</th>
                                        <th style={{ width: 110 }}>Rate (₹)</th>
                                        <th style={{ width: 120 }}>Refund (₹)</th>
                                        <th style={{ width: 44 }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <input
                                                    className="form-control form-control-sm"
                                                    placeholder="Product name"
                                                    value={item.productName}
                                                    onChange={e => updateItem(idx, 'productName', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    className="form-control form-control-sm"
                                                    placeholder="HSN/SAC"
                                                    value={item.hsnCode ?? ''}
                                                    maxLength={8}
                                                    onChange={e => updateItem(idx, 'hsnCode', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number" min={0.01} step={0.01}
                                                    className="form-control form-control-sm"
                                                    value={item.quantity}
                                                    onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number" min={0}
                                                    className="form-control form-control-sm"
                                                    value={item.rate}
                                                    onChange={e => updateItem(idx, 'rate', parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td className="text-end fw-semibold">
                                                ₹{(item.quantity * item.rate).toFixed(2)}
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    disabled={items.length === 1}
                                                    onClick={() => removeItem(idx)}
                                                >×</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={4} className="text-end fw-bold">Total Refund:</td>
                                        <td className="text-end fw-bold text-danger">
                                            ₹{totalRefund.toFixed(2)}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="d-flex gap-2">
                            <button type="button" className="btn btn-outline-primary btn-sm" onClick={addItem}>
                                + Add Item
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger ms-auto"
                                disabled={saving}
                                onClick={submit}
                            >
                                {saving
                                    ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</>
                                    : '↩ Submit Return'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── RETURN HISTORY ───────────────────────────────────────────────── */}
            {activeTab === 'history' && (
                <div className="card shadow-sm border-0">
                    <div className="card-body">
                        {loading
                            ? <div className="text-center py-4"><div className="spinner-border" /></div>
                            : returns.length === 0
                            ? <p className="text-muted text-center py-4">No returns found.</p>
                            : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Return No</th>
                                                <th>Original Invoice</th>
                                                <th>Date</th>
                                                <th>Reason</th>
                                                <th className="text-end">Refund (₹)</th>
                                                <th>Items</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {returns.map((r: SalesReturn) => (
                                                <tr key={r.id}>
                                                    <td><span className="badge bg-danger">{r.returnNumber}</span></td>
                                                    <td>{r.originalInvoiceNo}</td>
                                                    <td>{new Date(r.returnDate).toLocaleDateString('en-IN')}</td>
                                                    <td className="text-muted small">{r.reason ?? '—'}</td>
                                                    <td className="text-end fw-semibold text-danger">
                                                        ₹{r.totalRefund.toFixed(2)}
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-secondary">{r.items?.length ?? 0} items</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        }
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesReturnPage;
