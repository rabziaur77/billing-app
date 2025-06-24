import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Login from './Components/Account/Login'
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/dashboard" element={<h2>Dashboard</h2>} />
        <Route path="/settings" element={<h2>Settings</h2>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
