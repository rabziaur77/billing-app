import React, { useEffect, useRef, useState } from 'react';
import type { LineItem } from '../../InvoiceModel/Models';
import type { Products } from '../../InvoiceModel/Products';
import { API_SERVICE } from '../../../../Service/API/API_Service';
import type { ActionMeta, MultiValue } from 'react-select';
import { checkIsInterState, computeLineItemAmounts } from '../../../../utils/gstUtils';

interface Prop {
    ItemData?: (Items: LineItem[]) => void;
    items: LineItem[];
    /** State code of seller (from business profile); used to decide CGST+SGST vs IGST */
    sellerState?: string;
    /** Place of supply from invoice header */
    placeOfSupply?: string;
    /** Incremented after each invoice save; triggers a product-list reload. */
    reloadTrigger?: number;
}

interface ApiProductResp {
    productId: number;
    tenantId: number;
    name: string;
    description: string;
    purchasePrice: number;
    sellingPrice: number;
    discount: number;
    categoryId: number;
    sku: string;
    stockQuantity: number;
    lowStockThreshold: number;
    isActive: boolean;
    taxes: { id: number; taxName: string; taxRate: number }[];
    hsnCode?: string;
}

const EMPTY_LINE: LineItem = {
    productId: 0, productName: '', quantity: 1,
    rate: 0, amount: 0, discount: 0, grossAmount: 0, taxList: [],
};

const useItemLogic = ({ ItemData, items, sellerState, placeOfSupply, reloadTrigger }: Prop) => {
    const [ProductsList, setProductsList] = useState<Products[]>([]);
    const [lineItems, setLineItems] = useState<LineItem[]>([{ ...EMPTY_LINE }]);
    const [stockWarnings, setStockWarnings] = useState<Record<number, string>>({});

    // Ref to hold the latest debounce cancel so we can clean up on unmount
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        if (items && items.length > 0) setLineItems(items);
    }, [items]);

    useEffect(() => {
        loadProducts();
    }, []);

    // Reload product list (with updated stock) after each invoice save
    useEffect(() => {
        if (reloadTrigger && reloadTrigger > 0) {
            loadProducts();
            // Reset line items to a single blank row
            const blank = { ...EMPTY_LINE };
            setLineItems([blank]);
            setStockWarnings({});
        }
    }, [reloadTrigger]);

    const loadProducts = async () => {
        try {
            const response = await API_SERVICE.get('products-api/product/GetAllInvoiceProducts');
            if (!isMounted.current) return;
            if (response.status === 200) {
                const products: Products[] = response.data.result.map((prod: ApiProductResp) => ({
                    productId: prod.productId,
                    tenantId: String(prod.tenantId),
                    name: prod.name,
                    description: prod.description,
                    purchasePrice: prod.purchasePrice,
                    sellingPrice: prod.sellingPrice,
                    discount: prod.discount,
                    categoryId: prod.categoryId,
                    sku: prod.sku,
                    stockQuantity: prod.stockQuantity,
                    lowStockThreshold: prod.lowStockThreshold ?? 0,
                    isActive: prod.isActive,
                    taxes: prod.taxes,
                    hsnCode: prod.hsnCode,
                }));
                setProductsList(products);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    /** Determine if tax is intra-state (CGST+SGST) or inter-state (IGST). */
    const isInterState = (): boolean => checkIsInterState(sellerState ?? '', placeOfSupply ?? '');

    /** Recompute amounts for a single item in-place using the shared utility. */
    const updateAmounts = (updatedItems: LineItem[], idx: number): void => {
        const item = updatedItems[idx];
        const amounts = computeLineItemAmounts(item, isInterState());
        item.amount = amounts.amount;
        item.grossAmount = amounts.grossAmount;
        item.cgst = amounts.cgst;
        item.sgst = amounts.sgst;
        item.igst = amounts.igst;
    };

    const handleLineItemChange = (
        idx: number,
        field: keyof LineItem,
        value: string | number | string[] | number[]
    ) => {
        const updatedItems = [...lineItems];

        if (field === 'quantity') {
            const qty = Number(value);
            updatedItems[idx].quantity = qty;

            // Stock validation
            const product = ProductsList.find(p => p.productId === updatedItems[idx].productId);
            const warnings = { ...stockWarnings };
            if (product && qty > product.stockQuantity) {
                warnings[idx] = `Only ${product.stockQuantity} units available in stock.`;
            } else {
                delete warnings[idx];
            }
            setStockWarnings(warnings);
            updateAmounts(updatedItems, idx);

        } else if (field === 'productName') {
            // value is the productId (number) from the react-select onChange
            const productId = Number(value);
            const product = ProductsList.find(p => p.productId === productId);
            updatedItems[idx].productName = product?.name || '';
            updatedItems[idx].productId = product?.productId || 0;
            updatedItems[idx].rate = product?.sellingPrice || 0;
            updatedItems[idx].discount = product?.discount || 0;
            updatedItems[idx].hsnCode = product?.hsnCode || '';
            updatedItems[idx].taxList = product?.taxes?.map(tax => ({
                id: tax.id,
                name: tax.taxName,
                rate: tax.taxRate,
            })) || [];

            // Clear stock warning for this row
            const warnings = { ...stockWarnings };
            delete warnings[idx];
            setStockWarnings(warnings);
            updateAmounts(updatedItems, idx);

        } else if (field === 'hsnCode') {
            // User manually overrides the HSN/SAC code on the line item
            updatedItems[idx].hsnCode = String(value).slice(0, 8);
        }

        setLineItems(updatedItems);
        if (ItemData) ItemData(updatedItems);
    };

    function itemTaxesManage(
        index: number,
        _options: MultiValue<{ value: number; label: string }>,
        action: ActionMeta<{ value: number; label: string }>
    ) {
        const updatedItems = [...lineItems];
        if (action.action === 'remove-value') {
            updatedItems[index].taxList = updatedItems[index].taxList.filter(
                tax => tax.id !== action.removedValue.value
            );
            updateAmounts(updatedItems, index);
        }
        setLineItems(updatedItems);
        // Notify parent so totals recalculate
        if (ItemData) ItemData(updatedItems);
    }

    const removeLineItem = (idx: number) => {
        if (lineItems.length === 1) return;
        const updatedItems = lineItems.filter((_, i) => i !== idx);
        // Remap stock warning indices: shift keys > idx down by 1
        const warnings: Record<number, string> = {};
        Object.entries(stockWarnings).forEach(([key, msg]) => {
            const k = Number(key);
            if (k < idx) warnings[k] = msg;
            else if (k > idx) warnings[k - 1] = msg;
            // k === idx is dropped (that row is gone)
        });
        setStockWarnings(warnings);
        setLineItems(updatedItems);
        if (ItemData) ItemData(updatedItems);
    };

    const addLineItem = () => {
        setLineItems([...lineItems, { ...EMPTY_LINE }]);
    };

    return {
        lineItems,
        handleLineItemChange,
        removeLineItem,
        addLineItem,
        ProductsList,
        itemTaxesManage,
        stockWarnings,
        isInterState,
    };
};

export default useItemLogic;

// ── Exported pure helpers (used by ItemDescriptions view) ─────────────────

/**
 * Renders a react-select option with a colour-coded stock badge.
 * Extracted here so the view layer stays free of business logic.
 */
export const formatProductOptionLabel = (
    opt: { value: number; label: string },
    productsList: Products[]
): React.ReactNode => {
    const pr = productsList.find(p => p.productId === opt.value);
    const stock = pr?.stockQuantity ?? 0;
    const low = (pr as any)?.lowStockThreshold ?? 0;
    const color = stock <= 0 ? '#dc3545' : stock <= low ? '#fd7e14' : '#198754';
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{opt.label}</span>
            <span style={{
                fontSize: '0.7rem', padding: '1px 6px',
                borderRadius: 10, background: color, color: '#fff', marginLeft: 8
            }}>
                {stock <= 0 ? 'Out' : `${stock}`}
            </span>
        </div>
    );
};

/** Per-row stock meta derived from a product lookup. */
export interface RowMeta {
    prod: Products | undefined;
    stockQty: number | null;
    lowThreshold: number;
    isLowStock: boolean;
    isOutOfStock: boolean;
}

/**
 * Computes stock badge state for a single line-item row.
 * Extracted here so the view layer stays free of business logic.
 */
export const getRowMeta = (productId: number, productsList: Products[]): RowMeta => {
    const prod = productsList.find(p => p.productId === productId);
    const stockQty = prod?.stockQuantity ?? null;
    const lowThreshold = (prod as any)?.lowStockThreshold ?? 0;
    const isLowStock = stockQty !== null && stockQty > 0 && stockQty <= lowThreshold;
    const isOutOfStock = stockQty !== null && stockQty <= 0;
    return { prod, stockQty, lowThreshold, isLowStock, isOutOfStock };
};