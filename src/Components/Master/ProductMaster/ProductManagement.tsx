import React from "react";
import useProductLogic from "./ProductManagementLogic";
import Select from "react-select";
import PopupView from "../../CommonComp/PopupView";
import MessageView from "../../CommonComp/MessageVIew";

interface ProductManagementProps {
    product?: any;
}

const ProductManagement: React.FC<ProductManagementProps> = ({ product }) => {

    const {submitProductForm, changeEvent, productModel, categoryList, TaxList, isMessageShow, popupMessage,
        selectedTax, selectedTaxList, buttonName, closePopup} = useProductLogic(product);

    return (
        <div className="container py-4">
            <h2 className="mb-4">Product Management</h2>

            <div className="card mb-4">
                <div className="card-body">
                    <form onSubmit={submitProductForm}>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label htmlFor="status" className="form-label">Select Category</label>
                                <select id="status" name="categoryId" value={productModel?.categoryId} onChange={changeEvent}
                                    className="form-select">
                                        <option value="">Select Category</option>
                                        {
                                            categoryList.map(r=>
                                                <option key={r.categoryId} value={r.categoryId}>{r.name}</option>
                                            )
                                        }
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="ProductSKU" className="form-label">Product SKU</label>
                                <input
                                    type="text"
                                    id="ProductSKU"
                                    name="sku"
                                    value={productModel?.sku || ''}
                                    onChange={changeEvent}
                                    className="form-control"
                                    placeholder="Enter product SKU"
                                />
                            </div>

                            <div className="col-md-4">
                                <label htmlFor="productName" className="form-label">Product Name</label>
                                <input
                                    type="text"
                                    id="productName"
                                    name="name"
                                    value={productModel?.name || ''}
                                    onChange={changeEvent}
                                    className="form-control"
                                    placeholder="Enter product name"
                                />
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="productDescription" className="form-label">Product Description</label>
                                <input
                                    type="text"
                                    id="productDescription"
                                    name="description"
                                    value={productModel?.description || ''}
                                    onChange={changeEvent}
                                    className="form-control"
                                    placeholder="Enter product description"
                                />
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="productPrice" className="form-label">Purchase Price</label>
                                <input
                                    type="text"
                                    id="productPrice"
                                    name="price"
                                    value={productModel?.price || ''}
                                    onChange={changeEvent}
                                    className="form-control"
                                    placeholder="Enter purchase price"
                                />
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="sellPrice" className="form-label">Sell Price</label>
                                <input
                                    type="text"
                                    id="sellPrice"
                                    name="sellPrice"
                                    value={productModel?.sellPrice || ''}
                                    onChange={changeEvent}
                                    className="form-control"
                                    placeholder="Enter sell price"
                                />
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="productTax" className="form-label">Product Tax (%)</label>
                                <Select
                                        isMulti
                                        options={TaxList.map(tax => ({
                                            value: tax.id,
                                            label: `${tax.name} (${tax.rate}%)`,
                                        }))}
                                        value={selectedTax.map(tax => ({
                                            value: tax.id,
                                            label: `${tax.name} (${tax.rate}%)`,
                                        }))}
                                        onChange={selectedTaxList}
                                        styles={{
                                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                                        }}
                                    />

                            </div>
                            <div className="col-md-4">
                                <label htmlFor="productDiscount" className="form-label">Product Discount</label>
                                <input
                                    type="text"
                                    id="productDiscount"
                                    name="discount"
                                    value={productModel?.discount || ''}
                                    onChange={changeEvent}
                                    className="form-control"
                                    placeholder="Enter product discount"
                                />
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="stockQuantity" className="form-label">Stock Quantity</label>
                                <input
                                    type="text"
                                    id="stockQuantity"
                                    name="stockQuantity"
                                    value={productModel?.stockQuantity || ''}
                                    onChange={changeEvent}
                                    className="form-control"
                                    placeholder="Enter stock quantity"
                                />
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="productActive" className="form-label">Product Active</label>
                                <input
                                    type="checkbox"
                                    id="productActive"
                                    name="isActive"
                                    value={productModel?.isActive ? "true" : "false"}
                                    checked={productModel?.isActive || false}
                                    onChange={changeEvent}
                                    placeholder="Enter product active status"
                                />
                            </div>
                        </div>

                        <div className="mt-3 text-end">
                            <button type="submit" className="btn btn-primary">
                                <i className="bi bi-plus-circle me-1"></i>
                                {buttonName}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {
                isMessageShow && (
                    <PopupView onClose={closePopup}>
                        <MessageView message={popupMessage}/>
                    </PopupView>
                )
            }
        </div>
    );
}

export default ProductManagement;