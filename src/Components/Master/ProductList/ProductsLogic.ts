import { useEffect, useState } from "react";
import { type ProductModel } from "../MasterModels/ProductModel";
import { API_SERVICE } from "../../../Service/API/API_Service";

const useProductLogics = () => {
    const [productModel, setProductModel] = useState<ProductModel>();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [ProductList, setProductList] = useState<ProductModel[]>([]);
    // const [popupVisible, setPopupVisible] = useState<boolean>(false);
    const [popupMessage, setPopupMessage] = useState<string>("");

    useEffect(() => {
        fetchProducts();

        return () => {
        }
    }, []);
    // const popupMessageHandler = (response: any, successMessage: string, failedMessage: string) => {
    //     setPopupVisible(true);
    //     if (response.status === 200) {
    //         setPopupMessage(successMessage);
    //     } else {
    //         setPopupMessage(response.data.message || failedMessage);
    //     }
    // }

    const fetchProducts = async () => {
        const response = await API_SERVICE.get('/products-api/product/GetAllProducts');
        if (response.status === 200) {
            const productData: ProductModel[] = response.data.result.map((prod: any) => ({
                productId: prod.productId,
                sku: prod.sku,
                name: prod.name,
                description: prod.description,
                discount: prod.discount,
                price: prod.purchasePrice,
                sellPrice: prod.sellingPrice,
                categoryId: prod.categoryId,
                stockQuantity: prod.stockQuantity,
                isActive: prod.isActive,
                taxes: prod.taxes.map((tax: any) => ({
                    id: tax.taxId,
                    name: tax.taxName,
                    rate: tax.taxRate
                }))
            }));
            setProductList(productData);
        }
    };

    const closePopup = ()=>{
        fetchProducts();
        setIsEditing(false);
        setPopupMessage("");
    }

    // const changeEvent=(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)=>{
    //     const { name, value } = event.target;
        
    //     if(name === "isActive"){
    //         const boolValue = value === "true";
    //         setProductModel(prev=>({...prev, [name]: boolValue} as ProductModel));
    //     }
    //     else{
    //         setProductModel(prev=>({...prev, [name]: value} as ProductModel));
    //     }
    //     console.log(productModel);

    // }   

    const editProduct = (product: ProductModel) => {
        console.log("Edit Product:", product);
        setProductModel(() => ({ ...product } as ProductModel));
        setIsEditing(true);
    }

    const activateOrDeactivateProduct = async (product: ProductModel) => {
        console.log("Activate or Deactivate Product:", product);
        // const updatedProduct = { ...product, isActive: !product.isActive };
        // const response = await API_SERVICE.put('/products-api/product/UpdateProduct', updatedProduct);
        // popupMessageHandler(response, `Product ${updatedProduct.isActive ? "activated" : "deactivated"} successfully.`, `Failed to ${updatedProduct.isActive ? "activate" : "deactivate"} product.`);
        // fetchProducts();
    }

    return {
        productModel,
        ProductList,
        isEditing,
        popupMessage,
        closePopup,
        editProduct,
        activateOrDeactivateProduct
    };
}

export default useProductLogics;