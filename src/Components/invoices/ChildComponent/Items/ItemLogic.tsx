import { useEffect, useState } from 'react';
import type { LineItem, Tax } from '../../InvoiceModel/Models';
import type { Products } from '../../InvoiceModel/Products';
import { API_SERVICE } from '../../../../Service/API/API_Service';
import type { ActionMeta, MultiValue } from 'react-select';

interface Prop {
    ItemData?: (Items: any) => void;
    items: LineItem[];
}

const useItemLogic = ({ ItemData, items }: Prop) => {
    const [TaxList, setTaxList] = useState<Tax[]>([]);
    const [ProductsList, setProductsList] = useState<Products[]>([]);
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { productId: 0, productName: "", quantity: 1, rate: 0, amount: 0, discount: 0, grossAmount: 0, taxList: [] },
    ]);

    useEffect(() => {
        if (items && items.length > 0) {
            setLineItems(items);
        }
    }, [items]);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const response = await API_SERVICE.get('products-api/product/GetAllInvoiceProducts');
            if (response.status === 200) {
                const products = response.data.result.map((prod: any) => ({
                    productId: prod.productId,
                    tenantId: prod.tenantId,
                    name: prod.name,
                    description: prod.description,
                    purchasePrice: prod.purchasePrice,
                    sellingPrice: prod.sellingPrice,
                    discount: prod.discount,
                    categoryId: prod.categoryId,
                    sku: prod.sku,
                    stockQuantity: prod.stockQuantity,
                    isActive: prod.isActive,
                    taxes: prod.taxes
                }));

                setProductsList(products);
            }
        } catch (error) {
            console.error("Error loading products:", error);
        }
    };

    const handleLineItemChange = (
        idx: number,
        field: keyof LineItem,
        value: string | number | string[] | number[]
    ) => {
        const updatedItems = [...lineItems];

        if (field === "quantity") {
            updatedItems[idx].quantity = Number(value);
            updateAmounts(updatedItems, idx);
        }
        else {
            const product = ProductsList.find(p => p.productId === value);
            updatedItems[idx].productName = product?.name || "";
            updatedItems[idx].productId = product?.productId || 0;
            updatedItems[idx].rate = product?.sellingPrice || 0;
            updatedItems[idx].discount = product?.discount || 0;
            updatedItems[idx].taxList = product?.taxes?.map(tax => ({
                id: tax.id,
                name: tax.taxName,
                rate: tax.taxRate
            })) || [];

            updateAmounts(updatedItems, idx);
        }
        setLineItems(updatedItems);
        if (ItemData) {
            ItemData(updatedItems);
        }
    };

    function itemTaxesManage(index: number, options: MultiValue<{ value: number; label: string; }>,
        action: ActionMeta<{
            value: number; label: string;
        }>) {
        const updatedItems = [...lineItems];

        if (action.action === "remove-value") {
            updatedItems[index].taxList = updatedItems[index].taxList.filter(tax => tax.id !== action.removedValue.value);
        }
        else if (action.action === "select-option" && action.option) {
            updatedItems[index].taxList = [...updatedItems[index].taxList,
            TaxList.find(tax => tax.id === action.option?.value)!];
        }

        setLineItems(updatedItems);
        console.log("Number of index", index, "Options:", options, "Action:", action);
    };

    const updateAmounts = (items: LineItem[], idx: number) => {
        const item = items[idx];

        const baseAmount = item.quantity * item.rate;
        const discountedAmount = baseAmount - (item.discount || 0);

        item.amount = discountedAmount;

        const taxAmount =
            item.taxList?.reduce(
                (acc, tax) => acc + (discountedAmount * tax.rate) / 100,
                0
            ) || 0;

        item.grossAmount = discountedAmount + taxAmount;
    };


    const removeLineItem = (idx: number) => {
        if (lineItems.length === 1) return;
        const updatedItems = lineItems.filter((_, i) => i !== idx)
        setLineItems(updatedItems);
        if (ItemData) {
            ItemData(updatedItems);
        }
    };

    const addLineItem = () => {
        setLineItems([
            ...lineItems,
            { productId: 0, productName: "", quantity: 1, rate: 0, amount: 0, discount: 0, grossAmount: 0, taxList: [] },
        ]);
    };

    return {
        lineItems,
        handleLineItemChange,
        removeLineItem,
        addLineItem,
        TaxList,
        ProductsList,
        itemTaxesManage
    };
}

export default useItemLogic;