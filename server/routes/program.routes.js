import express from "express";
import { verifyJWT, verifyRoles } from "../middlewares/auth.middleware.js";
import {
    getAllPrograms,
    enrollInProgram,
    // createProgram,
    updateProgress,
    getEnrolledPrograms
} from "../controllers/program.controller.js";
import { addProgram } from "../controllers/admin.controller.js";

const router = express.Router();

// Public routes
router.get("/", verifyJWT, getAllPrograms);
router.get("/enrolled", verifyJWT, getEnrolledPrograms);

// Protected routes (require authentication)
router.post("/:programId/enroll", verifyJWT, enrollInProgram);
router.post("/:programId/progress", verifyJWT, updateProgress);

// Admin routes
router.post("/", verifyJWT, verifyRoles("admin"), addProgram);

export { router as programRoutes }; 