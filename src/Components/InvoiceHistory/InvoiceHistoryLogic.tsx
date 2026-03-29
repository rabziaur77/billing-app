import { useCallback, useEffect, useMemo, useState } from "react";
import { API_SERVICE } from "../../Service/API/API_Service";
import debounce from "lodash/debounce";
import type { InvoiceInfo, InvoiceModel, InvoiceReceipt } from "../invoices/InvoiceModel/Models";

const useInvoiceHistoryLogic = () => {
    const [invoices, setInvoices] = useState<InvoiceModel[]>([]);
    const [invoiceInfo, setInvoiceInfo] = useState<InvoiceInfo[]>([]);
    const [InvoiceSelected, setInvoiceSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [childLoading, setChildLoading] = useState<boolean>(false);
    const [isInvoiceShow, setIsInvoiceShow] = useState<boolean>(false);
    const [receiptLoading, setReceiptLoading] = useState<boolean>(false);
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
            setInvoices(response.data.response);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching invoices:", error);
            setLoading(false);
        }
    };

    const GetInvoiceHistory = useMemo(() =>
        debounce(async (invoiceNumber: string) => {
            setChildLoading(true);
            setInvoiceSelected(invoiceNumber);
            setInvoiceInfo([]);
            API_SERVICE.get(`invoice-api/InvoiceHistory/GetInvoiceInfo?invoiceNumber=${invoiceNumber}`)
                .then(response => {
                    const mappedInfo = (response.data.response || []).map((item: any) => ({
                        invoiceID: item.invoiceID,
                        description: item.productName || item.description || "N/A",
                        quantity: item.quantity,
                        rate: item.rate,
                        discount: item.discount,
                        amount: item.lineTotal || item.grossAmount || item.amount || 0
                    }));
                    setInvoiceInfo(mappedInfo);
                    setChildLoading(false);
                })
                .catch(error => {
                    console.error("Error fetching invoice history:", error);
                    setChildLoading(false);
                });
        }, 300),
    []);

    const InvoiceDetails = useCallback((invoiceNumber:string) => {
        setIsInvoiceShow(true);
        setReceiptLoading(true);
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
                setReceiptLoading(false);
            })
            .catch(error => {
                console.error("Error fetching invoice details:", error);
                setReceiptLoading(false);
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
        setIsInvoiceShow,
        receiptLoading
    };
}

export default useInvoiceHistoryLogic;