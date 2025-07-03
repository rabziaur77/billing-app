

export interface Tax {
    name: string;
    rate: number;
}

export interface LineItem {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
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