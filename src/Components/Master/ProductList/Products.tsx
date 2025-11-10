import React from "react";
import useProductLogics, {} from "./ProductsLogic";
import PopupView from "../../CommonComp/PopupView";
import ProductManagement from "../ProductMaster/ProductManagement";


const Products: React.FC = () => {
    const {productModel ,isEditing, ProductList, editProduct, activateOrDeactivateProduct, closePopup} = useProductLogics();
    return (
        <div className="container py-4">

            <h2 className="mb-4">Products</h2>

            {/* Table Section */}
            <div className="card">
                <div className="card-body">
                    <table className="table table-bordered table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Product ID</th>
                                <th>SKU</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Discount</th>
                                <th>Stock Quantity</th>
                                <th>Is Active</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ProductList.map((product) => (
                                <tr key={product.productId}>
                                    <td>{product.productId}</td>
                                    <td>{product.sku}</td>
                                    <td>{product.name}</td>
                                    <td>{product.categoryId}</td>
                                    <td>{product.price}</td>
                                    <td>{product.discount}</td>
                                    <td>{product.stockQuantity}</td>
                                    <td>{product.isActive ? "Yes" : "No"}</td>
                                    <td className="text-center">
                                        <button onClick={() => editProduct(product)} className="btn btn-sm btn-warning me-2">
                                            Edit
                                        </button>
                                        <button onClick={() => activateOrDeactivateProduct(product)} className="btn btn-sm btn-danger">
                                            {product.isActive ? "Deactivate" : "Activate"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {
                isEditing && (
                    <PopupView onClose={closePopup}>
                        <ProductManagement product={productModel} />
                    </PopupView>
                )
            }
        </div>
    );
}

export default Products;