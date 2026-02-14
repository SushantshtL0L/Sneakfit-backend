import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/async-handler";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Ensure user_photos directory exists
const uploadDir = path.join(process.cwd(), "public/user_photos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    cb(null, `usr-pic-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

router.get("/me", authMiddleware, asyncHandler(UserController.getMe));
router.put("/profile", authMiddleware, upload.single("image"), asyncHandler(UserController.updateProfile));

export default router;
