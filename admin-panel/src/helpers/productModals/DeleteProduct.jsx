import { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { deleteProductById } from "../../api/api";
import { GoAlertFill } from "react-icons/go";
import { FaCircleCheck } from "react-icons/fa6";
import Lottie from 'lottie-react';
import loader from '../../assets/loader2.json'
import { useEffect } from "react";
import { useProducts, useTheme, useToast } from '../../context/Context';

export default function DeleteProduct({ setShow, product, setIsDeleted }) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const { setCache } = useProducts();
    const { isDark } = useTheme();
    const toast = useToast();

    const isMatch = input === "DELETE"

    const deleteProduct = async () => {
        if (!isMatch) return;
        try {
            setLoading(true);
            const res = await deleteProductById({ productId: product._id });
            setCache({});
            setIsDeleted(true);
            toast.success(res?.data?.message);
            setShow(false);
        } catch (error) {
            const msg = error?.response?.data?.message || error?.data?.message || "Failed to delete !";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={`border-2 rounded-xl w-[90%] sm:min-w-120 sm:max-w-120 zoom-modal ${isDark ? "bg-[#0F172A] border-gray-800 shadow-black/50 shadow-xl" : "bg-white border-gray-200 shadow-lg"}`}>
            <div className={`w-full flex justify-between items-center border-b-2 px-1 ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                <h1 className={`font-semibold p-2 ${isDark ? "text-gray-300" : "text-gray-800"}`}>Delete Product</h1>
                <button onClick={() => setShow(false)} className={`cursor-pointer p-2 rounded-lg ${isDark ? "text-gray-400 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-200"}`}>
                    <RxCross2 />
                </button>
            </div>

            <div className={`w-full flex flex-col justify-center items-center p-4 border-b-2 gap-2 font-semibold ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                <img src={product?.thumbnail} alt="" className={`h-20 w-20 object-contain rounded-lg ${isDark ? "bg-linear-to-br from-blue-900/40 to-purple-900/40" : "bg-linear-to-br from-blue-100 to-purple-100"}`} />
                <span className={`text-lg text-center line-clamp-2 ${isDark ? "text-white" : "text-gray-700"}`}>{product?.title}</span>
            </div>

            <div className="px-3 py-2 flex flex-col gap-2 font-semibold">
                <div className={`${isDark ? "text-gray-200" : "text-gray-900"}`}>
                    <h1>To confirm, type "DELETE" in the box below</h1>
                    <input
                        type="text"
                        className={`outline-none border-2 rounded-lg w-full p-1 ${isDark ? "border-red-700" : "border-red-400"}`}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && deleteProduct()}
                        disabled={loading}
                    />
                </div>


                <div className={`flex flex-row gap-2 justify-end items-center w-full`}>
                    <button
                        disabled={!isMatch || loading}
                        className={`min-h-9 px-2 py-1 border w-full rounded-lg font-semibold flex justify-center items-center  ${!isMatch ? "cursor-not-allowed opacity-50" : "cursor-pointer"} relative ${isDark ? "bg-red-900/20 border-red-700 text-red-400" : "bg-red-100/30 border-red-400 text-red-600"} overflow-hidden`}
                        onClick={deleteProduct}
                    >
                        {loading ?
                            <div className='flex absolute z-99 flex-row justify-center items-center left-1/2 -translate-x-1/2'>
                                <Lottie
                                    animationData={loader}
                                    loop={true}
                                    className="w-50 h-50 hue-rotate-140"
                                />
                            </div> :
                            <span>Delete this product</span>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}