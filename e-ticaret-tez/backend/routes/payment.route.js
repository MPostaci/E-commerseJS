import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { payment } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/", protectRoute, payment);
// router.post("/checkout-success", protectRoute, checkoutSuccess);

export default router;