

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
    discount?: number; // Optional field for discount
    amount: number;
    grossAmount: number;
    taxList: Tax[];
}

export interface CustomerInvoice {
    Name: string;
    InvoiceDate: string;
    DueDate: string;
    InvoiceNumber: string;
}

export interface InvoiceReceipt {
    customer: CustomerInvoice;
    subtotal: number;
    tax: number;
    total: number;
    invoiceList: LineItem[];
}

export interface InvoiceModel {
    id: number;
    invoiceNumber: string;
    customerName: string;
    invoiceDate: string;
}

export interface InvoiceInfo {
    invoiceID: number;
    description: string;
    quantity: number;
    rate: number;
    discount: number;
    amount: number;
}
