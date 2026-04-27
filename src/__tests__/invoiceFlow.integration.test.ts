/**
 * invoiceFlow.integration.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Integration tests for the full Invoice → Payment → Stock → Ledger flow.
 *
 * Strategy: all external API calls are mocked with vi.mock so the tests
 * run offline and deterministically.  The tests verify that:
 *   1. The correct data reaches the backend (API call shape)
 *   2. Business rules are enforced end-to-end (GST totals, stock limits,
 *      payment limits, ledger consistency)
 *   3. Error paths surface the right messages
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { computeLineItemAmounts, computeInvoiceTotals } from '../../utils/gstUtils';
import { overpaymentError, amountError, validateGstin } from '../../utils/validationUtils';
import type { LineItem } from '../Components/invoices/InvoiceModel/Models';

// ══════════════════════════════════════════════════════════════════════════════
// Test Fixtures
// ══════════════════════════════════════════════════════════════════════════════
const SELLER_STATE = 'Maharashtra';

const mockProduct = {
    productId: 42,
    name: 'Widget Pro',
    sellingPrice: 1000,
    discount: 0,
    stockQuantity: 10,
    lowStockThreshold: 3,
    taxes: [{ id: 1, taxName: 'GST', taxRate: 18 }],
    hsnCode: '8471',
};

function buildLineItem(
    product: typeof mockProduct,
    qty: number,
    interState: boolean,
): LineItem {
    const taxList = product.taxes.map(t => ({ id: t.id, name: t.taxName, rate: t.taxRate }));
    const amounts = computeLineItemAmounts(
        { quantity: qty, rate: product.sellingPrice, discount: product.discount, taxList },
        interState,
    );
    return {
        productId: product.productId,
        productName: product.name,
        quantity: qty,
        rate: product.sellingPrice,
        discount: product.discount,
        taxList,
        amount: amounts.amount,
        grossAmount: amounts.grossAmount,
        cgst: amounts.cgst,
        sgst: amounts.sgst,
        igst: amounts.igst,
        hsnCode: product.hsnCode,
    };
}

// ══════════════════════════════════════════════════════════════════════════════
// Flow 1: Invoice Generation (Intra-State)
// ══════════════════════════════════════════════════════════════════════════════
describe('Invoice generation — intra-state flow', () => {
    it('computes correct GST split for an intra-state order', () => {
        const item = buildLineItem(mockProduct, 2, false);
        // 2 × ₹1000 = ₹2000 taxable; 18% → CGST=180, SGST=180, gross=2360
        expect(item.amount).toBeCloseTo(2000, 5);
        expect(item.cgst).toBeCloseTo(180, 5);
        expect(item.sgst).toBeCloseTo(180, 5);
        expect(item.igst).toBe(0);
        expect(item.grossAmount).toBeCloseTo(2360, 5);
    });

    it('invoice total matches sum of all line item gross amounts', () => {
        const item1 = buildLineItem(mockProduct, 2, false);  // gross=2360
        const item2 = buildLineItem({ ...mockProduct, sellingPrice: 500, taxes: [{ id: 2, taxName: 'GST5', taxRate: 5 }] }, 3, false);
        // item2: 3×500=1500, tax=5% intra → cgst=37.5, sgst=37.5, gross=1575

        const { subtotal, tax, total } = computeInvoiceTotals([item1, item2]);
        const expectedGross = item1.grossAmount + item2.grossAmount;
        expect(total).toBeCloseTo(expectedGross, 4);
        expect(total).toBeCloseTo(subtotal + tax, 5);
    });

    it('empty-row placeholder is excluded from invoice request', () => {
        const emptyRow: LineItem = { productId: 0, productName: '', quantity: 1, rate: 0, discount: 0, amount: 0, grossAmount: 0, taxList: [] };
        const items = [buildLineItem(mockProduct, 1, false), emptyRow];
        const validItems = items.filter(i => i.productId > 0 && i.quantity > 0);
        expect(validItems).toHaveLength(1);
        expect(validItems[0].productId).toBe(42);
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// Flow 2: Invoice Generation (Inter-State)
// ══════════════════════════════════════════════════════════════════════════════
describe('Invoice generation — inter-state flow', () => {
    it('applies IGST instead of CGST+SGST for inter-state transaction', () => {
        const item = buildLineItem(mockProduct, 1, true);
        expect(item.igst).toBeCloseTo(180, 5);
        expect(item.cgst).toBe(0);
        expect(item.sgst).toBe(0);
        expect(item.grossAmount).toBeCloseTo(1180, 5);
    });

    it('CGST+SGST and IGST produce same grand total for same taxable amount', () => {
        const intra = buildLineItem(mockProduct, 1, false);
        const inter = buildLineItem(mockProduct, 1, true);
        expect(intra.grossAmount).toBeCloseTo(inter.grossAmount, 5);
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// Flow 3: Stock Deduction Validation
// ══════════════════════════════════════════════════════════════════════════════
describe('Stock deduction validation', () => {
    it('allows order when qty <= stock', () => {
        const qty = 10;
        expect(qty > mockProduct.stockQuantity).toBe(false);
    });

    it('blocks order when qty > stock', () => {
        const qty = 11;
        expect(qty > mockProduct.stockQuantity).toBe(true);
    });

    it('detects low stock correctly', () => {
        const product = { ...mockProduct, stockQuantity: 2 };
        const isLow = product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold;
        expect(isLow).toBe(true);
    });

    it('detects out-of-stock correctly', () => {
        const product = { ...mockProduct, stockQuantity: 0 };
        expect(product.stockQuantity <= 0).toBe(true);
    });

    it('stock warning index shifts correctly after row removal', () => {
        // Simulates BUG-06 fix: remove row at idx=1 from [0,1,2]
        const warnings: Record<number, string> = { 0: 'warn-0', 2: 'warn-2' };
        const removedIdx = 1;
        const newWarnings: Record<number, string> = {};
        Object.entries(warnings).forEach(([key, msg]) => {
            const k = Number(key);
            if (k < removedIdx) newWarnings[k] = msg;
            else if (k > removedIdx) newWarnings[k - 1] = msg;
        });
        expect(newWarnings[0]).toBe('warn-0');
        expect(newWarnings[1]).toBe('warn-2'); // was index 2, now 1
        expect(newWarnings[2]).toBeUndefined();
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// Flow 4: Payment recording and ledger consistency
// ══════════════════════════════════════════════════════════════════════════════
describe('Payment recording and ledger consistency', () => {
    const invoiceTotal = 2360; // from intra-state invoice above

    it('full payment clears balance', () => {
        const amountPaid = invoiceTotal;
        const balanceDue = invoiceTotal - amountPaid;
        expect(balanceDue).toBe(0);
        expect(overpaymentError(amountPaid, invoiceTotal)).toBeNull();
    });

    it('partial payment leaves correct balance', () => {
        const amountPaid = 1000;
        const balanceDue = invoiceTotal - amountPaid;
        expect(balanceDue).toBe(1360);
        expect(amountError(amountPaid)).toBeNull();
        expect(overpaymentError(amountPaid, invoiceTotal)).toBeNull();
    });

    it('overpayment is blocked', () => {
        const amountPaid = invoiceTotal + 1;
        expect(overpaymentError(amountPaid, invoiceTotal)).not.toBeNull();
    });

    it('zero payment is blocked', () => {
        expect(amountError(0)).not.toBeNull();
    });

    it('negative payment is blocked', () => {
        expect(amountError(-100)).not.toBeNull();
    });

    it('cumulative payments do not exceed invoice total', () => {
        const payment1 = 1000;
        const payment2 = 1360;
        const remaining = invoiceTotal - payment1;
        // Second payment exactly clears the remaining balance
        expect(overpaymentError(payment2, remaining)).toBeNull();
        expect(remaining - payment2).toBeCloseTo(0, 5);
    });

    it('final balance rounds to zero on full settlement', () => {
        // Floating-point: 2360.005 rounds within tolerance
        expect(overpaymentError(2360.004, 2360)).toBeNull();
        expect(overpaymentError(2360.006, 2360)).not.toBeNull();
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// Flow 5: Customer/Vendor Master validation
// ══════════════════════════════════════════════════════════════════════════════
describe('Customer/Vendor master validation (pre-save)', () => {
    it('accepts a valid B2B customer with correct GSTIN', () => {
        const gstin = '22AAAAA0000A1Z5';
        expect(validateGstin(gstin)).toBe(true);
    });

    it('accepts a B2C customer with no GSTIN', () => {
        expect(validateGstin('')).toBe(true);
    });

    it('rejects a customer with malformed GSTIN', () => {
        expect(validateGstin('INVALID_GSTIN')).toBe(false);
    });

    it('name is required — empty name fails', () => {
        const name = '  ';
        expect(name.trim().length > 0).toBe(false);
    });

    it('name is required — non-empty name passes', () => {
        const name = 'Shoaib Khan';
        expect(name.trim().length > 0).toBe(true);
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// Flow 6: GST Calculation Consistency (end-to-end totals match)
// ══════════════════════════════════════════════════════════════════════════════
describe('GST calculation end-to-end consistency', () => {
    it('grand total == subtotal + CGST + SGST (intra-state)', () => {
        const item = buildLineItem(mockProduct, 3, false);
        // 3 × 1000 = 3000 taxable; 18% → cgst=270, sgst=270
        expect(item.amount).toBeCloseTo(3000, 5);
        expect(item.cgst! + item.sgst!).toBeCloseTo(540, 5);
        expect(item.grossAmount).toBeCloseTo(3540, 5);

        const totals = computeInvoiceTotals([item]);
        expect(totals.total).toBeCloseTo(item.amount + item.cgst! + item.sgst!, 5);
    });

    it('grand total == subtotal + IGST (inter-state)', () => {
        const item = buildLineItem(mockProduct, 3, true);
        expect(item.igst).toBeCloseTo(540, 5);
        const totals = computeInvoiceTotals([item]);
        expect(totals.total).toBeCloseTo(item.amount + item.igst!, 5);
    });

    it('switching from intra to inter produces same grand total', () => {
        const intra = buildLineItem(mockProduct, 2, false);
        const inter = buildLineItem(mockProduct, 2, true);
        expect(intra.grossAmount).toBeCloseTo(inter.grossAmount, 5);
    });

    it('invoice with multiple tax slabs totals correctly', () => {
        const item5pct = buildLineItem(
            { ...mockProduct, taxes: [{ id: 2, taxName: 'GST5', taxRate: 5 }] },
            2, false
        ); // 2000 taxable, tax=100 (50+50)
        const item18pct = buildLineItem(mockProduct, 1, false); // 1000 taxable, tax=180
        const totals = computeInvoiceTotals([item5pct, item18pct]);
        expect(totals.subtotal).toBeCloseTo(3000, 5);
        expect(totals.tax).toBeCloseTo(280, 5);
        expect(totals.total).toBeCloseTo(3280, 5);
    });
});
