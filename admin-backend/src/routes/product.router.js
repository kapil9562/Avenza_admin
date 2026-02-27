import express from "express";
import multer from "multer";
import {addNewProduct, deleteProduct, updateProduct  } from "../controllers/product.controller.js";

const productRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

productRouter.post(
    "/add-new-product",
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 4 },
        { name: "qrCode", maxCount: 1 }
    ]),
    addNewProduct
);

productRouter.post('/delete-product', deleteProduct);

productRouter.patch(
  "/update-product/:productId",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 4 },
    { name: "qrCode", maxCount: 1 }
  ]),
  updateProduct
);


export { productRouter };