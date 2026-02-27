import React from 'react';
import { 
  FiShoppingBag, 
  FiUsers, 
  FiDollarSign, 
  FiClipboard, 
  FiPlus, 
  FiEye 
} from 'react-icons/fi';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

// Mock Data for Charts
const salesData = [
  { name: 'Jan', sales: 400, trend: 240 },
  { name: 'Feb', sales: 300, trend: 380 },
  { name: 'Mar', sales: 600, trend: 450 },
  { name: 'Apr', sales: 500, trend: 390 },
  { name: 'May', sales: 800, trend: 600 },
  { name: 'Jun', sales: 700, trend: 650 },
];

const pieData = [
  { name: 'Electronics', value: 35, color: '#FF8A8A' },
  { name: 'Fashion', value: 25, color: '#6395F9' },
  { name: 'Home & Living', value: 20, color: '#7EE3B1' },
  { name: 'Beauty', value: 20, color: '#B9A3FF' },
];

const Dashboard = () => {
  return (
    <div className="max-h-dvh bg-[#F9F9FF] p-8 font-sans text-slate-700 overflow-y-scroll no-scrollbar pb-20 scroll-smooth">
      {/* 1. Stats Overview Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<FiShoppingBag />} label="Total Sales" value="$12,540" color="bg-pink-100 text-pink-500" className="bg-linear-to-b from-white via-white to-pink-50 border-b-4 border-b-pink-200" />
        <StatCard icon={<FiClipboard />} label="Orders" value="320" color="bg-purple-100 text-purple-500" className="bg-linear-to-b from-white via-white to-purple-50 border-b-4 border-b-purple-200"/>
        <StatCard icon={<FiUsers />} label="Customers" value="1,210" color="bg-green-100 text-green-500" className="bg-linear-to-b from-white via-white to-green-50 border-b-4 border-b-green-200"/>
        <StatCard icon={<FiDollarSign />} label="Revenue" value="$8,750" color="bg-orange-100 text-orange-500" className="bg-linear-to-b from-white via-white to-orange-50 border-b-4 border-b-orange-200"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          {/* 2. Recent Orders Table */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold mb-6">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-50">
                    <th className="pb-4 font-medium">Order ID</th>
                    <th className="pb-4 font-medium">Customer</th>
                    <th className="pb-4 font-medium">Product</th>
                    <th className="pb-4 font-medium">Status</th>
                    <th className="pb-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <OrderRow id="#10234" name="Emily Johnson" item="Wireless Headphones" status="Shipped" date="Apr 22, 2024" />
                  <OrderRow id="#10233" name="Michael Smith" item="Smartwatch" status="Processing" date="Apr 21, 2024" />
                  <OrderRow id="#10232" name="Sarah Lee" item="Running Shoes" status="Delivered" date="Apr 20, 2024" />
                  <OrderRow id="#10231" name="David Brown" item="Laptop Bag" status="Pending" date="Apr 18, 2024" />
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-8">
          {/* 3. Sales Analytics */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold">Sales Analytics</h3>
            <p className="text-slate-400 text-sm mb-4">Monthly Sales</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <Tooltip cursor={false} />
                  <Line type="monotone" dataKey="trend" stroke="#6395F9" strokeWidth={3} dot={{ r: 4, fill: '#6395F9' }} />
                  <Bar dataKey="sales" fill="#FF8A8A" radius={[4, 4, 0, 0]} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Product Categories */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold mb-4">Product Categories</h3>
            <div className="flex items-center">
              <div className="w-1/2 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={0} outerRadius={70} paddingAngle={0} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center text-xs">
                    <span className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-500">{item.name}</span>
                    <span className="ml-auto font-bold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Quick Actions */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="flex gap-4">
              <button className="flex-1 bg-[#FF8A8A] text-white py-2 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition">
                <FiPlus size={16} /> Add Product
              </button>
              <button className="flex-1 bg-[#8F89FF] text-white py-2 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition">
                <FiEye size={16} /> View Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components for cleaner code
const StatCard = ({ icon, label, value, color, className }) => (
  <div className={`bg-white p-5 rounded-3xl shadow-xl flex items-center gap-4 ${className}`}>
    <div className={`p-3 rounded-2xl ${color} text-xl`}>{icon}</div>
    <div>
      <p className="text-slate-400 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-700">{value}</p>
    </div>
  </div>
);

const OrderRow = ({ id, name, item, status, date }) => {
  const statusColors = {
    Shipped: "bg-green-100 text-green-600",
    Processing: "bg-orange-100 text-orange-600",
    Delivered: "bg-teal-100 text-teal-600",
    Pending: "bg-red-100 text-red-600",
  };
  return (
    <tr className="group hover:bg-slate-50 transition">
      <td className="py-4 font-bold text-slate-600">{id}</td>
      <td className="py-4 text-slate-500">{name}</td>
      <td className="py-4 text-slate-500">{item}</td>
      <td className="py-4">
        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${statusColors[status]}`}>
          {status}
        </span>
      </td>
      <td className="py-4 text-slate-400 text-sm">{date}</td>
    </tr>
  );
};

export default Dashboard;