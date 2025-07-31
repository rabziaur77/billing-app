import React from "react";

interface InvoiceRowProps {
    invoices: Array<{
        id: number;
        invoiceNumber: string;
        customerNameOrNumber: string;
        createdDate: string;
    }>;
    GetInvoiceHistory: (invoiceNumber: string) => void;
    InvoiceSelected: string | null;
    invoiceInfo: Array<{
        invoiceID: number;
        description: string;
        quantity: number;
        rate: number;
        discount: number;
        amount: number;
    }>;
    closeInfo: () => void;
    childLoading: boolean;
    invoiceDetails: (invoiceNumber: string) => void;
}

const InvoiceRow = ({ invoices, GetInvoiceHistory, InvoiceSelected, invoiceInfo, closeInfo, childLoading, invoiceDetails }: InvoiceRowProps) => {
    return (
        <>
            {
                invoices.map((invoice, index) => (
                    <React.Fragment key={invoice.id}>
                        <tr className="pointer">
                            <td>{index + 1}</td>
                            <td onClick={() => GetInvoiceHistory(invoice.invoiceNumber)}
                                style={{textDecoration: 'underline', color:'#4949ff'}}>{invoice.invoiceNumber}</td>
                            <td>{invoice.customerNameOrNumber}</td>
                            <td>{invoice.createdDate}</td>
                            <td><button onClick={() => invoiceDetails(invoice.invoiceNumber)}>View Receipt</button></td>
                        </tr>
                        {InvoiceSelected === invoice.invoiceNumber && (
                            <tr>
                                <td colSpan={5}>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Invoice ID</th>
                                                <th>Description</th>
                                                <th>Quantity</th>
                                                <th>Rate</th>
                                                <th>Discount</th>
                                                <th style={{ position: 'relative' }}>
                                                    Amount
                                                    <div className="amount-indicator">
                                                        <button onClick={closeInfo} className="btn btn-danger">x</button>
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                childLoading ? (
                                                    <tr>
                                                        <td colSpan={6} className="text-center">Loading...</td>
                                                    </tr>
                                                ) : invoices.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="text-center">No Invoices Found</td>
                                                    </tr>
                                                ) :
                                                    invoiceInfo.map((info, index) => (
                                                        <tr key={index}>
                                                            <td>{info.invoiceID}</td>
                                                            <td>{info.description}</td>
                                                            <td>{info.quantity}</td>
                                                            <td>{info.rate}</td>
                                                            <td>{info.discount}</td>
                                                            <td>{info.amount}</td>
                                                        </tr>
                                                    ))
                                            }
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))
            }
        </>
    )
}

export default InvoiceRow;