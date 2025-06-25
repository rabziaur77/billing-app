import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Components/Account/Login'
import 'bootstrap/dist/css/bootstrap.min.css';
import AuthHOC, { LoginRedirectAuth } from './Service/ContextService/ProtectedRoute';
import { AuthProvider } from './Service/ContextService/AuthContext';
import Home from './Components/Home/Index';

const LoginRedirect = LoginRedirectAuth(Login);
const AUthDashboard = AuthHOC(Home);
const AUthSetting = AuthHOC(()=> <h2>Settings</h2>);

function App() {
  return (
    
      <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginRedirect />} />
          <Route path="/dashboard" element={<AUthDashboard/>} />
          <Route path="/settings" element={<AUthSetting/>} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
  )
}

export default App