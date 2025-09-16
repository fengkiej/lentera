import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Import routes
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import lessonRoutes from "./routes/lessons";
import progressRoutes from "./routes/progress";
import practiceRoutes from "./routes/practice";
import adminRoutes from "./routes/admin";

import topicsRoutes from "./routes/topics";
import achievementsRoutes from "./routes/achievements";
import statsRoutes from "./routes/stats";
import subjectsRoutes from "./routes/subjects";
import ollamaRoutes from "./routes/ollamaRoutes";

// Import middleware
import { setupSwagger } from "./config/swagger.js";
import { clerkMiddleware } from "@clerk/express";
import { generalRateLimit } from "./middleware/rateLimiting.js";
import { requestLogger } from "./middleware/logging.js";
import { errorHandler as enhancedErrorHandler, notFoundHandler } from "./middleware/errorHandling.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_PREFIX = process.env.API_PREFIX || "/api/v1";

// Create uploads directory if it doesn't exist
const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Request logging middleware
app.use(requestLogger);

// General rate limiting
app.use(generalRateLimit);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:"],
        // When CORS_ORIGIN is "*", we need to handle CSP correctly
        // A wildcard "*" in connectSrc needs special handling
        connectSrc: process.env.CORS_ORIGIN === "*"
          ? ["'self'", "*"] // Allow all connections when wildcard is specified
          : ["'self'",
             "http://localhost:3001",
             "http://127.0.0.1:3001",
             "http://localhost:5173",
             process.env.CORS_ORIGIN || "http://localhost:8080"
            ],
      },
    },
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN === "*"
      ? true // Allow any origin when wildcard is specified
      : [
          process.env.CORS_ORIGIN || "http://localhost:8080",
          "http://localhost:3001", // Allow Swagger UI
          "http://127.0.0.1:3001", // Allow localhost variations
          "http://localhost:5173", // Allow Admin UI
        ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
  })
);

// Logging middleware
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from uploads directory
app.use("/uploads", express.static(uploadsDir));

// Clerk middleware
app.use(
  clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
    secretKey: process.env.CLERK_SECRET_KEY!,
    // Add authorized parties to ensure JWT verification for API routes
    // Even when CORS_ORIGIN is "*", we need to specify actual domains for JWT verification
    authorizedParties: process.env.CORS_ORIGIN === "*"
      ? ["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:5173"]
      : [process.env.CORS_ORIGIN || "http://localhost:8080", "http://localhost:8080", "http://127.0.0.1:8080"],
  })
);

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log("Headers:", {
    authorization: req.headers.authorization,
    "content-type": req.headers["content-type"],
  });
  next();
});

// Setup Swagger documentation
setupSwagger(app);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/user`, userRoutes);
app.use(`${API_PREFIX}/lessons`, lessonRoutes);
app.use(`${API_PREFIX}/progress`, progressRoutes);
app.use(`${API_PREFIX}/practice`, practiceRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);

app.use(`${API_PREFIX}/topics`, topicsRoutes);
app.use(`${API_PREFIX}/achievements`, achievementsRoutes);
app.use(`${API_PREFIX}/stats`, statsRoutes);
app.use(`${API_PREFIX}/subjects`, subjectsRoutes);
app.use(`${API_PREFIX}/ollama`, ollamaRoutes);

// API info endpoint
app.get(API_PREFIX, (req, res) => {
  res.json({
    name: "Lentera AI Backend API",
    version: "1.0.0",
    description: "Backend service for Lentera AI - General Learning App",
    endpoints: {
      auth: `${API_PREFIX}/auth`,
      user: `${API_PREFIX}/user`,
      lessons: `${API_PREFIX}/lessons`,
      rootWords: `${API_PREFIX}/root-words`,
      progress: `${API_PREFIX}/progress`,
      practice: `${API_PREFIX}/practice`,
      voice: `${API_PREFIX}/voice`,
    },
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(enhancedErrorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Lentera AI Backend Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`📋 API Endpoints: http://localhost:${PORT}${API_PREFIX}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

export default app;
