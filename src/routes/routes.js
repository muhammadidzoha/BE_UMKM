import { Router } from "express";
import {
  createProduct,
  getProducts,
} from "../controllers/ProductControllers.js";

const router = Router();

router.get("/products", getProducts);

router.post("/product", createProduct);

module.exports = router;
