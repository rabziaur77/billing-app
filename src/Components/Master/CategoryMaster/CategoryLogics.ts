import { useEffect, useState } from "react";
import { type Categories } from "../MasterModels/CategoryModel";
import { API_SERVICE } from "../../../Service/API/API_Service";

interface ApiCategoryResponse {
    categoryId: string | number;
    name: string;
    description: string;
    isActive: boolean;
}

const useCategoryLogics = () => {
    const [categoryModel, setCategoryModel] = useState<Categories>();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [categories, setCategories] = useState<Categories[]>([]);
    const [popupVisible, setPopupVisible] = useState<boolean>(false);
    const [popupMessage, setPopupMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isBulkLoading, setIsBulkLoading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

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

    const submitCategoryForm = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && categoryModel) {
            await updateExistingCategory(categoryModel);
        }
        else {
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
        setCategoryModel(undefined);
    }

    const updateExistingCategory = async (category: Categories) => {
        const response = await API_SERVICE.put(`/products-api/product/UpdateCategory/${category.categoryId}`, {
            IsActive: category.isActive,
            Name: category.name,
            Description: category.description
        });

        popupMessageHandler(response, "Category updated successfully.", "Failed to update category.");

        fetchCategories();
        setIsEditing(false);
        setCategoryModel(undefined);
    }

    const popupMessageHandler = (response: { status: number, data: { message?: string } }, successMessage: string, failedMessage: string) => {
        setPopupVisible(true);
        if (response.status === 200) {
            setPopupMessage(successMessage);
        } else {
            setPopupMessage(response.data.message || failedMessage);
        }
    }

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const response = await API_SERVICE.get('/products-api/product/GetAllCategory');
            if (response.status === 200) {
                const categoryData: Categories[] = response.data.result
                    .sort((a: ApiCategoryResponse, b: ApiCategoryResponse) => a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1)
                    .map((cat: ApiCategoryResponse) => ({
                        categoryId: cat.categoryId,
                        name: cat.name,
                        description: cat.description,
                        isActive: cat.isActive,
                    }));
                setCategories(categoryData);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const closePopup = () => {
        setPopupVisible(false);
        setPopupMessage("");
    }

    const changeEvent = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;

        if (name === "isActive") {
            const boolValue = value === "true";
            setCategoryModel(prev => ({ ...prev, [name]: boolValue } as Categories));
        }
        else {
            setCategoryModel(prev => ({ ...prev, [name]: value } as Categories));
        }
    }

    const onBulkUploadCategories = async (_data: any[], file: File) => {
        setIsBulkLoading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await API_SERVICE.post('/products-api/product/BulkUploadCategory', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setUploadProgress(percentCompleted);
                }
            });

            if (response.status === 200) {
                setPopupMessage(response.data.message || "Categories uploaded successfully.");
            } else {
                setPopupMessage("Failed to upload categories.");
            }
        } catch (error: any) {
            console.error("Error uploading categories:", error);
            setPopupMessage(error.response?.data?.message || "Error uploading categories.");
        } finally {
            setPopupVisible(true);
            setIsBulkLoading(false);
            setUploadProgress(0);
            fetchCategories();
        }
    };

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
        isEditing,
        isLoading,
        onBulkUploadCategories,
        isBulkLoading,
        uploadProgress
    };
}

export default useCategoryLogics;