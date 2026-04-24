"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const scoreController_1 = require("./controllers/scoreController");
const app = (0, express_1.default)();
const port = Number(process.env.PORT || 8080);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.post("/api/score", scoreController_1.scoreCredit);
app.get("/api/history", scoreController_1.getHistory);
app.get("/api/applications/:id", scoreController_1.getApplicationById);
app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
});
