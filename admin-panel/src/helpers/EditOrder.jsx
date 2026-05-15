import { useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { LuPencilLine } from "react-icons/lu";

export default function EditOrder() {
    const { isDark } = useTheme();
    const location = useLocation();
    const order = location?.state;

    console.log(order)
    return (

        <div className={`overflow-y-scroll scroll-smooth max-h-[calc(100dvh-60px)] w-fit lg:w-full pb-20 relative ${isDark ? "bg-[#0F172A]" : "bg-[#F9F9FF]"}`}>

            {/* Header */}
            <div
                className={`flex items-start justify-between px-4 py-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200'
                    }`}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl">
                        <LuPencilLine />
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold">Edit Order</h2>
                        <div
                            className={`text-sm flex gap-2 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}
                        >
                            <span>Update order details for</span>
                            <span className="text-purple-600 font-semibold">#{order?.orderId}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className={`rounded-xl px-2 py-2 cursor-pointer ${isDark ? "text-gray-200 hover:text-purple-500" : "text-gray-800 hover:text-purple-600"}`} onClick={() => navigate('/products')}>
                        Cancel
                    </button>
                    <button
                        className={`px-2 h-fit py-2 bg-linear-to-b flex flex-row justify-center rounded-lg font-semibold items-center from-purple-300 to-purple-500 cursor-pointer active:scale-95 transition-transform duration-300 min-h-10 min-w-35 text-white shadow-[0px_3px_8px_rgba(0,0,0,0.24)] relative`}
                    >
                        Edit Order
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Section */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Customer Info */}
                    <div
                        className={`rounded-xl border p-6 ${isDark
                            ? 'bg-white/[0.03] border-white/10'
                            : 'bg-gray-50 border-gray-200'
                            }`}
                    >
                        <h3 className="text-xl font-semibold mb-5">
                            Customer Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label
                                    className={`block text-sm mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'
                                        }`}
                                >
                                    Customer Name
                                </label>

                                <input
                                    type="text"
                                    defaultValue={order?.userId?.name}
                                    className={`w-full rounded-xl px-4 py-3 outline-none border transition-all ${isDark
                                        ? 'bg-[#1f2937] border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500'
                                        : 'bg-white border-gray-300 focus:border-purple-500'
                                        }`}
                                />
                            </div>

                            <div>
                                <label
                                    className={`block text-sm mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'
                                        }`}
                                >
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    defaultValue={order?.userId?.email}
                                    className={`w-full rounded-xl px-4 py-3 outline-none border transition-all ${isDark
                                        ? 'bg-[#1f2937] border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500'
                                        : 'bg-white border-gray-300 focus:border-purple-500'
                                        }`}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label
                                    className={`block text-sm mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'
                                        }`}
                                >
                                    Phone Number
                                </label>

                                <input
                                    type="text"
                                    defaultValue="+91 98765 43210"
                                    className={`w-full rounded-xl px-4 py-3 outline-none border transition-all ${isDark
                                        ? 'bg-[#1f2937] border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500'
                                        : 'bg-white border-gray-300 focus:border-purple-500'
                                        }`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div
                        className={`rounded-xl border p-6 ${isDark
                            ? 'bg-white/[0.03] border-white/10'
                            : 'bg-gray-50 border-gray-200'
                            }`}
                    >
                        <h3 className="text-xl font-semibold mb-5">
                            Shipping Address
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label
                                    className={`block text-sm mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'
                                        }`}
                                >
                                    Address Line 1
                                </label>

                                <input
                                    type="text"
                                    defaultValue={order?.shippingAddress?.address}
                                    className={`w-full rounded-xl px-4 py-3 outline-none border transition-all ${isDark
                                        ? 'bg-[#1f2937] border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500'
                                        : 'bg-white border-gray-300 focus:border-purple-500'
                                        }`}
                                />
                            </div>

                            <div>
                                <label
                                    className={`block text-sm mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'
                                        }`}
                                >
                                    Address Line 2
                                </label>

                                <input
                                    type="text"
                                    placeholder="Apartment, suite, unit"
                                    className={`w-full rounded-xl px-4 py-3 outline-none border transition-all ${isDark
                                        ? 'bg-[#1f2937] border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500'
                                        : 'bg-white border-gray-300 focus:border-purple-500'
                                        }`}
                                />
                            </div>

                            <div>
                                <label
                                    className={`block text-sm mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'
                                        }`}
                                >
                                    City
                                </label>

                                <input
                                    type="text"
                                    defaultValue="Delhi"
                                    className={`w-full rounded-xl px-4 py-3 outline-none border transition-all ${isDark
                                        ? 'bg-[#1f2937] border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500'
                                        : 'bg-white border-gray-300 focus:border-purple-500'
                                        }`}
                                />
                            </div>

                            <div>
                                <label
                                    className={`block text-sm mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'
                                        }`}
                                >
                                    State
                                </label>

                                <input
                                    type="text"
                                    defaultValue="Delhi"
                                    className={`w-full rounded-xl px-4 py-3 outline-none border transition-all ${isDark
                                        ? 'bg-[#1f2937] border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500'
                                        : 'bg-white border-gray-300 focus:border-purple-500'
                                        }`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div
                        className={`rounded-xl border p-6 ${isDark
                            ? 'bg-white/[0.03] border-white/10'
                            : 'bg-gray-50 border-gray-200'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-xl font-semibold">Order Items</h3>

                            <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all">
                                + Add Item
                            </button>
                        </div>

                        <div className="space-y-4">
                            {order?.orderItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={`flex flex-col md:flex-row md:items-center gap-4 rounded-xl border p-4 ${isDark
                                        ? 'bg-[#1f2937] border-white/10'
                                        : 'bg-white border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-16 h-16 rounded-xl object-cover"
                                        />

                                        <div>
                                            <h4 className="font-semibold">{item.name}</h4>
                                            <p
                                                className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'
                                                    }`}
                                            >
                                                ₹{item?.price}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            className={`w-10 h-10 rounded-xl text-lg ${isDark
                                                ? 'bg-white/10 hover:bg-white/20'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            -
                                        </button>

                                        <span className="font-semibold text-lg">
                                            {item.quantity}
                                        </span>

                                        <button className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-lg">
                                            +
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-5">
                                        <span className="font-bold text-lg">
                                            ₹{item.price * item?.quantity}
                                        </span>

                                        <button className="w-11 h-11 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                            🗑
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Summary */}
                <div>
                    <div
                        className={`sticky top-5 rounded-xl border p-6 ${isDark
                            ? 'bg-white/[0.03] border-white/10'
                            : 'bg-gray-50 border-gray-200'
                            }`}
                    >
                        <h3 className="text-2xl font-bold mb-6">Order Summary</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span
                                    className={isDark ? 'text-gray-400' : 'text-gray-500'}
                                >
                                    Subtotal
                                </span>

                                <span className="font-semibold">₹2,450</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span
                                    className={isDark ? 'text-gray-400' : 'text-gray-500'}
                                >
                                    Shipping
                                </span>

                                <span className="font-semibold">₹150</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span
                                    className={isDark ? 'text-gray-400' : 'text-gray-500'}
                                >
                                    Discount
                                </span>

                                <span className="font-semibold text-red-500">- ₹190</span>
                            </div>
                        </div>

                        <div
                            className={`my-6 border-t ${isDark ? 'border-white/10' : 'border-gray-200'
                                }`}
                        />

                        <div className="flex items-center justify-between mb-6">
                            <span className="text-lg font-semibold">Total Amount</span>

                            <span className="text-3xl font-bold text-purple-600">
                                ₹2,790
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p
                                    className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}
                                >
                                    Payment Method
                                </p>

                                <div className="inline-flex px-4 py-2 rounded-full bg-green-500/10 text-green-500 font-medium text-sm">
                                    Cash on Delivery
                                </div>
                            </div>

                            <div>
                                <p
                                    className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}
                                >
                                    Order Status
                                </p>

                                <div className="inline-flex px-4 py-2 rounded-full bg-orange-500/10 text-orange-500 font-medium text-sm">
                                    Pending
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
