import { useEffect, useState } from "react";
import { type ProductModel } from "../MasterModels/ProductModel";
import { API_SERVICE } from "../../../Service/API/API_Service";

interface ApiTax {
    taxId: string | number;
    taxName: string;
    taxRate: number;
}

interface ApiProduct {
    productId: string | number;
    sku: string;
    name: string;
    description: string;
    discount: number;
    purchasePrice: number;
    sellingPrice: number;
    categoryId: string | number;
    stockQuantity: number;
    lowStockThreshold: number;
    isActive: boolean;
    taxes: ApiTax[];
}

const useProductLogics = () => {
    const [productModel, setProductModel] = useState<ProductModel>();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [ProductList, setProductList] = useState<ProductModel[]>([]);
    const [popupMessage, setPopupMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchProducts();

        return () => {
        }
    }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await API_SERVICE.get('/products-api/product/GetAllProducts');
            if (response.status === 200) {
                const productData: ProductModel[] = response.data.result.map((prod: ApiProduct) => ({
                    productId: prod.productId as number,
                    sku: prod.sku,
                    name: prod.name,
                    description: prod.description,
                    discount: prod.discount,
                    price: prod.purchasePrice,
                    sellPrice: prod.sellingPrice,
                    categoryId: prod.categoryId as number,
                    stockQuantity: prod.stockQuantity,
                    lowStockThreshold: prod.lowStockThreshold,
                    isActive: prod.isActive,
                    taxes: prod.taxes.map((tax: ApiTax) => ({
                        id: tax.taxId,
                        name: tax.taxName,
                        rate: tax.taxRate
                    }))
                }));
                setProductList(productData);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const closePopup = ()=>{
        fetchProducts();
        setIsEditing(false);
        setPopupMessage("");
    }

    const editProduct = (product: ProductModel) => {
        setProductModel(() => ({ ...product } as ProductModel));
        setIsEditing(true);
    }

    const activateOrDeactivateProduct = async (product: ProductModel) => {
        console.log("Activate or Deactivate Product:", product);
    }

    return {
        productModel,
        ProductList,
        isEditing,
        popupMessage,
        closePopup,
        editProduct,
        activateOrDeactivateProduct,
        isLoading
    };
}

export default useProductLogics;