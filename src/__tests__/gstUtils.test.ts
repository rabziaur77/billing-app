/**
 * gstUtils.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Unit tests for pure GST calculation functions.
 * Critical: any regression here means invoices will show wrong tax amounts.
 */
import { describe, it, expect } from 'vitest';
import {
    checkIsInterState,
    computeGstBreakdown,
    computeLineItemAmounts,
    computeInvoiceTotals,
    buildGstSummary,
} from '../../utils/gstUtils';

// ── checkIsInterState ─────────────────────────────────────────────────────────
describe('checkIsInterState', () => {
    it('returns false when both states are the same (case-insensitive)', () => {
        expect(checkIsInterState('Maharashtra', 'Maharashtra')).toBe(false);
        expect(checkIsInterState('maharashtra', 'MAHARASHTRA')).toBe(false);
        expect(checkIsInterState('  Maharashtra  ', 'Maharashtra')).toBe(false);
    });

    it('returns true when states differ', () => {
        expect(checkIsInterState('Maharashtra', 'Gujarat')).toBe(true);
        expect(checkIsInterState('Delhi', 'Kerala')).toBe(true);
    });

    it('returns false when either state is empty (cannot determine)', () => {
        expect(checkIsInterState('', 'Gujarat')).toBe(false);
        expect(checkIsInterState('Maharashtra', '')).toBe(false);
        expect(checkIsInterState('', '')).toBe(false);
    });
});

// ── computeGstBreakdown ───────────────────────────────────────────────────────
describe('computeGstBreakdown', () => {
    describe('intra-state (CGST + SGST)', () => {
        it('splits tax equally between CGST and SGST', () => {
            const result = computeGstBreakdown(18, 1000, false);
            expect(result.cgst).toBeCloseTo(90, 5);
            expect(result.sgst).toBeCloseTo(90, 5);
            expect(result.igst).toBe(0);
        });

        it('5% rate: CGST=2.5%, SGST=2.5%', () => {
            const result = computeGstBreakdown(5, 200, false);
            expect(result.cgst).toBeCloseTo(5, 5);
            expect(result.sgst).toBeCloseTo(5, 5);
            expect(result.igst).toBe(0);
        });

        it('28% rate on ₹500: CGST=70, SGST=70', () => {
            const result = computeGstBreakdown(28, 500, false);
            expect(result.cgst).toBeCloseTo(70, 5);
            expect(result.sgst).toBeCloseTo(70, 5);
        });
    });

    describe('inter-state (IGST)', () => {
        it('applies full rate as IGST, no CGST/SGST', () => {
            const result = computeGstBreakdown(18, 1000, true);
            expect(result.igst).toBeCloseTo(180, 5);
            expect(result.cgst).toBe(0);
            expect(result.sgst).toBe(0);
        });

        it('12% rate on ₹250: IGST=30', () => {
            const result = computeGstBreakdown(12, 250, true);
            expect(result.igst).toBeCloseTo(30, 5);
        });
    });

    describe('edge cases', () => {
        it('returns zeros for zero taxable amount', () => {
            const result = computeGstBreakdown(18, 0, false);
            expect(result).toEqual({ cgst: 0, sgst: 0, igst: 0 });
        });

        it('returns zeros for zero tax rate', () => {
            const result = computeGstBreakdown(0, 1000, false);
            expect(result).toEqual({ cgst: 0, sgst: 0, igst: 0 });
        });

        it('returns zeros for negative taxable amount', () => {
            const result = computeGstBreakdown(18, -100, false);
            expect(result).toEqual({ cgst: 0, sgst: 0, igst: 0 });
        });
    });
});

// ── computeLineItemAmounts ────────────────────────────────────────────────────
describe('computeLineItemAmounts', () => {
    const singleTaxItem = {
        quantity: 2,
        rate: 500,
        discount: 0,
        taxList: [{ id: 1, name: 'GST', rate: 18 }],
    };

    it('intra-state: taxable=1000, CGST=90, SGST=90, gross=1180', () => {
        const result = computeLineItemAmounts(singleTaxItem, false);
        expect(result.amount).toBeCloseTo(1000, 5);
        expect(result.cgst).toBeCloseTo(90, 5);
        expect(result.sgst).toBeCloseTo(90, 5);
        expect(result.igst).toBe(0);
        expect(result.grossAmount).toBeCloseTo(1180, 5);
    });

    it('inter-state: IGST=180, gross=1180', () => {
        const result = computeLineItemAmounts(singleTaxItem, true);
        expect(result.igst).toBeCloseTo(180, 5);
        expect(result.cgst).toBe(0);
        expect(result.sgst).toBe(0);
        expect(result.grossAmount).toBeCloseTo(1180, 5);
    });

    it('applies discount before tax', () => {
        const item = { quantity: 1, rate: 1000, discount: 100, taxList: [{ id: 1, name: 'GST', rate: 18 }] };
        const result = computeLineItemAmounts(item, false);
        // taxable = 1000 - 100 = 900; cgst=sgst= 900*9% = 81
        expect(result.amount).toBeCloseTo(900, 5);
        expect(result.cgst).toBeCloseTo(81, 5);
        expect(result.grossAmount).toBeCloseTo(900 + 81 + 81, 5);
    });

    it('multiple taxes: rate 5% + 12%', () => {
        const item = {
            quantity: 1, rate: 1000, discount: 0,
            taxList: [
                { id: 1, name: 'CGST5', rate: 5 },
                { id: 2, name: 'CESS', rate: 12 },
            ],
        };
        const result = computeLineItemAmounts(item, false);
        // 5% intra: cgst=25 sgst=25 ; 12% intra: cgst=60 sgst=60
        expect(result.cgst).toBeCloseTo(25 + 60, 5);
        expect(result.sgst).toBeCloseTo(25 + 60, 5);
        expect(result.grossAmount).toBeCloseTo(1000 + 85 + 85, 5);
    });

    it('zero quantity results in zero amounts', () => {
        const item = { quantity: 0, rate: 500, discount: 0, taxList: [{ id: 1, name: 'GST', rate: 18 }] };
        const result = computeLineItemAmounts(item, false);
        expect(result.amount).toBe(0);
        expect(result.grossAmount).toBe(0);
    });

    it('discount cannot make amount negative', () => {
        const item = { quantity: 1, rate: 50, discount: 100, taxList: [] };
        const result = computeLineItemAmounts(item, false);
        expect(result.amount).toBe(0);
        expect(result.grossAmount).toBe(0);
    });

    it('no taxes: grossAmount equals taxable amount', () => {
        const item = { quantity: 3, rate: 200, discount: 0, taxList: [] };
        const result = computeLineItemAmounts(item, false);
        expect(result.amount).toBe(600);
        expect(result.grossAmount).toBe(600);
        expect(result.cgst).toBe(0);
    });
});

// ── computeInvoiceTotals ──────────────────────────────────────────────────────
describe('computeInvoiceTotals', () => {
    it('correctly sums subtotal and derives tax from grossAmount', () => {
        const items = [
            { amount: 1000, grossAmount: 1180 },  // tax = 180
            { amount: 500,  grossAmount: 560  },  // tax = 60
        ];
        const result = computeInvoiceTotals(items);
        expect(result.subtotal).toBeCloseTo(1500, 5);
        expect(result.tax).toBeCloseTo(240, 5);
        expect(result.total).toBeCloseTo(1740, 5);
    });

    it('empty items returns zeros', () => {
        const result = computeInvoiceTotals([]);
        expect(result).toEqual({ subtotal: 0, tax: 0, total: 0 });
    });

    it('items with no tax: tax=0, total=subtotal', () => {
        const items = [{ amount: 200, grossAmount: 200 }, { amount: 300, grossAmount: 300 }];
        const result = computeInvoiceTotals(items);
        expect(result.subtotal).toBe(500);
        expect(result.tax).toBe(0);
        expect(result.total).toBe(500);
    });
});

// ── buildGstSummary ───────────────────────────────────────────────────────────
describe('buildGstSummary', () => {
    it('groups items by tax rate and computes per-rate CGST/SGST', () => {
        const items = [
            { amount: 1000, taxList: [{ id: 1, name: 'GST18', rate: 18 }] },
            { amount: 500,  taxList: [{ id: 1, name: 'GST18', rate: 18 }] },
        ];
        const rows = buildGstSummary(items, false);
        expect(rows).toHaveLength(1);
        expect(rows[0].rate).toBe(18);
        expect(rows[0].taxable).toBeCloseTo(1500, 5);
        expect(rows[0].cgst).toBeCloseTo((1500 * 18) / 200, 5);
        expect(rows[0].sgst).toBeCloseTo((1500 * 18) / 200, 5);
        expect(rows[0].igst).toBe(0);
    });

    it('separates different tax rates into different rows', () => {
        const items = [
            { amount: 1000, taxList: [{ id: 1, name: 'GST5', rate: 5 }] },
            { amount: 2000, taxList: [{ id: 2, name: 'GST18', rate: 18 }] },
        ];
        const rows = buildGstSummary(items, false);
        expect(rows).toHaveLength(2);
    });

    it('inter-state: all tax goes to IGST', () => {
        const items = [{ amount: 1000, taxList: [{ id: 1, name: 'GST18', rate: 18 }] }];
        const rows = buildGstSummary(items, true);
        expect(rows[0].igst).toBeCloseTo(180, 5);
        expect(rows[0].cgst).toBe(0);
    });
});
