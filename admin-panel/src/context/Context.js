import { useContext, createContext } from "react";

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const CustomersContext = createContext(null);
export const useCustomers = () => {
    const ctx = useContext(CustomersContext);
    if (!ctx) {
        throw new Error("useCustomers must be used inside CustomersProvider");
    }
    return ctx;
};

export const DashboardContext = createContext(null);
export const useDashboard = () => {
    const ctx = useContext(DashboardContext);
    if (!ctx) {
        throw new Error("useOrders must be used inside DashboardContext");
    }
    return ctx;
};

export const OrdersContext = createContext(null);
export const useOrders = () => {
    const ctx = useContext(OrdersContext);
    if (!ctx) {
        throw new Error("useOrders must be used inside OrdersProvider");
    }
    return ctx;
};


export const ProductsContext = createContext(null);
export const useProducts = () => {
    const ctx = useContext(ProductsContext);
    if (!ctx) {
        throw new Error("useProducts must be used inside ProductsProvider");
    }
    return ctx;
};



export const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);


export const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);