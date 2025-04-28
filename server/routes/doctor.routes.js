import express from "express";
import { verifyJWT, verifyRoles } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/security.middleware.js";
import {
    getDoctorProfile,
    updateDoctorProfile,
    getDoctorPatients,
    updatePatientStatus,
    getDoctorEarnings,
    getDoctorPrograms,
    getDoctorProgramById,
    getProgramMembers,
    getProgramStats
} from "../controllers/doctor.controller.js";
import { doctorProfileSchema, updatePatientStatusSchema } from "../validations/doctor.validation.js";

const router = express.Router();

// Protect all doctor routes
router.use(verifyJWT, verifyRoles("doctor"));

// Profile routes
router.get("/profile", getDoctorProfile);
router.put("/profile", validateRequest(doctorProfileSchema), updateDoctorProfile);

// Program routes
router.get("/programs", getDoctorPrograms);
router.get("/programs/:programId", getDoctorProgramById);
router.get("/programs/:programId/members", getProgramMembers);
router.get("/programs/:programId/stats", getProgramStats);

// Patient management routes
router.get("/patients", getDoctorPatients);
router.put("/patients/:patientId", validateRequest(updatePatientStatusSchema), updatePatientStatus);

// Earnings routes
router.get("/earnings", getDoctorEarnings);

export { router as doctorRoutes }; 