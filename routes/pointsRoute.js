import express from "express";
import { getCarrierPoints } from "../controllers/pointsController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/me", authenticateUser, getCarrierPoints);

export default router;
