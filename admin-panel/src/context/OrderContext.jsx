import { useState } from "react";
import { OrdersContext } from "./Context";

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
