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
import ProtectedRoute from './helpers/ProtectedRoute.jsx'
import { ToastProvider } from './context/ToastContext.jsx';
import { OrdersProvider } from './context/OrderContext.jsx';
import { CustomersProvider } from './context/CustomerContext.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <ProductsProvider>
          <CustomersProvider>
            <OrdersProvider>
              <ToastProvider>
                <Routes>

                  {/* Public Route */}
                  <Route path="/login" element={<Login />} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>

                    {/* Layout Route */}
                    <Route element={<App />}>
                      <Route index element={<Dashboard />} />
                      <Route path="products" element={<Products />} />
                      <Route path="orders" element={<Orders />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="customers" element={<Customers />} />
                      <Route path="addproduct" element={<AddProduct />} />
                      <Route path="edit-product/:id" element={<AddProduct />} />
                    </Route>

                    <Route path='/*' element={<div className='font-bold text-lg'>404 Not Found</div>}/>

                  </Route>

                </Routes>
              </ToastProvider>
            </OrdersProvider>
          </CustomersProvider>
        </ProductsProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

