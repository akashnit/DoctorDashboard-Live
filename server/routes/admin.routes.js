import express from "express";
import {
  getAllDoctors,
  addDoctor,
  addPatient,
  addPatientToDoctor,
  removePatientFromDoctor,
  removeDoctor,
  removePatient,
  getAllPatients,
  assignPatientToDoctor,
  createPatient,
  getDoctorPatients,
  addProgram,
  getPatientData
} from "../controllers/admin.controller.js";
import { verifyJWT, verifyRoles } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/security.middleware.js";
import { patientValidationSchema, patientDoctorAssignmentSchema } from "../validations/patient.validation.js";
import { programValidationSchema } from "../validations/program.validation.js";
import { getAdminDashboard } from "../controllers/dashboard.controller.js"

const router = express.Router();

// Protect admin routes
router.use(verifyJWT, verifyRoles("admin"));

// Doctor Section
router.get("/dashboard", getAdminDashboard);
router.get("/doctors", getAllDoctors);
router.post("/doctor", addDoctor);
router.delete("/doctor/:doctorId", removeDoctor);

// Patient Section
router.get("/patients", getAllPatients);
router.get("/patients/:patientId", getPatientData)
router.post("/patient", validateRequest(patientValidationSchema), createPatient);
router.delete("/patient/:patientId", removePatient);

// Doctor-Patient Assignment
router.post("/doctor/:doctorId/patient", addPatientToDoctor);
router.delete("/doctor/:doctorId/patient/:patientId", removePatientFromDoctor);
router.get("/doctor/:doctorId/patients", getDoctorPatients);

// Patient-Doctor Assignment
router.post("/assign-patient", validateRequest(patientDoctorAssignmentSchema), assignPatientToDoctor);

router.post("/program",validateRequest(programValidationSchema) ,addProgram);

export { router as adminRoutes };
