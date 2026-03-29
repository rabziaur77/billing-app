import React from "react";
import useInvoiceHistoryLogic from "./InvoiceHistoryLogic";
import InvoiceRow from "./InvoiceRow";
import PopupView from "../CommonComp/PopupView";
import InvoiceView from "../invoices/InvoiceDownload/InvoiceView";
import BlurLoader from "../CommonComp/BlurLoader";

const InvoiceHistory: React.FC = () => {
    const { invoices, InvoiceSelected, 
        GetInvoiceHistory, invoiceInfo, closeInfo, 
        loading, childLoading, InvoiceDetails, invoiceReceipt,
         isInvoiceShow, setIsInvoiceShow, receiptLoading } = useInvoiceHistoryLogic();

    return (
        <div className="container py-4">
            <h1 className="mb-4">Invoice History</h1>
            <div className="card">
                <div className="card-body p-0">
                    <BlurLoader isLoading={loading} minHeight="300px" loadingText="Loading Invoice History...">
                        <table className="table table-striped mb-0">
                            <thead>
                                <tr>
                                    <th>Sr No.</th>
                                    <th>Invoice Number</th>
                                    <th>Customer Name</th>
                                    <th>Invoice Date</th>
                                    <th>Invoice Receipt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.length === 0 && !loading ? (
                                    <tr>
                                        <td colSpan={5} className="text-center">No Invoices Found</td>
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
                                    />
                                )}
                            </tbody>
                        </table>
                    </BlurLoader>
                </div>
            </div>
            {isInvoiceShow && (
                <PopupView onClose={() => setIsInvoiceShow(false)}>
                    <BlurLoader isLoading={receiptLoading} minHeight="400px" loadingText="Generating Receipt...">
                        <InvoiceView invoiceData={invoiceReceipt} />
                    </BlurLoader>
                </PopupView>
            )}
        </div>
    );
};

export default InvoiceHistory;
