import mongoose from "mongoose";
import dotenv from "dotenv";
import { Program } from "../models/program.models.js";
import { User } from "../models/user.models.js";
import { generateRandomPassword } from "./credentialGenerator.js";
import bcrypt from "bcrypt";

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error("MONGO_URI not defined in environment variables");
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB for seeding");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
};

// Initial healthcare programs
const initialPrograms = [
  {
    name: "Lifestyle Disease Therapy",
    description:
      "A comprehensive program designed to help patients manage lifestyle diseases through personalized diet plans, exercise routines, and behavioral therapy.",
    memberships: [
      { duration: "1 month", price: 4500 },
      { duration: "3 months", price: 12000 },
      { duration: "6 months", price: 21600 },
    ],
  },
  {
    name: "Gastrointestinal Issues",
    description:
      "Specialized care for managing gastrointestinal conditions, including dietary adjustments, medication management, and lifestyle changes.",
    memberships: [
      { duration: "1 month", price: 6500 },
      { duration: "3 months", price: 18000 },
      { duration: "6 months", price: 33000 },
    ],
  },
  {
    name: "Musculoskeletal Pain",
    description:
      "A monitored program designed for patients suffering from various musculoskeletal issues, focusing on therapeutic exercises and pain management techniques.",
    memberships: [
      { duration: "1 month", price: 5500 },
      { duration: "3 months", price: 15000 },
      { duration: "6 months", price: 27000 },
    ],
  },
  {
    name: "ENT Wellness",
    description:
      "A holistic approach to managing ear, nose, and throat conditions through various therapeutic techniques and lifestyle adjustments.",
    memberships: [
      { duration: "1 month", price: 5000 },
      { duration: "3 months", price: 13500 },
      { duration: "6 months", price: 24000 },
    ],
  },
  {
    name: "Holistic Female Wellness",
    description:
      "Female Wellness Sessions that reconnect with your Mind, Body, and Soul through a transformative program designed for women with issues like PCOD/PCOS/menstrual issues.",
    memberships: [
      { duration: "1 month", price: 7000 },
      { duration: "3 months", price: 18000 },
      { duration: "6 months", price: 32000 },
    ],
  },
  {
    name: "Postpartum/Postnatal Wellness",
    description:
      "Specialized care for women after childbirth, focusing on physical recovery, mental wellness, and overall health restoration.",
    memberships: [
      { duration: "1 month", price: 7500 },
      { duration: "3 months", price: 20000 },
      { duration: "6 months", price: 36000 },
    ],
  },
  {
    name: "Pregnancy/Prenatal Wellness",
    description:
      "Comprehensive support for pregnant women through prenatal care, nutrition guidance, and preparation for childbirth.",
    memberships: [
      { duration: "1 month", price: 7500 },
      { duration: "3 months", price: 20000 },
      { duration: "6 months", price: 36000 },
    ],
  },
  {
    name: "Fitness And Beauty",
    description:
      "A structured program to enhance physical appearance and fitness through exercise routines, dietary guidance, and wellness practices.",
    memberships: [
      { duration: "1 month", price: 4000 },
      { duration: "3 months", price: 10000 },
      { duration: "6 months", price: 18000 },
    ],
  },
  {
    name: "Holistic General Fitness",
    description:
      "A comprehensive approach to overall fitness focusing on physical, mental, and nutritional wellness for general health improvement.",
    memberships: [
      { duration: "1 month", price: 4500 },
      { duration: "3 months", price: 12000 },
      { duration: "6 months", price: 21000 },
    ],
  },
  {
    name: "Men's Sexual Health",
    description:
      "Specialized care for men's sexual and reproductive health issues through medical guidance, therapeutic approaches, and lifestyle modifications.",
    memberships: [
      { duration: "1 month", price: 6000 },
      { duration: "3 months", price: 16000 },
      { duration: "6 months", price: 28800 },
    ],
  },
  {
    name: "Emotional & Spiritual Wellness",
    description:
      "A holistic program focusing on emotional health and spiritual well-being through mindfulness, counseling, and healing practices.",
    memberships: [
      { duration: "1 month", price: 5500 },
      { duration: "3 months", price: 14000 },
      { duration: "6 months", price: 25000 },
    ],
  },
];

// Create or update admin user with predefined credentials
const createAdminUser = async () => {
  const adminExists = await User.findOne({ role: "admin" });

  if (adminExists) {
    console.log("Admin user already exists, skipping admin creation.");
    return adminExists; // Return the existing admin user
  }

  const adminData = {
    name: "Admin",
    username: process.env.ADMIN_USERNAME || "admin1",
    email: process.env.ADMIN_EMAIL || "admin1@arogbharat.com",
    password: process.env.ADMIN_PASSWORD || "Admin@1234",
    role: "admin",
  };

  const adminUser = await User.create(adminData);
  console.log("Admin user created");
  return adminUser; // Return the newly created admin user
};

// Seed programs
const seedPrograms = async () => {
  try {
    // Connect to database
    await connectDB();

    // Create admin user
    const adminUser = await createAdminUser();

    // Count existing programs
    const count = await Program.countDocuments();

    if (count === 0) {
      // Insert all programs at once with createdBy set to adminUser._id
      const programsWithAdmin = initialPrograms.map(program => ({
        ...program,
        createdBy: adminUser._id // Set createdBy to the admin user's ID
      }));

      await Program.insertMany(programsWithAdmin);
      console.log(`${initialPrograms.length} programs seeded successfully`);
    } else {
      console.log(`Database already has ${count} programs, skipping seed`);
    }

    console.log("Database seeding completed");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seeder
seedPrograms();
