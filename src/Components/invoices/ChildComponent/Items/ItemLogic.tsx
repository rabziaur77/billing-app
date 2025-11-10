import {useEffect, useState} from 'react';
import type { LineItem, Tax } from '../../InvoiceModel/Models';
import type { Products } from '../../InvoiceModel/Products';
import { API_SERVICE } from '../../../../Service/API/API_Service';

interface Prop{
    ItemData?: (Items: any)=> void; 
    items: LineItem[];
}

const useItemLogic = ({ItemData, items}:Prop) => {
    const [TaxList, setTaxList] = useState<Tax[]>([]);
    const [ProductsList, setProductsList] = useState<Products[]>([]);
    const [lineItems, setLineItems] = useState<LineItem[]>([
            { description: "", quantity: 1, rate: 0, amount: 0, discount: 0, grossAmount: 0, taxList: [] },
        ]);

    useEffect(() => {
        if (items && items.length > 0) {
            setLineItems(items);
        }
    }, [items]);

    useEffect(() => {
        loadProducts();
        loadTaxList();
    }, []);

    const loadProducts = async () => {
        try {
            const response = await API_SERVICE.get('products-api/product/GetAllProducts');
            if (response.status === 200) {
                const products = response.data.result.map((prod: any) => ({
                    productId: prod.productId,
                    tenantId: prod.tenantId,
                    name: prod.name,
                    description: prod.description,
                    price: prod.price,
                    categoryId: prod.categoryId,
                    sku: prod.sku,
                    stockQuantity: prod.stockQuantity,
                    isActive: prod.isActive
                }));

                setProductsList(products);
            }
        } catch (error) {
            console.error("Error loading products:", error);
        }
    };

    const loadTaxList = async () => {
        try {
            const response = await API_SERVICE.get('invoice-api/Tax/GetTaxes');

            if (response.status === 200) {
                const taxList: Tax[] = response.data.map((tax: any) => ({
                    id: tax.id,
                    name: tax.name,
                    rate: tax.rate
                }));
                
                setTaxList(taxList);
            }
        } catch (error) {
            console.error("Error loading tax list:", error);
        }
    };
    
    const handleLineItemChange = (
        idx: number,
        field: keyof LineItem,
        value: string | number | string[] | number[]
    ) => {
        const updatedItems = [...lineItems];
        if (field === "quantity" || field === "rate") {
            const numValue = Number(value);
            updatedItems[idx][field] = numValue;
            updateAmounts(updatedItems, idx, field, numValue);
            
        }else if (field === "discount") {
            const discountValue = Number(value);
            updatedItems[idx][field] = discountValue;
            updatedItems[idx].amount =
                (updatedItems[idx].quantity * updatedItems[idx].rate) - discountValue;
            updatedItems[idx].grossAmount = updatedItems[idx].amount;
        } 
        else if (field === "description") {
            updatedItems[idx][field] = value as string;
            updatedItems[idx].rate = ProductsList.find(prod => prod.productId === value)?.price || 0;
            updatedItems[idx].discount = ProductsList.find(prod => prod.productId === value)?.discount || 0;

            updateAmounts(updatedItems, idx, "field", updatedItems[idx].rate);
        }
        else if (field === "taxList") {
            const selectedIds = value as number[];
            updatedItems[idx].taxList = TaxList.filter(tax =>
                selectedIds.includes(tax.id)
            );
            
            if (updatedItems[idx].taxList.length > 0) {
                updatedItems[idx].grossAmount += updatedItems[idx].taxList.reduce((acc, tax) => acc + (updatedItems[idx].amount * tax.rate / 100), 0);
            }
            else {
                updatedItems[idx].grossAmount = updatedItems[idx].amount;
            }
        }
        setLineItems(updatedItems);
        if (ItemData) {
            ItemData(updatedItems);
        }
    };

    const updateAmounts = (updatedItems: LineItem[], idx: number, field: string, numValue: number) => {
        updatedItems[idx].amount =
                (field === "quantity"
                    ? numValue
                    : updatedItems[idx].quantity) *
                (field === "rate" ? numValue : updatedItems[idx].rate);
            updatedItems[idx].grossAmount = updatedItems[idx].amount;
            if (updatedItems[idx].taxList.length > 0) {
                updatedItems[idx].grossAmount += updatedItems[idx].taxList.reduce((acc, tax) => acc + (updatedItems[idx].amount * tax.rate / 100), 0);
            }
    }

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
            { description: "", quantity: 1, rate: 0, amount: 0, discount: 0, grossAmount: 0, taxList: [] },
        ]);
    };

    return {
        lineItems,
        handleLineItemChange,
        removeLineItem,
        addLineItem,
        TaxList,
        ProductsList
    };
}

export default useItemLogic;