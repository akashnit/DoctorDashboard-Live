import { User } from "../models/user.models.js";
import { Doctor } from "../models/doctor.models.js";
import { Patient } from "../models/patient.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

// Register user
export const register = asyncHandler(async (req, res) => {
    const { name, username, email, password, role, ...profileData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
    });
    if (existingUser) {
        throw new ApiError(400, "User with this email or username already exists");
    }

    // Create profile based on role
    let profileId;
    if (role === "doctor") {
        const doctor = await Doctor.create(profileData);
        profileId = doctor._id;
    } else if (role === "patient") {
        const patient = await Patient.create(profileData);
        profileId = patient._id;
    }

    // Create user
    const user = await User.create({
        name,
        username: username.toLowerCase(),
        email,
        password,
        role,
        profileId
    });

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Remove sensitive data
    user.password = undefined;
    user.refreshToken = undefined;

    return res.status(201).json(
        new ApiResponse(201, { user, accessToken, refreshToken }, "User registered successfully")
    );
});

// Login user
export const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    console.log("Login attempt with:", { username, password });
    
    // Check if user exists
    const user = await User.findOne({ 
        $or: [{ username }, { email: username }]
    });
    
    if (!user) {
        console.log("User not found for username/email:", username);
        throw new ApiError(401, "Invalid credentials");
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    console.log("Password validation result:", isPasswordValid);
    
    if (!isPasswordValid) {
        console.log("Invalid password for user:", username);
        throw new ApiError(401, "Invalid credentials");
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Remove sensitive data
    const userWithoutSensitiveInfo = {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        profileId: user.profileId
    };

    // Determine dashboard URL and fetch initial data based on role
    let dashboardUrl = "/admin";
    let roleInfo = {};
    
    switch (user.role) {
        case "admin":
            // Admin gets counts for quick display
            const adminDoctorCount = await Doctor.countDocuments();
            const adminPatientCount = await Patient.countDocuments();
            roleInfo = { doctorCount: adminDoctorCount, patientCount: adminPatientCount };
            dashboardUrl = "/admin";
            break;
            
        case "doctor":
            // Doctor gets their basic info
            const doctorProfile = await Doctor.findById(user.profileId)
                .select("name domain city hospital -_id");
            const doctorPatientCount = await Patient.countDocuments({ doctor: user.profileId });
            roleInfo = { doctorProfile, patientCount: doctorPatientCount };
            dashboardUrl = "/doctor/dashboard";
            break;
            
        case "patient":
            // Patient gets their enrollment status
            const patientProfile = await Patient.findById(user.profileId)
                .select("name problems selectedProgram -_id")
                .populate("doctor", "name domain -_id");
            roleInfo = { patientProfile };
            dashboardUrl = "/patient/dashboard";
            break;
    }

    return res.status(200).json(
        new ApiResponse(200, 
            { 
                user: userWithoutSensitiveInfo, 
                accessToken, 
                refreshToken, 
                dashboardUrl,
                roleInfo
            }, 
            "Logged in successfully"
        )
    );
});

// Refresh Access Token
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken.id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json(
            new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed successfully")
        );
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token");
    }
});

// Logout user
export const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user.id,
        {
            $unset: { refreshToken: 1 }
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, {}, "User logged out successfully")
    );
});

// Get current user
export const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Current user fetched successfully")
    );
});

// Change password
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
        throw new ApiError(401, "Current password is incorrect");
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Password changed successfully")
    );
}); 