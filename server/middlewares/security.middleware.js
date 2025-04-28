import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import { ApiError } from "../utils/ApiError.js";

// Rate limiting
export const limiter = rateLimit({
    max: 100, // Limit each IP to 100 requests per windowMs
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many requests from this IP, please try again in an hour!",
});

// Security headers
export const securityHeaders = helmet();

// Data sanitization against NoSQL query injection
export const noSqlInjectionSanitizer = mongoSanitize();

// Data sanitization against XSS
export const xssSanitizer = xss();

// Prevent parameter pollution
export const parameterPollutionPreventer = hpp({
    whitelist: [
        "duration",
        "ratings",
        "sort",
        "fields",
        "page",
        "limit",
    ],
});

// Request validation middleware
export const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(", ");
            throw new ApiError(400, errorMessage);
        }
        next();
    };
}; 