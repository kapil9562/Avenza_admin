import { useState } from "react";
import { DashboardContext } from "./Context";

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