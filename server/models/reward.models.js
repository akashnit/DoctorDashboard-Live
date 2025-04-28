import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: "/images/rewards/default.jpg"
    },
    rank: {
        type: Number,
        required: true
    },
    requiredReferrals: {
        type: Number,
        required: true,
        min: 1
    },
    isActive: {
        type: Boolean,
        default: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export const Reward = mongoose.model("Reward", rewardSchema);