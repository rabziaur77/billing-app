export interface Products {
    productId: number;
    tenantId: string;
    name: string;
    description: string;
    purchasePrice: number;
    sellingPrice: number;
    discount: number;
    categoryId: number;
    sku: string;
    stockQuantity: number;
    lowStockThreshold: number;
    isActive: boolean;
    taxes: ProductTax[];
    hsnCode?: string;
}

export interface ProductTax {
    id: number;
    productId: number;
    taxId: number;
    taxName: string;
    taxRate: number;
}