/**
 * gstUtils.ts
 * Pure, stateless GST calculation helpers.
 * All functions are deterministic and dependency-free — safe to unit-test.
 */

export interface GstBreakdown {
    cgst: number;
    sgst: number;
    igst: number;
}

export interface LineItemTax {
    id: number;
    name: string;
    rate: number;
}

export interface LineItemInput {
    quantity: number;
    rate: number;
    discount?: number;
    taxList: LineItemTax[];
}

export interface LineItemAmounts {
    /** Taxable amount = (qty × rate) − discount */
    amount: number;
    /** amount + all applicable taxes */
    grossAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
}

/** Returns true when buyer's state differs from seller's state (IGST applies). */
export function checkIsInterState(sellerState: string, placeOfSupply: string): boolean {
    if (!sellerState || !placeOfSupply) return false;
    return sellerState.toLowerCase().trim() !== placeOfSupply.toLowerCase().trim();
}

/**
 * Given a single tax rate and taxable amount, returns the GST split.
 * Intra-state → CGST = SGST = rate/2.   Inter-state → IGST = rate.
 */
export function computeGstBreakdown(
    taxRate: number,
    taxableAmount: number,
    interState: boolean,
): GstBreakdown {
    if (taxableAmount <= 0 || taxRate <= 0) return { cgst: 0, sgst: 0, igst: 0 };
    if (interState) {
        return { cgst: 0, sgst: 0, igst: (taxableAmount * taxRate) / 100 };
    }
    const half = (taxableAmount * taxRate) / 200;
    return { cgst: half, sgst: half, igst: 0 };
}

/**
 * Computes a line item's taxable amount, per-tax GST breakdown, and gross amount.
 * This is the single canonical calculation used by both the form and the invoice view.
 */
export function computeLineItemAmounts(
    item: LineItemInput,
    interState: boolean,
): LineItemAmounts {
    const baseAmount = item.quantity * item.rate;
    const taxableAmount = Math.max(0, baseAmount - (item.discount || 0));

    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let totalTax = 0;

    for (const tax of item.taxList) {
        const gst = computeGstBreakdown(tax.rate, taxableAmount, interState);
        totalCgst += gst.cgst;
        totalSgst += gst.sgst;
        totalIgst += gst.igst;
        totalTax += gst.cgst + gst.sgst + gst.igst;
    }

    return {
        amount: taxableAmount,
        grossAmount: taxableAmount + totalTax,
        cgst: totalCgst,
        sgst: totalSgst,
        igst: totalIgst,
    };
}

/**
 * Aggregates totals across all line items.
 * Tax is derived from (grossAmount − amount) so it always matches per-item computation.
 */
export function computeInvoiceTotals(
    items: Array<{ amount: number; grossAmount: number }>,
): { subtotal: number; tax: number; total: number } {
    const subtotal = items.reduce((s, i) => s + i.amount, 0);
    const tax = items.reduce((s, i) => s + (i.grossAmount - i.amount), 0);
    return { subtotal, tax, total: subtotal + tax };
}

/**
 * Builds per-tax-rate GST summary rows for display in the invoice GST summary table.
 */
export interface GstSummaryRow {
    rate: number;
    name: string;
    taxable: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalTax: number;
}

export function buildGstSummary(
    items: Array<{ amount: number; taxList: LineItemTax[]; cgst?: number; sgst?: number; igst?: number }>,
    interState: boolean,
): GstSummaryRow[] {
    const map: Record<number, GstSummaryRow> = {};

    for (const item of items) {
        for (const tax of item.taxList) {
            if (!map[tax.rate]) {
                map[tax.rate] = { rate: tax.rate, name: tax.name, taxable: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 };
            }
            const gst = computeGstBreakdown(tax.rate, item.amount, interState);
            map[tax.rate].taxable += item.amount;
            map[tax.rate].cgst += gst.cgst;
            map[tax.rate].sgst += gst.sgst;
            map[tax.rate].igst += gst.igst;
            map[tax.rate].totalTax += gst.cgst + gst.sgst + gst.igst;
        }
    }

    return Object.values(map);
}
