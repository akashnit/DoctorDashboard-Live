import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
        trim: true
    },
    username: {
        type: String,
        required: [true, "Please provide a username"],
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please provide a valid email"]
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: [6, "Password should be at least 6 characters"]
    },
    role: {
        type: String,
        enum: ["admin", "doctor", "patient"],
        default: "patient"
    },
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'role'
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate Access Token
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        { id: this._id, role: this.role },
        config.accessTokenSecret,
        { expiresIn: config.accessTokenExpiry }
    );
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        { id: this._id },
        config.refreshTokenSecret,
        { expiresIn: config.refreshTokenExpiry }
    );
};

export const User = mongoose.model("User", userSchema);
