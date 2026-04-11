import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ProductsProvider } from './context/ProductsContext.jsx';
import { Dashboard, Products, Orders, Settings, Analytics, Customers } from './components/index.js';
import AddProduct from './helpers/AddProduct.jsx';
import Login from './pages/Login.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './helpers/protectedRoute.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <ProductsProvider>
          <ToastProvider>
            <Routes>
              <Route path='/login' element={<Login />} />
              <Route element={
                <ProtectedRoute>
                  <App />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path='/products' element={<Products />} />
                <Route path='/orders' element={<Orders />} />
                <Route path='/settings' element={<Settings />} />
                <Route path='/analytics' element={<Analytics />} />
                <Route path='/customers' element={<Customers />} />
                <Route path='/addproduct' element={<AddProduct />} />
                <Route path="/edit-product/:id" element={<AddProduct />} />
              </Route>
            </Routes>
          </ToastProvider>
        </ProductsProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

