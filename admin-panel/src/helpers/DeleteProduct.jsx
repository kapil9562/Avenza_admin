import { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { deleteProductById } from "../api/api";
import { GoAlertFill } from "react-icons/go";
import { FaCircleCheck } from "react-icons/fa6";
import Lottie from 'lottie-react';
import loader from '../assets/loader2.json'
import { useEffect } from "react";
import { useProducts } from "../context/ProductsContext";

export default function DeleteProduct({ setShow, product, setIsDeleted }) {
    const [input, setInput] = useState('');
    const [loading, setloading] = useState(false);
    const [alert, setAlert] = useState({
        code: 0,
        msg: ""
    })

    const { setCache } = useProducts();

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
            <div className="bg-white shadow-lg border-2 border-gray-200 rounded-xl min-w-120 max-w-120 zoom-modal">
                <div className="w-full flex justify-between items-center border-b-2 border-gray-200 px-1 ">
                    <h1 className="font-semibold p-2">Delete Product</h1>
                    <button onClick={() => setShow(false)} className="cursor-pointer text-gray-700 hover:bg-gray-200 p-2 rounded-lg">
                        <RxCross2 />
                    </button>
                </div>

                <div className="w-full flex flex-col justify-center items-center p-4 border-b-2 border-gray-200 gap-2 font-semibold">
                    <img src={product?.thumbnail} alt="" className="h-20 w-20 object-contain bg-slate-200 rounded-lg" />
                    <span className="text-lg text-gray-700 text-center line-clamp-2">{product?.title}</span>
                </div>

                <div className="px-3 py-2 flex flex-col gap-2 font-semibold">
                    <div className="">
                        <h1>To confirm, type "DELETE" in the box below</h1>
                        <input
                            type="text"
                            className="outline-none border-2 border-red-400 rounded-lg w-full p-1"
                            onChange={(e) => setInput(e.target.value)} />
                    </div>


                    <div className={`flex flex-row gap-2 justify-end items-center w-full`}>
                        <button disabled={!isMatch || loading} className={`min-h-9 px-2 py-1 border bg-red-100/30 border-red-400 text-red-600 w-full rounded-lg font-semibold flex justify-center items-center  ${!isMatch ? "cursor-not-allowed opacity-50" : "cursor-pointer"} relative`} onClick={deleteProduct}>
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