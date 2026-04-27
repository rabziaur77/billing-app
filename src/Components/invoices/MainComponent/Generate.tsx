import React from "react";
import InvoiceHeader from "../ChildComponent/Header/InvoiceHeader";
import InvoiceDescription from "../ChildComponent/Items/ItemDescriptions";
import InvoiceSubtotal from "../ChildComponent/TotalCalc/SubTotalCal";
import InvoiceView from "../InvoiceDownload/InvoiceView";
import useGenerateInvoiceLogic from "./GenerateLogic";
import PopupView from "../../CommonComp/PopupView";

const SELLER_STATE = "Maharashtra";
const PAYMENT_MODES = ["Cash", "UPI", "Cheque", "Bank Transfer", "Card"];

const CreateInvoicePage: React.FC = () => {
    const {
        itemsCost,
        ItemsData,
        submitForm,
        SetCustomer,
        customer,
        invoiceReceipt,
        InvoiceShow,
        setInvoiceShow,
        itemData,
        resetKey,
        isSubmitting,
        // Payment panel
        showPaymentPanel,
        setShowPaymentPanel,
        paymentForm,
        setPaymentForm,
        paymentSaving,
        paymentDone,
        paymentError,
        handleRecordPayment,
    } = useGenerateInvoiceLogic();

    const placeOfSupply = customer.PlaceOfSupply || "";
    const isInterState =
        !!placeOfSupply &&
        SELLER_STATE.toLowerCase().trim() !== placeOfSupply.toLowerCase().trim();

    return (
        <div className="container-fluid my-4 px-4">
            <h2 className="mb-4">Create Invoice</h2>
            <form onSubmit={submitForm}>
                {/* Invoice Header – customer autocomplete + GST fields */}
                <InvoiceHeader SetCustomer={SetCustomer} resetKey={resetKey} />

                {/* Line Items – stock badge + CGST/SGST/IGST columns */}
                <InvoiceDescription
                    items={itemData}
                    ItemData={ItemsData}
                    placeOfSupply={placeOfSupply}
                    sellerState={SELLER_STATE}
                    reloadTrigger={resetKey}
                />

                {/* Totals with GST summary */}
                <InvoiceSubtotal
                    subtotal={itemsCost.subTotal}
                    taxAmount={itemsCost.taxAmount}
                    total={itemsCost.total}
                    lineItems={itemData}
                    isInterState={isInterState}
                    isSubmitting={isSubmitting}
                />
            </form>

            {/* ── Invoice Success + Payment Popup ── */}
            {InvoiceShow && (
                <PopupView onClose={() => setInvoiceShow(false)}>
                    {/* ── Invoice Preview ── */}
                    <InvoiceView invoiceData={invoiceReceipt} sellerState={SELLER_STATE} />

                    <hr className="my-3" />

                    {/* ── Payment Section ── */}
                    {paymentDone ? (
                        <div className="alert alert-success d-flex align-items-center gap-2 mx-3 mb-3">
                            <i className="bi bi-check-circle-fill fs-5"></i>
                            <div>
                                <strong>Payment Recorded!</strong>{" "}
                                ₹{paymentForm.amountPaid.toFixed(2)} via {paymentForm.paymentMode}.
                            </div>
                        </div>
                    ) : !showPaymentPanel ? (
                        /* ─ Collapsed: just a prompt bar ─ */
                        <div className="d-flex justify-content-between align-items-center bg-light rounded px-3 py-2 mx-3 mb-3 border">
                            <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                                💳 Record payment for this invoice now?
                            </span>
                            <button
                                className="btn btn-success btn-sm"
                                onClick={() => setShowPaymentPanel(true)}
                            >
                                + Record Payment
                            </button>
                        </div>
                    ) : (
                        /* ─ Expanded payment form ─ */
                        <div className="px-3 pb-3">
                            <h6 className="fw-bold mb-3">
                                <i className="bi bi-credit-card me-2 text-success"></i>
                                Record Payment — {invoiceReceipt.customer.InvoiceNumber}
                            </h6>

                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">
                                        Amount Paid (₹) <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number" min={0} step="0.01"
                                        className={`form-control ${paymentError ? 'is-invalid' : ''}`}
                                        value={paymentForm.amountPaid}
                                        onChange={e => setPaymentForm(p => ({ ...p, amountPaid: Number(e.target.value) }))}
                                    />
                                    <small className="text-muted">
                                        Invoice total: ₹{invoiceReceipt.total.toFixed(2)}
                                    </small>
                                    {paymentError && (
                                        <div className="invalid-feedback d-block">{paymentError}</div>
                                    )}
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">Payment Mode</label>
                                    <select
                                        className="form-select"
                                        value={paymentForm.paymentMode}
                                        onChange={e => setPaymentForm(p => ({ ...p, paymentMode: e.target.value }))}
                                    >
                                        {PAYMENT_MODES.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">Reference / UTR No.</label>
                                    <input
                                        type="text" className="form-control"
                                        placeholder="Optional"
                                        value={paymentForm.referenceNumber}
                                        onChange={e => setPaymentForm(p => ({ ...p, referenceNumber: e.target.value }))}
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label fw-semibold">Remarks</label>
                                    <input
                                        type="text" className="form-control"
                                        placeholder="Optional note"
                                        value={paymentForm.remarks}
                                        onChange={e => setPaymentForm(p => ({ ...p, remarks: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="d-flex gap-2 mt-3">
                                <button
                                    className="btn btn-success"
                                    onClick={handleRecordPayment}
                                    disabled={paymentSaving}
                                >
                                    {paymentSaving
                                        ? <><span className="spinner-border spinner-border-sm me-1" /> Saving…</>
                                        : <><i className="bi bi-check2 me-1" />Save Payment</>
                                    }
                                </button>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowPaymentPanel(false)}
                                    disabled={paymentSaving}
                                >
                                    Skip for Now
                                </button>
                            </div>
                        </div>
                    )}
                </PopupView>
            )}
        </div>
    );
};

export default CreateInvoicePage;