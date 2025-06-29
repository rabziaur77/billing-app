import React from "react";
import InvoiceHeader from "./InvoiceHeader";
import InvoiceDescription from "./ItemDescriptions";
import InvoiceSubtotal from "./SubTotalCal";

const CreateInvoicePage: React.FC = () => {
    const [subTotal, setSubTotal] = React.useState<number>(0);
    const [taxAmount, setTaxAmount] = React.useState<number>(0);
    const [total, setTotal] = React.useState<number>(0);

    const ItemsData =(item:any)=>{
        const subtotal = item.reduce((acc:any, curr:any) => acc + curr.amount, 0);
        const tax = item.reduce((acc:any, curr:any) => {
            const taxAmount = curr.taxList.reduce((taxAcc:any, taxCurr:any) => taxAcc + (curr.amount * taxCurr.rate / 100), 0);
            return acc + taxAmount;
        }, 0);
        const totalAmount = subtotal + tax;

        setSubTotal(subtotal);
        setTaxAmount(tax);
        setTotal(totalAmount);
    }

    return (
        <div className="container my-4">
            <h2 className="mb-4">Create Invoice</h2>
            <form>
                {/* Invoice Header */}
                <InvoiceHeader />

                {/* Select Item for Invoice */}
                <InvoiceDescription ItemData={ItemsData} />

                {/* Invoice SubTotal */}
                <InvoiceSubtotal subtotal={subTotal} taxAmount={taxAmount} total={total} />
            </form>
        </div>
    );
};

export default CreateInvoicePage;