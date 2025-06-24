import {BrowserRouter, Routes, Route, useNavigate} from 'react-router-dom'
import Login from './Components/Account/Login'
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect } from 'react';

function RedirectToPreservedPage() {
  const navigate = useNavigate();

  useEffect(()=>{
    const path = sessionStorage.redirect;

    if (path) {
      sessionStorage.removeItem('redirect');
      navigate(path, { replace: true });
    }

  },[navigate])

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <RedirectToPreservedPage />
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/dashboard" element={<h2>Dashboard</h2>} />
        <Route path="/settings" element={<h2>Settings</h2>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
