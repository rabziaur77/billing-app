import {useEffect, useState} from 'react';
import type { LineItem, Tax } from '../../InvoiceModel/Models';
import { API_SERVICE } from '../../../../Service/API/API_Service';

interface Prop{
    ItemData?: (Items: any)=> void; 
    items: LineItem[];
}

const useItemLogic = ({ItemData, items}:Prop) => {
    const [TaxList, setTaxList] = useState<Tax[]>([]);
    const [lineItems, setLineItems] = useState<LineItem[]>([
            { description: "", quantity: 1, rate: 0, amount: 0, discount: 0, taxList: [] },
        ]);

    useEffect(() => {
        if (items && items.length > 0) {
            setLineItems(items);
        }
    }, [items]);

    useEffect(() => {
        loadTaxList();
    }, []);

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
            updatedItems[idx].amount =
                (field === "quantity"
                    ? numValue
                    : updatedItems[idx].quantity) *
                (field === "rate" ? numValue : updatedItems[idx].rate);
        }else if (field === "discount") {
            const discountValue = Number(value);
            updatedItems[idx][field] = discountValue;
            updatedItems[idx].amount =
                (updatedItems[idx].quantity * updatedItems[idx].rate) - discountValue;
        } 
        else if (field === "description") {
            updatedItems[idx][field] = value as string;
        }
        else if (field === "taxList") {
            const selectedIds = value as number[];
            updatedItems[idx].taxList = TaxList.filter(tax =>
                selectedIds.includes(tax.id)
            );
        }
        setLineItems(updatedItems);
        if (ItemData) {
            ItemData(updatedItems);
        }
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
            { description: "", quantity: 1, rate: 0, amount: 0, discount: 0, taxList: [] },
        ]);
    };

    return {
        lineItems,
        handleLineItemChange,
        removeLineItem,
        addLineItem,
        TaxList
    };
}

export default useItemLogic;