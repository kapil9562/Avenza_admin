import { createContext, useContext, useState } from "react";
import { getAnalytics } from "../api/api";
import { AnalyticsContext } from "./Context";
import { useQuery } from "@tanstack/react-query";

export const AnalyticsProvider = ({ children }) => {
    const [salesRange, setSalesRange] = useState("monthly");
    const [orderRange, setOrderRange] = useState("monthly");

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