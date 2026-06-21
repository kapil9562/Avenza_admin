import express from "express";
import multer from "multer";
import {addNewProduct, deleteProduct, restoreProduct, updateProduct  } from "../controllers/product.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const productRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

productRouter.post(
    "/add-new-product",
    verifyJWT("super_admin", "admin"),
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 4 },
        { name: "qrCode", maxCount: 1 }
    ]),
    addNewProduct
);

productRouter.post('/delete-product',verifyJWT("super_admin"), deleteProduct);
productRouter.post('/restore-product',verifyJWT("super_admin"), restoreProduct);

productRouter.patch(
  "/update-product/:productId",
  verifyJWT("admin", "super_admin"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 4 },
    { name: "qrCode", maxCount: 1 }
  ]),
  updateProduct
);


export { productRouter };