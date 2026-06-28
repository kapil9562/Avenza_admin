import React from "react";
import { useAnalytics, useTheme } from "../../context/Context";
import SalesChart from "../../helpers/charts/SalesChart";
import SalesByCategoryChart from "../../helpers/charts/SalesByCategoryChart";
import OrdersChart from "../../helpers/charts/OrdersChart";
import TopSellingProducts from "../../helpers/charts/TopSellingProducts";
import { getStatCard } from "../../constants/analyticsStats";
import AnalyticsStatCard from "../../helpers/charts/AnalyticsStatCard";

function Analytics() {
  const { isDark } = useTheme();
  const { data } = useAnalytics();
  const overview = data?.data?.overview || {};

  const text = isDark ? "text-white" : "text-gray-800";
  const subText = isDark ? "text-gray-400" : "text-gray-500";

  const statCard = getStatCard(overview);

  return (
    <div className={` md:p-4 p-2 space-y-4 overflow-hidden nunitoFont ${isDark ? "bg-[#0F172A]" : "bg-[#F9F9FF]"}`}>
      {/* Header */}
      <div className="animate-fadeIn">
        <h1 className={`text-2xl font-bold ${text}`}>
          Analytics Overview
        </h1>
        <p className={`font-semibold ${subText}`}>
          Track your business performance and growth.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 md:gap-6 gap-2 animate-fadeIn">
        {statCard?.map((item) => (<AnalyticsStatCard key={item.label} item={item} isDark={isDark} />))}
      </div>

      {/* Charts */}
      <div className="grid xl:grid-cols-2 gap-6 animate-fadeIn">

        {/* Sales */}
        <SalesChart />

        {/* Orders */}
        <OrdersChart />
      </div>

      {/* Bottom */}
      <div className="grid xl:grid-cols-2 gap-6 animate-fadeIn">
        {/* Products */}
        <TopSellingProducts />

        {/* Category */}
        <SalesByCategoryChart />
      </div>
    </div >
  );
}

export default Analytics;