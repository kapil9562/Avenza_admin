import React, { useEffect, useState } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { useDropzone } from "react-dropzone";
import { FaCircleCheck, FaCirclePlus } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { HiPlus } from "react-icons/hi2";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { addProduct } from "../api/api";
import Lottie from 'lottie-react';
import loader2 from '../assets/loader.json'
import { GoAlertFill } from "react-icons/go";
import { useParams } from "react-router-dom";
import { getSingleProduct, updateProduct } from "../api/api";
import { useProducts } from "../context/ProductsContext";

function AddProduct() {

    const { id } = useParams();
    const isEdit = Boolean(id);
    const { setCache } = useProducts();
    const [originalProduct, setOriginalProduct] = useState(null);
    const { isDark } = useTheme();

    const [preview, setPreview] = useState(null);
    const [parent, setParent] = useState("");
    const [sub, setSub] = useState("");
    const [openParent, setOpenParent] = useState(false);
    const [openSub, setOpenSub] = useState(false);
    const navigate = useNavigate();

    const categories = {
        "Beauty": ["skin-care", "fragrances", "beauty", "hair-care", "face-care", "organic-beauty"],
        "Electronics": ["smartphones", "mobile-accessories", "tablets", "laptops", "Laptop"],
        "Fashion": ["sunglasses", "ethnic-wear", "western-wear", "sportswear", "winter-wear", "kids-fashion"],
        "Groceries": ["groceries"],
        "Home & Living": ["furniture", "home-decoration", "kitchen-accessories"],
        "Men": ["mens-jacket", "mens-shirts", "mens-T-Shirts", "mens-watches", "mens-shoes"],
        "Sports & Outdoors": ["sports-accessories"],
        "Vehicles": ["vehicle", "motorcycle"],
        "Women": ["tops", "womens-bags", "womens-dresses", "womens-shoes", "womens-watches", "womens-jewellery"]
    };

    const [qrPreview, setQrPreview] = useState(null);

    const [product, setProduct] = useState({
        title: "",
        description: "",
        category: "",
        parentCategory: "",
        price: "",
        discountPercentage: "",
        rating: "",
        stock: "",
        tags: [],
        brand: "",
        sku: "",
        weight: "",

        dimensions: {
            width: "",
            height: "",
            depth: ""
        },

        warrantyInformation: "",
        shippingInformation: "",
        returnPolicy: "",
        minimumOrderQuantity: 1,

        images: [],
        thumbnail: "",

        meta: {
            barcode: "",
            qrCode: ""
        }
    });

    useEffect(() => {
        if (isEdit) {
            const fetchProduct = async () => {
                const res = await getSingleProduct({ productId: id });
                const data = res?.data?.products[0];
                const formattedImages = data.images?.map(url => ({
                    id: crypto.randomUUID(),
                    file: null,
                    preview: url,
                    isExisting: true
                }));

                setProduct({
                    ...data,
                    images: formattedImages
                });

                setOriginalProduct(data);

                setParent(data?.parentCategory);
                setSub(data?.category);
                setPreview(data?.thumbnail);
            };

            fetchProduct();
        }
    }, [id]);

    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({
        code: 0,
        msg: ""
    });

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({ ...product, [name]: value });
    };

    const handleDimensionChange = (e) => {
        const { name, value } = e.target;

        setProduct({
            ...product,
            dimensions: {
                ...product.dimensions,
                [name]: value
            }
        });
    };

    // Handle thumbnail upload
    const handleThumbnail = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProduct({ ...product, thumbnail: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    // Handle image upload
    const MAX_IMAGES = 4;

    const handleRemoveImage = (id) => {
        setProduct(prev => {
            const updatedImages = prev.images.filter(img => {
                if (img.id === id && img.preview) {
                    URL.revokeObjectURL(img.preview);
                }
                return img.id !== id;
            });

            return {
                ...prev,
                images: updatedImages
            };
        });
    };

    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            setProduct(prev => ({
                ...prev,
                thumbnail: file
            }));
        }
    };

    const onDropImgs = (acceptedFiles) => {
        const existingImages = product.images || [];
        const remainingSlots = MAX_IMAGES - existingImages.length;

        if (remainingSlots <= 0) {
            setAlert({
                code: 1,
                msg: "You can upload maximum 4 images"
            });
            return;
        }

        const filesToAdd = acceptedFiles.slice(0, remainingSlots);

        const newImages = filesToAdd.map(file => ({
            id: crypto.randomUUID(),
            file,
            preview: URL.createObjectURL(file),
            isExisting: false
        }));

        setProduct(prev => ({
            ...prev,
            images: [...(prev.images || []), ...newImages]
        }));
    };

    const { getRootProps, getInputProps } = useDropzone({
        accept: { "image/*": [] },
        onDrop,
    });

    const { getRootProps: getImgsRootProps,
        getInputProps: getImgsInputProps } = useDropzone({
            accept: { "image/*": [] },
            onDrop: onDropImgs,
        });

    const handleTags = (e) => {
        setProduct(prev => ({
            ...prev,
            tags: e.target.value.split(",").map(tag => tag.trim())
        }));
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: value === "" ? "" : Number(value)
        }));
    };

    const handleMetaChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({
            ...prev,
            meta: {
                ...prev.meta,
                [name]: value
            }
        }));
    };

    const handleQR = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProduct(prev => ({
                ...prev,
                meta: {
                    ...prev.meta,
                    qrCode: file
                }
            }));
            setQrPreview(URL.createObjectURL(file));
        }
    };

    useEffect(() => {
        return () => {
            product.images?.forEach(img => {
                if (!img.isExisting && img.preview) {
                    URL.revokeObjectURL(img.preview);
                }
            });

            if (preview && preview.startsWith("blob:")) {
                URL.revokeObjectURL(preview);
            }

            if (qrPreview && qrPreview.startsWith("blob:")) {
                URL.revokeObjectURL(qrPreview);
            }
        };
    }, []);

    const isChanged = () => {
        if (!originalProduct) return false;

        // Basic Fields
        if (product.title?.trim() !== originalProduct.title) return true;
        if (product.description?.trim() !== originalProduct.description) return true;
        if (product.category !== originalProduct.category) return true;
        if (product.parentCategory !== originalProduct.parentCategory) return true;
        if (+product.price !== +originalProduct.price) return true;
        if (+product.discountPercentage !== +originalProduct.discountPercentage) return true;
        if (+product.rating !== +originalProduct.rating) return true;
        if (+product.stock !== +originalProduct.stock) return true;
        if (product.brand?.trim() !== originalProduct.brand) return true;
        if (product.sku?.trim() !== originalProduct.sku) return true;
        if (+product.weight !== +originalProduct.weight) return true;
        if (+product.minimumOrderQuantity !== +originalProduct.minimumOrderQuantity) return true;

        if (product.warrantyInformation?.trim() !== originalProduct.warrantyInformation) return true;
        if (product.shippingInformation?.trim() !== originalProduct.shippingInformation) return true;
        if (product.returnPolicy?.trim() !== originalProduct.returnPolicy) return true;

        // Tags
        const currentTags = product.tags?.join(",") || "";
        const originalTags = originalProduct.tags?.join(",") || "";
        if (currentTags !== originalTags) return true;

        // Dimensions
        if (+product.dimensions?.width !== +originalProduct.dimensions?.width) return true;
        if (+product.dimensions?.height !== +originalProduct.dimensions?.height) return true;
        if (+product.dimensions?.depth !== +originalProduct.dimensions?.depth) return true;

        // Meta
        if (product.meta?.barcode?.trim() !== originalProduct.meta?.barcode) return true;

        // QR Code changed?
        if (product.meta?.qrCode instanceof File) return true;

        // Thumbnail changed?
        if (product.thumbnail instanceof File) return true;

        // New Image Added?
        if (product.images?.some(img => img.file)) return true;

        // Image Deleted?
        const originalImageCount = originalProduct.images?.length || 0;
        const currentImageCount = product.images?.length || 0;
        if (originalImageCount !== currentImageCount) return true;

        return false;
    };

    const handleSubmit = async () => {
        if (!isEdit && (
            !product.title ||
            !product.price ||
            !product.category ||
            !product.description ||
            (product.stock === null || product.stock === undefined) ||
            !product.discountPercentage ||
            !product.brand ||
            !product.sku ||
            !product.weight ||
            !product.parentCategory ||
            !product.thumbnail ||
            product.images.length === 0 ||
            product.tags.length === 0 ||
            !product.warrantyInformation ||
            !product.shippingInformation ||
            !product.returnPolicy ||
            !product.minimumOrderQuantity)
        ) {
            setAlert({
                code: 1,
                msg: "Please fill required fields"
            });
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();

            // Basic fields
            formData.append("title", product.title);
            formData.append("productId", ((product?.productId) ? product?.productId : ""));
            formData.append("description", product.description);
            formData.append("category", product.category);
            formData.append("parentCategory", product.parentCategory);
            formData.append("price", product.price);
            formData.append("discountPercentage", product.discountPercentage);
            formData.append("rating", product.rating);
            formData.append("stock", product.stock);
            formData.append("brand", product.brand);
            formData.append("sku", product.sku);
            formData.append("weight", product.weight);

            // Dimensions (object ko string me)
            formData.append("dimensions", JSON.stringify(product.dimensions));

            // Tags array
            formData.append("tags", JSON.stringify(product.tags));

            // Other fields
            formData.append("warrantyInformation", product.warrantyInformation);
            formData.append("shippingInformation", product.shippingInformation);
            formData.append("returnPolicy", product.returnPolicy);
            formData.append("minimumOrderQuantity", product.minimumOrderQuantity);

            // Meta
            formData.append("barcode", product.meta.barcode);

            if (product.meta.qrCode) {
                formData.append("qrCode", product.meta.qrCode);
            }

            // Thumbnail
            if (product.thumbnail instanceof File) {
                formData.append("thumbnail", product.thumbnail);
            }


            const existingImages = product.images
                .filter(img => img.isExisting)
                .map(img => img.preview);

            formData.append("existingImages", JSON.stringify(existingImages));


            product.images.forEach((img) => {
                if (img.file) {
                    formData.append("images", img.file);
                }
            });

            let res;

            if (isEdit) {

                if (!isChanged()) {
                    setAlert({
                        code: 1,
                        msg: "No changes detected"
                    });
                    setLoading(false);
                    return;
                }

                res = await updateProduct(id, formData);
                setAlert({ code: 2, msg: "Product updated successfully." });
                setCache({});
                setTimeout(() => {
                    navigate('/products');
                }, 2000);
            } else {
                res = await addProduct(formData);
                setAlert({ code: 2, msg: "Product added successfully." });
                setCache({});
                setTimeout(() => {
                    navigate('/products');
                }, 2000);
            }
            console.log(res);

            setLoading(false);

            setProduct({
                productId: "",
                title: "",
                description: "",
                category: "",
                parentCategory: "",
                price: "",
                discountPercentage: "",
                rating: "",
                stock: "",
                tags: [],
                brand: "",
                sku: "",
                weight: "",
                dimensions: { width: "", height: "", depth: "" },
                warrantyInformation: "",
                shippingInformation: "",
                returnPolicy: "",
                minimumOrderQuantity: 1,
                images: [],
                thumbnail: "",
                meta: { barcode: "", qrCode: "" }
            });

            setPreview(null);
            setQrPreview(null);

        } catch (error) {
            console.log("Add product error ::", error);
            setLoading(false);
            setAlert({
                code: 1,
                msg: error?.response?.data?.message || error?.message || "something went wrong !"
            });
        }
    };

    return (
        <div className={`p-6 overflow-y-scroll scroll-smooth max-h-[calc(100dvh-60px)] w-fit lg:w-full pb-20 relative ${isDark ? "bg-[#0F172A]" : "bg-[#F9F9FF]"}`}>
            {alert?.code === 1 &&
                <div className='fixed top-20 left-1/2 flex justify-center z-50'>
                    <div className={`bg-red-100 text-red-600 flex justify-center items-center p-1 border-l-3 border-red-400 rounded-md gap-5 px-2 z-999 transition-all ease-out animate-fadeDown duration-300 will-change-transform shadow-lg w-fit`}>
                        <div className='w-fit flex justify-center items-center flex-row gap-2'>
                            <GoAlertFill />
                            <p className='tracking-tight text-lg font-semibold nunitoFont'>{alert?.msg}</p>
                        </div>
                    </div>
                </div>
            }
            {alert?.code === 2 &&
                <div className='fixed top-20 left-1/2 flex justify-center z-50'>
                    <div className={`bg-green-100 text-green-600 flex justify-center items-center p-1 border-l-3 border-green-400 rounded-md gap-5 px-2 z-999 transition-all ease-out animate-fadeDown duration-300 will-change-transform shadow-lg w-fit`}>
                        <div className='w-fit flex justify-center items-center flex-row gap-2'>
                            <FaCircleCheck />
                            <p className='tracking-tight text-lg font-semibold nunitoFont'>{alert?.msg}</p>
                        </div>
                    </div>
                </div>
            }
            <div className="rounded-xl space-y-4">
                <div className="flex flex-row justify-between px-2">
                    <h2 className={`text-2xl font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                        {isEdit ? "Edit Product" : "Add New Product"}
                    </h2>
                    <div className="flex flex-row gap-4 justify-center items-center">
                        <button className={`rounded-xl px-2 py-2 cursor-pointer ${isDark ? "text-gray-200 hover:text-purple-500" : "text-gray-800 hover:text-purple-600"}`} onClick={() => navigate('/products')}>Cancel</button>
                        <button
                            className={`px-2 h-fit py-2 bg-linear-to-b flex flex-row justify-center rounded-lg font-semibold items-center from-purple-300 to-purple-500 cursor-pointer active:scale-95 transition-transform duration-300 min-h-10 min-w-35 text-white shadow-[0px_3px_8px_rgba(0,0,0,0.24)] relative`}
                            onClick={() => handleSubmit()}
                            disabled={loading}>
                            {loading ?
                                <div className='flex absolute flex-row justify-center items-center'>
                                    <Lottie
                                        animationData={loader2}
                                        loop={true}
                                        className="w-15 h-15"
                                    />
                                </div>
                                :
                                <div className="flex flex-row gap-2 justify-center items-center">
                                    {isEdit ? <FaPencilAlt size={18} /> : <HiPlus size={24} />}
                                    <span>{isEdit ? "Edit Product" : "Add Product"}</span>
                                </div>}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-gray-800 font-semibold">
                    <div className={`space-y-4 col-span-2 row-span-2`}>
                        <div className="space-y-4 col-span-1">
                            <div className={`${isDark ? "bg-[#0F172A] border-gray-700 border-2 text-gray-200 shadow-black/60" : "bg-white border-gray-200 text-gray-800"} shadow-md border p-4 rounded-2xl space-y-4 col-span-2`}>
                                <h1 className={`text-xl font-semibold`}>General Information</h1>
                                <div className="space-y-1">
                                    <h1 className={`font-medium`}>Product Id {!isEdit && "(*optional)"}</h1>
                                    <input
                                        value={product?.productId ?? ""}
                                        disabled={isEdit}
                                        name="productId"
                                        type="number"
                                        placeholder="Enter productId"
                                        onChange={handleNumberChange}
                                        className={`border-2 p-3 w-full rounded-xl outline-none ${isEdit && "cursor-not-allowed"} ${isDark ? "border-gray-700 text-gray-200 placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                                        onKeyDown={(e) => {
                                            if (["e", "E", "+", "-", "ArrowUp", "ArrowDown"].includes(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        onWheel={(e) => e.currentTarget.blur()}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <h1 className="font-medium">Title</h1>
                                    <input
                                        name="title" onChange={handleChange} value={product.title}
                                        placeholder="Enter Product title"
                                        className={`border-2 p-3 w-full rounded-xl  outline-none ${isDark ? "border-gray-700 text-gray-200 placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <h1 className="font-medium">Description</h1>
                                    <textarea
                                        value={product.description}
                                        onChange={handleChange}
                                        name="description"
                                        placeholder="Enter Product description"
                                        className={`border-2 h-fit p-3 w-full rounded-xl  outline-none overflow-auto  max-h-50 resize-none no-scrollbar min-h-40 ${isDark ? "border-gray-700 text-gray-200 placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                                        rows={1}
                                        onInput={(e) => {
                                            e.target.style.height = "auto";
                                            e.target.style.height = e.target.scrollHeight + "px";
                                        }}
                                    />
                                </div>
                            </div>
                            <div className={`shadow-md border p-4 rounded-2xl space-y-4 col-span-2 ${isDark ? "bg-[#0F172A] border-gray-700 border-2 text-gray-200 shadow-black/60" : "bg-white border-gray-200 text-gray-800"}`}>
                                <h1 className={`text-xl font-semibold`}>Pricing And Stock</h1>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <h1 className="font-medium">Price</h1>
                                        <div className={`border-2 w-full rounded-xl gap-2 flex flex-row justify-center items-center pl-4 ${isDark ? "border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-700"}`}>
                                            <span>₹</span>
                                            <input
                                                value={product.price}
                                                name="price"
                                                onChange={handleNumberChange}
                                                type="number"
                                                placeholder="Enter price"
                                                className={`outline-none w-full py-3 ${isDark ? " text-gray-200 placeholder:text-gray-500" : "text-gray-700 placeholder:text-gray-400"}`}
                                                onKeyDown={(e) => {
                                                    if (["e", "E", "+", "-", 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onWheel={(e) => e.target.blur()} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h1 className="font-medium">Stock</h1>
                                        <input
                                            name="stock"
                                            type="number"
                                            className={`border-2 p-3 w-full rounded-xl outline-none ${isDark ? "border-gray-700 text-gray-200 placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                                            placeholder="Enter stock"
                                            value={product.stock}
                                            onChange={handleNumberChange}
                                            onKeyDown={(e) => {
                                                if (["e", "E", "+", "-", 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onWheel={(e) => e.target.blur()} />
                                    </div>
                                    <div className="space-y-1">
                                        <h1 className="font-medium">Discount %</h1>
                                        <input
                                            name="discountPercentage"
                                            type="number"
                                            placeholder="Enter discount percentage"
                                            className={`border-2 p-3 w-full rounded-xl outline-none ${isDark ? "border-gray-700 text-gray-200 placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                                            value={product.discountPercentage}
                                            onChange={handleNumberChange}
                                            onWheel={(e) => e.target.blur()}
                                            onKeyDown={(e) => {
                                                if (["e", "E", "+", "-", 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }} />
                                    </div>
                                    <div className="space-y-1">
                                        <h1 className="font-medium">Rating (*optional)</h1>
                                        <input
                                            name="rating"
                                            type="number"
                                            placeholder="Enter rating"
                                            className={`border-2 p-3 w-full rounded-xl outline-none ${isDark ? "border-gray-700 text-gray-200 placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                                            value={product.rating}
                                            onChange={handleNumberChange}
                                            onWheel={(e) => e.target.blur()}
                                            onKeyDown={(e) => {
                                                if (["e", "E", "+", "-", 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`shadow-md border p-4 rounded-2xl space-y-4 col-span-2 ${isDark ? "bg-[#0F172A] border-gray-700 border-2 text-gray-200 shadow-black/60" : "bg-white border-gray-200 text-gray-800"}`}>
                            <h1 className={`text-xl font-semibold`}>Additional Information</h1>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <h1 className="font-medium">Brand</h1>
                                    <input name="brand"
                                        value={product.brand}
                                        onChange={handleChange}
                                        placeholder="Enter Brand"
                                        className={`border-2 p-3 w-full rounded-xl  outline-none ${isDark ? "border-gray-700 text-gray-200 placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <h1 className="font-medium">Sku</h1>
                                    <input
                                        value={product.sku}
                                        onChange={handleChange}
                                        name="sku"
                                        placeholder="Enter Product Sku"
                                        className={`border-2 p-3 w-full rounded-xl  outline-none ${isDark ? "border-gray-700 text-gray-200 placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <h1 className="font-medium ">weight</h1>
                                    <input
                                        type="number"
                                        name="weight"
                                        className={`border-2 p-3 w-full rounded-xl outline-none ${isDark ? "border-gray-700 text-gray-200 placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                                        value={product.weight}
                                        onChange={handleNumberChange}
                                        placeholder="Enter product weight"
                                        onWheel={(e) => e.target.blur()}
                                        onKeyDown={(e) => {
                                            if (["e", "E", "+", "-", 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                                                e.preventDefault();
                                            }
                                        }} />
                                </div>
                                <div className="space-y-1">
                                    <h1 className="font-medium ">Dimensions</h1>
                                    <div className="flex flex-row gap-4">
                                        <input
                                            name="width"
                                            value={product.dimensions.width}
                                            onChange={handleDimensionChange}
                                            type="number"
                                            className={`border-2 p-3 w-full rounded-xl outline-none ${isDark ? "border-gray-700 text-gray-200 placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                                            placeholder="width"
                                            onWheel={(e) => e.target.blur()}
                                            onKeyDown={(e) => {
                                                if (["e", "E", "+", "-", 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }} />

                                        <input
                                            type="number"
                                            className={`border-2 p-3 w-full rounded-xl outline-none ${isDark ? "border-gray-700 text-gray-200 placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                                            name="height"
                                            value={product.dimensions.height}
                                            onChange={handleDimensionChange}
                                            onWheel={(e) => e.target.blur()}
                                            placeholder="height"
                                            onKeyDown={(e) => {
                                                if (["e", "E", "+", "-", 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }} />

                                        <input
                                            type="number"
                                            className={`border-2 p-3 w-full rounded-xl outline-none ${isDark ? "border-gray-700 text-gray-200 placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                                            placeholder="depth"
                                            value={product.dimensions.depth}
                                            onChange={handleDimensionChange}
                                            onWheel={(e) => e.target.blur()}
                                            name="depth"
                                            onKeyDown={(e) => {
                                                if (["e", "E", "+", "-", 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }} />
                                    </div>
                                </div>
                                <div className="space-y-1 font-medium ">
                                    <h1 className="font-medium ">Meta</h1>
                                    <div className="flex flex-row gap-4 ">
                                        <div className="space-y-1">
                                            <input
                                                name="barcode"
                                                onChange={handleMetaChange}
                                                placeholder="Barcode"
                                                value={product?.meta?.barcode}
                                                className={`border-2 p-3 w-full rounded-xl  outline-none ${isDark ? "border-gray-700 text-gray-200 placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                                            />
                                        </div>
                                        <div className="space-y-1 relative">
                                            {qrPreview ?
                                                <div className="flex justify-center items-center">
                                                    <label className={`cursor-pointer text-slate-700 font-semibold text-center ${qrPreview ? "block" : "hidden"}`}>
                                                        <img src={qrPreview} alt="QR" className="h-12 w-12 *:object-contain" />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={handleQR}
                                                        />
                                                    </label>
                                                </div>
                                                :
                                                <label className={`items-center font-normal gap-2 p-3 border-2 rounded-lg cursor-pointer ${qrPreview ? "hidden" : "inline-flex"} ${isDark ? "bg-[#0F172A] border-gray-700" : "bg-white border-gray-200"}`}>
                                                    upload QR code
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleQR}
                                                    />
                                                </label>
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h1 className="font-medium">Tags</h1>
                                    <input
                                        placeholder="mobile, apple, ios"
                                        value={product?.tags?.join(",")}
                                        className={`border-2 p-3 w-full rounded-xl  outline-none ${isDark ? "border-gray-700 text-gray-200 placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                                        onChange={handleTags}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`space-y-4 col-span-1`}>
                        <div className={`shadow-md border p-4 rounded-2xl space-y-4 col-span-1 ${isDark ? "bg-[#0F172A] border-gray-700 border-2 text-gray-200 shadow-black/60" : "bg-white border-gray-200 text-gray-800"}`}>
                            <h1 className={`text-xl font-semibold`}>Upload Img</h1>
                            <div className={`border-2 min-h-80 overflow-hidden rounded-xl justify-center items-center flex relative ${isDark ? "bg-[#0F172A] border-gray-700 border-2 text-gray-200" : "bg-white border-gray-200 text-gray-800"} ${preview ? "" : "border-dashed border-2"}`} {...getRootProps()}>
                                {preview ? (
                                    <img src={preview} alt="thumbnail" className="h-80 object-contain" />
                                ) : (
                                    <div>
                                        <label className="w-full flex flex-col justify-center items-center">
                                            <img src="/uploadImg.png" alt="" className="h-30 w-30 object-contain" />
                                            Drag and image here or

                                            <label className="cursor-pointer text-blue-600 hover:underline font-semibold text-sm text-center px-2">
                                                upload a file
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    {...getInputProps()}
                                                />
                                            </label>
                                        </label>
                                    </div>
                                )}
                                <label className={`cursor-pointer hover:underline font-semibold text-center rounded-full p-2 absolute top-2 right-2 ${isDark ? "text-slate-300 bg-gray-700/80" : "text-slate-700 bg-gray-300/40"} ${preview ? "block" : "hidden"}`}>
                                    <FaPencilAlt />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleThumbnail}
                                    />
                                </label>
                            </div>
                            <div className="w-full flex flex-row gap-2">
                                {product?.images?.map((img) => (
                                    <div className={`relative flex justify-center items-center border-2 rounded-xl ${isDark ? "bg-[#0F172A] border-gray-700 border-2 text-gray-200" : "bg-white border-gray-200 text-gray-800"}`} key={img?.id}>
                                        <img src={img?.preview} alt="img" className="h-20 w-20 object-contain rounded-xl" />
                                        <button className={`absolute -top-2 -right-2 rounded-full p-1 flex items-center justify-center cursor-pointer ${isDark ? "text-slate-300 bg-gray-700/80" : "text-slate-700 bg-gray-300/80"}`} onClick={() => handleRemoveImage(img.id)}>
                                            <RxCross2 />
                                        </button>
                                    </div>
                                ))}
                                {product?.images?.length < 4 &&
                                    <div className={`border-dashed ${isDark ? "border-gray-700" : "border-gray-200"} border-3 rounded-xl min-h-20 min-w-20 w-fit flex justify-center items-center`} {...getImgsRootProps()}>

                                        <label className="min-h-20 min-w-20 flex justify-center items-center cursor-pointer">
                                            <FaCirclePlus className={` ${isDark ? "text-purple-500" : "text-purple-300"}`} size={24} />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                {...getImgsInputProps()}
                                            />
                                        </label>
                                    </div>
                                }
                            </div>
                        </div>
                        <div className={`shadow-md border border-gray-200 p-4 rounded-2xl space-y-4 col-span-2 ${isDark ? "bg-[#0F172A] border-gray-700 border-2 text-gray-200 shadow-black/60" : "bg-white border-gray-200 text-gray-800"}`}>
                            <h1 className={`text-xl font-semibold`}>Category</h1>
                            <div className="space-y-4">

                                {/* Parent Category */}
                                <div className="relative flex flex-col gap-2">
                                    <h1 className="font-medium">Parent Category</h1>

                                    <div
                                        onClick={() => setOpenParent(!openParent)}
                                        className={`border-2 p-3 w-full rounded-xl cursor-pointer flex justify-between items-center ${isDark ? "border-gray-700" : "border-gray-200 bg-white"}`}
                                    >
                                        <span className={parent ? (isDark ? "text-gray-200" : "text-gray-800") : "text-gray-400"}>
                                            {parent || "Select Parent"}
                                        </span>
                                        <span>▾</span>
                                    </div>

                                    {openParent && (
                                        <div className={`absolute top-full z-50 mt-1 w-full max-h-50 border rounded-xl shadow overflow-y-auto ${isDark ? "border-gray-700 bg-[#0F172A] border-2" : "border-gray-200 bg-white"}`}>
                                            {Object.keys(categories).map((cat) => (
                                                <div
                                                    key={cat}
                                                    onClick={() => {
                                                        setParent(cat);
                                                        setSub("");
                                                        setOpenParent(false);

                                                        setProduct(prev => ({
                                                            ...prev,
                                                            parentCategory: cat,
                                                            category: ""
                                                        }));
                                                    }}
                                                    className={`p-2 cursor-pointer ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
                                                >
                                                    {cat}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Sub Category */}
                                <div className="relative flex flex-col gap-2">
                                    <h1 className="font-medium">Sub Category</h1>

                                    <div
                                        onClick={() => parent && setOpenSub(!openSub)}
                                        className={`border-2 p-3 w-full rounded-xl flex justify-between items-center ${!parent ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${isDark ? "bg-[#0F172A] border-gray-700" : "bg-white border-gray-200 "}`}
                                    >
                                        <span className={sub ? (isDark ? "text-gray-200" : "text-gray-800") : "text-gray-400"}>
                                            {sub || "Select Sub"}
                                        </span>
                                        <span>▾</span>
                                    </div>

                                    {openSub && parent && (
                                        <div className={`absolute top-full z-20 w-full border rounded-xl shadow overflow-y-auto max-h-50 ${isDark ? "border-gray-700 bg-[#0F172A] border-2" : "border-gray-200 bg-white"}`}>
                                            {categories[parent].map((s) => (
                                                <div
                                                    key={s}
                                                    onClick={() => {
                                                        setSub(s);
                                                        setOpenSub(false);

                                                        setProduct(prev => ({
                                                            ...prev,
                                                            category: s
                                                        }));
                                                    }}
                                                    className={`p-2 cursor-pointer ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
                                                >
                                                    {s}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>

                        </div>
                        <div className={`shadow-md border border-gray-200 p-4 rounded-2xl space-y-4 col-span-2 ${isDark ? "bg-[#0F172A] border-gray-700 border-2 text-gray-200 shadow-black/60" : "bg-white border-gray-200 text-gray-800"}`}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <h1 className="font-medium">Warranty Information</h1>
                                    <input name="warrantyInformation"
                                        onChange={handleChange}
                                        value={product.warrantyInformation}
                                        placeholder="Enter Warranty"
                                        className={`border-2 p-3 w-full rounded-xl  outline-none ${isDark ? "border-gray-700 text-gray-200 placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <h1 className="font-medium">Shipping Information</h1>
                                    <input
                                        onChange={handleChange}
                                        value={product.shippingInformation}
                                        name="shippingInformation"
                                        placeholder="Enter Shipping Information"
                                        className={`border-2 p-3 w-full rounded-xl  outline-none ${isDark ? "border-gray-700 text-gray-200 placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <h1 className="font-medium">Return Policy</h1>
                                    <input
                                        onChange={handleChange}
                                        value={product.returnPolicy}
                                        name="returnPolicy"
                                        placeholder="Enter Return Policy"
                                        className={`border-2 p-3 w-full rounded-xl  outline-none ${isDark ? "border-gray-700 text-gray-200 placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <h1 className="font-medium ">Min Order Quantity</h1>
                                    <input
                                        name="minimumOrderQuantity"
                                        type="number"
                                        className={`border-2 p-3 w-full rounded-xl outline-none ${isDark ? "border-gray-700 text-gray-200 placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                                        value={product.minimumOrderQuantity}
                                        onChange={handleNumberChange}
                                        placeholder="Enter Minimum Order Quantity"
                                        onWheel={(e) => e.target.blur()}
                                        onKeyDown={(e) => {
                                            if (["e", "E", "+", "-", 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                                                e.preventDefault();
                                            }
                                        }} />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div >
    );
}

export default AddProduct;