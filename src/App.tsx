import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Components/Account/Login'
import 'bootstrap/dist/css/bootstrap.min.css';
import AuthHOC, { LoginRedirectAuth } from './Service/ContextService/ProtectedRoute';
import { AuthProvider } from './Service/ContextService/AuthContext';
import Home from './Components/Home/Index';
import CreateInvoicePage from './Components/invoices/MainComponent/Generate';
import Layout from './Components/MainLayout/Layout';
import InvoiceHistory from './Components/InvoiceHistory/InvoiceHistory';

const LoginRedirect = LoginRedirectAuth(Login);
const AUthDashboard = AuthHOC(Home);
const AUthSetting = AuthHOC(() => <h2>Settings</h2>);
const Invoices = AuthHOC(CreateInvoicePage);
const InvoiceList = AuthHOC(InvoiceHistory);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginRedirect />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<AUthDashboard />} />
            <Route path="/settings" element={<AUthSetting />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoice-history" element={<InvoiceList />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App