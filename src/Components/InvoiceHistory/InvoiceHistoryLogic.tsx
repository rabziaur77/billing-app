import { useCallback, useEffect, useState } from "react";
import { API_SERVICE } from "../../Service/API/API_Service";
import debounce from "lodash/debounce";
import type { InvoiceReceipt } from "../invoices/InvoiceModel/Models";

interface Invoice {
    id: number;
    invoiceNumber: string;
    customerNameOrNumber: string;
    createdDate: string;
}

interface InvoiceInfo {
    invoiceID: number;
    description: string;
    quantity: number;
    rate: number;
    discount: number;
    amount: number;
}

const useInvoiceHistoryLogic = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [invoiceInfo, setInvoiceInfo] = useState<InvoiceInfo[]>([]);
    const [InvoiceSelected, setInvoiceSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [childLoading, setChildLoading] = useState<boolean>(false);
    const [isInvoiceShow, setIsInvoiceShow] = useState<boolean>(false);
    const [invoiceReceipt, setInvoiceReceipt] = useState<InvoiceReceipt>({
        customer: { Name: "", InvoiceDate: "", DueDate: "", InvoiceNumber: "" },
        subtotal: 0,
        tax: 0,
        total: 0,
        invoiceList: []
    });

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await API_SERVICE.get('invoice-api/InvoiceHistory/GetListOfInvoices');
            console.log("Fetched Invoices:", response.data.response);
            setInvoices(response.data.response);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching invoices:", error);
            setLoading(false);
        }
    };

    const GetInvoiceHistory = useCallback(debounce(async (invoiceNumber: string) => {
        setChildLoading(true);
        setInvoiceSelected(invoiceNumber);
        setInvoiceInfo([]);
        API_SERVICE.get(`invoice-api/InvoiceHistory/GetInvoiceInfo?invoiceNumber=${invoiceNumber}`)
            .then(response => {
                setInvoiceInfo(response.data.response);
                setChildLoading(false);
            })
            .catch(error => {
                console.error("Error fetching invoice history:", error);
                setChildLoading(false);
            });
    }, 300), [])

    const InvoiceDetails = useCallback((invoiceNumber:string) => {
        setIsInvoiceShow(true);
        API_SERVICE.get(`invoice-api/InvoiceHistory/GetInvoiceReceipt?invoiceNumber=${invoiceNumber}`)
            .then(response => {

                const cust = {
                    Name: response.data.response.customer.name,
                    InvoiceDate: response.data.response.customer.invoiceDate,
                    DueDate: response.data.response.customer.dueDate,
                    InvoiceNumber: response.data.response.customer.invoiceNumber
                };
                response.data.response.customer = cust;

                setInvoiceReceipt(response.data.response);
            })
            .catch(error => {
                console.error("Error fetching invoice details:", error);
            });
    }, []);
        


    const closeInfo = () => {
        setInvoiceSelected(null);
        setInvoiceInfo([]);
    };

    return {
        invoices,
        InvoiceSelected,
        invoiceInfo,
        GetInvoiceHistory,
        closeInfo,
        loading,
        childLoading,
        InvoiceDetails,
        invoiceReceipt,
        isInvoiceShow,
        setIsInvoiceShow
    };
}

export default useInvoiceHistoryLogic;