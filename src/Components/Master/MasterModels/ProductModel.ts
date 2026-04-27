import type { Tax } from "../../invoices/InvoiceModel/Models";

export interface ProductModel {
    productId: number;
    name: string;
    description: string;
    price: number;
    sellPrice: number;
    discount: number;
    sku: string;
    categoryId: number;
    stockQuantity: number;
    lowStockThreshold: number;
    isActive: boolean;
    taxes: Tax[];
    /** HSN (goods) or SAC (services) code for GST compliance */
    hsnCode?: string;
}