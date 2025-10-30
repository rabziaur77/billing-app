export interface Products {
    productId: number;
    tenantId: string;
    name: string;
    description: string;
    price: number;
    categoryId: number;
    sku: string;
    stockQuantity: number;
    isActive: boolean;
}