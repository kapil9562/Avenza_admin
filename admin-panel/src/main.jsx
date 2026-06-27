import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ProductsProvider } from './context/ProductsContext.jsx';
import { Dashboard, Products, Orders, Settings, Analytics, Customers } from './components/index.js';
import Login from './pages/Login.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './helpers/ProtectedRoute.jsx'
import { ToastProvider } from './context/ToastContext.jsx';
import { OrdersProvider } from './context/OrderContext.jsx';
import { CustomersProvider } from './context/CustomerContext.jsx';
import { DashboardProvider } from './context/DashboardContext.jsx';
import AddProduct from './helpers/productModals/AddProduct.jsx';
import { AnalyticsProvider } from './context/AnalyticsContext.jsx';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <AnalyticsProvider>
            <DashboardProvider>
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

                          <Route path='/*' element={<div className='font-bold text-lg text-black bg-white min-h-dvh'>404 Not Found</div>} />

                        </Route>

                      </Routes>
                    </ToastProvider>
                  </OrdersProvider>
                </CustomersProvider>
              </ProductsProvider>
            </DashboardProvider>
          </AnalyticsProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

