import React, { useEffect, useState } from "react";
import type { ProductModel } from "../MasterModels/ProductModel";
import type { Categories } from "../MasterModels/CategoryModel";
import { API_SERVICE } from "../../../Service/API/API_Service";
import type { Tax } from "../../invoices/InvoiceModel/Models";

const useProductLogic = (product: ProductModel) => {
    const [TaxList, setTaxList] = useState<Tax[]>([]);
    const [selectedTax, setSelectedTax] = useState<Tax[]>([]);
    const [isMessageShow, setIsMessageShow] = useState<boolean>(false);
    const [popupMessage, setPopupMessage] = useState<string>("");
    const [productModel, setProductModel] = useState<ProductModel>();
    const [categoryList, setCategoryList] = useState<Categories[]>([]);
    const [buttonName, setButtonName] = useState<string>("Save Product");

    useEffect(()=>{
        if(product){
            setProductModel(product);
            setSelectedTax(product.taxes);
            setButtonName("Update Product");
        }
        else{
            setProductModel(prev=>({...prev, isActive:true} as ProductModel));
            setButtonName("Save Product");
        }
        fetchCategories();
        loadTaxList();
    },[])    

    const fetchCategories = async () => {
        const response = await API_SERVICE.get('/products-api/product/GetAllCategory');
        if (response.status === 200) {
            const categoryData: Categories[] = response.data.result.map((cat: any) => ({
                categoryId: cat.categoryId,
                name: cat.name,
                description: cat.description,
                isActive: cat.isActive,
            }));
            setCategoryList(categoryData);
        }
    };

    const loadTaxList = async () => {
        try {
            const response = await API_SERVICE.get('products-api/Tax/GetTaxes');

            if (response.status === 200) {
                const taxList: Tax[] = response.data.result.map((tax: any) => ({
                    id: tax.taxId,
                    name: tax.taxName,
                    rate: tax.taxRate
                }));
                
                setTaxList(taxList);
            }
        } catch (error) {
            console.error("Error loading tax list:", error);
        }
    };

    const submitProductForm = (e: React.FormEvent) => {
        e.preventDefault();

        const url = buttonName === "Update Product"
            ? '/products-api/product/UpdateProduct/'+ productModel?.productId
            : '/products-api/product/AddNewProduct';

        if(buttonName === "Update Product"){
            API_SERVICE.put(url, buildAddProductPayload())
            .then(response => {
                if (response.status === 200) {
                    //alert("Product updated successfully!");
                    setPopupMessage("Product updated successfully!");
                    setIsMessageShow(true);
                    // Optionally reset the form or redirect
                }
            })
            .catch(error => {
                console.error("Error saving product:", error);
                alert("Failed to save product. Please try again.");
            });
        }
        else{
            API_SERVICE.post(url, buildAddProductPayload())
                .then(response => {
                    if (response.status === 200) {
                        alert("Product saved successfully!");
                        // Optionally reset the form or redirect
                    }
                })
                .catch(error => {
                    console.error("Error saving product:", error);
                    alert("Failed to save product. Please try again.");
                });
        }
    }

    const closePopup= ()=>{
        setIsMessageShow(false);
    }

    const buildAddProductPayload = () => {
        return {
            sku: productModel?.sku,
            name: productModel?.name,
            purchasePrice: productModel?.price,
            sellPrice: productModel?.sellPrice,
            categoryId: productModel?.categoryId,
            description: productModel?.description,
            discount: productModel?.discount,
            isActive: productModel?.isActive,
            stockQuantity: productModel?.stockQuantity,
            taxes: selectedTax.map(tax => ({
                taxId: tax.id,
                rate: tax.rate
            }))
        };
    };



    const changeEvent = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target;
        const { name, type } = target;

        const value = type === "checkbox"
                        ? (target as HTMLInputElement).checked
                        : target.value;

        setProductModel(prev=>({...prev, [name]: value} as ProductModel));
    }

    const selectedTaxList = (selectedOptions: any) => {
        console.log("Selected Options:", selectedOptions);
        const selectedIds = selectedOptions.map((opt: any) => opt.value);

        const selectedTaxes = TaxList.filter(tax =>
            selectedIds.includes(tax.id)
        );
        setSelectedTax(selectedTaxes);
    };

    return { 
        submitProductForm,
        productModel,
        changeEvent,
        categoryList,
        TaxList,
        selectedTax,
        selectedTaxList,
        buttonName,
        isMessageShow,
        closePopup,
        popupMessage
    };
}

export default useProductLogic;
