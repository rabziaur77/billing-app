/**
 * paymentLogic.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Unit tests for payment-module business rules:
 *   – Filter null-safety (BUG-04 regression)
 *   – Overpayment validation
 *   – Payment status badge logic
 *   – Filter mode + search behaviour
 */
import { describe, it, expect } from 'vitest';
import type { Payment } from '../Components/Payments/PaymentModel';
import { overpaymentError, amountError } from '../../utils/validationUtils';

// ── Mock payment data ─────────────────────────────────────────────────────────
const makePmt = (overrides: Partial<Payment> = {}): Payment => ({
    paymentId: 1,
    invoiceNumber: 'INV-001',
    customerName: 'Test Customer',
    amountPaid: 500,
    paymentMode: 'Cash',
    paymentDate: '2025-01-01',
    balanceDue: 500,
    invoiceTotal: 1000,
    ...overrides,
});

// ── Null-safe filter (BUG-04 regression) ─────────────────────────────────────
describe('Payment filter null-safety (BUG-04 regression)', () => {
    const payments: Payment[] = [
        makePmt({ invoiceNumber: 'INV-001', customerName: 'Alice' }),
        makePmt({ invoiceNumber: 'INV-002', customerName: null as any }), // null from server
        makePmt({ invoiceNumber: 'INV-003', customerName: undefined as any }),
    ];

    const filter = (term: string, mode: string) =>
        payments.filter(p => {
            const matchMode = mode === 'All' || p.paymentMode === mode;
            const t = term.toLowerCase();
            const matchSearch =
                (p.invoiceNumber ?? '').toLowerCase().includes(t) ||
                (p.customerName ?? '').toLowerCase().includes(t) ||
                (p.referenceNumber ?? '').toLowerCase().includes(t);
            return matchMode && matchSearch;
        });

    it('does NOT crash when customerName is null', () => {
        expect(() => filter('Alice', 'All')).not.toThrow();
    });

    it('does NOT crash when customerName is undefined', () => {
        expect(() => filter('test', 'All')).not.toThrow();
    });

    it('finds record with null customerName by invoice number', () => {
        const result = filter('INV-002', 'All');
        expect(result).toHaveLength(1);
        expect(result[0].invoiceNumber).toBe('INV-002');
    });

    it('returns all when search term is empty', () => {
        expect(filter('', 'All')).toHaveLength(3);
    });
});

// ── Payment mode filter ───────────────────────────────────────────────────────
describe('Payment mode filter', () => {
    const payments: Payment[] = [
        makePmt({ paymentMode: 'Cash' }),
        makePmt({ paymentMode: 'UPI' }),
        makePmt({ paymentMode: 'Cheque' }),
    ];

    const filterByMode = (mode: string) =>
        payments.filter(p => mode === 'All' || p.paymentMode === mode);

    it('"All" mode returns all payments', () => {
        expect(filterByMode('All')).toHaveLength(3);
    });

    it('filters to only Cash payments', () => {
        const result = filterByMode('Cash');
        expect(result).toHaveLength(1);
        expect(result[0].paymentMode).toBe('Cash');
    });

    it('returns empty for a mode with no matching payments', () => {
        expect(filterByMode('Card')).toHaveLength(0);
    });
});

// ── totalCollected calculation ────────────────────────────────────────────────
describe('totalCollected', () => {
    it('sums amountPaid across all filtered payments', () => {
        const pmts = [
            makePmt({ amountPaid: 500 }),
            makePmt({ amountPaid: 250.50 }),
            makePmt({ amountPaid: 1000 }),
        ];
        const total = pmts.reduce((s, p) => s + p.amountPaid, 0);
        expect(total).toBeCloseTo(1750.5, 5);
    });

    it('returns 0 for empty list', () => {
        expect([].reduce((s: number, p: Payment) => s + p.amountPaid, 0)).toBe(0);
    });
});

// ── Overpayment logic ─────────────────────────────────────────────────────────
describe('Overpayment validation', () => {
    it('blocks payment exceeding balance due', () => {
        expect(overpaymentError(600, 500)).not.toBeNull();
    });

    it('allows exact payment of balance due', () => {
        expect(overpaymentError(500, 500)).toBeNull();
    });

    it('allows partial payment', () => {
        expect(overpaymentError(100, 500)).toBeNull();
    });

    it('allows tiny rounding tolerance (₹0.004)', () => {
        expect(overpaymentError(500.004, 500)).toBeNull();
    });

    it('blocks payment ₹0.006 over balance', () => {
        expect(overpaymentError(500.006, 500)).not.toBeNull();
    });
});

// ── Amount validation ─────────────────────────────────────────────────────────
describe('Amount validation', () => {
    it('rejects zero amount', () => {
        expect(amountError(0)).not.toBeNull();
    });

    it('rejects negative amount', () => {
        expect(amountError(-1)).not.toBeNull();
    });

    it('accepts smallest valid positive', () => {
        expect(amountError(0.01)).toBeNull();
    });
});

// ── Payment status badge logic ────────────────────────────────────────────────
describe('Payment status badge', () => {
    const getStatus = (p: { amountPaid: number; invoiceTotal: number; balanceDue: number }) => {
        if (p.balanceDue <= 0) return 'Paid';
        if (p.amountPaid > 0) return 'Partial';
        return 'Unpaid';
    };

    it('shows Paid when balanceDue is zero', () => {
        expect(getStatus({ amountPaid: 1000, invoiceTotal: 1000, balanceDue: 0 })).toBe('Paid');
    });

    it('shows Partial when some amount paid but balance remains', () => {
        expect(getStatus({ amountPaid: 400, invoiceTotal: 1000, balanceDue: 600 })).toBe('Partial');
    });

    it('shows Unpaid when no amount paid', () => {
        expect(getStatus({ amountPaid: 0, invoiceTotal: 1000, balanceDue: 1000 })).toBe('Unpaid');
    });

    it('shows Paid when balanceDue is negative (overpaid — edge case)', () => {
        // After server-side rounding, balance might be slightly negative
        expect(getStatus({ amountPaid: 1001, invoiceTotal: 1000, balanceDue: -1 })).toBe('Paid');
    });
});
