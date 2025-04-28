import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Doctor } from "../models/doctor.models.js";
import { Patient } from "../models/patient.models.js";
import { User } from "../models/user.models.js";
import { Program } from "../models/program.models.js";

// Get dashboard data based on user role
export const getDashboardData = asyncHandler(async (req, res) => {
  const { user } = req;

  if (!user) {
    throw new ApiError(401, "User not authenticated");
  }

  let dashboardData = {};

  switch (user.role) {
    case "admin":
      dashboardData = await getAdminDashboardData();
      break;
    case "doctor":
      dashboardData = await getDoctorDashboardData(user.profileId);
      break;
    case "patient":
      dashboardData = await getPatientDashboardData(user.profileId);
      break;
    default:
      throw new ApiError(400, "Invalid user role");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, dashboardData, "Dashboard data fetched successfully")
    );
});

// Admin dashboard data
const getAdminDashboardData = async () => {
  const totalDoctors = await Doctor.countDocuments();

  const totalPatients = await Patient.countDocuments();

  const totalPrograms = await Program.countDocuments();

  const activePrograms = await Patient.countDocuments({
    "selectedProgram.status": "active",
  });

  // Get latest doctors
  const recentDoctors = await Doctor.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name domain city createdAt qualifications");

  // Get latest patients
  const recentPatients = await Patient.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name age problems city createdAt")
    .populate("doctor", "name");


  // Get all programs
  const programs = await Program.find()
    .sort({ name: 1 })
    .select("name description duration price active");

  const result = {
    allStats: {
      totalDoctors,
      totalPatients,
      totalPrograms,
      activePrograms,
    },
    recentDoctors,
    recentPatients,
    programs,
  };
  
  console.log(result);
  return result;
};

export const getAdminDashboard = async (req, res) => {
  try {
    const data = await getAdminDashboardData();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Doctor dashboard data
const getDoctorDashboardData = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId).populate(
    "assignedPrograms.program"
  );

  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }

  // Get all patients assigned to this doctor
  const patients = await Patient.find({ doctor: doctorId })
    .select("name age problems selectedProgram city createdAt")
    .populate("selectedProgram.program");

  // Group patients by program
  const patientsByProgram = {};
  for (const patient of patients) {
    const programId = patient.selectedProgram?.program?._id || "Unknown";
    const programName = patient.selectedProgram?.program?.name || "Unknown";

    if (!patientsByProgram[programId]) {
      patientsByProgram[programId] = {
        programName,
        patients: [],
      };
    }
    patientsByProgram[programId].patients.push(patient);
  }

  return {
    doctorProfile: {
      name: doctor.name,
      domain: doctor.domain,
      experience: doctor.yearsOfExperience,
      city: doctor.city,
      hospital: doctor.hospital,
    },
    stats: {
      totalPatients: patients.length,
      currentSubscribers: doctor.currentSubscribers,
      totalSubscribers: doctor.totalSubscribers,
      currentEarnings: doctor.currentEarnings,
      totalEarnings: doctor.totalEarnings,
    },
    assignedPrograms: doctor.assignedPrograms.map((p) => ({
      ...p.program._doc,
      assignedDate: p.assignedDate,
    })),
    patients,
    patientsByProgram,
  };
};

// Patient dashboard data
const getPatientDashboardData = async (patientId) => {
  const patient = await Patient.findById(patientId)
    .populate("doctor", "name domain city hospital")
    .populate("selectedProgram.program");

  if (!patient) {
    throw new ApiError(404, "Patient profile not found");
  }

  // Get program details if enrolled
  let currentEnrollment = null;

  if (patient.selectedProgram && patient.doctor) {
    currentEnrollment = {
      program: patient.selectedProgram.program,
      status: patient.selectedProgram.status,
      enrollmentDate: patient.selectedProgram.enrollmentDate,
      doctor: patient.doctor,
    };
  }

  return {
    patientProfile: {
      name: patient.name,
      age: patient.age,
      problems: patient.problems,
      city: patient.city,
      medicalHistory: patient.medicalHistory,
      allergies: patient.allergies,
      referralCode: patient.referralCode,
    },
    currentEnrollment,
    programHistory: patient.programHistory,
    referrals: {
      count: patient.referrals,
      history: patient.referralHistory,
      code: patient.referralCode,
    },
  };
};

// Get available doctors for patients
export const getAvailableDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find()
    .select("name domain city hospital programs")
    .sort({ name: 1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, doctors, "Available doctors fetched successfully")
    );
});

// Get specific doctor details
export const getDoctorDetails = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  const doctor = await Doctor.findById(doctorId)
    .select("name domain city hospital programs yearsOfExperience")
    .sort({ name: 1 });

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, doctor, "Doctor details fetched successfully"));
});

// Admin Dashboard Statistics
export const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalDoctors,
    totalPatients,
    activePatients,
    completedPatients,
    doctorsByDomain,
    patientsByCity,
  ] = await Promise.all([
    Doctor.countDocuments(),
    Patient.countDocuments(),
    Patient.countDocuments({ status: "active" }),
    Patient.countDocuments({ status: "completed" }),
    Doctor.aggregate([
      {
        $group: {
          _id: "$domain",
          count: { $sum: 1 },
        },
      },
    ]),
    Patient.aggregate([
      {
        $group: {
          _id: "$city",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalDoctors,
        totalPatients,
        activePatients,
        completedPatients,
        doctorsByDomain,
        patientsByCity,
      },
      "Admin dashboard statistics fetched successfully"
    )
  );
});

// Doctor Dashboard Statistics
export const getDoctorDashboardStats = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.user.profileId);
  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }

  const [
    totalPatients,
    activePatients,
    completedPatients,
    patientsByProgram,
    patientsByStatus,
  ] = await Promise.all([
    Patient.countDocuments({ doctor: doctor._id }),
    Patient.countDocuments({ doctor: doctor._id, status: "active" }),
    Patient.countDocuments({ doctor: doctor._id, status: "completed" }),
    Patient.aggregate([
      {
        $match: { doctor: doctor._id },
      },
      {
        $group: {
          _id: "$selectedProgram.name",
          count: { $sum: 1 },
        },
      },
    ]),
    Patient.aggregate([
      {
        $match: { doctor: doctor._id },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalPatients,
        activePatients,
        completedPatients,
        patientsByProgram,
        patientsByStatus,
        currentEarnings: doctor.currentEarnings,
        totalEarnings: doctor.totalEarnings,
        currentSubscribers: doctor.currentSubscribers,
        totalSubscribers: doctor.totalSubscribers,
      },
      "Doctor dashboard statistics fetched successfully"
    )
  );
});

// Patient Dashboard Statistics
export const getPatientDashboardStats = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.user.profileId).populate(
    "doctor",
    "name domain city"
  );

  if (!patient) {
    throw new ApiError(404, "Patient profile not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        status: patient.status,
        selectedProgram: patient.selectedProgram,
        doctor: {
          name: patient.doctor.name,
          domain: patient.doctor.domain,
          city: patient.doctor.city,
        },
        progress: {
          startDate: patient.createdAt,
          currentStatus: patient.status,
          notes: patient.notes,
        },
      },
      "Patient dashboard statistics fetched successfully"
    )
  );
});
