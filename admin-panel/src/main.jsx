import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ProductsProvider } from './context/ProductsContext.jsx';
import { Dashboard, Products, Orders, Settings, Analytics, Customers } from './components/index.js';
import AddProduct from './helpers/AddProduct.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <ProductsProvider>
        <Routes>
          <Route element={<App />}>
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
      </ProductsProvider>
    </ThemeProvider>
  </BrowserRouter>
);

