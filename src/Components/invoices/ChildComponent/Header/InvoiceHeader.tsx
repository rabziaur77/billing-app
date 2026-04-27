import React from "react";
import useInvoiceHeader from "./InvoiceHeaderLogic";
import type { CustomerInvoice } from "../../InvoiceModel/Models";

interface Prop {
    SetCustomer: (customer: CustomerInvoice) => void;
    /** Incremented by parent after each successful invoice save. */
    resetKey: number;
}

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

// ── Shared dropdown panel ────────────────────────────────────────────────────
const dropdownStyle: React.CSSProperties = {
    position: 'absolute', zIndex: 1050, left: 0, right: 0,
    background: '#fff', border: '1px solid #dee2e6',
    borderRadius: '0 0 6px 6px', maxHeight: 260, overflowY: 'auto',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
};

interface DropdownPanelProps {
    show: boolean;
    searchTerm: string;
    items: { id: number; name: string; mobile?: string; gstin?: string }[];
    onSelect: (item: any) => void;
    onQuickSave: () => void;
    quickSaving: boolean;
}

const DropdownPanel: React.FC<DropdownPanelProps> = ({ show, searchTerm, items, onSelect, onQuickSave, quickSaving }) => {
    if (!show || !searchTerm.trim()) return null;
    return (
        <div style={dropdownStyle}>
            {items.length > 0 ? items.map(c => (
                <div
                    key={c.id}
                    onMouseDown={() => onSelect(c)}
                    style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8f9fa')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                    <div className="fw-semibold">{c.name}</div>
                    <small className="text-muted">
                        {c.mobile}{c.gstin ? ` · GSTIN: ${c.gstin}` : ''}
                    </small>
                </div>
            )) : (
                <div style={{ padding: '8px 12px', color: '#6c757d', fontSize: '0.875rem' }}>
                    No customer found for &ldquo;{searchTerm}&rdquo;
                </div>
            )}
            {/* Quick-save action */}
            <div
                onMouseDown={onQuickSave}
                style={{
                    padding: '9px 12px',
                    cursor: quickSaving ? 'not-allowed' : 'pointer',
                    borderTop: '2px solid #e9ecef',
                    background: '#f0f7ff', color: '#0d6efd',
                    fontWeight: 600, fontSize: '0.875rem',
                    display: 'flex', alignItems: 'center', gap: 6,
                    opacity: quickSaving ? 0.6 : 1,
                }}
                onMouseEnter={e => !quickSaving && (e.currentTarget.style.background = '#dbeafe')}
                onMouseLeave={e => (e.currentTarget.style.background = '#f0f7ff')}
            >
                {quickSaving ? '⏳ Saving…' : '➕ Save as new Customer (Name + Mobile + GSTIN)'}
            </div>
        </div>
    );
};

// ── Main component ───────────────────────────────────────────────────────────
const InvoiceHeader: React.FC<Prop> = ({ SetCustomer, resetKey }) => {
    const {
        customer, customerSearch,
        activeDropdown, activeFiltered,
        quickSaving, quickSaveCustomer,
        handleInputChange,
        handleCustomerSearch,
        handleMobileChange,
        handleGstinChange,
        selectCustomer,
        closeDropdown,
    } = useInvoiceHeader({ SetCustomer, resetKey });

    return (
        <>
            {/* ── Row 1: Customer Name (autocomplete) + Invoice Date + Due Date ── */}
            <div className="row mb-3">
                {/* Customer Name */}
                <div className="col-md-6 mb-3" style={{ position: 'relative' }}>
                    <label className="form-label fw-semibold">Customer Name <span className="text-danger">*</span></label>
                    <input
                        type="text"
                        className="form-control"
                        value={customerSearch || customer.Name}
                        onChange={handleCustomerSearch}
                        onFocus={() => {/* dropdown opens on type */ }}
                        onBlur={closeDropdown}
                        placeholder="Type to search or enter name…"
                        required
                    />
                    <DropdownPanel
                        show={activeDropdown === 'name'}
                        searchTerm={customerSearch}
                        items={activeFiltered}
                        onSelect={selectCustomer}
                        onQuickSave={quickSaveCustomer}
                        quickSaving={quickSaving}
                    />
                </div>

                <div className="col-md-3 mb-3">
                    <label className="form-label">Invoice Date</label>
                    <input
                        type="date" className="form-control"
                        name="InvoiceDate" value={customer.InvoiceDate}
                        onChange={handleInputChange} required
                    />
                </div>
                <div className="col-md-3 mb-3">
                    <label className="form-label">Due Date</label>
                    <input
                        type="date" className="form-control"
                        name="DueDate" value={customer.DueDate}
                        onChange={handleInputChange} required
                    />
                </div>
            </div>

            {/* ── Row 2: Invoice No + Mobile + GSTIN + Invoice Type + Place of Supply ── */}
            <div className="row mb-4">
                <div className="col-md-3 mb-3">
                    <label className="form-label">Invoice Number</label>
                    <input
                        type="text" className="form-control"
                        value={customer.InvoiceNumber} readOnly
                    />
                </div>

                {/* Customer Mobile – searchable */}
                <div className="col-md-3 mb-3" style={{ position: 'relative' }}>
                    <label className="form-label">Customer Mobile</label>
                    <input
                        type="text" className="form-control"
                        value={customer.CustomerMobile}
                        onChange={handleMobileChange}
                        onBlur={closeDropdown}
                        placeholder="10-digit mobile"
                    />
                    <DropdownPanel
                        show={activeDropdown === 'mobile'}
                        searchTerm={customer.CustomerMobile}
                        items={activeFiltered}
                        onSelect={selectCustomer}
                        onQuickSave={quickSaveCustomer}
                        quickSaving={quickSaving}
                    />
                </div>

                {/* Customer GSTIN – searchable */}
                <div className="col-md-3 mb-3" style={{ position: 'relative' }}>
                    <label className="form-label">Customer GSTIN</label>
                    <input
                        type="text" className="form-control"
                        value={customer.CustomerGSTIN || ''}
                        onChange={handleGstinChange}
                        onBlur={closeDropdown}
                        placeholder="22AAAAA0000A1Z5"
                        maxLength={15}
                        style={{ textTransform: 'uppercase' }}
                    />
                    <DropdownPanel
                        show={activeDropdown === 'gstin'}
                        searchTerm={customer.CustomerGSTIN || ''}
                        items={activeFiltered}
                        onSelect={selectCustomer}
                        onQuickSave={quickSaveCustomer}
                        quickSaving={quickSaving}
                    />
                </div>

                <div className="col-md-1 mb-3">
                    <label className="form-label">Type</label>
                    <select
                        className="form-select" name="InvoiceType"
                        value={customer.InvoiceType || 'B2C'}
                        onChange={handleInputChange}
                    >
                        <option value="B2C">B2C</option>
                        <option value="B2B">B2B</option>
                    </select>
                </div>
                <div className="col-md-2 mb-3">
                    <label className="form-label">Place of Supply <span className="text-danger">*</span></label>
                    <select
                        className="form-select" name="PlaceOfSupply"
                        value={customer.PlaceOfSupply || ''}
                        onChange={handleInputChange}
                    >
                        <option value="">Select state…</option>
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
        </>
    );
};

export default InvoiceHeader;