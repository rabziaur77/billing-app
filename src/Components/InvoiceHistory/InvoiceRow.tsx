import React from "react";
import type { InvoiceModel } from "../invoices/InvoiceModel/Models";
import BlurLoader from "../CommonComp/BlurLoader";

interface InvoiceRowProps {
    invoices: InvoiceModel[];
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
                                style={{ textDecoration: 'underline', color: '#4949ff' }}>{invoice.invoiceNumber}</td>
                            <td>{invoice.customerName}</td>
                            <td>{invoice.invoiceDate}</td>
                            <td><button onClick={() => invoiceDetails(invoice.invoiceNumber)} className="btn btn-sm btn-outline-primary">View Receipt</button></td>
                        </tr>
                        {InvoiceSelected === invoice.invoiceNumber && (
                            <tr>
                                <td colSpan={5}>
                                    <div className="p-3 bg-light">
                                        <BlurLoader isLoading={childLoading} minHeight="100px" loadingText="Loading Details...">
                                            <table className="table table-sm table-bordered bg-white mb-0">
                                                <thead className="table-dark">
                                                    <tr>
                                                        <th>Invoice ID</th>
                                                        <th>Description</th>
                                                        <th>Quantity</th>
                                                        <th>Rate</th>
                                                        <th>Discount</th>
                                                        <th style={{ position: 'relative' }}>
                                                            Amount
                                                            <div style={{ position: 'absolute', right: '0', top: '0' }}>
                                                                <button onClick={closeInfo} className="btn btn-sm btn-danger">x</button>
                                                            </div>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {invoiceInfo.length === 0 && !childLoading ? (
                                                        <tr>
                                                            <td colSpan={6} className="text-center">No Details Found</td>
                                                        </tr>
                                                    ) : (
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
                                                    )}
                                                </tbody>
                                            </table>
                                        </BlurLoader>
                                    </div>
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