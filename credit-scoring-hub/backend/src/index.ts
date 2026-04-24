import "dotenv/config";
import cors from "cors";
import express from "express";
import {
  getApplicationById,
  getHistory,
  scoreCredit,
} from "./controllers/scoreController";
import {
  register,
  login,
  getCurrentUser,
  createAdminUser,
} from "./controllers/authController";
import {
  getAllUsers,
  getAllApplications,
  updateApplicationStatus,
  getUserApplications,
  toggleUserStatus,
  getDashboardStats,
} from "./controllers/adminController";
import { authenticateToken, isAdmin } from "./middleware/auth";

const app = express();
const port = Number(process.env.PORT) || 8080;

// Updated CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// Health check (public)
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth routes (public)
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.post("/api/auth/create-admin", createAdminUser);

// Public demo routes
app.post("/api/score", scoreCredit);
app.get("/api/history", getHistory);
app.get("/api/applications/:id", getApplicationById);

// Protected routes
app.get("/api/auth/me", authenticateToken, getCurrentUser);

// Admin routes
app.get("/api/admin/users", authenticateToken, isAdmin, getAllUsers);
app.get(
  "/api/admin/applications",
  authenticateToken,
  isAdmin,
  getAllApplications,
);
app.get("/api/admin/stats", authenticateToken, isAdmin, getDashboardStats);
app.put(
  "/api/admin/applications/:id",
  authenticateToken,
  isAdmin,
  updateApplicationStatus,
);
app.get(
  "/api/admin/users/:userId/applications",
  authenticateToken,
  isAdmin,
  getUserApplications,
);
app.patch(
  "/api/admin/users/:userId/toggle",
  authenticateToken,
  isAdmin,
  toggleUserStatus,
);

// Error handling
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  },
);

app.listen(port, "0.0.0.0", () => {
  console.log(`Backend listening on port ${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
});

export default app;
