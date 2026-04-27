import { useState, useEffect, useCallback } from 'react';
import type { SalesReturn, CreateSalesReturnRequest, CreateSalesReturnItemRequest } from './SalesReturnModel';
import { API_SERVICE } from "../../../Service/API/API_Service";

const EMPTY_ITEM: CreateSalesReturnItemRequest = {
    productId: 0,
    productName: '',
    hsnCode: '',
    quantity: 1,
    rate: 0,
};

export function useSalesReturnLogic() {
    const [returns, setReturns] = useState<SalesReturn[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state
    const [originalInvoiceNo, setOriginalInvoiceNo] = useState('');
    const [reason, setReason] = useState('');
    const [items, setItems] = useState<CreateSalesReturnItemRequest[]>([{ ...EMPTY_ITEM }]);

    const fetchReturns = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await API_SERVICE.get('invoice-api/SalesReturn/GetAll');
            setReturns(res.data?.response ?? []);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to load returns.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchReturns(); }, [fetchReturns]);

    const addItem = () => setItems(prev => [...prev, { ...EMPTY_ITEM }]);

    const removeItem = (idx: number) =>
        setItems(prev => prev.filter((_, i) => i !== idx));

    const updateItem = (idx: number, field: keyof CreateSalesReturnItemRequest, value: any) =>
        setItems(prev => prev.map((item, i) =>
            i === idx ? { ...item, [field]: value } : item
        ));

    const resetForm = () => {
        setOriginalInvoiceNo('');
        setReason('');
        setItems([{ ...EMPTY_ITEM }]);
    };

    const submit = async () => {
        setError(null);
        setSuccess(null);

        if (!originalInvoiceNo.trim()) { setError('Original Invoice Number is required.'); return; }
        if (items.some(i => !i.productName || i.quantity <= 0 || i.rate <= 0)) {
            setError('All items must have a product name, quantity > 0, and rate > 0.'); return;
        }

        const payload: CreateSalesReturnRequest = {
            originalInvoiceNo: originalInvoiceNo.trim(),
            reason: reason || undefined,
            items,
        };

        setSaving(true);
        try {
            const res = await API_SERVICE.post('invoice-api/SalesReturn/Create', payload);
            if (res.data?.statusCode === 201) {
                setSuccess(`Return ${res.data.response?.returnNumber ?? ''} created successfully.`);
                resetForm();
                fetchReturns();
            } else {
                setError(res.data?.status ?? 'Failed to create return.');
            }
        } catch (e: any) {
            setError(e?.response?.data?.status ?? e?.message ?? 'Error creating return.');
        } finally {
            setSaving(false);
        }
    };

    const totalRefund = items.reduce((sum, i) => sum + (i.quantity * i.rate || 0), 0);

    return {
        returns, loading, saving, error, success,
        originalInvoiceNo, setOriginalInvoiceNo,
        reason, setReason,
        items, addItem, removeItem, updateItem,
        totalRefund, submit, fetchReturns,
    };
}
