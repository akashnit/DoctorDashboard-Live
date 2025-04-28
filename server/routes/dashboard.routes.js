import express from "express";
import { 
  getDashboardData, 
  getAvailableDoctors, 
  getDoctorDetails 
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protect all dashboard routes
router.use(verifyJWT);

// Main dashboard (role-based)
router.get("/dashboard", getDashboardData);

// Shared routes across roles
router.get("/doctors", getAvailableDoctors);
router.get("/doctors/:doctorId", getDoctorDetails);

export { router as dashboardRoutes }; 