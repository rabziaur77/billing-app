export type PaymentMode = 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Card';

export interface Payment {
    paymentId: number;
    invoiceNumber: string;
    customerName: string;
    amountPaid: number;
    paymentMode: PaymentMode;
    paymentDate: string;
    referenceNumber?: string;
    remarks?: string;
    balanceDue: number;
    invoiceTotal: number;
}

export interface RecordPaymentRequest {
    invoiceNumber: string;
    amountPaid: number;
    paymentMode: PaymentMode;
    paymentDate: string;
    referenceNumber?: string;
    remarks?: string;
}
