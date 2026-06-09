import { createContext, useContext, useState } from "react";

const CustomersContext = createContext(null);

export const CustomersProvider = ({ children }) => {
  const [cache, setCache] = useState({});
  const [meta, setMeta] = useState({});

  const setUsers = (key, users) => {
    setCache(prev => ({
      ...prev,
      [key]: users
    }));
  };

  const value = {
    cache,
    setCache,
    setUsers,
    setMeta,
    meta,
  };

  return (
    <CustomersContext.Provider value={value}>
      {children}
    </CustomersContext.Provider>
  );
};

export const useCustomers = () => {
  const ctx = useContext(CustomersContext);
  if (!ctx) {
    throw new Error("useCustomers must be used inside CustomersProvider");
  }
  return ctx;
};
