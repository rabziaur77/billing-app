import React, { useState } from "react";
import type { CustomerInvoice, LineItem, InvoiceReceipt } from "../InvoiceModel/Models";
import { API_SERVICE } from "../../../Service/API/API_Service";

/**
 * Custom hook to manage the logic for generating an invoice.
 * It handles the state for items cost, customer details, and item data.
 * It also provides methods to update these states and submit the form.
 */

interface InvoiceItemRequest {
    description: string;
    quantity: number;
    rate: number;
    discount?: number;          // still optional
    amount: number;             // pre‑calculated or server‑side, your call
    taxList: number[];             // we keep the richer Tax[] model here
}

interface InvoiceRequest {
    invoiceNumber: string;
    customerNameOrNumber: string;
    invoiceItems: InvoiceItemRequest[];
}


const useGenerateInvoiceLogic = () => {
    const [itemsCost, setItemsCost] = useState({ subTotal: Number(0), taxAmount: Number(0), total: Number(0) });
    const [customer, setCustomer] = useState<CustomerInvoice>({ Name: "", InvoiceDate: "", DueDate: "", InvoiceNumber: "" });
    const [itemData, setItemData] = useState<LineItem[]>([]);
    const [InvoiceShow, setInvoiceShow] = useState<boolean>(false);
    const [invoiceReceipt, setInvoiceReceipt] = useState<InvoiceReceipt>({
        customer: { Name: "", InvoiceDate: "", DueDate: "", InvoiceNumber: "" },
        subtotal: 0,
        tax: 0,
        total: 0,
        invoiceList: []
    });

    const ItemsData = (item: any) => {
        console.log("ItemsData", item);

        const subtotal = item.reduce((acc: any, curr: any) => acc + curr.amount, 0);
        const tax = item.reduce((acc: any, curr: any) => {
            const taxAmount = curr.taxList.reduce((taxAcc: any, taxCurr: any) => taxAcc + (curr.amount * taxCurr.rate / 100), 0);
            return acc + taxAmount;
        }, 0);
        const totalAmount = subtotal + tax;

        setItemsCost({ subTotal: subtotal, taxAmount: tax, total: totalAmount });
        setItemData(item);
    }

    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer.Name || !customer.InvoiceDate || !customer.DueDate || !customer.InvoiceNumber) {
            alert("Please fill in all customer details.");
            return;
        }
        if (itemData.length === 0) {
            alert("Please add at least one item to the invoice.");
            return;
        }
        if (itemsCost.subTotal <= 0 || itemsCost.taxAmount < 0 || itemsCost.total <= 0) {
            alert("Please ensure the item costs are valid.");
            return;
        }
        // Create the invoice receipt object
        const invoiceReceipt: InvoiceReceipt = {
            customer: customer,
            subtotal: itemsCost.subTotal,
            tax: itemsCost.taxAmount,
            total: itemsCost.total,
            invoiceList: itemData
        };

        const invoiceReq = toInvoiceRequest(invoiceReceipt);

        SaveInvoiceRequest(invoiceReq)
        
        setInvoiceReceipt(invoiceReceipt);
        setInvoiceShow(true);
    };

    function SetCustomer(customer: CustomerInvoice) {
        setCustomer(customer);
    }

    const SaveInvoiceRequest = async (invoiceRequest: InvoiceRequest) => {
        try {
            const response = await API_SERVICE.post('/invoice-api/Invoice/SaveInvoiceData', invoiceRequest);
            // Check if the response is ok (status in the range 200-299)

            if (response.status !== 201) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = response.data;
            console.log("Invoice saved successfully:", data);
        } catch (error) {
            console.error("Error saving invoice:", error);
        }
    };

    /**
     * Converts an in‑memory InvoiceReceipt to an outbound InvoiceRequest.
     * Adds / derives the invoiceNumber so you don’t pollute your receipt model.
    */
    function toInvoiceRequest(
        receipt: InvoiceReceipt
    ): InvoiceRequest {
        return {
            invoiceNumber: receipt.customer.InvoiceNumber,
            customerNameOrNumber: receipt.customer.Name,
            invoiceItems: receipt.invoiceList.map<InvoiceItemRequest>(item => ({
                description: item.description,
                quantity: item.quantity,
                rate: item.rate,
                discount: item.discount,
                amount: item.amount,
                taxList: item.taxList.map(t => t.id)
            }))
        };
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