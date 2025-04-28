import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Patient } from "../models/patient.models.js";
import { Doctor } from "../models/doctor.models.js";
import { Program } from "../models/program.models.js";
import { Reward } from "../models/reward.models.js";

export const getPatientProfile = asyncHandler(async (req, res) => {
    const patientId = req.user.profileId;
    
    const patient = await Patient.findById(patientId)
        .populate("doctor", "name domain city hospital")
        .populate("referredBy", "name")
        .populate("selectedProgram.program", "name description");
    
    if (!patient) {
        throw new ApiError(404, "Patient profile not found");
    }

    return res.status(200).json(
        new ApiResponse(200, patient, "Patient profile fetched successfully")
    );
});

export const updatePatientProfile = asyncHandler(async (req, res) => {
    const patientId = req.user.profileId;
    const { name, age, problems, city, medicalHistory, allergies, emergencyContact } = req.body;
    
    const patient = await Patient.findByIdAndUpdate(
        patientId,
        {
            name,
            age,
            problems,
            city,
            medicalHistory,
            allergies,
            emergencyContact
        },
        { new: true }
    );

    if (!patient) {
        throw new ApiError(404, "Patient profile not found");
    }

    return res.status(200).json(
        new ApiResponse(200, patient, "Patient profile updated successfully")
    );
});

export const getPatientPrograms = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.user.profileId).populate(
        "doctor",
        "programs"
    );

    if (!patient) {
        throw new ApiError(404, "Patient profile not found");
    }

    return res.status(200).json(
        new ApiResponse(200, patient.doctor.programs, "Programs fetched successfully")
    );
});

export const updateSelectedProgram = asyncHandler(async (req, res) => {
    const { programName, duration } = req.body;
    
    const patient = await Patient.findById(req.user.profileId);
    if (!patient) {
        throw new ApiError(404, "Patient profile not found");
    }

    patient.selectedProgram = {
        name: programName,
        duration,
    };
    
    await patient.save();

    return res.status(200).json(
        new ApiResponse(200, patient, "Selected program updated successfully")
    );
});

export const getPatientProgress = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.user.profileId).populate("doctor", "name domain city");
    if (!patient) {
        throw new ApiError(404, "Patient profile not found");
    }

    // Sample health metrics data structure - in a real app, this would come from a database
    const healthMetrics = {
        weight: 75, // kg
        weightGoal: 70, // kg
        weightHistory: [
            { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), value: 78 },
            { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), value: 77 },
            { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), value: 76 },
            { date: new Date(), value: 75 }
        ],
        activityLevel: "Moderate",
        activityGoal: "High",
        activityHistory: [
            { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), value: "Low" },
            { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), value: "Moderate" },
            { date: new Date(), value: "Moderate" }
        ]
    };

    return res.status(200).json(
        new ApiResponse(200, {
            status: patient.status,
            notes: patient.notes,
            selectedProgram: patient.selectedProgram,
            healthMetrics: healthMetrics,
            doctor: patient.doctor
        }, "Patient progress fetched successfully")
    );
});

// New Referral Functions
export const getReferralCode = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.user.profileId);
    if (!patient) {
        throw new ApiError(404, "Patient profile not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { referralCode: patient.referralCode }, "Referral code fetched successfully")
    );
});

export const applyReferralCode = asyncHandler(async (req, res) => {
    const patientId = req.user.profileId;
    const { referralCode } = req.body;
    
    if (!referralCode) {
        throw new ApiError(400, "Referral code is required");
    }
    
    // Find patient with this referral code
    const referrer = await Patient.findOne({ referralCode });
    if (!referrer) {
        throw new ApiError(404, "Invalid referral code");
    }
    
    // Can't refer yourself
    if (referrer._id.toString() === patientId) {
        throw new ApiError(400, "Cannot use your own referral code");
    }
    
    // Get current patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
        throw new ApiError(404, "Patient profile not found");
    }
    
    // Check if already referred
    if (patient.referredBy) {
        throw new ApiError(400, "Patient already has a referrer");
    }
    
    // Apply referral
    patient.referredBy = referrer._id;
    await patient.save();
    
    // Update referrer stats
    referrer.referrals += 1;
    referrer.referralHistory.push({
        referredPatient: patientId,
        date: new Date()
    });
    await referrer.save();
    
    return res.status(200).json(
        new ApiResponse(200, 
            { 
                referrerName: referrer.name,
                referralApplied: true 
            }, 
            "Referral code applied successfully"
        )
    );
});

export const getReferralHistory = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.user.profileId)
        .populate("referralHistory.referredPatient", "name selectedProgram");
    
    if (!patient) {
        throw new ApiError(404, "Patient profile not found");
    }

    return res.status(200).json(
        new ApiResponse(200, patient.referralHistory, "Referral history fetched successfully")
    );
});

// Leaderboard Functions
export const getProgramLeaderboard = asyncHandler(async (req, res) => {
    const { programName } = req.params;
    
    const leaderboard = await Patient.aggregate([
        {
            $match: {
                "selectedProgram.name": programName
            }
        },
        {
            $project: {
                name: 1,
                referrals: 1,
                selectedProgram: 1,
                city: 1
            }
        },
        {
            $sort: { referrals: -1 }
        },
        {
            $limit: 10
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, leaderboard, "Leaderboard fetched successfully")
    );
});

export const getReferralStats = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.user.profileId);
    if (!patient) {
        throw new ApiError(404, "Patient profile not found");
    }

    const stats = {
        totalReferrals: patient.referrals,
        program: patient.selectedProgram,
        rank: await Patient.countDocuments({
            "selectedProgram.name": patient.selectedProgram.name,
            referrals: { $gt: patient.referrals }
        }) + 1
    };

    return res.status(200).json(
        new ApiResponse(200, stats, "Referral statistics fetched successfully")
    );
});

// Get all available doctors and their programs
export const getDoctorsWithPrograms = asyncHandler(async (req, res) => {
    const doctors = await Doctor.find()
        .select("name domain city hospital programs")
        .sort({ name: 1 });
    
    return res.status(200).json(
        new ApiResponse(200, doctors, "Doctors with programs fetched successfully")
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

// Get all available programs
export const getAllPrograms = asyncHandler(async (req, res) => {
    const programs = await Program.find({ active: true }).sort({ name: 1 });
    
    return res.status(200).json(
        new ApiResponse(200, programs, "Available programs fetched successfully")
    );
});

// Enroll in a program with a doctor
export const enrollInProgram = asyncHandler(async (req, res) => {
    const patientId = req.user.profileId;
    const { doctorId, programId } = req.body;
    
    // Validate input
    if (!doctorId || !programId) {
        throw new ApiError(400, "Doctor ID and Program ID are required");
    }
    
    // Check if program exists
    const program = await Program.findById(programId);
    if (!program) {
        throw new ApiError(404, "Program not found");
    }
    
    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }
    
    // Check if doctor is assigned to this program
    const programAssigned = doctor.assignedPrograms.some(
        p => p.program.toString() === programId
    );
    
    if (!programAssigned) {
        throw new ApiError(400, "Doctor is not assigned to this program");
    }
    
    // Get patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
        throw new ApiError(404, "Patient profile not found");
    }
    
    // Check if patient is already enrolled in a program
    if (patient.selectedProgram && patient.selectedProgram.status === "active") {
        throw new ApiError(400, "Patient is already enrolled in a program");
    }
    
    // Enroll patient in the program
    patient.doctor = doctorId;
    patient.selectedProgram = {
        program: programId,
        enrollmentDate: new Date(),
        status: "active"
    };
    
    await patient.save();
    
    // Add patient to doctor if not already added
    if (!doctor.patients.includes(patientId)) {
        doctor.patients.push(patientId);
        doctor.currentSubscribers += 1;
        doctor.totalSubscribers += 1;
        await doctor.save();
    }
    
    return res.status(200).json(
        new ApiResponse(200, 
            { 
                patient, 
                enrolledProgram: {
                    program,
                    enrollmentDate: patient.selectedProgram.enrollmentDate,
                    status: patient.selectedProgram.status
                },
                doctor: {
                    name: doctor.name,
                    domain: doctor.domain,
                    city: doctor.city
                } 
            }, 
            "Enrolled in program successfully"
        )
    );
});

// Complete or cancel current program
export const updateProgramStatus = asyncHandler(async (req, res) => {
    const patientId = req.user.profileId;
    const { status } = req.body;
    
    if (!["completed", "cancelled"].includes(status)) {
        throw new ApiError(400, "Status must be either 'completed' or 'cancelled'");
    }
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
        throw new ApiError(404, "Patient profile not found");
    }
    
    // Check if patient is enrolled in a program
    if (!patient.selectedProgram || patient.selectedProgram.status !== "active") {
        throw new ApiError(400, "Patient is not enrolled in any active program");
    }
    
    // Get doctor
    const doctorId = patient.doctor;
    const doctor = await Doctor.findById(doctorId);
    
    // Add to program history
    patient.programHistory.push({
        programName: patient.selectedProgram.name,
        doctorId: patient.doctor,
        doctorName: doctor ? doctor.name : "Unknown Doctor",
        duration: patient.selectedProgram.duration,
        startDate: patient.selectedProgram.enrollmentDate,
        endDate: new Date(),
        status
    });
    
    // Clear current program
    patient.selectedProgram = undefined;
    patient.doctor = undefined;
    
    await patient.save();
    
    // Update doctor stats
    if (doctor) {
        doctor.currentSubscribers -= 1;
        await doctor.save();
    }
    
    return res.status(200).json(
        new ApiResponse(200, patient, `Program ${status} successfully`)
    );
});

// Refer another patient
export const generateReferral = asyncHandler(async (req, res) => {
    const patientId = req.user.profileId;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
        throw new ApiError(404, "Patient profile not found");
    }
    
    // Generate referral code if not already exists
    if (!patient.referralCode) {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        patient.referralCode = code;
        await patient.save();
    }
    
    return res.status(200).json(
        new ApiResponse(200, 
            { 
                referralCode: patient.referralCode,
                referrals: patient.referrals 
            }, 
            "Referral code generated successfully"
        )
    );
});

// General Leaderboard function (not specific to a program)
export const getLeaderboard = asyncHandler(async (req, res) => {
    const leaderboard = await Patient.aggregate([
        {
            $project: {
                name: 1,
                referrals: 1,
                city: 1,
                state: 1,
                selectedProgram: 1
            }
        },
        {
            $sort: { referrals: -1 }
        },
        {
            $limit: 20
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, leaderboard, "Leaderboard fetched successfully")
    );
});

// Get rewards based on referral counts
export const getRewards = asyncHandler(async (req, res) => {
    // Get rewards from database, or define default rewards if not available
    const rewards = await Reward.find().sort({ requiredReferrals: 1 }).limit(10);
    
    // If no rewards in the database, return default rewards
    if (rewards.length === 0) {
        const defaultRewards = [
            {
                rank: 1,
                name: "Premium Health Package",
                description: "Full health checkup and consultation",
                requiredReferrals: 20,
                image: "/images/rewards/premium-package.jpg"
            },
            {
                rank: 2,
                name: "Health Monitoring Device",
                description: "Smart device to track vital health metrics",
                requiredReferrals: 15,
                image: "/images/rewards/monitoring-device.jpg"
            },
            {
                rank: 3,
                name: "Wellness Gift Box",
                description: "Collection of health and wellness products",
                requiredReferrals: 10,
                image: "/images/rewards/gift-box.jpg"
            }
        ];
        
        return res.status(200).json(
            new ApiResponse(200, defaultRewards, "Default rewards fetched successfully")
        );
    }
    
    // Return actual rewards from database
    return res.status(200).json(
        new ApiResponse(200, rewards, "Rewards fetched successfully")
    );
});

// Check if patient qualifies for any rewards
export const checkEligibleRewards = asyncHandler(async (req, res) => {
    const patientId = req.user.profileId;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
        throw new ApiError(404, "Patient profile not found");
    }
    
    // Get rewards sorted by required referrals
    const rewards = await Reward.find().sort({ requiredReferrals: 1 });
    
    // Find eligible rewards based on patient's referral count
    const eligibleRewards = rewards.filter(
        reward => patient.referrals >= reward.requiredReferrals
    );
    
    // Find next reward to aim for
    const nextReward = rewards.find(
        reward => patient.referrals < reward.requiredReferrals
    );
    
    return res.status(200).json(
        new ApiResponse(200, {
            eligibleRewards,
            nextReward,
            referralsNeeded: nextReward 
                ? nextReward.requiredReferrals - patient.referrals 
                : 0
        }, "Eligible rewards fetched successfully")
    );
}); 