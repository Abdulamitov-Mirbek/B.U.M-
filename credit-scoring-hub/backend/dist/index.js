"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const scoreController_1 = require("./controllers/scoreController");
const authController_1 = require("./controllers/authController");
const adminController_1 = require("./controllers/adminController");
const auth_1 = require("./middleware/auth");
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 8080;
// Updated CORS configuration
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json());
// Health check (public)
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Auth routes (public)
app.post("/api/auth/register", authController_1.register);
app.post("/api/auth/login", authController_1.login);
app.post("/api/auth/create-admin", authController_1.createAdminUser);
// Public demo routes
app.post("/api/score", scoreController_1.scoreCredit);
app.get("/api/history", scoreController_1.getHistory);
app.get("/api/applications/:id", scoreController_1.getApplicationById);
// Protected routes
app.get("/api/auth/me", auth_1.authenticateToken, authController_1.getCurrentUser);
// Admin routes
app.get("/api/admin/users", auth_1.authenticateToken, auth_1.isAdmin, adminController_1.getAllUsers);
app.get("/api/admin/applications", auth_1.authenticateToken, auth_1.isAdmin, adminController_1.getAllApplications);
app.get("/api/admin/stats", auth_1.authenticateToken, auth_1.isAdmin, adminController_1.getDashboardStats);
app.put("/api/admin/applications/:id", auth_1.authenticateToken, auth_1.isAdmin, adminController_1.updateApplicationStatus);
app.get("/api/admin/users/:userId/applications", auth_1.authenticateToken, auth_1.isAdmin, adminController_1.getUserApplications);
app.patch("/api/admin/users/:userId/toggle", auth_1.authenticateToken, auth_1.isAdmin, adminController_1.toggleUserStatus);
// Error handling
app.use((err, _req, res, _next) => {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Internal server error" });
});
app.listen(port, "0.0.0.0", () => {
    console.log(`Backend listening on port ${port}`);
    console.log(`Health check: http://localhost:${port}/api/health`);
});
exports.default = app;
//# sourceMappingURL=index.js.map