import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "../api/api.js";
import { toast } from "./ToastContext.jsx";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("started")
        const res = await getCurrentUser();
        setUser(res?.data?.user || null);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Logout failed!"
      toast.error(msg);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};