import { createContext, useContext, useState } from "react";

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const [recentOrders, setRecentOrders] = useState([]);
  const [error, setError] = useState("");

  const value = {
    recentOrders,
    setRecentOrders,
    error,
    setError
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useOrders must be used inside DashboardContext");
  }
  return ctx;
};
