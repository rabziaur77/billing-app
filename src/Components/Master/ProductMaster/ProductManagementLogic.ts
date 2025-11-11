import React, { useEffect, useState } from "react";
import type { ProductModel } from "../MasterModels/ProductModel";
import type { Categories } from "../MasterModels/CategoryModel";
import { API_SERVICE } from "../../../Service/API/API_Service";

const useProductLogic = (product: ProductModel) => {
    const [productModel, setProductModel] = useState<ProductModel>();
    const [categoryList, setCategoryList] = useState<Categories[]>([]);

    useEffect(()=>{
        if(product){
            setProductModel(product);
        }
        fetchCategories();
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


    const submitProductForm = (e: React.FormEvent) => {
        e.preventDefault();
        // Implement product form submission logic here
    }

    const changeEvent = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setProductModel(prev=>({...prev, [name]: value} as ProductModel));
    }

    return { 
        submitProductForm,
        productModel,
        changeEvent,
        categoryList
    };
}

export default useProductLogic;
