import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          username: true,
          fullName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);

    res.json({
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllApplications = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const where = status ? { status: status as any } : {};

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, username: true, email: true, fullName: true },
          },
        },
        where,
        orderBy: { createdAt: "desc" },
      }),
      prisma.application.count({ where }),
    ]);

    res.json({
      applications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get all applications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateApplicationStatus = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const application = await prisma.application.update({
      where: { id: id as string },
      data: {
        status,
        adminNotes,
        reviewedBy: req.user?.userId,
        reviewedAt: new Date(),
      },
      include: { user: { select: { email: true, username: true } } },
    });

    res.json({ message: "Application updated successfully", application });
  } catch (error) {
    console.error("Update application error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserApplications = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Fix: Ensure userId is a string
    const applications = await prisma.application.findMany({
      where: { userId: userId as string },
      orderBy: { createdAt: "desc" },
    });

    res.json(applications);
  } catch (error) {
    console.error("Get user applications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Fix: Ensure userId is a string
    const user = await prisma.user.findUnique({
      where: { id: userId as string },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updated = await prisma.user.update({
      where: { id: userId as string },
      data: { isActive: !user.isActive },
      select: { id: true, isActive: true, username: true, email: true },
    });

    res.json({
      message: `User ${updated.isActive ? "activated" : "deactivated"}`,
      user: updated,
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalApplications, approvedApps, pendingApps, avgScore] =
      await Promise.all([
        prisma.user.count(),
        prisma.application.count(),
        prisma.application.count({ where: { result: "approved" } }),
        prisma.application.count({ where: { status: "PENDING" } }),
        prisma.application.aggregate({ _avg: { probability: true } }),
      ]);

    const recentApplications = await prisma.application.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { username: true, email: true } } },
    });

    res.json({
      stats: {
        totalUsers,
        totalApplications,
        approvedApplications: approvedApps,
        pendingApplications: pendingApps,
        averageProbability: avgScore._avg.probability || 0,
        approvalRate:
          totalApplications > 0 ? (approvedApps / totalApplications) * 100 : 0,
      },
      recentApplications,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
