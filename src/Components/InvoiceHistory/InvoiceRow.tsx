import React from "react";
import BlurLoader from "../CommonComp/BlurLoader";
import type { InvoiceRecordList } from "../invoices/InvoiceModel/InvoiceRecordList";

interface InvoiceRowProps {
    invoices: InvoiceRecordList[];
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
    onRecordPayment?: (invoiceNumber: string) => void;
}

const paymentStatusBadge = (status?: 'Paid' | 'Partial' | 'Unpaid') => {
    if (!status) return null;
    const map = {
        Paid: 'bg-success',
        Partial: 'bg-warning text-dark',
        Unpaid: 'bg-danger',
    };
    return <span className={`badge ${map[status]} ms-1`}>{status}</span>;
};

const InvoiceRow = ({
    invoices, GetInvoiceHistory, InvoiceSelected, invoiceInfo,
    closeInfo, childLoading, invoiceDetails, onRecordPayment,
}: InvoiceRowProps) => {
    return (
        <>
            {invoices.map((invoice, index) => (
                <React.Fragment key={invoice.id}>
                    <tr className="pointer">
                        <td>{index + 1}</td>
                        <td
                            onClick={() => GetInvoiceHistory(invoice.invoiceNumber)}
                            style={{ textDecoration: 'underline', color: '#4949ff', cursor: 'pointer' }}
                        >
                            {invoice.invoiceNumber}
                        </td>
                        <td>{invoice.customerName}</td>
                        <td>{invoice.invoiceDate}</td>
                        <td className="text-end">
                            {invoice.invoiceTotal !== undefined ? `₹${invoice.invoiceTotal}` : '—'}
                        </td>
                        <td className="text-end">
                            {invoice.balanceDue !== undefined ? `₹${invoice.balanceDue}` : '—'}
                        </td>
                        <td>
                            {paymentStatusBadge(invoice.paymentStatus)}
                        </td>
                        <td>
                            <div className="d-flex gap-1">
                                <button
                                    onClick={() => invoiceDetails(invoice.invoiceNumber)}
                                    className="btn btn-sm btn-outline-primary"
                                    title="View Receipt"
                                >
                                    🧾 Receipt
                                </button>
                                {onRecordPayment && invoice.paymentStatus !== 'Paid' && (
                                    <button
                                        onClick={() => onRecordPayment(invoice.invoiceNumber)}
                                        className="btn btn-sm btn-outline-success"
                                        title="Record Payment"
                                    >
                                        💳 Pay
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>

                    {/* Expandable detail row */}
                    {InvoiceSelected === invoice.invoiceNumber && (
                        <tr>
                            <td colSpan={8}>
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
                                                        <div style={{ position: 'absolute', right: 0, top: 0 }}>
                                                            <button onClick={closeInfo} className="btn btn-sm btn-danger">×</button>
                                                        </div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoiceInfo.length === 0 && !childLoading ? (
                                                    <tr><td colSpan={6} className="text-center">No Details Found</td></tr>
                                                ) : (
                                                    invoiceInfo.map((info, i) => (
                                                        <tr key={i}>
                                                            <td>{info.invoiceID}</td>
                                                            <td>{info.description}</td>
                                                            <td>{info.quantity}</td>
                                                            <td>₹{info.rate}</td>
                                                            <td>{info.discount}</td>
                                                            <td>₹{info.amount}</td>
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
            ))}
        </>
    );
};

export default InvoiceRow;