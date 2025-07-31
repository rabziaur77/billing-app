import React from "react";
import useInvoiceHistoryLogic from "./InvoiceHistoryLogic";
import InvoiceRow from "./InvoiceRow";
import PopupView from "../CommonComp/PopupView";
import InvoiceView from "../invoices/InvoiceDownload/InvoiceView";

const InvoiceHistory: React.FC = () => {
    const { invoices, InvoiceSelected, 
        GetInvoiceHistory, invoiceInfo, closeInfo, 
        loading, childLoading, InvoiceDetails, invoiceReceipt,
         isInvoiceShow, setIsInvoiceShow } = useInvoiceHistoryLogic();

    return (
        <div>
            <h1>Invoice History</h1>
            <table className="table table-striped">
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
                    {
                        loading ? (
                            <tr>
                                <td colSpan={4} className="text-center">Loading...</td>
                            </tr>
                        ) : invoices.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center">No Invoices Found</td>
                            </tr>
                        ) :
                            <InvoiceRow
                                invoices={invoices}
                                GetInvoiceHistory={GetInvoiceHistory}
                                InvoiceSelected={InvoiceSelected}
                                invoiceInfo={invoiceInfo}
                                closeInfo={closeInfo}
                                childLoading={childLoading}
                                invoiceDetails={InvoiceDetails}
                            />
                    }
                </tbody>
            </table>
            {isInvoiceShow && (
                <PopupView onClose={() => setIsInvoiceShow(false)}>
                    <InvoiceView invoiceData={invoiceReceipt} />
                </PopupView>
            )}
        </div>
    );
};

export default InvoiceHistory;
