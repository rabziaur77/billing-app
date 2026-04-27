import { useCallback, useEffect, useState } from "react";
import { API_SERVICE } from "../../Service/API/API_Service";
import debounce from "lodash/debounce";
import type { InvoiceInfo, InvoiceReceipt, LineItem } from "../invoices/InvoiceModel/Models";
import type { InvoiceRecordList } from "../invoices/InvoiceModel/InvoiceRecordList";

const EMPTY_RECEIPT: InvoiceReceipt = {
    customer: { Name: "", InvoiceDate: "", DueDate: "", InvoiceNumber: "", CustomerMobile: "" },
    subtotal: 0,
    tax: 0,
    total: 0,
    invoiceList: [],
};

const useInvoiceHistoryLogic = () => {
    const [invoices, setInvoices] = useState<InvoiceRecordList[]>([]);
    const [invoiceInfo, setInvoiceInfo] = useState<InvoiceInfo[]>([]);
    const [InvoiceSelected, setInvoiceSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [childLoading, setChildLoading] = useState<boolean>(false);
    const [isInvoiceShow, setIsInvoiceShow] = useState<boolean>(false);
    const [receiptLoading, setReceiptLoading] = useState<boolean>(false);
    const [invoiceReceipt, setInvoiceReceipt] = useState<InvoiceReceipt>(EMPTY_RECEIPT);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await API_SERVICE.get('invoice-api/InvoiceHistory/GetListOfInvoices');
            // Handle both { response: [...] } and plain array shapes
            const data = response.data?.response ?? response.data ?? [];
            setInvoices(data);
        } catch (error) {
            console.error("Error fetching invoices:", error);
        } finally {
            setLoading(false);
        }
    };

    // Cancel any in-flight debounced call when the component unmounts
    useEffect(() => {
        return () => {
            GetInvoiceHistory.cancel?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const GetInvoiceHistory = useCallback(
        debounce(async (invoiceNumber: string) => {
            setChildLoading(true);
            setInvoiceSelected(invoiceNumber);
            setInvoiceInfo([]);
            API_SERVICE.get(`invoice-api/InvoiceHistory/GetInvoiceInfo?invoiceNumber=${invoiceNumber}`)
                .then(response => {
                    const raw = response.data?.response ?? response.data ?? [];
                    const mappedInfo = (Array.isArray(raw) ? raw : []).map((item: any) => ({
                        invoiceID: item.invoiceID ?? item.id ?? 0,
                        description: item.productName || item.description || "N/A",
                        quantity: item.quantity ?? 0,
                        rate: item.rate ?? 0,
                        discount: item.discount ?? 0,
                        amount: item.lineTotal ?? item.grossAmount ?? item.amount ?? 0
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

    /**
     * Maps a raw API line-item object → a LineItem that InvoiceView can render safely.
     * The server may return different field names depending on which endpoint is hit.
     */
    const mapLineItem = (item: any): LineItem => {
        // taxList may be undefined from historical data — always default to []
        const taxList: LineItem['taxList'] = Array.isArray(item.taxList)
            ? item.taxList.map((t: any) => ({ id: t.id ?? t.taxId ?? 0, name: t.name ?? t.taxName ?? '', rate: t.rate ?? t.taxRate ?? 0 }))
            : Array.isArray(item.taxes)
                ? item.taxes.map((t: any) => ({ id: t.id ?? t.taxId ?? 0, name: t.name ?? t.taxName ?? '', rate: t.rate ?? t.taxRate ?? 0 }))
                : [];

        const qty = item.quantity ?? 0;
        const rate = item.rate ?? 0;
        const discount = item.discount ?? 0;
        const amount = item.amount ?? item.taxableAmount ?? Math.max(0, qty * rate - discount);
        const gross = item.grossAmount ?? item.lineTotal ?? item.total ?? amount;

        return {
            productId: item.productId ?? item.id ?? 0,
            productName: item.productName ?? item.description ?? item.name ?? "",
            quantity: qty,
            rate: rate,
            discount: discount,
            amount: amount,
            grossAmount: gross,
            taxList,
            hsnCode: item.hsnCode ?? item.hsn ?? undefined,
            cgst: item.cgst ?? undefined,
            sgst: item.sgst ?? undefined,
            igst: item.igst ?? undefined,
        };
    };

    const InvoiceDetails = useCallback((invoiceNumber: string) => {
        setIsInvoiceShow(true);
        setReceiptLoading(true);
        // Reset to blank while loading so old data doesn't flash
        setInvoiceReceipt(EMPTY_RECEIPT);

        API_SERVICE.get(`invoice-api/InvoiceHistory/GetInvoiceReceipt?invoiceNumber=${invoiceNumber}`)
            .then(response => {
                // Handle both { response: {...} } and plain object shapes
                const raw = response.data?.response ?? response.data;

                if (!raw) {
                    console.error("Receipt API returned empty response");
                    setReceiptLoading(false);
                    return;
                }

                // Customer block — server may use camelCase or PascalCase
                const c = raw.customer ?? raw.Customer ?? {};
                const cust = {
                    Name: c.name ?? c.Name ?? "",
                    InvoiceDate: c.invoiceDate ?? c.InvoiceDate ?? "",
                    DueDate: c.dueDate ?? c.DueDate ?? "",
                    InvoiceNumber: c.invoiceNumber ?? c.InvoiceNumber ?? invoiceNumber,
                    CustomerMobile: c.customerMobile ?? c.CustomerMobile ?? "",
                    CustomerGSTIN: c.customerGstin ?? c.customerGSTIN ?? c.CustomerGSTIN ?? "",
                    PlaceOfSupply: c.placeOfSupply ?? c.PlaceOfSupply ?? "",
                    InvoiceType: (c.invoiceType ?? c.InvoiceType) as 'B2B' | 'B2C' | undefined,
                };

                // Invoice line items — server may call it invoiceItems, items, invoiceList, lineItems
                const rawItems: any[] =
                    raw.invoiceList ?? raw.invoiceItems ?? raw.items ??
                    raw.InvoiceList ?? raw.Items ?? [];

                const invoiceList = (Array.isArray(rawItems) ? rawItems : []).map(mapLineItem);

                // Recompute subtotal / tax / total from mapped items if server omits them
                const computedSubtotal = invoiceList.reduce((s, i) => s + i.amount, 0);
                const computedTotal = invoiceList.reduce((s, i) => s + i.grossAmount, 0);
                const computedTax = computedTotal - computedSubtotal;

                const receipt: InvoiceReceipt = {
                    customer: cust,
                    invoiceList,
                    subtotal: raw.subtotal ?? raw.subTotal ?? computedSubtotal,
                    tax: raw.tax ?? raw.taxAmount ?? computedTax,
                    total: raw.grandTotal ?? computedTotal,
                    totalPaid: raw.totalPaid ?? 0,
                    balanceDue: raw.balanceDue ?? raw.total ?? computedTotal,
                    paymentStatus: raw.paymentStatus ?? undefined,
                };

                setInvoiceReceipt(receipt);
                setReceiptLoading(false);
            })
            .catch(error => {
                console.error("Error fetching invoice receipt:", error);
                alert(`Could not load receipt: ${error?.response?.data?.message ?? error?.message ?? 'Unknown error'}`);
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