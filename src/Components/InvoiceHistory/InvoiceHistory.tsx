import React, { useState } from "react";
import useInvoiceHistoryLogic from "./InvoiceHistoryLogic";
import InvoiceRow from "./InvoiceRow";
import PopupView from "../CommonComp/PopupView";
import InvoiceView from "../invoices/InvoiceDownload/InvoiceView";
import BlurLoader from "../CommonComp/BlurLoader";
import Payments from "../Payments/Payments";

// Seller state – should match what's set in Generate.tsx
const SELLER_STATE = "Maharashtra";

const InvoiceHistory: React.FC = () => {
    const {
        invoices, InvoiceSelected,
        GetInvoiceHistory, invoiceInfo, closeInfo,
        loading, childLoading, InvoiceDetails, invoiceReceipt,
        isInvoiceShow, setIsInvoiceShow, receiptLoading,
    } = useInvoiceHistoryLogic();

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentInvoice, setPaymentInvoice] = useState('');

    const handleRecordPayment = (invoiceNumber: string) => {
        setPaymentInvoice(invoiceNumber);
        setShowPaymentModal(true);
    };

    return (
        <div className="container-fluid py-4 px-4">
            <h1 className="mb-4">Invoice History</h1>
            <div className="card">
                <div className="card-body p-0">
                    <BlurLoader isLoading={loading} minHeight="300px" loadingText="Loading Invoice History...">
                        <div className="table-responsive">
                            <table className="table table-striped mb-0">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Sr No.</th>
                                        <th>Invoice Number</th>
                                        <th>Customer Name</th>
                                        <th>Invoice Date</th>
                                        <th className="text-end">Total</th>
                                        <th className="text-end">Total Due</th>
                                        <th>Payment Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.length === 0 && !loading ? (
                                        <tr>
                                            <td colSpan={8} className="text-center py-4">No Invoices Found</td>
                                        </tr>
                                    ) : (
                                        <InvoiceRow
                                            invoices={invoices}
                                            GetInvoiceHistory={GetInvoiceHistory}
                                            InvoiceSelected={InvoiceSelected}
                                            invoiceInfo={invoiceInfo}
                                            closeInfo={closeInfo}
                                            childLoading={childLoading}
                                            invoiceDetails={InvoiceDetails}
                                            onRecordPayment={handleRecordPayment}
                                        />
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </BlurLoader>
                </div>
            </div>

            {/* Receipt popup */}
            {isInvoiceShow && (
                <PopupView onClose={() => setIsInvoiceShow(false)}>
                    <BlurLoader isLoading={receiptLoading} minHeight="400px" loadingText="Generating Receipt...">
                        <InvoiceView invoiceData={invoiceReceipt} sellerState={SELLER_STATE} />
                    </BlurLoader>
                </PopupView>
            )}

            {/* Quick Record Payment modal from history row */}
            {showPaymentModal && (
                <PopupView onClose={() => setShowPaymentModal(false)}>
                    <div className="p-3">
                        <h5 className="mb-3">Record Payment — {paymentInvoice}</h5>
                        <Payments initialInvoiceNumber={paymentInvoice} />
                    </div>
                </PopupView>
            )}
        </div>
    );
};

export default InvoiceHistory;
