import React from "react";

interface InvoiceSubtotalProps {
    subtotal: number;
    taxAmount: number;
    total: number;
}

const InvoiceSubtotal: React.FC<InvoiceSubtotalProps> = ({ subtotal, taxAmount, total }) => {
    return (
        <>
            <div className="row mb-4">
                <div className="col-md-6 offset-md-6">
                    <table className="table">
                        <tbody>
                            <tr>
                                <th>Subtotal</th>
                                <td>{subtotal.toFixed(2)}</td>
                            </tr>
                            <tr style={{display:'none'}}>
                                <th>Tax</th>
                                <td>{taxAmount.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <th>Total</th>
                                <td>
                                    <strong>{total.toFixed(2)}</strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="text-end">
                <button type="submit" className="btn btn-success">
                    Generate Invoice
                </button>
            </div>
        </>
    );
};

export default InvoiceSubtotal;