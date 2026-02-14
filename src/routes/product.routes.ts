import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/async-handler";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "public/item_photos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    cb(null, `itm-pic-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// Use any() to allow any field name for the image, or stick to 'image'
router.post("/", authMiddleware, upload.single("image"), asyncHandler(ProductController.createProduct));
router.get("/", asyncHandler(ProductController.getAllProducts));
router.get("/:id", asyncHandler(ProductController.getProductById));
router.put("/:id", authMiddleware, upload.single("image"), asyncHandler(ProductController.updateProduct));
router.delete("/:id", authMiddleware, asyncHandler(ProductController.deleteProduct));

export default router;
