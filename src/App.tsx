import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Components/Account/Login'
import 'bootstrap/dist/css/bootstrap.min.css';
import AuthHOC, { LoginRedirectAuth } from './Service/ContextService/ProtectedRoute';
import { AuthProvider } from './Service/ContextService/AuthContext';
import Home from './Components/Home/Index';
import CreateInvoicePage from './Components/invoices/MainComponent/Generate';
import Layout from './Components/MainLayout/Layout';
import InvoiceHistory from './Components/InvoiceHistory/InvoiceHistory';
import CategoryManage from './Components/Master/CategoryMaster/CategoryManage';
import ProductManagement from './Components/Master/ProductMaster/ProductManagement';
import Products from './Components/Master/ProductList/Products';

const LoginRedirect = LoginRedirectAuth(Login);
const AUthDashboard = AuthHOC(Home);
const AUthSetting = AuthHOC(() => <h2>Settings</h2>);
const Invoices = AuthHOC(CreateInvoicePage);
const InvoiceList = AuthHOC(InvoiceHistory);
const Category = AuthHOC(CategoryManage);
const Product = AuthHOC(ProductManagement);
const ProductList = AuthHOC(Products);

function App() {
  return (
    <BrowserRouter basename='/billing-app'>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginRedirect />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<AUthDashboard />} />
            <Route path="/settings" element={<AUthSetting />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoice-history" element={<InvoiceList />} />
            <Route path="/category-management" element={<Category />} />
            <Route path="/product-management" element={<Product />} />
            <Route path="/product-list" element={<ProductList />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App