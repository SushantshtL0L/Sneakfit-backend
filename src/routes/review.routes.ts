import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/async-handler";

const router = Router();

router.post("/", authMiddleware, asyncHandler(ReviewController.createReview));
router.get("/product/:productId", asyncHandler(ReviewController.getProductReviews));
router.delete("/:id", authMiddleware, asyncHandler(ReviewController.deleteReview));

export default router;
