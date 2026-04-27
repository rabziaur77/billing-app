import { useState, useEffect, useRef } from 'react';
import { API_SERVICE } from '../../Service/API/API_Service';
import type { Payment, PaymentMode, RecordPaymentRequest } from './PaymentModel';
import { amountError, overpaymentError } from '../../utils/validationUtils';

const EMPTY_FORM: RecordPaymentRequest = {
    invoiceNumber: '',
    amountPaid: 0,
    paymentMode: 'Cash',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    remarks: '',
};

const usePaymentLogic = (initialInvoiceNumber?: string) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<RecordPaymentRequest>(EMPTY_FORM);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMode, setFilterMode] = useState<PaymentMode | 'All'>('All');
    /**
     * Tracks the balance due for the invoice being paid.
     * Set when opening from a payment row (known balance) or null when
     * recording a fresh payment (balance unknown until server validates).
     */
    const [currentBalanceDue, setCurrentBalanceDue] = useState<number | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    // Prevent setState after unmount
    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        fetchPayments();
    }, []);

    // If launched from Invoice History with a specific invoice, open modal pre-filled
    useEffect(() => {
        if (initialInvoiceNumber) {
            openRecordPayment(initialInvoiceNumber);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialInvoiceNumber]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const resp = await API_SERVICE.get('invoice-api/Payment/GetAll');
            if (isMounted.current) {
                setPayments(resp.data.response ?? resp.data ?? []);
            }
        } catch (err) {
            console.error('Failed to fetch payments', err);
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    const openRecordPayment = (invoiceNumber = '', balanceDue: number | null = null) => {
        setForm({ ...EMPTY_FORM, invoiceNumber, paymentDate: new Date().toISOString().split('T')[0] });
        setCurrentBalanceDue(balanceDue);
        setFormError(null);
        setShowModal(true);
    };

    const handleFormChange = (field: keyof RecordPaymentRequest, value: string | number) => {
        setForm(prev => ({ ...prev, [field]: value }));
        // Live-validate amount on change
        if (field === 'amountPaid') {
            const amt = Number(value);
            const err = amountError(amt) ??
                (currentBalanceDue !== null ? overpaymentError(amt, currentBalanceDue) : null);
            setFormError(err);
        } else {
            setFormError(null);
        }
    };

    const handleSave = async () => {
        if (!form.invoiceNumber.trim()) {
            setFormError('Invoice number is required');
            return;
        }
        const amtErr = amountError(form.amountPaid);
        if (amtErr) { setFormError(amtErr); return; }

        // Overpayment guard — warn and require confirmation
        if (currentBalanceDue !== null) {
            const overErr = overpaymentError(form.amountPaid, currentBalanceDue);
            if (overErr) {
                setFormError(overErr);
                return;
            }
        }

        setSaving(true);
        try {
            await API_SERVICE.post('invoice-api/Payment/RecordPayment', form);
            setShowModal(false);
            fetchPayments();
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Please try again.';
            console.error('Save payment failed', err);
            setFormError(`Failed to record payment: ${msg}`);
        } finally {
            if (isMounted.current) setSaving(false);
        }
    };

    const filtered = payments.filter(p => {
        const matchMode = filterMode === 'All' || p.paymentMode === filterMode;
        const term = searchTerm.toLowerCase();
        const matchSearch =
            (p.invoiceNumber ?? '').toLowerCase().includes(term) ||
            (p.customerName ?? '').toLowerCase().includes(term) ||
            (p.referenceNumber ?? '').toLowerCase().includes(term);
        return matchMode && matchSearch;
    });

    const totalCollected = filtered.reduce((s, p) => s + p.amountPaid, 0);

    return {
        payments: filtered,
        loading,
        saving,
        showModal,
        setShowModal,
        form,
        formError,
        searchTerm,
        setSearchTerm,
        filterMode,
        setFilterMode,
        openRecordPayment,
        handleFormChange,
        handleSave,
        totalCollected,
        currentBalanceDue,
    };
};

export default usePaymentLogic;
