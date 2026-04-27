export interface InvoiceRecordList {
    id: number;
    invoiceNumber: string;
    customerName: string;
    invoiceDate: string;
    invoiceTotal: number;
    amountPaid: number;
    balanceDue: number;
    paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
}
