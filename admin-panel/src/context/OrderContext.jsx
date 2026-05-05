import { createContext, useContext, useState } from "react";

const OrdersContext = createContext(null);

export const OrdersProvider = ({ children }) => {
  const [cache, setCache] = useState({});
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const setOrders = (key, orders) => {
    setCache(prev => ({
      ...prev,
      [key]: orders
    }));
  };

  const value = {
    cache,
    setCache,
    setOrders,
    setTotal,
    total,
    stats,
    setStats,
    paymentMethods,
    setPaymentMethods
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrdersContext);
  if (!ctx) {
    throw new Error("useOrders must be used inside OrdersProvider");
  }
  return ctx;
};
