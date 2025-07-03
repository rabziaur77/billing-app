import { useState, type ChangeEvent } from "react";
import type { CustomerInvoice } from "../../InvoiceModel/Models";

const generateInvoiceNumber = () => {
    return "INV-" + Math.floor(100000 + Math.random() * 900000);
};

interface Prop {
    SetCustomer: (customer: CustomerInvoice) => void;
}

const useInvoiceHeader = ({SetCustomer}: Prop) => {
    const today = new Date().toISOString().split('T')[0];
    const [customer, setCustomer] = useState<CustomerInvoice>({ Name: "", InvoiceDate: today, DueDate: today, InvoiceNumber: generateInvoiceNumber() });

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>)=>{
        const {name,value} = e.target;
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