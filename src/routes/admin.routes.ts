import { Router } from "express";
import { AdminUserController } from "../controllers/admin-user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { asyncHandler } from "../middlewares/async-handler";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Reuse the upload logic from user.routes
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
    cb(null, `usr-admin-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// All routes here require authentication AND admin role
router.use(authMiddleware, adminMiddleware);

router.get("/", asyncHandler(AdminUserController.getAllUsers));
router.get("/:id", asyncHandler(AdminUserController.getUserById));
router.post("/", upload.single("image"), asyncHandler(AdminUserController.createUser));
router.put("/:id", upload.single("image"), asyncHandler(AdminUserController.updateUser));
router.delete("/:id", asyncHandler(AdminUserController.deleteUser));

export default router;
