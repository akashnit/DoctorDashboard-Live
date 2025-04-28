  import mongoose from "mongoose";

  const patientSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    problems: {
      type: String,
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    selectedProgram: {
      program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Program"
      },
      enrollmentDate: {
        type: Date,
        default: Date.now,
      },
      membership: {
        duration: {
          type: String,
          enum: ["1 month", "3 months", "6 months"],
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        endDate: {
          type: Date,
          required: true
        }
      },
      status: {
        type: String,
        enum: ["active", "completed", "cancelled"],
        default: "active"
      }
    },
    programHistory: [{
      program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Program"
      },
      programName: { type: String },
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
      },
      doctorName: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      membership: {
        duration: { 
          type: String,
          enum: ["1 month", "3 months", "6 months"] 
        },
        price: { type: Number }
      },
      status: { 
        type: String,
        enum: ["completed", "cancelled"]
      }
    }],
    city: {
      type: String,
      required: true,
    },
    medicalHistory: {
      type: String,
    },
    allergies: [String],
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String }
    },
    referrals: {
      type: Number,
      default: 0,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    referralCode: {
      type: String,
      unique: true,
    },
    referralHistory: [{
      referredPatient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
      },
      date: {
        type: Date,
        default: Date.now,
      },
    }],
  }, { timestamps: true });

  // Generate unique referral code before saving
  patientSchema.pre("save", async function(next) {
    if (!this.referralCode) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      this.referralCode = code;
    }
    next();
  });

  // Method to record program completion
  patientSchema.methods.completeProgram = async function() {
    if (this.selectedProgram && this.selectedProgram.status === "active") {
      // Add to program history
      this.programHistory.push({
        program: this.selectedProgram.program,
        programName: this.selectedProgram.programName || await this.populateProgram(),
        doctorId: this.doctor,
        doctorName: await this.populateDoctor(),
        startDate: this.selectedProgram.enrollmentDate,
        endDate: new Date(),
        membership: this.selectedProgram.membership,
        status: "completed"
      });
      
      // Clear current program
      this.selectedProgram = undefined;
      this.doctor = undefined;
      
      await this.save();
      return true;
    }
    return false;
  };

  // Helper to get doctor name
  patientSchema.methods.populateDoctor = async function() {
    if (!this.doctor) return null;
    
    const Doctor = mongoose.model("Doctor");
    const doctorDoc = await Doctor.findById(this.doctor);
    return doctorDoc ? doctorDoc.name : "Unknown Doctor";
  };

  // Helper to get program name
  patientSchema.methods.populateProgram = async function() {
    if (!this.selectedProgram || !this.selectedProgram.program) return null;
    
    const Program = mongoose.model("Program");
    const programDoc = await Program.findById(this.selectedProgram.program);
    return programDoc ? programDoc.name : "Unknown Program";
  };

  export const Patient = mongoose.model("Patient", patientSchema);

