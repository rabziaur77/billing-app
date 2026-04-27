import React from 'react';
import useCustomerMasterLogic from './CustomerMasterLogic';

const INDIAN_STATES = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
    'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
    'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
    'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
    'Uttar Pradesh','Uttarakhand','West Bengal',
    'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
    'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
];

const CustomerMaster: React.FC = () => {
    const {
        list, loading, saving, showModal, setShowModal, editId, form,
        formErrors, searchTerm, setSearchTerm, filterType, setFilterType,
        openAdd, openEdit, handleFormChange, handleSave, handleToggleActive,
    } = useCustomerMasterLogic();

    return (
        <div className="container-fluid py-3">
            {/* ── Toolbar ── */}
            <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                <input
                    type="text"
                    className="form-control"
                    style={{ maxWidth: 260 }}
                    placeholder="Search name / mobile / GSTIN…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <select
                    className="form-select"
                    style={{ maxWidth: 150 }}
                    value={filterType}
                    onChange={e => setFilterType(e.target.value as any)}
                >
                    <option value="All">All</option>
                    <option value="Customer">Customers</option>
                    <option value="Vendor">Vendors</option>
                </select>
                <button className="btn btn-primary ms-auto" onClick={openAdd}>
                    + Add Customer / Vendor
                </button>
            </div>

            {/* ── Table ── */}
            {loading ? (
                <div className="text-center py-4"><div className="spinner-border text-primary" /></div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover table-bordered align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Type</th>
                                <th>Name</th>
                                <th>Mobile</th>
                                <th>Email</th>
                                <th>GSTIN</th>
                                <th>City</th>
                                <th>State</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.length === 0 ? (
                                <tr><td colSpan={10} className="text-center text-muted py-4">No records found.</td></tr>
                            ) : list.map((item, i) => (
                                <tr key={item.id}>
                                    <td>{i + 1}</td>
                                    <td>
                                        <span className={`badge ${item.type === 'Customer' ? 'bg-primary' : 'bg-warning text-dark'}`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td>{item.name}</td>
                                    <td>{item.mobile}</td>
                                    <td>{item.email || '—'}</td>
                                    <td><code>{item.gstin || '—'}</code></td>
                                    <td>{item.city || '—'}</td>
                                    <td>{item.state || '—'}</td>
                                    <td>
                                        <span className={`badge ${item.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                            {item.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(item)} title="Edit">
                                                ✏️
                                            </button>
                                            <button
                                                className={`btn btn-sm ${item.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                                onClick={() => handleToggleActive(item)}
                                                title={item.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {item.isActive ? '🚫' : '✅'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Modal ── */}
            {showModal && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editId ? 'Edit' : 'Add'} Customer / Vendor</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="row g-3">
                                    {/* Type */}
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold">Type <span className="text-danger">*</span></label>
                                        <select className="form-select" value={form.type} onChange={e => handleFormChange('type', e.target.value)}>
                                            <option value="Customer">Customer</option>
                                            <option value="Vendor">Vendor</option>
                                        </select>
                                    </div>
                                    {/* Name */}
                                    <div className="col-md-8">
                                        <label className="form-label fw-bold">Name <span className="text-danger">*</span></label>
                                        <input
                                            className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                                            value={form.name}
                                            onChange={e => handleFormChange('name', e.target.value)}
                                            placeholder="Full name or company name"
                                        />
                                        {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                                    </div>
                                    {/* Mobile */}
                                    <div className="col-md-4">
                                        <label className="form-label">Mobile</label>
                                        <input
                                            className={`form-control ${formErrors.mobile ? 'is-invalid' : ''}`}
                                            value={form.mobile}
                                            onChange={e => handleFormChange('mobile', e.target.value)}
                                            placeholder="10-digit number"
                                            maxLength={10}
                                        />
                                        {formErrors.mobile && <div className="invalid-feedback">{formErrors.mobile}</div>}
                                    </div>
                                    {/* Email */}
                                    <div className="col-md-4">
                                        <label className="form-label">Email</label>
                                        <input className="form-control" type="email" value={form.email} onChange={e => handleFormChange('email', e.target.value)} placeholder="email@example.com" />
                                    </div>
                                    {/* GSTIN */}
                                    <div className="col-md-4">
                                        <label className="form-label">GSTIN</label>
                                        <input
                                            className={`form-control ${formErrors.gstin ? 'is-invalid' : ''}`}
                                            value={form.gstin}
                                            onChange={e => handleFormChange('gstin', e.target.value.toUpperCase())}
                                            placeholder="22AAAAA0000A1Z5"
                                            maxLength={15}
                                        />
                                        {formErrors.gstin && <div className="invalid-feedback">{formErrors.gstin}</div>}
                                    </div>
                                    {/* Address */}
                                    <div className="col-12">
                                        <label className="form-label">Address</label>
                                        <input className="form-control" value={form.address} onChange={e => handleFormChange('address', e.target.value)} placeholder="Street / Building / Area" />
                                    </div>
                                    {/* City */}
                                    <div className="col-md-4">
                                        <label className="form-label">City</label>
                                        <input className="form-control" value={form.city} onChange={e => handleFormChange('city', e.target.value)} />
                                    </div>
                                    {/* State */}
                                    <div className="col-md-4">
                                        <label className="form-label">State</label>
                                        <select className="form-select" value={form.state} onChange={e => handleFormChange('state', e.target.value)}>
                                            <option value="">Select state…</option>
                                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    {/* Pincode */}
                                    <div className="col-md-4">
                                        <label className="form-label">Pincode</label>
                                        <input className="form-control" value={form.pincode} onChange={e => handleFormChange('pincode', e.target.value)} placeholder="6-digit pincode" maxLength={6} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                    {saving ? <><span className="spinner-border spinner-border-sm me-1" />Saving…</> : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerMaster;
