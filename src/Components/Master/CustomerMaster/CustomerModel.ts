export interface CustomerVendor {
    id: number;
    type: 'Customer' | 'Vendor';
    name: string;
    mobile: string;
    email: string;
    gstin: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    isActive: boolean;
}

export interface SaveCustomerVendorRequest {
    type: 'Customer' | 'Vendor';
    name: string;
    mobile: string;
    email: string;
    gstin: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
}
