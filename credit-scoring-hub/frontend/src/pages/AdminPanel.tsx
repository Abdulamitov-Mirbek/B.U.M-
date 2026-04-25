import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { PageLayout } from "../components/PageLayout";

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: { applications: number };
}

interface Application {
  id: string;
  userId: string;
  loanAmount: number;
  result: string;
  riskLevel: string;
  probability: number;
  status: string;
  createdAt: string;
  user: { username: string; email: string };
}

const text = {
  en: {
    dashboard: "Dashboard",
    categories: "Categories",
    logout: "Logout",
    loading: "Loading admin panel...",
    totalUsers: "Total Users",
    totalApplications: "Total Applications",
    approvalRate: "Approval Rate",
    pendingReviews: "Pending Reviews",
    applications: "Applications",
    users: "Users",
    date: "Date",
    user: "User",
    amount: "Amount",
    probability: "Probability",
    risk: "Risk",
    result: "Result",
    status: "Status",
    actions: "Actions",
    username: "Username",
    email: "Email",
    fullName: "Full Name",
    role: "Role",
    userApplications: "Applications",
    active: "Active",
    blocked: "Blocked",
    block: "Block",
    activate: "Activate",
    approve: "Approve",
    reject: "Reject",
    statuses: {
      approved: "Approved",
      rejected: "Rejected",
      low: "Low",
      medium: "Medium",
      high: "High",
      PENDING: "Pending",
      APPROVED: "Approved",
      REJECTED: "Rejected",
    },
  },
  ru: {
    dashboard: "Дашборд",
    categories: "Категории",
    logout: "Выйти",
    loading: "Загрузка админ-панели...",
    totalUsers: "Всего пользователей",
    totalApplications: "Всего заявок",
    approvalRate: "Уровень одобрения",
    pendingReviews: "Ожидают проверки",
    applications: "Заявки",
    users: "Пользователи",
    date: "Дата",
    user: "Пользователь",
    amount: "Сумма",
    probability: "Вероятность",
    risk: "Риск",
    result: "Решение",
    status: "Статус",
    actions: "Действия",
    username: "Логин",
    email: "Email",
    fullName: "Полное имя",
    role: "Роль",
    userApplications: "Заявки",
    active: "Активен",
    blocked: "Заблокирован",
    block: "Блок",
    activate: "Активировать",
    approve: "Одобрить",
    reject: "Отклонить",
    statuses: {
      approved: "Одобрено",
      rejected: "Отклонено",
      low: "Низкий",
      medium: "Средний",
      high: "Высокий",
      PENDING: "В ожидании",
      APPROVED: "Одобрено",
      REJECTED: "Отклонено",
    },
  },
  ky: {
    dashboard: "Дашборд",
    categories: "Категориялар",
    logout: "Чыгуу",
    loading: "Админ панели жүктөлүүдө...",
    totalUsers: "Бардык колдонуучулар",
    totalApplications: "Бардык өтүнмөлөр",
    approvalRate: "Бекитүү деңгээли",
    pendingReviews: "Текшерүүнү күтүүдө",
    applications: "Өтүнмөлөр",
    users: "Колдонуучулар",
    date: "Дата",
    user: "Колдонуучу",
    amount: "Сумма",
    probability: "Ыктымалдуулук",
    risk: "Тобокелдик",
    result: "Чечим",
    status: "Статус",
    actions: "Аракеттер",
    username: "Логин",
    email: "Email",
    fullName: "Толук аты-жөнү",
    role: "Роль",
    userApplications: "Өтүнмөлөр",
    active: "Активдүү",
    blocked: "Бөгөттөлгөн",
    block: "Бөгөттөө",
    activate: "Активдештирүү",
    approve: "Бекитүү",
    reject: "Четке кагуу",
    statuses: {
      approved: "Бекитилди",
      rejected: "Четке кагылды",
      low: "Төмөн",
      medium: "Орточо",
      high: "Жогорку",
      PENDING: "Күтүүдө",
      APPROVED: "Бекитилди",
      REJECTED: "Четке кагылды",
    },
  },
} as const;

export const AdminPanel: React.FC = () => {
  const { logout } = useAuth();
  const { language } = useLanguage();
  const t = text[language];
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"users" | "applications">(
    "applications",
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, appsRes, statsRes] = await Promise.all([
          axios.get("http://localhost:8080/api/admin/users"),
          axios.get("http://localhost:8080/api/admin/applications"),
          axios.get("http://localhost:8080/api/admin/stats"),
        ]);
        setUsers(usersRes.data.users);
        setApplications(appsRes.data.applications);
        setStats(statsRes.data.stats);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const toggleUserStatus = async (userId: string) => {
    try {
      await axios.patch(
        `http://localhost:8080/api/admin/users/${userId}/toggle`,
      );
      const refreshed = await axios.get(
        "http://localhost:8080/api/admin/users",
      );
      setUsers(refreshed.data.users);
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    status: string,
  ) => {
    try {
      await axios.put(
        `http://localhost:8080/api/admin/applications/${applicationId}`,
        {
          status,
          adminNotes: `Updated by admin to ${status}`,
        },
      );
      const refreshed = await axios.get(
        "http://localhost:8080/api/admin/applications",
      );
      setApplications(refreshed.data.applications);
    } catch (error) {
      console.error("Error updating application:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="text-xl text-white">{t.loading}</div>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8">
              <Link
                to="/"
                className="bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-xl font-bold text-transparent"
              >
                CredoBank Admin
              </Link>
              <Link
                to="/dashboard"
                className="text-slate-300 transition hover:text-white"
              >
                {t.dashboard}
              </Link>
              <Link
                to="/categories"
                className="text-slate-300 transition hover:text-white"
              >
                {t.categories}
              </Link>
            </div>
            <button
              onClick={logout}
              className="rounded-xl bg-red-500/20 px-4 py-2 text-red-300 transition hover:bg-red-500/30"
            >
              {t.logout}
            </button>
          </div>
        </nav>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {stats ? (
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
                <p className="text-sm text-slate-400">{t.totalUsers}</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
                <p className="text-sm text-slate-400">{t.totalApplications}</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {stats.totalApplications}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
                <p className="text-sm text-slate-400">{t.approvalRate}</p>
                <p className="mt-2 text-3xl font-bold text-emerald-400">
                  {stats.approvalRate.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
                <p className="text-sm text-slate-400">{t.pendingReviews}</p>
                <p className="mt-2 text-3xl font-bold text-amber-400">
                  {stats.pendingApplications}
                </p>
              </div>
            </div>
          ) : null}

          <div className="mb-6 flex gap-4 border-b border-white/10">
            <button
              onClick={() => setActiveTab("applications")}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === "applications"
                  ? "border-b-2 border-indigo-400 text-indigo-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              {t.applications} ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === "users"
                  ? "border-b-2 border-indigo-400 text-indigo-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              {t.users} ({users.length})
            </button>
          </div>

          {activeTab === "applications" ? (
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-left text-slate-400">
                    <th className="pb-3">{t.date}</th>
                    <th className="pb-3">{t.user}</th>
                    <th className="pb-3">{t.amount}</th>
                    <th className="pb-3">{t.probability}</th>
                    <th className="pb-3">{t.risk}</th>
                    <th className="pb-3">{t.result}</th>
                    <th className="pb-3">{t.status}</th>
                    <th className="pb-3">{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className="border-b border-white/5">
                      <td className="py-3 text-sm text-slate-300">
                        {new Date(app.createdAt).toLocaleDateString(
                          language === "ru"
                            ? "ru-RU"
                            : language === "ky"
                            ? "ky-KG"
                            : "en-US",
                        )}
                      </td>
                      <td className="py-3 text-white">{app.user.username}</td>
                      <td className="py-3 text-white">
                        ${app.loanAmount.toLocaleString()}
                      </td>
                      <td className="py-3 text-white">
                        {(app.probability * 100).toFixed(1)}%
                      </td>
                      <td className="py-3">
                        <span className="rounded-full bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-200">
                          {t.statuses[app.riskLevel as keyof typeof t.statuses] ||
                            app.riskLevel}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`font-semibold ${
                            app.result === "approved"
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {t.statuses[app.result as keyof typeof t.statuses] ||
                            app.result}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="rounded-full bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-200">
                          {t.statuses[app.status as keyof typeof t.statuses] ||
                            app.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {app.status === "PENDING" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                updateApplicationStatus(app.id, "APPROVED")
                              }
                              className="rounded-lg bg-emerald-500/20 px-3 py-1 text-sm text-emerald-400 hover:bg-emerald-500/30"
                            >
                              {t.approve}
                            </button>
                            <button
                              onClick={() =>
                                updateApplicationStatus(app.id, "REJECTED")
                              }
                              className="rounded-lg bg-rose-500/20 px-3 py-1 text-sm text-rose-400 hover:bg-rose-500/30"
                            >
                              {t.reject}
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-left text-slate-400">
                    <th className="pb-3">{t.username}</th>
                    <th className="pb-3">{t.email}</th>
                    <th className="pb-3">{t.fullName}</th>
                    <th className="pb-3">{t.role}</th>
                    <th className="pb-3">{t.userApplications}</th>
                    <th className="pb-3">{t.status}</th>
                    <th className="pb-3">{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5">
                      <td className="py-3 text-white">{user.username}</td>
                      <td className="py-3 text-slate-300">{user.email}</td>
                      <td className="py-3 text-white">
                        {user.fullName || "-"}
                      </td>
                      <td className="py-3 text-white">{user.role}</td>
                      <td className="py-3 text-white">
                        {user._count.applications}
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            user.isActive
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {user.isActive ? t.active : t.blocked}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`rounded-lg px-3 py-1 text-sm ${
                            user.isActive
                              ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                              : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                          }`}
                        >
                          {user.isActive ? t.block : t.activate}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
