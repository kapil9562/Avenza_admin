import { Navigate, Outlet, useLocation } from "react-router-dom";
import Lottie from "lottie-react";
import loader from "../assets/entryloader.json";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const ProtectedRoute = () => {
    const { isAuthenticated, loading} = useAuth();
    const location = useLocation();
    const {isDark} = useTheme();

    // 1. Handle loading state
    if (loading) {
        return (
            <div className={`${isDark? "bg-linear-to-br from-[#020617] via-[#0F172A] to-slate-800" : "bg-linear-to-br from-[#CAD0FD] to-[#F9E1FE]"} flex justify-center items-center min-h-dvh`}>
                <Lottie animationData={loader} loop className="h-30 w-30 sm:h-40 sm:w-40 hue-rotate-80" />
            </div>
        );
    }

    // 2. If not authenticated → redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. If authenticated → render child routes
    return <Outlet />;
};

export default ProtectedRoute;