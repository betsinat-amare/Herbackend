import express from "express";
import {
  getCarrierProfile,
  updateCarrierProfile,
  updateCarrierFlight,
  deleteCarrierFlight,
} from "../controllers/carrierProfileController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/", authenticateUser, getCarrierProfile);
router.put("/", authenticateUser, updateCarrierProfile);
router.put("/flight/:flightId", authenticateUser, updateCarrierFlight);
router.delete("/flight/:flightId", authenticateUser, deleteCarrierFlight);

export default router;
