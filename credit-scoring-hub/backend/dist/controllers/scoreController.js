"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApplicationById = exports.getHistory = exports.scoreCredit = void 0;
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const prisma = new client_1.PrismaClient();
const mlServiceUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";
const normalizePayload = (body) => ({
    user_id: String(body.user_id ?? "").trim(),
    age: Number(body.age),
    monthly_income: Number(body.monthly_income),
    loan_amount: Number(body.loan_amount),
    loan_term_months: Number(body.loan_term_months),
    credit_history_years: Number(body.credit_history_years),
    current_debt: Number(body.current_debt),
    employment_years: Number(body.employment_years),
    dependents: Number(body.dependents)
});
const isValidPayload = (payload) => Boolean(payload.user_id) &&
    Object.entries(payload)
        .filter(([key]) => key !== "user_id")
        .every(([, value]) => Number.isFinite(value));
const scoreCredit = async (req, res) => {
    try {
        const payload = normalizePayload(req.body);
        if (!isValidPayload(payload)) {
            return res.status(400).json({ message: "Invalid application payload" });
        }
        const { data } = await axios_1.default.post(`${mlServiceUrl}/predict`, payload);
        const saved = await prisma.application.create({
            data: {
                userId: payload.user_id,
                age: payload.age,
                monthlyIncome: payload.monthly_income,
                loanAmount: payload.loan_amount,
                loanTermMonths: payload.loan_term_months,
                creditHistoryYears: payload.credit_history_years,
                currentDebt: payload.current_debt,
                employmentYears: payload.employment_years,
                dependents: payload.dependents,
                result: data.result,
                probability: data.probability,
                score: data.score,
                riskLevel: data.riskLevel,
                recommendedAmount: data.recommendedAmount
            }
        });
        res.json({
            ...data,
            applicationId: saved.id
        });
    }
    catch (error) {
        console.error("Failed to score credit request:", error);
        res.status(500).json({ message: "Unable to process credit score request" });
    }
};
exports.scoreCredit = scoreCredit;
const getHistory = async (_req, res) => {
    try {
        const items = await prisma.application.findMany({
            orderBy: { createdAt: "desc" },
            take: 20
        });
        res.json(items);
    }
    catch (error) {
        console.error("Failed to fetch history:", error);
        res.status(500).json({ message: "Unable to fetch history" });
    }
};
exports.getHistory = getHistory;
const getApplicationById = async (req, res) => {
    try {
        const item = await prisma.application.findUnique({
            where: { id: req.params.id }
        });
        if (!item) {
            return res.status(404).json({ message: "Application not found" });
        }
        res.json(item);
    }
    catch (error) {
        console.error("Failed to fetch application:", error);
        res.status(500).json({ message: "Unable to fetch application" });
    }
};
exports.getApplicationById = getApplicationById;
