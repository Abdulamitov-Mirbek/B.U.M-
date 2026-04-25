import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { PageLayout } from "../components/PageLayout";

interface Application {
  id: string;
  loanAmount: number;
  result: string;
  riskLevel: string;
  probability: number;
  recommendedAmount: number;
  createdAt: string;
}

const API_URL = "http://localhost:8080/api";

const text = {
  en: {
    categories: "Categories",
    dashboard: "Dashboard",
    admin: "Admin Panel",
    logout: "Logout",
    welcome: "Welcome",
    title: "Analytics overview",
    subtitle:
      "This page shows scoring analytics and portfolio signals. Recent applications are visible only in the admin panel.",
    totalApplications: "Total Applications",
    approvalRate: "Approval Rate",
    averageProbability: "Average Probability",
    averageRecommendation: "Average Recommendation",
    trend: "Trend",
    trendTitle: "Scoring probability trend",
    riskMix: "Risk Mix",
    riskTitle: "Risk distribution",
    loading: "Loading analytics...",
    error: "Failed to load analytics.",
  },
  ru: {
    categories: "Категории",
    dashboard: "Дашборд",
    admin: "Админ панель",
    logout: "Выйти",
    welcome: "Добро пожаловать",
    title: "Обзор аналитики",
    subtitle:
      "Эта страница показывает скоринговую аналитику и общие сигналы по портфелю. Последние заявки видны только в админ-панели.",
    totalApplications: "Всего заявок",
    approvalRate: "Уровень одобрения",
    averageProbability: "Средняя вероятность",
    averageRecommendation: "Средняя рекомендация",
    trend: "Тренд",
    trendTitle: "Динамика вероятности",
    riskMix: "Риск-профиль",
    riskTitle: "Распределение рисков",
    loading: "Загрузка аналитики...",
    error: "Не удалось загрузить аналитику.",
  },
  ky: {
    categories: "Категориялар",
    dashboard: "Дашборд",
    admin: "Админ панели",
    logout: "Чыгуу",
    welcome: "Кош келиңиз",
    title: "Аналитикага сереп салуу",
    subtitle:
      "Бул баракчада скорингдик аналитика жана портфель сигналдары көрсөтүлгөн. Акыркы өтүнмөлөр админ панелинде гана көрүнөт.",
    totalApplications: "Бардык өтүнмөлөр",
    approvalRate: "Бекитүү деңгээли",
    averageProbability: "Орточо ыктымалдуулук",
    averageRecommendation: "Орточо сунуш",
    trend: "Тренд",
    trendTitle: "Ыктымалдуулуктун динамикасы",
    riskMix: "Тобокелдик профили",
    riskTitle: "Тобокелдиктерди бөлүштүрүү",
    loading: "Аналитика жүктөлүүдө...",
    error: "Аналитиканы жүктөө ишке ашкан жок.",
  },
} as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export const Dashboard: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { language } = useLanguage();
  const t = text[language];
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/history`);
        setApplications(response.data);
      } catch (fetchError) {
        console.error("Error fetching dashboard data:", fetchError);
        setError(t.error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [t.error]);

  const stats = useMemo(() => {
    if (applications.length === 0) {
      return {
        totalApplications: 0,
        approvalRate: 0,
        averageProbability: 0,
        averageRecommendation: 0,
        lowRiskCount: 0,
        mediumRiskCount: 0,
        highRiskCount: 0,
      };
    }

    const approved = applications.filter(
      (item) => item.result === "approved",
    ).length;
    const totalProbability = applications.reduce(
      (sum, item) => sum + item.probability,
      0,
    );
    const totalRecommendation = applications.reduce(
      (sum, item) => sum + item.recommendedAmount,
      0,
    );
    const lowRiskCount = applications.filter(
      (item) => item.riskLevel === "low",
    ).length;
    const mediumRiskCount = applications.filter(
      (item) => item.riskLevel === "medium",
    ).length;
    const highRiskCount = applications.filter(
      (item) => item.riskLevel === "high",
    ).length;

    return {
      totalApplications: applications.length,
      approvalRate: (approved / applications.length) * 100,
      averageProbability: (totalProbability / applications.length) * 100,
      averageRecommendation: totalRecommendation / applications.length,
      lowRiskCount,
      mediumRiskCount,
      highRiskCount,
    };
  }, [applications]);

  const trendData = useMemo(
    () =>
      [...applications]
        .slice(0, 8)
        .reverse()
        .map((item, index) => ({
          name: `${index + 1}`,
          probability: Number((item.probability * 100).toFixed(1)),
        })),
    [applications],
  );

  const riskData = useMemo(
    () => [
      {
        name:
          language === "ru" ? "Низкий" : language === "ky" ? "Төмөн" : "Low",
        value: stats.lowRiskCount,
      },
      {
        name:
          language === "ru"
            ? "Средний"
            : language === "ky"
              ? "Орточо"
              : "Medium",
        value: stats.mediumRiskCount,
      },
      {
        name:
          language === "ru" ? "Высокий" : language === "ky" ? "Жогорку" : "High",
        value: stats.highRiskCount,
      },
    ],
    [language, stats],
  );

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
        <nav className="border-b border-white/10 bg-white/5 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8">
              <h1 className="bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-xl font-bold text-transparent">
                CredoBank
              </h1>
              <Link
                to="/categories"
                className="text-slate-300 transition hover:text-white"
              >
                {t.categories}
              </Link>
              {isAdmin ? (
                <Link
                  to="/admin"
                  className="text-slate-300 transition hover:text-white"
                >
                  {t.admin}
                </Link>
              ) : null}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-300">
                {t.welcome}, {user?.fullName || user?.username}
              </span>
              <button
                onClick={logout}
                className="rounded-xl bg-red-500/20 px-4 py-2 text-red-300 transition hover:bg-red-500/30"
              >
                {t.logout}
              </button>
            </div>
          </div>
        </nav>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">
              {t.dashboard}
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">{t.title}</h2>
            <p className="mt-3 max-w-3xl text-slate-300">{t.subtitle}</p>
            {error ? (
              <p className="mt-4 text-sm text-rose-400">{error}</p>
            ) : null}
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
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
              <p className="text-sm text-slate-400">{t.averageProbability}</p>
              <p className="mt-2 text-3xl font-bold text-indigo-300">
                {stats.averageProbability.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
              <p className="text-sm text-slate-400">
                {t.averageRecommendation}
              </p>
              <p className="mt-2 text-3xl font-bold text-amber-300">
                {formatCurrency(stats.averageRecommendation)}
              </p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-4">
                <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">
                  {t.trend}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {t.trendTitle}
                </h3>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient
                        id="dashboardTrend"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#818cf8"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="#818cf8"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "10px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="probability"
                      stroke="#818cf8"
                      strokeWidth={2}
                      fill="url(#dashboardTrend)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-4">
                <p className="text-sm uppercase tracking-[0.3em] text-amber-300">
                  {t.riskMix}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {t.riskTitle}
                </h3>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskData}>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "10px",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[10, 10, 0, 0]}
                      fill="#f59e0b"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
