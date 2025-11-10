import { useEffect, useState } from "react";
import { type Categories } from "../MasterModels/CategoryModel";
import { API_SERVICE } from "../../../Service/API/API_Service";

const useCategoryLogics = () => {
    const [categoryModel, setCategoryModel] = useState<Categories>();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [categories, setCategories] = useState<Categories[]>([]);
    const [popupVisible, setPopupVisible] = useState<boolean>(false);
    const [popupMessage, setPopupMessage] = useState<string>("");

    useEffect(() => {
        fetchCategories();

        return () => {
        }
    }, []);

    const editCategory = (category: Categories) => {
        setCategoryModel(category);
        setIsEditing(true);
    }

    const cancelEdit = () => {
        setCategoryModel(undefined);
        setIsEditing(false);
    }

    const activateOrDeactivateCategory = async (category: Categories) => {
        category.isActive = !category.isActive;
        await updateExistingCategory(category);
    }

    const submitCategoryForm= async(e:any)=>{
        e.preventDefault();

        if(isEditing && categoryModel){
            await updateExistingCategory(categoryModel);
        }
        else{
            await addNewCategory(categoryModel!);
        }
    }

    const addNewCategory = async (category: Categories) => {
        const response = await API_SERVICE.post('/products-api/product/AddNewCategory', {
            Name: category.name,
            Description: category.description,
            IsActive: category.isActive
        });

        popupMessageHandler(response, "Category added successfully.", "Failed to add category.");

        fetchCategories();
    }

    const updateExistingCategory = async (category: Categories) => {
        const response = await API_SERVICE.put(`/products-api/product/UpdateCategory/${category.categoryId}`, {
            IsActive: !category.isActive,
            Name: category.name,
            Description: category.description
        });
        
        popupMessageHandler(response, "Category updated successfully.", "Failed to update category.");

        fetchCategories();
        setIsEditing(false);
    }

    const popupMessageHandler = (response: any, successMessage: string, failedMessage: string) => {
        setPopupVisible(true);
        if (response.status === 200) {
            setPopupMessage(successMessage);
        } else {
            setPopupMessage(response.data.message || failedMessage);
        }
    }

    const fetchCategories = async () => {
        const response = await API_SERVICE.get('/products-api/product/GetAllCategory');
        if (response.status === 200) {
            const categoryData: Categories[] = response.data.result.map((cat: any) => ({
                categoryId: cat.categoryId,
                name: cat.name,
                description: cat.description,
                isActive: cat.isActive,
            }));
            setCategories(categoryData);
        }
    };

    const closePopup = ()=>{
        setPopupVisible(false);
        setPopupMessage("");
    }

    const changeEvent=(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)=>{
        const { name, value } = event.target;
        
        if(name === "isActive"){
            const boolValue = value === "true";
            setCategoryModel(prev=>({...prev, [name]: boolValue} as Categories));
        }
        else{
            setCategoryModel(prev=>({...prev, [name]: value} as Categories));
        }
        console.log(categoryModel);

    }   

    return {
        categories,
        editCategory,
        activateOrDeactivateCategory,
        popupVisible,
        popupMessage,
        closePopup,
        categoryModel,
        submitCategoryForm,
        changeEvent,
        cancelEdit,
        isEditing
    };
}

export default useCategoryLogics;