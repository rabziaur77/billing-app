import { useState, useEffect } from 'react';
import { API_SERVICE } from '../../../Service/API/API_Service';
import type { CustomerVendor, SaveCustomerVendorRequest } from './CustomerModel';
import { validateGstin, validateMobile, gstinError, mobileError } from '../../../utils/validationUtils';

const EMPTY_FORM: SaveCustomerVendorRequest = {
    type: 'Customer',
    name: '',
    mobile: '',
    email: '',
    gstin: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
};

const useCustomerMasterLogic = () => {
    const [list, setList] = useState<CustomerVendor[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState<SaveCustomerVendorRequest>(EMPTY_FORM);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'All' | 'Customer' | 'Vendor'>('All');
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof SaveCustomerVendorRequest, string>>>({});

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const resp = await API_SERVICE.get('master-api/CustomerVendor/GetAll');
            setList(Array.isArray(resp.data?.result) ? resp.data.result : []);
        } catch (err) {
            console.error('Failed to fetch customers/vendors', err);
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setEditId(null);
        setForm(EMPTY_FORM);
        setFormErrors({});
        setShowModal(true);
    };

    const openEdit = (item: CustomerVendor) => {
        setEditId(item.id);
        setForm({
            type: item.type,
            name: item.name,
            mobile: item.mobile,
            email: item.email,
            gstin: item.gstin,
            address: item.address,
            city: item.city,
            state: item.state,
            pincode: item.pincode,
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleFormChange = (field: keyof SaveCustomerVendorRequest, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        // Clear the error for that field as the user types
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    /** Validates the form and returns true if clean. */
    const validateForm = (): boolean => {
        const errors: Partial<Record<keyof SaveCustomerVendorRequest, string>> = {};
        if (!form.name.trim()) {
            errors.name = 'Name is required';
        }
        const mobileErr = mobileError(form.mobile);
        if (mobileErr) errors.mobile = mobileErr;

        const gstErr = gstinError(form.gstin);
        if (gstErr) errors.gstin = gstErr;

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setSaving(true);
        try {
            if (editId !== null) {
                await API_SERVICE.put(`master-api/CustomerVendor/Update/${editId}`, form);
            } else {
                await API_SERVICE.post('master-api/CustomerVendor/Save', form);
            }
            setShowModal(false);
            fetchAll();
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Please try again.';
            console.error('Save failed', err);
            alert(`Failed to save: ${msg}`);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (item: CustomerVendor) => {
        // Build a valid SaveCustomerVendorRequest (no id) plus the toggled isActive flag
        const body: SaveCustomerVendorRequest & { isActive: boolean } = {
            type: item.type,
            name: item.name,
            mobile: item.mobile,
            email: item.email,
            gstin: item.gstin,
            address: item.address,
            city: item.city,
            state: item.state,
            pincode: item.pincode,
            isActive: !item.isActive,
        };
        try {
            await API_SERVICE.put(`master-api/CustomerVendor/Update/${item.id}`, body);
            fetchAll();
        } catch (err: any) {
            console.error('Toggle failed', err);
            alert('Failed to update status. Please try again.');
        }
    };

    const filtered = list.filter(item => {
        const matchType = filterType === 'All' || item.type === filterType;
        const matchSearch =
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.mobile.includes(searchTerm) ||
            (item.gstin || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchType && matchSearch;
    });

    // Export validators so CustomerMaster.tsx can show inline field errors
    return {
        list: filtered,
        loading,
        saving,
        showModal,
        setShowModal,
        editId,
        form,
        formErrors,
        searchTerm,
        setSearchTerm,
        filterType,
        setFilterType,
        openAdd,
        openEdit,
        handleFormChange,
        handleSave,
        handleToggleActive,
        // expose for testing
        validateGstin,
        validateMobile,
    };
};

export default useCustomerMasterLogic;
