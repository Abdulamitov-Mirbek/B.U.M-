import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { Response } from "express";
import { AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const mlServiceUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";

type ApplicationPayload = {
  user_id: string;
  age: number;
  monthly_income: number;
  loan_amount: number;
  loan_term_months: number;
  credit_history_years: number;
  current_debt: number;
  employment_years: number;
  dependents: number;
};

const normalizePayload = (body: Record<string, unknown>): ApplicationPayload => ({
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

const isValidPayload = (payload: ApplicationPayload) =>
  Boolean(payload.user_id) &&
  Object.entries(payload)
    .filter(([key]) => key !== "user_id")
    .every(([, value]) => Number.isFinite(value));

const ensureApplicationUser = async (userId: string) => {
  const existing = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (existing) {
    return existing;
  }

  const guestEmail = `${userId}@guest.local`;
  const guestUsername = `guest_${userId}`.slice(0, 50);

  const userByEmail = await prisma.user.findUnique({
    where: { email: guestEmail }
  });

  if (userByEmail) {
    return userByEmail;
  }

  return prisma.user.create({
    data: {
      id: userId,
      email: guestEmail,
      username: guestUsername,
      passwordHash: "guest-account",
      fullName: `Guest ${userId}`,
      role: "USER"
    }
  });
};

export const scoreCredit = async (req: AuthRequest, res: Response) => {
  try {
    const payload = normalizePayload(req.body as Record<string, unknown>);
    if (!isValidPayload(payload)) {
      return res.status(400).json({ message: "Invalid application payload" });
    }

    const effectiveUserId = req.user?.userId || payload.user_id;
    await ensureApplicationUser(effectiveUserId);

    const { user_id: _ignoredUserId, ...mlPayload } = payload;
    const { data } = await axios.post(`${mlServiceUrl}/predict`, {
      ...mlPayload,
      user_id: effectiveUserId
    });

    const saved = await prisma.application.create({
      data: {
        userId: effectiveUserId,
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
      userId: effectiveUserId,
      applicationId: saved.id
    });
  } catch (error) {
    console.error("Failed to score credit request:", error);
    res.status(500).json({ message: "Unable to process credit score request" });
  }
};

export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.application.findMany({
      where: req.user?.userId
        ? req.user.role === "ADMIN"
          ? undefined
          : { userId: req.user.userId }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: 20
    });
    res.json(items);
  } catch (error) {
    console.error("Failed to fetch history:", error);
    res.status(500).json({ message: "Unable to fetch history" });
  }
};

export const getApplicationById = async (req: AuthRequest, res: Response) => {
  try {
    const applicationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!applicationId) {
      return res.status(400).json({ message: "Application id is required" });
    }

    const item = await prisma.application.findUnique({
      where: { id: applicationId }
    });

    if (!item) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (req.user?.userId && req.user.role !== "ADMIN" && item.userId !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(item);
  } catch (error) {
    console.error("Failed to fetch application:", error);
    res.status(500).json({ message: "Unable to fetch application" });
  }
};
