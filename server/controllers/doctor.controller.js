import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Doctor } from "../models/doctor.models.js";
import { Patient } from "../models/patient.models.js";
import { Program } from "../models/program.models.js";

export const getDoctorProfile = asyncHandler(async (req, res) => {
    const doctorId = req.user.profileId;
    
    const doctor = await Doctor.findById(doctorId).populate('assignedPrograms.program');
    if (!doctor) {
        throw new ApiError(404, "Doctor profile not found");
    }
    
    return res.status(200).json(
        new ApiResponse(200, doctor, "Doctor profile fetched successfully")
    );
});

export const updateDoctorProfile = asyncHandler(async (req, res) => {
    const doctorId = req.user.profileId;
    const { name, domain, city, hospital } = req.body;
    
    const doctor = await Doctor.findByIdAndUpdate(
        doctorId,
        { name, domain, city, hospital },
        { new: true }
    ).populate('assignedPrograms.program');
    
    if (!doctor) {
        throw new ApiError(404, "Doctor profile not found");
    }
    
    return res.status(200).json(
        new ApiResponse(200, doctor, "Doctor profile updated successfully")
    );
});

export const getDoctorPrograms = asyncHandler(async (req, res) => {
    const doctorId = req.user.profileId;
    
    const doctor = await Doctor.findById(doctorId).populate('assignedPrograms.program');
    if (!doctor) {
        throw new ApiError(404, "Doctor profile not found");
    }
    
    const programs = doctor.assignedPrograms.map(p => ({
        _id: p.program._id,
        name: p.program.name,
        description: p.program.description,
        domain: p.program.domain,
        membershipDurations: p.program.membershipDurations,
        assignedDate: p.assignedDate,
        activeSubscribers: p.activeSubscribers,
        totalSubscribers: p.totalSubscribers,
        currentEarnings: p.currentEarnings,
        totalEarnings: p.totalEarnings,
        // Add subscription metrics by duration
        threeMonthsSubscribers: p.subscriptionMetrics?.find(m => m.duration === 3)?.activeSubscribers || 0,
        sixMonthsSubscribers: p.subscriptionMetrics?.find(m => m.duration === 6)?.activeSubscribers || 0,
        twelveMonthsSubscribers: p.subscriptionMetrics?.find(m => m.duration === 12)?.activeSubscribers || 0,
    }));
    
    return res.status(200).json(
        new ApiResponse(200, programs, "Doctor's programs fetched successfully")
    );
});

export const getDoctorProgramById = asyncHandler(async (req, res) => {
    const doctorId = req.user.profileId;
    const { programId } = req.params;
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        throw new ApiError(404, "Doctor profile not found");
    }
    
    // Find the program in doctor's assigned programs
    const programData = doctor.assignedPrograms.find(
        p => p.program.toString() === programId
    );
    
    if (!programData) {
        throw new ApiError(404, "Program not found or not assigned to this doctor");
    }
    
    // Get full program details
    const program = await Program.findById(programId);
    if (!program) {
        throw new ApiError(404, "Program not found");
    }
    
    // Combine program details with doctor-specific stats
    const result = {
        _id: program._id,
        name: program.name,
        description: program.description,
        domain: program.domain,
        membershipDurations: program.membershipDurations,
        assignedDate: programData.assignedDate,
        activeSubscribers: programData.activeSubscribers,
        totalSubscribers: programData.totalSubscribers,
        currentEarnings: programData.currentEarnings,
        totalEarnings: programData.totalEarnings,
        // Add subscription metrics by duration
        threeMonthsSubscribers: programData.subscriptionMetrics?.find(m => m.duration === 3)?.activeSubscribers || 0,
        sixMonthsSubscribers: programData.subscriptionMetrics?.find(m => m.duration === 6)?.activeSubscribers || 0,
        twelveMonthsSubscribers: programData.subscriptionMetrics?.find(m => m.duration === 12)?.activeSubscribers || 0,
    };
    
    return res.status(200).json(
        new ApiResponse(200, result, "Program details fetched successfully")
    );
});

export const getProgramMembers = asyncHandler(async (req, res) => {
    const doctorId = req.user.profileId;
    const { programId } = req.params;
    
    // Verify that the program is assigned to this doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        throw new ApiError(404, "Doctor profile not found");
    }
    
    const isProgramAssigned = doctor.assignedPrograms.some(
        p => p.program.toString() === programId
    );
    
    if (!isProgramAssigned) {
        throw new ApiError(403, "Program not assigned to this doctor");
    }
    
    // Get all patients enrolled in this program under this doctor
    const patients = await Patient.find({
        doctor: doctorId,
        'selectedProgram.program': programId
    }).select("name age city state occupation problems status notes selectedProgram.startDate");
    
    // Format patient data for the frontend
    const members = patients.map(patient => ({
        _id: patient._id,
        name: patient.name,
        age: patient.age,
        city: patient.city,
        state: patient.state,
        occupation: patient.occupation,
        problems: patient.problems,
        status: patient.status,
        notes: patient.notes,
        startDate: patient.selectedProgram.startDate
    }));
    
    return res.status(200).json(
        new ApiResponse(200, members, "Program members fetched successfully")
    );
});

export const getProgramStats = asyncHandler(async (req, res) => {
    const doctorId = req.user.profileId;
    const { programId } = req.params;
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        throw new ApiError(404, "Doctor profile not found");
    }
    
    const programData = doctor.assignedPrograms.find(
        p => p.program.toString() === programId
    );
    
    if (!programData) {
        throw new ApiError(404, "Program not found or not assigned to this doctor");
    }
    
    // Calculate additional statistics if needed
    // For example, monthly growth, retention rate, etc.
    
    const stats = {
        activeSubscribers: programData.activeSubscribers,
        totalSubscribers: programData.totalSubscribers,
        currentEarnings: programData.currentEarnings,
        totalEarnings: programData.totalEarnings,
        subscriptionMetrics: programData.subscriptionMetrics || [],
        // Add more detailed statistics here
    };
    
    return res.status(200).json(
        new ApiResponse(200, stats, "Program statistics fetched successfully")
    );
});

export const getDoctorPatients = asyncHandler(async (req, res) => {
    const doctorId = req.user.profileId;
    
    const patients = await Patient.find({ doctor: doctorId })
        .select("name age problems selectedProgram city status")
        .populate('selectedProgram.program');
    
    return res.status(200).json(
        new ApiResponse(200, patients, "Patients fetched successfully")
    );
});

export const updatePatientStatus = asyncHandler(async (req, res) => {
    const { patientId } = req.params;
    const { status, notes } = req.body;

    const patient = await Patient.findOne({
        _id: patientId,
        doctor: req.user.profileId,
    });

    if (!patient) {
        throw new ApiError(404, "Patient not found");
    }

    patient.status = status;
    patient.notes = notes;
    await patient.save();

    return res.status(200).json(
        new ApiResponse(200, patient, "Patient status updated successfully")
    );
});

export const getDoctorEarnings = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.user.profileId);
    if (!doctor) {
        throw new ApiError(404, "Doctor profile not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {
            currentEarnings: doctor.currentEarnings,
            totalEarnings: doctor.totalEarnings,
            currentSubscribers: doctor.currentSubscribers,
            totalSubscribers: doctor.totalSubscribers,
        }, "Earnings fetched successfully")
    );
}); 