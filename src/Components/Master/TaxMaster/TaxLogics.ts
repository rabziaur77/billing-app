import { useEffect, useState } from "react";
import { API_SERVICE } from "../../../Service/API/API_Service";
import type { Tax } from "../../invoices/InvoiceModel/Models";

const useTaxLogics = () => {
    const [taxModel, setTaxModel] = useState<Tax>();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [taxes, setTaxes] = useState<Tax[]>([]);
    const [popupVisible, setPopupVisible] = useState<boolean>(false);
    const [popupMessage, setPopupMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isBulkLoading, setIsBulkLoading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    useEffect(() => {
        fetchTaxes();

        return () => {
        }
    }, []);

    const editTax = (tax: Tax) => {
        setTaxModel(tax);
        setIsEditing(true);
    }

    const cancelEdit = () => {
        setTaxModel(undefined);
        setIsEditing(false);
    }

    const submitTaxForm= async(e: React.FormEvent)=>{
        e.preventDefault();

        if(isEditing && taxModel){
            await updateExistingTax(taxModel);
        }
        else{
            await addNewTax(taxModel!);
        }
    }

    const addNewTax = async (tax: Tax) => {
        const response = await API_SERVICE.post('/products-api/tax/AddTax', {
            Name: tax.name,
            Rate: tax.rate
        });

        popupMessageHandler(response, "Tax added successfully.", "Failed to add tax.");

        fetchTaxes();
        cleanTaxModel();
    }

    const updateExistingTax = async (tax: Tax) => {
        const response = await API_SERVICE.put(`/products-api/tax/UpdateTax/${tax.id}`, {
            TaxName: tax.name,
            TaxRate: tax.rate
        });
        
        popupMessageHandler(response, "Tax updated successfully.", "Failed to update tax.");

        fetchTaxes();
        setIsEditing(false);
        cleanTaxModel();
    }

    const popupMessageHandler = (response: { status: number, data: { message?: string } }, successMessage: string, failedMessage: string) => {
        setPopupVisible(true);
        if (response.status === 200) {
            setPopupMessage(successMessage);
        } else {
            setPopupMessage(response.data.message || failedMessage);
        }
    }

    const cleanTaxModel = () => {
        setTaxModel({
            id: 0,
            name: "",
            rate: 0
        });
    }

    const fetchTaxes = async () => {
        setIsLoading(true);
        try {
            const response = await API_SERVICE.get('/products-api/tax/GetTaxes');
            if (response.status === 200) {
                const taxData: Tax[] = response.data.result
                .map((tx: { taxId: string | number, taxName: string, taxRate: number }) => ({
                    id: tx.taxId,
                    name: tx.taxName,
                    rate: tx.taxRate,
                }));
                setTaxes(taxData);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const closePopup = ()=>{
        setPopupVisible(false);
        setPopupMessage("");
    }

    // handle input changes for tax form
    const changeEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setTaxModel(prev => ({
            ...(prev as Tax),
            [name]: name === 'rate' ? parseFloat(value) : value
        } as Tax));
    };

    const onBulkUploadTaxes = async (_data: any[], file: File) => {
        setIsBulkLoading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await API_SERVICE.post('/products-api/tax/BulkUploadTax', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setUploadProgress(percentCompleted);
                }
            });

            if (response.status === 200) {
                setPopupMessage(response.data.message || "Taxes uploaded successfully.");
            } else {
                setPopupMessage("Failed to upload taxes.");
            }
        } catch (error: any) {
            console.error("Error uploading taxes:", error);
            setPopupMessage(error.response?.data?.message || "Error uploading taxes.");
        } finally {
            setPopupVisible(true);
            setIsBulkLoading(false);
            setUploadProgress(0);
            fetchTaxes();
        }
    };

    return {
        taxes,
        editTax,
        popupVisible,
        popupMessage,
        closePopup,
        taxModel,
        submitTaxForm,
        cancelEdit,
        isEditing,
        changeEvent,
        isLoading,
        onBulkUploadTaxes,
        isBulkLoading,
        uploadProgress
    };
}

export default useTaxLogics;