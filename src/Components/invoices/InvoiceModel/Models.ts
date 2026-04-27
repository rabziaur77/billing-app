
export interface Tax {
    id: number;
    name: string;
    rate: number;
}

export interface LineItem {
    productId: number;
    productName: string;
    quantity: number;
    rate: number;
    discount?: number;
    amount: number;
    grossAmount: number;
    taxList: Tax[];
    /** GST fields (computed from taxList) */
    hsnCode?: string;
    cgst?: number;
    sgst?: number;
    igst?: number;
}

export interface CustomerInvoice {
    Name: string;
    InvoiceDate: string;
    DueDate: string;
    InvoiceNumber: string;
    CustomerMobile: string;
    /** GST / address fields */
    CustomerGSTIN?: string;
    PlaceOfSupply?: string;
    InvoiceType?: 'B2B' | 'B2C';
    /** Customer master reference */
    CustomerId?: number;
}

export interface GstSummary {
    taxName: string;
    taxRate: number;
    taxableAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
}

export interface InvoiceReceipt {
    customer: CustomerInvoice;
    subtotal: number;
    tax: number;
    total: number;
    invoiceList: LineItem[];
    gstSummary?: GstSummary[];
    /** Payment status fields (populated when viewing from history) */
    totalPaid?: number;
    balanceDue?: number;
    paymentStatus?: 'Paid' | 'Partial' | 'Unpaid';
}

export interface InvoiceModel {
    id: number;
    invoiceNumber: string;
    customerName: string;
    invoiceDate: string;
    total?: number;
    paymentStatus?: 'Paid' | 'Partial' | 'Unpaid';
}

export interface InvoiceInfo {
    invoiceID: number;
    description: string;
    quantity: number;
    rate: number;
    discount: number;
    amount: number;
}
