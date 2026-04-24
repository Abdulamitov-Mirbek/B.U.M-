import "dotenv/config";
import cors from "cors";
import express from "express";
import {
  getApplicationById,
  getHistory,
  scoreCredit,
} from "./controllers/scoreController";

const app = express();
const port = Number(process.env.PORT) || 8080; // Fixed: Removed space

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Vite default port
    credentials: true,
  }),
);

app.use(express.json());

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.post("/api/score", scoreCredit);
app.get("/api/history", getHistory);
app.get("/api/applications/:id", getApplicationById);

// Error handling middleware
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
