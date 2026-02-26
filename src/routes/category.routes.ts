import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";

const router = Router();

router.get("/", CategoryController.getAllCategories);
router.post("/", CategoryController.createCategory);
router.post("/seed", CategoryController.seedCategories);

export default router;
