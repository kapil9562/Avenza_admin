import Product from "../models/product.model.js";
import cloudinary from "../utils/cloudinary.js";

const uploadToCloudinary = (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        ).end(fileBuffer);
    });
};

const addNewProduct = async (req, res) => {
    try {
        const data = req.body;

        if (!data.title || !data.price || !data.category) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        // Upload Thumbnail
        let thumbnailUrl = "";
        if (req.files?.thumbnail) {
            const result = await uploadToCloudinary(
                req.files.thumbnail[0].buffer,
                "products/thumbnails"
            );
            thumbnailUrl = result.secure_url;
        }

        // Upload Images
        let imageUrls = [];
        if (req.files?.images) {
            for (let file of req.files.images) {
                const result = await uploadToCloudinary(
                    file.buffer,
                    "products/images"
                );
                imageUrls.push(result.secure_url);
            }
        }

        // Upload QR
        let qrUrl = "";
        if (req.files?.qrCode) {
            const result = await uploadToCloudinary(
                req.files.qrCode[0].buffer,
                "products/qr"
            );
            qrUrl = result.secure_url;
        }

        const dimensions = data.dimensions ? JSON.parse(data.dimensions) : {};
        const tags = data.tags ? JSON.parse(data.tags) : [];

        let availabilityStatus = ""
        if (data?.stock >= 10) {
            availabilityStatus = "In Stock"
        } else if (data?.stock < 10 && data?.stock > 0) {
            availabilityStatus = "Low Stock"
        } else {
            availabilityStatus = "Out of Stock"
        }

        const lastProduct = await Product.findOne()
            .sort({ productId: -1 })
            .select("productId");

        const nextProductId = (data?.productId) ? (data?.productId) : (lastProduct ? ( lastProduct?.productId + 1) : 1);

        const product = new Product({
            ...data,
            productId: nextProductId,
            dimensions,
            tags,
            thumbnail: thumbnailUrl,
            images: imageUrls,
            meta: {
                barcode: data.barcode,
                qrCode: qrUrl
            },
            availabilityStatus
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product
        });

    } catch (error) {
        console.log("Cloudinary Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const data = req.body;

        console.log(productId)

        if (!productId) {
            return res.status(404).json({ message: "Product Id is required" });
        }

        const product = await Product.findById({ _id: productId });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // 🔥 Update Normal Fields (only if provided)
        Object.keys(data).forEach((key) => {
            if (key !== "dimensions" && key !== "tags") {
                product[key] = data[key];
            }
        });

        // 🔥 Parse dimensions safely
        if (data.dimensions) {
            product.dimensions = JSON.parse(data.dimensions);
        }

        // 🔥 Parse tags safely
        if (data.tags) {
            product.tags = JSON.parse(data.tags);
        }

        // 🔥 Update Availability (if stock changed)
        if (data.stock !== undefined) {
            if (data.stock >= 10) {
                product.availabilityStatus = "In Stock";
            } else if (data.stock > 0) {
                product.availabilityStatus = "Low Stock";
            } else {
                product.availabilityStatus = "Out of Stock";
            }
        }

        // 🔥 Update Thumbnail (optional)
        if (req.files?.thumbnail) {
            const result = await uploadToCloudinary(
                req.files.thumbnail[0].buffer,
                "products/thumbnails"
            );
            product.thumbnail = result.secure_url;
        }

        // 🔥 Handle Images Properly
        const existingImages = JSON.parse(req.body.existingImages || "[]");

        // Old DB images
        const oldImages = product.images || [];

        // 1️⃣ Delete removed images from Cloudinary
        const imagesToDelete = oldImages.filter(
            (img) => !existingImages.includes(img)
        );

        for (let imgUrl of imagesToDelete) {
            const publicId = imgUrl.split("/").slice(-2).join("/").split(".")[0];
            await cloudinary.uploader.destroy(publicId);
        }

        let newImageUrls = [];

        if (req.files?.images) {
            for (let file of req.files.images) {
                const result = await uploadToCloudinary(
                    file.buffer,
                    "products/images"
                );
                newImageUrls.push(result.secure_url);
            }
        }

        product.images = [...existingImages, ...newImageUrls];

        // 🔥 Update QR (optional)
        if (req.files?.qrCode) {
            const result = await uploadToCloudinary(
                req.files.qrCode[0].buffer,
                "products/qr"
            );

            product.meta.qrCode = result.secure_url;
        }

        await product.save();

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
        });

    } catch (error) {
        console.log("Update Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const deleteProduct = async (req, res) => {
    const { productId } = req.body;

    if (!productId) {
        return res.status(400).json({
            msg: "Product Id is required!"
        });
    }

    try {
        await Product.deleteOne({ _id: productId });
        setTimeout(() => {
            res.status(200).json({
                msg: "Product deleted successfully."
            })
        }, 2000);
    } catch (error) {
        res.status(400).json({
            msg: "Failed to delete !"
        })
    }
}

export { addNewProduct, updateProduct, deleteProduct };