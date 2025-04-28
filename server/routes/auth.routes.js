import express from "express";
import { register, login, logout, getCurrentUser, refreshAccessToken, changePassword } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", verifyJWT, logout);
router.get("/me", verifyJWT, getCurrentUser);

// TEMPORARY: Reset admin password endpoint (remove in production)
router.post("/reset-admin", asyncHandler(async (req, res) => {
    // Find admin user
    const admin = await User.findOne({ username: "admin" });
    
    if (!admin) {
        return res.status(404).json({
            success: false,
            message: "Admin user not found"
        });
    }
    
    // Reset password to Admin@123
    admin.password = "Admin@123";
    await admin.save(); // This will trigger the password hashing pre-save hook
    
    return res.status(200).json(
        new ApiResponse(200, { message: "Admin password reset successfully" })
    );
}));

// TEMPORARY: Password testing endpoint (remove in production)
router.post("/test-password", asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }
    
    // Test password
    const isMatch = await user.comparePassword(password);
    
    return res.status(200).json(
        new ApiResponse(200, { 
            isMatch,
            username: user.username,
            password_hash: user.password.substring(0, 10) + "..." // Show partial hash for debugging
        })
    );
}));

// Change password route (protected)
router.post("/change-password", verifyJWT, changePassword);

export { router as authRoutes }; 