import { useEffect, useState, type ChangeEvent } from "react";
import type { CustomerInvoice } from "../../InvoiceModel/Models";
import { API_SERVICE } from "../../../../Service/API/API_Service";

interface Prop {
    SetCustomer: (customer: CustomerInvoice) => void;
    IsNewInvoice: boolean;
}

const useInvoiceHeader = ({ SetCustomer, IsNewInvoice }: Prop) => {
    const today = new Date().toISOString().split('T')[0];
    const [customer, setCustomer] = useState<CustomerInvoice>({ Name: "", InvoiceDate: today, DueDate: today, InvoiceNumber: '' });

    useEffect(() => {
        GenerateInvoiceNumber();
        if (!IsNewInvoice) {
            setCustomer(
                prev => ({
                    ...prev,
                    Name: ''
                })
            );
        }
    }, [IsNewInvoice]);

    const GenerateInvoiceNumber = () => {
        API_SERVICE.get('invoice-api/Invoice/create-invoice')
            .then(response => {
                setCustomer(prev => ({
                    ...prev,
                    InvoiceNumber: response.data.response,
                }));
            })
            .catch(error => {
                console.error("Error generating invoice number:", error);
            });
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCustomer((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (SetCustomer) {
            SetCustomer({
                ...customer,
                [name]: value,
            });
        }
    }

    return {
        customer,
        handleInputChange,
    }
};

export default useInvoiceHeader;