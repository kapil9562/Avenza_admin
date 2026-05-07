import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { FaLocationDot } from "react-icons/fa6";
import { IoIosArrowUp } from 'react-icons/io';

function OrderDetail({ order, formatPfpUrl, getPaymentBadge, statusColors, formatDate, formatTime, setShowDetail }) {
  const { isDark } = useTheme();
  const [showAllItems, setShowAllItems] = useState(false);

  const visibleItems = showAllItems
    ? order?.orderItems
    : order?.orderItems?.slice(0, 3);

  return (
    <section className='w-full p-2'>
      <div className={`${isDark ? "" : "bg-purple-300/10 border-slate-200"} border rounded-md p-2 w-full space-y-2`}>
        <div className='flex flex-row w-full justify-between items-center'>
          <div className='flex flex-row gap-1'>
            <span>Order Detail - </span>
            <span className={`${isDark ? "" : "text-purple-700"}`}>#{order?.orderId}</span>
          </div>
          <button className={`flex flex-row gap-1 items-center px-2 py-1 rounded-md cursor-pointer ${isDark? "" : "text-purple-600 bg-purple-600/10 hover:text-purple-800"}`}
          onClick={() => {
            setShowDetail((prev) => prev.filter((id) => id !== order._id))
          }}>
            <span><IoIosArrowUp /></span>
            <span className='text-sm'>Close</span>
          </button>
        </div>

        <div className='flex flex-row gap-2'>
          <div className={`${isDark ? "" : "bg-white border-gray-200"} py-2 px-4 rounded-md space-y-6 pb-20 w-1/3 border`}>
            <h1>Customer Information</h1>
            <div className='flex flex-row gap-2 items-center'>
              <img src={formatPfpUrl(order?.userId?.avatar) || (isDark ? "/user.png" : "/userLight.png")} alt="img" className='min-w-10 min-h-10 max-w-10 max-h-10 rounded-full' />
              <div className='flex flex-col'>
                <span>
                  {order?.userId?.name}
                </span>
                <span className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}>
                  {order?.userId?.email}
                </span>
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <h1>Shipping Address</h1>
              <div className={`flex flex-row gap-2 items-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                <FaLocationDot className='text-purple-600' />
                <address>{order?.shippingAddress?.address
                  ?.split(",")
                  .map(item => item.trim())
                  .filter(Boolean)
                  .join(", ")}
                </address>
              </div>
            </div>
          </div>
          <div className={`${isDark ? "" : "bg-white border-gray-200"} flex flex-col justify-between py-2 px-4 rounded-md space-y-4 w-2/3 border`}>
            <div className='flex flex-col gap-2'>
              <h1>Order Items</h1>
              <div className='flex flex-col'>
                <div className={`border rounded-md ${isDark ? "" : "border-gray-200"}`}>
                  <table className="w-full border-collapse">
                    <tbody className={`divide-y ${isDark ? "divide-slate-700 text-gray-300" : "divide-slate-200 text-gray-800"}`}>
                      {visibleItems?.map((item, idx) => (
                        <tr key={idx}>

                          <td className="pr-3 pl-1 py-1">
                            <div className="flex items-center gap-4">
                              <img
                                src={item?.image}
                                alt="img"
                                className={`min-w-14 min-h-14 max-w-14 max-h-14 object-contain rounded-sm ${isDark
                                  ? "bg-linear-to-br from-blue-900/40 to-purple-900/40"
                                  : "bg-linear-to-br from-blue-100 to-purple-100"
                                  }`}
                              />

                              <span>{item?.name}</span>
                            </div>
                          </td>

                          <td className="pr-3 pl-1 py-1 whitespace-nowrap">
                            ₹{item?.price?.toLocaleString("en-IN")}
                          </td>

                          <td className="pr-3 pl-1 py-1 whitespace-nowrap">
                            x{item?.quantity}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {order?.orderItems?.length > 3 && (
                  <button
                    onClick={() => setShowAllItems(!showAllItems)}
                    className={`text-sm font-medium transition w-fit cursor-pointer ${isDark
                      ? "text-purple-400 hover:text-purple-300"
                      : "text-purple-600 hover:text-purple-700"
                      }`}
                  >
                    {showAllItems
                      ? "Show Less"
                      : `Show More (+${order?.orderItems?.length - 3})`}
                  </button>
                )}
              </div>
            </div>
            <div className={`${isDark ? "" : "bg-purple-300/10 border-slate-200"} border rounded-md p-2 w-full space-y-2`}>
              <span>Total Items: {order?.orderItems?.length}</span>
            </div>
          </div>
          <div className={`${isDark ? "" : "bg-white border-gray-200"} py-2 px-4 rounded-md space-y-4 w-1/2 border`}>
            <h1>Order Summary</h1>
            <div className='w-full space-y-2'>
              <div className='flex flex-col gap-1'>
                <div className='w-full flex flex-row justify-between'>
                  <span className={`text-sm`}>Subtotal</span>
                  <span>₹{order?.totalAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className='w-full flex flex-row justify-between'>
                  <span className={`text-sm`}>Delivery Charge</span>
                  <span>₹{order?.deliveryCharge.toLocaleString("en-IN")}</span>
                </div>
                <div className='w-full flex flex-row justify-between'>
                  <span className={`text-sm`}>Tax Amount</span>
                  <span>₹{order?.taxAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className={`w-full h-0.5 ${isDark ? "" : "bg-gray-100"}`}></div>

              <div className='w-full flex flex-row justify-between'>
                <span>Total Amount</span>
                <span className={`text-xl ${isDark ? "" : "text-purple-600"}`}>₹{(order?.totalAmount + order?.deliveryCharge + order?.taxAmount).toLocaleString("en-IN")}</span>
              </div>

              <div className='flex flex-col gap-2'>
                <div className='w-full flex flex-row justify-between'>
                  <span className={`text-sm`}>Payment Method</span>
                  <span className={`px-2 text-xs flex items-center rounded-full whitespace-nowrap ${getPaymentBadge(order?.paymentMethod)}`}>
                    {order?.paymentMethod}
                  </span>
                </div>

                <div className='w-full flex flex-row justify-between'>
                  <span className={`text-sm`}>Order Status</span>
                  <span className={`px-2 text-xs flex items-center rounded-full whitespace-nowrap ${statusColors[order.orderStatus.replace(/\s/g, "")]}`}>
                    {order?.orderStatus}
                  </span>
                </div>

                <div className='w-full flex flex-row justify-between'>
                  <span className={`text-sm`}>Order Placed On</span>
                  <span className={`px-2 text-sm flex items-center rounded-full whitespace-nowrap`}>
                    {formatDate(order?.createdAt)} {formatTime(order?.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OrderDetail