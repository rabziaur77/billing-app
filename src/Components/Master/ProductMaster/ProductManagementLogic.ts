import React, { useEffect, useState } from "react";
import type { ProductModel } from "../MasterModels/ProductModel";
import type { Categories } from "../MasterModels/CategoryModel";

const useProductLogic = (product: ProductModel) => {
    const [productModel, setProductModel] = useState<ProductModel>();
    const [categoryList, setCategoryList] = useState<Categories[]>([]);

    useEffect(()=>{
        setProductModel(product);
        console.log(product);
    },[])    

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
