import { Program } from "../models/program.models.js";
import { Doctor } from "../models/doctor.models.js";
import { Patient } from "../models/patient.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get all programs
export const getAllPrograms = asyncHandler(async (req, res) => {
    const programs = await Program.find().populate('createdBy', 'name');
    
    // Add isEnrolled flag for the current user
    const programsWithEnrollment = programs.map(program => {
        const isEnrolled = program.enrolledUsers.some(
            enrollment => enrollment.user.toString() === req.user.id
        );
        return {
            ...program.toObject(),
            isEnrolled
        };
    });

    return res.status(200).json(
        new ApiResponse(200, programsWithEnrollment, "Programs fetched successfully")
    );
});

// Get a single program by ID
export const getProgramById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const program = await Program.findById(id);
  if (!program) {
    throw new ApiError(404, "Program not found");
  }
  
  return res.status(200).json(
    new ApiResponse(200, program, "Program retrieved successfully")
  );
});

// Enroll in a program
export const enrollInProgram = asyncHandler(async (req, res) => {
    const { programId } = req.params;
    const userId = req.user.id;

    const program = await Program.findById(programId);
    if (!program) {
        throw new ApiError(404, "Program not found");
    }

    // Check if already enrolled
    const isAlreadyEnrolled = program.enrolledUsers.some(
        enrollment => enrollment.user.toString() === userId
    );
    if (isAlreadyEnrolled) {
        throw new ApiError(400, "Already enrolled in this program");
    }

    // Add user to enrolled users
    program.enrolledUsers.push({
        user: userId,
        progress: 0
    });
    await program.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Successfully enrolled in program")
    );
});

// Update program progress
export const updateProgress = asyncHandler(async (req, res) => {
    const { programId } = req.params;
    const { progress } = req.body;
    const userId = req.user.id;

    if (progress < 0 || progress > 100) {
        throw new ApiError(400, "Progress must be between 0 and 100");
    }

    const program = await Program.findById(programId);
    if (!program) {
        throw new ApiError(404, "Program not found");
    }

    const enrollment = program.enrolledUsers.find(
        enrollment => enrollment.user.toString() === userId
    );
    if (!enrollment) {
        throw new ApiError(400, "Not enrolled in this program");
    }

    enrollment.progress = progress;
    await program.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Progress updated successfully")
    );
});

// Update a program
export const updateProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, memberships, active } = req.body;
  
  const program = await Program.findById(id);
  if (!program) {
    throw new ApiError(404, "Program not found");
  }
  
  // Check if updating name to an existing program's name
  if (name && name !== program.name) {
    const existingProgram = await Program.findOne({ name });
    if (existingProgram) {
      throw new ApiError(400, "Program with this name already exists");
    }
  }
  
  // Update fields
  program.name = name || program.name;
  program.description = description || program.description;
  
  if (memberships && Array.isArray(memberships) && memberships.length === 3) {
    program.memberships = memberships;
  }
  
  if (active !== undefined) {
    program.active = active;
  }
  
  await program.save();
  
  return res.status(200).json(
    new ApiResponse(200, program, "Program updated successfully")
  );
});

// Get program statistics
export const getProgramStats = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const program = await Program.findById(id);
  if (!program) {
    throw new ApiError(404, "Program not found");
  }
  
  // Count doctors who are assigned to this program
  const doctorCount = await Doctor.countDocuments({
    "assignedPrograms.program": program._id
  });
  
  // Get patient statistics by membership duration
  const patientStats = {
    total: 0,
    byMembership: [
      { duration: "1 month", count: 0 },
      { duration: "3 months", count: 0 },
      { duration: "6 months", count: 0 }
    ]
  };
  
  // Count active patients enrolled in this program by membership duration
  const activePatientsPromises = program.memberships.map(async (membership) => {
    const count = await Patient.countDocuments({
      "selectedProgram.program": program._id,
      "selectedProgram.membership.duration": membership.duration,
      "selectedProgram.status": "active"
    });
    
    // Find the matching duration in patientStats and update the count
    const durationIndex = patientStats.byMembership.findIndex(
      item => item.duration === membership.duration
    );
    
    if (durationIndex >= 0) {
      patientStats.byMembership[durationIndex].count = count;
      patientStats.total += count;
    }
    
    return { duration: membership.duration, count };
  });
  
  await Promise.all(activePatientsPromises);
  
  // Return the stats
  const programStats = {
    doctorCount,
    patientCounts: patientStats
  };
  
  return res.status(200).json(
    new ApiResponse(200, programStats, "Program statistics retrieved successfully")
  );
});

// Deactivate a program
export const deactivateProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const program = await Program.findById(id);
  if (!program) {
    throw new ApiError(404, "Program not found");
  }
  
  program.active = false;
  await program.save();
  
  return res.status(200).json(
    new ApiResponse(200, null, "Program deactivated successfully")
  );
});

// Assign program to a doctor
export const assignProgramToDoctor = asyncHandler(async (req, res) => {
  const { doctorId, programId } = req.body;
  
  // Check if doctor exists
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }
  
  // Check if program exists
  const program = await Program.findById(programId);
  if (!program) {
    throw new ApiError(404, "Program not found");
  }
  
  // Check if doctor is already assigned to this program
  const programAssigned = doctor.assignedPrograms.some(
    assignment => assignment.program.toString() === programId
  );
  
  if (programAssigned) {
    throw new ApiError(400, "Doctor is already assigned to this program");
  }
  
  // Initialize subscription metrics for each duration
  const subscriptionMetrics = program.membershipDurations.map(duration => ({
    duration: parseInt(duration),
    activeSubscribers: 0,
    totalSubscribers: 0,
    currentEarnings: 0,
    totalEarnings: 0
  }));
  
  // Assign program to doctor with initialized metrics
  doctor.assignedPrograms.push({
    program: programId,
    assignedDate: new Date(),
    subscriptionMetrics
  });
  
  await doctor.save();
  
  return res.status(200).json(
    new ApiResponse(200, doctor, "Program assigned to doctor successfully")
  );
});

// Remove program from doctor
export const removeProgramFromDoctor = asyncHandler(async (req, res) => {
  const { doctorId, programId } = req.params;
  
  // Verify doctor exists
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }
  
  // Check if doctor has any patients enrolled in this program
  const patientsInProgram = await Patient.findOne({
    doctor: doctorId,
    "selectedProgram.program": programId,
    "selectedProgram.status": "active"
  });
  
  if (patientsInProgram) {
    throw new ApiError(400, "Cannot remove program with active patients enrolled");
  }
  
  // Remove program from doctor
  doctor.assignedPrograms = doctor.assignedPrograms.filter(
    p => p.program.toString() !== programId
  );
  
  await doctor.save();
  
  return res.status(200).json(
    new ApiResponse(200, doctor, "Program removed from doctor successfully")
  );
});

// Get doctors by program
export const getDoctorsByProgram = asyncHandler(async (req, res) => {
  const { programId } = req.params;
  
  // Verify program exists
  const program = await Program.findById(programId);
  if (!program) {
    throw new ApiError(404, "Program not found");
  }
  
  // Find doctors assigned to this program
  const doctors = await Doctor.find({
    "assignedPrograms.program": programId
  }).select("name domain city hospital yearsOfExperience");
  
  return res.status(200).json(
    new ApiResponse(200, doctors, "Doctors for program fetched successfully")
  );
});

// Get enrolled programs for a patient
export const getEnrolledPrograms = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const programs = await Program.find({
        'enrolledUsers.user': userId
    }).populate('createdBy', 'name');
    
    // Add enrollment details to each program
    const programsWithEnrollment = programs.map(program => {
        const enrollment = program.enrolledUsers.find(
            e => e.user.toString() === userId
        );
        return {
            ...program.toObject(),
            enrollmentDate: enrollment.enrollmentDate,
            expiryDate: enrollment.expiryDate,
            progress: enrollment.progress,
            status: enrollment.status
        };
    });

    return res.status(200).json(
        new ApiResponse(200, programsWithEnrollment, "Enrolled programs fetched successfully")
    );
}); 