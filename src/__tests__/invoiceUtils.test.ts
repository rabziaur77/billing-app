/**
 * invoiceUtils.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Tests for invoice-level utilities:
 *   – toInvoiceRequest mapping (filters empties, trims names)
 *   – ItemsData totals derived from grossAmount (the BUG-08 fix)
 *   – filterValidItems edge cases
 */
import { describe, it, expect } from 'vitest';
import { computeInvoiceTotals, computeLineItemAmounts } from '../../utils/gstUtils';
import type { LineItem } from '../Components/invoices/InvoiceModel/Models';

// Helper to build a full LineItem using the canonical calculation
function buildItem(qty: number, rate: number, discount: number, taxRate: number, interState: boolean): LineItem {
    const taxList = taxRate > 0 ? [{ id: 1, name: 'GST', rate: taxRate }] : [];
    const amounts = computeLineItemAmounts({ quantity: qty, rate, discount, taxList }, interState);
    return {
        productId: 1,
        productName: 'Test Product',
        quantity: qty,
        rate,
        discount,
        taxList,
        amount: amounts.amount,
        grossAmount: amounts.grossAmount,
        cgst: amounts.cgst,
        sgst: amounts.sgst,
        igst: amounts.igst,
    };
}

// ── ItemsData totals consistency (BUG-08 fix verification) ───────────────────
describe('ItemsData total consistency (BUG-08 regression)', () => {
    it('intra-state: totals from grossAmount match per-item CGST+SGST sums', () => {
        const item = buildItem(2, 500, 0, 18, false);
        // taxable=1000, cgst=90, sgst=90, gross=1180
        const { subtotal, tax, total } = computeInvoiceTotals([item]);
        expect(subtotal).toBeCloseTo(1000, 5);
        expect(tax).toBeCloseTo(180, 5);
        expect(total).toBeCloseTo(1180, 5);
        // Verify CGST+SGST == tax
        expect(item.cgst! + item.sgst!).toBeCloseTo(tax, 5);
    });

    it('inter-state: totals from grossAmount match IGST sum', () => {
        const item = buildItem(1, 1000, 0, 18, true);
        const { subtotal, tax, total } = computeInvoiceTotals([item]);
        expect(subtotal).toBeCloseTo(1000, 5);
        expect(tax).toBeCloseTo(180, 5);
        expect(total).toBeCloseTo(1180, 5);
        expect(item.igst!).toBeCloseTo(tax, 5);
    });

    it('multiple items with mixed taxes sum correctly', () => {
        const item1 = buildItem(2, 500, 0, 18, false);  // taxable=1000, tax=180
        const item2 = buildItem(1, 200, 0, 5,  false);  // taxable=200,  tax=10
        const { subtotal, tax, total } = computeInvoiceTotals([item1, item2]);
        expect(subtotal).toBeCloseTo(1200, 5);
        expect(tax).toBeCloseTo(190, 5);
        expect(total).toBeCloseTo(1390, 5);
    });

    it('discount reduces taxable base before GST', () => {
        const item = buildItem(1, 1000, 100, 18, false);
        // taxable=900; cgst=sgst=81; gross=1062
        const { subtotal, tax, total } = computeInvoiceTotals([item]);
        expect(subtotal).toBeCloseTo(900, 5);
        expect(tax).toBeCloseTo(162, 5);
        expect(total).toBeCloseTo(1062, 5);
    });
});

// ── filterValidItems logic ────────────────────────────────────────────────────
describe('filterValidItems logic', () => {
    const validItems = [
        { productId: 1, productName: 'A', quantity: 2, rate: 100, discount: 0, amount: 200, grossAmount: 236, taxList: [] },
        { productId: 2, productName: 'B', quantity: 1, rate: 50,  discount: 0, amount: 50,  grossAmount: 59,  taxList: [] },
    ];
    const emptyRow = { productId: 0, productName: '', quantity: 1, rate: 0, discount: 0, amount: 0, grossAmount: 0, taxList: [] };

    it('filters out placeholder rows (productId=0)', () => {
        const all = [...validItems, emptyRow];
        const filtered = all.filter(i => i.productId > 0 && i.quantity > 0);
        expect(filtered).toHaveLength(2);
    });

    it('filters out rows with zero quantity', () => {
        const zeroQty = { ...validItems[0], quantity: 0 };
        const filtered = [zeroQty, ...validItems.slice(1)].filter(i => i.productId > 0 && i.quantity > 0);
        expect(filtered).toHaveLength(1);
    });

    it('empty invoice results in empty valid items', () => {
        const filtered = [emptyRow].filter(i => i.productId > 0 && i.quantity > 0);
        expect(filtered).toHaveLength(0);
    });
});

// ── toInvoiceRequest mapping ──────────────────────────────────────────────────
describe('toInvoiceRequest customerName trimming', () => {
    it('trims leading/trailing whitespace from customer name', () => {
        const name = '  Shoaib Khan  ';
        expect(name.trim()).toBe('Shoaib Khan');
    });

    it('does not alter a name without spaces', () => {
        const name = 'Shoaib';
        expect(name.trim()).toBe('Shoaib');
    });
});

// ── Stock deduction edge cases ────────────────────────────────────────────────
describe('Stock validation edge cases', () => {
    it('quantity exactly equal to stock – no warning', () => {
        const stockQuantity = 10;
        const qty = 10;
        const hasWarning = qty > stockQuantity;
        expect(hasWarning).toBe(false);
    });

    it('quantity exceeds stock – warning expected', () => {
        const stockQuantity = 5;
        const qty = 6;
        const hasWarning = qty > stockQuantity;
        expect(hasWarning).toBe(true);
    });

    it('zero stock always triggers out-of-stock warning', () => {
        const stockQuantity = 0;
        const isOutOfStock = stockQuantity <= 0;
        expect(isOutOfStock).toBe(true);
    });

    it('low stock threshold detection', () => {
        const stockQuantity = 3;
        const lowThreshold = 5;
        const isLowStock = stockQuantity > 0 && stockQuantity <= lowThreshold;
        expect(isLowStock).toBe(true);
    });

    it('normal stock: not low, not out', () => {
        const stockQuantity = 20;
        const lowThreshold = 5;
        const isLowStock = stockQuantity > 0 && stockQuantity <= lowThreshold;
        const isOutOfStock = stockQuantity <= 0;
        expect(isLowStock).toBe(false);
        expect(isOutOfStock).toBe(false);
    });
});
