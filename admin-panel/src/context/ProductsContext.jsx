import { createContext, useContext, useState } from "react";
import { ProductsContext } from "./Context";

export const ProductsProvider = ({ children }) => {
  const [cache, setCache] = useState({});
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);

  const setProducts = (key, products) => {
    setCache(prev => ({
      ...prev,
      [key]: products
    }));
  };

  const value = {
    cache,
    setCache,
    setProducts,
    categories,
    setCategories,
    setTotal,
    total
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};
