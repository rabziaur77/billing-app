/**
 * validationUtils.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Unit tests for all validation helpers.
 * These are critical for a financial / GST system — invalid GSTINs or
 * overpayments must be caught before data reaches the backend.
 */
import { describe, it, expect } from 'vitest';
import {
    validateGstin,
    validateMobile,
    gstinError,
    mobileError,
    amountError,
    overpaymentError,
    GSTIN_REGEX,
    MOBILE_REGEX,
} from '../../utils/validationUtils';

// ── validateGstin ─────────────────────────────────────────────────────────────
describe('validateGstin', () => {
    it('accepts a valid GSTIN', () => {
        expect(validateGstin('22AAAAA0000A1Z5')).toBe(true);
        expect(validateGstin('27AAPFU0939F1ZV')).toBe(true);
        expect(validateGstin('07AAGCM8702N1ZN')).toBe(true);
    });

    it('accepts empty string (field is optional)', () => {
        expect(validateGstin('')).toBe(true);
        expect(validateGstin('  ')).toBe(true);
    });

    it('rejects a GSTIN that is too short', () => {
        expect(validateGstin('22AAAAA0000A1Z')).toBe(false);
    });

    it('rejects a GSTIN with wrong character types', () => {
        expect(validateGstin('22aaaaa0000a1z5')).toBe(false); // lowercase
        expect(validateGstin('ZZAAAAA0000A1Z5')).toBe(false); // non-digit state code
        expect(validateGstin('22AAAAA0000A0Z5')).toBe(false); // 0 in position 13
    });

    it('rejects a GSTIN longer than 15 characters', () => {
        expect(validateGstin('22AAAAA0000A1Z5X')).toBe(false);
    });

    it('GSTIN_REGEX test is consistent with validateGstin', () => {
        expect(GSTIN_REGEX.test('22AAAAA0000A1Z5')).toBe(true);
        expect(GSTIN_REGEX.test('invalid')).toBe(false);
    });
});

// ── validateMobile ────────────────────────────────────────────────────────────
describe('validateMobile', () => {
    it('accepts a valid 10-digit number', () => {
        expect(validateMobile('9876543210')).toBe(true);
        expect(validateMobile('1234567890')).toBe(true);
    });

    it('accepts empty string (field is optional)', () => {
        expect(validateMobile('')).toBe(true);
        expect(validateMobile('  ')).toBe(true);
    });

    it('rejects numbers shorter than 10 digits', () => {
        expect(validateMobile('98765432')).toBe(false);
    });

    it('rejects numbers longer than 10 digits', () => {
        expect(validateMobile('98765432101')).toBe(false);
    });

    it('rejects non-digit characters', () => {
        expect(validateMobile('987654321A')).toBe(false);
        expect(validateMobile('+9876543210')).toBe(false);
        expect(validateMobile('98-7654-3210')).toBe(false);
    });

    it('MOBILE_REGEX is consistent with validateMobile', () => {
        expect(MOBILE_REGEX.test('9876543210')).toBe(true);
        expect(MOBILE_REGEX.test('12345')).toBe(false);
    });
});

// ── gstinError / mobileError ──────────────────────────────────────────────────
describe('gstinError', () => {
    it('returns null for valid GSTIN', () => {
        expect(gstinError('22AAAAA0000A1Z5')).toBeNull();
    });
    it('returns null for empty string', () => {
        expect(gstinError('')).toBeNull();
    });
    it('returns error message for invalid GSTIN', () => {
        expect(gstinError('invalid')).not.toBeNull();
        expect(typeof gstinError('invalid')).toBe('string');
    });
});

describe('mobileError', () => {
    it('returns null for valid mobile', () => {
        expect(mobileError('9876543210')).toBeNull();
    });
    it('returns null for empty string', () => {
        expect(mobileError('')).toBeNull();
    });
    it('returns error message for invalid mobile', () => {
        const err = mobileError('12345');
        expect(err).not.toBeNull();
        expect(err).toContain('10 digits');
    });
});

// ── amountError ───────────────────────────────────────────────────────────────
describe('amountError', () => {
    it('returns null for positive amounts', () => {
        expect(amountError(1)).toBeNull();
        expect(amountError(0.01)).toBeNull();
        expect(amountError(99999)).toBeNull();
    });

    it('returns error for zero', () => {
        expect(amountError(0)).not.toBeNull();
    });

    it('returns error for negative amounts', () => {
        expect(amountError(-100)).not.toBeNull();
        expect(amountError(-0.01)).not.toBeNull();
    });
});

// ── overpaymentError ──────────────────────────────────────────────────────────
describe('overpaymentError', () => {
    it('returns null when payment equals balance due exactly', () => {
        expect(overpaymentError(500, 500)).toBeNull();
    });

    it('returns null when payment is less than balance due', () => {
        expect(overpaymentError(200, 500)).toBeNull();
        expect(overpaymentError(0.01, 500)).toBeNull();
    });

    it('returns null when balance due is already zero (invoice paid)', () => {
        // If balanceDue is 0, nothing more can be owed — guard handled elsewhere
        expect(overpaymentError(100, 0)).toBeNull();
    });

    it('returns error when payment exceeds balance due', () => {
        const err = overpaymentError(600, 500);
        expect(err).not.toBeNull();
        expect(err).toContain('500.00');
        expect(err).toContain('600.00');
    });

    it('allows tiny floating-point tolerance (0.005)', () => {
        // ₹500.004 is within tolerance — should not be treated as overpayment
        expect(overpaymentError(500.004, 500)).toBeNull();
        // ₹500.006 exceeds tolerance
        expect(overpaymentError(500.006, 500)).not.toBeNull();
    });
});
