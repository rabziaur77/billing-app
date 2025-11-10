import React from "react";
import useProductLogic from "./ProductManagementLogic";

interface ProductManagementProps {
    product?: any;
}

const ProductManagement: React.FC<ProductManagementProps> = ({ product }) => {

    const {submitProductForm, changeEvent, productModel, categoryList} = useProductLogic(product);

    return (
        <div className="container py-4">
            <h2 className="mb-4">Product Management</h2>

            <div className="card mb-4">
                <div className="card-body">
                    <form onSubmit={submitProductForm}>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label htmlFor="status" className="form-label">Select Category</label>
                                <select id="status" name="isActive" value={productModel?.categoryId} onChange={changeEvent}
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
                                <label htmlFor="productPrice" className="form-label">Product Price</label>
                                <input
                                    type="text"
                                    id="productPrice"
                                    name="price"
                                    value={productModel?.price || ''}
                                    onChange={changeEvent}
                                    className="form-control"
                                    placeholder="Enter product price"
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
                        </div>

                        <div className="mt-3 text-end">
                            <button type="submit" className="btn btn-primary">
                                <i className="bi bi-plus-circle me-1"></i>
                                Add Product
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProductManagement;