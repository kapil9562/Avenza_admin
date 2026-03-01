import { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { deleteProductById } from "../api/api";
import { GoAlertFill } from "react-icons/go";
import { FaCircleCheck } from "react-icons/fa6";
import Lottie from 'lottie-react';
import loader from '../assets/loader2.json'
import { useEffect } from "react";
import { useProducts } from "../context/ProductsContext";
import { useTheme } from "../context/ThemeContext";

export default function DeleteProduct({ setShow, product, setIsDeleted }) {
    const [input, setInput] = useState('');
    const [loading, setloading] = useState(false);
    const [alert, setAlert] = useState({
        code: 0,
        msg: ""
    })

    const { setCache } = useProducts();
    const {isDark} = useTheme();

    useEffect(() => {
        if (alert.msg) {
            const timer = setTimeout(() => {
                setAlert({
                    code: 0,
                    msg: ""
                });
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [alert.msg]);

    const isMatch = input === "DELETE"

    const deleteProduct = async () => {
        try {
            setloading(true);
            const res = await deleteProductById({ productId: product._id })
            setAlert({
                code: res?.status,
                msg: res?.data?.msg
            });
            setTimeout(() => {
                setCache({});
                setIsDeleted(true);
                setloading(false);
                setShow(false);
            }, 2000);
        } catch (error) {
            console.log(error);
            setAlert({
                code: res?.status,
                msg: res?.data?.msg || "Failed to delete !"
            });
        }
    }

    return (
        <>
            {alert?.msg && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 flex justify-center z-50">
                    <div
                        className={`${alert?.code === 200
                            ? "bg-green-100 text-green-600 border-green-400"
                            : "bg-red-100 text-red-600 border-red-400"
                            } flex justify-center items-center p-2 border-l-4 rounded-md gap-3 px-4 transition-all ease-out animate-fadeDown duration-300 will-change-transform shadow-lg w-fit`}
                    >
                        <div className="flex items-center gap-2">
                            {alert?.code === 200 ? <FaCircleCheck /> : <GoAlertFill />}
                            <p className="tracking-tight text-base font-semibold nunitoFont">
                                {alert?.msg}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <div className={`border-2 rounded-xl min-w-120 max-w-120 zoom-modal ${isDark? "bg-[#0F172A] border-gray-800 shadow-black/50 shadow-xl" : "bg-white border-gray-200 shadow-lg"}`}>
                <div className={`w-full flex justify-between items-center border-b-2 px-1 ${isDark? "border-gray-800" : "border-gray-200"}`}>
                    <h1 className={`font-semibold p-2 ${isDark? "text-gray-300" : "text-gray-800"}`}>Delete Product</h1>
                    <button onClick={() => setShow(false)} className={`cursor-pointer p-2 rounded-lg ${isDark? "text-gray-400 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-200"}`}>
                        <RxCross2 />
                    </button>
                </div>

                <div className={`w-full flex flex-col justify-center items-center p-4 border-b-2 gap-2 font-semibold ${isDark? "border-gray-800" : "border-gray-200"}`}>
                    <img src={product?.thumbnail} alt="" className={`h-20 w-20 object-contain rounded-lg ${isDark? "bg-linear-to-br from-blue-900/40 to-purple-900/40" : "bg-linear-to-br from-blue-100 to-purple-100"}`} />
                    <span className={`text-lg text-center line-clamp-2 ${isDark? "text-white" : "text-gray-700"}`}>{product?.title}</span>
                </div>

                <div className="px-3 py-2 flex flex-col gap-2 font-semibold">
                    <div className={`${isDark? "text-gray-200" : "text-gray-900"}`}>
                        <h1>To confirm, type "DELETE" in the box below</h1>
                        <input
                            type="text"
                            className={`outline-none border-2 rounded-lg w-full p-1 ${isDark? "border-red-700" : "border-red-400"}`}
                            onChange={(e) => setInput(e.target.value)} />
                    </div>


                    <div className={`flex flex-row gap-2 justify-end items-center w-full`}>
                        <button disabled={!isMatch || loading} className={`min-h-9 px-2 py-1 border w-full rounded-lg font-semibold flex justify-center items-center  ${!isMatch ? "cursor-not-allowed opacity-50" : "cursor-pointer"} relative ${isDark? "bg-red-900/20 border-red-700 text-red-400" : "bg-red-100/30 border-red-400 text-red-600"}`} onClick={deleteProduct}>
                            {loading ?
                                <div className='flex absolute z-99 flex-row justify-center items-center left-1/2 -translate-x-1/2'>
                                    <Lottie
                                        animationData={loader}
                                        loop={true}
                                        className="w-50 h-50 hue-rotate-70"
                                    />
                                </div> :
                                <span>Delete this product</span>
                            }
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}