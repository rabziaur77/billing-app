import { useEffect, useState } from "react";
import { API_SERVICE } from "../../../Service/API/API_Service";
import type { Tax } from "../../invoices/InvoiceModel/Models";

const useTaxLogics = () => {
    const [taxModel, setTaxModel] = useState<Tax>();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [taxes, setTaxes] = useState<Tax[]>([]);
    const [popupVisible, setPopupVisible] = useState<boolean>(false);
    const [popupMessage, setPopupMessage] = useState<string>("");

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

    const submitTaxForm= async(e:any)=>{
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

    const popupMessageHandler = (response: any, successMessage: string, failedMessage: string) => {
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
            rate: null as any
        });
    }

    const fetchTaxes = async () => {
        const response = await API_SERVICE.get('/products-api/tax/GetTaxes');
        if (response.status === 200) {
            const taxData: Tax[] = response.data.result
            .map((tx: any) => ({
                id: tx.taxId,
                name: tx.taxName,
                rate: tx.taxRate,
            }));
            setTaxes(taxData);
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
        changeEvent
    };
}

export default useTaxLogics;