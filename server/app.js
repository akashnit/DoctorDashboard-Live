import { config } from "./config/config.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRoutes } from './routes/auth.routes.js';
import { dashboardRoutes } from './routes/dashboard.routes.js';
import { adminRoutes } from './routes/admin.routes.js';
import { doctorRoutes } from './routes/doctor.routes.js';
import { patientRoutes } from './routes/patient.routes.js';
import { programRoutes } from './routes/program.routes.js';
import { errorHandler } from "./middlewares/error.middleware.js";
import {
  limiter,
  securityHeaders,
  noSqlInjectionSanitizer,
  xssSanitizer,
  parameterPollutionPreventer,
} from "./middlewares/security.middleware.js";

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Requested-With", "Accept"]
}));

app.options("*", cors());

app.use(securityHeaders);
app.use(limiter);
app.use(noSqlInjectionSanitizer);
app.use(xssSanitizer);
app.use(parameterPollutionPreventer);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/doctor", doctorRoutes);
app.use("/api/v1/patient", patientRoutes);
app.use("/api/v1/programs", programRoutes);
app.use("/api/v1/", dashboardRoutes);



app.use(errorHandler);

export { app };
