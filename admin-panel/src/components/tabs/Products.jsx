import React, { useEffect, useRef, useState } from 'react'
import { IoIosArrowDown, IoIosArrowForward } from 'react-icons/io'
import { HiPlus } from "react-icons/hi";
import { FaPencil, FaPlus } from "react-icons/fa6";
import { ImBin } from "react-icons/im";
import { getAllCategory, getProducts, restoreProduct } from '../../api/api';
import Lottie from 'lottie-react';
import adminLoader from '../../assets/adminLoader.json';
import restoreLoader from '../../assets/loaderIOS.json';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdOutlineRestore } from 'react-icons/md';
import { IoRefresh } from 'react-icons/io5';
import DeleteProduct from '../../helpers/productModals/DeleteProduct';
import { BiFilterAlt } from 'react-icons/bi';
import { Sheet } from "react-modal-sheet";
import { useProducts, useTheme, useToast } from '../../context/Context';

function Products() {
    const { isDark } = useTheme();
    const [inStock, setStock] = useState("true");
    const [deletedItems, setDeletedItems] = useState("false");
    const [inputValue, setInputValue] = useState("1");
    const [category, setCategory] = useState("All");
    const [page, setPage] = useState(1);
    const [error, setError] = useState("");
    const [openIndex, setOpenIndex] = useState();
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [index, setIdx] = useState();
    const [isDeleted, setIsDeleted] = useState(false);
    const [openFilters, setOpenFilters] = useState(false);
    const filterRef = useRef();
    const [openCategory, setOpenCategory] = useState(false);
    const [openSubIndex, setOpenSubIndex] = useState(null);
    const toast = useToast();

    const { cache, setProducts, setCache, categories, setCategories, total, setTotal } = useProducts();
    const cacheKey = `${category}-${page}-${inStock}-${deletedItems}`;
    const products = cache[cacheKey];
    const [loading, setLoading] = useState(!(cache?.[cacheKey]));
    const [restoreLoading, setRestoreLoading] = useState(false);

    // {Stock Toggle}
    const handleStockToggle = () => {
        setStock(inStock === "true" ? "false" : "true");
        setCache({});
        setPage(1);
        setInputValue(1);
    }

    // {Deleted Items Toggle}
    const handleDeletedToggle = () => {
        setDeletedItems(deletedItems === "true" ? "false" : "true");
        setCache({});
        setPage(1);
        setInputValue(1);
    }

    // {Pagination handlers}
    const totalPages = useMemo(() => Math.ceil(total / 20), [total]);
    const skip = (page - 1) * 20;
    const showPagination = total > 20;

    // {Next page handler}
    const nextPage = () => {
        const next = Math.min(page + 1, totalPages);
        setPage(next);
        setInputValue(next);
    };

    // {Previous page handler}
    const prevPage = () => {
        const prev = Math.max(page - 1, 1);
        setPage(prev);
        setInputValue(prev);
    };

    // {Fetch Categories}
    useEffect(() => {
        const getCategories = async () => {
            try {
                setError("");
                const res = await getAllCategory();
                setCategories(res?.data);
            } catch (error) {
                const msg = error?.response?.data?.message || error?.message || "Something went wrong !"
                setError(msg);
            }
        }
        getCategories();
    }, [setCategories])

    // {Fetch Products}
    useEffect(() => {
        if (cache[cacheKey]) return;
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError("");
                const params = { skip, inStock, deletedItems };
                if (category !== "All") params.category = category;

                const res = await getProducts(params);

                if (res?.data?.total === 0) {
                    setError("No products found");
                }

                setTotal(res?.data?.total);

                if (!products) {
                    setProducts(cacheKey, res?.data?.products);
                }

                if (res?.data?.products?.length === 0 && page > 1) {
                    setPage(prev => prev - 1);
                    return;
                }

            } catch (err) {
                const msg = err?.response?.data?.message || err?.message || "Something went wrong !"
                setError(msg);
            } finally {
                setLoading(false);
                setIsDeleted(false);
            }
        };

        fetchProducts();
    }, [cacheKey, category, page, inStock, isDeleted, cache, products, setProducts, setTotal, skip, deletedItems]);

    const statusColors = {
        InStock: isDark
            ? "bg-green-900/40 text-green-400 border border-green-700"
            : "bg-green-100 text-green-600 border border-green-300 shadow-md",

        LowStock: isDark
            ? "bg-yellow-900/40 text-yellow-400 border border-yellow-700"
            : "bg-orange-100 text-orange-600 border border-yellow-300 shadow-md",

        OutofStock: isDark
            ? "bg-red-900/40 text-red-400 border border-red-700"
            : "bg-red-100 text-red-600 border border-red-300 shadow-md",
    };

    // { Category filter handler }
    const handleCategory = (filter) => {
        if (category === filter) return;
        setCache({});
        setCategory(filter);
        setPage(1);
        setInputValue(1);
        setOpenIndex(null);
    }

    const handleRestore = async (productId) => {
        if (!productId) return;
        try {
            setError("")
            setRestoreLoading(productId);
            const res = await restoreProduct({ productId });
            toast.success(res?.data?.message);
            setCache((prev) => {
                const updated = prev[cacheKey].filter(
                    (item) => item._id !== productId
                );

                if (updated.length === 0) {
                    setError("No product found");
                }

                return {
                    ...prev,
                    [cacheKey]: updated,
                };
            });
        } catch (error) {
            const msg = error?.response?.data?.message || error?.data?.message || "Something went wrong!"
            toast.error(msg);
        } finally {
            setRestoreLoading(false);
        }
    }

    const clearFilters = () => {
        setCache({});
        setStock("true");
        setDeletedItems("false");
    }

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (
                filterRef.current &&
                !filterRef.current.contains(e.target)
            ) {
                setOpenFilters(false);
            }
        };

        const handleScroll = () => {
            setOpenFilters(false);
        };

        document.addEventListener("mousedown", handleOutsideClick);
        window.addEventListener("scroll", handleScroll, true);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, []);

    const touchStartY = useRef(0);

    const handleTouchStart = (e) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const distance = touchEndY - touchStartY.current;

        // swipe down > 60px
        if (distance > 60) {
            setOpenFilters(false);
        }
    };

    return (
        <section className={`md:p-4 p-2 md:space-y-4 space-y-2 md:h-[calc(100dvh-60px)] w-full ${isDark ? "bg-[#0F172A]" : "bg-[#F9F9FF]"}`}>
            {show &&
                <div className={`absolute top-0 left-0 h-full w-full z-99 shadow-lg border flex justify-center items-center ${isDark ? "bg-gray-900/50" : "bg-gray-50/30"}`}>
                    {products && products[index] && (
                        <DeleteProduct
                            setShow={setShow}
                            product={products[index]}
                            setIsDeleted={setIsDeleted}
                        />
                    )}
                </div>
            }

            {/* Category Filter */}
            <div className='flex flex-row gap-4 justify-between md:justify-start'>
                <div
                    className={`flex flex-row gap-8 items-center shadow font-semibold w-fit rounded-md px-2 py-1 relative group cursor-pointer ${isDark
                        ? "border-slate-700 text-gray-300 border-2"
                        : "border border-gray-200 text-gray-700"
                        }`}
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpenCategory((p) => !p);
                    }}
                    onMouseLeave={() => setOpenCategory(false)}
                >
                <h1>Category</h1>

                <IoIosArrowDown
                    className={`transition-all duration-300 ${openCategory ? "rotate-180" : "group-hover:rotate-180"
                        } ${isDark ? "text-gray-300" : "text-gray-800"}`}
                />

                <div
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute left-0 top-full z-999 min-w-55 flex-col border-2 rounded-md ${openCategory
                        ? "flex"
                        : "hidden group-hover:flex"
                        } ${isDark
                            ? "bg-[#0F172A] border-slate-700"
                            : "bg-white border-gray-200"
                        }`}
                >
                    <div
                        onClick={() => {
                            handleCategory("All");
                            setOpenCategory(false);
                            setOpenSubIndex(null);
                        }}
                        className={`flex flex-row justify-between items-center py-2 px-3 rounded-sm cursor-pointer ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-100"
                            }`}
                    >
                        <span>All</span>
                    </div>

                    {categories?.map((item, idx) => (
                        <div
                            key={idx}
                            className={`relative group/sub ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-100"
                                }`}
                            onMouseEnter={() => setOpenSubIndex(idx)}
                            onMouseLeave={() => {
                                if (!openCategory) {
                                    setOpenSubIndex(null);
                                }
                            }}
                        >
                            <div
                                className="flex flex-row justify-between items-center py-2 px-3 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenSubIndex(
                                        openSubIndex === idx ? null : idx
                                    );
                                }}
                            >
                                <span className="whitespace-nowrap">
                                    {item.parentCategory}
                                </span>

                                <IoIosArrowForward
                                    className={`transition-transform duration-300 ${openSubIndex === idx ? "rotate-90" : ""
                                        }`}
                                />
                            </div>

                            <div
                                className={`absolute left-full top-0 ml-0.5 z-999 min-w-45 flex-col border-2 rounded-md ${openSubIndex === idx
                                    ? "flex"
                                    : "hidden group-hover/sub:flex"
                                    } ${isDark
                                        ? "bg-[#0F172A] border-slate-700"
                                        : "bg-white border-gray-200"
                                    }`}
                            >
                                {item?.categories?.map((sub, i) => (
                                    <span
                                        key={i}
                                        className={`whitespace-nowrap py-2 px-3 cursor-pointer ${isDark
                                            ? "hover:bg-slate-800"
                                            : "hover:bg-gray-100"
                                            }`}
                                        onClick={() => {
                                            handleCategory(sub?.name);
                                            setOpenCategory(false);
                                            setOpenSubIndex(null);
                                        }}
                                    >
                                        {sub?.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* In Stock Toggle */}
            <div className={`hidden md:flex flex-row gap-4 items-center font-semibold w-fit rounded-md px-2 py-1 ${isDark ? "border-2 border-slate-700 text-gray-300" : "border border-gray-200 text-gray-700 shadow"}`}>
                <h1>In Stock</h1>
                <div className='flex justify-center items-center text-[12px]'>
                    <button
                        className={`relative w-13 h-6 rounded-full items-center transition-all bg-purple-300 duration-500 cursor-pointer border ${isDark ? "shadow-black border-gray-300 bg-purple-400" : "shadow-gray-400 border-transparent"} shadow-inner flex`}
                        onClick={handleStockToggle}
                        disabled={loading}
                    >
                        {/* Knob */}
                        <span className={`absolute w-4 h-4 z-10 rounded-full flex items-center justify-center transition-transform duration-500 ${inStock === 'true' ? "translate-x-8" : "translate-x-1"} ${isDark ? "bg-[#1b2744] shadow-gray-600 shadow" : "bg-white shadow-md"}`}
                        >
                        </span>
                        {inStock === "true" ? (<span className='absolute left-2 text-white font-semibold'>ON</span>) : (<span className='absolute right-2 text-white font-semibold'>OFF</span>)}
                    </button>
                </div>
            </div>

            {/* Deleted items Toggle */}
            <div className={`hidden md:flex flex-row gap-4 items-center font-semibold w-fit rounded-md px-2 py-1 ${isDark ? "border-2 border-slate-700 text-gray-300" : "border border-gray-200 text-gray-700 shadow"}`}>
                <h1>Deleted items</h1>
                <div className='flex justify-center items-center text-[12px]'>
                    <button
                        className={`relative w-13 h-6 rounded-full items-center transition-all bg-purple-300 duration-500 cursor-pointer border ${isDark ? "shadow-black border-gray-300 bg-purple-400" : "shadow-gray-400 border-transparent"} shadow-inner flex`}
                        onClick={handleDeletedToggle}
                        disabled={loading}
                    >
                        {/* Knob */}
                        <span className={`absolute w-4 h-4 z-10 rounded-full flex items-center justify-center transition-transform duration-500 ${deletedItems === 'true' ? "translate-x-8" : "translate-x-1"} ${isDark ? "bg-[#1b2744] shadow-gray-600 shadow" : "bg-white shadow-md"}`}
                        >
                        </span>
                        {deletedItems === "true" ? (<span className='absolute left-2 text-white font-semibold'>ON</span>) : (<span className='absolute right-2 text-white font-semibold'>OFF</span>)}
                    </button>
                </div>
            </div>

            <button
                className={`px-2 py-1 bg-linear-to-b hidden md:flex flex-row justify-center rounded-lg font-semibold items-center gap-2 from-purple-300 to-purple-500 cursor-pointer active:scale-95 transition-transform duration-300 text-white ${isDark ? "shadow-[0px_3px_8px_rgba(0,0,0,1)]" : "shadow-[0px_3px_8px_rgba(0,0,0,0.24)]"}`}
                onClick={() => navigate('/addproduct')}>
                <HiPlus size={26} />
                <span>Add Product</span>
            </button>

            <button
                onClick={() => setOpenFilters((p) => !p)}
                className={`flex md:hidden flex-row gap-2 items-center font-semibold w-fit rounded-md ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
                <BiFilterAlt className="text-base" />
                <span>Filters</span>
            </button>

            {/* Filter Dropdown */}
            <Sheet isOpen={openFilters} onClose={() => setOpenFilters(false)}>
                <Sheet.Backdrop onClick={(e) => e.stopPropagation()} />

                <Sheet.Container className={`${isDark ? "bg-slate-900! text-white!" : "bg-white!"} max-h-fit`}>
                    <Sheet.Header />

                    <Sheet.Content>
                        <div ref={filterRef} className="px-5 pb-8">

                            <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-slate-800"}`}>
                                Filters
                            </h3>

                            {/* In Stock */}
                            <div className={`flex items-center justify-between rounded-2xl px-4 py-3 mb-3 ${isDark ? "bg-slate-800 text-slate-200" : "bg-slate-50 text-slate-700 border border-slate-200"}`}>
                                <div className="flex flex-col">
                                    <h4 className="font-medium">In Stock</h4>
                                    <p className="text-xs opacity-70">Show available products only</p>
                                </div>

                                <button
                                    onClick={handleStockToggle}
                                    disabled={loading}
                                    className={`relative flex h-7 w-14 items-center rounded-full transition-all duration-300 ${inStock === "true" ? "bg-purple-500" : isDark ? "bg-slate-600" : "bg-slate-300"}`}
                                >
                                    <span className={`absolute h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${inStock === "true" ? "translate-x-8" : "translate-x-1"}`} />
                                </button>
                            </div>

                            {/* Deleted Items */}
                            <div className={`flex items-center justify-between rounded-2xl px-4 py-3 ${isDark ? "bg-slate-800 text-slate-200" : "bg-slate-50 text-slate-700 border border-slate-200"}`}>
                                <div className="flex flex-col">
                                    <h4 className="font-medium">Deleted Items</h4>
                                    <p className="text-xs opacity-70">Show deleted products only</p>
                                </div>

                                <button
                                    onClick={handleDeletedToggle}
                                    disabled={loading}
                                    className={`relative flex h-7 w-14 items-center rounded-full transition-all duration-300 ${deletedItems === "true" ? "bg-red-500" : isDark ? "bg-slate-600" : "bg-slate-300"}`}
                                >
                                    <span className={`absolute h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${deletedItems === "true" ? "translate-x-8" : "translate-x-1"}`} />
                                </button>
                            </div>

                        </div>
                    </Sheet.Content>
                </Sheet.Container>
            </Sheet>

            {/* Add Product Btn for Small screen */}
            <div
                className={`fixed md:hidden right-5 bottom-5 z-50 flex h-15 w-15 items-center justify-center rounded-full transition-transform duration-300 active:scale-95 cursor-pointer ${isDark ? "bg-purple-500 text-white border-2 border-slate-800 shadow-md" : "bg-linear-to-br from-purple-400 to-violet-500 text-white border border-white shadow-md"}`}
                onClick={() => navigate('/addproduct')}
            >
                <FaPlus size={24} />
            </div>
        </div>


            {/* Table Container */ }
    <div className={`border-2 rounded-lg overflow-x-auto ${isDark ? "border-gray-800 shadow-md shadow-[#0d1423]" : "border-gray-300 shadow-md"}`}>

        {/* TABLE */}
        <div className="md:h-[70dvh] h-[60dvh] overflow-y-auto tableBody scroll-smooth">
            <table className="w-full border-collapse">

                {/* Header */}
                {(!error && !loading) &&
                    <thead className={`sticky top-0 z-50 ${isDark ? " bg-slate-800 text-gray-100" : "bg-slate-100"}`}>
                        <tr className={`text-left divide-slate-200 divide-x ${isDark ? "divide-slate-700" : "divide-slate-200"}`}>
                            <th className="px-4 py-4 w-[5%] font-semibold">Id</th>
                            <th className="px-4 py-4 min-w-70 w-[30%] font-semibold">Product</th>
                            <th className="px-4 py-4 w-[15%] font-semibold">Category</th>
                            <th className="px-4 py-4 w-[12%] font-semibold">Brand</th>
                            <th className="px-4 py-4 w-[8%] font-semibold">Stock</th>
                            <th className="px-4 py-4 w-[10%] font-semibold">Price</th>
                            <th className="px-4 py-4 w-[10%] font-semibold">Status</th>
                            <th className="px-4 py-4 w-[10%] font-semibold">Action</th>
                        </tr>
                    </thead>
                }

                {/* Body */}
                <tbody className={`font-semibold divide-y ${isDark ? "divide-slate-700 text-gray-300" : "divide-slate-200 text-gray-800"} ${products?.length > 0 ? (isDark ? "border-b border-b-slate-800" : "border-b border-b-slate-200") : "md:h-[70vh] h-[55dvh]"}`}>
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
                            <td colSpan="8" className="md:py-10">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className={`${isDark ? "bg-purple-800/10" : "bg-purple-100/50"} rounded-full p-5 flex items-center justify-center`}>
                                        <img
                                            src="/noResult.webp"
                                            alt="img"
                                            className="md:h-40 md:w-40 h-30 w-30 object-contain"
                                        />
                                    </div>
                                    <h4 className={`${isDark ? "text-gray-300" : "text-gray-800"} font-bold text-2xl`}>
                                        {error}
                                    </h4>
                                    <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-center px-10 font-semibold text-sm mt-2`}>
                                        We couldn't find any products matching your current filters.
                                    </p>
                                    <button
                                        className={`p-2 flex flex-row justify-center rounded-lg font-semibold items-center gap-1 cursor-pointer active:scale-95 transition-transform duration-300 will-change-transform text-sm mt-4 text-purple-600 border ${isDark ? "bg-purple-600/10  border-purple-600 hover:brightness-110" : "bg-purple-100 border-purple-200 hover:bg-purple-200/60"}`}
                                        onClick={() => clearFilters()}
                                    >
                                        <IoRefresh size={24} />
                                        <span>Refresh Products</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        products?.map((product, idx) => (
                            <ProductData key={idx}
                                product={product}
                                idx={idx}
                                isDark={isDark}
                                statusColors={statusColors}
                                navigate={navigate}
                                handleRestore={handleRestore}
                                restoreLoading={restoreLoading}
                                setShow={setShow}
                                setIdx={setIdx}
                            />
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* Pagination */}
        <div className={`flex md:flex-row flex-col md:justify-between md:items-center px-4 border-t-2 min-h-13 ${isDark ? "border-t-gray-800" : "border-t-gray-100"}`}>
            <div>
                <span className='font-semibold text-gray-400'>Showing {total > 0 ? (skip + 1) : "0"} to {(skip + 20) < total ? skip + 20 : total} of {total} entries</span>
            </div>
            <div className='flex flex-row gap-4 items-center justify-between w-full md:w-fit'>

                <span className='font-semibold text-gray-400'>Page {totalPages > 0 ? page : "0"} of {totalPages}</span>

                {showPagination && (
                    <div className="flex justify-center items-center">
                        <div className={`${isDark ? " " : ""} flex justify-center items-center p-1 sm:p-2 gap-1 sm:gap-2`}>
                            {/* Prev */}
                            <button
                                onClick={() => {
                                    prevPage();
                                }}
                                disabled={page === 1 || loading}
                                className={`${isDark ? "border-gray-700 text-gray-300 border-2" : "border-gray-200 text-white"} flex flex-row justify-center items-center disabled:opacity-50 border shadow  cursor-pointer px-3 py-1 rounded-lg disabled:cursor-not-allowed`}
                            >
                                <span className='font-semibold text-gray-400'>Prev</span>
                            </button>

                            {/* Pages */}
                            <div className={`border font-semibold text-gray-400 rounded-lg shadow flex justify-center items-center px-1 py-1 ${isDark ? "border-gray-700 border-2" : "border-gray-200"}`}>
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
                                className={`${isDark ? "border-gray-700 text-gray-300 border-2" : "border-gray-200 text-white"} flex flex-row justify-center items-center disabled:opacity-50 border shadow  cursor-pointer px-3 py-1 rounded-lg disabled:cursor-not-allowed`}
                            >
                                <span className='font-semibold text-gray-400'>Next</span>
                            </button>
                        </div>
                    </div>

                )}
            </div>
        </div>
    </div>
        </section >
    )
}

const ProductData = ({ product, idx, setIdx, setShow, restoreLoading, handleRestore, navigate, statusColors, isDark }) => {
    return (
        <tr key={idx} className={`divide-x ${isDark ? "divide-slate-700" : "divide-slate-200"}`}>

            {/* Id */}
            <td className={`px-4 py-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                #{product.productId}
            </td>

            {/* Product */}
            <td className="px-4 py-1">
                <div className="flex items-center gap-4">
                    <img
                        src={product.thumbnail}
                        alt="thumbnail"
                        loading='lazy'
                        className={`min-w-14 min-h-14 max-w-14 max-h-14 object-contain rounded-sm ${isDark ? "bg-linear-to-br from-blue-900/40 to-purple-900/40" : "bg-linear-to-br from-blue-100 to-purple-100"}`}
                    />
                    <span className="line-clamp-2">
                        {product.title}
                    </span>
                </div>
            </td>

            <td className={`px-4 py-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {product.category}
            </td>

            <td className="px-4 py-1">
                <span className={`line-clamp-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{product.brand || "-"}</span>
            </td>

            <td className="px-4 py-1">
                {product.stock}
            </td>

            <td className="px-4 py-1">
                ₹{product.price.toLocaleString("en-IN")}
            </td>

            <td className="px-4 py-1">
                <button className={`px-4 py-1 rounded-full whitespace-nowrap ${statusColors[product.availabilityStatus.replace(/\s/g, "")]}`}>
                    {product.availabilityStatus}
                </button>
            </td>

            <td className="px-4 py-1">
                <div className="flex gap-2">
                    <button
                        title='Edit'
                        className={`text-purple-600 p-2 rounded-lg cursor-pointer max-h-9 max-w-9 min-h-9 min-w-9 flex items-center justify-center ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
                        onClick={() => navigate(`/edit-product/${product?._id}`)}
                    >
                        <FaPencil size={16} />
                    </button>
                    {product?.isDeleted ? (
                        <button
                            title='Restore'
                            onClick={() => {
                                handleRestore(product?._id);
                            }}
                            disabled={restoreLoading}
                            className={`text-green-500 bg-slate-100 p-2 rounded-lg cursor-pointer max-h-9 max-w-9 min-h-9 min-w-9 flex items-center justify-center ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
                        >
                            {restoreLoading === product?._id ? (
                                <Lottie
                                    animationData={restoreLoader}
                                    loop={true}
                                    size={20}
                                    className='min-h-8 min-w-8'
                                />
                            ) : (
                                <MdOutlineRestore size={20} />
                            )}
                        </button>
                    ) : (
                        <button
                            title='Delete'
                            onClick={() => {
                                setShow(true);
                                setIdx(idx);
                            }}
                            className={`text-red-500 bg-slate-100 p-2 rounded-lg cursor-pointer ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
                        >
                            <ImBin />
                        </button>
                    )}
                </div>
            </td>

        </tr>
    )
}

export default Products