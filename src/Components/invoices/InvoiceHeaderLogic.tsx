import { useState, type ChangeEvent } from "react";

const generateInvoiceNumber = () => {
    return "INV-" + Math.floor(100000 + Math.random() * 900000);
};

const useInvoiceHeader = () => {
    const [customer, setCustomer] = useState({ Name: "", InvoiceDate:"", DueDate:"" });
    const [invoiceNumber] = useState(generateInvoiceNumber());


    const handleInputChange = (e: ChangeEvent<HTMLInputElement>)=>{
        const {name,value} = e.target;
        setCustomer((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    return {
        customer,
        handleInputChange,
        invoiceNumber,
    }
};

export default useInvoiceHeader;