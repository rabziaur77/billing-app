export interface ProductModel {
    productId: number;
    name: string;
    description: string;
    price: number;
    discount: number;
    sku: string;
    categoryId: number;
    stockQuantity: number;
    isActive: boolean;
}