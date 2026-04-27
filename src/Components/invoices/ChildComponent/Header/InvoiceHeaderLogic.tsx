import { useEffect, useState, type ChangeEvent } from "react";
import type { CustomerInvoice } from "../../InvoiceModel/Models";
import { API_SERVICE } from "../../../../Service/API/API_Service";
import type { CustomerVendor } from "../../../Master/CustomerMaster/CustomerModel";

interface Prop {
    SetCustomer: (customer: CustomerInvoice) => void;
    /** Incremented by parent after each successful invoice save. */
    resetKey: number;
}

type ActiveDropdown = 'name' | 'mobile' | 'gstin' | null;

const useInvoiceHeader = ({ SetCustomer, resetKey }: Prop) => {
    const today = new Date().toISOString().split('T')[0];
    const [customer, setCustomer] = useState<CustomerInvoice>({
        Name: "", InvoiceDate: today, DueDate: today, InvoiceNumber: '',
        CustomerMobile: "", CustomerGSTIN: "", PlaceOfSupply: "", InvoiceType: "B2C",
        CustomerId: undefined,
    });
    const [customerList, setCustomerList] = useState<CustomerVendor[]>([]);
    const [customerSearch, setCustomerSearch] = useState('');
    const [activeDropdown, setActiveDropdown] = useState<ActiveDropdown>(null);
    const [quickSaving, setQuickSaving] = useState(false);

    // On mount (resetKey=0) and after each invoice save: full reset + new invoice number
    useEffect(() => {
        const fresh: CustomerInvoice = {
            Name: "", InvoiceDate: today, DueDate: today, InvoiceNumber: '',
            CustomerMobile: "", CustomerGSTIN: "", PlaceOfSupply: "", InvoiceType: "B2C",
            CustomerId: undefined,
        };
        setCustomer(fresh);
        setCustomerSearch('');
        setActiveDropdown(null);
        GenerateInvoiceNumber();
        loadCustomers();
    }, [resetKey]);

    const loadCustomers = async () => {
        try {
            const resp = await API_SERVICE.get('master-api/CustomerVendor/GetAll');
            const data = Array.isArray(resp.data?.result) ? resp.data.result : [];
            setCustomerList(data.filter((c: CustomerVendor) => c.isActive && c.type === 'Customer'));
        } catch {
            // silent – customer dropdown is best-effort
        }
    };

    const GenerateInvoiceNumber = () => {
        API_SERVICE.get('invoice-api/Invoice/create-invoice')
            .then(response => {
                setCustomer(prev => ({ ...prev, InvoiceNumber: response.data.response }));
            })
            .catch(error => {
                console.error("Error generating invoice number:", error);
            });
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updated = { ...customer, [name]: value };
        setCustomer(updated);
        if (SetCustomer) SetCustomer(updated);
    };

    /** Fill all invoice header fields from a selected customer record */
    const selectCustomer = (cv: CustomerVendor) => {
        const updated: CustomerInvoice = {
            ...customer,
            Name: cv.name,
            CustomerMobile: cv.mobile || '',
            CustomerGSTIN: cv.gstin || '',
            PlaceOfSupply: cv.state || '',
            CustomerId: cv.id,
        };
        setCustomer(updated);
        SetCustomer(updated);
        setCustomerSearch(cv.name);
        setActiveDropdown(null);
    };

    // ── Name field ──────────────────────────────────────────────────────────────
    const handleCustomerSearch = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCustomerSearch(val);
        setActiveDropdown('name');
        const updated = { ...customer, Name: val, CustomerId: undefined };
        setCustomer(updated);
        SetCustomer(updated);
    };

    // ── Mobile field ────────────────────────────────────────────────────────────
    const handleMobileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const updated = { ...customer, CustomerMobile: val, CustomerId: undefined };
        setCustomer(updated);
        SetCustomer(updated);
        setActiveDropdown(val.length > 0 ? 'mobile' : null);
    };

    // ── GSTIN field ─────────────────────────────────────────────────────────────
    const handleGstinChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase();
        const updated = { ...customer, CustomerGSTIN: val, CustomerId: undefined };
        setCustomer(updated);
        SetCustomer(updated);
        setActiveDropdown(val.length > 0 ? 'gstin' : null);
    };

    /** Save name + mobile + gstin as a new Customer, then auto-select it */
    const quickSaveCustomer = async () => {
        const name = (customerSearch || customer.Name).trim();
        if (!name) { alert('Please enter a customer name first.'); return; }
        setQuickSaving(true);
        try {
            const payload = {
                type: 'Customer',
                name,
                mobile: customer.CustomerMobile || '',
                email: '',
                gstin: customer.CustomerGSTIN || '',
                address: '',
                city: '',
                state: customer.PlaceOfSupply || '',
                pincode: '',
            };
            const resp = await API_SERVICE.post('master-api/CustomerVendor/Save', payload);
            const saved: CustomerVendor = resp.data?.result ?? resp.data;
            await loadCustomers();
            if (saved?.id) {
                // Merge back the values the user had typed (API may return empty strings)
                selectCustomer({
                    ...saved,
                    mobile: saved.mobile || customer.CustomerMobile,
                    gstin:  saved.gstin  || customer.CustomerGSTIN || '',
                });
            } else {
                setActiveDropdown(null);
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Failed to save customer.';
            alert(msg);
        } finally {
            setQuickSaving(false);
        }
    };

    // ── Filtered lists per field ─────────────────────────────────────────────────
    const filteredByName = customerList.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        (c.mobile || '').includes(customerSearch) ||
        (c.gstin  || '').toLowerCase().includes(customerSearch.toLowerCase())
    );

    const filteredByMobile = customerList.filter(c =>
        customer.CustomerMobile.length > 0 &&
        (c.mobile || '').includes(customer.CustomerMobile)
    );

    const filteredByGstin = customerList.filter(c =>
        (customer.CustomerGSTIN || '').length > 0 &&
        (c.gstin || '').toLowerCase().includes((customer.CustomerGSTIN || '').toLowerCase())
    );

    const activeFiltered =
        activeDropdown === 'name'   ? filteredByName   :
        activeDropdown === 'mobile' ? filteredByMobile :
        activeDropdown === 'gstin'  ? filteredByGstin  : [];

    const closeDropdown = () => setTimeout(() => setActiveDropdown(null), 200);

    return {
        customer,
        customerSearch,
        activeDropdown,
        activeFiltered,
        quickSaving,
        handleInputChange,
        handleCustomerSearch,
        handleMobileChange,
        handleGstinChange,
        selectCustomer,
        quickSaveCustomer,
        closeDropdown,
    };
};

export default useInvoiceHeader;