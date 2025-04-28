import { Doctor } from "../models/doctor.models.js";
import { Patient } from "../models/patient.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateRandomPassword, generateUsername } from "../utils/credentialGenerator.js";
import { Program } from "../models/program.models.js";



// Get all doctors (with associated patient count)
export const getAllDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find().populate(
    "patients",
    "name age problems"
  );
  return res.status(200).json(
    new ApiResponse(200, doctors, "Doctors fetched successfully")
  );
});

export const addDoctor = asyncHandler(async (req, res) => {
  const { name, age, domain, yearsOfExperience, city, state, email, qualifications, programIds } = req.body;

  try {
    // Transform programIds into assignedPrograms
    const assignedPrograms = programIds.map(programId => ({
      program: programId,
      assignedDate: Date.now(),
      activeSubscribers: 0,
      totalSubscribers: 0,
      currentEarnings: 0,
      totalEarnings: 0,
      subscriptionMetrics: [] // Initialize as needed
    }));

    // Create doctor profile
    const newDoctor = await Doctor.create({
      name,
      age,
      domain,
      yearsOfExperience,
      city,
      state,
      email,
      qualifications,
      assignedPrograms // Use assignedPrograms instead of programIds
    });

    // Generate username and password
    const username = generateUsername(name);
    const password = generateRandomPassword();

    // Create user account
    const user = await User.create({
      name,
      username,
      email,
      password,
      role: "doctor",
      profileId: newDoctor._id
    });

    return res.status(201).json(
      new ApiResponse(201, 
        { 
          doctor: newDoctor, 
          credentials: { username, password, email } 
        }, 
        "Doctor added successfully with generated credentials"
      )
    );
  } catch (error) {
    console.error("Error adding doctor:", error);
    return res.status(500).json({ message: "Error adding doctor", error: error.message });
  }
});

export const addPatient = asyncHandler(async (req, res) => {
  const { name, age, problems, city, email } = req.body;

  // Create patient profile
  const newPatient = await Patient.create({
    name,
    age,
    problems,
    city
  });

  // Generate username and password
  const username = generateUsername(name);
  const password = generateRandomPassword();

  // Create user account
  const user = await User.create({
    name,
    username,
    email,
    password,
    role: "patient",
    profileId: newPatient._id
  });

  return res.status(201).json(
    new ApiResponse(201, 
      { 
        patient: newPatient, 
        credentials: { username, password: password, email }  
      }, 
      "Patient added successfully with generated credentials"
    )
  );
});

export const addPatientToDoctor = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { patientId, programId } = req.body;

  const doctor = await Doctor.findById(doctorId).populate('assignedPrograms.program');
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  // Get the program
  const program = await Program.findById(programId);
  if (!program) {
    throw new ApiError(404, "Program not found");
  }

  // Check if doctor is assigned to this program
  const programAssigned = doctor.assignedPrograms.some(
    p => p.program._id.toString() === programId
  );

  if (!programAssigned) {
    throw new ApiError(400, "Doctor is not assigned to this program");
  }

  // Update patient with doctor and program details
  patient.doctor = doctorId;
  patient.selectedProgram = {
    program: programId,
    enrollmentDate: new Date(),
    status: "active"
  };
  await patient.save();

  // Add patient to doctor's patients array if not already there
  if (!doctor.patients.includes(patientId)) {
    doctor.patients.push(patientId);
    await doctor.save();
  }

  return res.status(200).json(
    new ApiResponse(200, { patient, doctor }, "Patient added to doctor successfully")
  );
});

export const removePatientFromDoctor = asyncHandler(async (req, res) => {
  const { doctorId, patientId } = req.params;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  // Remove doctor reference from patient
  patient.doctor = undefined;
  patient.selectedProgram = undefined;
  await patient.save();

  // Remove patient from doctor's patients array
  doctor.patients = doctor.patients.filter(
    id => id.toString() !== patientId
  );
  await doctor.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Patient removed from doctor successfully")
  );
});

export const removeDoctor = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  // Find and update all patients assigned to this doctor
  await Patient.updateMany(
    { doctor: doctorId },
    { $unset: { doctor: "", selectedProgram: "" } }
  );

  // Delete the doctor profile
  await Doctor.findByIdAndDelete(doctorId);

  // Delete the associated user account
  await User.deleteOne({ role: "doctor", profileId: doctorId });

  return res.status(200).json(
    new ApiResponse(200, {}, "Doctor removed successfully")
  );
});

export const getPatientData = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const patient = await Patient.findById(patientId)
    .populate('doctor', 'name domain hospital')
    .populate('selectedProgram', 'name description');

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  return res.status(200).json(
    new ApiResponse(200, patient, "Patient data fetched successfully")
  );
})

export const removePatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  // If patient is assigned to a doctor, remove from doctor's list
  if (patient.doctor) {
    await Doctor.updateOne(
      { _id: patient.doctor },
      { $pull: { patients: patientId } }
    );
  }

  // Delete the patient profile
  await Patient.findByIdAndDelete(patientId);

  // Delete the associated user account
  await User.deleteOne({ role: "patient", profileId: patientId });

  return res.status(200).json(
    new ApiResponse(200, {}, "Patient removed successfully")
  );
});

export const getAllPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find().populate(
    "doctor",
    "name domain city"
  );
  return res.status(200).json(
    new ApiResponse(200, patients, "Patients fetched successfully")
  );
});

// Create a new patient with basic details
export const createPatient = asyncHandler(async (req, res) => {
    const {
        name,
        age,
        problems,
        city,
        email,
        medicalHistory,
        allergies,
        emergencyContact,
        selectedProgram
    } = req.body;

    // Validate required fields
    if (!name || !age || !problems || !city || !email) {
        throw new ApiError(400, "All required fields must be provided");
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "Email is already registered");
    }

    // Generate a temporary password and username
    const temporaryPassword = generateRandomPassword();
    const username = generateUsername(name);

    // Create user account
    const user = await User.create({
        name,        // Set the name field
        username,    // Set the username field
        email,
        password: temporaryPassword,  // No need to hash, model pre-save hook will handle it
        role: "patient"
    });

    // Create patient profile
    const patientData = {
        name,
        age: parseInt(age),
        problems,
        city,
        medicalHistory: medicalHistory || "",
        allergies: Array.isArray(allergies) ? allergies : []
    };

    // Add emergency contact if provided
    if (emergencyContact && typeof emergencyContact === 'object') {
        patientData.emergencyContact = emergencyContact;
    }

    // Add selected program if provided (without doctor assignment)
    if (selectedProgram && selectedProgram.program) {
        // Verify program exists
        const program = await Program.findById(selectedProgram.program);
        if (!program) {
            throw new ApiError(404, "Program not found");
        }

        // Calculate end date based on membership duration
        const enrollmentDate = new Date();
        const endDate = new Date(enrollmentDate);
        
        switch (selectedProgram.membership.duration) {
            case "1 month":
                endDate.setMonth(endDate.getMonth() + 1);
                break;
            case "3 months":
                endDate.setMonth(endDate.getMonth() + 3);
                break;
            case "6 months":
                endDate.setMonth(endDate.getMonth() + 6);
                break;
            default:
                endDate.setMonth(endDate.getMonth() + 1);
        }

        // Set program in patient data (but no doctor assignment)
        patientData.selectedProgram = {
            program: selectedProgram.program,
            enrollmentDate,
            membership: {
                duration: selectedProgram.membership.duration,
                price: selectedProgram.membership.price,
                endDate
            },
            status: "active" // Must use "active" to comply with schema even though no doctor assigned yet
        };
    }

    // Create the patient
    const patient = await Patient.create(patientData);

    // Link user to patient profile
    user.profileId = patient._id;
    await user.save();

    return res.status(201).json(
        new ApiResponse(201, {
            patient,
            username,
            password: temporaryPassword
        }, "Patient created successfully with temporary credentials")
    );
});

// Assign a patient to a doctor
export const assignPatientToDoctor = asyncHandler(async (req, res) => {
  const { patientId, doctorId, programId, membership } = req.body;

  // Validate both doctor and patient exist
  const [doctor, patient, program] = await Promise.all([
    Doctor.findById(doctorId),
    Patient.findById(patientId),
    programId ? Program.findById(programId) : null
  ]);

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  if (programId && !program) {
    throw new ApiError(404, "Program not found");
  }

  // Check if the patient is already assigned to this doctor
  if (patient.doctor && patient.doctor.toString() === doctorId) {
    throw new ApiError(400, "Patient is already assigned to this doctor");
  }

  // Check if doctor has the program assigned
  if (programId) {
    const programAssigned = doctor.assignedPrograms.some(
      p => p.program.toString() === programId
    );
    
    if (!programAssigned) {
      throw new ApiError(400, "Doctor is not assigned to this program");
    }
  }

  // If patient is already assigned to another doctor, remove from that doctor
  if (patient.doctor) {
    const currentDoctor = await Doctor.findById(patient.doctor);
    if (currentDoctor) {
      // Remove patient from current doctor's patients array
      currentDoctor.patients = currentDoctor.patients.filter(
        p => p.toString() !== patientId
      );
      currentDoctor.currentSubscribers -= 1;
      await currentDoctor.save();
    }
  }

  // Update patient with new doctor and program if provided
  patient.doctor = doctorId;

  // Update program details if provided
  if (programId && membership) {
    // Calculate end date based on membership duration
    const endDate = new Date();
    const durationMap = {
      "1 month": 1,
      "3 months": 3,
      "6 months": 6
    };
    
    const months = durationMap[membership.duration] || 1;
    endDate.setMonth(endDate.getMonth() + months);

    // If patient already has a program, add it to history
    if (patient.selectedProgram && patient.selectedProgram.status === "active") {
      patient.programHistory.push({
        program: patient.selectedProgram.program,
        programName: program ? program.name : "Unknown Program",
        doctorId: patient.doctor,
        doctorName: doctor.name,
        startDate: patient.selectedProgram.enrollmentDate,
        endDate: new Date(),
        membership: patient.selectedProgram.membership,
        status: "cancelled"
      });
    }

    // Set new program
    patient.selectedProgram = {
      program: programId,
      enrollmentDate: new Date(),
      membership: {
        duration: membership.duration,
        price: membership.price,
        endDate: endDate
      },
      status: "active"
    };
  }

  await patient.save();

  // Add patient to new doctor's patients array if not already there
  if (!doctor.patients.includes(patientId)) {
    doctor.patients.push(patientId);
    doctor.currentSubscribers += 1;
    doctor.totalSubscribers += 1;
    await doctor.save();
  }

  return res.status(200).json(
    new ApiResponse(200, 
      { 
        patient: await Patient.findById(patientId)
          .populate("doctor", "name domain city")
          .populate("selectedProgram.program", "name"),
        doctor: {
          name: doctor.name,
          domain: doctor.domain,
          totalPatients: doctor.patients.length
        }
      }, 
      "Patient assigned to doctor successfully"
    )
  );
});

// Get patients for a specific doctor
export const getDoctorPatients = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }
    
    const patients = await Patient.find({ doctor: doctorId })
        .select("name age problems selectedProgram city status")
        .populate('selectedProgram.program');
    
    return res.status(200).json(
        new ApiResponse(200, patients, "Doctor's patients fetched successfully")
    );
});


// Add a new program
export const addProgram = asyncHandler(async (req, res) => {
    const { name, description, memberships } = req.body;

    // Validate required fields
    if (!name || !description || !memberships || memberships.length === 0) {
        return res.status(400).json(new ApiResponse(400, null, "All fields are required"));
    }

    // Create the program
    const newProgram = await Program.create({
        name,
        description,
        memberships,
        createdBy: req.user.id // Assuming you have user info in req.user
    });

    return res.status(201).json(new ApiResponse(201, newProgram, "Program created successfully"));
});