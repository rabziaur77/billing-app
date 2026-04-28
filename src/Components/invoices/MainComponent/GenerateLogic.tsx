import React, { useState } from "react";
import type { CustomerInvoice, LineItem, InvoiceReceipt } from "../InvoiceModel/Models";
import { API_SERVICE } from "../../../Service/API/API_Service";
import { useAuth } from "../../../Service/ContextService/AuthContext";

/**
 * Custom hook to manage the logic for generating an invoice.
 * Handles customer details, line items, GST computation, and form submission.
 */
export interface InvoiceRequest {
    invoiceNumber: string;
    createdBy: number;
    customerName: string;
    customerMobile?: string;
    customerGstin?: string;
    placeOfSupply?: string;
    invoiceType?: string;
    invoiceItems: InvoiceItemRequest[];
}

export interface InvoiceItemRequest {
    productId?: number;
    productName: string;
    quantity: number;
    rate: number;
    discount: number;
    hsnCode?: string;
    invoiceTaxes: InvoiceTaxRequest[];
}

export interface InvoiceTaxRequest {
    taxCode: string;
    taxPercent: number;
}

const BLANK_RECEIPT: InvoiceReceipt = {
    customer: { Name: "", InvoiceDate: "", DueDate: "", InvoiceNumber: "", CustomerMobile: "" },
    subtotal: 0, tax: 0, total: 0, invoiceList: [],
};

function getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === "object" && error !== null) {
        const response = (error as { response?: { data?: { message?: string } } }).response;
        const responseMessage = response?.data?.message;
        if (responseMessage) return responseMessage;

        const runtimeMessage = (error as { message?: string }).message;
        if (runtimeMessage) return runtimeMessage;
    }

    return fallback;
}

const useGenerateInvoiceLogic = () => {
    const { userInfo } = useAuth();
    const [itemsCost, setItemsCost] = useState({ subTotal: 0, taxAmount: 0, total: 0 });
    const [customer, setCustomer] = useState<CustomerInvoice>({
        Name: "", InvoiceDate: "", DueDate: "", InvoiceNumber: "",
        CustomerMobile: "", CustomerGSTIN: "", PlaceOfSupply: "", InvoiceType: "B2C",
    });
    const [itemData, setItemData] = useState<LineItem[]>([
        { productId: 0, productName: "", quantity: 1, rate: 0, amount: 0, discount: 0, grossAmount: 0, taxList: [] },
    ]);
    const [InvoiceShow, setInvoiceShow] = useState<boolean>(false);
    const [invoiceReceipt, setInvoiceReceipt] = useState<InvoiceReceipt>(BLANK_RECEIPT);
    /** Incremented after every successful invoice save to signal child resets. */
    const [resetKey, setResetKey] = useState(0);

    // ── Payment panel state (shown inside the success popup) ──────────────
    const [showPaymentPanel, setShowPaymentPanel] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        paymentMode: 'Cash',
        amountPaid: 0,
        referenceNumber: '',
        remarks: '',
    });
    const [paymentSaving, setPaymentSaving] = useState(false);
    const [paymentDone, setPaymentDone] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const ItemsData = (item: LineItem[]) => {
        const subtotal = item.reduce((acc, curr) => acc + curr.amount, 0);
        // Derive tax from the pre-computed grossAmount so CGST+SGST vs IGST
        // splitting is respected regardless of intra/inter-state mode.
        const tax = item.reduce((acc, curr) => acc + (curr.grossAmount - curr.amount), 0);
        const totalAmount = subtotal + tax;
        setItemsCost({ subTotal: subtotal, taxAmount: tax, total: totalAmount });
        setItemData(item);
    };

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer.Name.trim()) {
            alert("Customer name is required.");
            return;
        }
        if (!customer.InvoiceDate || !customer.DueDate || !customer.InvoiceNumber) {
            alert("Please fill in all invoice details (date, due date, invoice number).");
            return;
        }
        const hasValidItem = itemData.some(i => i.productId > 0 && i.quantity > 0);
        if (!hasValidItem) {
            alert("Please add at least one valid item to the invoice.");
            return;
        }
        if (itemsCost.subTotal <= 0) {
            alert("Invoice total must be greater than zero.");
            return;
        }

        const receipt: InvoiceReceipt = {
            customer,
            subtotal: itemsCost.subTotal,
            tax: itemsCost.taxAmount,
            total: itemsCost.total,
            invoiceList: itemData,
        };

        try {
            setIsSubmitting(true);
            await SaveInvoiceRequest(toInvoiceRequest(receipt));
            // ── Show success popup with payment option ──────────────────
            setInvoiceReceipt(receipt);
            setPaymentForm(prev => ({ ...prev, amountPaid: itemsCost.total })); // default: full payment
            setPaymentDone(false);
            setShowPaymentPanel(false);
            setInvoiceShow(true);
        } catch {
            // Error already alerted inside SaveInvoiceRequest
        } finally {
            setIsSubmitting(false);
        }
    };

    function SetCustomer(c: CustomerInvoice) {
        setCustomer(c);
    }

    const SaveInvoiceRequest = async (invoiceRequest: InvoiceRequest) => {
        try {
            const response = await API_SERVICE.post('/invoice-api/Invoice/SaveInvoiceData', invoiceRequest);
            if (response.status !== 200 && response.status !== 201) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const lowStockItems: string[] = response.data?.lowStockWarnings ?? [];
            if (lowStockItems.length > 0) {
                alert(`⚠️ Low Stock Warning:\n${lowStockItems.join('\n')}`);
            }
            resetForm();
        } catch (error: unknown) {
            const msg = getErrorMessage(error, 'Unknown error');
            console.error("Error saving invoice:", error);
            alert(`Failed to save invoice: ${msg}`);
            throw error;
        }
    };

    /** Record payment directly from the invoice success popup. */
    const handleRecordPayment = async () => {
        if (paymentForm.amountPaid <= 0) {
            setPaymentError("Amount must be greater than zero.");
            return;
        }
        if (paymentForm.amountPaid > invoiceReceipt.total + 0.005) {
            setPaymentError(`Amount (₹${paymentForm.amountPaid}) exceeds invoice total (₹${invoiceReceipt.total.toFixed(2)}).`);
            return;
        }
        setPaymentError(null);
        setPaymentSaving(true);
        try {
            await API_SERVICE.post('invoice-api/Payment/RecordPayment', {
                invoiceNumber: invoiceReceipt.customer.InvoiceNumber,
                amountPaid: paymentForm.amountPaid,
                paymentMode: paymentForm.paymentMode,
                paymentDate: new Date().toISOString().split('T')[0],
                referenceNumber: paymentForm.referenceNumber || undefined,
                remarks: paymentForm.remarks || undefined,
            });
            setPaymentDone(true);
            setShowPaymentPanel(false);
        } catch (error: unknown) {
            const msg = getErrorMessage(error, 'Please try again.');
            setPaymentError(`Payment failed: ${msg}`);
        } finally {
            setPaymentSaving(false);
        }
    };

    const resetForm = () => {
        setCustomer({
            Name: "",
            InvoiceDate: "",
            DueDate: "",
            InvoiceNumber: "",
            CustomerMobile: "",
            CustomerGSTIN: "",
            PlaceOfSupply: "",
            InvoiceType: "B2C"
        });
        setItemData([{ productId: 0, productName: "", quantity: 1, rate: 0, amount: 0, discount: 0, grossAmount: 0, taxList: [] }]);
        setItemsCost({ subTotal: 0, taxAmount: 0, total: 0 });
        // Signal child components to reset their own internal state & reload data
        setResetKey(prev => prev + 1);
    };

    function toInvoiceRequest(receipt: InvoiceReceipt): InvoiceRequest {
        const validItems = receipt.invoiceList.filter(i => i.productId > 0 && i.quantity > 0);
        return {
            invoiceNumber: receipt.customer.InvoiceNumber,
            customerName: receipt.customer.Name.trim(),
            createdBy: userInfo.userId ?? 0,
            customerMobile: receipt.customer.CustomerMobile,
            customerGstin: receipt.customer.CustomerGSTIN,
            placeOfSupply: receipt.customer.PlaceOfSupply,
            invoiceType: receipt.customer.InvoiceType,
            invoiceItems: validItems.map<InvoiceItemRequest>(item => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                rate: item.rate,
                discount: item.discount || 0,
                hsnCode: item.hsnCode,
                invoiceTaxes: item.taxList.map(t => ({
                    taxCode: t.name,
                    taxPercent: t.rate,
                })),
            })),
        };
    }

    return {
        itemsCost,
        ItemsData,
        submitForm,
        customer,
        SetCustomer,
        invoiceReceipt,
        InvoiceShow,
        setInvoiceShow,
        itemData,
        resetKey,
        isSubmitting,
        // Payment panel
        showPaymentPanel,
        setShowPaymentPanel,
        paymentForm,
        setPaymentForm,
        paymentSaving,
        paymentDone,
        paymentError,
        handleRecordPayment,
    };
};

export default useGenerateInvoiceLogic;
