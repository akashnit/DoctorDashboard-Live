import express from "express";
import { verifyJWT, verifyRoles } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/security.middleware.js";
import {
    getPatientProfile,
    updatePatientProfile,
    getPatientPrograms,
    updateSelectedProgram,
    getPatientProgress,
    getReferralCode,
    applyReferralCode,
    getReferralHistory,
    getProgramLeaderboard,
    getLeaderboard,
    getReferralStats,
    getDoctorsWithPrograms,
    enrollInProgram,
    updateProgramStatus,
    generateReferral,
    getAllPrograms,
    getDoctorsByProgram,
    getRewards,
    checkEligibleRewards
} from "../controllers/patient.controller.js";
import { patientProfileSchema, patientProgramSchema, referralCodeSchema } from "../validations/patient.validation.js";

const router = express.Router();

// Protect all patient routes
router.use(verifyJWT, verifyRoles("patient"));

// Profile routes
router.get("/profile", getPatientProfile);
router.put("/profile", validateRequest(patientProfileSchema), updatePatientProfile);

// Program routes
router.get("/programs", getAllPrograms);
router.get("/programs/:programId/doctors", getDoctorsByProgram);
router.post("/enroll", enrollInProgram);
router.post("/program-status", updateProgramStatus);

// Progress routes
router.get("/progress", getPatientProgress);
//router.get("/health-progress", getPatientProgress); // Alias for the dashboard

// Referral routes
router.get("/referral", getReferralCode); // For dashboard
router.get("/referral-code", getReferralCode);
router.post("/apply-referral", validateRequest(referralCodeSchema), applyReferralCode);
router.get("/referral-history", getReferralHistory);
router.get("/referral-stats", getReferralStats);

// Leaderboard routes
router.get("/leaderboard", getLeaderboard); // General leaderboard for dashboard
router.get("/leaderboard/:programName", getProgramLeaderboard);

// Rewards routes
router.get("/rewards", getRewards);
router.get("/eligible-rewards", checkEligibleRewards);

// Program Management
router.get("/doctors", getDoctorsWithPrograms);

// Referral System
router.post("/referral/apply", applyReferralCode);
router.get("/referral/generate", generateReferral);

export { router as patientRoutes }; 