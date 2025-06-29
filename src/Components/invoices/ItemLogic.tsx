import {useState} from 'react';

interface Tax {
    name: string;
    rate: number;
}

interface LineItem {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    taxList: Tax[];
}

interface Prop{
    ItemData?: (Items: any)=> void; 
}

const useItemLogic = ({ItemData}:Prop) => {
    const TaxList: Tax[] = [
        { name: "SGST", rate: 9 },
        { name: "CGST", rate: 9 },
        { name: "IGST", rate: 0 },
    ];

    const [lineItems, setLineItems] = useState<LineItem[]>([
            { description: "", quantity: 1, rate: 0, amount: 0, taxList: [] },
        ]);
    
    const handleLineItemChange = (
        idx: number,
        field: keyof LineItem,
        value: string | number | string[]
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
        } else if (field === "description") {
            updatedItems[idx][field] = value as string;
        }
        else if (field === "taxList") {
            const selectedNames = value as string[];
            
            updatedItems[idx].taxList = TaxList.filter(tax =>
                selectedNames.includes(tax.name)
            );
        }
        setLineItems(updatedItems);
        if (ItemData) {
            ItemData(updatedItems);
        }
    };

    const removeLineItem = (idx: number) => {
        if (lineItems.length === 1) return;
        setLineItems(lineItems.filter((_, i) => i !== idx));
    };

    const addLineItem = () => {
        setLineItems([
            ...lineItems,
            { description: "", quantity: 1, rate: 0, amount: 0, taxList: [] },
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