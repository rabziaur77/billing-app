import React from "react";
import InvoiceHeader from "../ChildComponent/Header/InvoiceHeader";
import InvoiceDescription from "../ChildComponent/Items/ItemDescriptions";
import InvoiceSubtotal from "../ChildComponent/TotalCalc/SubTotalCal";
import InvoiceView from "../InvoiceDownload/InvoiceView";
import useGenerateInvoiceLogic from "./GenerateLogic";
import PopupView from "../../CommonComp/PopupView";

const CreateInvoicePage: React.FC = () => {
    const {
        itemsCost,
        ItemsData,
        submitForm,
        SetCustomer,
        invoiceReceipt,
        InvoiceShow,
        setInvoiceShow,
        itemData
    } = useGenerateInvoiceLogic();

    return (
        <div className="container my-4">
            <h2 className="mb-4">Create Invoice</h2>
            <form onSubmit={submitForm}>
                {/* Invoice Header */}
                <InvoiceHeader SetCustomer={SetCustomer} IsNewInvoice={InvoiceShow} />

                {/* Select Item for Invoice */}
                <InvoiceDescription items={itemData} ItemData={ItemsData} />

                {/* Invoice SubTotal */}
                <InvoiceSubtotal subtotal={itemsCost.subTotal} taxAmount={itemsCost.taxAmount} total={itemsCost.total} />
            </form>

            {/* Generate Invoice view */}
            {InvoiceShow && (
                // Invoice View
                <PopupView onClose={() => setInvoiceShow(false)}>
                    {/* Popup content goes here */}
                    <InvoiceView invoiceData={invoiceReceipt} />
                </PopupView>
            )}
        </div>
    );
};

export default CreateInvoicePage;