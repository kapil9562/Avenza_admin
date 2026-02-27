import React, { useEffect, useState } from 'react'
import { IoIosArrowDown, IoIosArrowForward } from 'react-icons/io'
import { useTheme } from '../../context/ThemeContext'
import { HiPlus } from "react-icons/hi";
import { FaCircleArrowLeft, FaCircleArrowRight, FaPencil } from "react-icons/fa6";
import { ImBin } from "react-icons/im";
import { useProducts } from '../../context/ProductsContext';
import { getAllCategory, getProducts } from '../../api/api';
import Lottie from 'lottie-react';
import adminLoader from '../../assets/adminLoader.json'
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DeleteProduct from '../../helpers/DeleteProduct';

function Products() {
    const { isDark } = useTheme();
    const [inStock, setStock] = useState("true");
    const [inputValue, setInputValue] = useState("1");
    const [category, setCategory] = useState("All");
    const [page, setPage] = useState(1);
    const [error, setError] = useState('');
    const [openIndex, setOpenIndex] = useState();
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [index, setIdx] = useState();
    const [isDeleted, setIsDeleted] = useState(false);

    const { cache, setProducts, setCache, categories, setCategories, total, setTotal } = useProducts();
    const cacheKey = `${category}-${page}-${inStock}`;
    const products = cache[cacheKey];
    const [loading, setLoading] = useState(!cache.hasOwnProperty(cacheKey));

    const handleStockToggle = () => {
        setStock(inStock === "true" ? "false" : "true");
        setCache({});
        setPage(1);
        setInputValue(1);
    }

    const totalPages = useMemo(() => Math.ceil(total / 30), [total]);
    const skip = (page - 1) * 30;

    const showPagination = total > 30;

    const nextPage = () => {
        const next = Math.min(page + 1, totalPages);
        setPage(next);
        setInputValue(next);
    };

    const prevPage = () => {
        const prev = Math.max(page - 1, 1);
        setPage(prev);
        setInputValue(prev);
    };

    useEffect(() => {
        const getCategories = async () => {
            try {
                const res = await getAllCategory();
                setCategories(res?.data);
            } catch (error) {
                console.log(error);
                setError(error);
            }
        }
        getCategories();
    }, [])

    useEffect(() => {
        if (cache[cacheKey]) return;
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError("");
                const params = { skip, inStock };
                if (category !== "All") params.category = category;

                const res = await getProducts(params);

                if (!res?.data?.total) {
                    setError("No any product found !")
                }

                setTotal(res?.data?.total);

                if (!products) {
                    setProducts(cacheKey, res?.data?.products);
                }

                if (res?.data?.products?.length === 0 && page > 1) {
                    setPage(prev => prev - 1);
                    return;
                }
                setLoading(false);
                setIsDeleted(false);
            } catch (err) {
                setLoading(false);
                setError(err?.response?.data?.message || err?.message || "Something went wrong !")
                console.error(err);
                setIsDeleted(false);
            }
        };

        fetchProducts();
    }, [cacheKey, cacheKey, category, page, inStock, isDeleted]);

    const statusColors = {
        InStock: "bg-green-100 text-green-600 border border-green-300 shadow-md",
        LowStock: "bg-orange-100 text-orange-600 border border-yellow-300 shadow-md",
        OutofStock: "bg-red-100 text-red-600 border border-red-300 shadow-md",
    };

    const handleCategory = (filter) => {
        if (category === filter) return;
        setCache({});
        setCategory(filter);
        setPage(1);
        setInputValue(1);
        setOpenIndex(null);
    }

    return (
        <section className={`p-4 space-y-4 min-h-dvh`}>
            {show &&
                <div className={`absolute top-0 left-0 h-full w-full bg-gray-50/30 z-99 shadow-lg border flex justify-center items-center`}>
                    {products && products[index] && (
                        <DeleteProduct
                            setShow={setShow}
                            product={products[index]}
                            setIsDeleted={setIsDeleted}
                        />
                    )}
                </div>
            }
            <div className='flex flex-row gap-4'>
                <div className={`flex flex-row gap-8 items-center shadow font-semibold w-fit rounded-md px-2 py-1 border relative group cursor-pointer ${isDark ? "" : "border-gray-200 text-gray-700"}`}>
                    <h1>Category</h1>
                    <IoIosArrowDown className={`group-hover:rotate-180 transition-all duration-300 ${isDark ? "text-gray-300" : "text-gray-800"}`} />
                    <div className='absolute group-hover:flex hidden w-fit left-0 top-full z-99 bg-white flex-col border-gray-200 border-2 rounded-md'>
                        <div
                            onClick={() => handleCategory("All")}
                            className='flex flex-row justify-between items-center relative group py-1 px-2 hover:bg-gray-100'>
                            <span>All</span>
                            <IoIosArrowForward />
                        </div>
                        {categories?.map((item, idx) => (
                            <div key={idx} className='flex flex-row justify-between items-center relative group py-1 px-2 hover:bg-gray-100' onMouseEnter={() => setOpenIndex(idx)} onMouseLeave={() => setOpenIndex(null)}>
                                <span className='whitespace-nowrap'>{item.parentCategory}</span>
                                <IoIosArrowForward />

                                <div className={`absolute z-99 left-full w-fit flex-col top-0 ml-0.5 bg-white border-gray-200 border-2 rounded-md ${openIndex === idx ? "flex" : "hidden"}`} >
                                    {item?.categories?.map((sub, i) => (
                                        <span
                                            key={i}
                                            className='whitespace-nowrap py-1 px-2 hover:bg-gray-100'
                                            onClick={() => handleCategory(sub)}>
                                            {sub}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={`flex flex-row gap-4 items-center shadow font-semibold w-fit rounded-md px-2 py-1 border ${isDark ? "" : "border-gray-200 text-gray-700"}`}>
                    <h1>In Stock</h1>
                    <div className='flex justify-center items-center text-[12px]'>
                        <button
                            className={`relative w-13 h-6 rounded-full hidden items-center transition-all  shadow-gray-400 bg-purple-200 duration-500 cursor-pointer ${isDark ? " " : " "} shadow-inner md:flex`}
                            onClick={handleStockToggle}
                        >
                            {/* Knob */}
                            <span className={`absolute w-4 h-4 z-10 rounded-full shadow-md flex items-center justify-center transition-all duration-500 bg-white ${inStock === 'true' ? "translate-x-8" : "translate-x-1"}`}
                            >
                            </span>
                            {inStock === "true" ? (<span className='absolute left-2 text-white font-semibold'>ON</span>) : (<span className='absolute right-2 text-white font-semibold'>OFF</span>)}
                        </button>
                    </div>
                </div>
                <button
                    className={`px-2 py-1 bg-linear-to-b flex flex-row justify-center rounded-lg font-semibold items-center gap-2 from-purple-300 to-purple-500 cursor-pointer active:scale-95 transition-transform duration-300 ${isDark ? "" : "text-white shadow-[0px_3px_8px_rgba(0,0,0,0.24)]"}`}
                    onClick={() => navigate('/addproduct')}>
                    <HiPlus size={26} />
                    <span>Add Product</span>
                </button>
            </div>
            {/* Table Container */}
            <div className={`border-2 rounded-lg overflow-hidden ${isDark ? "" : "border-gray-300 shadow-xl"}`}>

                {/* TABLE */}
                <div className="h-[73vh] overflow-y-auto tableBody scroll-smooth">
                    <table className="w-full border-collapse">

                        {/* Header */}
                        <thead className="sticky top-0 z-50 bg-slate-100 divide-y divide-slate-200">
                            <tr className="text-left divide-x divide-slate-200">
                                <th className="px-4 py-4 w-[5%] font-semibold">Id</th>
                                <th className="px-4 py-4 w-[30%] font-semibold">Product</th>
                                <th className="px-4 py-4 w-[15%] font-semibold">Category</th>
                                <th className="px-4 py-4 w-[12%] font-semibold">Brand</th>
                                <th className="px-4 py-4 w-[8%] font-semibold">Stock</th>
                                <th className="px-4 py-4 w-[10%] font-semibold">Price</th>
                                <th className="px-4 py-4 w-[10%] font-semibold">Status</th>
                                <th className="px-4 py-4 w-[10%] font-semibold">Action</th>
                            </tr>
                        </thead>

                        {/* Body */}
                        <tbody className={`text-gray-800 font-semibold divide-y divide-slate-200 ${products?.length>0 ? "border-b border-b-slate-200": "h-[65vh]"}`}>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-20">
                                        <div className="flex flex-col items-center justify-center relative">
                                            <Lottie
                                                animationData={adminLoader}
                                                loop={true}
                                                className="w-40 h-40"
                                            />
                                            <p className="text-gray-500 font-semibold absolute bottom-4">
                                                Loading...
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="8" className="text-center text-red-500 py-10 font-semibold text-lg">
                                        {error}
                                    </td>
                                </tr>
                            ) : (
                                products?.map((product, idx) => (
                                    <tr key={idx} className="divide-x divide-slate-200">

                                        {/* Id */}
                                        <td className="px-4 py-3 text-gray-500">
                                            #{product.productId}
                                        </td>

                                        {/* Product */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={product.thumbnail}
                                                    alt="thumbnail"
                                                    className="w-14 h-14 object-contain bg-linear-to-br from-blue-100 to-purple-100 rounded-sm"
                                                />
                                                <span className="line-clamp-2">
                                                    {product.title}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-gray-500">
                                            {product.category}
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className='text-gray-600 line-clamp-2'>{product.brand || "-"}</span>
                                        </td>

                                        <td className="px-4 py-3">
                                            {product.stock}
                                        </td>

                                        <td className="px-4 py-3">
                                            ₹{product.price}
                                        </td>

                                        <td className="px-4 py-3">
                                            <button className={`px-4 py-1 rounded-full whitespace-nowrap ${statusColors[product.availabilityStatus.replace(/\s/g, "")]}`}>
                                                {product.availabilityStatus}
                                            </button>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button className="text-purple-600 bg-slate-100 p-2 rounded-lg cursor-pointer" onClick={() => navigate(`/edit-product/${product._id}`)}>
                                                    <FaPencil />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShow(true);
                                                        setIdx(idx);
                                                    }}
                                                    className="text-red-500 bg-slate-100 p-2 rounded-lg cursor-pointer"
                                                >
                                                    <ImBin />
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className='flex flex-row justify-between items-center px-4 border-t-2 border-t-gray-100 min-h-13'>
                    <div>
                        <span className='font-semibold text-gray-400'>Showing {skip + 1} to {(skip + 30) < total ? skip + 30 : total} of {total} entries</span>
                    </div>
                    <div className='flex flex-row gap-4 items-center w-fit'>

                        <span className='font-semibold text-gray-400'>Page {page} of {totalPages}</span>

                        {showPagination && (
                            <div className="flex justify-center items-center">
                                <div className={`${isDark ? " " : ""} flex justify-center items-center p-1 sm:p-2 gap-1 sm:gap-2`}>
                                    {/* Prev */}
                                    <button
                                        onClick={() => {
                                            prevPage();
                                        }}
                                        disabled={page === 1 || loading}
                                        className={`${isDark ? "" : ""} flex flex-row justify-center items-center text-white  disabled:opacity-50 border border-gray-200 shadow  cursor-pointer px-3 py-1 rounded-lg`}
                                    >
                                        <span className='font-semibold text-gray-400'>Prev</span>
                                    </button>

                                    {/* Pages */}
                                    <div className="border font-semibold text-gray-400 border-gray-200 rounded-lg shadow flex justify-center items-center px-1 py-1">
                                        <input
                                            disabled={loading}
                                            type="number"
                                            min="1"
                                            max={totalPages}
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    let value = Number(e.target.value);

                                                    if (value < 1) value = 1;
                                                    if (value > totalPages) value = totalPages;

                                                    setPage(value);
                                                    setInputValue(value);
                                                    e.target.blur();
                                                }
                                            }}
                                            className="min-w-5 text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                    {/* Next */}
                                    <button
                                        onClick={() => {
                                            nextPage();
                                        }}
                                        disabled={page === totalPages || loading}
                                        className={`${isDark ? "" : ""} flex flex-row justify-center items-center text-white  disabled:opacity-50 border border-gray-200 shadow  cursor-pointer px-3 py-1 rounded-lg`}
                                    >
                                        <span className='font-semibold text-gray-400'>Next</span>
                                    </button>
                                </div>
                            </div>

                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Products