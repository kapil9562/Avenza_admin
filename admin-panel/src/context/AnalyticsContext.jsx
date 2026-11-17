import { useState } from "react";
import { getAnalytics } from "../api/api";
import { AnalyticsContext, useAuth } from "./Context";
import { useQuery } from "@tanstack/react-query";

export const AnalyticsProvider = ({ children }) => {
    const [salesRange, setSalesRange] = useState("yearly");
    const [orderRange, setOrderRange] = useState("monthly");

    const { user } = useAuth();
    const analyticsQuery = useQuery({
        queryKey: [
            "analytics",
            salesRange,
            orderRange
        ],
        queryFn: () =>
            getAnalytics({
                salesRange,
                orderRange,
            }),

        enabled: !!user,
    });

    return (
        <AnalyticsContext.Provider
            value={{
                salesRange,
                setSalesRange,

                orderRange,
                setOrderRange,

                ...analyticsQuery,
            }}
        >
            {children}
        </AnalyticsContext.Provider>
    );
};