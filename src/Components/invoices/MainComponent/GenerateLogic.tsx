import React, {useState} from "react";
import type { CustomerInvoice, LineItem, InvoiceReceipt } from "../InvoiceModel/Models";

/**
 * Custom hook to manage the logic for generating an invoice.
 * It handles the state for items cost, customer details, and item data.
 * It also provides methods to update these states and submit the form.
 */
const useGenerateInvoiceLogic = () => {
    const [itemsCost, setItemsCost] = useState({subTotal:Number(0), taxAmount:Number(0), total:Number(0)});
    const [customer, setCustomer] = useState<CustomerInvoice>({Name: "", InvoiceDate: "", DueDate: "", InvoiceNumber: ""});
    const [itemData , setItemData] = useState<LineItem[]>([]);
    const [InvoiceShow, setInvoiceShow] = useState<boolean>(false);
    const [invoiceReceipt, setInvoiceReceipt] = useState<InvoiceReceipt>({
        customer: { Name: "", InvoiceDate: "", DueDate: "", InvoiceNumber: "" },
        subtotal: 0,
        tax: 0,
        total: 0,
        invoiceList: []
    });

    const ItemsData =(item:any)=>{
        console.log("ItemsData", item);

        const subtotal = item.reduce((acc:any, curr:any) => acc + curr.amount, 0);
        const tax = item.reduce((acc:any, curr:any) => {
            const taxAmount = curr.taxList.reduce((taxAcc:any, taxCurr:any) => taxAcc + (curr.amount * taxCurr.rate / 100), 0);
            return acc + taxAmount;
        }, 0);
        const totalAmount = subtotal + tax;

        setItemsCost({subTotal: subtotal, taxAmount: tax, total: totalAmount});
        setItemData(item);
    }

    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you can handle the form submission, e.g., send data to the server
            const invoiceReceipt: InvoiceReceipt = {
            customer: customer,
            subtotal: itemsCost.subTotal,
            tax: itemsCost.taxAmount,
            total: itemsCost.total,
            invoiceList: itemData
        };
        setInvoiceReceipt(invoiceReceipt);
        setInvoiceShow(true);
    };

    function SetCustomer(customer: CustomerInvoice) {
        setCustomer(customer);
    }

    // Your logic here
    return {
        itemsCost,
        ItemsData,
        submitForm,
        customer,
        SetCustomer,
        invoiceReceipt,
        InvoiceShow,
        setInvoiceShow
    }
};

export default useGenerateInvoiceLogic;