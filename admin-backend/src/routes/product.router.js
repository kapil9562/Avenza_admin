import express from "express";
import multer from "multer";
import {addNewProduct, deleteProduct, restoreProduct, updateProduct  } from "../controllers/product.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const productRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

productRouter.post(
    "/add-new-product",
    verifyJWT,
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 4 },
        { name: "qrCode", maxCount: 1 }
    ]),
    addNewProduct
);

productRouter.post('/delete-product',verifyJWT, deleteProduct);
productRouter.post('/restore-product',verifyJWT, restoreProduct);

productRouter.patch(
  "/update-product/:productId",
  verifyJWT,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 4 },
    { name: "qrCode", maxCount: 1 }
  ]),
  updateProduct
);


export { productRouter };