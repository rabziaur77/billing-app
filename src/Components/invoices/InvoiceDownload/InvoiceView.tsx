import { useRef } from "react";
import type { InvoiceReceipt, LineItem, Tax } from "../InvoiceModel/Models";
import "./printStyle.css";

const InvoiceView = ({ invoiceData }: { invoiceData: InvoiceReceipt }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div ref={printRef} className="print-area">
        <div className="container">
          <h2>Invoice View</h2>
          <div><strong>Customer:</strong> {invoiceData.customer.Name}</div>
          <div><strong>Invoice No:</strong> {invoiceData.customer.InvoiceNumber}</div>
          <div><strong>Date:</strong> {invoiceData.customer.InvoiceDate}</div>
          <div><strong>Due Date:</strong> {invoiceData.customer.DueDate}</div>

          <table className="table mt-3">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Discount</th>
                <th>Tax</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.invoiceList.map((item: LineItem, index: number) => (
                <tr key={index}>
                  <td>{item.productName}</td>
                  <td>{item.quantity}</td>
                  <td>{item.rate}</td>
                  <td>{item.discount?.toFixed(2) || 0}</td>
                  <td>{item.taxList.map((t: Tax) => `${t.name} (${t.rate}%)`).join(", ")}</td>
                  <td>{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-end">
            <p><strong>Subtotal:</strong> ₹{invoiceData.subtotal.toFixed(2)}</p>
            {/* <p><strong>Tax:</strong> ₹{invoiceData.tax.toFixed(2)}</p> */}
            <p><strong>Grand Total:</strong> ₹{invoiceData.total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="container no-print d-flex gap-2">
        <button className="btn btn-primary mt-3" onClick={handlePrint}>
          <i className="bi bi-printer me-1"></i> Print Invoice
        </button>
        <button className="btn btn-success mt-3" onClick={() => {
          const customer = invoiceData.customer;
          const message = `*Invoice: ${customer.InvoiceNumber}*\n` +
            `Hello ${customer.Name},\n\n` +
            `Your invoice for *₹${invoiceData.total.toFixed(2)}* is ready.\n` +
            `Date: ${customer.InvoiceDate}\n` +
            `Due Date: ${customer.DueDate}\n\n` +
            `Thank you for your business!`;
          
          const encodedMessage = encodeURIComponent(message);
          const whatsappUrl = `https://wa.me/${customer.CustomerMobile}?text=${encodedMessage}`;
          window.open(whatsappUrl, '_blank');
        }}>
          <i className="bi bi-whatsapp me-1"></i> Send to WhatsApp
        </button>
      </div>
    </>
  );
};

export default InvoiceView;
