import express from "express";
import {
  getAvailableFlights,
  createShipment,
} from "../controllers/senderController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";
const router = express.Router();
router.get("/flights", authenticateUser, getAvailableFlights);
router.post("/shipments", authenticateUser, createShipment);

export default router;
