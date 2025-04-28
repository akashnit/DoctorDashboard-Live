import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.models.js";
import { Doctor } from "../models/doctor.models.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

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
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
};

const debugAdminRoutes = async () => {
  try {
    await connectDB();
    
    // 1. Check if admin user exists
    const admin = await User.findOne({ role: "admin" });
    
    if (!admin) {
      console.log("❌ No admin user found in the database!");
      return;
    }
    
    console.log("✅ Admin user exists:", {
      id: admin._id,
      username: admin.username,
      email: admin.email
    });
    
    // 2. Generate a test token for admin
    const accessToken = jwt.sign(
      { id: admin._id, role: admin.role },
      config.accessTokenSecret,
      { expiresIn: config.accessTokenExpiry }
    );
    
    console.log("✅ Generated test admin token:", accessToken.substring(0, 20) + "...");
    
    // 3. Check for any doctors in database
    const doctorCount = await Doctor.countDocuments();
    console.log(`✅ Found ${doctorCount} doctors in database`);
    
    if (doctorCount > 0) {
      const doctors = await Doctor.find().limit(3);
      console.log("Sample doctors:", doctors.map(d => ({
        id: d._id,
        name: d.name,
        domain: d.domain,
        city: d.city
      })));
    }
    
    // 4. Verify admin routes setup
    console.log("\n🔍 Admin API Routes Check:");
    console.log("- GET /api/v1/admin/doctors - Fetch all doctors");
    console.log("- POST /api/v1/admin/doctor - Add a new doctor");
    console.log("- DELETE /api/v1/admin/doctor/:doctorId - Remove a doctor");
    
    console.log("\n📝 To test the API with your generated token:");
    console.log(`curl -H "Authorization: Bearer ${accessToken}" http://localhost:8080/api/v1/admin/doctors`);
    
    console.log("\n🚀 Next steps:");
    console.log("1. Make sure your server is running on port 8080");
    console.log("2. Check that CORS is properly configured for your frontend");
    console.log("3. Ensure your frontend is sending the correct Authorization header");
    
    // Close the database connection
    mongoose.connection.close();
    
  } catch (error) {
    console.error("Debug error:", error);
  }
};

// Run the debug function
debugAdminRoutes(); 