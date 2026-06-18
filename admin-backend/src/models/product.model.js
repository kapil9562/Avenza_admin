import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    rating: Number,
    comment: String,
    date: Date,
    reviewerName: String,
    reviewerEmail: String
}, { _id: false });

const dimensionsSchema = new mongoose.Schema({
    width: Number,
    height: Number,
    depth: Number
}, { _id: false });

const metaSchema = new mongoose.Schema({
    barcode: String,
    qrCode: String
}, { _id: false });

const productSchema = new mongoose.Schema({
    productId: {
        type: Number,
        unique: true,
        index: true
    },
    title: String,
    description: String,
    category: String,
    parentCategory: {
        type: String,
        index: true
    },
    price: Number,
    discountPercentage: Number,
    rating: Number,
    stock: Number,
    tags: [String],
    brand: String,
    sku: String,
    weight: Number,
    dimensions: dimensionsSchema,
    warrantyInformation: String,
    shippingInformation: String,
    availabilityStatus: String,
    reviews: [reviewSchema],
    returnPolicy: String,
    minimumOrderQuantity: Number,
    meta: metaSchema,
    images: [String],
    thumbnail: String,
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
