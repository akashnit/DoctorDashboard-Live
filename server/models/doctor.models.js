import mongoose from "mongoose";

const qualificationsOptions = [
  "MBBS",
  "MD",
  "MS",
  "DNB",
  "MCh",
  "DM",
  "BDS",
  "BAMS",
  "BHMS",
  "Other",
];

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    domain: {
      type: String,
      required: true,
    },
    yearsOfExperience: {
      type: Number,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
    },
    qualifications: {
      type: [String],
      enum: qualificationsOptions,
    },
    patients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
      },
    ],
    currentSubscribers: {
      type: Number,
      default: 0,
    },
    totalSubscribers: {
      type: Number,
      default: 0,
    },
    currentEarnings: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    // Reference to programs this doctor is assigned to
    assignedPrograms: [
      {
        program: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Program",
          required: true,
        },
        assignedDate: {
          type: Date,
          default: Date.now,
        },
        // Statistics per program
        activeSubscribers: {
          type: Number,
          default: 0,
        },
        totalSubscribers: {
          type: Number,
          default: 0,
        },
        currentEarnings: {
          type: Number,
          default: 0,
        },
        totalEarnings: {
          type: Number,
          default: 0,
        },
        subscriptionMetrics: [
          {
            duration: {
              type: Number,
              required: true,
              enum: [1, 3, 6, 12],
            },
            activeSubscribers: {
              type: Number,
              default: 0,
            },
            totalSubscribers: {
              type: Number,
              default: 0,
            },
            currentEarnings: {
              type: Number,
              default: 0,
            },
            totalEarnings: {
              type: Number,
              default: 0,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

// Update stats when a new patient is added
doctorSchema.methods.updateStatsOnPatientAdd = async function (
  programId,
  membershipPrice
) {
  this.currentSubscribers += 1;
  this.totalSubscribers += 1;
  this.currentEarnings += membershipPrice;
  this.totalEarnings += membershipPrice;

  // If program-specific stats should be updated
  if (programId) {
    const programIndex = this.assignedPrograms.findIndex(
      (p) => p.program.toString() === programId.toString()
    );

    if (programIndex !== -1) {
      this.assignedPrograms[programIndex].activeSubscribers += 1;
      this.assignedPrograms[programIndex].totalSubscribers += 1;
      this.assignedPrograms[programIndex].currentEarnings += membershipPrice;
      this.assignedPrograms[programIndex].totalEarnings += membershipPrice;
    }
  }

  await this.save();
};

// Update stats when a patient is removed
doctorSchema.methods.updateStatsOnPatientRemove = async function (
  programId,
  membershipPrice
) {
  if (this.currentSubscribers > 0) {
    this.currentSubscribers -= 1;
    this.currentEarnings -= membershipPrice;
  }

  // If program-specific stats should be updated
  if (programId) {
    const programIndex = this.assignedPrograms.findIndex(
      (p) => p.program.toString() === programId.toString()
    );

    if (
      programIndex !== -1 &&
      this.assignedPrograms[programIndex].activeSubscribers > 0
    ) {
      this.assignedPrograms[programIndex].activeSubscribers -= 1;
      this.assignedPrograms[programIndex].currentEarnings -= membershipPrice;
    }
  }

  await this.save();
};

export const qualifications = qualificationsOptions;

export const Doctor = mongoose.model("Doctor", doctorSchema);
