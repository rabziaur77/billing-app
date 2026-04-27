/**
 * validationUtils.ts
 * Pure validation helpers — deterministic, side-effect-free, fully unit-testable.
 */

/** Standard 15-character GST Identification Number pattern. */
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/** Indian 10-digit mobile number. */
export const MOBILE_REGEX = /^\d{10}$/;

/**
 * Validates GSTIN format.
 * Returns true for empty strings (field is optional) or valid 15-char GSTINs.
 */
export function validateGstin(gstin: string): boolean {
    if (!gstin || gstin.trim() === '') return true; // optional
    return GSTIN_REGEX.test(gstin.trim().toUpperCase());
}

/**
 * Validates Indian mobile number.
 * Returns true for empty strings (field is optional) or valid 10-digit numbers.
 */
export function validateMobile(mobile: string): boolean {
    if (!mobile || mobile.trim() === '') return true; // optional
    return MOBILE_REGEX.test(mobile.trim());
}

/** Returns a human-readable error message for an invalid GSTIN, or null if valid. */
export function gstinError(gstin: string): string | null {
    if (validateGstin(gstin)) return null;
    return 'GSTIN must be 15 characters in format 22AAAAA0000A1Z5';
}

/** Returns a human-readable error message for an invalid mobile, or null if valid. */
export function mobileError(mobile: string): string | null {
    if (validateMobile(mobile)) return null;
    return 'Mobile number must be exactly 10 digits';
}

/** Returns an error string for an amount that must be a positive number. */
export function amountError(amount: number): string | null {
    if (amount > 0) return null;
    return 'Amount must be greater than zero';
}

/** Returns an error string if amountPaid would exceed balanceDue (overpayment). */
export function overpaymentError(amountPaid: number, balanceDue: number): string | null {
    if (balanceDue <= 0) return null; // already paid – guard handled elsewhere
    if (amountPaid > balanceDue + 0.005) {
        return `Amount (₹${amountPaid.toFixed(2)}) exceeds balance due (₹${balanceDue.toFixed(2)}). Overpayments are not allowed.`;
    }
    return null;
}
