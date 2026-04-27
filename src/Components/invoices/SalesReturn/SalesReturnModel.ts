// Models for Sales Return feature
export interface SalesReturn {
    id: number;
    tenantId: number;
    returnNumber: string;
    originalInvoiceNo: string;
    returnDate: string;
    reason?: string;
    totalRefund: number;
    createdBy: number;
    createdAt: string;
    items: SalesReturnItem[];
}

export interface SalesReturnItem {
    id: number;
    salesReturnId: number;
    productId: number;
    productName: string;
    hsnCode?: string;
    quantity: number;
    rate: number;
    refundAmount: number;
}

export interface CreateSalesReturnRequest {
    originalInvoiceNo: string;
    reason?: string;
    items: CreateSalesReturnItemRequest[];
}

export interface CreateSalesReturnItemRequest {
    productId: number;
    productName: string;
    hsnCode?: string;
    quantity: number;
    rate: number;
}
