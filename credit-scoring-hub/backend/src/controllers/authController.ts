import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "credobank-super-secret-key-2024";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password, fullName, phone } = req.body;

    console.log("Registration attempt:", { email, username });

    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ error: "Email, username and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        fullName,
        phone,
        role: "USER",
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({ message: "Registration successful", token, user });
  } catch (error: any) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({
        error: "Internal server error",
        details: error?.message || "Unknown error",
      });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt:", { email });

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    const { passwordHash, ...userWithoutPassword } = user;

    res.json({ message: "Login successful", token, user: userWithoutPassword });
  } catch (error: any) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({
        error: "Internal server error",
        details: error?.message || "Unknown error",
      });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error: any) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createAdminUser = async (req: Request, res: Response) => {
  try {
    const { email, username, password, fullName, secretKey } = req.body;

    const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || "CredoBankAdmin2024!";

    if (secretKey !== ADMIN_SECRET) {
      return res.status(403).json({ error: "Invalid secret key" });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, username, passwordHash, fullName, role: "ADMIN" },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
      },
    });

    res.status(201).json({ message: "Admin user created successfully", user });
  } catch (error: any) {
    console.error("Create admin error:", error);
    res
      .status(500)
      .json({
        error: "Internal server error",
        details: error?.message || "Unknown error",
      });
  }
};
